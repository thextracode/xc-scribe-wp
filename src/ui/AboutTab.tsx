import { Trans, useTranslation } from 'react-i18next';

export function AboutTab() {
  const { t } = useTranslation();

  return (
    <div>
      <div className="xc-card">
        <h3 className="xc-section__title">{t('about.whatIsTitle')}</h3>
        <p style={{ color: 'var(--xc-text)', fontSize: 14, lineHeight: 1.6, margin: '0 0 12px' }}>
          {t('about.whatIsDesc1')}
        </p>
        <p style={{ color: 'var(--xc-text-secondary)', fontSize: 14, lineHeight: 1.6, margin: 0 }}>
          {t('about.whatIsDesc2')}{' '}
          <a href="https://xcscribe.com" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--xc-primary)', textDecoration: 'none', fontWeight: 500 }}>
            {t('about.learnMore')}
          </a>
        </p>
      </div>

      <div className="xc-card">
        <h3 className="xc-section__title">{t('about.needMorePower')}</h3>
        <p style={{ color: 'var(--xc-text)', fontSize: 14, lineHeight: 1.6, margin: '0 0 16px' }}>
          {t('about.fullPlatformOffers')}
        </p>
        <ul className="xc-about-features">
          <li><Trans i18nKey="about.featureBulk" components={{ 0: <strong /> }} /></li>
          <li><Trans i18nKey="about.featureStudio" components={{ 0: <strong /> }} /></li>
          <li><Trans i18nKey="about.featureAnalytics" components={{ 0: <strong /> }} /></li>
          <li><Trans i18nKey="about.featureMultiStore" components={{ 0: <strong /> }} /></li>
          <li><Trans i18nKey="about.featureTeam" components={{ 0: <strong /> }} /></li>
        </ul>
        <div style={{ marginTop: 20 }}>
          <button
            type="button"
            className="xc-btn xc-btn--primary"
            onClick={() => window.open('https://app.xcscribe.com', '_blank')}
          >
            {t('about.openXcScribe')}
          </button>
        </div>
      </div>
    </div>
  );
}
