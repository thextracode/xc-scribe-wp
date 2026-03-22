import { useCallback, useEffect, useRef, useState } from 'react';
import { AxiosInstance } from 'axios';
import { useTranslation } from 'react-i18next';

import { resolveLanguage } from '../i18n/i18n';
import { openUpgradePage } from './wp';
import { LANGUAGES, TONES } from './types';
import type { DraftPostData, GenerationStartData, GenerationStatus, XcProxyResponse } from './types';

type BlogGeneratorTabProps = {
  client: AxiosInstance;
  onBalanceUpdate: (newBalance: string) => void;
  onActivityAdd: (entry: { type: 'blog'; title: string; xct_cost: string; edit_url: string | null }) => void;
};

type BlogState = 'idle' | 'submitting' | 'generating' | 'creating-draft' | 'done' | 'error';

export function BlogGeneratorTab({ client, onBalanceUpdate, onActivityAdd }: BlogGeneratorTabProps) {
  const { t } = useTranslation();
  const [topic, setTopic] = useState('');
  const wpLang = resolveLanguage(window.XcScribeAdmin?.locale ?? 'en_US');
  const [language, setLanguage] = useState(
    LANGUAGES.some(l => l.code === wpLang) ? wpLang : 'en'
  );
  const [tone, setTone] = useState('professional');
  const [customInstructions, setCustomInstructions] = useState('');

  const [state, setState] = useState<BlogState>('idle');
  const [error, setError] = useState<string | null>(null);
  const [errorStatus, setErrorStatus] = useState<number>(0);
  const [draftResult, setDraftResult] = useState<{ editUrl: string | null; xctCost: string; remaining: string; tokens: number } | null>(null);

  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const generationIdRef = useRef<string | null>(null);

  const stopPolling = useCallback(() => {
    if (pollingRef.current) {
      clearInterval(pollingRef.current);
      pollingRef.current = null;
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => stopPolling, [stopPolling]);

  async function onGenerate() {
    if (!topic.trim()) {
      setState('error');
      setError(t('blog.topicRequired'));
      setErrorStatus(400);
      return;
    }

    setState('submitting');
    setError(null);
    setDraftResult(null);

    try {
      // 1. Start async generation
      const { data } = await client.post<XcProxyResponse<GenerationStartData>>('/generate-blog-draft', {
        topic: topic.trim(),
        language,
        tone,
        custom_instructions: customInstructions || null,
      });

      if (!data.ok || !data.data?.generation_id) {
        setState('error');
        setError(data.error || t('blog.startFailed'));
        setErrorStatus(data.status || 0);
        return;
      }

      const genId = data.data.generation_id;
      generationIdRef.current = genId;
      setState('generating');

      // 2. Poll for status
      pollingRef.current = setInterval(async () => {
        try {
          const { data: statusData } = await client.get<XcProxyResponse<GenerationStatus>>('/generation-status', {
            params: { id: genId },
          });

          if (!statusData.ok) {
            stopPolling();
            setState('error');
            setError(statusData.error || t('blog.statusFailed'));
            setErrorStatus(statusData.status || 0);
            return;
          }

          const gen = statusData.data;
          if (!gen) return;

          if (gen.status === 'completed') {
            stopPolling();

            // 3. Create WP draft post
            setState('creating-draft');
            const { data: draftData } = await client.post<XcProxyResponse<DraftPostData>>('/create-draft-post', {
              title: topic.trim(),
              content: gen.content || '',
            });

            const editUrl = draftData.ok && draftData.data ? draftData.data.edit_url : null;

            setDraftResult({
              editUrl,
              xctCost: gen.xct_cost || '0',
              remaining: gen.remaining_balance || '0',
              tokens: gen.tokens_used || 0,
            });

            if (gen.remaining_balance) {
              onBalanceUpdate(gen.remaining_balance);
            }
            onActivityAdd({
              type: 'blog',
              title: topic.trim(),
              xct_cost: gen.xct_cost || '0',
              edit_url: editUrl,
            });

            setState('done');
          } else if (gen.status === 'failed') {
            stopPolling();
            setState('error');
            setError(gen.error || t('blog.generationFailed'));
            setErrorStatus(500);
          }
          // "processing" → keep polling
        } catch {
          stopPolling();
          setState('error');
          setError(t('blog.lostConnection'));
          setErrorStatus(0);
        }
      }, 3000);

    } catch {
      setState('error');
      setError(t('blog.couldNotStart'));
      setErrorStatus(0);
    }
  }

  const isWorking = state === 'submitting' || state === 'generating' || state === 'creating-draft';
  const statusLabel =
    state === 'submitting' ? t('blog.starting') :
    state === 'generating' ? t('blog.generating') :
    state === 'creating-draft' ? t('blog.creatingDraft') : '';

  return (
    <div className="xc-blog-form">
      <div className="xc-card">
        <div className="xc-form-group">
          <label htmlFor="xc-topic">{t('blog.topic')}</label>
          <input
            id="xc-topic"
            className="xc-input"
            style={{ maxWidth: '100%' }}
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder={t('blog.topicPlaceholder')}
            disabled={isWorking}
          />
        </div>

        <div className="xc-blog-form__row">
          <div className="xc-form-group">
            <label htmlFor="xc-language">{t('blog.language')}</label>
            <select
              id="xc-language"
              className="xc-select"
              style={{ width: '100%' }}
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              disabled={isWorking}
            >
              {LANGUAGES.map((l) => (
                <option key={l.code} value={l.code}>{l.name}</option>
              ))}
            </select>
          </div>

          <div className="xc-form-group">
            <label htmlFor="xc-tone">{t('blog.tone')}</label>
            <select
              id="xc-tone"
              className="xc-select"
              style={{ width: '100%' }}
              value={tone}
              onChange={(e) => setTone(e.target.value)}
              disabled={isWorking}
            >
              {TONES.map((tn) => (
                <option key={tn.id} value={tn.id}>{t(`tone.${tn.id}`)}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="xc-form-group">
          <label htmlFor="xc-instructions">{t('blog.customInstructions')} <span style={{ fontWeight: 400, color: 'var(--xc-text-secondary)' }}>{t('blog.customInstructionsOptional')}</span></label>
          <textarea
            id="xc-instructions"
            className="xc-input"
            style={{ maxWidth: '100%' }}
            value={customInstructions}
            onChange={(e) => setCustomInstructions(e.target.value)}
            placeholder={t('blog.customInstructionsPlaceholder')}
            disabled={isWorking}
          />
        </div>

        <div className="xc-actions" style={{ marginTop: 16 }}>
          <button
            type="button"
            className="xc-btn xc-btn--primary"
            onClick={onGenerate}
            disabled={isWorking}
          >
            {isWorking ? (
              <><span className="xc-spinner" /> {statusLabel}</>
            ) : t('blog.generateDraft')}
          </button>
        </div>
      </div>

      {/* Success result */}
      {state === 'done' && draftResult && (
        <div className="xc-result">
          <p className="xc-result__title">{t('blog.draftCreated')}</p>
          <div className="xc-result__meta">
            <span>{t('blog.cost', { cost: draftResult.xctCost })}</span>
            <span>{t('blog.remaining', { remaining: draftResult.remaining })}</span>
            <span>{t('blog.tokens', { tokens: draftResult.tokens })}</span>
          </div>
          {draftResult.editUrl && (
            <a href={draftResult.editUrl} className="xc-result__link">
              {t('blog.editDraft')}
            </a>
          )}
        </div>
      )}

      {/* Insufficient balance */}
      {state === 'error' && errorStatus === 402 && (
        <div className="xc-notice xc-notice--error">
          <strong>{t('blog.insufficientBalance')}</strong>{' '}
          <button type="button" className="xc-btn xc-btn--secondary xc-btn--small" onClick={openUpgradePage}>
            {t('blog.upgradeTopUp')}
          </button>
        </div>
      )}

      {/* Other errors */}
      {state === 'error' && errorStatus !== 402 && (
        <div className="xc-notice xc-notice--error">
          {error || t('blog.requestFailed')}
        </div>
      )}
    </div>
  );
}
