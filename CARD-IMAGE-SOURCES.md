# Card image sources used by V10.4

V10.4 uses historical/public-domain artwork for the interactive draw page. The production site serves local assets and does not hotlink third-party card images.

## Waite–Smith — 78 cards

- Deck: early Rider–Waite–Smith / Waite–Smith scans (“Pam-A” set)
- Illustrator: Pamela Colman Smith
- Publication: 1909/1910
- Source set: Wikimedia Commons — `Category:Rider-Waite-Smith tarot deck (TaionWC)`
- V10.4 does not alter the historical Waite–Smith faces.
- Local path: `public/tarot/rws/`

Source page:
https://commons.wikimedia.org/wiki/Category:Rider-Waite-Smith_tarot_deck_(TaionWC)

## Petit Lenormand — B. Dondorf, 36 cards

- Object family: traditional B. Dondorf Petit Lenormand / Mlle. Lenormand fortune-telling cards
- Publisher: B. Dondorf, Frankfurt
- Date: 19th century
- Technique: chromolithography
- Collection/source: British Museum registration `1896,0501.308`, mirrored by Wikimedia Commons
- The Wikimedia files identify the historical work and the mechanical scan as public-domain material.

British Museum:
https://www.britishmuseum.org/collection/object/P_1896-0501-308

Wikimedia Commons scan sheets:
https://commons.wikimedia.org/wiki/File:Print,_playing-card_(BM_1896,0501.308).jpg
https://commons.wikimedia.org/wiki/File:Print,_playing-card_(BM_1896,0501.308_1).jpg

### V10.4 website presentation

The scene artwork is not AI-redrawn. V10.4 starts from the public-domain historical card crops and uses ordinary image processing only:

1. conservatively remove the two original roundel regions from the scan with local image restoration;
2. draw two small pale-cream running-number roundels, matching the clean double-number presentation selected for the site;
3. keep the original playing-card inset and lower Dondorf illustration intact;
4. apply mild contrast/colour/sharpening and Lanczos resampling for small-screen readability;
5. export 36 unique JPEGs at 477×777.

Local path: `public/tarot/lenormand/dondorf-v104/01.jpg` … `36.jpg`

This is a site presentation/restoration of public-domain Dondorf artwork, not a claim to reproduce a specific modern commercial reprint.

## Card backs

The backs are original site UI graphics, not reproductions of historical publisher backs:

- Waite–Smith: solid muted grey-purple with a small centered five-point star and thin inner border.
- Lenormand: solid pale lavender with a small centered circle and thin inner border.

## Reserved but not visually enabled

- Marseille: selector slot only; no incomplete/mixed deck presented as finished.
- Thoth: selector slot only; Frieda Harris artwork is not displayed.
