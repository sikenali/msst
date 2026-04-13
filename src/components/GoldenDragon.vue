<template>
  <svg :class="['golden-dragon', directionClass]" viewBox="0 0 200 120" fill="none" xmlns="http://www.w3.org/2000/svg">
    <!-- 龙身 - S形曲线 -->
    <path d="M30 65 C35 45, 55 40, 75 50 C95 60, 115 45, 135 55 C155 65, 175 55, 190 60" 
          :stroke="primaryColor" stroke-width="12" fill="none" stroke-linecap="round"/>
    <path d="M30 65 C35 45, 55 40, 75 50 C95 60, 115 45, 135 55 C155 65, 175 55, 190 60" 
          :stroke="secondaryColor" stroke-width="8" fill="none" stroke-linecap="round"/>
    
    <!-- 龙鳞 -->
    <circle cx="50" cy="52" r="5" :fill="scaleColor" opacity="0.6"/>
    <circle cx="70" cy="48" r="5" :fill="scaleColor" opacity="0.6"/>
    <circle cx="90" cy="53" r="5" :fill="scaleColor" opacity="0.6"/>
    <circle cx="110" cy="50" r="5" :fill="scaleColor" opacity="0.6"/>
    <circle cx="130" cy="56" r="5" :fill="scaleColor" opacity="0.6"/>
    <circle cx="150" cy="60" r="5" :fill="scaleColor" opacity="0.6"/>
    <circle cx="170" cy="58" r="5" :fill="scaleColor" opacity="0.6"/>
    
    <!-- 龙脊刺 -->
    <path d="M45 46 L50 35 L55 47" :stroke="spineColor" stroke-width="2.5" fill="none"/>
    <path d="M75 44 L80 33 L85 45" :stroke="spineColor" stroke-width="2.5" fill="none"/>
    <path d="M105 47 L110 36 L115 48" :stroke="spineColor" stroke-width="2.5" fill="none"/>
    <path d="M135 52 L140 41 L145 53" :stroke="spineColor" stroke-width="2.5" fill="none"/>
    <path d="M160 56 L165 45 L170 57" :stroke="spineColor" stroke-width="2.5" fill="none"/>
    
    <!-- 龙尾巴 -->
    <path d="M190 60 C198 52, 205 42, 200 32 C197 42, 193 50, 188 55" :fill="tailColor" class="dragon-tail"/>
    <path d="M190 60 C198 68, 205 78, 200 88 C197 78, 193 70, 188 65" :fill="tailColor" class="dragon-tail"/>
    
    <!-- 龙头 -->
    <g class="dragon-head">
      <!-- 龙角 -->
      <path d="M38 38 C32 22, 22 12, 14 8" :stroke="hornColor" stroke-width="3.5" fill="none" stroke-linecap="round"/>
      <path d="M45 36 C42 18, 36 10, 30 5" :stroke="hornColor" stroke-width="3.5" fill="none" stroke-linecap="round"/>
      <path d="M50 38 C48 24, 44 16, 40 12" :stroke="hornColor" stroke-width="2" fill="none" stroke-linecap="round"/>
      
      <!-- 龙头轮廓 -->
      <path d="M25 58 C18 52, 12 56, 8 62 C12 68, 20 72, 30 68 C36 64, 34 56, 28 52" :fill="headColor"/>
      
      <!-- 龙眼 -->
      <ellipse cx="26" cy="56" rx="6" ry="5" :fill="eyeBgColor"/>
      <circle cx="27" cy="55" r="3" :fill="eyeColor"/>
      <circle cx="28" cy="54" r="1.5" fill="white"/>
      <circle cx="25" cy="57" r="0.8" :fill="eyeHighlightColor"/>
      
      <!-- 龙眉 -->
      <path d="M22 50 C24 48, 28 48, 32 50" :stroke="browColor" stroke-width="1.5" fill="none"/>
      
      <!-- 龙须 -->
      <path d="M10 60 C4 64, -2 60, -5 58" :stroke="whiskerColor" stroke-width="2" fill="none" stroke-linecap="round"/>
      <path d="M12 64 C6 68, 0 64, -3 62" :stroke="whiskerColor" stroke-width="2" fill="none" stroke-linecap="round"/>
      <path d="M14 56 C8 58, 2 56, 0 55" :stroke="whiskerColor" stroke-width="1.5" fill="none" stroke-linecap="round"/>
      
      <!-- 龙嘴 -->
      <path d="M8 62 C12 66, 18 68, 24 66" :stroke="mouthColor" stroke-width="2" fill="none"/>
      <path d="M10 63 C14 67, 19 69, 24 67" :stroke="mouthInnerColor" stroke-width="1.5" fill="none"/>
      
      <!-- 龙牙 -->
      <path d="M12 64 L13 67 L14 64" fill="white"/>
      <path d="M16 65 L17 68 L18 65" fill="white"/>
      <path d="M20 66 L21 69 L22 66" fill="white"/>
      
      <!-- 龙鼻 -->
      <circle cx="18" cy="58" r="1.5" :fill="noseColor"/>
      <circle cx="21" cy="58" r="1.5" :fill="noseColor"/>
      
      <!-- 龙下巴 -->
      <path d="M10 66 C12 70, 18 72, 24 70" :stroke="jawColor" stroke-width="1.5" fill="none"/>
    </g>
    
    <!-- 龙鳍 -->
    <path d="M60 46 C66 32, 72 35, 66 47" :fill="finColor" class="dragon-fin"/>
    <path d="M95 50 C101 36, 107 39, 101 51" :fill="finColor" class="dragon-fin"/>
    <path d="M130 53 C136 39, 142 42, 136 54" :fill="finColor" class="dragon-fin"/>
    <path d="M160 58 C166 44, 172 47, 166 59" :fill="finColor" class="dragon-fin"/>
    
    <!-- 龙爪 -->
    <g class="dragon-claw">
      <path d="M75 50 C68 62, 58 68, 50 72 C54 68, 60 64, 64 60 C58 62, 50 66, 46 70" :stroke="clawColor" stroke-width="2.5" fill="none" stroke-linecap="round"/>
      <path d="M115 50 C108 62, 98 68, 90 72 C94 68, 100 64, 104 60 C98 62, 90 66, 86 70" :stroke="clawColor" stroke-width="2.5" fill="none" stroke-linecap="round"/>
      <path d="M155 58 C148 70, 138 76, 130 80 C134 76, 140 72, 144 68 C138 70, 130 74, 126 78" :stroke="clawColor" stroke-width="2.5" fill="none" stroke-linecap="round"/>
    </g>
  </svg>
</template>

<script setup lang="ts">
interface Props {
  facing?: 'left' | 'right'
}

const props = withDefaults(defineProps<Props>(), {
  facing: 'left'
})

const directionClass = computed(() => props.facing === 'right' ? 'dragon--facing-right' : 'dragon--facing-left')

// 左侧金龙配色
const primaryColor = '#F59E0B'
const secondaryColor = '#D97706'
const scaleColor = '#FCD34D'
const spineColor = '#B45309'
const tailColor = '#F59E0B'
const hornColor = '#92400E'
const headColor = '#F59E0B'
const eyeBgColor = '#1F2937'
const eyeColor = '#000000'
const eyeHighlightColor = '#FCD34D'
const browColor = '#92400E'
const whiskerColor = '#D97706'
const mouthColor = '#92400E'
const mouthInnerColor = '#B45309'
const noseColor = '#92400E'
const jawColor = '#D97706'
const finColor = '#D97706'
const clawColor = '#D97706'
</script>

<style scoped>
.golden-dragon {
  width: 120px;
  height: 72px;
  opacity: 0.9;
  filter: drop-shadow(0 6px 16px rgba(217, 119, 6, 0.7));
}

.dragon--facing-right {
  transform: scaleX(-1);
}

/* 龙身扭动 */
.dragon-body-wave {
  animation: dragon-wiggle 0.6s ease-in-out infinite;
}

@keyframes dragon-wiggle {
  0%, 100% { transform: rotate(0deg); }
  25% { transform: rotate(1.5deg); }
  75% { transform: rotate(-1.5deg); }
}

/* 龙尾巴摆动 */
.dragon-tail {
  transform-origin: 0% 50%;
  animation: dragon-tail-swish 0.3s ease-in-out infinite alternate;
}

@keyframes dragon-tail-swish {
  0% { transform: rotate(-12deg); }
  100% { transform: rotate(12deg); }
}

/* 龙鳍摆动 */
.dragon-fin {
  transform-origin: 50% 100%;
  animation: dragon-fin-flap 0.4s ease-in-out infinite alternate;
}

@keyframes dragon-fin-flap {
  0% { transform: rotate(-6deg); }
  100% { transform: rotate(6deg); }
}

/* 龙头微动 */
.dragon-head {
  animation: dragon-head-bob 0.8s ease-in-out infinite;
}

@keyframes dragon-head-bob {
  0%, 100% { transform: translateX(0); }
  50% { transform: translateX(2px); }
}

/* 龙爪伸缩 */
.dragon-claw {
  transform-origin: center;
  animation: dragon-claw-reach 0.5s ease-in-out infinite alternate;
}

@keyframes dragon-claw-reach {
  0% { transform: scale(0.9); }
  100% { transform: scale(1.1); }
}
</style>
