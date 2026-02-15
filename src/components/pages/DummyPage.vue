<script setup lang="ts">
import { provide, ref, watch } from 'vue';
import Page from '../ResourcePage.vue';
import ResourceOption from '../ResourceOption.vue';
import ResourceOutput from '../ResourceOutput.vue';

const props = defineProps<{
  resource: Resource;
}>();

const resource = props.resource;
provide('id', resource.id);

resource.placeholder = 'Unnamed resource';
const values = ref<Record<string, string>>({ name: '' });

watch(
  () => values.value.name,
  (val?: string) => {
    if (typeof val === 'string') resource.name = val;
  },
);
</script>

<template>
  <Page :resource="resource" :tabs="{ general: 'General' }">
    <template #tab-general>
      <fieldset>
        <ResourceOption option="name" name="Name" v-model="values.name">
          <template #description>Short description</template>
          <template #info>Longer paragraph of information</template>
        </ResourceOption>
        <ResourceOption option="number" name="Number" pattern="\d">
          <template #invalid>Not a number</template>
        </ResourceOption>
      </fieldset>
    </template>
    <template #output>
      <ResourceOutput :types="{}" v-model="values"></ResourceOutput>
    </template>
  </Page>
</template>
