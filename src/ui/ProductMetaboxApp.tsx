import { useMemo, useState, useCallback, useEffect, useRef } from 'react';
import axios from 'axios';
import { useTranslation } from 'react-i18next';

import { resolveLanguage } from '../i18n/i18n';
import { getWpAxiosHeaders, getWpBootstrap, openUpgradePage } from './wp';
import { LANGUAGES, TONES } from './types';

type XcProxyResponse<T> = {
  ok: boolean;
  status: number;
  error?: string | null;
  data: T | null;
  raw: string | null;
};

type PluginGeneration = {
  content: string;
  short_description?: string;
  tokens_used: number;
  xct_cost: string;
  remaining_balance: string;
};

type GenerationStatus = {
  status: 'processing' | 'completed' | 'failed';
  content?: string;
  short_description?: string;
  tokens_used?: number;
  xct_cost?: string;
  remaining_balance?: string;
  error?: string;
};

function setTinyMCEContent(editorId: string, content: string) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const tinyMCEAny = (window as any).tinymce;
  const editor = tinyMCEAny?.get?.(editorId);
  if (editor) {
    editor.setContent(content);
    return true;
  }
  const textarea = document.getElementById(editorId) as HTMLTextAreaElement | null;
  if (textarea) {
    textarea.value = content;
    return true;
  }
  return false;
}

function applyContentToEditor(content: string, shortDescription?: string) {
  // Gutenberg block editor
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const wpAny = window.wp as any;
  const editor = wpAny?.data?.dispatch?.('core/editor');
  if (editor?.editPost) {
    const updates: Record<string, string> = { content };
    if (shortDescription) updates.excerpt = shortDescription;
    editor.editPost(updates);
    return;
  }

  // TinyMCE classic editor — WooCommerce has "content" (long) and "excerpt" (short)
  setTinyMCEContent('content', content);
  if (shortDescription) {
    setTinyMCEContent('excerpt', shortDescription);
  }
}

const POLL_INTERVAL = 2000;

export function ProductMetaboxApp() {
  const { t } = useTranslation();
  const bootstrap = getWpBootstrap();
  const client = useMemo(() => {
    if (!bootstrap) {
      return null;
    }
    return axios.create({
      baseURL: bootstrap.restUrl,
      headers: getWpAxiosHeaders(bootstrap),
    });
  }, [bootstrap]);

  const productId = bootstrap?.productId ?? Number((document.getElementById('xc-scribe-product-root')?.dataset.productId ?? 0) as number);

  const wpLang = resolveLanguage(window.XcScribeAdmin?.locale ?? 'en_US');
  const [language, setLanguage] = useState(
    LANGUAGES.some(l => l.code === wpLang) ? wpLang : 'en'
  );
  const [tone, setTone] = useState('professional');
  const [customInstructions, setCustomInstructions] = useState('');

  const [state, setState] = useState<'idle' | 'loading' | 'done' | 'error'>('idle');
  const [result, setResult] = useState<XcProxyResponse<PluginGeneration> | null>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const stopPolling = useCallback(() => {
    if (pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }
  }, []);

  useEffect(() => stopPolling, [stopPolling]);

  const pollStatus = useCallback(async (generationId: string) => {
    if (!client) return;
    try {
      const { data } = await client.get<XcProxyResponse<GenerationStatus>>(
        `/generation/${generationId}/status`
      );

      if (!data.ok || !data.data) {
        stopPolling();
        setState('error');
        setResult({ ok: false, status: data.status, error: data.error || t('metabox.generationFailed'), data: null, raw: null });
        return;
      }

      const gen = data.data;
      if (gen.status === 'completed' && gen.content) {
        stopPolling();
        applyContentToEditor(gen.content, gen.short_description);
        setState('done');
        setResult({
          ok: true,
          status: 200,
          data: {
            content: gen.content,
            short_description: gen.short_description,
            tokens_used: gen.tokens_used ?? 0,
            xct_cost: gen.xct_cost ?? '0',
            remaining_balance: gen.remaining_balance ?? '0',
          },
          raw: null,
        });
      } else if (gen.status === 'failed') {
        stopPolling();
        setState('error');
        setResult({ ok: false, status: 500, error: gen.error || t('metabox.generationFailed'), data: null, raw: null });
      }
      // else still processing — keep polling
    } catch {
      stopPolling();
      setState('error');
      setResult({ ok: false, status: 0, error: t('metabox.generationFailed'), data: null, raw: null });
    }
  }, [client, stopPolling, t]);

  const onGenerate = useCallback(async () => {
    if (!client) return;
    if (!productId || Number.isNaN(productId)) {
      setState('error');
      setResult({ ok: false, status: 0, error: t('metabox.missingProductId'), data: null, raw: null });
      return;
    }

    setState('loading');
    setResult(null);
    stopPolling();

    try {
      // Try async endpoint first
      const { data } = await client.post<XcProxyResponse<{ generation_id: string }>>('/generate-description-async', {
        product_id: productId,
        language,
        tone,
        custom_instructions: customInstructions || null,
      });

      if (data.ok && data.data?.generation_id) {
        // Start polling
        const gid = data.data.generation_id;
        pollRef.current = setInterval(() => pollStatus(gid), POLL_INTERVAL);
        return;
      }
      // Async endpoint not available or failed — fall through to sync
    } catch {
      // Async request failed — fall through to sync
    }

    // Fallback to sync endpoint
    try {
      const { data } = await client.post<XcProxyResponse<PluginGeneration>>('/generate-description', {
        product_id: productId,
        language,
        tone,
        custom_instructions: customInstructions || null,
      });
      setResult(data);
      setState(data.ok ? 'done' : 'error');

      if (data.ok && data.data?.content) {
        applyContentToEditor(data.data.content, data.data.short_description);
      }
    } catch (err) {
      setState('error');
      setResult({
        ok: false,
        status: 0,
        error: err instanceof Error ? err.message : t('metabox.generationFailed'),
        data: null,
        raw: null,
      });
    }
  }, [client, productId, language, tone, customInstructions, stopPolling, pollStatus, t]);

  if (!bootstrap || bootstrap.page !== 'product') {
    return null;
  }

  return (
    <div>
      <p className="description">{t('metabox.description')}</p>

      <p>
        <label htmlFor="xcLang">
          <strong>{t('metabox.language')}</strong>
        </label>
        <select id="xcLang" className="widefat" value={language} onChange={(e) => setLanguage(e.target.value)} disabled={state === 'loading'}>
          {LANGUAGES.map((l) => (
            <option key={l.code} value={l.code}>{l.name}</option>
          ))}
        </select>
      </p>

      <p>
        <label htmlFor="xcTone">
          <strong>{t('metabox.tone')}</strong>
        </label>
        <select id="xcTone" className="widefat" value={tone} onChange={(e) => setTone(e.target.value)} disabled={state === 'loading'}>
          {TONES.map((tn) => (
            <option key={tn.id} value={tn.id}>{t(`tone.${tn.id}`)}</option>
          ))}
        </select>
      </p>

      <p>
        <label htmlFor="xcInstructions">
          <strong>{t('metabox.customInstructions')}</strong>
        </label>
        <textarea
          id="xcInstructions"
          className="widefat"
          rows={3}
          value={customInstructions}
          onChange={(e) => setCustomInstructions(e.target.value)}
          placeholder={t('metabox.customInstructionsPlaceholder')}
          disabled={state === 'loading'}
        />
      </p>

      <p>
        <button type="button" className="button button-primary" onClick={onGenerate} disabled={state === 'loading'}>
          {state === 'loading' ? (
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
              <span className="spinner is-active" style={{ margin: 0, float: 'none' }} />
              {t('metabox.generating')}
            </span>
          ) : t('metabox.generate')}
        </button>
      </p>

      {result && !result.ok && result.status === 402 && (
        <div className="notice notice-error inline">
          <p>
            <strong>{t('metabox.insufficientBalance')}</strong>{' '}
            <button type="button" className="button button-secondary button-small" onClick={openUpgradePage}>
              {t('metabox.upgradeTopUp')}
            </button>
          </p>
        </div>
      )}

      {result && result.status !== 402 && (
        <div className={result.ok ? 'notice notice-success inline' : 'notice notice-error inline'}>
          <p>{result.ok ? t('metabox.success') : result.error || t('metabox.requestFailed')}</p>
          {result.ok && result.data && (
            <p className="description">
              {t('metabox.stats', { tokens: result.data.tokens_used, cost: result.data.xct_cost, remaining: result.data.remaining_balance })}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
