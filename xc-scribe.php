<?php
/**
 * Plugin Name: XC Scribe
 * Plugin URI: https://xcscribe.com
 * Description: AI-powered content generation for WordPress — product descriptions (WooCommerce) and blog posts.
 * Version: 1.0.2
 * Requires at least: 6.0
 * Requires PHP: 7.4
 * Author: TheXtraCode
 * Author URI: https://thextracode.com
 * License: GPL-2.0-or-later
 * License URI: https://www.gnu.org/licenses/gpl-2.0.html
 * Text Domain: xc-scribe
 *
 * @package XC_Scribe
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

define( 'XC_SCRIBE_PLUGIN_SLUG', 'xc-scribe' );
define( 'XC_SCRIBE_OPTION_KEY', 'xc_scribe_settings' );
define( 'XC_SCRIBE_REST_NAMESPACE', 'xc-scribe/v1' );
define( 'XC_SCRIBE_API_URL', 'https://api.xcscribe.com' );
// Set XC_SCRIBE_DEV_MODE in wp-config.php to show the API URL field in settings.
// phpcs:ignore Squiz.Commenting.InlineComment.InvalidEndChar -- Commented-out example code.
// define('XC_SCRIBE_DEV_MODE', true);

/**
 * Return default plugin settings.
 *
 * @return array
 */
function xc_scribe_default_settings() {
	return array(
		'api_base_url' => XC_SCRIBE_API_URL,
		'api_key'      => '',
	);
}

/**
 * Get merged plugin settings.
 *
 * @return array
 */
function xc_scribe_get_settings() {
	$settings = get_option( XC_SCRIBE_OPTION_KEY, array() );
	if ( ! is_array( $settings ) ) {
		$settings = array();
	}
	return array_merge( xc_scribe_default_settings(), $settings );
}

/**
 * Update plugin settings.
 *
 * @param array $new_settings Partial settings to merge.
 * @return array Updated settings.
 */
function xc_scribe_update_settings( $new_settings ) {
	$settings = xc_scribe_get_settings();

	if ( isset( $new_settings['api_base_url'] ) ) {
		$settings['api_base_url'] = esc_url_raw( $new_settings['api_base_url'] );
	}
	if ( isset( $new_settings['api_key'] ) ) {
		$settings['api_key'] = sanitize_text_field( $new_settings['api_key'] );
	}

	update_option( XC_SCRIBE_OPTION_KEY, $settings );
	return $settings;
}

/**
 * Plugin activation hook — initialize default settings.
 */
function xc_scribe_activate() {
	if ( get_option( XC_SCRIBE_OPTION_KEY, null ) === null ) {
		add_option( XC_SCRIBE_OPTION_KEY, xc_scribe_default_settings() );
	}
}
register_activation_hook( __FILE__, 'xc_scribe_activate' );

/**
 * Register the admin menu page.
 */
function xc_scribe_admin_menu() {
	// Lucide "pencil-line" icon as data URI SVG (black fill for WP sidebar).
	// phpcs:ignore WordPress.PHP.DiscouragedPHPFunctions.obfuscation_base64_encode -- Encoding SVG for menu icon.
	$icon_svg = 'data:image/svg+xml;base64,' . base64_encode( '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="black" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"/><path d="M16.376 3.622a1 1 0 0 1 3.002 3.002L7.368 18.635a2 2 0 0 1-.855.506l-2.872.838a.5.5 0 0 1-.62-.62l.838-2.872a2 2 0 0 1 .506-.854z"/><path d="m15 5 3 3"/></svg>' );

	add_menu_page(
		__( 'XC Scribe', 'xc-scribe' ),
		__( '[xc] Scribe', 'xc-scribe' ),
		'edit_posts',
		XC_SCRIBE_PLUGIN_SLUG,
		'xc_scribe_render_page',
		$icon_svg,
		79
	);
}
add_action( 'admin_menu', 'xc_scribe_admin_menu' );

/**
 * Render the plugin admin page container.
 */
function xc_scribe_render_page() {
	echo '<div class="wrap"><div id="xc-scribe-root"></div></div>';
}

/**
 * Enqueue admin scripts and styles on plugin and product pages.
 *
 * @param string $hook The current admin page hook suffix.
 */
function xc_scribe_enqueue_admin_assets( $hook ) {
	$screen = function_exists( 'get_current_screen' ) ? get_current_screen() : null;

	$is_plugin_page  = ( 'toplevel_page_' . XC_SCRIBE_PLUGIN_SLUG === $hook );
	$is_product_edit = $screen && 'post' === $screen->base && 'product' === $screen->post_type;

	if ( ! $is_plugin_page && ! $is_product_edit ) {
		return;
	}

	$assets_dir = plugin_dir_path( __FILE__ ) . 'assets/';
	$assets_url = plugin_dir_url( __FILE__ ) . 'assets/';

	$css_path = $assets_dir . 'admin.css';
	$js_path  = $assets_dir . 'admin.js';

	if ( file_exists( $css_path ) ) {
		wp_enqueue_style( 'xc-scribe-admin', $assets_url . 'admin.css', array(), filemtime( $css_path ) );
	}

	if ( file_exists( $js_path ) ) {
		wp_enqueue_script( 'xc-scribe-admin', $assets_url . 'admin.js', array(), filemtime( $js_path ), true );

		if ( $is_plugin_page ) {
			wp_localize_script(
				'xc-scribe-admin',
				'XcScribeAdmin',
				array(
					'restUrl'        => esc_url_raw( rest_url( XC_SCRIBE_REST_NAMESPACE ) ),
					'nonce'          => wp_create_nonce( 'wp_rest' ),
					'hasWooCommerce' => function_exists( 'wc_get_product' ),
					'devMode'        => defined( 'XC_SCRIBE_DEV_MODE' ) && XC_SCRIBE_DEV_MODE,
					'locale'         => get_locale(),
				)
			);
		} elseif ( $is_product_edit ) {
			$product_id = 0;
			if ( isset( $GLOBALS['post'] ) && isset( $GLOBALS['post']->ID ) ) {
				$product_id = absint( $GLOBALS['post']->ID );
			}
			if ( $product_id <= 0 ) {
				$product_id = absint( get_the_ID() );
			}
			wp_localize_script(
				'xc-scribe-admin',
				'XcScribeAdmin',
				array(
					'restUrl'   => esc_url_raw( rest_url( XC_SCRIBE_REST_NAMESPACE ) ),
					'nonce'     => wp_create_nonce( 'wp_rest' ),
					'page'      => 'product',
					'productId' => $product_id,
					'locale'    => get_locale(),
				)
			);
		}
	} else {
		add_action(
			'admin_notices',
			function () {
				echo '<div class="notice notice-warning"><p>';
				echo esc_html__( 'XC Scribe admin assets not built yet. Run the build script to generate assets.', 'xc-scribe' );
				echo '</p></div>';
			}
		);
	}
}
add_action( 'admin_enqueue_scripts', 'xc_scribe_enqueue_admin_assets' );

/**
 * Permission callback: check if user can manage plugin settings.
 *
 * @return bool
 */
function xc_scribe_can_manage_settings() {
	return current_user_can( 'manage_options' );
}

/**
 * Permission callback: check if user can generate content.
 *
 * @return bool
 */
function xc_scribe_can_generate() {
	return current_user_can( 'edit_posts' );
}

/**
 * Check if the current user can edit a specific product.
 *
 * @param int $product_id The product post ID.
 * @return bool
 */
function xc_scribe_can_edit_product( $product_id ) {
	if ( $product_id <= 0 ) {
		return false;
	}
	return current_user_can( 'edit_post', $product_id );
}

/**
 * Make an HTTP request to the XC Scribe API.
 *
 * @param string     $method HTTP method (GET, POST, etc.).
 * @param string     $path   API path (e.g. /api/v1/plugin/status).
 * @param array|null $body   Optional JSON body.
 * @return array Response with ok, status, error, data, raw keys.
 */
function xc_scribe_xc_request( $method, $path, $body = null ) {
	$settings = xc_scribe_get_settings();
	$api_key  = $settings['api_key'];
	$base     = rtrim( $settings['api_base_url'], '/' );

	if ( empty( $api_key ) ) {
		return array(
			'ok'     => false,
			'status' => 400,
			'error'  => 'API key is not set.',
			'data'   => null,
			'raw'    => null,
		);
	}

	$url  = $base . $path;
	$args = array(
		'method'  => $method,
		'headers' => array(
			'Authorization' => 'Bearer ' . $api_key,
			'Content-Type'  => 'application/json',
		),
		'timeout' => 90,
	);

	if ( null !== $body ) {
		$args['body'] = wp_json_encode( $body );
	}

	$response = wp_remote_request( $url, $args );
	if ( is_wp_error( $response ) ) {
		return array(
			'ok'     => false,
			'status' => 502,
			'error'  => $response->get_error_message(),
			'data'   => null,
			'raw'    => null,
		);
	}

	$status = wp_remote_retrieve_response_code( $response );
	$raw    = wp_remote_retrieve_body( $response );
	$json   = json_decode( $raw, true );

	return array(
		'ok'     => $status >= 200 && $status < 300,
		'status' => $status,
		'error'  => null,
		'data'   => is_array( $json ) ? $json : null,
		'raw'    => is_array( $json ) ? null : $raw,
	);
}

/**
 * Retrieve WooCommerce product data for AI generation.
 *
 * @param int $product_id The product post ID.
 * @return array Response with ok, status, error, data keys.
 */
function xc_scribe_get_product_context( $product_id ) {
	if ( ! function_exists( 'wc_get_product' ) ) {
		return array(
			'ok'     => false,
			'status' => 500,
			'error'  => 'WooCommerce is not active.',
			'data'   => null,
		);
	}

	$product = wc_get_product( $product_id );
	if ( ! $product ) {
		return array(
			'ok'     => false,
			'status' => 404,
			'error'  => 'Product not found.',
			'data'   => null,
		);
	}

	$category_name = '';
	$terms         = get_the_terms( $product_id, 'product_cat' );
	if ( is_array( $terms ) && count( $terms ) > 0 ) {
		$term          = $terms[0];
		$category_name = $term->name;
	}

	$attrs = array();
	foreach ( $product->get_attributes() as $attribute ) {
		if ( is_a( $attribute, 'WC_Product_Attribute' ) ) {
			$name           = wc_attribute_label( $attribute->get_name() );
			$options        = $attribute->get_options();
			$attrs[ $name ] = is_array( $options ) ? implode( ', ', $options ) : strval( $options );
		} elseif ( is_array( $attribute ) ) {
			foreach ( $attribute as $k => $v ) {
				$attrs[ strval( $k ) ] = is_array( $v ) ? implode( ', ', $v ) : strval( $v );
			}
		}
	}

	$images      = array();
	$featured_id = $product->get_image_id();
	if ( $featured_id ) {
		$url = wp_get_attachment_url( $featured_id );
		if ( $url ) {
			$images[] = $url;
		}
	}
	foreach ( $product->get_gallery_image_ids() as $img_id ) {
		$url = wp_get_attachment_url( $img_id );
		if ( $url ) {
			$images[] = $url;
		}
	}

	return array(
		'ok'     => true,
		'status' => 200,
		'error'  => null,
		'data'   => array(
			'product_id'        => intval( $product_id ),
			'title'             => $product->get_name(),
			'category'          => $category_name,
			'attributes'        => $attrs,
			'images'            => $images,
			'description'       => $product->get_description(),
			'short_description' => $product->get_short_description(),
		),
	);
}

/**
 * Register the XC Scribe metabox on WooCommerce product pages.
 */
function xc_scribe_register_product_metabox() {
	if ( ! function_exists( 'wc_get_product' ) ) {
		return;
	}
	$logo = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 56 32" width="42" height="24" style="vertical-align:middle;margin-right:4px">'
		. '<g transform="translate(2,4)" fill="none" stroke="#2563eb" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">'
		. '<path d="M10 20h7.5"/><path d="M13.75 3.75a1.77 1.77 0 0 1 2.5 2.5L5.83 16.67 3 17.5l.83-2.83L14.25 4.25z"/>'
		. '</g><rect x="24" y="0" width="32" height="32" rx="6" fill="#2563eb"/>'
		. '<text x="40" y="22" text-anchor="middle" font-family="system-ui,sans-serif" font-weight="700" font-size="14" fill="#fff">XC</text></svg>';
	add_meta_box(
		'xc-scribe-product-box',
		'<span style="display:inline-flex;align-items:center">' . $logo . 'Scribe</span>',
		'xc_scribe_render_product_metabox',
		'product',
		'side',
		'high'
	);
}
add_action( 'add_meta_boxes', 'xc_scribe_register_product_metabox' );

/**
 * Render the product metabox container.
 *
 * @param WP_Post $post The current post object.
 */
function xc_scribe_render_product_metabox( $post ) {
	echo '<div id="xc-scribe-product-root" data-product-id="' . esc_attr( $post->ID ) . '"></div>';
}

/**
 * Register all REST API routes for the plugin.
 */
function xc_scribe_register_rest_routes() {
	register_rest_route(
		XC_SCRIBE_REST_NAMESPACE,
		'/settings',
		array(
			array(
				'methods'             => 'GET',
				'permission_callback' => 'xc_scribe_can_manage_settings',
				'callback'            => function () {
					$settings = xc_scribe_get_settings();
					return array(
						'api_base_url' => $settings['api_base_url'],
						'has_api_key'  => ! empty( $settings['api_key'] ),
					);
				},
			),
			array(
				'methods'             => 'POST',
				'permission_callback' => 'xc_scribe_can_manage_settings',
				'callback'            => function ( \WP_REST_Request $request ) {
					$payload = $request->get_json_params();
					if ( ! is_array( $payload ) ) {
						$payload = array();
					}
					$settings = xc_scribe_update_settings( $payload );
					return array(
						'api_base_url' => $settings['api_base_url'],
						'has_api_key'  => ! empty( $settings['api_key'] ),
					);
				},
			),
		)
	);

	register_rest_route(
		XC_SCRIBE_REST_NAMESPACE,
		'/status',
		array(
			'methods'             => 'GET',
			'permission_callback' => 'xc_scribe_can_manage_settings',
			'callback'            => function () {
				$result = xc_scribe_xc_request( 'GET', '/api/v1/plugin/status', null );

				// Map common API errors to user-friendly messages.
				if ( ! $result['ok'] ) {
					$api_status = $result['status'];
					$detail = isset( $result['data']['detail'] ) ? $result['data']['detail'] : '';

					if ( 401 === $api_status ) {
						$result['error'] = 'Invalid API key. Please check your key and try again.';
					} elseif ( 400 === $api_status && false !== strpos( strtolower( $detail ), 'api key' ) ) {
						$result['error'] = $detail;
					} elseif ( 502 !== $api_status && empty( $result['error'] ) ) {
						$result['error'] = ! empty( $detail ) ? $detail : "Connection failed (HTTP {$api_status}).";
					}
				}

				// Always return HTTP 200 so the frontend can read ok/error fields.
				return new \WP_REST_Response( $result, 200 );
			},
		)
	);

	// WooCommerce-only routes.
	if ( function_exists( 'wc_get_product' ) ) {

		register_rest_route(
			XC_SCRIBE_REST_NAMESPACE,
			'/product-context',
			array(
				'methods'             => 'GET',
				'permission_callback' => 'xc_scribe_can_generate',
				'args'                => array(
					'product_id' => array(
						'required'          => true,
						'type'              => 'integer',
						'sanitize_callback' => 'absint',
					),
				),
				'callback'            => function ( \WP_REST_Request $request ) {
					$product_id = intval( $request->get_param( 'product_id' ) );
					if ( ! xc_scribe_can_edit_product( $product_id ) ) {
						return new \WP_REST_Response(
							array(
								'ok'     => false,
								'status' => 403,
								'error'  => 'You do not have permission to edit this product.',
								'data'   => null,
							),
							403
						);
					}
					$ctx = xc_scribe_get_product_context( $product_id );
					return new \WP_REST_Response( $ctx, $ctx['status'] );
				},
			)
		);

		register_rest_route(
			XC_SCRIBE_REST_NAMESPACE,
			'/generate-description',
			array(
				'methods'             => 'POST',
				'permission_callback' => 'xc_scribe_can_generate',
				'callback'            => function ( \WP_REST_Request $request ) {
					$payload = $request->get_json_params();
					if ( ! is_array( $payload ) ) {
						$payload = array();
					}

					$product_id = isset( $payload['product_id'] ) ? intval( $payload['product_id'] ) : 0;
					if ( $product_id <= 0 ) {
						return new \WP_REST_Response(
							array(
								'ok'     => false,
								'status' => 400,
								'error'  => 'product_id is required.',
							),
							400
						);
					}
					if ( ! xc_scribe_can_edit_product( $product_id ) ) {
						return new \WP_REST_Response(
							array(
								'ok'     => false,
								'status' => 403,
								'error'  => 'You do not have permission to edit this product.',
							),
							403
						);
					}

					$ctx = xc_scribe_get_product_context( $product_id );
					if ( ! $ctx['ok'] ) {
						return new \WP_REST_Response( $ctx, $ctx['status'] );
					}

					$data = $ctx['data'];
					$xc_payload = array(
						'source'              => function_exists( 'wc_get_product' ) ? 'woocommerce' : 'wordpress',
						'product_title'       => $data['title'],
						'product_category'    => ! empty( $data['category'] ) ? $data['category'] : null,
						'product_attributes'  => ! empty( $data['attributes'] ) ? (object) $data['attributes'] : null,
						'product_images'      => ! empty( $data['images'] ) ? $data['images'] : null,
						'current_description' => ! empty( $data['description'] ) ? $data['description'] : null,
						'language'            => isset( $payload['language'] ) ? sanitize_text_field( $payload['language'] ) : 'en',
						'tone'                => isset( $payload['tone'] ) ? sanitize_text_field( $payload['tone'] ) : 'professional',
						'custom_instructions' => isset( $payload['custom_instructions'] ) ? sanitize_text_field( $payload['custom_instructions'] ) : null,
					);

					$result = xc_scribe_xc_request( 'POST', '/api/v1/plugin/generate-description', $xc_payload );
					return new \WP_REST_Response( $result, $result['status'] );
				},
			)
		);

		register_rest_route(
			XC_SCRIBE_REST_NAMESPACE,
			'/generate-description-async',
			array(
				'methods'             => 'POST',
				'permission_callback' => 'xc_scribe_can_generate',
				'callback'            => function ( \WP_REST_Request $request ) {
					$payload = $request->get_json_params();
					if ( ! is_array( $payload ) ) {
						$payload = array();
					}

					$product_id = isset( $payload['product_id'] ) ? intval( $payload['product_id'] ) : 0;
					if ( $product_id <= 0 ) {
						return new \WP_REST_Response(
							array(
								'ok'     => false,
								'status' => 400,
								'error'  => 'product_id is required.',
								'data'   => null,
								'raw'    => null,
							),
							400
						);
					}
					if ( ! xc_scribe_can_edit_product( $product_id ) ) {
						return new \WP_REST_Response(
							array(
								'ok'     => false,
								'status' => 403,
								'error'  => 'You do not have permission to edit this product.',
								'data'   => null,
								'raw'    => null,
							),
							403
						);
					}

					$ctx = xc_scribe_get_product_context( $product_id );
					if ( ! $ctx['ok'] ) {
						return new \WP_REST_Response( $ctx, $ctx['status'] );
					}

					$data = $ctx['data'];
					$xc_payload = array(
						'source'              => function_exists( 'wc_get_product' ) ? 'woocommerce' : 'wordpress',
						'product_title'       => $data['title'],
						'product_category'    => ! empty( $data['category'] ) ? $data['category'] : null,
						'product_attributes'  => ! empty( $data['attributes'] ) ? (object) $data['attributes'] : null,
						'product_images'      => ! empty( $data['images'] ) ? $data['images'] : null,
						'current_description' => ! empty( $data['description'] ) ? $data['description'] : null,
						'language'            => isset( $payload['language'] ) ? sanitize_text_field( $payload['language'] ) : 'en',
						'tone'                => isset( $payload['tone'] ) ? sanitize_text_field( $payload['tone'] ) : 'professional',
						'custom_instructions' => isset( $payload['custom_instructions'] ) ? sanitize_text_field( $payload['custom_instructions'] ) : null,
					);

					$result = xc_scribe_xc_request( 'POST', '/api/v1/plugin/generate-description-async', $xc_payload );
					if ( ! $result['ok'] ) {
						if ( empty( $result['error'] ) ) {
							$detail = isset( $result['data']['detail'] ) ? $result['data']['detail'] : null;
							if ( is_array( $detail ) ) {
								$msgs = array_map(
									function ( $e ) {
										return isset( $e['msg'] ) ? $e['msg'] : '';
									},
									$detail
								);
								$result['error'] = implode( '; ', array_filter( $msgs ) );
							} elseif ( is_string( $detail ) && strlen( $detail ) > 0 ) {
								$result['error'] = $detail;
							} else {
								$result['error'] = "Generation failed (HTTP {$result['status']}).";
							}
						}
						return new \WP_REST_Response( $result, 200 );
					}

					$generation_id = isset( $result['data']['generation_id'] ) ? $result['data']['generation_id'] : null;
					return new \WP_REST_Response(
						array(
							'ok'     => true,
							'status' => 200,
							'error'  => null,
							'data'   => array( 'generation_id' => $generation_id ),
						),
						200
					);
				},
			)
		);

	} // End WooCommerce-only routes.

	register_rest_route(
		XC_SCRIBE_REST_NAMESPACE,
		'/generate-blog-draft',
		array(
			'methods'             => 'POST',
			'permission_callback' => function () {
				return current_user_can( 'edit_posts' );
			},
			'callback'            => function ( \WP_REST_Request $request ) {
				$payload = $request->get_json_params();
				if ( ! is_array( $payload ) ) {
					$payload = array();
				}

				$topic = isset( $payload['topic'] ) ? sanitize_text_field( $payload['topic'] ) : '';
				if ( strlen( $topic ) === 0 ) {
					return new \WP_REST_Response(
						array(
							'ok'     => false,
							'status' => 400,
							'error'  => 'topic is required.',
						),
						200
					);
				}

				$xc_payload = array(
					'source'              => function_exists( 'wc_get_product' ) ? 'woocommerce' : 'wordpress',
					'topic'               => $topic,
					'product_title'       => isset( $payload['product_title'] ) ? sanitize_text_field( $payload['product_title'] ) : null,
					'product_category'    => isset( $payload['product_category'] ) ? sanitize_text_field( $payload['product_category'] ) : null,
					'language'            => isset( $payload['language'] ) ? sanitize_text_field( $payload['language'] ) : 'en',
					'tone'                => isset( $payload['tone'] ) ? sanitize_text_field( $payload['tone'] ) : 'professional',
					'custom_instructions' => isset( $payload['custom_instructions'] ) ? sanitize_text_field( $payload['custom_instructions'] ) : null,
				);

				$result = xc_scribe_xc_request( 'POST', '/api/v1/plugin/generate-blog-async', $xc_payload );
				if ( ! $result['ok'] ) {
					if ( empty( $result['error'] ) ) {
						$detail = isset( $result['data']['detail'] ) ? $result['data']['detail'] : null;
						if ( is_array( $detail ) ) {
							$msgs = array_map(
								function ( $e ) {
									return isset( $e['msg'] ) ? $e['msg'] : '';
								},
								$detail
							);
							$result['error'] = implode( '; ', array_filter( $msgs ) );
						} elseif ( is_string( $detail ) && strlen( $detail ) > 0 ) {
							$result['error'] = $detail;
						} else {
							$result['error'] = "Generation failed (HTTP {$result['status']}).";
						}
					}
					return new \WP_REST_Response( $result, 200 );
				}

				$generation_id = isset( $result['data']['generation_id'] ) ? $result['data']['generation_id'] : null;
				return new \WP_REST_Response(
					array(
						'ok'     => true,
						'status' => 200,
						'error'  => null,
						'data'   => array( 'generation_id' => $generation_id ),
					),
					200
				);
			},
		)
	);

	// Route pattern matching frontend's `/generation/{id}/status` URL.
	register_rest_route(
		XC_SCRIBE_REST_NAMESPACE,
		'/generation/(?P<id>[a-zA-Z0-9-]+)/status',
		array(
			'methods'             => 'GET',
			'permission_callback' => function () {
				return current_user_can( 'edit_posts' );
			},
			'callback'            => function ( \WP_REST_Request $request ) {
				$gen_id = sanitize_text_field( $request->get_param( 'id' ) );
				$result = xc_scribe_xc_request( 'GET', '/api/v1/plugin/generation/' . $gen_id . '/status', null );

				if ( ! $result['ok'] ) {
					if ( empty( $result['error'] ) ) {
						$detail = isset( $result['data']['detail'] ) ? $result['data']['detail'] : null;
						$result['error'] = is_string( $detail ) ? $detail : "Status check failed (HTTP {$result['status']}).";
					}
					return new \WP_REST_Response( $result, 200 );
				}

				return new \WP_REST_Response(
					array(
						'ok'     => true,
						'status' => 200,
						'error'  => null,
						'data'   => $result['data'],
					),
					200
				);
			},
		)
	);

	register_rest_route(
		XC_SCRIBE_REST_NAMESPACE,
		'/generation-status',
		array(
			'methods'             => 'GET',
			'permission_callback' => function () {
				return current_user_can( 'edit_posts' );
			},
			'args'                => array(
				'id' => array(
					'required'          => true,
					'type'              => 'string',
					'sanitize_callback' => 'sanitize_text_field',
				),
			),
			'callback'            => function ( \WP_REST_Request $request ) {
				$gen_id = sanitize_text_field( $request->get_param( 'id' ) );
				$result = xc_scribe_xc_request( 'GET', '/api/v1/plugin/generation/' . $gen_id . '/status', null );

				if ( ! $result['ok'] ) {
					if ( empty( $result['error'] ) ) {
						$detail = isset( $result['data']['detail'] ) ? $result['data']['detail'] : null;
						$result['error'] = is_string( $detail ) ? $detail : "Status check failed (HTTP {$result['status']}).";
					}
					return new \WP_REST_Response( $result, 200 );
				}

				return new \WP_REST_Response(
					array(
						'ok'     => true,
						'status' => 200,
						'error'  => null,
						'data'   => $result['data'],
					),
					200
				);
			},
		)
	);

	register_rest_route(
		XC_SCRIBE_REST_NAMESPACE,
		'/create-draft-post',
		array(
			'methods'             => 'POST',
			'permission_callback' => function () {
				return current_user_can( 'edit_posts' );
			},
			'callback'            => function ( \WP_REST_Request $request ) {
				$payload = $request->get_json_params();
				if ( ! is_array( $payload ) ) {
					return new \WP_REST_Response(
						array(
							'ok'    => false,
							'error' => 'Invalid payload.',
						),
						200
					);
				}

				$title = isset( $payload['title'] ) ? sanitize_text_field( $payload['title'] ) : '';
				$content = isset( $payload['content'] ) ? wp_kses_post( $payload['content'] ) : '';

				if ( strlen( $title ) === 0 ) {
					return new \WP_REST_Response(
						array(
							'ok'    => false,
							'error' => 'title is required.',
						),
						200
					);
				}

				$post_id = wp_insert_post(
					array(
						'post_type'    => 'post',
						'post_status'  => 'draft',
						'post_title'   => $title,
						'post_content' => $content,
					),
					true
				);

				if ( is_wp_error( $post_id ) ) {
					return new \WP_REST_Response(
						array(
							'ok'    => false,
							'error' => $post_id->get_error_message(),
						),
						200
					);
				}

				return new \WP_REST_Response(
					array(
						'ok'   => true,
						'data' => array(
							'post_id'  => intval( $post_id ),
							'edit_url' => get_edit_post_link( $post_id, 'raw' ),
						),
					),
					200
				);
			},
		)
	);

	register_rest_route(
		XC_SCRIBE_REST_NAMESPACE,
		'/recent-activity',
		array(
			'methods'             => 'GET',
			'permission_callback' => 'xc_scribe_can_generate',
			'callback'            => function () {
				$log = get_option( 'xc_scribe_activity_log', array() );
				if ( ! is_array( $log ) ) {
					$log = array();
				}
				return array( 'entries' => array_slice( $log, 0, 5 ) );
			},
		)
	);

	register_rest_route(
		XC_SCRIBE_REST_NAMESPACE,
		'/log-activity',
		array(
			'methods'             => 'POST',
			'permission_callback' => 'xc_scribe_can_generate',
			'callback'            => function ( \WP_REST_Request $request ) {
				$payload = $request->get_json_params();
				if ( ! is_array( $payload ) ) {
					return new \WP_REST_Response( array( 'ok' => false ), 400 );
				}

				$entry = array(
					'type'     => isset( $payload['type'] ) ? sanitize_text_field( $payload['type'] ) : 'blog',
					'title'    => isset( $payload['title'] ) ? sanitize_text_field( $payload['title'] ) : '',
					'date'     => isset( $payload['date'] ) ? sanitize_text_field( $payload['date'] ) : current_time( 'Y-m-d' ),
					'xct_cost' => isset( $payload['xct_cost'] ) ? sanitize_text_field( $payload['xct_cost'] ) : '0',
					'edit_url' => isset( $payload['edit_url'] ) ? esc_url_raw( $payload['edit_url'] ) : null,
				);

				$log = get_option( 'xc_scribe_activity_log', array() );
				if ( ! is_array( $log ) ) {
					$log = array();
				}
				array_unshift( $log, $entry );
				$log = array_slice( $log, 0, 20 );
				update_option( 'xc_scribe_activity_log', $log );

				return array( 'ok' => true );
			},
		)
	);
}
add_action( 'rest_api_init', 'xc_scribe_register_rest_routes' );
