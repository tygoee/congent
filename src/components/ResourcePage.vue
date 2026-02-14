<script setup lang="ts">
import { ref } from 'vue';

const props = defineProps<{
  resource: Resource;
  tabs?: Record<string, string>; // name, displayed name
}>();

defineSlots<{
  default: never;
  output: never;
  [key: `tab-${string}`]: never;
}>();

const resource = props.resource;
const tabs = props.tabs ?? {};
const selectedTab = ref<string | undefined>(Object.keys(tabs)[0]);
</script>

<template>
  <div :id="`resource-page-${resource.id}`" class="resource">
    <form>
      <nav class="navbar" aria-label="Configuration">
        <h1>{{ resource.name }}</h1>
        <div class="tabs" role="tablist" v-if="props.tabs">
          <button
            :id="`resource-navbar-${resource.id}`"
            :class="{ selected: tab === selectedTab }"
            type="button"
            role="tab"
            :aria-controls="`resource-tab-${tab}-${resource.id}`"
            :aria-selected="tab === selectedTab"
            @click="selectedTab = tab"
            v-for="[tab, tabName] in Object.entries(tabs)"
            :key="tab"
          >
            {{ tabName }}
          </button>
        </div>
      </nav>

      <!-- All tab panels are slots with #tab-tabname -->
      <main class="content">
        <slot></slot>
        <div
          :id="`resource-tab-${tab}-${resource.id}`"
          role="tabpanel"
          :aria-labelledby="`resource-navbar-${tab}-${resource.id}`"
          v-show="tab === selectedTab"
          v-for="tab in Object.keys(tabs)"
          :key="tab"
        >
          <slot :name="`tab-${tab}`"></slot>
        </div>
      </main>

      <section class="output">
        <h2 class="sidebar-header">Output</h2>
        <slot name="output"></slot>
      </section>
    </form>
  </div>
</template>

<style>
.resource form {
  display: grid;
  grid-template-areas:
    'navbar output'
    'content output';
  grid-template-rows: 75px 1fr;
  grid-template-columns: 3fr 2fr;
  height: 100vh;
}

.navbar {
  grid-area: navbar;
  display: flex;
  flex-direction: column;

  border-bottom: 2px solid var(--layout-color-secondary);
  background-color: var(--layout-color);
}

.navbar > * {
  flex: 1;
  display: flex;
  flex-direction: row;

  align-items: center;
  gap: 10px;
  padding-left: 20px;
}

.content {
  grid-area: content;
  overflow-y: auto;
}

.content > div {
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding: 20px;

  /* They break at ~330px each */
  @media (min-width: 1500px) {
    flex-direction: row;
  }
}

.content fieldset {
  flex: 1;
  border: 2px solid var(--body-color-secondary);
}

.output {
  grid-area: output;
  display: grid;
  grid-template-rows: auto 1fr;

  background-color: var(--layout-color);
  border-left: 2px solid var(--layout-color-secondary);
}

/* Duplicate with sidebar */
.sidebar-header {
  font-weight: bold;
}
</style>
