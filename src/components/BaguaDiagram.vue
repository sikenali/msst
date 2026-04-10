<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue'

interface Props {
  theme?: 'ssq' | 'dlt'
  spinning?: boolean
  notes?: number
}

const props = withDefaults(defineProps<Props>(), {
  theme: 'ssq',
  spinning: false,
  notes: 1
})

// Reactive time for Shichen update
const now = ref(new Date())
let timer: number | undefined

onMounted(() => {
  timer = window.setInterval(() => { now.value = new Date() }, 60000)
})

onUnmounted(() => {
  if (timer) clearInterval(timer)
})

const SHICHEN = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥']

function getShichenIndex(date: Date): number {
  const hour = date.getHours()
  // 23:00-00:59 is 子 (0)
  // 01:00-02:59 is 丑 (1)
  // Formula: (hour + 1) / 2
  return Math.floor((hour + 1) / 2) % 12
}

const currentShichen = computed(() => SHICHEN[getShichenIndex(now.value)])

const themeColors = computed(() => ({
  ssq: {
    ring: '#92400E',
    trigram: '#D97706',
    glow: 'rgba(217, 119, 6, 0.12)',
    text: '#92400E',
  },
  dlt: {
    ring: '#92400E',
    trigram: '#1D4ED8',
    glow: 'rgba(59, 130, 246, 0.12)',
    text: '#1E40AF',
  }
}[props.theme]))

const slogan = computed(() => props.theme === 'ssq' ? '🎉 恭喜发财 · 好运连连 🎉' : '🎊 吉星高照 · 鸿运当头 🎊')

const tc = computed(() => themeColors.value)

// 根据注数动态计算旋转时长
const spinDuration = computed(() => {
  const notes = props.notes
  let baseDuration = 0
  let extraPerNote = 0
  const maxDuration = 25

  if (notes <= 5) {
    // 5注及以下：更快一些
    baseDuration = 1.5
    extraPerNote = 0.2
  } else if (notes <= 10) {
    // 6-10注：中等速度
    baseDuration = 6
    extraPerNote = 0.8
  } else {
    // 10注以上：更慢更有仪式感
    baseDuration = 8
    extraPerNote = 1
  }

  let duration = baseDuration + (notes - 1) * extraPerNote

  // 5或10的倍数时增加额外仪式感时间
  if (notes > 0 && notes % 5 === 0) {
    duration += 1
  }

  return Math.min(duration, maxDuration)
})

// 旋转圈数（随注数增加而增加）
const spinRotations = computed(() => {
  const notes = props.notes
  let baseRotations = 0
  let extraPerNote = 0
  const maxRotations = 10

  if (notes <= 5) {
    baseRotations = 1
    extraPerNote = 0.15
  } else if (notes <= 10) {
    baseRotations = 3
    extraPerNote = 0.5
  } else {
    baseRotations = 4
    extraPerNote = 0.6
  }

  let rotations = baseRotations + (notes - 1) * extraPerNote

  // 5或10的倍数时增加额外圈数
  if (notes > 0 && notes % 5 === 0) {
    rotations += 1
  }

  return Math.min(rotations, maxRotations)
})

// Trigrams - 先天八卦顺序：乾、兑、离、震、巽、坎、艮、坤
// lines 数组顺序：[内爻, 中爻, 外爻]，true=阳爻(实线)，false=阴爻(断线)
const trigrams = [
  { name: '乾', angle: 0, lines: [true, true, true] },       // 南(上) ☰ 三连
  { name: '兑', angle: 45, lines: [true, true, false] },     // 东南 ☱ 上缺
  { name: '离', angle: 90, lines: [true, false, true] },     // 东 ☲ 中虚
  { name: '震', angle: 135, lines: [true, false, false] },   // 东北 ☳ 仰盂
  { name: '巽', angle: 180, lines: [false, true, true] },    // 北(下) ☴ 下断
  { name: '坎', angle: 225, lines: [false, true, false] },   // 西南 ☵ 中满
  { name: '艮', angle: 270, lines: [false, false, true] },   // 西 ☶ 覆碗
  { name: '坤', angle: 315, lines: [false, false, false] },  // 西北 ☷ 六断
]
</script>

<template>
  <div class="bagua-container">
    <div
      class="bagua-wrapper"
      :class="{ 'bagua-spinning': spinning }"
      :style="{
        '--spin-duration': spinDuration + 's',
        '--spin-rotations': spinRotations
      }"
    >
      <!-- Glow Background -->
      <div class="bagua-glow" :style="{ background: `radial-gradient(circle, ${tc.glow} 0%, transparent 70%)` }"></div>

      <svg class="bagua-svg" viewBox="0 0 280 280" xmlns="http://www.w3.org/2000/svg" :style="{ '--glow-color': tc.glow }">
        <defs>
          <!-- 圆形裁剪（增大半径防止旋转动画 scale(1.1) 时裁剪卦象线条） -->
          <clipPath id="bagua-clip">
            <circle cx="140" cy="140" r="155" />
          </clipPath>
        </defs>

        <!-- Rotating Inner Group -->
        <g class="bagua-inner" clip-path="url(#bagua-clip)">
          <!-- Taiji Background Circle (Solid Black) -->
          <circle cx="140" cy="140" r="100" fill="#000000" />

          <!-- Taiji White Fish Shape -->
          <path d="M 140 40 A 100 100 0 0 0 140 240 A 50 50 0 0 1 140 140 A 50 50 0 0 0 140 40 Z" fill="#FFFFFF" />

          <!-- Taiji Eyes (Dots) -->
          <!-- 黑色鱼眼（白色区域中） -->
          <circle cx="140" cy="90" r="12" fill="#000000" />
          <!-- 白色鱼眼（黑色区域中） -->
          <circle cx="140" cy="190" r="12" fill="#FFFFFF" />

          <!-- Trigrams - 卦象线条放在太极圆外部 -->
          <g :stroke="tc.trigram" stroke-width="3.5" stroke-linecap="round" fill="none">
            <g v-for="tg in trigrams" :key="tg.name" :transform="`rotate(${tg.angle}, 140, 140)`">
              <!-- 外爻 (最外层，更靠外) -->
              <template v-if="tg.lines[2]">
                <line x1="116" y1="18" x2="164" y2="18" />
              </template>
              <template v-else>
                <line x1="116" y1="18" x2="130" y2="18" />
                <line x1="150" y1="18" x2="164" y2="18" />
              </template>
              <!-- 中爻 (中间层) -->
              <template v-if="tg.lines[1]">
                <line x1="116" y1="26" x2="164" y2="26" />
              </template>
              <template v-else>
                <line x1="116" y1="26" x2="130" y2="26" />
                <line x1="150" y1="26" x2="164" y2="26" />
              </template>
              <!-- 内爻 (最内层，靠近太极圆但不压住，留较大空隙) -->
              <template v-if="tg.lines[0]">
                <line x1="116" y1="34" x2="164" y2="34" />
              </template>
              <template v-else>
                <line x1="116" y1="34" x2="130" y2="34" />
                <line x1="150" y1="34" x2="164" y2="34" />
              </template>
            </g>
          </g>
        </g>
      </svg>
    </div>

    <div class="shichen-tip">
      <span class="shichen-icon">⏰</span>
      <span>当前时辰：{{ currentShichen }}时</span>
    </div>

    <p class="bagua-slogan" :style="{ color: tc.text, opacity: spinning ? '0.5' : '1' }">
      {{ spinning ? '天机不可泄露，推背图推算中...' : slogan }}
    </p>
  </div>
</template>

<style scoped>
.bagua-container {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 32px 24px 24px;
}

.bagua-wrapper {
  position: relative;
  width: 220px;
  height: 220px;
}

.bagua-glow {
  position: absolute;
  inset: 0;
  border-radius: 9999px;
}

.bagua-svg {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  border-radius: 50%;
}

/* Animation for inner part only */
.bagua-inner {
  transition: transform 2s cubic-bezier(0.4, 0, 0.2, 1), filter 2s ease;
  transform-origin: 140px 140px;
}

.bagua-spinning .bagua-inner {
  animation: bagua-spin var(--spin-duration, 8s) cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
}

@keyframes bagua-spin {
  0% { transform: rotate(0deg); filter: drop-shadow(0 0 0px transparent); }
  30% { filter: drop-shadow(0 0 15px var(--glow-color, #F59E0B)); }
  100% { transform: rotate(calc(var(--spin-rotations, 3) * 360deg)) scale(1.1); filter: drop-shadow(0 0 25px var(--glow-color, #F59E0B)); }
}

.bagua-glow {
  animation: bagua-glow-pulse 2s ease-in-out forwards;
}

@keyframes bagua-glow-pulse {
  0% { opacity: 0.3; transform: scale(0.9); }
  50% { opacity: 1; transform: scale(1.2); }
  100% { opacity: 0.8; transform: scale(1.3); }
}

.shichen-tip {
  margin-top: 24px;
  font-size: 13px;
  color: #B45309;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  position: relative;
  z-index: 10;
  background: rgba(255, 251, 235, 0.8);
  padding: 4px 8px;
  border-radius: 12px;
  backdrop-filter: blur(2px);
}

.bagua-slogan {
  font-size: 16px;
  font-weight: 600;
  text-align: center;
  margin-top: 12px;
  font-family: 'SourceHanSans-SemiBold';
  transition: all 0.3s;
}

@media screen and (max-width: 767px) {
  .bagua-container {
    padding: 24px 16px 16px;
  }

  .bagua-wrapper {
    width: 180px;
    height: 180px;
  }
}
</style>
