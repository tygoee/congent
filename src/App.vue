<script setup lang="ts">
import { ref, reactive } from 'vue';
import { pages } from './components/pages';

import ResourceSidebar from './components/ResourceSidebar.vue';

const resources: Resources = reactive({ 0: { id: 0, name: 'No resource selected', type: 'default-page' } });
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
  font-size: 15px;
  font-family: Arial, Helvetica, sans-serif;
  color: var(--text-color);
  background-color: var(--body-color);

  height: 100vh;
}
</style>
