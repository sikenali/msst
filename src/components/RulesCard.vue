<script setup lang="ts">
import { computed } from 'vue'
import { RiLightbulbLine } from '@remixicon/vue'

interface Props {
  lotteryType?: 'ssq' | 'dlt'
}

interface RuleItem {
  num: string
  text: string
  color: string
  bg: string
}

const props = withDefaults(defineProps<Props>(), {
  lotteryType: 'ssq'
})

const rules: Record<'ssq' | 'dlt', RuleItem[]> = {
  ssq: [
    { num: '1', text: '红球：从1-33中随机选择6个不重复号码，按升序排列', color: '#DC2626', bg: '#FEE2E2' },
    { num: '2', text: '蓝球：从1-16中随机选择1个号码', color: '#2563EB', bg: '#DBEAFE' },
    { num: '3', text: '支持单式、自定义注数、复式多种投注模式', color: '#D97706', bg: '#FEF3C7' },
  ],
  dlt: [
    { num: '1', text: '前区：从1-35中随机选择5个不重复号码，按升序排列', color: '#DC2626', bg: '#FEE2E2' },
    { num: '2', text: '后区：从1-12中随机选择2个不重复号码', color: '#2563EB', bg: '#DBEAFE' },
    { num: '3', text: '支持单式、自定义注数、复式多种投注模式', color: '#D97706', bg: '#FEF3C7' },
  ],
}

const title = computed(() => props.lotteryType === 'ssq' ? '双色球玩法规则' : '大乐透玩法规则')
const currentRules = computed(() => rules[props.lotteryType])
</script>

<template>
  <div
    style="width: 100%; border-radius: 12px; overflow: hidden; background: rgba(255,255,255,1); border: 0.7px solid #FDE68A; box-shadow: 0 4px 6px rgba(0,0,0,0.1), 0 10px 15px rgba(0,0,0,0.1);"
  >
    <!-- 标题 -->
    <div style="display: flex; align-items: center; padding: 24px 24px 0 24px;">
      <RiLightbulbLine style="width: 22px; height: 28px; color: #D97706;" />
      <div style="width: 8px;"></div>
      <h2 style="font-size: 20px; font-weight: 700; line-height: 1.2; color: #92400E; font-family: 'SourceHanSans-Bold'">{{ title }}</h2>
    </div>

    <!-- 间距 16px -->
    <div style="height: 16px;"></div>

    <!-- 规则列表 -->
    <div style="padding: 0 24px 24px 24px;">
      <div
        v-for="(rule, index) in currentRules"
        :key="rule.num"
        style="display: flex; align-items: flex-start;"
        :style="{ marginBottom: index < currentRules.length - 1 ? '8px' : '0' }"
      >
        <div
          style="width: 24px; height: 24px; border-radius: 9999px; display: flex; align-items: center; justify-content: center; flex-shrink: 0;"
          :style="{ background: rule.bg }"
        >
          <span
            style="font-size: 14px; font-weight: 600; line-height: 1.2; font-family: 'SourceHanSans-SemiBold';"
            :style="{ color: rule.color }"
          >{{ rule.num }}</span>
        </div>
        <div style="width: 8px;"></div>
        <p
          style="flex: 1; font-size: 16px; line-height: 1.2; color: #78350F; font-family: 'SourceHanSans-Regular'; margin: 0;"
          :style="{ marginBottom: index < currentRules.length - 1 ? '8px' : '0' }"
        >
          {{ rule.text }}
        </p>
      </div>
    </div>
  </div>
</template>
