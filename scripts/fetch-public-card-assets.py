#!/usr/bin/env python3
"""Fetch public-domain card images used by the interactive draw page.

Sources:
- Rider–Waite–Smith (Pam-A scans), Wikimedia Commons category:
  https://commons.wikimedia.org/wiki/Category:Rider-Waite-Smith_tarot_deck_(TaionWC)
- B. Dondorf Mlle. Lenormand (19th c.), British Museum / Wikimedia Commons.
  The 36 web-restored cards are bundled with V10.3 from the public-domain mechanical scans. The historical artwork is unchanged; only non-generative crop/presentation cleanup is applied.

The deployment script runs this before Docker build. Existing verified-looking files are kept.
"""
from __future__ import annotations

import os
from pathlib import Path
import sys
import time
import random
from urllib.parse import quote
import hashlib
from urllib.request import Request, urlopen
from urllib.error import HTTPError

ROOT = Path(__file__).resolve().parents[1]
RWS_DIR = ROOT / "public" / "tarot" / "rws"
LENORMAND_DIR = ROOT / "public" / "tarot" / "lenormand" / "dondorf-v104"
USER_AGENT = "bubu-tarot/1.1 (+https://bubu-tarot.com; public-domain asset fetch; contact via site)"
REQUEST_DELAY_SECONDS = 3.6
MAX_RETRIES = 7

RWS_FILES = [
    *(f"Cups{i:02d}.jpg" for i in range(1, 15)),
    *(f"Pents{i:02d}.jpg" for i in range(1, 15)),
    "RWS Tarot 00 Fool.jpg", "RWS Tarot 01 Magician.jpg", "RWS Tarot 02 High Priestess.jpg", "RWS Tarot 03 Empress.jpg",
    "RWS Tarot 04 Emperor.jpg", "RWS Tarot 05 Hierophant.jpg", "RWS Tarot 06 Lovers.jpg", "RWS Tarot 07 Chariot.jpg",
    "RWS Tarot 08 Strength.jpg", "RWS Tarot 09 Hermit.jpg", "RWS Tarot 10 Wheel of Fortune.jpg", "RWS Tarot 11 Justice.jpg",
    "RWS Tarot 12 Hanged Man.jpg", "RWS Tarot 13 Death.jpg", "RWS Tarot 14 Temperance.jpg", "RWS Tarot 15 Devil.jpg",
    "RWS Tarot 16 Tower.jpg", "RWS Tarot 17 Star.jpg", "RWS Tarot 18 Moon.jpg", "RWS Tarot 19 Sun.jpg",
    "RWS Tarot 20 Judgement.jpg", "RWS Tarot 21 World.jpg",
    *(f"Swords{i:02d}.jpg" for i in range(1, 15)),
    *(f"Wands{i:02d}.jpg" for i in range(1, 15)),
]

if len(RWS_FILES) != 78:
    raise SystemExit(f"Internal error: expected 78 RWS filenames, got {len(RWS_FILES)}")


def looks_like_image(path: Path, kind: str) -> bool:
    try:
        if path.stat().st_size < 8_000:
            return False
        head = path.read_bytes()[:12]
        if kind == "jpg":
            return head[:2] == b"\xff\xd8"
        if kind == "png":
            return head[:8] == b"\x89PNG\r\n\x1a\n"
        return False
    except OSError:
        return False


def fetch(url: str, destination: Path, kind: str, attempts: int = MAX_RETRIES) -> None:
    if looks_like_image(destination, kind):
        return
    destination.parent.mkdir(parents=True, exist_ok=True)
    tmp = destination.with_suffix(destination.suffix + ".download")

    for attempt in range(1, attempts + 1):
        try:
            request = Request(
                url,
                headers={
                    "User-Agent": USER_AGENT,
                    "Accept": "image/*",
                    "Referer": "https://commons.wikimedia.org/",
                },
            )
            with urlopen(request, timeout=45) as response:
                data = response.read()
            tmp.write_bytes(data)
            if not looks_like_image(tmp, kind):
                raise RuntimeError(f"downloaded content is not a valid {kind} image ({len(data)} bytes)")
            os.replace(tmp, destination)
            # Be deliberately polite to Wikimedia. The previous V9 downloader
            # made successful requests back-to-back and could trigger HTTP 429.
            time.sleep(REQUEST_DELAY_SECONDS + random.uniform(0.15, 0.75))
            return
        except HTTPError as exc:
            try:
                tmp.unlink()
            except FileNotFoundError:
                pass

            if exc.code == 429 and attempt < attempts:
                retry_after = exc.headers.get("Retry-After") if exc.headers else None
                try:
                    wait = float(retry_after) if retry_after else 20.0 * (2 ** (attempt - 1))
                except (TypeError, ValueError):
                    wait = 20.0 * (2 ** (attempt - 1))
                wait = min(wait, 180.0) + random.uniform(1.0, 4.0)
                print(f"    Wikimedia rate limit (429). Waiting {wait:.0f}s before retry {attempt + 1}/{attempts}...", flush=True)
                time.sleep(wait)
                continue

            if attempt == attempts:
                raise RuntimeError(f"failed to fetch {url}: HTTP {exc.code} {exc.reason}") from exc
            wait = min(6.0 * attempt, 30.0) + random.uniform(0.5, 2.0)
            print(f"    HTTP {exc.code}; retrying in {wait:.0f}s ({attempt + 1}/{attempts})...", flush=True)
            time.sleep(wait)
        except Exception as exc:
            try:
                tmp.unlink()
            except FileNotFoundError:
                pass
            if attempt == attempts:
                raise RuntimeError(f"failed to fetch {url}: {exc}") from exc
            wait = min(4.0 * attempt, 20.0) + random.uniform(0.5, 1.5)
            print(f"    Temporary download error: {exc}. Retrying in {wait:.0f}s ({attempt + 1}/{attempts})...", flush=True)
            time.sleep(wait)


def commons_thumb(filename: str, width: int) -> str:
    # Wikimedia Commons stores files by the MD5 of the normalized filename.
    # Building the thumbnail URL directly avoids an extra HTML redirect request.
    normalized = filename.replace(" ", "_")
    digest = hashlib.md5(normalized.encode("utf-8")).hexdigest()
    encoded = quote(normalized, safe="_.-")
    return f"https://upload.wikimedia.org/wikipedia/commons/thumb/{digest[0]}/{digest[:2]}/{encoded}/{width}px-{encoded}"


def main() -> int:
    print("Checking public-domain card assets...")
    RWS_DIR.mkdir(parents=True, exist_ok=True)
    LENORMAND_DIR.mkdir(parents=True, exist_ok=True)

    for index, remote_name in enumerate(RWS_FILES, start=1):
        local_name = remote_name.replace(" ", "_")
        destination = RWS_DIR / local_name
        if not looks_like_image(destination, "jpg"):
            print(f"  RWS {index:02d}/78  {remote_name}")
            fetch(commons_thumb(remote_name, 500), destination, "jpg")

    rws_ok = sum(1 for remote_name in RWS_FILES if looks_like_image(RWS_DIR / remote_name.replace(" ", "_"), "jpg"))
    lenormand_ok = sum(1 for index in range(1, 37) if looks_like_image(LENORMAND_DIR / f"{index:02d}.jpg", "jpg"))
    if rws_ok != 78 or lenormand_ok != 36:
        raise RuntimeError(f"asset verification failed: RWS {rws_ok}/78, Lenormand {lenormand_ok}/36")

    print("Card assets ready: RWS 78/78; B. Dondorf Lenormand V10.4 36/36.")
    return 0


if __name__ == "__main__":
    try:
        raise SystemExit(main())
    except Exception as exc:
        print(f"Error: {exc}", file=sys.stderr)
        print("The current website has not been rebuilt or restarted. Fix network access and run the update again.", file=sys.stderr)
        raise SystemExit(1)
