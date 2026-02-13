<script setup lang="ts">
import ResourcePage from '../ResourcePage.vue';

const props = defineProps<{
  resource: Resource;
}>();
</script>

<template>
  <ResourcePage :resource="props.resource">
    <div style="display: block">
      <p>Add or select a resource in the sidebar to get started.</p>
      <p>
        For more information or filing issues, visit
        <a href="https://github.com/tygoee/congent" style="text-decoration: underline">the GitHub repository</a>
      </p>
    </div>
  </ResourcePage>
</template>
