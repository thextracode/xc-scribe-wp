# XC Scribe — WordPress Plugin

AI-powered content generation for WordPress. Product descriptions (requires WooCommerce) and blog posts.

## Install (ZIP)

1. Build the plugin ZIP:
   ```bash
   cd content_automation && ./plugins/wp/build.sh
   ```
2. In WordPress Admin:
   - Plugins → Add New → Upload Plugin
   - Select `xc-scribe-wp.zip` and install/activate

## Configure

1. WordPress Admin → **XC Scribe**
2. Enter your **API key** (from your XC Scribe account)
3. Click **Save**
4. Click **Test connection** — confirm it shows plan tier + balance

## Usage

- **Blog drafts** (any WordPress site):
  - WordPress Admin → **XC Scribe → Blog Generator**
  - Enter a topic → **Generate draft post**
  - You'll be redirected to the draft post editor
- **Product descriptions** (requires WooCommerce):
  - Edit a WooCommerce product → find the **XC Scribe** meta box → **Generate with XC Scribe**
  - Generated content is inserted into the product description editor (does not auto-save)

## Development

### Dev mode

To show the API base URL field in settings (for pointing to a local/staging API), add to `wp-config.php`:

```php
define('XC_SCRIBE_DEV_MODE', true);
```

Production installs should **not** set this — the plugin defaults to `https://api.xcscribe.com`.

### Build

```bash
cd content_automation && ./plugins/wp/build.sh
```

Output: `plugins/wp/dist/xc-scribe-wp.zip`

## Release checklist

1. Remove or verify `XC_SCRIBE_DEV_MODE` is **not** set — API URL field must be hidden
2. Default `XC_SCRIBE_API_URL` points to `https://api.xcscribe.com`
3. Update plugin version in `xc-scribe.php`
4. Run `./plugins/wp/build.sh`
5. Install ZIP on a staging WP site and smoke test:
   - Settings: save API key + test connection
   - Blog: generate draft and verify redirect
   - Products (WooCommerce): generate description from product edit page
6. Verify plugin works on non-WooCommerce WordPress (no errors, product features hidden)
7. Publish the ZIP

## Troubleshooting

- **401 Invalid API key** — verify the key is active in your XC Scribe account, re-save
- **402 Insufficient balance** — top up at `https://app.xcscribe.com/settings/billing`
- **Admin UI not showing** — rebuild assets with `./plugins/wp/build.sh`
