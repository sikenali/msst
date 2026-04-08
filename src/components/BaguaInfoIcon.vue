<template>
  <svg
    class="bagua-info-icon"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <!-- 外圆 -->
    <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="1.5" fill="none" />
    
    <!-- 太极阴阳鱼简化版 -->
    <path d="M12 2 C12 2 6 8 6 12 C6 16 12 22 12 22 C12 22 18 16 18 12 C18 8 12 2 12 2Z" fill="currentColor" opacity="0.3" />
    <circle cx="12" cy="8" r="1.5" fill="currentColor" />
    <circle cx="12" cy="16" r="1.5" fill="currentColor" />
    
    <!-- 八卦线条示意 -->
    <line x1="7" y1="4" x2="17" y2="4" stroke="currentColor" stroke-width="1" stroke-linecap="round" />
    <line x1="7" y1="6" x2="17" y2="6" stroke="currentColor" stroke-width="1" stroke-linecap="round" />
    <line x1="7" y1="8" x2="17" y2="8" stroke="currentColor" stroke-width="1" stroke-linecap="round" />
  </svg>
</template>

<style scoped>
.bagua-info-icon {
  width: 100%;
  height: 100%;
  color: currentColor;
}
</style>
