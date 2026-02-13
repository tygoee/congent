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
  <Page :resource="resource" :tabs="{ general: 'General' }">
    <template #tab-general>
      <fieldset>
        <ResourceOption :id="id" option="name" name="Name">
          <template #info>Short description</template>
          <template #description>Longer paragraph of information</template>
        </ResourceOption>
      </fieldset>
    </template>
    <template #output>
      <ResourceOutput :id="id" :types="{}"></ResourceOutput>
    </template>
  </Page>
</template>
