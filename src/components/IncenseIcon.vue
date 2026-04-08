<template>
  <svg
    class="incense-icon"
    viewBox="0 0 24 26"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <!-- 香的根数根据 count 决定 -->
    <!-- 第一柱香 -->
    <line x1="6" y1="18" x2="6" y2="5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
    <circle cx="6" cy="4" r="1" fill="currentColor" opacity="0.6" />

    <!-- 第二柱香 -->
    <line v-if="count >= 2" x1="12" y1="18" x2="12" y2="3" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
    <circle v-if="count >= 2" cx="12" cy="2" r="1" fill="currentColor" opacity="0.6" />

    <!-- 第三柱香 -->
    <line v-if="count >= 3" x1="18" y1="18" x2="18" y2="5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
    <circle v-if="count >= 3" cx="18" cy="4" r="1" fill="currentColor" opacity="0.6" />

    <!-- 烟雾效果 -->
    <path v-if="count >= 1" d="M5.5 3 C5.5 3 4.5 1 5.5 -1" stroke="currentColor" stroke-width="0.8" fill="none" opacity="0.3" stroke-linecap="round" />
    <path v-if="count >= 2" d="M11.5 1 C11.5 1 10.5 -1 11.5 -3" stroke="currentColor" stroke-width="0.8" fill="none" opacity="0.3" stroke-linecap="round" />
    <path v-if="count >= 3" d="M17.5 3 C17.5 3 16.5 1 17.5 -1" stroke="currentColor" stroke-width="0.8" fill="none" opacity="0.3" stroke-linecap="round" />

    <!-- 香炉底座（居中显示） -->
    <rect x="2" y="20" width="20" height="2" rx="1" fill="currentColor" opacity="0.3" />
    <rect x="4" y="18" width="16" height="2" rx="1" fill="currentColor" opacity="0.4" />
  </svg>
</template>

<script setup lang="ts">
interface Props {
  count?: 1 | 2 | 3
}

withDefaults(defineProps<Props>(), {
  count: 1
})
</script>

<style scoped>
.incense-icon {
  width: 100%;
  height: 100%;
  color: currentColor;
}
</style>
