# XC Scribe — WordPress Plugin

AI-powered content generation for WordPress. The plugin creates blog drafts
and, when WooCommerce is installed, product descriptions.

## Repository layout

- `xc-scribe.php` — WordPress plugin bootstrap and REST API implementation.
- `assets/` — compiled WordPress admin assets.
- `src/` — readable React and TypeScript source for the admin UI.
- `readme.txt` — WordPress.org metadata.

This repository contains the installable plugin source and its compiled admin
assets. It is not a standalone JavaScript project.

## Requirements

- WordPress 6.0 or later; the current release is tested through WordPress 7.1.
- PHP 7.4 or later.
- WooCommerce is required only for product-description generation.

## Install

The repository root is the plugin directory: it already contains
`xc-scribe.php` and the compiled assets required by WordPress.

### Upload a ZIP

Clone the repository, then create a ZIP with the required `xc-scribe/` parent
directory:

```bash
git clone https://github.com/thextracode/xc-scribe-wp.git
cd xc-scribe-wp
git archive --format=zip --prefix=xc-scribe/ -o ../xc-scribe.zip HEAD
```

In WordPress Admin, go to **Plugins → Add New → Upload Plugin**, select
`xc-scribe.zip`, then activate it.

### Install from a checkout

Copy or clone this repository to `wp-content/plugins/xc-scribe`, then activate
**XC Scribe** from the Plugins screen. Do not copy the repository's `.git`
directory into a production WordPress installation.

## Configure and use

1. Go to **WordPress Admin → XC Scribe**.
2. Enter an API key from an XC Scribe account, save it, and run **Test
   connection**.

For blog posts, open **XC Scribe → Blog Generator**, enter a topic, and
generate a draft. For WooCommerce products, open a product editor and use the
**XC Scribe** meta box; generated copy is inserted into the editor and is not
saved automatically.

## Development

The `src/` directory is included for code review and transparency; `assets/`
contains the compiled admin UI used by WordPress. This repository intentionally
does not include Node/Vite build configuration, so do not delete or hand-edit
the compiled files unless you have the maintainer build environment.

To expose the API base URL field for local or staging use, add this to
`wp-config.php`:

```php
define('XC_SCRIBE_DEV_MODE', true);
```

Do not enable development mode in production. The production API defaults to
`https://api.xcscribe.com`.

## Troubleshooting

- **401 Invalid API key** — verify the key is active, then save it again.
- **402 Insufficient balance** — top up at
  `https://app.xcscribe.com/settings/billing`.
- **Admin UI missing or stale** — update the checkout from this repository and
  reinstall the plugin directory or ZIP.
