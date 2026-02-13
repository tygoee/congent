<script setup lang="ts">
import Page from '../ResourcePage.vue';
import ResourceOption from '../ResourceOption.vue';
import ResourceOutput from '../ResourceOutput.vue';

const props = defineProps<{
  resource: Resource;
}>();

const id = props.resource.id;
</script>

<template>
  <Page :resource="resource" :tabs="{ general: 'General', networking: 'Networking' }">
    <template #tab-general>
      <fieldset>
        <ResourceOption :id="id" option="name" name="Name">
          <template #info>The container name</template>
          <template #description>The container name is used to reference the container</template>
        </ResourceOption>
        <ResourceOption :id="id" option="image" name="Image / FQIN"></ResourceOption>
      </fieldset>
      <fieldset></fieldset>
    </template>
    <template #tab-networking>Networking</template>
    <template #output>
      <ResourceOutput :id="id" :types="{ quadlet: 'Quadlets' }"></ResourceOutput>
    </template>
  </Page>
</template>
