=== XC Scribe ===
Contributors: thextracode
Tags: ai, content generation, woocommerce, blog, product descriptions
Requires at least: 6.0
Tested up to: 6.9
Requires PHP: 7.4
Stable tag: 1.0.0
License: GPLv2 or later
License URI: https://www.gnu.org/licenses/gpl-2.0.html

AI-powered content generation for WordPress. Generate product descriptions and blog posts with one click.

== Description ==

XC Scribe is an AI-powered content generation plugin for WordPress. It helps you create high-quality product descriptions and blog posts in seconds.

**Product Descriptions (WooCommerce)**

Generate optimized product descriptions directly from the WooCommerce product editor. XC Scribe reads your product title, category, attributes, and images to create accurate, compelling descriptions.

* One-click generation from the product edit screen
* Supports multiple languages and tones
* Custom instructions for brand-specific output
* Content is inserted into the editor — review before saving

**Blog Post Drafts**

Generate full blog post drafts from a topic. XC Scribe creates a complete draft post that you can review and edit before publishing.

* Enter a topic and generate a draft
* Optionally tie posts to a product or category
* Multiple language and tone options
* Creates a WordPress draft — nothing is published automatically

**How It Works**

1. Install and activate the plugin
2. Enter your XC Scribe API key in the settings
3. Generate content from the XC Scribe dashboard or the WooCommerce product editor

An XC Scribe account and API key are required. Visit [xcscribe.com](https://xcscribe.com/) to create an account. A free tier is available.

**External Service**

This plugin connects to the [XC Scribe API](https://xcscribe.com/) to generate content. When you use the plugin, your product data (title, category, attributes, image URLs) or blog topic is sent to the XC Scribe API for processing. No data is sent without your explicit action (clicking a generate button).

* Service: [xcscribe.com](https://xcscribe.com/)
* Terms of Service: [xcscribe.com/terms](https://xcscribe.com/terms)
* Privacy Policy: [xcscribe.com/privacy](https://xcscribe.com/privacy)

**Development**

The source code for the admin JavaScript is available at [github.com/thextracode/xc-scribe-wp](https://github.com/thextracode/xc-scribe-wp).

== Installation ==

1. Upload the `xc-scribe` folder to `/wp-content/plugins/`
2. Activate the plugin through the Plugins menu
3. Go to **XC Scribe** in the admin menu
4. Enter your API key and click **Save**
5. Click **Test connection** to verify

== Frequently Asked Questions ==

= Do I need a WooCommerce store? =

No. Blog post generation works on any WordPress site. Product description generation requires WooCommerce.

= Is an API key required? =

Yes. You need an XC Scribe account and API key. Visit [xcscribe.com](https://xcscribe.com/) to sign up. A free tier is available.

= Does it publish content automatically? =

No. All generated content is presented for your review. Product descriptions are inserted into the editor (not saved), and blog posts are created as drafts.

= What languages are supported? =

XC Scribe supports content generation in multiple languages including English, Serbian, German, French, Spanish, and more.

== Screenshots ==

1. XC Scribe dashboard with settings, blog generator, and recent activity.
2. Product description generation from the WooCommerce product editor.

== Changelog ==

= 1.0.0 =
* Initial release
* AI-powered product description generation (WooCommerce)
* Blog post draft generation
* Multi-language and tone support
* Activity log for recent generations

== Upgrade Notice ==

= 1.0.0 =
Initial release.
