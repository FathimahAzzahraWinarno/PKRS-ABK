<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'
import confetti from 'canvas-confetti'

// Subcomponents
import AdminDashboard from './dashboard/AdminDashboard.vue'
import AdminUsers from './users/AdminUsers.vue'

const router = useRouter()

// UI & Navigation States
const currentView = ref('dashboard') // 'dashboard' | 'users'
const activeTab = ref('approved')    // 'approved' | 'pending'
const isSidebarExpanded = ref(false) // For mobile collapse

// Data States
const isLoading = ref(true)
const errorMessage = ref('')
const stats = ref({ pending: 0, approved: 0, rejected: 0 })
const latestPending = ref([])
const allUsersList = ref([])

// Form Inputs States for Reset Password
const isPasswordSaving = ref({})
const adminUsersRef = ref(null)

// Notification Toast States
const notificationMessage = ref('')
const notificationType = ref('success') // 'success' | 'error'

// Sound Synthesis using Web Audio API (Offline & Premium feedback)
const playPopSound = () => {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)()
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.connect(gain)
    gain.connect(ctx.destination)
    
    osc.type = 'sine'
    osc.frequency.setValueAtTime(450, ctx.currentTime)
    osc.frequency.exponentialRampToValueAtTime(900, ctx.currentTime + 0.1)
    
    gain.gain.setValueAtTime(0.12, ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1)
    
    osc.start()
    osc.stop(ctx.currentTime + 0.1)
  } catch (e) {}
}

const playSuccessSound = () => {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)()
    const now = ctx.currentTime
    const notes = [523.25, 659.25, 783.99, 1046.50]
    
    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.connect(gain)
      gain.connect(ctx.destination)
      
      osc.type = 'triangle'
      osc.frequency.setValueAtTime(freq, now + idx * 0.08)
      
      gain.gain.setValueAtTime(0.12, now + idx * 0.08)
      gain.gain.exponentialRampToValueAtTime(0.01, now + idx * 0.08 + 0.2)
      
      osc.start(now + idx * 0.08)
      osc.stop(now + idx * 0.08 + 0.2)
    })
  } catch (e) {}
}

const playErrorSound = () => {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)()
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.connect(gain)
    gain.connect(ctx.destination)
    
    osc.type = 'sawtooth'
    osc.frequency.setValueAtTime(150, ctx.currentTime)
    osc.frequency.linearRampToValueAtTime(90, ctx.currentTime + 0.2)
    
    gain.gain.setValueAtTime(0.1, ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2)
    
    osc.start()
    osc.stop(ctx.currentTime + 0.2)
  } catch (e) {}
}

// 1. Fetch Ringkasan Statistik
const fetchStats = async () => {
  const token = localStorage.getItem('token')
  try {
    const response = await axios.get('http://localhost:3000/api/users/stats', {
      headers: { Authorization: `Bearer ${token}` }
    })
    stats.value = response.data
  } catch (error) {
    throw error
  }
}

// 2. Fetch 3 Pendaftar Pending Terbaru untuk Dashboard
const fetchLatestPending = async () => {
  const token = localStorage.getItem('token')
  try {
    const response = await axios.get('http://localhost:3000/api/users/pending?limit=3', {
      headers: { Authorization: `Bearer ${token}` }
    })
    latestPending.value = response.data.users
  } catch (error) {
    throw error
  }
}

// 3. Fetch Seluruh User (selain Superadmin) untuk Manajemen User
const fetchAllUsers = async () => {
  const token = localStorage.getItem('token')
  try {
    const response = await axios.get('http://localhost:3000/api/users', {
      headers: { Authorization: `Bearer ${token}` }
    })
    allUsersList.value = response.data.users
  } catch (error) {
    throw error
  }
}

// 4. Fetch Semua Data Sekaligus (Inisialisasi & Refresh)
const fetchAllData = async (showLoader = true) => {
  if (showLoader) isLoading.value = true
  errorMessage.value = ''
  
  try {
    await Promise.all([
      fetchStats(),
      fetchLatestPending(),
      fetchAllUsers()
    ])
  } catch (error) {
    if (error.response && (error.response.status === 401 || error.response.status === 403)) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      router.push('/login')
    } else {
      errorMessage.value = 'Gagal memuat data dari server backend. Pastikan server sudah aktif! 🔌'
    }
  } finally {
    if (showLoader) isLoading.value = false
  }
}

// Approve User
const handleApprove = async (id, nameOrUsername) => {
  playPopSound()
  const token = localStorage.getItem('token')

  try {
    await axios.patch(`http://localhost:3000/api/users/${id}/approve`, {}, {
      headers: { Authorization: `Bearer ${token}` }
    })

    // Confetti & Suara Sukses
    playSuccessSound()
    confetti({
      particleCount: 30,
      spread: 50,
      colors: ['#7cd0b8', '#fbc72b', '#b4a6f2']
    })

    showNotification(`Akun "${nameOrUsername}" berhasil disetujui! 🚀`, 'success')
    
    // Refresh data tanpa loading indicator agar transisi instan
    await fetchAllData(false)
  } catch (error) {
    playErrorSound()
    showNotification('Gagal menyetujui akun tersebut.', 'error')
  }
}

// Reject User
const handleReject = async (id, nameOrUsername) => {
  playPopSound()
  const token = localStorage.getItem('token')

  try {
    await axios.patch(`http://localhost:3000/api/users/${id}/reject`, {}, {
      headers: { Authorization: `Bearer ${token}` }
    })

    playErrorSound()
    showNotification(`Akun "${nameOrUsername}" telah ditolak. 🙅‍♂️`, 'error')
    
    // Refresh data tanpa loading indicator
    await fetchAllData(false)
  } catch (error) {
    playErrorSound()
    showNotification('Gagal menolak akun tersebut.', 'error')
  }
}

// Reset Password User (Khusus Superadmin)
const handleResetPassword = async (userId, username, newPassword) => {
  if (!newPassword || newPassword.trim().length === 0) {
    playErrorSound()
    showNotification('Silakan isi kata sandi baru terlebih dahulu!', 'error')
    return
  }

  playPopSound()
  const token = localStorage.getItem('token')
  isPasswordSaving.value[userId] = true

  try {
    await axios.patch(`http://localhost:3000/api/users/${userId}/password`, {
      password: newPassword
    }, {
      headers: { Authorization: `Bearer ${token}` }
    })

    playSuccessSound()
    confetti({
      particleCount: 20,
      spread: 40,
      colors: ['#fad02c', '#7cd0b8']
    })

    showNotification(`Kata sandi untuk @${username} berhasil diubah! 🔑`, 'success')
    
    // Clear input inside the child component using exposed method
    if (adminUsersRef.value) {
      adminUsersRef.value.clearPasswordInput(userId)
    }
  } catch (error) {
    playErrorSound()
    const msg = error.response && error.response.data && error.response.data.message
      ? error.response.data.message
      : 'Gagal memperbarui kata sandi.'
    showNotification(msg, 'error')
  } finally {
    isPasswordSaving.value[userId] = false
  }
}

// Show auto-fading notification toast
const showNotification = (msg, type) => {
  notificationMessage.value = msg
  notificationType.value = type
  setTimeout(() => {
    notificationMessage.value = ''
  }, 4000)
}

const handleLogout = () => {
  localStorage.removeItem('token')
  localStorage.removeItem('user')
  playPopSound()
  router.push('/login')
}

onMounted(() => {
  fetchAllData()
  
  // Add full screen layout classes to body and app
  const app = document.getElementById('app')
  if (app) {
    app.classList.add('full-screen-layout')
  }
  document.body.classList.add('full-screen-body')
})

onUnmounted(() => {
  // Remove full-screen overrides on navigate out
  const app = document.getElementById('app')
  if (app) {
    app.classList.remove('full-screen-layout')
  }
  document.body.classList.remove('full-screen-body')
})
</script>

<template>
  <div class="relative w-full min-h-screen bg-[#fbfaf3] overflow-x-hidden font-outfit select-none flex">
    
    <!-- NOTIFICATION TOAST -->
    <Transition name="slide-fade">
      <div 
        v-if="notificationMessage"
        class="fixed top-6 right-6 z-50 px-6 py-4 rounded-[20px] shadow-2xl flex items-center gap-3 border-2 text-white font-bold tracking-wide transition-all duration-300"
        :class="notificationType === 'success' ? 'bg-[#7cd0b8] border-white shadow-[#7cd0b8]/20' : 'bg-[#ffa1b5] border-white shadow-[#ffa1b5]/20'"
      >
        <span class="text-xl">{{ notificationType === 'success' ? '🎉' : '❌' }}</span>
        <span>{{ notificationMessage }}</span>
      </div>
    </Transition>

    <!-- SIDEBAR (Left column on desktop) -->
    <aside 
      class="fixed md:static inset-y-0 left-0 w-[280px] shrink-0 bg-white/80 backdrop-blur-lg border-r border-[#e8f6f5] p-6 flex flex-col justify-between shadow-lg md:shadow-none transition-transform duration-300 z-30"
      :class="isSidebarExpanded ? 'translate-x-0' : '-translate-x-full md:translate-x-0'"
    >
      <!-- Brand & Navigation -->
      <div>
        <div class="flex items-center gap-3 mb-8">
          <div class="w-12 h-12 bg-[#70d5c9] rounded-full flex items-center justify-center border-2 border-white shadow-md select-none pointer-events-none">
            <svg width="34" height="34" viewBox="0 0 160 160" class="overflow-visible select-none pointer-events-none">
              <polygon points="45,65 30,40 58,52" fill="#a06a50" />
              <polygon points="115,65 130,40 102,52" fill="#a06a50" />
              <rect x="42" y="50" width="76" height="76" rx="38" fill="#a06a50" />
              <ellipse cx="80" cy="98" rx="22" ry="18" fill="#fecaca" />
              <circle cx="62" cy="74" r="19" fill="#fad02c" stroke="#d97706" stroke-width="2.5" />
              <circle cx="98" cy="74" r="19" fill="#fad02c" stroke="#d97706" stroke-width="2.5" />
              <rect x="75" y="72" width="10" height="4" fill="#d97706" />
              <circle cx="62" cy="74" r="13" fill="#ffffff" />
              <circle cx="98" cy="74" r="13" fill="#ffffff" />
              <circle cx="62" cy="74" r="6" fill="#1f2937" />
              <circle cx="60" cy="72" r="2.5" fill="#ffffff" />
              <circle cx="98" cy="74" r="6" fill="#1f2937" />
              <circle cx="96" cy="72" r="2.5" fill="#ffffff" />
              <polygon points="80,77 74,87 86,87" fill="#f97316" />
              <path d="M 42,75 C 28,75 28,105 42,105 Z" fill="#8c5843" />
              <path d="M 118,75 C 132,75 132,105 118,105 Z" fill="#8c5843" />
              <ellipse cx="68" cy="126" rx="6" ry="3.5" fill="#f97316" />
              <ellipse cx="92" cy="126" rx="6" ry="3.5" fill="#f97316" />
            </svg>
          </div>
          <div class="flex flex-col">
            <h1 class="text-lg font-black text-[#f88f57] uppercase tracking-wider leading-none">PKRS-ABK</h1>
            <span class="text-[10px] font-extrabold text-[#7a7a7a] mt-0.5">Superadmin 🛡️</span>
          </div>
        </div>

        <!-- Sidebar menu links -->
        <nav class="flex flex-col gap-3">
          <button 
            @click="currentView = 'dashboard'; isSidebarExpanded = false; playPopSound()"
            class="flex items-center gap-3 px-4 py-3.5 rounded-[18px] text-left font-bold text-sm tracking-wide transition-all duration-200 cursor-pointer"
            :class="currentView === 'dashboard' ? 'bg-[#70d5c9] text-white shadow-lg shadow-[#70d5c9]/25 hover:scale-[1.02]' : 'text-[#6b7280] hover:bg-[#70d5c9]/10 hover:text-[#5dc1b9]'"
          >
            <!-- Custom Premium SVG Bento Dashboard Icon -->
            <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 stroke-current" fill="none" viewBox="0 0 24 24">
              <path stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v10a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2z" />
            </svg>
            <span>Dashboard</span>
          </button>
          <button 
            @click="currentView = 'users'; isSidebarExpanded = false; playPopSound()"
            class="flex items-center gap-3 px-4 py-3.5 rounded-[18px] text-left font-bold text-sm tracking-wide transition-all duration-200 cursor-pointer"
            :class="currentView === 'users' ? 'bg-[#70d5c9] text-white shadow-lg shadow-[#70d5c9]/25 hover:scale-[1.02]' : 'text-[#6b7280] hover:bg-[#70d5c9]/10 hover:text-[#5dc1b9]'"
          >
            <!-- Custom Premium SVG Multi-User Icon -->
            <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 stroke-current" fill="none" viewBox="0 0 24 24">
              <path stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span>Manajemen User</span>
          </button>
        </nav>
      </div>

      <!-- Bottom sidebar info / Logout -->
      <div>
        <button 
          class="w-full bg-[#fff5f6] hover:bg-[#ffa1b5] border-2 border-[#ffa1b5]/60 text-[#ff6b8b] hover:text-white font-extrabold rounded-[18px] py-3.5 shadow-sm active:scale-95 hover:scale-[1.02] transition-all duration-200 text-sm cursor-pointer flex items-center justify-center gap-2"
          @click="handleLogout"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 stroke-current" fill="none" viewBox="0 0 24 24">
            <path stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
          </svg>
          <span>Keluar</span>
        </button>
      </div>
    </aside>

    <!-- Sidebar Backdrop overlay for mobile screen -->
    <div 
      v-if="isSidebarExpanded" 
      class="fixed inset-0 bg-black/20 backdrop-blur-sm z-20 md:hidden"
      @click="isSidebarExpanded = false"
    ></div>

    <!-- Hamburger Menu button for mobile (Floating since header is removed) -->
    <button 
      @click="isSidebarExpanded = !isSidebarExpanded; playPopSound()" 
      class="md:hidden fixed top-4 left-4 w-11 h-11 bg-white/80 backdrop-blur-md border border-[#e8f6f5] rounded-xl flex items-center justify-center text-[#374151] hover:bg-[#70d5c9]/10 active:scale-90 transition-all shadow-md z-40 cursor-pointer"
    >
      <span class="text-xl">☰</span>
    </button>

    <!-- MAIN CONTENT AREA (Right side) -->
    <div class="flex-grow min-h-screen flex flex-col p-6 pt-16 md:p-8 md:pt-8 overflow-y-auto">

      <!-- ERROR STATE -->
      <div v-if="errorMessage" class="bg-red-50 border-2 border-[#ffa1b5] text-[#b91c1c] rounded-[28px] p-6 text-center font-semibold mb-6 shadow-sm">
        <p class="mb-3 text-lg">⚠️ {{ errorMessage }}</p>
        <button 
          @click="fetchAllData(true)"
          class="bg-[#ffa1b5] text-white font-bold rounded-full px-5 py-2 hover:scale-105 active:scale-95 transition-transform duration-200 text-sm cursor-pointer"
        >
          Coba Lagi
        </button>
      </div>

      <!-- LOADING STATE -->
      <div v-else-if="isLoading" class="bg-white border-2 border-white rounded-[32px] p-12 shadow-md flex flex-col items-center justify-center flex-grow min-h-[350px]">
        <div class="w-12 h-12 border-4 border-[#70d5c9] border-t-transparent rounded-full animate-spin"></div>
        <p class="text-[#7a7a7a] font-bold mt-4 animate-pulse">Menghubungkan ke server, harap sabar ya... 🦉</p>
      </div>

      <!-- VIEW 1: DASHBOARD VIEW -->
      <AdminDashboard
        v-else-if="currentView === 'dashboard'"
        :stats="stats"
        :latestPending="latestPending"
        @approve="handleApprove"
        @reject="handleReject"
        @view-all="currentView = 'users'; activeTab = 'pending'; playPopSound()"
      />

      <!-- VIEW 2: ALL USERS LIST (MANAJEMEN USER WITH 2 TABS) -->
      <AdminUsers
        v-else
        ref="adminUsersRef"
        v-model:activeTab="activeTab"
        :allUsersList="allUsersList"
        :isPasswordSaving="isPasswordSaving"
        @approve="handleApprove"
        @reject="handleReject"
        @reset-password="handleResetPassword"
      />

      <!-- MAIN PAGE FOOTER -->
      <footer class="text-center text-xs font-semibold text-[#a5a5a5] py-8 border-t border-[#e8f6f5] mt-auto">
        PKRS-ABK &copy; 2026. Dashboard Superadmin Pengendalian Keamanan Akses.
      </footer>
    </div>
  </div>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800&display=swap');

.slide-fade-enter-active {
  transition: all 0.3s ease-out;
}
.slide-fade-leave-active {
  transition: all 0.3s cubic-bezier(1, 0.5, 0.8, 1);
}
.slide-fade-enter-from,
.slide-fade-leave-to {
  transform: translateY(-20px);
  opacity: 0;
}

@keyframes bounce-slow {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-7px); }
}
.animate-bounce-slow {
  animation: bounce-slow 3s infinite ease-in-out;
}

.font-outfit {
  font-family: 'Outfit', sans-serif;
}
</style>
