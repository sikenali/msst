<script setup lang="ts">
interface Props {
  count?: 1 | 2 | 3
}

withDefaults(defineProps<Props>(), {
  count: 1
})
</script>

<template>
  <svg
    class="red-candle-icon"
    :viewBox="`0 0 ${count * 16 + (count - 1) * 6} 24`"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <g v-for="i in count" :key="i" :transform="`translate(${(i - 1) * 22}, 0)`">
      <!-- 火焰 -->
      <path d="M8 3 C8 3 11 0 8 -1 C5 0 8 3 8 3" fill="#F59E0B" />
      <path d="M8 4 C8 4 10 2 8 1 C6 2 8 4 8 4" fill="#F97316" />
      <!-- 烛芯 -->
      <line x1="8" y1="5" x2="8" y2="8" stroke="#4B5563" stroke-width="1.5" stroke-linecap="round" />
      <!-- 烛身 -->
      <rect x="5" y="9" width="6" height="12" rx="1" fill="#DC2626" />
      <!-- 烛身高光 -->
      <rect x="6" y="10" width="1.5" height="10" rx="0.75" fill="rgba(255,255,255,0.3)" />
      <!-- 底座 -->
      <rect x="4" y="20" width="8" height="2" rx="1" fill="#F59E0B" />
    </g>
  </svg>
</template>

<style scoped>
.red-candle-icon {
  width: 100%;
  height: 100%;
}
</style>
