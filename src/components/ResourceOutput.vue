<script setup lang="ts">
import { onBeforeUnmount, onMounted, useTemplateRef, watch } from 'vue';
import { EditorView, basicSetup } from 'codemirror';
import { Compartment } from '@codemirror/state';
import { isDark } from '@/theme';

const props = defineProps<{
  id: number;
  types: Record<string, string>; // name, display
}>();

const codeMirrorRef = useTemplateRef<HTMLOutputElement>('code-mirror');
let view: EditorView | null = null;

// Used to automatically change theme
const themeCompartment = new Compartment();
const lightTheme = EditorView.theme({}, { dark: false });
const darkTheme = EditorView.theme({}, { dark: true });

onMounted(() => {
  view = new EditorView({
    parent: codeMirrorRef.value!,
    extensions: [basicSetup, themeCompartment.of(isDark.value ? darkTheme : lightTheme)],
  });

  watch(isDark, (val) => view?.dispatch({ effects: themeCompartment.reconfigure(val ? darkTheme : lightTheme) }));
});

onBeforeUnmount(() => {
  view?.destroy();
});
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
    <output ref="code-mirror"></output>
  </div>
</template>

<style>
.output-section {
  display: flex;
  flex-direction: column;

  overflow-y: auto;
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
</style>
