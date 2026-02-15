import DefaultPage from './DefaultPage.vue';
import DummyPage from './DummyPage.vue';
import PodmanContainer from './PodmanContainer.vue';

export const pages = {
  'default-page': DefaultPage,
  'dummy-page': DummyPage,
  'podman-container': PodmanContainer,
};

export type PageType = keyof typeof pages;
