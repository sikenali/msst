<script setup lang="ts">
import { ref, onMounted, watch, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import html2canvas from 'html2canvas'
import {
  RiMoneyCnyCircleFill,
  RiCheckboxCircleFill,
  RiDownload2Line,
  RiRefreshLine,
  RiCloseLine,
} from '@remixicon/vue'
import RulesCard from '@/components/RulesCard.vue'
import TabSwitcher from '@/components/TabSwitcher.vue'
import NumberBall from '@/components/NumberBall.vue'
import CopperCoinIcon from '@/components/CopperCoinIcon.vue'
import TurtleIcon from '@/components/TurtleIcon.vue'
import BaguaIcon from '@/components/BaguaIcon.vue'
import { generateSSQ, generateDLT, formatTime, getIssueNumber, setIssueNumber, currentIssueNumber } from '@/composables/useLottery'

const router = useRouter()
const route = useRoute()

const lotteryType = ref<'ssq' | 'dlt'>((route.query.type as 'ssq' | 'dlt') || 'ssq')
const notes = ref(Number(route.query.notes) || 1)
const mode = ref((route.query.mode as string) || 'single')

const resultCardRef = ref<HTMLElement | null>(null)
const numbers = ref<any[]>([])
const issueNumber = ref('')
const metaTime = ref('')
const metaMode = ref('')

const modeLabels = {
  single: '单式',
  multiple: '复式',
  dantuo: '胆拖',
}

const showRulesModal = ref(false)

function openRules() {
  showRulesModal.value = true
}

function closeRules() {
  showRulesModal.value = false
}

// 响应式计算
const lotteryName = computed(() => lotteryType.value === 'ssq' ? '双色球' : '大乐透')

// 根据注数动态计算卡片缩放比例
const cardScale = computed(() => {
  const n = notes.value
  if (n <= 5) return 1
  if (n <= 10) return 0.9
  if (n <= 20) return 0.8
  if (n <= 30) return 0.7
  return 0.6
})

function refreshData() {
  const currentMode = mode.value as 'single' | 'multiple' | 'dantuo'
  if (lotteryType.value === 'ssq') {
    numbers.value = generateSSQ(notes.value, currentMode)
  } else {
    numbers.value = generateDLT(notes.value, currentMode)
  }

  issueNumber.value = getIssueNumber(lotteryType.value)
  metaTime.value = `生成时间：${formatTime()}`
  metaMode.value = `注数：${notes.value}注 | 模式：${modeLabels[mode.value as keyof typeof modeLabels]}`
}

onMounted(() => {
  refreshData()
})

// 监听路由参数变化
watch(() => route.query.type, (newType) => {
  if (newType === 'ssq' || newType === 'dlt') {
    lotteryType.value = newType
    refreshData()
  }
})

// 监听选项卡切换：如果切换到不同彩种，跳转到对应主页
watch(lotteryType, (newType) => {
  if (newType !== route.query.type) {
    router.push({ path: '/', query: { type: newType } })
  }
})

async function handleSaveImage() {
  if (!resultCardRef.value) return

  try {
    const canvas = await html2canvas(resultCardRef.value, {
      backgroundColor: '#FEF3C7',
      scale: 2,
    })
    const link = document.createElement('a')
    link.download = `妙手神透-${lotteryName.value}-${Date.now()}.png`
    link.href = canvas.toDataURL('image/png')
    link.click()
  } catch (e) {
    alert('保存图片失败，请长按截图')
  }
}

function handleBack() {
  router.push({ path: '/', query: { type: lotteryType.value, autoGenerate: '1' } })
}
</script>

<template>
  <div class="result-page">
    <!-- 顶部导航栏 -->
    <header class="result-header">
      <div class="header-inner">
        <div class="header-content">
          <div class="logo-area" style="cursor: pointer;" @click="router.push('/')">
            <div class="logo-icon">
              <RiMoneyCnyCircleFill class="logo-svg" />
            </div>
            <div class="logo-spacer"></div>
            <h1 class="logo-text">妙手神透</h1>
          </div>

          <div class="tab-wrapper">
            <TabSwitcher v-model="lotteryType" />
          </div>

          <button class="info-btn" @click="openRules">
            <TurtleIcon class="info-icon" />
          </button>
        </div>
      </div>
    </header>

    <!-- 主内容区 -->
    <main class="result-main">
      <div class="main-inner">
        <!-- 成功提示区 -->
        <div class="success-section">
          <div
            class="success-icon"
            :style="{
              background: lotteryType === 'ssq'
                ? 'linear-gradient(180deg, rgba(239,68,68,1) 0%, rgba(245,158,11,1) 100%)'
                : 'linear-gradient(180deg, rgba(59,130,246,1) 0%, rgba(99,102,241,1) 100%)'
            }"
          >
            <RiCheckboxCircleFill class="success-svg" />
          </div>
          <p class="success-text">
            {{ lotteryType === 'ssq' ? '五行八卦 · 吉时已到 · 必中大奖' : '奇门遁甲 · 神机妙算 · 必得头奖' }}
          </p>
        </div>

        <!-- 号码展示区 -->
        <div class="result-card-wrapper" :style="{ '--card-scale': cardScale }">
          <div class="result-card" ref="resultCardRef">
          <div class="result-card-header">
            <h3 class="result-title">{{ lotteryName }} 第{{ issueNumber }}期</h3>
            <div class="mode-tag" :class="mode">
              {{ mode === 'single' ? '单式投注' : mode === 'multiple' ? '复式投注' : '胆拖投注' }}
            </div>
          </div>

          <!-- 遍历注数展示号码 -->
          <div v-for="(note, index) in numbers" :key="index" class="note-group" :class="{ 
            'note-group--compact': numbers.length >= 5, 
            'note-group--ultra-compact': numbers.length >= 10 
          }">
            <!-- 双色球 -->
            <template v-if="lotteryType === 'ssq'">
              <!-- 红球区域 -->
              <div v-if="note.red" class="number-section">
                <!-- 胆拖模式 -->
                <template v-if="note.type === 'dantuo'">
                  <p class="dantuo-label">红球胆码</p>
                  <div class="balls-group">
                    <template v-for="(num, i) in note.redBanker" :key="`b-${i}`">
                      <NumberBall :number="String(num).padStart(2, '0')" color="red" size="large" class="ball-banker" />
                      <div v-if="Number(i) < (note.redBanker?.length || 0) - 1" class="ball-spacer"></div>
                    </template>
                  </div>
                  <p class="dantuo-label">红球拖码</p>
                  <div class="balls-group">
                    <template v-for="(num, i) in note.redDrag" :key="`d-${i}`">
                      <NumberBall :number="String(num).padStart(2, '0')" color="red" size="large" />
                      <div v-if="Number(i) < (note.redDrag?.length || 0) - 1" class="ball-spacer"></div>
                    </template>
                  </div>
                </template>
                <!-- 单式/复式模式 -->
                <template v-else>
                  <p class="section-title section-title--red">{{ note.type === 'multiple' ? '红球(复式)' : '红球区域' }}</p>
                  <div class="section-spacer"></div>
                  <div class="balls-group">
                    <template v-for="(num, i) in note.red" :key="i">
                      <NumberBall :number="String(num).padStart(2, '0')" color="red" size="large" />
                      <div v-if="Number(i) < note.red.length - 1" class="ball-spacer"></div>
                    </template>
                  </div>
                </template>
              </div>

              <!-- 蓝球区域 -->
              <div v-if="note.blue" class="number-section">
                <p class="section-title section-title--blue">蓝球区域</p>
                <div class="section-spacer"></div>
                <div class="balls-group">
                  <template v-for="(num, i) in note.blue" :key="i">
                    <NumberBall :number="String(num).padStart(2, '0')" color="blue" size="large" />
                    <div v-if="Number(i) < note.blue.length - 1" class="ball-spacer"></div>
                  </template>
                </div>
              </div>
            </template>

            <!-- 大乐透 -->
            <template v-else>
              <!-- 前区 -->
              <div v-if="note.front" class="number-section">
                <!-- 胆拖模式 -->
                <template v-if="note.type === 'dantuo'">
                  <p class="dantuo-label">前区胆码</p>
                  <div class="balls-group">
                    <template v-for="(num, i) in note.frontBanker" :key="`b-${i}`">
                      <NumberBall :number="String(num).padStart(2, '0')" color="red" size="large" class="ball-banker" />
                      <div v-if="Number(i) < (note.frontBanker?.length || 0) - 1" class="ball-spacer"></div>
                    </template>
                  </div>
                  <p class="dantuo-label">前区拖码</p>
                  <div class="balls-group">
                    <template v-for="(num, i) in note.frontDrag" :key="`d-${i}`">
                      <NumberBall :number="String(num).padStart(2, '0')" color="red" size="large" />
                      <div v-if="Number(i) < (note.frontDrag?.length || 0) - 1" class="ball-spacer"></div>
                    </template>
                  </div>
                </template>
                <!-- 单式/复式模式 -->
                <template v-else>
                  <p class="section-title section-title--red">{{ note.type === 'multiple' ? '前区(复式)' : '前区号码' }}</p>
                  <div class="section-spacer"></div>
                  <div class="balls-group">
                    <template v-for="(num, i) in note.front" :key="i">
                      <NumberBall :number="String(num).padStart(2, '0')" color="red" size="large" />
                      <div v-if="Number(i) < note.front.length - 1" class="ball-spacer"></div>
                    </template>
                  </div>
                </template>
              </div>

              <!-- 后区 -->
              <div v-if="note.back" class="number-section">
                <p class="section-title section-title--blue">后区号码</p>
                <div class="section-spacer"></div>
                <div class="balls-group">
                  <template v-for="(num, i) in note.back" :key="i">
                    <NumberBall :number="String(num).padStart(2, '0')" color="blue" size="large" />
                    <div v-if="Number(i) < note.back.length - 1" class="ball-spacer"></div>
                  </template>
                </div>
              </div>
            </template>
          </div>

          <!-- 生成信息 -->
          <div class="meta-section">
            <div class="meta-time">
              <RiInformationLine class="meta-icon" />
              <div class="meta-spacer"></div>
              <span class="meta-text">{{ metaTime }}</span>
            </div>
            <div class="meta-spacer-sm"></div>
            <p class="meta-mode">{{ metaMode }}</p>
          </div>
        </div>

        <!-- 底部操作栏 -->
        </div>

        <div class="action-buttons">
          <button class="action-btn action-btn--save" @click="handleSaveImage">
            <RiDownload2Line class="action-icon" />
            <span class="action-text">普渡众生</span>
            <span class="action-tooltip">保存图片</span>
          </button>
          <button class="action-btn action-btn--back" @click="handleBack">
            <RiRefreshLine class="action-icon" />
            <span class="action-text">{{ lotteryType === 'ssq' ? '和气生财' : '道亦有道' }}</span>
            <span class="action-tooltip">重新生成</span>
          </button>
        </div>
      </div>
    </main>

    <!-- 底部间距 -->
    <div class="bottom-spacer"></div>

    <!-- 底部版权 -->
    <footer class="result-footer">
      <div class="footer-inner">
        <p class="footer-text">
          <span v-if="lotteryType === 'ssq'">一花一世界 · 一叶一菩提</span>
          <span v-else>道生一 一生二 · 二生三 三生万物</span>
        </p>
      </div>
    </footer>

    <!-- 规则弹窗 -->
    <div class="modal-overlay" v-if="showRulesModal" @click="closeRules">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3 class="modal-title">玩法规则说明</h3>
          <div class="modal-tip">
            <TurtleIcon class="modal-tip-icon" />
            <span class="modal-tip-text">温馨提示：理性购彩，量力而行，本工具仅供娱乐使用</span>
          </div>
          <button class="modal-close" @click="closeRules">
            <RiCloseLine class="close-icon" />
          </button>
        </div>
        <div class="modal-divider"></div>
        <div class="modal-body">
          <h4 class="rule-title rule-title--red">🔴 双色球玩法规则</h4>
          <div class="rule-list">
            <div class="rule-item">
              <div class="rule-num rule-num--red">1</div>
              <div class="rule-spacer"></div>
              <p class="rule-text">红球：从1-33中随机选择6个不重复号码，按升序排列</p>
            </div>
            <div class="rule-item">
              <div class="rule-num rule-num--blue">2</div>
              <div class="rule-spacer"></div>
              <p class="rule-text">蓝球：从1-16中随机选择1个号码</p>
            </div>
            <div class="rule-item">
              <div class="rule-num rule-num--gold">3</div>
              <div class="rule-spacer"></div>
              <p class="rule-text">支持单式、自定义注数、复式多种投注模式</p>
            </div>
          </div>
          <div class="modal-divider"></div>
          <h4 class="rule-title rule-title--blue">🔵 大乐透玩法规则</h4>
          <div class="rule-list">
            <div class="rule-item">
              <div class="rule-num rule-num--red">1</div>
              <div class="rule-spacer"></div>
              <p class="rule-text">前区：从1-35中随机选择5个不重复号码，按升序排列</p>
            </div>
            <div class="rule-item">
              <div class="rule-num rule-num--blue">2</div>
              <div class="rule-spacer"></div>
              <p class="rule-text">后区：从1-12中随机选择2个不重复号码</p>
            </div>
            <div class="rule-item">
              <div class="rule-num rule-num--gold">3</div>
              <div class="rule-spacer"></div>
              <p class="rule-text">支持单式、自定义注数、复式多种投注模式</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.result-page {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: linear-gradient(135deg, rgba(254,243,199,1) 0%, rgba(255,251,235,1) 50%, rgba(254,243,199,1) 100%);
}

/* 顶部导航栏 - 悬浮透明背景 */
.result-header {
  width: 100%;
  max-width: 1158px;
  margin: 0 auto;
  background: transparent;
  box-shadow: none;
  padding: 16px 0;
  position: relative;
  z-index: 10;
  box-sizing: border-box;
}

.header-inner {
  padding: 0 24px;
  max-width: 1158px;
  margin: 0 auto;
  width: 100%;
  box-sizing: border-box;
}

.header-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  position: relative;
  padding: 12px 0;
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border-radius: 16px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.06), 0 4px 12px rgba(0,0,0,0.04);
  box-sizing: border-box;
}

.logo-area {
  display: flex;
  align-items: center;
  z-index: 1;
  margin-left: 12px;
}

.logo-icon {
  width: 32px;
  height: 32px;
  border-radius: 9999px;
  background: linear-gradient(180deg, rgba(239,68,68,1) 0%, rgba(245,158,11,1) 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.logo-svg {
  width: 18px;
  height: 24px;
  font-size: 16px;
  color: #FFFFFF;
}

.logo-spacer {
  width: 8px;
  flex-shrink: 0;
}

.logo-text {
  font-size: 18px;
  font-weight: 800;
  line-height: 1.2;
  color: #92400E;
  font-family: 'SourceHanSans-ExtraBold';
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.tab-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  position: absolute;
  left: 0;
  right: 0;
  pointer-events: none;
}

.tab-wrapper > * {
  pointer-events: auto;
}

.info-btn {
  width: 32px;
  height: 32px;
  border-radius: 9999px;
  background: #FEF3C7;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  cursor: pointer;
  padding: 0;
  flex-shrink: 0;
  z-index: 1;
  margin-right: 12px;
}

.info-icon {
  width: 22px;
  height: 22px;
  font-size: 22px;
  color: #B45309;
}

/* 规则弹窗 */
.modal-overlay {
  position: fixed;
  inset: 0;
  z-index: 100;
  display: flex;
  align-items: flex-start;
  justify-content: center;
  background: rgba(0,0,0,0.4);
  padding: 48px 24px 24px 24px;
  overflow-y: auto;
}

.modal-content {
  width: 100%;
  max-width: 672px;
  max-height: 80vh;
  margin: 0 auto;
  overflow-y: auto;
  border-radius: 12px;
  background: rgba(255,255,255,1);
  border: 0.7px solid #FDE68A;
  box-shadow: 0 4px 6px rgba(0,0,0,0.1), 0 10px 15px rgba(0,0,0,0.1);
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 24px 24px 0 24px;
}

.modal-title {
  font-size: 20px;
  font-weight: 700;
  line-height: 1.2;
  color: #92400E;
  font-family: 'SourceHanSans-Bold';
  margin: 0;
}

.modal-tip {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px 12px;
  background: #FEF3C7;
  border-radius: 12px;
}

.modal-tip-icon {
  width: 20px;
  height: 20px;
  color: #D97706;
}

.modal-tip-text {
  font-size: 13px;
  font-weight: 500;
  color: #92400E;
  font-family: 'SourceHanSans-Medium';
  white-space: nowrap;
}

.modal-close {
  width: 32px;
  height: 32px;
  border-radius: 9999px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  cursor: pointer;
  padding: 0;
  background: transparent;
}

.close-icon {
  width: 20px;
  height: 20px;
  color: #92400E;
}

.modal-divider {
  margin: 16px 24px 0 24px;
  height: 1px;
  background: #FDE68A;
}

.modal-body {
  padding: 24px 24px 24px 24px;
}

.rule-title {
  font-size: 18px;
  font-weight: 700;
  line-height: 1.2;
  margin: 0 0 16px 0;
}

.rule-title::first-letter {
  font-size: 20px;
  filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.1));
}

.rule-title--red {
  color: #DC2626;
  font-family: 'SourceHanSans-Bold';
}

.rule-title--blue {
  color: #3B82F6;
  font-family: 'SourceHanSans-Bold';
  margin-top: 16px;
}

.rule-list {
  padding: 0 0 0 12px;
}

.rule-item {
  display: flex;
  align-items: flex-start;
  margin-bottom: 12px;
}

.rule-num {
  width: 24px;
  height: 24px;
  border-radius: 9999px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  font-size: 14px;
  font-weight: 600;
  font-family: 'SourceHanSans-SemiBold';
}

.rule-num--red {
  background: #FEE2E2;
  color: #DC2626;
}

.rule-num--blue {
  background: #DBEAFE;
  color: #2563EB;
}

.rule-num--gold {
  background: #FEF3C7;
  color: #D97706;
}

.rule-spacer {
  width: 8px;
}

.rule-text {
  flex: 1;
  font-size: 16px;
  line-height: 1.2;
  color: #78350F;
  font-family: 'SourceHanSans-Regular';
  margin: 0;
}

/* 主内容区 */
.result-main {
  flex: 1;
}

.main-inner {
  padding: 24px 24px;
  display: flex;
  flex-direction: column;
  align-items: center;
  max-width: 768px;
  margin: 0 auto;
  gap: 16px;
}

/* 成功提示区 */
.success-section {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 32px;
}

.success-icon {
  width: 80px;
  height: 80px;
  border-radius: 9999px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 16px;
  background: linear-gradient(180deg, rgba(34,197,94,1) 0%, rgba(16,185,129,1) 100%);
}

.success-svg {
  width: 40px;
  height: 40px;
  color: #FFFFFF;
}

.success-text {
  font-size: 16px;
  line-height: 1.2;
  color: #78350F;
  font-family: 'SourceHanSans-Regular';
  margin: 0;
  text-align: center;
}

/* 号码展示区 */
.result-card {
  width: 100%;
  border-radius: 16px;
  padding: 24px;
  background: rgba(255,255,255,1);
  border: 0.7px solid #FCD34D;
  box-shadow: 0 25px 50px rgba(0,0,0,0.25);
  box-sizing: border-box;
}

.result-card-header {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 24px;
}

.result-title {
  font-size: 24px;
  font-weight: 700;
  text-align: center;
  line-height: 1.2;
  color: #92400E;
  font-family: 'SourceHanSans-Bold';
  margin: 0;
}

.mode-tag {
  margin-top: 10px;
  padding: 4px 12px;
  border-radius: 9999px;
  font-size: 13px;
  font-weight: 500;
  text-align: center;
  display: block;
  width: fit-content;
  margin-left: auto;
  margin-right: auto;
}

.mode-tag.single {
  background: #FEF3C7;
  color: #D97706;
}

.mode-tag.multiple {
  background: #DBEAFE;
  color: #2563EB;
}

.mode-tag.dantuo {
  background: #FEE2E2;
  color: #DC2626;
}

/* 注数分组 */
.note-group {
  margin-bottom: 24px;
}

.note-group:last-child {
  margin-bottom: 0;
}

/* 5注及以上紧凑布局：PC端左右排列，移动端上下排列 */
.note-group--compact {
  display: flex;
  flex-direction: row !important;
  align-items: flex-start;
  gap: 24px;
  margin-bottom: 20px;
  justify-content: center;
  flex-wrap: nowrap !important;
}

.note-group--compact .number-section {
  width: auto;
  min-width: 0;
  flex: 0 0 auto;
  margin-top: 0 !important;
}

.note-group--compact .section-title {
  font-size: 15px;
  white-space: nowrap;
  margin-bottom: 0;
}

.note-group--compact .section-spacer {
  height: 4px;
}

.note-group--compact .balls-group {
  flex-wrap: nowrap !important;
  gap: 2px;
  justify-content: center;
}

.note-group--compact .ball-spacer {
  width: 2px;
}

/* 号码区域 */
.number-section {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.number-section--mt {
  margin-top: 24px;
}

.section-title {
  font-size: 18px;
  font-weight: 600;
  text-align: center;
  line-height: 1.2;
  margin: 0;
}

.section-title--red {
  color: #DC2626;
  font-family: 'SourceHanSans-SemiBold';
}

.section-title--blue {
  color: #2563EB;
  font-family: 'SourceHanSans-SemiBold';
}

.section-spacer {
  height: 12px;
}

/* PC端增加标题与号码的间距 */
@media screen and (min-width: 768px) {
  .section-spacer {
    height: 20px;
  }
}

.balls-group {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-wrap: nowrap; /* 强制不换行 */
}

.ball-spacer {
  width: 4px; /* Tighter gap */
}

.section-spacer {
  height: 4px;
}

/* 胆拖样式 */
.dantuo-label {
  font-size: 13px; /* Smaller label */
  font-weight: 600;
  color: #B45309;
  margin: 6px 0 3px 0;
  text-align: center;
}

.ball-banker {
  border: 4px solid #D97706 !important;
  box-shadow: 0 0 12px rgba(217, 119, 6, 0.5) !important;
}

/* 生成信息 */
.meta-section {
  padding-top: 24px;
  display: flex;
  flex-direction: column;
  align-items: center;
  border-top: 1px solid #FDE68A;
  margin-top: 24px;
}

.meta-time {
  display: flex;
  align-items: center;
  justify-content: center;
}

.meta-icon {
  width: 18px;
  height: 24px;
  color: #D97706;
}

.meta-spacer {
  width: 8px;
}

.meta-text {
  font-size: 15px;
  font-weight: 500;
  line-height: 1.2;
  color: #92400E;
  font-family: 'SourceHanSans-Medium';
}

.meta-spacer-sm {
  height: 6px;
}

.meta-mode {
  font-size: 13px;
  line-height: 1.2;
  text-align: center;
  color: #92400E;
  font-family: 'SourceHanSans-Regular';
  margin: 0;
}

/* 底部操作栏 */
.action-buttons {
  width: 100%;
  max-width: 448px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 32px;
}

.action-btn {
  flex: 1;
  height: 56px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #FFFFFF;
  transition: transform 0.15s;
  cursor: pointer;
  border: none;
  box-shadow: 0 4px 6px rgba(0,0,0,0.1), 0 10px 15px rgba(0,0,0,0.1);
}

.action-btn:active {
  transform: scale(0.95);
}

.action-btn--save {
  background: linear-gradient(90deg, rgba(245,158,11,1) 0%, rgba(234,88,12,1) 100%);
  margin-right: 12px;
  position: relative;
}

.action-btn--save .action-tooltip {
  position: absolute;
  top: -36px;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(0, 0, 0, 0.8);
  color: #FFFFFF;
  font-size: 13px;
  font-weight: 500;
  padding: 6px 12px;
  border-radius: 6px;
  white-space: nowrap;
  opacity: 0;
  visibility: hidden;
  transition: opacity 0.2s, visibility 0.2s;
  pointer-events: none;
}

.action-btn--save .action-tooltip::after {
  content: '';
  position: absolute;
  bottom: -6px;
  left: 50%;
  transform: translateX(-50%);
  border-left: 6px solid transparent;
  border-right: 6px solid transparent;
  border-top: 6px solid rgba(0, 0, 0, 0.8);
}

.action-btn--save:hover .action-tooltip {
  opacity: 1;
  visibility: visible;
}

.action-btn--back {
  background: linear-gradient(90deg, rgba(59,130,246,1) 0%, rgba(79,70,229,1) 100%);
  margin-left: 12px;
  position: relative;
}

.action-btn--back .action-tooltip {
  position: absolute;
  top: -36px;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(0, 0, 0, 0.8);
  color: #FFFFFF;
  font-size: 13px;
  font-weight: 500;
  padding: 6px 12px;
  border-radius: 6px;
  white-space: nowrap;
  opacity: 0;
  visibility: hidden;
  transition: opacity 0.2s, visibility 0.2s;
  pointer-events: none;
}

.action-btn--back .action-tooltip::after {
  content: '';
  position: absolute;
  bottom: -6px;
  left: 50%;
  transform: translateX(-50%);
  border-left: 6px solid transparent;
  border-right: 6px solid transparent;
  border-top: 6px solid rgba(0, 0, 0, 0.8);
}

.action-btn--back:hover .action-tooltip {
  opacity: 1;
  visibility: visible;
}

.action-icon {
  width: 22px;
  height: 28px;
  color: #FFFFFF;
  margin-right: 6px;
}

.action-text {
  font-size: 17px;
  font-weight: 600;
  line-height: 1.2;
  color: #FFFFFF;
  font-family: 'SourceHanSans-SemiBold';
}

/* 底部间距 */
.bottom-spacer {
  height: 24px;
}

/* 底部版权 - 悬浮透明背景 */
.result-footer {
  background: transparent;
  padding: 16px 0;
  position: relative;
  z-index: 10;
}

.footer-inner {
  padding: 0 24px;
  max-width: 1158px;
  margin: 0 auto;
  width: 100%;
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border-radius: 16px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.06), 0 4px 12px rgba(0,0,0,0.04);
  box-sizing: border-box;
  padding-top: 12px;
  padding-bottom: 12px;
}

.footer-text {
  width: 100%;
  font-size: 13px;
  line-height: 1.2;
  text-align: center;
  color: #92400E;
  font-family: 'SourceHanSans-Regular';
  margin: 0;
}

/* 移动端适配 - 统一 header 样式与首页一致 */
@media screen and (max-width: 767px) {
  .result-header {
    padding: 12px 0;
  }

  .header-inner {
    padding: 0 16px;
    max-width: 1158px;
    width: 100%;
    margin: 0 auto;
    box-sizing: border-box;
  }

  .header-content {
    width: 100%;
    gap: 4px;
    align-items: center;
    justify-content: space-between;
    padding: 10px 0;
    background: rgba(255, 255, 255, 0.85);
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
    border-radius: 12px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.06), 0 4px 12px rgba(0,0,0,0.04);
    box-sizing: border-box;
  }

  .logo-area {
    flex-shrink: 0;
    margin-left: 0;
  }

  .logo-icon {
    width: 28px;
    height: 28px;
  }

  .logo-svg {
    width: 16px;
    height: 22px;
    font-size: 14px;
  }

  .logo-spacer {
    width: 4px;
  }

  .logo-text {
    font-size: 15px;
    max-width: 90px;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
  }

  .tab-wrapper {
    position: relative;
    left: auto;
    right: auto;
    transform: none;
    flex: 1 1 auto;
    min-width: 0;
    display: flex;
    justify-content: center;
    align-items: center;
    overflow: visible;
    pointer-events: auto;
  }

  .tab-wrapper > :deep(.tab-container) {
    transform: scale(0.8);
    transform-origin: center center;
  }

  .info-btn {
    width: 32px;
    height: 32px;
    margin-left: 0;
    margin-right: 0;
    flex-shrink: 0;
  }

  .info-icon {
    width: 24px;
    height: 24px;
    font-size: 24px;
  }

  /* 结果页主内容区移动端适配 */
  .result-main {
    flex: 1;
  }

  .main-inner {
    padding: 16px 12px;
  }

  .result-card {
    padding: 12px;
  }

  .result-card-header {
    margin-bottom: 12px;
  }

  .result-title {
    font-size: 18px;
  }

  .mode-tag {
    margin-top: 6px;
    padding: 2px 8px;
    font-size: 11px;
  }

  /* 紧凑模式移动端优化 */
  .note-group--compact {
    flex-direction: column !important;
    gap: 6px !important;
  }

  /* 10注及以上超紧凑模式 */
  .note-group--ultra-compact {
    gap: 4px !important;
  }

  .note-group--ultra-compact .number-section {
    width: 100% !important;
  }

  .note-group--ultra-compact .section-title {
    font-size: 10px !important;
  }

  .note-group--ultra-compact .section-spacer {
    height: 1px !important;
  }

  .note-group--ultra-compact .balls-group {
    gap: 1px !important;
    flex-wrap: nowrap !important;
  }

  .note-group--ultra-compact .ball-spacer {
    width: 1px !important;
  }

  /* 超紧凑模式下号码球进一步缩小 */
  .note-group--ultra-compact :deep(.number-ball) {
    width: 20px !important;
    height: 20px !important;
    font-size: 8px !important;
    border-width: 1px !important;
  }

  /* 紧凑模式下号码球缩小 */
  .note-group--compact :deep(.number-ball) {
    width: 24px !important;
    height: 24px !important;
    font-size: 9px !important;
    border-width: 1px !important;
  }

  /* 移动端号码球缩小 */
  :deep(.number-ball) {
    width: 28px !important;
    height: 28px !important;
    font-size: 11px !important;
    border-width: 1.5px !important;
  }

  .result-card {
    padding: 16px;
  }

  .result-title {
    font-size: 20px;
  }

  .mode-tag {
    font-size: 12px;
    padding: 3px 10px;
  }

  .section-title {
    font-size: 16px;
  }

  .section-spacer {
    height: 8px;
  }

  .ball-spacer {
    width: 6px;
  }

  .dantuo-label {
    font-size: 12px;
    margin: 4px 0 2px 0;
  }

  .ball-banker {
    border-width: 2px !important;
  }

  .balls-group {
    width: 100%;
    gap: 2px;
    flex-wrap: nowrap !important;
    justify-content: center;
    box-sizing: border-box;
  }

  /* 强制红球单行显示 - 缩小间距 */
  .number-section:first-child .ball-spacer {
    width: 1px !important;
  }

  /* 移动端号码球缩小 */
  :deep(.number-ball) {
    width: 32px !important;
    height: 32px !important;
    font-size: 13px !important;
    border-width: 1.5px !important;
  }

  .ball-spacer {
    width: 2px;
  }

  .section-title {
    font-size: 15px;
  }

  .action-btn {
    height: 48px;
  }

  .action-icon {
    width: 18px;
    height: 24px;
    margin-right: 4px;
  }

  .action-text {
    font-size: 15px;
  }

  .action-buttons {
    max-width: 360px;
  }

  .action-btn--save {
    margin-right: 8px;
  }

  .action-btn--back {
    margin-left: 8px;
  }
}

/* 小屏手机适配 (375px 以下) */
@media screen and (max-width: 375px) {
  .ball-spacer {
    width: 2px;
  }

  .result-title {
    font-size: 18px;
  }

  .dantuo-label {
    font-size: 11px;
    margin: 2px 0 1px 0;
  }

  .ball-banker {
    border-width: 2px !important;
  }
}

/* 中等手机适配 (376px - 480px) */
@media screen and (min-width: 376px) and (max-width: 480px) {
  .ball-spacer {
    width: 6px;
  }
}

/* 平板适配 */
@media screen and (min-width: 768px) {
  .header-inner {
    padding: 0 32px;
    max-width: 1158px;
    margin: 0 auto;
    width: 100%;
    box-sizing: border-box;
  }

  .header-content {
    padding: 14px 0;
    border-radius: 20px;
    justify-content: space-between;
  }

  .tab-wrapper {
    position: absolute;
    left: 0;
    right: 0;
  }

  .success-icon {
    width: 88px;
    height: 88px;
  }

  .success-svg {
    width: 44px;
    height: 44px;
  }

  .success-text {
    font-size: 17px;
  }

  .result-card {
    padding: 28px;
  }

  .result-title {
    font-size: 26px;
  }

  .section-title {
    font-size: 19px;
  }

  .action-btn {
    height: 60px;
  }

  .action-icon {
    width: 24px;
    height: 30px;
  }

  .action-text {
    font-size: 18px;
  }
}

/* 桌面端适配 */
@media screen and (min-width: 1024px) {
  .result-header {
    padding: 10px 0;
  }

  .header-inner {
    padding: 0 48px;
    max-width: 1158px;
    margin: 0 auto;
    width: 100%;
    box-sizing: border-box;
  }

  .header-content {
    padding: 8px 0;
    border-radius: 24px;
    justify-content: space-between;
  }

  .logo-icon {
    width: 26px;
    height: 26px;
  }

  .logo-svg {
    width: 15px;
    height: 19px;
    font-size: 13px;
  }

  .logo-spacer {
    width: 8px;
  }

  .logo-text {
    font-size: 20px;
  }

  .tab-wrapper {
    position: absolute;
    left: 0;
    right: 0;
  }

  .info-btn {
    width: 34px;
    height: 34px;
  }

  .main-inner {
    padding: 12px 168px;
    max-width: 768px;
    gap: 8px;
  }

  .success-section {
    margin-bottom: 16px;
  }

  .success-icon {
    width: 60px;
    height: 60px;
    margin-bottom: 8px;
  }

  .success-svg {
    width: 30px;
    height: 30px;
  }

  .success-text {
    font-size: 14px;
  }

  .result-card {
    padding: 20px;
  }

  .result-title {
    font-size: 20px;
  }

  .section-title {
    font-size: 16px;
  }

  .section-spacer {
    height: 10px;
  }

  .ball-spacer {
    width: 12px;
  }

  .number-section--mt {
    margin-top: 20px;
  }

  .meta-section {
    padding-top: 16px;
    margin-top: 16px;
  }

  .meta-icon {
    width: 16px;
    height: 22px;
  }

  .meta-text {
    font-size: 12px;
  }

  .meta-mode {
    font-size: 11px;
  }

  .action-buttons {
    max-width: 320px;
  }

  .action-btn {
    height: 48px;
  }

  .action-icon {
    width: 20px;
    height: 26px;
  }

  .action-text {
    font-size: 16px;
  }

  .bottom-spacer {
    height: 12px;
  }

  .result-footer {
    padding: 10px 0;
  }

  .footer-inner {
    padding: 0 32px;
    max-width: 1158px;
    margin: 0 auto;
    width: 100%;
    box-sizing: border-box;
    border-radius: 20px;
    padding-top: 8px;
    padding-bottom: 8px;
  }

  .footer-text {
    font-size: 12px;
  }

}

/* 移动端适配修正：解决 Logo 遮挡导航标签问题 */
@media screen and (max-width: 767px) {
  /* Header 容器垂直内边距，水平由 header-inner 控制以对齐 main-inner */
  .result-header {
    padding: 12px 0;
  }

  .header-inner {
    padding: 0 16px;
    max-width: 1158px;
    width: 100%;
    margin: 0 auto;
    box-sizing: border-box;
    border-radius: 12px;
    padding-top: 10px;
    padding-bottom: 10px;
  }

  .header-content {
    width: 100%;
    overflow: hidden;
  }

  .tab-wrapper {
    flex: 1 1 auto;
    min-width: 0;
    overflow: hidden;
    margin: 0 4px;
    display: flex;
    justify-content: center;
    align-items: center;
    pointer-events: auto;
  }

  .logo-area {
    flex-shrink: 0;
  }

  .logo-icon {
    width: 28px;
    height: 28px;
  }

  .logo-svg {
    width: 16px;
    height: 22px;
    font-size: 14px;
  }

  .logo-spacer {
    width: 4px;
  }

  .logo-text {
    font-size: 15px;
    max-width: 90px;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
  }

  .tab-wrapper {
    position: relative;
    left: auto;
    right: auto;
    transform: none;
    flex: 0 1 auto;
    min-width: 0;
    overflow: visible;
    margin: 0 2px;
    display: flex;
    justify-content: center;
    align-items: center;
    pointer-events: auto;
  }

  .tab-wrapper > :deep(.tab-container) {
    transform: scale(0.8);
    transform-origin: center center;
  }

  .info-btn {
    width: 32px;
    height: 32px;
    margin-left: 0;
    margin-right: 0;
    flex-shrink: 0;
  }

  .info-icon {
    width: 24px;
    height: 24px;
    font-size: 24px;
  }

  /* 规则弹窗移动端适配 */
  .modal-overlay {
    padding: 12px;
  }

  .modal-content {
    max-height: 85vh;
  }

  .modal-header {
    padding: 12px 12px 0 12px;
    flex-wrap: wrap;
    gap: 8px;
    align-items: center;
  }

  .modal-title {
    font-size: 15px;
    white-space: nowrap;
    flex: 0 0 auto;
  }

  .modal-tip {
    padding: 2px 6px;
    flex: 1 1 auto;
    min-width: 0;
  }

  .modal-tip-text {
    font-size: 10px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .modal-close {
    width: 28px;
    height: 28px;
    flex: 0 0 28px;
    margin-left: auto;
  }

  .close-icon {
    width: 16px;
    height: 16px;
  }

  .modal-divider {
    margin: 12px 16px 0 16px;
  }

  .modal-body {
    padding: 16px 16px 20px 16px;
  }

  .rule-title {
    font-size: 15px;
    margin-bottom: 12px;
  }

  .rule-title::first-letter {
    font-size: 16px;
  }

  .rule-list {
    padding: 0 0 0 8px;
  }

  .rule-item {
    margin-bottom: 8px;
  }

  .rule-num {
    width: 20px;
    height: 20px;
    font-size: 12px;
  }

  .rule-spacer {
    width: 6px;
  }

  .rule-text {
    font-size: 13px;
  }
}
</style>
