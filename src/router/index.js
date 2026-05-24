import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/home/HomeView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
    },
    {
      path: '/login',
      name: 'login',
      component: () => import('../views/login/loginPage.vue'),
    },
    {
      path: '/mengenal-tubuhku',
      name: 'mengenal-tubuhku',
      component: () => import('../views/mengenal-tubuhku/MengenalTubuhku.vue'),
    },
    {
      path: '/makanan-sehat',
      name: 'makanan-sehat',
      component: () => import('../views/makanan-sehat/MakananSehat.vue'),
    },
    {
      path: '/olahraga-aktivitas',
      name: 'olahraga-aktivitas',
      component: () => import('../views/olahraga-aktivitas/OlahragaAktivitas.vue'),
    },
  ],
})

export default router
