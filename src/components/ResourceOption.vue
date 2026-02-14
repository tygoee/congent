<script setup lang="ts">
import { ref } from 'vue';

const props = defineProps<{
  id: number;
  option: string;
  name: string;
}>();

const slots = defineSlots<{
  description: never;
  info: never;
}>();

const inputId = `option-${props.option}-${props.id}`;
const showInfo = ref<boolean>(false);
</script>

<template>
  <div class="option">
    <div class="label">
      <label :for="inputId">{{ props.name }}</label>
      <button
        :id="`${inputId}-info-toggle`"
        class="info-toggle"
        type="button"
        aria-label="More information"
        :aria-controls="`${inputId}-info`"
        :aria-expanded="showInfo"
        v-if="slots.info"
        @click="showInfo = !showInfo"
      >
        &#9432;
      </button>
    </div>
    <input :id="inputId" type="text" :aria-describedby="slots.description ? `${inputId}-description` : undefined" />
    <small :id="`${inputId}-description`" class="description" v-if="slots.description">
      <slot name="description"></slot>
    </small>
    <p
      :id="`${inputId}-info`"
      class="info"
      :aria-labelledby="`${inputId}-info-toggle`"
      v-show="showInfo"
      v-if="slots.info"
    >
      <slot name="info"></slot>
    </p>
  </div>
</template>

<style>
.option {
  display: grid;
  grid-template-columns: 1fr 1fr;
  row-gap: 5px;
  margin: 15px 10px;

  button,
  select,
  input {
    align-self: start;
    border: 2px solid var(--body-color-secondary);
  }

  .label {
    display: flex;
    gap: 5px;
  }

  .info-toggle,
  .info-toggle:hover {
    padding: 0 0;
    border: none;
    cursor: pointer;
    background-color: var(--body-color);
  }

  .description {
    color: var(--text-color-dimmed);
    font-style: italic;
  }

  .description,
  .info {
    grid-column: 1 / 3;
  }
}
</style>
