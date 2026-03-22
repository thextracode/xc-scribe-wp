=== XC Scribe ===
Contributors: thextracode
Tags: ai, content, woocommerce, product descriptions, blog
Requires at least: 6.0
Tested up to: 6.9
Stable tag: 1.0.1
Requires PHP: 7.4
License: GPL-2.0-or-later
License URI: https://www.gnu.org/licenses/gpl-2.0.html

AI-powered product descriptions and blog posts for WordPress and WooCommerce.

== Description ==

XC Scribe uses AI to generate high-quality product descriptions and blog posts directly from your WordPress admin. It reads your product data — title, categories, attributes, and images — and writes ready-to-publish content in 30+ languages.

**Product Descriptions (WooCommerce)**

* Generates both long and short descriptions
* Reads product title, categories, attributes, and images for context
* Content is inserted directly into the product editor
* Works with both Classic and Block editors

**Blog Posts (any WordPress site)**

* Enter a topic and get a full draft post
* Optionally link to a product for product-focused content
* Draft is created automatically — edit and publish when ready

**Key Features**

* 30+ languages supported
* Multiple tone options (professional, casual, persuasive, etc.)
* Custom instructions for fine-tuning output
* Activity log to track generations and costs
* Works with WooCommerce product editor metabox

== Installation ==

1. Upload the `xc-scribe` folder to `/wp-content/plugins/`
2. Activate the plugin through the Plugins screen
3. Go to **XC Scribe** in the admin menu
4. Enter your API key (from your [XC Scribe account](https://app.xcscribe.com))
5. Click **Save**, then **Test connection** to verify

== Frequently Asked Questions ==

= Do I need a WooCommerce store? =

No. Blog post generation works on any WordPress site. Product description generation requires WooCommerce.

= Where do I get an API key? =

Sign up at [xcscribe.com](https://xcscribe.com) and find your API key in account settings.

= What languages are supported? =

Over 30 languages including English, German, French, Spanish, Italian, Dutch, Polish, Czech, Slovak, Hungarian, Romanian, Bulgarian, Croatian, Serbian, Slovenian, Bosnian, Montenegrin, Macedonian, Greek, Russian, Swedish, Danish, Norwegian, Finnish, Estonian, Latvian, Lithuanian, Irish, Maltese, and Portuguese.

= Is my data sent to external servers? =

Yes. Product data (title, categories, attributes, image URLs) and generation settings are sent to the XC Scribe API at api.xcscribe.com for AI processing. No customer personal data is transmitted. See the Privacy section below.

== Screenshots ==

1. Dashboard — connection status, balance, and recent activity
2. Product metabox — generate descriptions from the WooCommerce product editor
3. Blog generator — create draft posts with AI

== Build Instructions ==

The compiled file `assets/admin.js` is built from the human-readable source files included in the `src/` directory of this plugin. The source is a React + TypeScript application.

To rebuild from source:

1. Install Node.js 22+ and Yarn
2. From the repository root, run: `yarn install`
3. Build the admin assets: `npx vite build -c frontend/vite.wp-plugin.config.ts`

This compiles `src/main.tsx` and related components into `assets/admin.js` and `assets/admin.css`.

== Changelog ==

= 1.0.1 =
* Fix: Per-product permission checks — REST routes now verify `edit_post` capability for the specific product, not just the general `edit_posts` capability
* Fix: Menu position lowered from 4 to 79 (just above Settings) to avoid displacing core WordPress menu items
* Fix: Include human-readable source code for compiled `assets/admin.js` in the `src/` directory
* Fix: Added build instructions to readme.txt
* Fix: Full PHPCS + WordPress Coding Standards (WPCS) compliance — Yoda conditions, doc comments, proper escaping, no short ternaries
* Fix: Removed `$_GET` superglobal access (replaced with `get_the_ID()`)
* Fix: Bumped "Tested up to" to WordPress 6.9

= 1.0.0 =
* Initial release
* Product description generation (long + short) for WooCommerce
* Blog post draft generation
* 30+ language support
* Activity logging
* Async generation with polling

== Upgrade Notice ==

= 1.0.1 =
Addresses WordPress.org plugin review feedback. Improved security with per-product permission checks, WPCS compliance, and source code included.

= 1.0.0 =
Initial release.

== Privacy ==

XC Scribe sends the following data to the XC Scribe API (api.xcscribe.com) when generating content:

* Product title, category, attributes, and image URLs (for product descriptions)
* Blog topic and optional product reference (for blog posts)
* Selected language, tone, and custom instructions
* Your API key for authentication

No personal user data, customer data, or visitor data is collected or transmitted. All communication uses HTTPS encryption. For more details, see the [XC Scribe Privacy Policy](https://xcscribe.com/privacy).
