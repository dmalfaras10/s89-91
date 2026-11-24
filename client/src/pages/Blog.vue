<script setup>
import { computed } from 'vue';
import { useGlobalStore } from '../stores/global.js';
import BlogUserView from '../components/BlogUserView.vue';
import BlogAdminView from '../components/BlogAdminView.vue';

const props = defineProps({
  // Optional: 'auto' | 'user' | 'admin'
  mode: {
    type: String,
    default: 'auto'
  }
});

const store = useGlobalStore();

const activeMode = computed(() => {
  if (props.mode === 'admin' || props.mode === 'user') return props.mode;
  return store.user.isAdmin ? 'admin' : 'user';
});
</script>

<template>
  <BlogAdminView v-if="activeMode === 'admin'" />
  <BlogUserView v-else />
</template>