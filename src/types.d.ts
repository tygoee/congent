import type { PageType } from './components/pages';

declare global {
  type OrhcestratorType = 'podman' | 'docker';

  type Resource = {
    id: number;
    name: string;
    type: PageType;
  };

  type Resources = Record<number, Resource>;
}
