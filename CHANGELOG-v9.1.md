# V9.1 Wikimedia rate-limit hotfix

- Fixes V9 deployment aborting with HTTP 429 while fetching public-domain Rider–Waite–Smith images from Wikimedia Commons.
- Adds a descriptive User-Agent and Commons referer.
- Adds a deliberate 2.2s+ delay between successful image downloads.
- Adds 429-aware exponential backoff and honors `Retry-After` when provided.
- Keeps already-downloaded valid images, so interrupted deployments resume instead of starting over.
- Docker build/restart still runs only after all required card assets verify successfully.
