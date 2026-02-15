import type { PageType } from './components/pages';

declare global {
  type OrhcestratorType = 'podman' | 'docker';

  type Resource = {
    id: number;
    type: PageType;
    name: string;
    placeholder?: string;
  };
}
