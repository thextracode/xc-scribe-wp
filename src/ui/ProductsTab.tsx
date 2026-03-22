import { Trans, useTranslation } from 'react-i18next';

type ProductsTabProps = {
  hasWooCommerce: boolean;
};

export function ProductsTab({ hasWooCommerce }: ProductsTabProps) {
  const { t } = useTranslation();

  if (!hasWooCommerce) {
    return (
      <div className="xc-teaser">
        <h3 className="xc-teaser__title">{t('products.title')}</h3>
        <p className="xc-teaser__desc">
          {t('products.wooNotAvailable')}
        </p>
      </div>
    );
  }

  return (
    <div className="xc-card">
      <h3 className="xc-section__title">{t('products.title')}</h3>
      <p style={{ color: 'var(--xc-text-secondary)', fontSize: 13 }}>
        <Trans i18nKey="products.instructions" components={{ 1: <strong /> }} />
      </p>
      <div className="xc-notice xc-notice--info">
        <Trans i18nKey="products.goToProducts" components={{ 1: <strong /> }} />
      </div>
    </div>
  );
}
