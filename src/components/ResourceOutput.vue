<script setup lang="ts">
const props = defineProps<{
  id: number;
  types: Record<string, string>; // name, display
}>();
</script>

<template>
  <div class="output-section">
    <div class="output-options">
      <label :for="`output-type-${props.id}`">Output type</label>
      <select :id="`output-type-${props.id}`">
        <option :value="value" v-for="[value, name] in Object.entries(types)" :key="value">
          {{ name }}
        </option>
      </select>
    </div>
    <output>
      <pre>
        <slot></slot>
      </pre>
    </output>
  </div>
</template>

<style>
.output-section {
  display: flex;
  flex-direction: column;
}

.output-section > * {
  margin: 10px;
}

.output-options {
  display: flex;
  flex-direction: row;
}

.output-options > * {
  flex: 1;
}

pre {
  white-space: pre-wrap;
}
</style>
