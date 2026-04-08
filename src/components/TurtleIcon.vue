<template>
  <svg
    class="turtle-icon"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <!-- 龟壳 -->
    <ellipse cx="12" cy="14" rx="7" ry="6" stroke="currentColor" stroke-width="1.5" fill="none" />
    
    <!-- 龟壳纹路 -->
    <path d="M12 8 C12 8 9 11 9 14 C9 17 12 20 12 20 C12 20 15 17 15 14 C15 11 12 8 12 8Z" stroke="currentColor" stroke-width="1" fill="none" />
    <line x1="9" y1="12" x2="15" y2="12" stroke="currentColor" stroke-width="1" stroke-linecap="round" />
    <line x1="12" y1="8" x2="12" y2="20" stroke="currentColor" stroke-width="1" stroke-linecap="round" />
    
    <!-- 头部 -->
    <circle cx="12" cy="6" r="2.5" stroke="currentColor" stroke-width="1.5" fill="currentColor" fill-opacity="0.3" />
    
    <!-- 眼睛 -->
    <circle cx="11" cy="5.5" r="0.5" fill="currentColor" />
    <circle cx="13" cy="5.5" r="0.5" fill="currentColor" />
    
    <!-- 四肢 -->
    <ellipse cx="6" cy="11" rx="1.5" ry="2" stroke="currentColor" stroke-width="1.2" fill="currentColor" fill-opacity="0.2" />
    <ellipse cx="18" cy="11" rx="1.5" ry="2" stroke="currentColor" stroke-width="1.2" fill="currentColor" fill-opacity="0.2" />
    <ellipse cx="6" cy="17" rx="1.5" ry="2" stroke="currentColor" stroke-width="1.2" fill="currentColor" fill-opacity="0.2" />
    <ellipse cx="18" cy="17" rx="1.5" ry="2" stroke="currentColor" stroke-width="1.2" fill="currentColor" fill-opacity="0.2" />
    
    <!-- 尾巴 -->
    <path d="M11 20 L12 22 L13 20" stroke="currentColor" stroke-width="1.2" fill="none" stroke-linecap="round" />
  </svg>
</template>

<style scoped>
.turtle-icon {
  width: 100%;
  height: 100%;
  color: currentColor;
}
</style>
