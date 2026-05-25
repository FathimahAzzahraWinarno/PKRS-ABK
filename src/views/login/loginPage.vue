<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import confetti from 'canvas-confetti'
import lottie from 'lottie-web'
import axios from 'axios'
import cuteTigerLottie from '../../assets/lottie/Cute Tiger.json'

const router = useRouter()

// Pending modal states
const isPending = ref(false)
const pendingMessage = ref('')

// Form states
const isRegisterMode = ref(false)
const nama = ref('')
const username = ref('')
const password = ref('')
const isNamaFocused = ref(false)
const isUsernameFocused = ref(false)
const isPasswordFocused = ref(false)
const isExcited = ref(false)
const isSuccess = ref(false)
const isShaking = ref(false)
const isBlinking = ref(false)

// Parallax background states
const mouseX = ref(0)
const mouseY = ref(0)

// Lottie Tiger Mascot state
const lottieTigerContainer = ref(null)
let lottieTigerInstance = null

// Pupil tracking calculations
const usernameLength = computed(() => username.value.length)
const pupilsStyle = computed(() => {
  if (isUsernameFocused.value) {
    // Map text length (0 to 20 chars) to pupil X movement (-5px to 5px)
    const x = Math.min(5, Math.max(-5, (usernameLength.value - 10) * 0.5))
    return `transform: translate(${x}px, 3px);`
  }
  return 'transform: translate(0px, 0px);'
})

// Wing peek-a-boo calculations
const leftWingStyle = computed(() => {
  if (isPasswordFocused.value) {
    return 'transform: translate(16px, -6px) rotate(135deg);'
  }
  return 'transform: rotate(0deg);'
})

const rightWingStyle = computed(() => {
  if (isPasswordFocused.value) {
    return 'transform: translate(-16px, -6px) rotate(-135deg);'
  }
  return 'transform: rotate(0deg);'
})

// Sound Synthesis using Web Audio API (Guaranteed offline and lightweight)
const playPopSound = () => {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)()
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.connect(gain)
    gain.connect(ctx.destination)
    
    osc.type = 'sine'
    osc.frequency.setValueAtTime(400, ctx.currentTime)
    osc.frequency.exponentialRampToValueAtTime(800, ctx.currentTime + 0.12)
    
    gain.gain.setValueAtTime(0.2, ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.12)
    
    osc.start()
    osc.stop(ctx.currentTime + 0.12)
  } catch (e) {
    // Audio Context not supported or allowed yet
  }
}

const playSuccessSound = () => {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)()
    const now = ctx.currentTime
    const notes = [523.25, 659.25, 783.99, 1046.50] // C5 - E5 - G5 - C6 arpeggio
    
    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.connect(gain)
      gain.connect(ctx.destination)
      
      osc.type = 'triangle'
      osc.frequency.setValueAtTime(freq, now + idx * 0.08)
      
      gain.gain.setValueAtTime(0.15, now + idx * 0.08)
      gain.gain.exponentialRampToValueAtTime(0.01, now + idx * 0.08 + 0.25)
      
      osc.start(now + idx * 0.08)
      osc.stop(now + idx * 0.08 + 0.25)
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
    osc.frequency.setValueAtTime(120, ctx.currentTime)
    osc.frequency.linearRampToValueAtTime(70, ctx.currentTime + 0.25)
    
    gain.gain.setValueAtTime(0.12, ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.25)
    
    osc.start()
    osc.stop(ctx.currentTime + 0.25)
  } catch (e) {}
}

// Mouse Parallax movement
const handleMouseMove = (e) => {
  mouseX.value = (e.clientX / window.innerWidth) - 0.5
  mouseY.value = (e.clientY / window.innerHeight) - 0.5
}

// Sparkle/Blink effect timer
let blinkInterval
onMounted(() => {
  window.addEventListener('mousemove', handleMouseMove)
  
  // Add full screen layout classes to body and app
  const app = document.getElementById('app')
  if (app) {
    app.classList.add('full-screen-layout')
  }
  document.body.classList.add('full-screen-body')

  // Load static cute tiger animation offline
  try {
    lottieTigerInstance = lottie.loadAnimation({
      container: lottieTigerContainer.value,
      renderer: 'svg',
      loop: true,
      autoplay: true,
      animationData: cuteTigerLottie
    })
  } catch (e) {
    // Could not load cute tiger background animation
  }
  
  // Owl blinks every 3.5 seconds
  blinkInterval = setInterval(() => {
    isBlinking.value = true
    setTimeout(() => {
      isBlinking.value = false
    }, 150)
  }, 3500)
})

onUnmounted(() => {
  window.removeEventListener('mousemove', handleMouseMove)
  clearInterval(blinkInterval)

  // Remove full screen layout classes
  const app = document.getElementById('app')
  if (app) {
    app.classList.remove('full-screen-layout')
  }
  document.body.classList.remove('full-screen-body')

  // Destroy Lottie Tiger animation to release memory cleanly
  if (lottieTigerInstance) {
    lottieTigerInstance.destroy()
  }
})

// Trigger shake animation for validation
const triggerShake = () => {
  isShaking.value = true
  playErrorSound()
  setTimeout(() => {
    isShaking.value = false
  }, 500)
}

// Submit handler (Connect to backend login/register with approval)
const handleLogin = async () => {
  if (isRegisterMode.value) {
    // === ALUR REGISTER ===
    if (!nama.value || !username.value || !password.value) {
      triggerShake()
      return
    }

    try {
      const response = await axios.post('http://localhost:3000/api/auth/register', {
        nama: nama.value,
        username: username.value,
        password: password.value
      })

      if (response.data.status === 'pending') {
        pendingMessage.value = response.data.message
        isPending.value = true
        // Clear form fields
        nama.value = ''
        username.value = ''
        password.value = ''
      }
    } catch (error) {
      triggerShake()
      if (error.response && error.response.data) {
        alert(error.response.data.message || 'Terjadi kesalahan saat mendaftar, coba lagi ya! 🦉')
      } else {
        alert('Gagal terhubung ke server backend PKRS-ABK. Pastikan server sudah aktif! 🔌')
      }
    }
  } else {
    // === ALUR LOGIN ===
    if (!username.value || !password.value) {
      triggerShake()
      return
    }

    try {
      const response = await axios.post('http://localhost:3000/api/auth/login', {
        username: username.value,
        password: password.value
      })

      if (response.data.status === 'approved') {
        // Save user session & JWT token
        localStorage.setItem('token', response.data.token)
        localStorage.setItem('user', JSON.stringify(response.data.user))

        isSuccess.value = true
        playSuccessSound()

        // Celebrate with Confetti!
        const duration = 2.5 * 1000
        const end = Date.now() + duration

        const frame = () => {
          confetti({
            particleCount: 4,
            angle: 60,
            spread: 55,
            origin: { x: 0 },
            colors: ['#7cd0b8', '#fbc72b', '#b4a6f2', '#f7945d']
          })
          confetti({
            particleCount: 4,
            angle: 120,
            spread: 55,
            origin: { x: 1 },
            colors: ['#7cd0b8', '#fbc72b', '#b4a6f2', '#f7945d']
          })

          if (Date.now() < end) {
            requestAnimationFrame(frame)
          }
        }
        frame()

        // Redirect based on user role (Admin directly to /admin, User to Home /)
        setTimeout(() => {
          if (response.data.user.role === 'superadmin') {
            router.push('/admin')
          } else {
            router.push('/')
          }
        }, 2200)
      } else if (response.data.status === 'pending') {
        pendingMessage.value = response.data.message
        isPending.value = true
      }
    } catch (error) {
      triggerShake()
      if (error.response && error.response.data) {
        alert(error.response.data.message || 'Terjadi kesalahan, coba lagi ya! 🦉')
      } else {
        alert('Gagal terhubung ke server backend PKRS-ABK. Pastikan server sudah aktif! 🔌')
      }
    }
  }
}

const showHelp = () => {
  playPopSound()
  if (isRegisterMode.value) {
    alert("Halo adik-adik hebat! Masukkan nama lengkapmu, nama pengguna (username), dan kata sandi yang mudah diingat, lalu tekan tombol 'Daftar Akun' 💫 untuk mendaftar petualangan tubuh kita!")
  } else {
    alert("Halo adik-adik! Masukkan nama pengguna dan kata sandimu, lalu tekan tombol warna oranye berlogo roket 🚀 untuk masuk ke dunia petualangan kesehatan tubuh kita!")
  }
}
</script>

<template>
  <div class="relative w-full min-height-screen bg-[#fbfaf3] overflow-hidden flex items-center justify-center p-4 select-none font-outfit">
    <!-- BACKDROP PARALLAX ELEMENTS -->
    <!-- Green bubble (top left) -->
    <div 
      class="absolute w-[20vw] h-[20vw] max-w-[200px] max-h-[200px] bg-[#7cd0b8] rounded-full opacity-25 filter blur-[1px] transition-transform duration-300 ease-out"
      :style="{ transform: `translate(${mouseX * -35}px, ${mouseY * -35}px)`, left: '10%', top: '25%' }"
    ></div>
    
    <!-- Yellow bubble (bottom left) -->
    <div 
      class="absolute w-[18vw] h-[18vw] max-w-[180px] max-h-[180px] bg-[#fbc72b] rounded-full opacity-25 filter blur-[1px] transition-transform duration-300 ease-out"
      :style="{ transform: `translate(${mouseX * -20}px, ${mouseY * -20}px)`, left: '20%', bottom: '8%' }"
    ></div>
    
    <!-- Light Blue bubble (top middle) -->
    <div 
      class="absolute w-[15vw] h-[15vw] max-w-[150px] max-h-[150px] bg-[#9ad2d8] rounded-full opacity-25 filter blur-[1px] transition-transform duration-300 ease-out"
      :style="{ transform: `translate(${mouseX * 25}px, ${mouseY * 25}px)`, left: '46%', top: '5%' }"
    ></div>

    <!-- Purple bubble (top right) -->
    <div 
      class="absolute w-[16vw] h-[16vw] max-w-[160px] max-h-[160px] bg-[#b4a6f2] rounded-full opacity-25 filter blur-[1px] transition-transform duration-300 ease-out"
      :style="{ transform: `translate(${mouseX * -15}px, ${mouseY * -15}px)`, right: '28%', top: '20%' }"
    ></div>

    <!-- Orange bubble (right) -->
    <div 
      class="absolute w-[22vw] h-[22vw] max-w-[220px] max-h-[220px] bg-[#f7945d] rounded-full opacity-40 filter blur-[1px] transition-transform duration-300 ease-out"
      :style="{ transform: `translate(${mouseX * 40}px, ${mouseY * 40}px)`, right: '12%', top: '35%' }"
    ></div>

    <!-- Star & Icon Elements matching reference image -->
    <!-- Gold Star (top-left) -->
    <svg 
      class="absolute w-10 h-10 fill-[#fbc72b] transition-transform duration-300 ease-out animate-bounce-slow"
      :style="{ transform: `translate(${mouseX * 15}px, ${mouseY * 15}px)`, left: '7%', top: '10%' }"
      viewBox="0 0 24 24"
    >
      <path d="M12 .587l3.668 7.431 8.2 1.192-5.934 5.787 1.4 8.168L12 18.896l-7.334 3.857 1.4-8.168L.132 9.41l8.2-1.192L12 .587z"/>
    </svg>

    <!-- Crescent Moon/Banana (top-right) -->
    <div 
      class="absolute w-12 h-12 fill-[#fad02c] transition-transform duration-300 ease-out rotate-[30deg]"
      :style="{ transform: `translate(${mouseX * -25}px, ${mouseY * -25}px)`, right: '15%', top: '12%' }"
    >
      <svg class="w-full h-full text-[#fbc72b] fill-current" viewBox="0 0 24 24">
        <path d="M12.3 22h-.1c-5.5 0-10-4.5-10-10S6.7 2 12.2 2c.7 0 1.4.1 2 .3-.4.5-.6 1.1-.6 1.7 0 2.2 1.8 4 4 4 .6 0 1.2-.2 1.7-.6.2.6.3 1.3.3 2 0 5.5-4.5 10-9.8 10-.2 0-.3.4-.5.6z" />
      </svg>
    </div>

    <!-- Lightbulb (left-middle) -->
    <div 
      class="absolute w-10 h-10 transition-transform duration-300 ease-out"
      :style="{ transform: `translate(${mouseX * 10}px, ${mouseY * 10}px)`, left: '11%', top: '44%' }"
    >
      <span class="text-3xl filter drop-shadow animate-pulse">💡</span>
    </div>

    <!-- Sparkles (bottom-left) -->
    <div 
      class="absolute w-10 h-10 transition-transform duration-300 ease-out"
      :style="{ transform: `translate(${mouseX * -18}px, ${mouseY * -18}px)`, left: '16%', bottom: '26%' }"
    >
      <span class="text-3xl filter drop-shadow animate-spin-slow">✨</span>
    </div>

    <!-- Paint Palette (bottom-right) -->
    <div 
      class="absolute w-12 h-12 transition-transform duration-300 ease-out"
      :style="{ transform: `translate(${mouseX * 20}px, ${mouseY * 20}px)`, right: '22%', bottom: '16%' }"
    >
      <span class="text-4xl filter drop-shadow">🎨</span>
    </div>

    <!-- Orange sparkles (bottom-right-ish) -->
    <div 
      class="absolute w-10 h-10 transition-transform duration-300 ease-out"
      :style="{ transform: `translate(${mouseX * -12}px, ${mouseY * -12}px)`, right: '10%', top: '56%' }"
    >
      <span class="text-3xl filter drop-shadow">🌟</span>
    </div>

    <!-- LOTTIE CUTE TIGER MASCOT (Sticking to bottom-left, behind login card but in front of circles) -->
    <div 
      ref="lottieTigerContainer"
      class="absolute bottom-[-10px] left-[-10px] w-[260px] h-[260px] md:w-[480px] md:h-[480px] pointer-events-none opacity-[0.85] z-0 select-none overflow-hidden transition-transform duration-300 ease-out"
      :style="{ transform: `translate(${mouseX * 22}px, ${mouseY * 22}px)` }"
    ></div>

    <!-- MAIN LOGIN CARD (Glassmorphic) -->
    <div 
      class="relative w-full max-w-[460px] md:max-w-[520px] bg-white/80 backdrop-blur-lg rounded-[36px] md:rounded-[44px] shadow-2xl shadow-[#70d5c9]/5 p-8 md:p-10 flex flex-col items-center border border-white/80 z-10 transition-all duration-300"
      :class="{ 'animate-shake': isShaking, 'scale-102': isExcited, 'translate-y-[-4px]': isExcited }"
    >
      <!-- MASCOT: Custom Interactive SVG Owl -->
      <div 
        class="relative w-40 h-40 md:w-48 md:h-48 bg-[#70d5c9] rounded-full flex items-center justify-center shadow-inner overflow-hidden border-4 border-white mb-6 group cursor-pointer transition-all duration-200"
        @mouseenter="isExcited = true; playPopSound()"
        @mouseleave="isExcited = false"
        @click="isBlinking = true; playPopSound(); setTimeout(() => isBlinking = false, 150)"
      >
        <svg viewBox="0 0 160 160" class="w-[140px] h-[140px] md:w-[165px] md:h-[165px] overflow-visible select-none pointer-events-none transition-all duration-200">
          <!-- Cute Owl Ears -->
          <polygon points="45,65 30,40 58,52" fill="#a06a50" />
          <polygon points="115,65 130,40 102,52" fill="#a06a50" />
          
          <!-- Main Body -->
          <rect x="42" y="50" width="76" height="76" rx="38" fill="#a06a50" />
          
          <!-- Soft Pink Tummy -->
          <ellipse cx="80" cy="98" rx="22" ry="18" fill="#fecaca" />
          
          <!-- Yellow Glasses Frames -->
          <circle cx="62" cy="74" r="19" fill="#fad02c" stroke="#d97706" stroke-width="2.5" />
          <circle cx="98" cy="74" r="19" fill="#fad02c" stroke="#d97706" stroke-width="2.5" />
          <rect x="75" y="72" width="10" height="4" fill="#d97706" />
          
          <!-- Eyeballs -->
          <circle v-if="!isBlinking" cx="62" cy="74" r="13" fill="#ffffff" />
          <circle v-if="!isBlinking" cx="98" cy="74" r="13" fill="#ffffff" />
          
          <!-- Pupils (Tracks username cursor & moves with state) -->
          <g v-if="!isBlinking" :style="pupilsStyle" class="transition-transform duration-150 ease-out">
            <circle cx="62" cy="74" r="6" fill="#1f2937" />
            <circle cx="60" cy="72" r="2.5" fill="#ffffff" />
            <circle cx="98" cy="74" r="6" fill="#1f2937" />
            <circle cx="96" cy="72" r="2.5" fill="#ffffff" />
          </g>
          
          <!-- Closed Eyes when Blinking -->
          <g v-if="isBlinking">
            <path d="M 52,74 Q 62,81 72,74" stroke="#1f2937" stroke-width="3.5" fill="none" stroke-linecap="round" />
            <path d="M 88,74 Q 98,81 108,74" stroke="#1f2937" stroke-width="3.5" fill="none" stroke-linecap="round" />
          </g>
          
          <!-- Beak -->
          <polygon points="80,77 74,87 86,87" fill="#f97316" />
          
          <!-- Left Wing (Covering eyes when typing password / Flapping when excited) -->
          <path
            d="M 42,75 C 28,75 28,105 42,105 Z"
            fill="#8c5843"
            :style="leftWingStyle"
            :class="{ 'animate-flap-left': isExcited && !isPasswordFocused }"
            class="transition-transform duration-300 ease-in-out origin-[42px_80px]"
          />
          
          <!-- Right Wing (Covering eyes when typing password / Flapping when excited) -->
          <path
            d="M 118,75 C 132,75 132,105 118,105 Z"
            fill="#8c5843"
            :style="rightWingStyle"
            :class="{ 'animate-flap-right': isExcited && !isPasswordFocused }"
            class="transition-transform duration-300 ease-in-out origin-[118px_80px]"
          />
          
          <!-- Feet -->
          <ellipse cx="68" cy="126" rx="6" ry="3.5" fill="#f97316" />
          <ellipse cx="92" cy="126" rx="6" ry="3.5" fill="#f97316" />
        </svg>
      </div>

      <!-- TITLE & SUBTITLE -->
      <h1 class="text-3xl font-extrabold text-[#f88f57] tracking-wider mb-1 font-outfit uppercase">
        PKRS-ABK
      </h1>
      <p class="text-sm font-medium text-[#7a7a7a] mb-8 tracking-wide font-outfit transition-all duration-300">
        {{ isRegisterMode ? 'Buat Akun Petualangan Baru ✨' : 'Belajar Tentang Kesehatan Tubuh' }}
      </p>

      <!-- FORM FIELDS -->
      <form @submit.prevent="handleLogin" class="w-full flex flex-col gap-5">
        <!-- Nama Lengkap input (Hanya muncul di register mode) -->
        <Transition name="fade-slide">
          <div v-if="isRegisterMode" class="flex flex-col gap-2">
            <label class="text-[#4b5563] text-sm font-semibold ml-1">
              Nama Lengkap
            </label>
            <input 
              v-model="nama"
              type="text" 
              placeholder="Masukkan nama lengkapmu"
              class="w-full px-5 py-3.5 text-base border-2 border-[#70d5c9] rounded-[18px] outline-none text-[#374151] font-medium bg-[#fafefa] focus:bg-white focus:ring-4 focus:ring-[#70d5c9]/15 transition-all duration-200"
              @focus="isNamaFocused = true; isExcited = true; playPopSound()"
              @blur="isNamaFocused = false; isExcited = false"
              required
            />
          </div>
        </Transition>

        <!-- Username input -->
        <div class="flex flex-col gap-2">
          <label class="text-[#4b5563] text-sm font-semibold ml-1">
            Nama Pengguna
          </label>
          <input 
            v-model="username"
            type="text" 
            placeholder="Masukkan nama pengguna"
            class="w-full px-5 py-3.5 text-base border-2 border-[#70d5c9] rounded-[18px] outline-none text-[#374151] font-medium bg-[#fafefa] focus:bg-white focus:ring-4 focus:ring-[#70d5c9]/15 transition-all duration-200"
            @focus="isUsernameFocused = true; playPopSound()"
            @blur="isUsernameFocused = false"
            required
          />
        </div>

        <!-- Password input -->
        <div class="flex flex-col gap-2">
          <label class="text-[#4b5563] text-sm font-semibold ml-1">
            Kata Sandi
          </label>
          <input 
            v-model="password"
            type="password" 
            placeholder="Masukkan kata sandi"
            class="w-full px-5 py-3.5 text-base border-2 border-[#70d5c9] rounded-[18px] outline-none text-[#374151] font-medium bg-[#fafefa] focus:bg-white focus:ring-4 focus:ring-[#70d5c9]/15 transition-all duration-200"
            @focus="isPasswordFocused = true; playPopSound()"
            @blur="isPasswordFocused = false"
            required
          />
        </div>

        <!-- Submit Button -->
        <button 
          type="submit"
          class="w-full mt-4 py-4 bg-[#ff8c52] hover:bg-[#ff7936] text-white font-bold text-lg rounded-[20px] shadow-lg shadow-[#ff8c52]/30 active:scale-[0.97] hover:scale-[1.02] active:ring-2 active:ring-[#ff8c52]/40 transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer"
          @mouseenter="isExcited = true; playPopSound()"
          @mouseleave="isExcited = false"
        >
          <span>{{ isRegisterMode ? 'Daftar Akun' : 'Masuk' }}</span>
          <span class="text-xl animate-bounce-slow">{{ isRegisterMode ? '💫' : '🚀' }}</span>
        </button>
      </form>

      <!-- SUCCESS MODAL STATE -->
      <div 
        v-if="isSuccess"
        class="absolute inset-0 bg-white/95 rounded-[36px] flex flex-col items-center justify-center p-8 z-20 transition-opacity duration-300"
      >
        <span class="text-7xl animate-bounce">🎉</span>
        <h2 class="text-3xl font-extrabold text-[#7cd0b8] mt-4 uppercase tracking-wide">
          Berhasil!
        </h2>
        <p class="text-[#6b7280] font-medium mt-2 text-center">
          Selamat datang kembali, adik hebat! Bersiaplah untuk berpetualang... 🚀
        </p>
      </div>

      <!-- PENDING MODAL STATE -->
      <div 
        v-if="isPending"
        class="absolute inset-0 bg-white/95 rounded-[36px] flex flex-col items-center justify-center p-8 z-20 transition-opacity duration-300"
      >
        <span class="text-7xl animate-bounce-slow">⏳</span>
        <h2 class="text-3xl font-extrabold text-[#f7945d] mt-4 uppercase tracking-wide">
          Menunggu Admin!
        </h2>
        <p class="text-[#6b7280] font-semibold mt-4 text-center px-4 text-sm md:text-base leading-relaxed">
          {{ pendingMessage }}
        </p>
        <button 
          @click="isPending = false"
          class="mt-8 px-8 py-3 bg-[#70d5c9] hover:bg-[#5dc1b9] text-white font-bold rounded-full shadow-lg shadow-[#70d5c9]/30 hover:scale-105 active:scale-95 transition-transform duration-200 cursor-pointer"
        >
          Tutup 🦉
        </button>
      </div>

      <!-- FOOTER LINKS -->
      <div class="mt-8 text-center text-xs font-semibold text-[#8a8a8a]">
        {{ isRegisterMode ? 'Sudah punya akun?' : 'Belum punya akun?' }} 
        <a href="#" class="text-[#ff8c52] hover:underline" @click.prevent="isRegisterMode = !isRegisterMode; playPopSound();">
          {{ isRegisterMode ? 'Masuk di sini' : 'Daftar di sini' }}
        </a>
      </div>
    </div>

    <!-- HELP QUESTION ICON BUTTON -->
    <button 
      class="fixed bottom-6 right-6 w-12 h-12 bg-[#1a1a1a] hover:bg-black rounded-full flex items-center justify-center text-white font-extrabold text-xl hover:scale-110 active:scale-95 transition-all duration-200 shadow-xl cursor-pointer"
      @click="showHelp"
    >
      ?
    </button>
  </div>
</template>

<style>
/* Custom animations & transitions */
.min-height-screen {
  min-height: 100vh;
}

@keyframes bounce-slow {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-8px); }
}
.animate-bounce-slow {
  animation: bounce-slow 2s infinite ease-in-out;
}

@keyframes spin-slow {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
.animate-spin-slow {
  animation: spin-slow 15s infinite linear;
}

@keyframes shake {
  0%, 100% { transform: translateX(0); }
  15%, 45%, 75% { transform: translateX(-8px); }
  30%, 60%, 90% { transform: translateX(8px); }
}
.animate-shake {
  animation: shake 0.4s ease-in-out;
}

/* Wing flapping animation keyframes */
@keyframes flap-left {
  0%, 100% { transform: rotate(0deg); }
  50% { transform: rotate(25deg) translateY(-4px) translateX(2px); }
}
@keyframes flap-right {
  0%, 100% { transform: rotate(0deg); }
  50% { transform: rotate(-25deg) translateY(-4px) translateX(-2px); }
}
.animate-flap-left {
  animation: flap-left 0.25s infinite ease-in-out;
}
.animate-flap-right {
  animation: flap-right 0.25s infinite ease-in-out;
}

.scale-102 {
  transform: scale(1.02);
}

/* Custom fonts styling fallback */
@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800&display=swap');
.font-outfit {
  font-family: 'Outfit', sans-serif;
}
/* Fade-slide transition for nama input */
.fade-slide-enter-active,
.fade-slide-leave-active {
  transition: all 0.3s ease;
}
.fade-slide-enter-from,
.fade-slide-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}
</style>
