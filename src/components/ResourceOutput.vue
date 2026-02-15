<script setup lang="ts">
import { inject, onBeforeUnmount, onMounted, useTemplateRef, watch } from 'vue';
import { EditorView, basicSetup } from 'codemirror';
import { Compartment } from '@codemirror/state';
import { isDark } from '@/theme';

const props = defineProps<{
  types: Record<string, string>; // name, display
}>();

const values = defineModel<Record<string, string>>({ required: true });
const id = inject<number>('id');

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

  view.dispatch({ changes: { from: 0, to: view.state.doc.length, insert: JSON.stringify(values.value) } });

  watch(isDark, (val) => view?.dispatch({ effects: themeCompartment.reconfigure(val ? darkTheme : lightTheme) }));
  watch(
    values,
    (val) => view?.dispatch({ changes: { from: 0, to: view.state.doc.length, insert: JSON.stringify(val) } }),
    { deep: true },
  );
});

onBeforeUnmount(() => {
  view?.destroy();
});
</script>

<template>
  <div class="output-section">
    <div class="output-options">
      <label :for="`output-type-${id}`">Output type</label>
      <select :id="`output-type-${id}`">
        <option :value="value" v-for="[value, name] in Object.entries(props.types)" :key="value">
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

output {
  height: 100%;
  overflow-y: auto;
}

output > div {
  height: 100%;
}
</style>
