import type { Pillar } from './types';

/**
 * The lens also picks which CV the download button serves — five tailored PDFs
 * that already exist become five targeted paths instead of one generic file.
 */
export const cvForPillar: Record<Pillar, { file: string; label: string }> = {
  backend: { file: '/cv/saad-islam-omy-backend.pdf', label: 'Backend CV' },
  platform: { file: '/cv/saad-islam-omy-platform.pdf', label: 'Platform & Go CV' },
  ai: { file: '/cv/saad-islam-omy-ai.pdf', label: 'AI Engineering CV' },
  fullstack: { file: '/cv/saad-islam-omy-fullstack.pdf', label: 'Full-Stack CV' },
};

export const generalCv = { file: '/cv/saad-islam-omy-general.pdf', label: 'General CV' };
