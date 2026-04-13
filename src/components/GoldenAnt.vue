<template>
  <svg :class="['golden-ant', directionClass]" viewBox="0 0 120 80" fill="none" xmlns="http://www.w3.org/2000/svg">
    <!-- 腿部（在身体下方，先绘制） -->
    <g class="ant-legs">
      <!-- 前腿 -->
      <g class="ant-leg ant-leg-fl">
        <path d="M42 42 L36 28 L30 22" stroke="#D97706" stroke-width="2.5" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M42 42 L38 55 L34 62" stroke="#D97706" stroke-width="2.5" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
      </g>
      <!-- 中腿 -->
      <g class="ant-leg ant-leg-ml">
        <path d="M62 44 L56 30 L50 24" stroke="#D97706" stroke-width="2.5" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M62 44 L58 57 L54 64" stroke="#D97706" stroke-width="2.5" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
      </g>
      <!-- 后腿 -->
      <g class="ant-leg ant-leg-bl">
        <path d="M82 44 L76 30 L70 24" stroke="#D97706" stroke-width="2.5" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M82 44 L78 57 L74 64" stroke="#D97706" stroke-width="2.5" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
      </g>
    </g>

    <!-- 触角（在头部上方，先绘制） -->
    <g class="ant-antennae">
      <path d="M22 32 C18 20, 10 12, 4 8" stroke="#B45309" stroke-width="2" fill="none" stroke-linecap="round" class="antenna-l"/>
      <path d="M26 30 C24 18, 18 8, 14 2" stroke="#B45309" stroke-width="2" fill="none" stroke-linecap="round" class="antenna-r"/>
      <!-- 触角末端发光小球 -->
      <circle cx="4" cy="8" r="2.5" fill="#FCD34D" class="antenna-ball"/>
      <circle cx="14" cy="2" r="2.5" fill="#FCD34D" class="antenna-ball"/>
    </g>

    <!-- 身体三段式 -->
    <!-- 腹部（最后面） -->
    <ellipse cx="88" cy="44" rx="22" ry="16" fill="url(#abdomenGrad)" class="ant-abdomen"/>
    <!-- 腹部高光 -->
    <ellipse cx="82" cy="38" rx="10" ry="8" fill="#FDE68A" opacity="0.5"/>
    <!-- 腹部纹理 -->
    <path d="M78 38 C82 36, 94 36, 98 38" stroke="#FCD34D" stroke-width="1.5" fill="none" opacity="0.7"/>
    <path d="M76 44 C82 42, 94 42, 100 44" stroke="#FCD34D" stroke-width="1.5" fill="none" opacity="0.7"/>
    <path d="M78 50 C82 52, 94 52, 98 50" stroke="#FCD34D" stroke-width="1.5" fill="none" opacity="0.7"/>

    <!-- 腰部连接 -->
    <rect x="58" y="40" width="12" height="6" rx="3" fill="#B45309"/>

    <!-- 胸部 -->
    <ellipse cx="56" cy="44" rx="14" ry="12" fill="url(#thoraxGrad)" class="ant-thorax"/>
    <!-- 胸部高光 -->
    <ellipse cx="52" cy="38" rx="6" ry="5" fill="#FDE68A" opacity="0.5"/>

    <!-- 颈部连接 -->
    <rect x="36" y="40" width="10" height="7" rx="3.5" fill="#D97706"/>

    <!-- 头部 -->
    <ellipse cx="26" cy="44" rx="14" ry="11" fill="url(#headGrad)" class="ant-head"/>
    <!-- 头部高光 -->
    <ellipse cx="22" cy="39" rx="5" ry="4" fill="#FDE68A" opacity="0.6"/>

    <!-- 眼睛 -->
    <circle cx="20" cy="42" r="3.5" fill="#1F2937"/>
    <circle cx="21" cy="41" r="1.5" fill="white"/>
    <circle cx="30" cy="42" r="3.5" fill="#1F2937"/>
    <circle cx="31" cy="41" r="1.5" fill="white"/>

    <!-- 大颚 -->
    <path d="M12 46 C8 48, 6 52, 8 54" stroke="#92400E" stroke-width="2" fill="none" stroke-linecap="round" class="mandible-l"/>
    <path d="M14 46 C10 48, 8 52, 10 54" stroke="#92400E" stroke-width="2" fill="none" stroke-linecap="round" class="mandible-r"/>

    <!-- 渐变定义 -->
    <defs>
      <radialGradient id="headGrad" cx="0.4" cy="0.3">
        <stop offset="0%" stop-color="#FDE68A"/>
        <stop offset="40%" stop-color="#F59E0B"/>
        <stop offset="100%" stop-color="#B45309"/>
      </radialGradient>
      <radialGradient id="thoraxGrad" cx="0.4" cy="0.3">
        <stop offset="0%" stop-color="#FDE68A"/>
        <stop offset="40%" stop-color="#D97706"/>
        <stop offset="100%" stop-color="#92400E"/>
      </radialGradient>
      <radialGradient id="abdomenGrad" cx="0.35" cy="0.3">
        <stop offset="0%" stop-color="#FDE68A"/>
        <stop offset="30%" stop-color="#F59E0B"/>
        <stop offset="70%" stop-color="#B45309"/>
        <stop offset="100%" stop-color="#78350F"/>
      </radialGradient>
    </defs>
  </svg>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  direction?: 'left' | 'right'
}

const props = withDefaults(defineProps<Props>(), {
  direction: 'left'
})

const directionClass = computed(() => props.direction === 'right' ? 'ant--facing-right' : 'ant--facing-left')
</script>

<style scoped>
.golden-ant {
  width: 72px;
  height: 48px;
  filter: drop-shadow(0 3px 6px rgba(180, 83, 9, 0.5));
}

.ant--facing-right {
  transform: scaleX(-1);
}

/* 爬行时身体上下摇摆 */
.ant-abdomen,
.ant-thorax,
.ant-head {
  animation: ant-body-bounce 0.35s ease-in-out infinite;
}

@keyframes ant-body-bounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-1.5px); }
}

/* 触角摆动 */
.ant-antennae {
  transform-origin: 24px 30px;
  animation: antennae-wave 0.5s ease-in-out infinite alternate;
}

@keyframes antennae-wave {
  0% { transform: rotate(-6deg); }
  100% { transform: rotate(6deg); }
}

/* 触角小球闪烁 */
.antenna-ball {
  animation: ball-glow 0.8s ease-in-out infinite alternate;
}

@keyframes ball-glow {
  0% { opacity: 0.5; filter: brightness(0.8); }
  100% { opacity: 1; filter: brightness(1.2); }
}

/* 大颚开合 */
.mandible-l {
  transform-origin: 12px 46px;
  animation: mandible-l-chomp 0.6s ease-in-out infinite;
}

.mandible-r {
  transform-origin: 14px 46px;
  animation: mandible-r-chomp 0.6s ease-in-out infinite;
}

@keyframes mandible-l-chomp {
  0%, 100% { transform: rotate(0deg); }
  50% { transform: rotate(-8deg); }
}

@keyframes mandible-r-chomp {
  0%, 100% { transform: rotate(0deg); }
  50% { transform: rotate(8deg); }
}

/* 腿部交替爬行 */
.ant-leg-fl {
  transform-origin: 42px 42px;
  animation: leg-fl 0.3s ease-in-out infinite alternate;
}

@keyframes leg-fl {
  0% { transform: rotate(-4deg); }
  100% { transform: rotate(4deg); }
}

.ant-leg-ml {
  transform-origin: 62px 44px;
  animation: leg-ml 0.3s ease-in-out infinite alternate;
  animation-delay: 0.15s;
}

@keyframes leg-ml {
  0% { transform: rotate(4deg); }
  100% { transform: rotate(-4deg); }
}

.ant-leg-bl {
  transform-origin: 82px 44px;
  animation: leg-bl 0.3s ease-in-out infinite alternate;
}

@keyframes leg-bl {
  0% { transform: rotate(-4deg); }
  100% { transform: rotate(4deg); }
}
</style>
