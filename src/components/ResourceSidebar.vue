<script setup lang="ts">
import { ref } from 'vue';
import type { PageType } from './pages';

const props = defineProps<{
  resources: Resource[];
}>();

const selectedPage = defineModel<number>({ required: true });

const orchestrator = ref<OrhcestratorType>();
const selectedResource = ref<PageType>();

const resourceOptions: Record<OrhcestratorType, { type: PageType; label: string }[]> = {
  podman: [{ type: 'podman-container', label: 'Podman container' }],
  docker: [],
};

// The default (home) page is 0, the first normal page starts at 1
let idCount = 0;
function addResource(type?: PageType) {
  if (type === undefined) return;
  const resources = props.resources;

  // The name will get a placeholder and can be changed in the page itself
  resources.push({ id: ++idCount, type: type, name: '' });
}
</script>

<template>
  <aside class="sidebar" aria-label="Resource selection">
    <section>
      <h2 class="sidebar-header">General</h2>
      <form
        class="sidebar-general"
        name="add-resource"
        autocomplete="off"
        @submit.prevent="addResource(selectedResource)"
      >
        <label for="orchestrator">Orchestrator</label>
        <select id="orchestrator" name="orchestrator" v-model="orchestrator">
          <option value="podman" selected>Podman</option>
          <option value="docker" selected>Docker</option>
        </select>
        <label for="resource-select">Resource</label>
        <select id="resource-select" name="resource" v-model="selectedResource">
          <option value="" selected disabled hidden></option>
          <option
            :value="option.type"
            v-for="option in orchestrator ? resourceOptions[orchestrator] : []"
            :key="option.type"
          >
            {{ option.label }}
          </option>
        </select>
        <button type="submit">Add resource</button>
      </form>
    </section>
    <section>
      <h2 class="sidebar-header">Resources</h2>
      <div id="sidebar-list" class="sidebar-list" role="tablist">
        <template v-for="resource in resources" :key="resource.id">
          <button
            :id="`resource-sidebar-${resource.id}`"
            :class="{ selected: resource.id === selectedPage }"
            role="tab"
            :aria-controls="`resource-page-${resource.id}`"
            :aria-selected="resource.id === selectedPage"
            v-if="resource.placeholder"
            @click="selectedPage = resource.id"
          >
            {{ resource.name || resource.placeholder }}
          </button>
        </template>
      </div>
    </section>
  </aside>
</template>

<style>
.sidebar {
  display: grid;
  grid-template-rows: auto 1fr;
  border-right: 2px solid var(--layout-color-secondary);

  background-color: var(--layout-color);
}

/* Duplicate with page */
.sidebar-header {
  font-weight: bold;
}

.sidebar-general {
  margin: 5px 0px;
  display: grid;
  grid-template-columns: auto 1fr;
  align-content: start;
}

.sidebar-general > * {
  margin: 5px 10px;
}

.sidebar-general button,
.sidebar-general select {
  border: 2px solid var(--layout-color-secondary);
}

.sidebar-general button[type='submit'] {
  grid-column: 1 / 3;
}

.sidebar-header {
  display: grid;
  align-items: center;
  padding-left: 10px;
  height: 25px;

  background-color: var(--layout-color-secondary);
}

.sidebar-list {
  display: grid;
  align-content: start;

  overflow-y: auto;
}

.sidebar-list button {
  text-align: left;
  padding-left: 10px;
  height: 25px;
  border: none;
  outline-offset: -3px;

  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>
