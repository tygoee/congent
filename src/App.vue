<script setup lang="ts">
import { ref } from 'vue';
import { pages } from './components/pages';

import ResourceSidebar from './components/ResourceSidebar.vue';

const resources = ref<Resource[]>([{ id: 0, type: 'default-page', name: 'No resource selected' }]);
const selectedPage = ref<number>(0);
</script>

<template>
  <ResourceSidebar :resources="resources" v-model="selectedPage" />

  <div class="pages">
    <component
      :is="pages[resource.type]"
      :resource="resource"
      v-show="selectedPage === resource.id"
      v-for="resource in resources"
      :key="resource.id"
    ></component>
  </div>
</template>

<style>
#app {
  display: grid;
  grid-template-columns: 300px 1fr;

  font-size: 15px;
  font-family: Arial, Helvetica, sans-serif;
  color: var(--text-color);
  background-color: var(--body-color);

  height: 100vh;
}

h1,
h2 {
  font-size: 15px;
}

a {
  color: inherit;
  text-decoration: inherit;
}

button,
select,
input {
  padding: 1px 4px;

  color: var(--text-color);
  background-color: var(--body-color);
  border: 2px solid var(--layout-color-secondary);
  font-size: 15px;
  font-family: Arial, Helvetica, sans-serif;
}

button:hover,
select:hover {
  background-color: var(--layout-color-secondary);
}
</style>
