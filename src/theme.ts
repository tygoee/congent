import { ref } from 'vue';

const darkMode = window.matchMedia('(prefers-color-scheme: dark)');
const isDark = ref<boolean>(darkMode.matches);
darkMode.addEventListener('change', (e) => (isDark.value = e.matches));

export { isDark };
