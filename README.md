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

## Install the ZIP

1. Build the plugin:

   ```bash
   cd content_automation
   ./plugins/wp/build.sh
   ```

2. In WordPress Admin, go to **Plugins → Add New → Upload Plugin**.
3. Select `content_automation/plugins/wp/dist/xc-scribe-wp.zip`, install it,
   then activate it.

## Configure and use

1. Go to **WordPress Admin → XC Scribe**.
2. Enter an API key from an XC Scribe account, save it, and run **Test
   connection**.

For blog posts, open **XC Scribe → Blog Generator**, enter a topic, and
generate a draft. For WooCommerce products, open a product editor and use the
**XC Scribe** meta box; generated copy is inserted into the editor and is not
saved automatically.

## Development

The build requires Node.js 22 and Yarn 1. The UI is built from the canonical
source in the main XC AI workspace and compiled into `assets/`.

```bash
cd content_automation
./plugins/wp/build.sh
```

The output is `content_automation/plugins/wp/dist/xc-scribe-wp.zip`.

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

## Release checklist

1. Confirm `XC_SCRIBE_DEV_MODE` is not enabled in the release environment.
2. Update the plugin version in `xc-scribe.php` and metadata in `readme.txt`
   when releasing a new version.
3. Run `./plugins/wp/build.sh` with Node 22 and Yarn.
4. Run the WordPress 7.1 smoke test above.
5. On a staging site, verify API-key connection testing, blog draft creation,
   WooCommerce product generation, and operation without WooCommerce.
6. Upload the generated ZIP to the release channel.

## Troubleshooting

- **401 Invalid API key** — verify the key is active, then save it again.
- **402 Insufficient balance** — top up at
  `https://app.xcscribe.com/settings/billing`.
- **Admin UI missing or stale** — rerun `./plugins/wp/build.sh`.
