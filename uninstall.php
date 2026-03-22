<?php
/**
 * XC Scribe uninstall handler.
 *
 * Removes all plugin data when the plugin is deleted via WordPress admin.
 *
 * @package XC_Scribe
 */

if ( ! defined( 'WP_UNINSTALL_PLUGIN' ) ) {
	exit;
}

delete_option( 'xc_scribe_settings' );
delete_option( 'xc_scribe_activity_log' );
