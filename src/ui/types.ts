export type XcProxyResponse<T> = {
  ok: boolean;
  status: number;
  error?: string | null;
  data: T | null;
  raw: string | null;
};

export type PluginStatus = {
  plan_tier?: string;
  total_balance?: string;
  active_integrations?: string[];
};

export type PluginGeneration = {
  content: string;
  tokens_used: number;
  xct_cost: string;
  remaining_balance: string;
};

export type BlogDraftData = {
  post_id: number;
  edit_url: string | null;
  generation: {
    ok: boolean;
    data: PluginGeneration | null;
  } | null;
};

export type ActivityEntry = {
  type: 'blog' | 'product';
  title: string;
  date: string;
  xct_cost: string;
  edit_url: string | null;
};

export type SettingsResponse = {
  api_base_url: string;
  has_api_key: boolean;
};

export type GenerationStartData = {
  generation_id: string;
};

export type GenerationStatus = {
  status: 'processing' | 'completed' | 'failed';
  content?: string;
  tokens_used?: number;
  xct_cost?: string;
  remaining_balance?: string;
  error?: string;
};

export type DraftPostData = {
  post_id: number;
  edit_url: string | null;
};

export const LANGUAGES = [
  { code: 'en', name: 'English' },
  { code: 'bg', name: 'Bulgarian' },
  { code: 'bs', name: 'Bosnian' },
  { code: 'cnr', name: 'Montenegrin' },
  { code: 'cs', name: 'Czech' },
  { code: 'da', name: 'Danish' },
  { code: 'de', name: 'German' },
  { code: 'el', name: 'Greek' },
  { code: 'es', name: 'Spanish' },
  { code: 'et', name: 'Estonian' },
  { code: 'fi', name: 'Finnish' },
  { code: 'fr', name: 'French' },
  { code: 'ga', name: 'Irish' },
  { code: 'hr', name: 'Croatian' },
  { code: 'hu', name: 'Hungarian' },
  { code: 'it', name: 'Italian' },
  { code: 'lt', name: 'Lithuanian' },
  { code: 'lv', name: 'Latvian' },
  { code: 'mk', name: 'Macedonian' },
  { code: 'mt', name: 'Maltese' },
  { code: 'nb', name: 'Norwegian' },
  { code: 'nl', name: 'Dutch' },
  { code: 'pl', name: 'Polish' },
  { code: 'pt', name: 'Portuguese' },
  { code: 'ro', name: 'Romanian' },
  { code: 'ru', name: 'Russian' },
  { code: 'sk', name: 'Slovak' },
  { code: 'sl', name: 'Slovenian' },
  { code: 'sr-Cyrl', name: 'Serbian (Cyrillic)' },
  { code: 'sr-Latn', name: 'Serbian (Latin)' },
  { code: 'sv', name: 'Swedish' },
] as const;

export const TONES = [
  { id: 'modern', name: 'Modern' },
  { id: 'professional', name: 'Professional' },
  { id: 'luxury', name: 'Luxury' },
  { id: 'casual', name: 'Casual' },
  { id: 'playful', name: 'Playful' },
  { id: 'minimalist', name: 'Minimalist' },
] as const;
