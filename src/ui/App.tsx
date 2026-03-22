import { useCallback, useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { useTranslation } from 'react-i18next';

import { getWpAxiosHeaders, getWpBootstrap } from './wp';
import { Header } from './Header';
import { TabNav } from './TabNav';
import type { TabId } from './TabNav';
import { DashboardTab } from './DashboardTab';
import { BlogGeneratorTab } from './BlogGeneratorTab';
import { ProductsTab } from './ProductsTab';
import { AboutTab } from './AboutTab';
import type { ActivityEntry, PluginStatus, SettingsResponse, XcProxyResponse } from './types';

export function App() {
  const { t } = useTranslation();
  const bootstrap = getWpBootstrap();
  const client = useMemo(() => {
    if (!bootstrap) return null;
    return axios.create({
      baseURL: bootstrap.restUrl,
      headers: getWpAxiosHeaders(bootstrap),
    });
  }, [bootstrap]);

  const [activeTab, setActiveTab] = useState<TabId>('dashboard');
  const [isLoading, setIsLoading] = useState(true);

  // Settings state
  const [apiBaseUrl, setApiBaseUrl] = useState('https://api.xcscribe.com');
  const [hasApiKey, setHasApiKey] = useState(false);

  // Status state
  const [status, setStatus] = useState<PluginStatus | null>(null);
  const [connected, setConnected] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);

  // Activity state
  const [activity, setActivity] = useState<ActivityEntry[]>([]);

  const fetchStatus = useCallback(async () => {
    if (!client) return;
    setConnectionError(null);
    try {
      const { data } = await client.get<XcProxyResponse<PluginStatus>>('/status');
      if (data.ok && data.data) {
        setStatus(data.data);
        setConnected(true);
        setConnectionError(null);
      } else {
        setConnected(false);
        setConnectionError(data.error || `Connection failed (HTTP ${data.status})`);
      }
    } catch (err) {
      setConnected(false);
      // Try to extract error from axios response body (WP proxy errors)
      const axiosData = (err as { response?: { data?: XcProxyResponse<unknown> } })?.response?.data;
      if (axiosData?.error) {
        setConnectionError(axiosData.error);
      } else {
        setConnectionError(err instanceof Error ? err.message : 'Could not reach XC Scribe API');
      }
    }
  }, [client]);

  useEffect(() => {
    let mounted = true;
    async function load() {
      if (!client) return;
      try {
        const [settingsRes, activityRes] = await Promise.allSettled([
          client.get<SettingsResponse>('/settings'),
          client.get<{ entries: ActivityEntry[] }>('/recent-activity'),
        ]);

        if (!mounted) return;

        if (settingsRes.status === 'fulfilled') {
          setApiBaseUrl(settingsRes.value.data.api_base_url);
          setHasApiKey(settingsRes.value.data.has_api_key);
        }

        if (activityRes.status === 'fulfilled') {
          setActivity(activityRes.value.data.entries ?? []);
        }

        await fetchStatus();
      } finally {
        if (mounted) setIsLoading(false);
      }
    }
    void load();
    return () => { mounted = false; };
  }, [client, fetchStatus]);

  function handleBalanceUpdate(newBalance: string) {
    setStatus((prev) => prev ? { ...prev, total_balance: newBalance } : prev);
  }

  function handleActivityAdd(entry: { type: 'blog' | 'product'; title: string; xct_cost: string; edit_url: string | null }) {
    const newEntry: ActivityEntry = {
      ...entry,
      date: new Date().toLocaleDateString(),
    };
    setActivity((prev) => [newEntry, ...prev].slice(0, 5));

    // Persist to server
    if (client) {
      client.post('/log-activity', newEntry).catch(() => {});
    }
  }

  function handleSettingsSaved(data: SettingsResponse) {
    setHasApiKey(data.has_api_key);
  }

  if (!bootstrap) {
    return <div className="xc-notice xc-notice--error">{t('common.bootstrapMissing')}</div>;
  }

  if (isLoading) {
    return (
      <div className="xc-scribe-wrap">
        <Header planTier={null} balance={null} connected={false} />
        <div className="xc-content" style={{ textAlign: 'center', padding: 40 }}>
          <span className="xc-spinner" />
        </div>
      </div>
    );
  }

  return (
    <div className="xc-scribe-wrap">
      <Header
        planTier={status?.plan_tier ?? null}
        balance={status?.total_balance ?? null}
        connected={connected}
      />
      <TabNav
        activeTab={activeTab}
        onTabChange={setActiveTab}
        hasWooCommerce={bootstrap.hasWooCommerce}
      />
      <div className="xc-content">
        {activeTab === 'dashboard' && client && (
          <DashboardTab
            client={client}
            status={status}
            connected={connected}
            connectionError={connectionError}
            hasApiKey={hasApiKey}
            activity={activity}
            devMode={bootstrap.devMode}
            apiBaseUrl={apiBaseUrl}
            onApiBaseUrlChange={setApiBaseUrl}
            onSettingsSaved={handleSettingsSaved}
            onStatusRefresh={fetchStatus}
          />
        )}
        {activeTab === 'blog' && client && (
          <BlogGeneratorTab
            client={client}
            onBalanceUpdate={handleBalanceUpdate}
            onActivityAdd={handleActivityAdd}
          />
        )}
        {activeTab === 'products' && (
          <ProductsTab hasWooCommerce={bootstrap.hasWooCommerce} />
        )}
        {activeTab === 'about' && (
          <AboutTab />
        )}
      </div>
    </div>
  );
}
