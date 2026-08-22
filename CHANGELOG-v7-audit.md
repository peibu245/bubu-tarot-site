# V7 checked build

This package is V7 plus a deployment audit pass.

Fixes added during audit:
- history revisions are ordered and trimmed by real modification time instead of filename;
- backup failures other than the expected first-save ENOENT now stop the publish instead of silently losing rollback protection;
- content writes use unique temporary files;
- drag/drop insertion is consistent in both directions;
- live preview reloads after publish/rollback so prices/modules are not stale;
- live preview remaps dynamically-created content such as the contact-policy modal;
- booking page now receives the public typography settings and marks its main explanatory copy accordingly;
- update script preserves a valid existing PUBLIC_ORIGIN instead of always forcing production;
- accidental TypeScript build-info file removed from the deployment package.

Additional safety hardening:
- if the main content JSON is missing/corrupt, the site first tries the newest valid content backup instead of silently showing default prices/copy;
- history only manages site-content-*.json files, so unrelated JSON files in backups are not deleted;
- update preflight validates admin password/session-secret length and PUBLIC_ORIGIN before rebuilding;
- update completion messages now report the actual preserved PUBLIC_ORIGIN.
- update preflight now reads missing `.env` keys safely and reports a clear validation error instead of exiting early under `set -e`;
- dynamic preview remapping is incremental: newly-opened modals and other inserted elements are mapped without discarding already-edited draft mappings.
