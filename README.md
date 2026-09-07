# XC Scribe — WordPress Plugin

AI-powered content generation for WordPress. The plugin creates blog drafts
and, when WooCommerce is installed, product descriptions.

## Repository layout

- `xc-scribe.php` — WordPress plugin bootstrap and REST API implementation.
- `assets/` — compiled WordPress admin assets.
- `src/` — readable React and TypeScript source for the admin UI.
- `readme.txt` — WordPress.org metadata.

The build and smoke-test configuration are maintained in the main XC AI
workspace under `content_automation/plugins/wp`. This repository mirrors the
release-ready plugin contents for WordPress.org review.

## Requirements

- WordPress 6.0 or later; the current release is tested through WordPress 7.1.
- PHP 7.4 or later.
- WooCommerce is required only for product-description generation.
- Node.js 22 and Yarn 1 are required only when building a release ZIP.

## Install the ZIP

This repository contains the plugin source and release contents; it does not
include a prebuilt ZIP. Install the ZIP supplied with a published release. If
no ZIP release asset is available, a maintainer must build it from the main XC
AI workspace:

```bash
cd /path/to/xc-ai/content_automation
./plugins/wp/build.sh
```

The build output is `plugins/wp/dist/xc-scribe-wp.zip`. In WordPress Admin, go
to **Plugins → Add New → Upload Plugin**, select that ZIP, then activate it.

## Configure and use

1. Go to **WordPress Admin → XC Scribe**.
2. Enter an API key from an XC Scribe account, save it, and run **Test
   connection**.

For blog posts, open **XC Scribe → Blog Generator**, enter a topic, and
generate a draft. For WooCommerce products, open a product editor and use the
**XC Scribe** meta box; generated copy is inserted into the editor and is not
saved automatically.

## Build and development

The public repository is a release mirror. Do not run a build from this clone:
the canonical UI source and Vite configuration are in the main XC AI workspace.
The build writes compiled assets to
`content_automation/plugins/wp/xc-scribe/assets/` and creates the release ZIP.

```bash
cd content_automation
./plugins/wp/build.sh
```

The output is `content_automation/plugins/wp/dist/xc-scribe-wp.zip`. Before
publishing a release, synchronize the changed plugin files back into this
repository and commit them together with the release metadata.

To expose the API base URL field for local or staging use, add this to
`wp-config.php`:

```php
define('XC_SCRIBE_DEV_MODE', true);
```

Do not enable development mode in production. The production API defaults to
`https://api.xcscribe.com`.

## WordPress 7.1 smoke test

The test environment installs WordPress 7.1, WooCommerce, and XC Scribe.

```bash
cd content_automation/plugins/wp
docker compose -f docker-compose.test.yml up -d
docker compose -f docker-compose.test.yml logs --no-color wpcli
```

Success is indicated by `WordPress + WooCommerce + XC Scribe ready!` in the
`wpcli` logs. The local admin is available at `http://localhost:8089`.

To stop the test containers without deleting their test volumes:

```bash
docker compose -f docker-compose.test.yml down
```

## Release checklist

1. Confirm `XC_SCRIBE_DEV_MODE` is not enabled in the release environment.
2. Update the plugin version in `xc-scribe.php` and metadata in `readme.txt`.
3. From `content_automation`, run `./plugins/wp/build.sh` with Node 22 and
   Yarn.
4. Run the WordPress 7.1 smoke test above.
5. On a staging site, verify API-key connection testing, blog draft creation,
   WooCommerce product generation, and operation without WooCommerce.
6. Synchronize `assets/`, `src/`, `xc-scribe.php`, `uninstall.php`,
   `readme.txt`, `LICENSE`, and this README to the public repository.
7. Commit, tag, and publish the generated ZIP as a release asset.

## Troubleshooting

- **401 Invalid API key** — verify the key is active, then save it again.
- **402 Insufficient balance** — top up at
  `https://app.xcscribe.com/settings/billing`.
- **Admin UI missing or stale** — from `content_automation`, rerun
  `./plugins/wp/build.sh` and reinstall the generated ZIP.
