declare global {
  interface Window {
    XcScribeAdmin?: {
      restUrl: string;
      nonce: string;
      hasWooCommerce: boolean;
      devMode: boolean;
      locale: string;
      page?: string;
      productId?: number;
    };
    wp?: unknown;
  }
}

export type WpBootstrap = NonNullable<Window['XcScribeAdmin']>;

export function getWpBootstrap(): WpBootstrap | null {
  return window.XcScribeAdmin ?? null;
}

export function getWpAxiosHeaders(bootstrap: WpBootstrap) {
  return {
    'X-WP-Nonce': bootstrap.nonce,
    'Content-Type': 'application/json',
  };
}

export function openUpgradePage() {
  window.open('https://app.xcscribe.com/settings/billing', '_blank', 'noopener,noreferrer');
}
