<template>
  <svg
    class="bagua-full-icon"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <!-- 外圈圆形 -->
    <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="1.2" fill="none"/>
    
    <!-- 太极图 -->
    <circle cx="12" cy="12" r="7" fill="currentColor" fill-opacity="0.15"/>
    <path d="M12 5C12 5 8 9 8 12C8 15 12 19 12 19" stroke="currentColor" stroke-width="1" fill="currentColor" fill-opacity="0.3"/>
    <circle cx="12" cy="8.5" r="1" fill="currentColor"/>
    <circle cx="12" cy="15.5" r="1" fill="currentColor" fill-opacity="0.2"/>
    
    <!-- 八卦线条 - 先天八卦 -->
    <!-- 乾 (上) -->
    <line x1="9" y1="2.5" x2="15" y2="2.5" stroke="currentColor" stroke-width="0.8" stroke-linecap="round"/>
    <line x1="9" y1="3.3" x2="15" y2="3.3" stroke="currentColor" stroke-width="0.8" stroke-linecap="round"/>
    <line x1="9" y1="4.1" x2="15" y2="4.1" stroke="currentColor" stroke-width="0.8" stroke-linecap="round"/>
    
    <!-- 坤 (下) -->
    <line x1="9" y1="19.9" x2="12" y2="19.9" stroke="currentColor" stroke-width="0.8" stroke-linecap="round"/>
    <line x1="13" y1="19.9" x2="15" y2="19.9" stroke="currentColor" stroke-width="0.8" stroke-linecap="round"/>
    <line x1="9" y1="20.7" x2="12" y2="20.7" stroke="currentColor" stroke-width="0.8" stroke-linecap="round"/>
    <line x1="13" y1="20.7" x2="15" y2="20.7" stroke="currentColor" stroke-width="0.8" stroke-linecap="round"/>
    <line x1="9" y1="21.5" x2="12" y2="21.5" stroke="currentColor" stroke-width="0.8" stroke-linecap="round"/>
    <line x1="13" y1="21.5" x2="15" y2="21.5" stroke="currentColor" stroke-width="0.8" stroke-linecap="round"/>
  </svg>
</template>

<script setup lang="ts">
</script>

<style scoped>
.bagua-full-icon {
  width: 100%;
  height: 100%;
  color: currentColor;
}
</style>
