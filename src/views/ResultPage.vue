<script setup lang="ts">
import { ref, onMounted, watch, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import html2canvas from 'html2canvas'
import {
  RiDownload2Line,
  RiRefreshLine,
  RiShareForwardFill,
  RiMoneyCnyCircleFill,
} from '@remixicon/vue'
import PageHeader from '@/components/PageHeader.vue'
import RulesCard from '@/components/RulesCard.vue'
import NumberBall from '@/components/NumberBall.vue'
import CopperCoinIcon from '@/components/CopperCoinIcon.vue'
import BaguaFullIcon from '@/components/BaguaFullIcon.vue'
import { generateSSQ, generateDLT, formatTime, getIssueNumber, setIssueNumber, currentIssueNumber, currentIssuePrefix, currentIssueSuffix } from '@/composables/useLottery'

const ssqLogo = '/ssq.png'
const dltLogo = '/dlt.png'
const sloganImg = '/msst.png'

const router = useRouter()
const route = useRoute()

const lotteryType = ref<'ssq' | 'dlt'>((route.query.type as 'ssq' | 'dlt') || 'ssq')
const notes = ref(Number(route.query.notes) || 5)
const mode = ref((route.query.mode as string) || 'single')

const resultCardRef = ref<HTMLElement | null>(null)
const numbers = ref<any[]>([])
const issueNumber = ref('')
const issuePrefix = ref('')
const issueSuffix = ref('')
const metaTime = ref('')
const metaMode = ref('')
const ticketTime = ref('')
const ticketCode = ref('')

const modeLabels = {
  single: '单式',
  multiple: '复式',
  dantuo: '胆拖',
}

const showRulesModal = ref(false)
const isFloatExpanded = ref(false)
// 分享模式：识别 share=1 或 autoGenerate=1 参数
const isShareMode = ref(route.query.share === '1' || route.query.autoGenerate === '1')

// 分享模式下，初始化数据
if (isShareMode.value) {
  lotteryType.value = (route.query.type as 'ssq' | 'dlt') || 'ssq'
  notes.value = Number(route.query.notes) || 5
  mode.value = (route.query.mode as string) || 'single'
  refreshData()
  
  // 分享模式隐藏操作按钮
  isFloatExpanded.value = false
}

const floatIcons = computed(() => [
  { type: 'save', label: '普渡众生', icon: RiDownload2Line, color: '#F59E0B' },
  { type: 'regenerate', label: lotteryType.value === 'ssq' ? '和气生财' : '道亦有道', icon: RiRefreshLine, color: '#10B981' },
  { type: 'share', label: '分享好运', icon: RiShareForwardFill, color: '#3B82F6' },
])

function toggleFloat() {
  isFloatExpanded.value = !isFloatExpanded.value
}

function handleFloatIconClick(type: string) {
  if (type === 'save') {
    handleSaveImage()
  } else if (type === 'regenerate') {
    handleBack()
  } else if (type === 'share') {
    handleShare()
  }
}

async function handleShare() {
  const shareUrl = `${window.location.origin}/?type=${lotteryType.value}&notes=${notes.value}&mode=${mode.value}&autoGenerate=1`
  
  try {
    await navigator.clipboard.writeText(shareUrl)
    alert('分享链接已复制到剪贴板！')
  } catch {
    // 降级方案：使用传统方法
    const input = document.createElement('input')
    input.value = shareUrl
    document.body.appendChild(input)
    input.select()
    document.execCommand('copy')
    document.body.removeChild(input)
    alert('分享链接已复制到剪贴板！')
  }
}

function openRules() {
  showRulesModal.value = true
}

function closeRules() {
  showRulesModal.value = false
}

// 生成防伪随机票号
function generateTicketCode() {
  const numPart = () => String(Math.floor(Math.random() * 1000000)).padStart(6, '0')
  const nums = `${numPart()}-${numPart()}-${numPart()}-${numPart()}`
  
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789+/'
  let suffix = ''
  for (let i = 0; i < 6; i++) {
    suffix += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  
  return `票号：${nums} ${suffix}`
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
  issuePrefix.value = currentIssuePrefix.value
  issueSuffix.value = currentIssueSuffix.value
  metaTime.value = `生成时间：${formatTime()}`
  metaMode.value = `注数：${notes.value}注 | 模式：${modeLabels[mode.value as keyof typeof modeLabels]}`
  ticketCode.value = generateTicketCode()

  // 设置出票时间为系统当前时间
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  const hours = String(now.getHours()).padStart(2, '0')
  const minutes = String(now.getMinutes()).padStart(2, '0')
  const seconds = String(now.getSeconds()).padStart(2, '0')
  ticketTime.value = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`
}

// 计算公益金额（官方规则：双色球/大乐透公益金提取比例为36%，每注2元）
const charityAmount = computed(() => {
  return (notes.value * 2 * 0.36).toFixed(2)
})

// 投注类型显示文本
const betTypeText = computed(() => {
  const currentMode = mode.value
  if (currentMode === 'single') return '单式票'
  if (currentMode === 'multiple') return '复式票'
  if (currentMode === 'dantuo') return '胆拖票'
  return '单式票'
})

// 投注类型样式类名（根据mode动态切换颜色）
const betValueClass = computed(() => {
  // 单式票使用主题色（双色球红色/大乐透绿色），复式/胆拖票使用主题色
  return lotteryType.value === 'dlt' ? 'bet-value--dlt' : ''
})

onMounted(() => {
  // 确保使用最新的路由参数初始化
  lotteryType.value = (route.query.type as 'ssq' | 'dlt') || 'ssq'
  notes.value = Number(route.query.notes) || 5
  mode.value = (route.query.mode as string) || 'single'
  refreshData()
})

// 监听路由参数变化
watch([() => route.query.type, () => route.query.notes, () => route.query.mode], ([newType, newNotes, newMode]) => {
  if (newType === 'ssq' || newType === 'dlt') {
    lotteryType.value = newType
  }
  notes.value = Number(newNotes) || 5
  mode.value = (newMode as string) || 'single'
  refreshData()
}, { immediate: false })

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
      useCORS: true,
      allowTaint: true,
      onclone: (clonedDoc) => {
        // 修复渐变文字导出问题：html2canvas 不支持 background-clip: text
        const titleEl = clonedDoc.querySelector('.lottery-title') as HTMLElement
        if (titleEl) {
          const color = lotteryType.value === 'ssq' ? '#DC2626' : '#0E7451'
          titleEl.style.background = 'none'
          titleEl.style.webkitBackgroundClip = 'border-box'
          titleEl.style.backgroundClip = 'border-box'
          titleEl.style.webkitTextFillColor = color
          titleEl.style.color = color
        }
      },
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
    <PageHeader
      v-model="lotteryType"
      @info="openRules"
      @logo-click="router.push('/')"
    />

    <!-- 主内容区 -->
    <main class="result-main">
      <div class="main-inner">
        <!-- 结果卡片 -->
        <div class="result-card-wrapper">
          <div class="result-card" ref="resultCardRef">
            <div class="ticket-container">
              <!-- 顶部品牌区 -->
              <div class="brand-header">
                <div class="ticket-logo-area">
                  <img :src="lotteryType === 'ssq' ? ssqLogo : dltLogo" alt="彩票Logo" class="logo-img" crossorigin="anonymous" />
                </div>
                <div class="title-area">
                  <h3 class="lottery-title" :class="lotteryType === 'dlt' ? 'lottery-title--dlt' : ''">{{ lotteryType === 'ssq' ? '中国福利彩票' : '中国体育彩票' }}</h3>
                </div>
                <div class="slogan-area">
                  <img :src="sloganImg" alt="宣传标语" class="slogan-img" />
                </div>
              </div>

              <!-- 顶部分隔线 -->
              <div class="spacer-h16"></div>
              <div class="divider"></div>
              <div class="spacer-h12"></div>

              <!-- 期次开奖信息区 -->
              <div class="issue-section">
                <div class="issue-row">
                  <div class="issue-info">
                    <span class="issue-num">第 <span class="issue-num-value" :class="{ 'issue-num-value--dlt': lotteryType === 'dlt' }">{{ issueNumber }}</span> 期</span>
                  </div>
                  <div class="date-info">
                    <span class="date-text">{{ metaTime.split(' ')[0] }} 开奖</span>
                  </div>
                </div>
                <div class="spacer-h8"></div>
                <div class="code-row">
                  <span class="code-text">{{ ticketCode }}</span>
                </div>
              </div>

              <!-- 信息区分隔线 -->
              <div class="spacer-h16"></div>
              <div class="divider"></div>
              <div class="spacer-h12"></div>

              <!-- 投注信息区 -->
              <div class="betting-section">
                <div class="bet-row">
                  <div class="bet-type-group">
                    <span class="bet-label">投注类型：</span>
                    <span class="bet-value" :class="betValueClass">{{ betTypeText }}</span>
                  </div>
                  <div class="multiplier-group">
                    <span class="bet-label">倍数：</span>
                    <span class="bet-value" :class="betValueClass">1 倍</span>
                  </div>
                </div>
                <div class="spacer-h8"></div>
                <div class="amount-row">
                  <span class="amount-text" :class="lotteryType === 'dlt' ? 'amount-text--dlt' : ''">合计 {{ notes * 2 }} 元</span>
                </div>
              </div>

              <!-- 投注区分隔线 -->
              <div class="spacer-h16"></div>
              <div class="divider"></div>
              <div class="spacer-h12"></div>

              <!-- 号码展示区 -->
              <div class="numbers-section">
                <div v-for="(note, index) in numbers" :key="index" class="note-row">

                  <!-- 双色球 -->
                  <template v-if="lotteryType === 'ssq'">
                    <div class="red-balls">
                      <template v-for="(num, i) in note.red" :key="i">
                        <div class="ball ball--red" :class="{ 'ball-banker': note.redBanker && note.redBanker.includes(num) }">
                          <span class="ball-text">{{ String(num).padStart(2, '0') }}</span>
                        </div>
                        <div v-if="Number(i) < note.red.length - 1" class="ball-spacer"></div>
                      </template>
                    </div>
                    <div class="note-separator">+</div>
                    <div class="spacer-w8"></div>
                    <div class="blue-balls">
                      <template v-if="note.blue && note.blue.length > 0">
                        <div class="ball ball--blue">
                          <span class="ball-text">{{ String(note.blue[0]).padStart(2, '0') }}</span>
                        </div>
                      </template>
                      <template v-else-if="note.blue && note.blue.length > 1">
                        <template v-for="(num, i) in note.blue" :key="i">
                          <div class="ball ball--blue">
                            <span class="ball-text">{{ String(num).padStart(2, '0') }}</span>
                          </div>
                          <div v-if="Number(i) < note.blue.length - 1" class="ball-spacer"></div>
                        </template>
                      </template>
                    </div>
                  </template>

                  <!-- 大乐透 -->
                  <template v-else>
                    <div class="red-balls">
                      <template v-for="(num, i) in note.front" :key="i">
                        <div class="ball ball--red" :class="{ 'ball-banker': note.frontBanker && note.frontBanker.includes(num) }">
                          <span class="ball-text">{{ String(num).padStart(2, '0') }}</span>
                        </div>
                        <div v-if="Number(i) < note.front.length - 1" class="ball-spacer"></div>
                      </template>
                    </div>
                    <div class="note-separator">+</div>
                    <div class="spacer-w8"></div>
                    <div class="blue-balls">
                      <template v-if="note.back && note.back.length > 0">
                        <template v-for="(num, i) in note.back" :key="i">
                          <div class="ball ball--blue">
                            <span class="ball-text">{{ String(num).padStart(2, '0') }}</span>
                          </div>
                          <div v-if="Number(i) < note.back.length - 1" class="ball-spacer"></div>
                        </template>
                      </template>
                    </div>
                  </template>
                </div>
              </div>

              <!-- 号码区分隔线 -->
              <div class="spacer-h24"></div>
              <div class="divider"></div>
              <div class="spacer-h12"></div>

              <!-- 公益销售信息区 -->
              <div class="public-info">
                <div class="charity-row">
                  <span class="charity-text" :class="lotteryType === 'dlt' ? 'charity-text--dlt' : ''">感谢您为公益事业贡献 {{ charityAmount }} 元</span>
                </div>
                <div class="spacer-h8"></div>
                <div class="station-row">
                  <span class="station-text">销售站点：{{ lotteryType === 'ssq' ? '佛门重地' : '洞天福地' }}</span>
                  <span class="spacer-w16"></span>
                  <span class="station-text">机号：88888888</span>
                  <span class="spacer-w16"></span>
                  <span class="station-text">操作员：主任严选</span>
                </div>
                <div class="spacer-h4"></div>
                <div class="time-row">
                  <span class="time-text">出票时间：{{ ticketTime }}</span>
                </div>
              </div>

              <!-- 底部防伪区 -->
              <div class="spacer-h20"></div>
              <div class="barcode-section">
                <div class="barcode-visual">
                  <svg class="barcode-svg" viewBox="0 0 389 40" xmlns="http://www.w3.org/2000/svg">
                  <rect x="0" y="0" width="2" height="40" fill="#000000"/>
                  <rect x="4" y="0" width="1" height="40" fill="#000000"/>
                  <rect x="7" y="0" width="3" height="40" fill="#000000"/>
                  <rect x="12" y="0" width="1" height="40" fill="#000000"/>
                  <rect x="15" y="0" width="2" height="40" fill="#000000"/>
                  <rect x="19" y="0" width="1" height="40" fill="#000000"/>
                  <rect x="22" y="0" width="1" height="40" fill="#000000"/>
                  <rect x="25" y="0" width="3" height="40" fill="#000000"/>
                  <rect x="30" y="0" width="2" height="40" fill="#000000"/>
                  <rect x="34" y="0" width="1" height="40" fill="#000000"/>
                  <rect x="37" y="0" width="2" height="40" fill="#000000"/>
                  <rect x="41" y="0" width="1" height="40" fill="#000000"/>
                  <rect x="44" y="0" width="3" height="40" fill="#000000"/>
                  <rect x="49" y="0" width="1" height="40" fill="#000000"/>
                  <rect x="52" y="0" width="2" height="40" fill="#000000"/>
                  <rect x="56" y="0" width="1" height="40" fill="#000000"/>
                  <rect x="59" y="0" width="1" height="40" fill="#000000"/>
                  <rect x="62" y="0" width="3" height="40" fill="#000000"/>
                  <rect x="67" y="0" width="2" height="40" fill="#000000"/>
                  <rect x="71" y="0" width="1" height="40" fill="#000000"/>
                  <rect x="74" y="0" width="2" height="40" fill="#000000"/>
                  <rect x="78" y="0" width="1" height="40" fill="#000000"/>
                  <rect x="81" y="0" width="3" height="40" fill="#000000"/>
                  <rect x="86" y="0" width="1" height="40" fill="#000000"/>
                  <rect x="89" y="0" width="2" height="40" fill="#000000"/>
                  <rect x="93" y="0" width="1" height="40" fill="#000000"/>
                  <rect x="96" y="0" width="1" height="40" fill="#000000"/>
                  <rect x="99" y="0" width="3" height="40" fill="#000000"/>
                  <rect x="104" y="0" width="2" height="40" fill="#000000"/>
                  <rect x="108" y="0" width="1" height="40" fill="#000000"/>
                  <rect x="111" y="0" width="2" height="40" fill="#000000"/>
                  <rect x="115" y="0" width="1" height="40" fill="#000000"/>
                  <rect x="118" y="0" width="3" height="40" fill="#000000"/>
                  <rect x="123" y="0" width="1" height="40" fill="#000000"/>
                  <rect x="126" y="0" width="2" height="40" fill="#000000"/>
                  <rect x="130" y="0" width="1" height="40" fill="#000000"/>
                  <rect x="133" y="0" width="1" height="40" fill="#000000"/>
                  <rect x="136" y="0" width="3" height="40" fill="#000000"/>
                  <rect x="141" y="0" width="2" height="40" fill="#000000"/>
                  <rect x="145" y="0" width="1" height="40" fill="#000000"/>
                  <rect x="148" y="0" width="2" height="40" fill="#000000"/>
                  <rect x="152" y="0" width="1" height="40" fill="#000000"/>
                  <rect x="155" y="0" width="3" height="40" fill="#000000"/>
                  <rect x="160" y="0" width="1" height="40" fill="#000000"/>
                  <rect x="163" y="0" width="2" height="40" fill="#000000"/>
                  <rect x="167" y="0" width="1" height="40" fill="#000000"/>
                  <rect x="170" y="0" width="1" height="40" fill="#000000"/>
                  <rect x="173" y="0" width="3" height="40" fill="#000000"/>
                  <rect x="178" y="0" width="2" height="40" fill="#000000"/>
                  <rect x="182" y="0" width="1" height="40" fill="#000000"/>
                  <rect x="185" y="0" width="2" height="40" fill="#000000"/>
                  <rect x="189" y="0" width="1" height="40" fill="#000000"/>
                  <rect x="192" y="0" width="3" height="40" fill="#000000"/>
                  <rect x="197" y="0" width="1" height="40" fill="#000000"/>
                  <rect x="200" y="0" width="2" height="40" fill="#000000"/>
                  <rect x="204" y="0" width="1" height="40" fill="#000000"/>
                  <rect x="207" y="0" width="1" height="40" fill="#000000"/>
                  <rect x="210" y="0" width="3" height="40" fill="#000000"/>
                  <rect x="215" y="0" width="2" height="40" fill="#000000"/>
                  <rect x="219" y="0" width="1" height="40" fill="#000000"/>
                  <rect x="222" y="0" width="2" height="40" fill="#000000"/>
                  <rect x="226" y="0" width="1" height="40" fill="#000000"/>
                  <rect x="229" y="0" width="3" height="40" fill="#000000"/>
                  <rect x="234" y="0" width="1" height="40" fill="#000000"/>
                  <rect x="237" y="0" width="2" height="40" fill="#000000"/>
                  <rect x="241" y="0" width="1" height="40" fill="#000000"/>
                  <rect x="244" y="0" width="1" height="40" fill="#000000"/>
                  <rect x="247" y="0" width="3" height="40" fill="#000000"/>
                  <rect x="252" y="0" width="2" height="40" fill="#000000"/>
                  <rect x="256" y="0" width="1" height="40" fill="#000000"/>
                  <rect x="259" y="0" width="2" height="40" fill="#000000"/>
                  <rect x="263" y="0" width="1" height="40" fill="#000000"/>
                  <rect x="266" y="0" width="3" height="40" fill="#000000"/>
                  <rect x="271" y="0" width="1" height="40" fill="#000000"/>
                  <rect x="274" y="0" width="2" height="40" fill="#000000"/>
                  <rect x="278" y="0" width="1" height="40" fill="#000000"/>
                  <rect x="281" y="0" width="1" height="40" fill="#000000"/>
                  <rect x="284" y="0" width="3" height="40" fill="#000000"/>
                  <rect x="289" y="0" width="2" height="40" fill="#000000"/>
                  <rect x="293" y="0" width="1" height="40" fill="#000000"/>
                  <rect x="296" y="0" width="2" height="40" fill="#000000"/>
                  <rect x="300" y="0" width="1" height="40" fill="#000000"/>
                  <rect x="303" y="0" width="3" height="40" fill="#000000"/>
                  <rect x="308" y="0" width="1" height="40" fill="#000000"/>
                  <rect x="311" y="0" width="2" height="40" fill="#000000"/>
                  <rect x="315" y="0" width="1" height="40" fill="#000000"/>
                  <rect x="318" y="0" width="1" height="40" fill="#000000"/>
                  <rect x="321" y="0" width="3" height="40" fill="#000000"/>
                  <rect x="326" y="0" width="2" height="40" fill="#000000"/>
                  <rect x="330" y="0" width="1" height="40" fill="#000000"/>
                  <rect x="333" y="0" width="2" height="40" fill="#000000"/>
                  <rect x="337" y="0" width="1" height="40" fill="#000000"/>
                  <rect x="340" y="0" width="3" height="40" fill="#000000"/>
                  <rect x="345" y="0" width="1" height="40" fill="#000000"/>
                  <rect x="348" y="0" width="2" height="40" fill="#000000"/>
                  <rect x="352" y="0" width="1" height="40" fill="#000000"/>
                  <rect x="355" y="0" width="1" height="40" fill="#000000"/>
                  <rect x="358" y="0" width="3" height="40" fill="#000000"/>
                  <rect x="363" y="0" width="2" height="40" fill="#000000"/>
                  <rect x="367" y="0" width="1" height="40" fill="#000000"/>
                  <rect x="370" y="0" width="2" height="40" fill="#000000"/>
                  <rect x="374" y="0" width="1" height="40" fill="#000000"/>
                  <rect x="377" y="0" width="3" height="40" fill="#000000"/>
                  <rect x="382" y="0" width="1" height="40" fill="#000000"/>
                  <rect x="385" y="0" width="2" height="40" fill="#000000"/>
                  <rect x="388" y="0" width="1" height="40" fill="#000000"/>
                </svg>
              </div>
              <div class="spacer-h8"></div>
              <div class="barcode-text">
                仅供娱乐  理性购彩
              </div>
            </div>
          </div>
        </div>
      </div>

        <!-- 浮动按钮（action-buttons 上方） -->
      <div class="result-float-widget" :class="lotteryType === 'ssq' ? 'expand-left' : 'expand-right'">
        <div class="result-icon-list-horizontal" :class="{ show: isFloatExpanded }">
          <div
            v-for="(icon, index) in floatIcons"
            :key="icon.type"
            class="result-icon-item-h"
            :class="{ show: isFloatExpanded }"
            :style="{ transitionDelay: isFloatExpanded ? `${(index + 1) * 0.08}s` : '0s' }"
            @click="handleFloatIconClick(icon.type)"
          >
            <span class="result-icon-emoji-h" :style="{ color: icon.color }">
              <component :is="icon.icon" class="result-icon-svg-h" />
            </span>
            <span class="result-icon-item-tooltip-h">{{ icon.label }}</span>
          </div>
        </div>
        <button class="result-main-btn" @click="toggleFloat">
          <RiMoneyCnyCircleFill class="result-btn-icon" />
          <span class="result-main-btn-tooltip">财富自由</span>
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
        <div class="modal-tip-content">
          <div class="tip-icon-wrapper">
            <svg class="tip-icon-svg" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <!-- 双手作揖 -->
              <path d="M12 2C10 4 8 6 8 9C8 12 10 14 12 16C14 14 16 12 16 9C16 6 14 4 12 2Z" stroke="currentColor" stroke-width="1.5" fill="currentColor" fill-opacity="0.2"/>
              <path d="M7 10C5 11 3 14 4 17C5 20 8 21 10 20" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" fill="none"/>
              <path d="M17 10C19 11 21 14 20 17C19 20 16 21 14 20" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" fill="none"/>
              <path d="M10 18L12 22L14 18" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
            </svg>
          </div>
          <div class="tip-text-wrapper">
            <p class="tip-message">其实你有1000万存款，只不过你忘记了取款密码，每输入一次需要2元，一旦正确，钱就是你的，不着急，不放弃，心若在，梦就在。</p>
            <p class="tip-copyright">@2026 sikenali  Vibe Coding</p>
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

/* 规则弹窗 */
.modal-overlay {
  position: fixed;
  inset: 0;
  z-index: 200;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.4);
  padding: 24px;
}

.modal-content {
  width: 500px;
  height: 320px;
  overflow: hidden;
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(20px) saturate(200%);
  -webkit-backdrop-filter: blur(20px) saturate(200%);
  border: 1px solid rgba(255, 255, 255, 0.5);
  box-shadow: 0 25px 50px rgba(0, 0, 0, 0.15), 0 10px 20px rgba(0, 0, 0, 0.1);
  padding: 16px;
}

.modal-tip-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
}

.tip-icon-wrapper {
  flex-shrink: 0;
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: linear-gradient(135deg, rgba(254,243,199,1) 0%, rgba(255,251,235,1) 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid #FCD34D;
  box-shadow: 0 4px 12px rgba(251, 191, 36, 0.2);
}

.tip-icon-svg {
  width: 32px;
  height: 32px;
  color: #D97706;
}

.tip-text-wrapper {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding-top: 4px;
}

.tip-message {
  font-size: 15px;
  line-height: 1.8;
  color: #92400E;
  font-family: 'SourceHanSans-Medium';
  margin: 0;
  text-align: center;
  padding: 12px 16px;
  background: linear-gradient(135deg, rgba(254,243,199,0.5) 0%, rgba(255,251,235,0.8) 50%, rgba(254,243,199,0.5) 100%);
  border-radius: 12px;
  border: 1px solid rgba(253, 230, 138, 0.6);
  box-shadow: inset 0 1px 3px rgba(180, 83, 9, 0.08);
  letter-spacing: 0.3px;
}

.tip-copyright {
  font-size: 13px;
  color: #B45309;
  font-family: 'SourceHanSans-Medium';
  text-align: center;
  margin: 0;
  opacity: 0.85;
  letter-spacing: 0.5px;
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
  border-radius: 12px;
  padding: 0;
  background: #FFFFFF;
  border: 1px solid #E5E7EB;
  box-shadow: 0 1px 3px rgba(0,0,0,0.06);
  box-sizing: border-box;
  overflow: hidden;
}

.ticket-container {
  padding: 12px;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}

/* 顶部品牌区 */
.brand-header {
  width: 100%;
  height: 72px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.ticket-logo-area {
  width: 60px;
  height: 60px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.logo-img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.title-area {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
}

.lottery-title {
  font-size: 28px;
  font-weight: 900;
  background: linear-gradient(90deg, rgba(239,68,68,1) 0%, rgba(245,158,11,1) 100%);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  -webkit-text-fill-color: transparent;
  font-family: 'SourceHanSans-Black';
  line-height: 1.2;
  margin: 0;
}

.lottery-title--dlt {
  background: linear-gradient(90deg, rgba(59,130,246,1) 0%, rgba(99,102,241,1) 100%);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  -webkit-text-fill-color: transparent;
}

.slogan-area {
  width: 57px;
  height: 57px;
  flex-shrink: 0;
}

.slogan-img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

/* 分隔线和间距 */
.divider {
  width: 100%;
  height: 1px;
  background: #D1D5DB;
}

.spacer-h4 { height: 4px; width: 100%; }
.spacer-h8 { height: 8px; width: 100%; }
.spacer-h12 { height: 12px; width: 100%; }
.spacer-h16 { height: 16px; width: 100%; }
.spacer-h20 { height: 20px; width: 100%; }
.spacer-h24 { height: 24px; width: 100%; }
.spacer-w8 { width: 8px; flex-shrink: 0; }
.spacer-w16 { width: 16px; flex-shrink: 0; }

/* 期次开奖信息区 */
.issue-section {
  width: 100%;
}

.issue-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.issue-num {
  font-size: 14px;
  font-weight: 500;
  color: #1F2937;
  font-family: 'SourceHanSans-Medium';
}

.issue-num-value {
  font-size: 16px;
  font-weight: 900;
  background: linear-gradient(90deg, rgba(239,68,68,1) 0%, rgba(245,158,11,1) 100%);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  -webkit-text-fill-color: transparent;
  font-family: 'SourceHanSans-Black';
}

.issue-num-value--dlt {
  background: linear-gradient(90deg, rgba(59,130,246,1) 0%, rgba(99,102,241,1) 100%);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  -webkit-text-fill-color: transparent;
}

.date-text {
  font-size: 12px;
  color: #4B5563;
  font-family: 'SourceHanSans-Regular';
}

.code-text {
  font-size: 12px;
  color: #6B7280;
  font-family: 'SourceHanSans-Regular';
}

/* 投注信息区 */
.betting-section {
  width: 100%;
}

.bet-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.bet-type-group,
.multiplier-group {
  display: flex;
  align-items: center;
}

.bet-label {
  font-size: 14px;
  font-weight: 500;
  color: #1F2937;
  font-family: 'SourceHanSans-Medium';
}

.bet-value {
  font-size: 14px;
  font-weight: 700;
  color: #DC2626;
  font-family: 'SourceHanSans-Bold';
}

.bet-value--dlt {
  color: #0E7451;
}

.amount-row {
  width: 100%;
}

.amount-text {
  font-size: 16px;
  font-weight: 700;
  color: #DC2626;
  font-family: 'SourceHanSans-Bold';
}

.amount-text--dlt {
  color: #0E7451;
}

/* 号码展示区 */
.numbers-section {
  width: 100%;
}

.note-row {
  display: flex;
  align-items: center;
  margin-bottom: 12px;
}

.note-row:last-child {
  margin-bottom: 0;
}

.red-balls,
.blue-balls {
  display: flex;
  align-items: center;
}

.ball {
  width: 36px;
  height: 36px;
  border-radius: 9999px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.ball--red {
  background: #DC2626;
}

.ball--blue {
  background: #2563EB;
}

.ball-text {
  font-size: 16px;
  font-weight: 700;
  color: #FFFFFF;
  font-family: 'SourceHanSans-Bold';
  text-align: center;
  line-height: 1;
  display: flex;
  align-items: center;
  justify-content: center;
}

.ball-spacer {
  width: 8px;
  flex-shrink: 0;
}

.note-separator {
  font-size: 20px;
  font-weight: 700;
  color: #1F2937;
  font-family: 'SourceHanSans-Bold';
  margin: 0 8px;
}

/* 公益销售信息区 */
.public-info {
  width: 100%;
}

.charity-text {
  font-size: 12px;
  color: #DC2626;
  font-family: 'SourceHanSans-Regular';
}

.charity-text--dlt {
  color: #0E7451;
}

.station-text,
.time-text {
  font-size: 10px;
  color: #6B7280;
  font-family: 'SourceHanSans-Regular';
}

.station-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
}

/* 底部防伪区 */
.barcode-section {
  width: 100%;
}

.barcode-visual {
  height: 40px;
  width: 100%;
}

.barcode-svg {
  width: 100%;
  height: 40px;
  display: block;
}

.barcode-text {
  font-size: 12px;
  color: #6B7280;
  font-family: 'SourceHanSans-Regular';
  letter-spacing: 1px;
  margin-top: 8px;
  text-align: center;
  width: 100%;
}

/* 结果页浮动按钮（水平排列） */
.result-float-widget {
  position: relative;
  z-index: 100;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  gap: 16px;
  margin-bottom: 16px;
}

/* 双色球：图标在主按钮左侧，向左展开 */
.result-float-widget.expand-left {
  flex-direction: row;
}
.result-float-widget.expand-left .result-main-btn {
  order: 2;
}
.result-float-widget.expand-left .result-icon-list-horizontal {
  order: 1;
}

/* 大乐透：图标在主按钮右侧，向右展开 */
.result-float-widget.expand-right {
  flex-direction: row;
}
.result-float-widget.expand-right .result-main-btn {
  order: 1;
}
.result-float-widget.expand-right .result-icon-list-horizontal {
  order: 2;
}

/* 结果页液态玻璃主按钮 */
.result-main-btn {
  width: 58px;
  height: 58px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.4);
  backdrop-filter: blur(16px) saturate(200%);
  -webkit-backdrop-filter: blur(16px) saturate(200%);
  border: 1px solid rgba(255, 255, 255, 0.5);
  color: #92400E;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.08);
  transition: all 0.4s cubic-bezier(0.22, 1, 0.36, 1);
  padding: 0;
  outline: none;
  flex-shrink: 0;
}

.result-main-btn:hover {
  background: rgba(255, 255, 255, 0.55);
  transform: scale(1.06);
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.12);
}

.result-btn-icon {
  width: 32px;
  height: 32px;
  color: #92400E;
}

/* 结果页主按钮 Tooltip - 显示在下方 */
.result-main-btn-tooltip {
  position: absolute;
  top: calc(100% + 6px);
  left: 50%;
  transform: translateX(-50%);
  background: rgba(0, 0, 0, 0.75);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  color: #FFFFFF;
  font-size: 12px;
  font-weight: 500;
  padding: 4px 10px;
  border-radius: 6px;
  white-space: nowrap;
  opacity: 0;
  visibility: hidden;
  transition: opacity 0.2s, visibility 0.2s;
  pointer-events: none;
  font-family: 'SourceHanSans-Medium';
}

.result-main-btn-tooltip::before {
  content: '';
  position: absolute;
  bottom: 100%;
  left: 50%;
  transform: translateX(-50%);
  border: 5px solid transparent;
  border-bottom-color: rgba(0, 0, 0, 0.75);
}

.result-main-btn:hover .result-main-btn-tooltip {
  opacity: 1;
  visibility: visible;
}

/* 结果页水平图标列表容器 */
.result-icon-list-horizontal {
  display: flex;
  flex-direction: row;
  gap: 12px;
  max-width: 0;
  overflow: visible;
  opacity: 0;
  transition: max-width 0.4s cubic-bezier(0.4, 0, 0.2, 1),
              opacity 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.result-icon-list-horizontal.show {
  max-width: 300px;
  opacity: 1;
}

/* 结果页水平排列子图标 */
.result-icon-item-h {
  position: relative;
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.35);
  backdrop-filter: blur(14px) saturate(180%);
  -webkit-backdrop-filter: blur(14px) saturate(180%);
  border: 1px solid rgba(255, 255, 255, 0.45);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.06);
  color: #92400E;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  opacity: 0;
  transform: scale(0.5);
  transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
  flex-shrink: 0;
}

.result-icon-item-h.show {
  opacity: 1;
  transform: scale(1);
}

.result-icon-item-h:nth-child(1) { transition-delay: 0.05s; }
.result-icon-item-h:nth-child(2) { transition-delay: 0.1s; }
.result-icon-item-h:nth-child(3) { transition-delay: 0.15s; }

/* 确保 hover 时显示 tooltip */
.result-icon-item-h:hover {
  background: rgba(255, 255, 255, 0.6);
  transform: scale(1.08);
  transition: transform 0.2s ease;
}

.result-icon-item-h:hover .result-icon-item-tooltip-h {
  opacity: 1;
  visibility: visible;
}

.result-icon-emoji-h {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 22px;
  height: 22px;
  line-height: 1;
}

.result-icon-svg-h {
  width: 22px;
  height: 22px;
}

/* 结果页水平 Tooltip - 显示在下方（与财富自由一致） */
.result-icon-item-tooltip-h {
  position: absolute;
  top: calc(100% + 6px);
  left: 50%;
  transform: translateX(-50%);
  background: rgba(0, 0, 0, 0.75);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  color: #FFFFFF;
  font-size: 11px;
  font-weight: 500;
  padding: 3px 8px;
  border-radius: 5px;
  white-space: nowrap;
  opacity: 0;
  visibility: hidden;
  transition: opacity 0.2s ease, visibility 0.2s ease;
  pointer-events: none;
  z-index: 150;
  font-family: 'SourceHanSans-Medium';
}

.result-icon-item-tooltip-h::before {
  content: '';
  position: absolute;
  bottom: 100%;
  left: 50%;
  transform: translateX(-50%);
  border: 4px solid transparent;
  border-bottom-color: rgba(0, 0, 0, 0.75);
}

.result-icon-item-h:hover .result-icon-item-tooltip-h {
  opacity: 1;
  visibility: visible;
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

/* 移动端适配 */
@media screen and (max-width: 767px) {
  /* 浮动按钮移动端适配 - 居中显示 */
  .result-float-widget {
    position: relative;
    top: auto;
    right: auto;
    transform: none;
    margin-bottom: 12px;
  }

  .result-main-btn {
    width: 50px;
    height: 50px;
  }

  .result-btn-icon {
    width: 28px;
    height: 28px;
  }

  .result-icon-item-h {
    width: 42px;
    height: 42px;
  }

  .result-icon-emoji-h {
    width: 20px;
    height: 20px;
  }

  .result-icon-svg-h {
    width: 20px;
    height: 20px;
  }

  .result-icon-item-tooltip-h {
    display: none;
  }

  .result-main-btn-tooltip {
    display: none;
  }

  /* 结果页主内容区移动端适配 */
  .result-main {
    flex: 1;
  }

  .main-inner {
    padding: 16px 12px;
  }

  .result-card {
    padding: 0;
  }

  .ticket-container {
    padding: 12px;
  }

  .brand-header {
    height: 64px;
  }

  .lottery-title {
    font-size: 24px;
  }

  .note-row {
    overflow-x: auto;
    flex-wrap: nowrap;
  }

  .ball {
    width: 30px !important;
    height: 30px !important;
  }

  .ball-text {
    font-size: 14px !important;
  }

  .ball-spacer {
    width: 6px !important;
  }

  .note-label {
    font-size: 13px;
  }

  .note-separator {
    font-size: 16px;
  }

  .spacer-w8 {
    width: 6px;
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
  .result-card {
    padding: 0;
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
  .main-inner {
    padding: 12px 168px;
    max-width: 768px;
    gap: 8px;
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

/* 移动端适配修正：规则弹窗 */
@media screen and (max-width: 767px) {
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
