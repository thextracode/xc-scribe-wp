import { useState } from 'react';
import { AxiosInstance } from 'axios';
import { useTranslation } from 'react-i18next';

import { StatusCard } from './StatusCard';
import type { ActivityEntry, PluginStatus, SettingsResponse } from './types';

type DashboardTabProps = {
  client: AxiosInstance;
  status: PluginStatus | null;
  connected: boolean;
  connectionError: string | null;
  hasApiKey: boolean;
  activity: ActivityEntry[];
  devMode: boolean;
  apiBaseUrl: string;
  onApiBaseUrlChange: (url: string) => void;
  onSettingsSaved: (data: SettingsResponse) => void;
  onStatusRefresh: () => Promise<void>;
};

export function DashboardTab({
  client,
  status,
  connected,
  connectionError,
  hasApiKey,
  activity,
  devMode,
  apiBaseUrl,
  onApiBaseUrlChange,
  onSettingsSaved,
  onStatusRefresh,
}: DashboardTabProps) {
  const { t } = useTranslation();
  const [apiKey, setApiKey] = useState('');
  const [isApiKeyVisible, setIsApiKeyVisible] = useState(false);
  const [saveState, setSaveState] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [saveError, setSaveError] = useState<string | null>(null);
  const [testState, setTestState] = useState<'idle' | 'testing'>('idle');

  async function onSave() {
    setSaveState('saving');
    setSaveError(null);
    try {
      const payload: Record<string, unknown> = { api_base_url: apiBaseUrl };
      if (apiKey.trim().length > 0) {
        payload.api_key = apiKey.trim();
      }
      const { data } = await client.post<SettingsResponse>('/settings', payload);
      onSettingsSaved(data);
      setApiKey('');
      setSaveState('saved');
      setTimeout(() => setSaveState('idle'), 1500);
    } catch (err) {
      setSaveState('error');
      setSaveError(err instanceof Error ? err.message : 'Failed to save settings');
    }
  }

  async function onTestConnection() {
    setTestState('testing');
    try {
      await onStatusRefresh();
    } finally {
      setTestState('idle');
    }
  }

  return (
    <div>
      {/* Stat Cards */}
      <div className="xc-stats">
        <StatusCard
          label={t('dashboard.connection')}
          value={connected ? t('dashboard.connected') : t('dashboard.notConnected')}
          variant={connected ? 'success' : 'error'}
        />
        <StatusCard
          label={t('dashboard.plan')}
          value={status?.plan_tier ?? '—'}
        />
        <StatusCard
          label={t('dashboard.balance')}
          value={status?.total_balance ? t('dashboard.balanceValue', { balance: status.total_balance }) : '—'}
        />
      </div>

      {/* Connection error */}
      {!connected && connectionError && (
        <div className="xc-notice xc-notice--error" style={{ marginTop: 0, marginBottom: 24 }}>
          <strong>{t('dashboard.connectionFailed')}</strong> {connectionError}
        </div>
      )}

      {/* No API key warning */}
      {!hasApiKey && !connectionError && (
        <div className="xc-notice xc-notice--warning" style={{ marginTop: 0, marginBottom: 24 }}>
          {t('dashboard.noApiKey')}
        </div>
      )}

      {/* Connection Settings + CTA */}
      <div className="xc-dashboard-cols">
        <div className="xc-section">
          <h3 className="xc-section__title">{t('dashboard.connectionSettings')}</h3>
          <div className="xc-card">
            {devMode && (
              <div className="xc-form-group">
                <label htmlFor="xc-api-url">{t('dashboard.apiBaseUrl')}</label>
                <input
                  id="xc-api-url"
                  className="xc-input"
                  value={apiBaseUrl}
                  onChange={(e) => onApiBaseUrlChange(e.target.value)}
                  placeholder="https://api.xcscribe.com"
                />
              </div>
            )}

            <div className="xc-form-group">
              <label htmlFor="xc-api-key">{t('dashboard.apiKey')}</label>
              <div className="xc-actions">
                <input
                  id="xc-api-key"
                  className="xc-input"
                  type={isApiKeyVisible ? 'text' : 'password'}
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder={hasApiKey ? t('dashboard.apiKeyPlaceholderSaved') : t('dashboard.apiKeyPlaceholderNew')}
                  autoComplete="off"
                  style={{ flex: 1, maxWidth: 360 }}
                />
                <button
                  type="button"
                  className="xc-btn xc-btn--secondary xc-btn--small"
                  onClick={() => setIsApiKeyVisible((v) => !v)}
                >
                  {isApiKeyVisible ? t('dashboard.hide') : t('dashboard.reveal')}
                </button>
              </div>
              <p className="xc-hint">
                {hasApiKey ? t('dashboard.apiKeyHintSaved') : t('dashboard.apiKeyHintNew')}
              </p>
            </div>

            <div className="xc-actions" style={{ marginTop: 16 }}>
              <button
                type="button"
                className="xc-btn xc-btn--primary"
                onClick={onSave}
                disabled={saveState === 'saving'}
              >
                {saveState === 'saving' ? (
                  <><span className="xc-spinner" /> {t('dashboard.saving')}</>
                ) : saveState === 'saved' ? t('dashboard.saved') : t('dashboard.save')}
              </button>
              <button
                type="button"
                className="xc-btn xc-btn--secondary"
                onClick={onTestConnection}
                disabled={testState === 'testing'}
              >
                {testState === 'testing' ? (
                  <><span className="xc-spinner" /> {t('dashboard.testing')}</>
                ) : t('dashboard.testConnection')}
              </button>
            </div>

            {saveState === 'error' && (
              <div className="xc-notice xc-notice--error">{saveError}</div>
            )}
            {saveState === 'saved' && (
              <div className="xc-notice xc-notice--success">{t('dashboard.settingsSaved')}</div>
            )}
          </div>
        </div>

        <div className="xc-section">
          <h3 className="xc-section__title">{t('dashboard.fullPlatform')}</h3>
          <div className="xc-card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16, textAlign: 'center' }}>
            <p style={{ color: 'var(--xc-text)', fontSize: 14, lineHeight: 1.6, margin: 0 }}>
              {t('dashboard.fullPlatformDesc')}
            </p>
            <button
              type="button"
              className="xc-btn xc-btn--primary"
              onClick={() => window.open('https://app.xcscribe.com', '_blank')}
            >
              {t('dashboard.openXcScribe')}
            </button>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="xc-section">
        <h3 className="xc-section__title">{t('dashboard.recentActivity')}</h3>
        {activity.length === 0 ? (
          <p className="xc-empty">{t('dashboard.noActivity')}</p>
        ) : (
          <ul className="xc-activity">
            {activity.map((entry, i) => (
              <li key={i} className="xc-activity__item">
                <span className={`xc-activity__type${entry.type === 'product' ? ' xc-activity__type--product' : ''}`}>
                  {entry.type}
                </span>
                <span className="xc-activity__title">{entry.title}</span>
                <span className="xc-activity__cost">{t('activity.xct', { cost: entry.xct_cost })}</span>
                <span className="xc-activity__date">{entry.date}</span>
                {entry.edit_url && (
                  <a href={entry.edit_url} className="xc-activity__link">{t('activity.edit')}</a>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
