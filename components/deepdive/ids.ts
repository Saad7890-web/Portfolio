import type { StageId } from '@/content/types';

/** Shared between the tablist and the panel it controls — they must agree. */
export const PANEL_ID = 'deep-dive-panel';

export const tabId = (stage: StageId) => `deep-dive-tab-${stage}`;
