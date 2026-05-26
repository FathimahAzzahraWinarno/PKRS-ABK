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
    {
      path: '/admin',
      name: 'admin',
      component: () => import('../views/admin/AdminView.vue'),
    },
  ],
})

router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('token')
  const isValidToken = token && token !== 'null' && token !== 'undefined'

  let user = {}
  try {
    const userStr = localStorage.getItem('user')
    if (userStr && userStr !== 'null' && userStr !== 'undefined') {
      user = JSON.parse(userStr)
    }
  } catch (error) {
    user = {}
  }

  // 1. Jika mencoba mengakses halaman admin (/admin)
  if (to.path.startsWith('/admin') || to.name === 'admin') {
    if (!isValidToken) {
      next({ name: 'login' })
    } else if (user.role !== 'superadmin') {
      next({ name: 'home' })
    } else {
      next()
    }
  }
  // 2. Mencegah akses ke halaman selain login jika token tidak ditemukan
  else if (to.path !== '/login' && to.name !== 'login' && !isValidToken) {
    next({ name: 'login' })
  } 
  // 3. Jika sudah login tapi ingin ke halaman login lagi, arahkan ke home
  else if ((to.path === '/login' || to.name === 'login') && isValidToken) {
    next({ name: 'home' })
  } 
  else {
    next()
  }
})

export default router


