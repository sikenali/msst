import { createRouter, createWebHistory } from 'vue-router'
import HomePage from '@/views/HomePage.vue'
import ResultPage from '@/views/ResultPage.vue'
import RuleAnalysis from '@/views/RuleAnalysis.vue'

export const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomePage,
    },
    {
      path: '/result',
      name: 'result',
      component: ResultPage,
    },
    {
      path: '/analysis',
      name: 'analysis',
      component: RuleAnalysis,
    },
  ],
})
