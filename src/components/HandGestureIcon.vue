<template>
  <svg
    class="hand-gesture-icon"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <!-- 临 (Lin): 食指向上 -->
    <template v-if="type === 'lin'">
      <path d="M10 22V12L10 8C10 6 12 4 12 4C12 4 14 6 14 8V12V22H10Z" fill="currentColor" />
      <path d="M10 14C7 14 6 16 6 18C6 20 8 22 10 22" fill="currentColor" />
      <path d="M14 14C17 14 18 16 18 18C18 20 16 22 14 22" fill="currentColor" />
      <path d="M11 4V2" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
    </template>
    
    <!-- 兵 (Bing): 握拳 -->
    <template v-else-if="type === 'bing'">
      <rect x="7" y="10" width="10" height="12" rx="3" fill="currentColor" />
      <path d="M7 14H17" stroke="white" stroke-width="1" stroke-opacity="0.3"/>
      <path d="M7 18H17" stroke="white" stroke-width="1" stroke-opacity="0.3"/>
      <circle cx="12" cy="7" r="3.5" fill="currentColor" />
    </template>
    
    <!-- 斗 (Dou): 剪刀手/V字 -->
    <template v-else-if="type === 'dou'">
      <path d="M10 22L13 8C13 7 12 6 11 6C10 6 9 7 9 8L8 22H10Z" fill="currentColor" />
      <path d="M14 22L11 8C11 7 12 6 13 6C14 6 15 7 15 8L16 22H14Z" fill="currentColor" />
      <path d="M10 16H14" stroke="white" stroke-width="1" stroke-opacity="0.3"/>
    </template>
    
    <!-- 者 (Zhe): 大拇指向上 -->
    <template v-else-if="type === 'zhe'">
      <path d="M9 22V12C9 10 11 8 11 8V4C11 3 12 2 13 2C14 2 15 3 15 4V12V22H9Z" fill="currentColor" />
      <path d="M11 8C9 8 7 10 7 13C7 15 9 17 11 17" fill="currentColor" />
      <path d="M15 8C17 8 17 10 17 13C17 15 15 17 13 17" fill="currentColor" />
      <circle cx="13" cy="3" r="2" fill="currentColor" />
    </template>
    
    <!-- 皆 (Jie): 双手合十 -->
    <template v-else-if="type === 'jie'">
      <path d="M7 22L12 12C12 12 12 6 10 4C8 2 6 4 7 6C8 8 7 12 7 12V22Z" fill="currentColor" />
      <path d="M17 22L12 12C12 12 12 6 14 4C16 2 18 4 17 6C16 8 17 12 17 12V22Z" fill="currentColor" />
      <circle cx="12" cy="3" r="2" fill="currentColor" />
    </template>
    
    <!-- 阵 (Zhen): 手掌向前 -->
    <template v-else-if="type === 'zhen'">
      <path d="M8 22C8 18 8 14 10 12C12 10 14 10 16 12C18 14 18 18 18 22H8Z" fill="currentColor" />
      <path d="M12 4L12 10" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
      <circle cx="12" cy="3" r="1.5" fill="currentColor" />
      <path d="M8 16H18" stroke="white" stroke-width="1" stroke-opacity="0.3"/>
      <path d="M8 19H18" stroke="white" stroke-width="1" stroke-opacity="0.3"/>
    </template>
    
    <!-- 列 (Lie): 双手分开 -->
    <template v-else-if="type === 'lie'">
      <path d="M8 22V14C8 12 10 10 10 8V4H8V22Z" fill="currentColor" />
      <path d="M16 22V14C16 12 14 10 14 8V4H16V22Z" fill="currentColor" />
      <path d="M10 8L14 8" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
    </template>
    
    <!-- 前 (Qian): 手指指引 -->
    <template v-else-if="type === 'qian'">
      <path d="M10 22V10L12 2L14 10V22H10Z" fill="currentColor" />
      <path d="M12 2V0" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
    </template>
    
    <!-- 行 (Xing): 挥手/开放 -->
    <template v-else-if="type === 'xing'">
      <path d="M8 22V12C8 8 16 8 16 12V22H8Z" fill="currentColor" />
      <path d="M8 15H16" stroke="white" stroke-width="1" stroke-opacity="0.3"/>
      <path d="M8 19H16" stroke="white" stroke-width="1" stroke-opacity="0.3"/>
      <path d="M12 8V4" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
      <circle cx="12" cy="3" r="1.5" fill="currentColor" />
    </template>
  </svg>
</template>

<script setup lang="ts">
interface Props {
  type?: 'lin' | 'bing' | 'dou' | 'zhe' | 'jie' | 'zhen' | 'lie' | 'qian' | 'xing'
}

withDefaults(defineProps<Props>(), {
  type: 'lin'
})
</script>

<style scoped>
.hand-gesture-icon {
  width: 100%;
  height: 100%;
  color: currentColor;
}
</style>
