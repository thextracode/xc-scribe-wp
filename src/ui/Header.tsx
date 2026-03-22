import { useTranslation } from 'react-i18next';

type HeaderProps = {
  planTier: string | null;
  balance: string | null;
  connected: boolean;
};

export function Header({ planTier, balance, connected }: HeaderProps) {
  const { t } = useTranslation();

  return (
    <div className="xc-header">
      <div className="xc-header__title">
        <span className="xc-header__logo">
          <svg className="xc-header__logo-pen" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"/><path d="M16.376 3.622a1 1 0 0 1 3.002 3.002L7.368 18.635a2 2 0 0 1-.855.506l-2.872.838a.5.5 0 0 1-.62-.62l.838-2.872a2 2 0 0 1 .506-.854z"/></svg>
          <span className="xc-header__logo-badge">XC</span>
          <span className="xc-header__logo-text">Scribe</span>
        </span>
      </div>
      {connected && planTier && (
        <span className="xc-header__badge">{planTier}</span>
      )}
      {connected && balance !== null && (
        <span className="xc-header__balance">
          <span className="xc-header__balance-label">{t('header.balance')}</span>
          {balance} XCT
        </span>
      )}
      {!connected && (
        <span className="xc-header__balance" style={{ color: 'var(--xc-error)' }}>
          {t('header.notConnected')}
        </span>
      )}
    </div>
  );
}
