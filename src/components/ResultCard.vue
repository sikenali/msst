<script setup lang="ts">
import NumberBall from './NumberBall.vue'

interface Props {
  lotteryType: 'ssq' | 'dlt'
  numbers: Array<{
    red?: number[]
    blue?: number[]
    front?: number[]
    back?: number[]
  }>
  issueNumber: string
  metaTime: string
  metaMode: string
}

const props = defineProps<Props>()
</script>

<template>
  <div class="bg-white rounded-2xl p-8" style="box-shadow: 0 4px 6px rgba(0,0,0,0.1), 0 10px 15px rgba(0,0,0,0.1);">
    <!-- 玩法标题 -->
    <div class="flex items-center justify-center mb-8">
      <div class="w-[25px] h-[24px] rounded-full bg-[#EF4444]"></div>
      <div v-if="lotteryType === 'dlt'" class="w-[25px] h-[24px] rounded-full bg-[#3B82F6] ml-2"></div>
      <div class="w-2"></div>
      <h2 class="text-[20px] font-bold text-[#1F2937]" :style="{ fontFamily: 'SourceHanSans-Bold' }">{{ issueNumber }}</h2>
    </div>

    <!-- 号码展示 -->
    <div class="flex justify-center items-center gap-2">
      <template v-if="lotteryType === 'ssq' && numbers[0]?.red">
        <NumberBall v-for="(num, i) in numbers[0].red" :key="`r-${i}`" :number="String(num).padStart(2, '0')" color="red" />
      </template>
      <template v-else-if="lotteryType === 'dlt' && numbers[0]?.front">
        <NumberBall v-for="(num, i) in numbers[0].front" :key="`f-${i}`" :number="String(num).padStart(2, '0')" color="red" />
      </template>
      <template v-if="lotteryType === 'ssq' && numbers[0]?.blue">
        <NumberBall v-for="(num, i) in numbers[0].blue" :key="`b-${i}`" :number="String(num).padStart(2, '0')" color="blue" />
      </template>
      <template v-else-if="lotteryType === 'dlt' && numbers[0]?.back">
        <NumberBall v-for="(num, i) in numbers[0].back" :key="`b-${i}`" :number="String(num).padStart(2, '0')" color="blue" />
      </template>
    </div>

    <!-- 生成信息 -->
    <div class="mt-8 pt-4">
      <p class="text-[14px] text-[#6B7280] text-center" :style="{ fontFamily: 'SourceHanSans-Regular' }">{{ metaTime }}</p>
      <p class="text-[14px] text-[#6B7280] text-center mt-1" :style="{ fontFamily: 'SourceHanSans-Regular' }">{{ metaMode }}</p>
    </div>
  </div>
</template>
