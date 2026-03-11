# XC Scribe — WordPress Plugin

AI-powered content generation for WordPress. Product descriptions (WooCommerce) and blog posts.

## Features

- **Product Descriptions** — Generate optimized WooCommerce product descriptions from product data (title, category, attributes, images)
- **Blog Post Drafts** — Generate full blog drafts from a topic, created as WordPress drafts for review
- **Multi-language** — English, Serbian, German, French, Spanish, and more
- **Tone Control** — Professional, casual, or custom instructions

## Requirements

- WordPress 6.0+
- PHP 7.4+
- WooCommerce (optional, for product descriptions)
- XC Scribe account and API key ([xcscribe.com](https://xcscribe.com/) — free tier available)

## Install

**From WordPress.org:**

Search for "XC Scribe" in Plugins > Add New.

**From ZIP:**

1. Download the latest release
2. WordPress Admin > Plugins > Add New > Upload Plugin
3. Activate

## Configure

1. Go to **XC Scribe** in the admin sidebar
2. Enter your API key
3. Click **Save**, then **Test connection**

## Usage

**Blog drafts:** XC Scribe > Blog Generator > enter topic > Generate

**Product descriptions (WooCommerce):** Edit product > XC Scribe meta box > Generate

## Development

### Project structure

```
xc-scribe.php    # Plugin entry point, REST API routes, admin setup
assets/
  admin.js       # Bundled admin UI (built from source)
  admin.css      # Admin styles
readme.txt       # WordPress.org readme
```

### Dev mode

Add to `wp-config.php` to show the API base URL field (for local/staging API):

```php
define('XC_SCRIBE_DEV_MODE', true);
```

## External Service

This plugin connects to the [XC Scribe API](https://xcscribe.com/) to generate content. Data is only sent when you click a generate button.

- [Terms of Service](https://xcscribe.com/terms)
- [Privacy Policy](https://xcscribe.com/privacy)

## License

GPLv2 or later. See [LICENSE](https://www.gnu.org/licenses/gpl-2.0.html).
