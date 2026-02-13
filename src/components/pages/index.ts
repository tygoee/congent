import DefaultPage from './DefaultPage.vue';
import PodmanContainer from './PodmanContainer.vue';

export const pages = {
  'default-page': DefaultPage,
  'podman-container': PodmanContainer,
};

export type PageType = keyof typeof pages;
