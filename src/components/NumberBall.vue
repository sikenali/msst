<script setup lang="ts">
interface Props {
  number?: string
  color?: 'red' | 'blue'
  size?: 'small' | 'large'
}

withDefaults(defineProps<Props>(), {
  number: '',
  color: 'red',
  size: 'small'
})
</script>

<template>
  <div
    class="number-ball"
    :class="['number-ball--' + size, 'number-ball--' + color]"
  >
    {{ number }}
  </div>
</template>

<style scoped>
.number-ball {
  border-radius: 9999px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  border: 4px solid #FFFFFF;
  color: #FFFFFF;
  user-select: none;
  transition: transform 0.15s;
}

.number-ball--small {
  width: 36px;
  height: 36px;
  font-size: 16px;
  border-width: 3px;
}

.number-ball--large {
  width: 40px;
  height: 40px;
  font-size: 14px;
  border-width: 2.5px;
}

/* Red Gradient */
.number-ball--red {
  background: linear-gradient(180deg, rgba(239,68,68,1) 0%, rgba(220,38,38,1) 100%);
  box-shadow: 0 1px 3px rgba(0,0,0,0.1), 0 4px 8px rgba(0,0,0,0.05);
}

/* Blue Gradient */
.number-ball--blue {
  background: linear-gradient(180deg, rgba(59,130,246,1) 0%, rgba(37,99,235,1) 100%);
  box-shadow: 0 1px 3px rgba(0,0,0,0.1), 0 4px 8px rgba(0,0,0,0.05);
}

/* Tablet Responsive */
@media screen and (max-width: 767px) {
  .number-ball--large {
    width: 32px;
    height: 32px;
    font-size: 12px;
    border-width: 2px;
  }
}

/* Mobile Responsive */
@media screen and (max-width: 480px) {
  .number-ball--large {
    width: 26px;
    height: 26px;
    font-size: 10px;
    border-width: 1.5px;
  }
}
</style>
