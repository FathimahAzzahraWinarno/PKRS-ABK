<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import lottie from 'lottie-web'
import confetti from 'canvas-confetti'
import childLottie from '../../assets/lottie/child.json'

const router = useRouter()
const loggedInUser = ref(JSON.parse(localStorage.getItem('user') || '{}'))

const lottieContainer = ref(null)
let lottieInstance = null

const mouseX = ref(0)
const mouseY = ref(0)
const isBlinking = ref(false)

const handleMouseMove = (e) => {
  mouseX.value = (e.clientX / window.innerWidth) - 0.5
  mouseY.value = (e.clientY / window.innerHeight) - 0.5
}

let blinkInterval
onMounted(() => {
  window.addEventListener('mousemove', handleMouseMove)
  const app = document.getElementById('app')
  if (app) {
    app.classList.add('full-screen-layout')
  }
  document.body.classList.add('full-screen-body')
  try {
    lottieInstance = lottie.loadAnimation({
      container: lottieContainer.value,
      renderer: 'svg',
      loop: true,
      autoplay: true,
      animationData: childLottie
    })
  } catch (e) {}
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
  const app = document.getElementById('app')
  if (app) {
    app.classList.remove('full-screen-layout')
  }
  document.body.classList.remove('full-screen-body')
  if (lottieInstance) {
    lottieInstance.destroy()
  }
})

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

const playNote = (freq, type = 'sine') => {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)()
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.type = type
    osc.frequency.setValueAtTime(freq, ctx.currentTime)
    osc.frequency.linearRampToValueAtTime(freq * 1.01, ctx.currentTime + 0.05)
    osc.frequency.linearRampToValueAtTime(freq, ctx.currentTime + 0.1)
    gain.gain.setValueAtTime(0.2, ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.65)
    osc.start()
    osc.stop(ctx.currentTime + 0.65)
  } catch (e) {}
}

const modules = ref([
  {
    id: 'd7',
    code: 'MODUL D7',
    title: 'Tubuhku, Aturanku',
    subtext: 'Video + 5 soal kuis · ±4 menit',
    icon: '🔒',
    borderColor: 'border-[#fca5a5]',
    bgColor: 'bg-[#fff5f5]',
    iconColor: 'bg-[#fecaca] text-[#ef4444]',
    textColor: 'text-[#ef4444]',
    accentColor: '#ffa1b5',
    noteFreq: 523.25,
    oscType: 'sine'
  },
  {
    id: 'd4',
    code: 'MODUL D4',
    title: 'Sentuhan Aman & Tidak Aman',
    subtext: 'Video + 5 soal kuis · ±4 menit',
    icon: '🛡️',
    borderColor: 'border-[#93c5fd]',
    bgColor: 'bg-[#f0f7ff]',
    iconColor: 'bg-[#dbeafe] text-[#2563eb]',
    textColor: 'text-[#2563eb]',
    accentColor: '#92cbd6',
    noteFreq: 659.25,
    oscType: 'triangle'
  },
  {
    id: 'd1',
    code: 'MODUL D1',
    title: 'Tubuhku Luar Biasa',
    subtext: 'Video + 5 soal kuis · ±4 menit',
    icon: '💪',
    borderColor: 'border-[#a7f3d0]',
    bgColor: 'bg-[#f0fdf4]',
    iconColor: 'bg-[#d1fae5] text-[#10b981]',
    textColor: 'text-[#10b981]',
    accentColor: '#5dc1b9',
    noteFreq: 783.99,
    oscType: 'sine'
  }
])

const handleModuleClick = (e, mod) => {
  playNote(mod.noteFreq, mod.oscType)
  const x = e.clientX / window.innerWidth
  const y = e.clientY / window.innerHeight
  confetti({
    particleCount: 18,
    spread: 65,
    origin: { x, y },
    colors: [mod.accentColor, '#ffffff']
  })
  setTimeout(() => {
    if (mod.id === 'd7') {
      router.push('/mengenal-tubuhku')
    } else if (mod.id === 'd4') {
      router.push('/makanan-sehat')
    } else if (mod.id === 'd1') {
      router.push('/olahraga-aktivitas')
    }
  }, 700)
}

const handleLogout = () => {
  localStorage.removeItem('token')
  localStorage.removeItem('user')
  playPopSound()
  confetti({
    particleCount: 20,
    angle: 90,
    spread: 80,
    origin: { y: 0.8 },
    colors: ['#ffa1b5', '#ffffff']
  })
  setTimeout(() => {
    router.push('/login')
  }, 400)
}
</script>

<template>
  <div class="relative w-full py-6 px-4 overflow-hidden select-none min-h-screen bg-[#fbfaf3] font-outfit">
    <div 
      class="absolute w-36 h-36 bg-[#7cd0b8] rounded-full opacity-20 filter blur-[2px] transition-transform duration-300 ease-out pointer-events-none"
      :style="{ transform: `translate(${mouseX * -25}px, ${mouseY * -25}px)`, left: '4%', top: '22%' }"
    ></div>
    
    <div 
      class="absolute w-40 h-40 bg-[#fbc72b] rounded-full opacity-20 filter blur-[2px] transition-transform duration-300 ease-out pointer-events-none"
      :style="{ transform: `translate(${mouseX * -15}px, ${mouseY * -15}px)`, left: '20%', bottom: '2%' }"
    ></div>
    
    <div 
      class="absolute w-44 h-44 bg-[#9ad2d8] rounded-full opacity-25 filter blur-[2px] transition-transform duration-300 ease-out pointer-events-none"
      :style="{ transform: `translate(${mouseX * 30}px, ${mouseY * 30}px)`, left: '48%', top: '1%' }"
    ></div>

    <div 
      class="absolute w-12 h-12 fill-[#fad02c] transition-transform duration-300 ease-out rotate-[25deg] pointer-events-none opacity-30"
      :style="{ transform: `translate(${mouseX * -20}px, ${mouseY * -20}px)`, right: '14%', top: '14%' }"
    >
      <svg class="w-full h-full text-[#fbc72b] fill-current" viewBox="0 0 24 24">
        <path d="M12.3 22h-.1c-5.5 0-10-4.5-10-10S6.7 2 12.2 2c.7 0 1.4.1 2 .3-.4.5-.6 1.1-.6 1.7 0 2.2 1.8 4 4 4 .6 0 1.2-.2 1.7-.6.2.6.3 1.3.3 2 0 5.5-4.5 10-9.8 10-.2 0-.3.4-.5.6z" />
      </svg>
    </div>

    <svg 
      class="absolute w-8 h-8 fill-[#fbc72b] transition-transform duration-300 ease-out animate-bounce-slow pointer-events-none opacity-40"
      :style="{ transform: `translate(${mouseX * 12}px, ${mouseY * 12}px)`, left: '6%', top: '12%' }"
      viewBox="0 0 24 24"
    >
      <path d="M12 .587l3.668 7.431 8.2 1.192-5.934 5.787 1.4 8.168L12 18.896l-7.334 3.857 1.4-8.168L.132 9.41l8.2-1.192L12 .587z"/>
    </svg>

    <div class="max-w-[1040px] mx-auto flex flex-col items-center relative z-10">
      <div class="w-full flex items-center justify-between mb-8 px-2">
        <div class="flex items-center gap-3">
          <div class="w-14 h-14 bg-[#70d5c9] rounded-full flex items-center justify-center border-2 border-white shadow-md hover:scale-105 active:scale-95 transition-transform duration-200 cursor-pointer">
            <svg width="46" height="46" viewBox="0 0 160 160" class="overflow-visible select-none pointer-events-none">
              <polygon points="45,65 30,40 58,52" fill="#a06a50" />
              <polygon points="115,65 130,40 102,52" fill="#a06a50" />
              <rect x="42" y="50" width="76" height="76" rx="38" fill="#a06a50" />
              <ellipse cx="80" cy="98" rx="22" ry="18" fill="#fecaca" />
              <circle cx="62" cy="74" r="19" fill="#fad02c" stroke="#d97706" stroke-width="2.5" />
              <circle cx="98" cy="74" r="19" fill="#fad02c" stroke="#d97706" stroke-width="2.5" />
              <rect x="75" y="72" width="10" height="4" fill="#d97706" />
              <circle v-if="!isBlinking" cx="62" cy="74" r="13" fill="#ffffff" />
              <circle v-if="!isBlinking" cx="98" cy="74" r="13" fill="#ffffff" />
              <g v-if="!isBlinking">
                <circle cx="62" cy="74" r="6" fill="#1f2937" />
                <circle cx="60" cy="72" r="2.5" fill="#ffffff" />
                <circle cx="98" cy="74" r="6" fill="#1f2937" />
                <circle cx="96" cy="72" r="2.5" fill="#ffffff" />
              </g>
              <g v-else>
                <path d="M 52,74 Q 62,81 72,74" stroke="#1f2937" stroke-width="3.5" fill="none" stroke-linecap="round" />
                <path d="M 88,74 Q 98,81 108,74" stroke="#1f2937" stroke-width="3.5" fill="none" stroke-linecap="round" />
              </g>
              <polygon points="80,77 74,87 86,87" fill="#f97316" />
              <path d="M 42,75 C 28,75 28,105 42,105 Z" fill="#8c5843" />
              <path d="M 118,75 C 132,75 132,105 118,105 Z" fill="#8c5843" />
              <ellipse cx="68" cy="126" rx="6" ry="3.5" fill="#f97316" />
              <ellipse cx="92" cy="126" rx="6" ry="3.5" fill="#f97316" />
            </svg>
          </div>
          
          <div class="flex flex-col select-none">
            <h1 class="text-2xl font-extrabold text-[#f88f57] font-outfit uppercase tracking-wider leading-none">
              PKRS-ABK
            </h1>
            <p class="text-xs md:text-sm font-bold text-[#6b7280] font-outfit mt-1">
              Halo, {{ loggedInUser.nama || loggedInUser.username || 'Teman Hebat' }}! Ayo belajar bersama 🎉
            </p>
          </div>
        </div>
        
        <button 
          class="bg-[#fff5f6] hover:bg-[#ffa1b5] border-2 border-[#ffa1b5] text-[#ff6b8b] hover:text-white font-extrabold rounded-[20px] px-6 py-2.5 shadow-sm active:scale-95 hover:scale-105 transition-all duration-200 text-sm md:text-base cursor-pointer flex items-center gap-2"
          @click="handleLogout"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 stroke-current" fill="none" viewBox="0 0 24 24">
            <path stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
          </svg>
          <span>Keluar</span>
        </button>
      </div>

      <div class="w-full px-2 max-w-[850px] flex flex-col">
        <h2 class="text-xs font-bold text-gray-400 uppercase tracking-widest mb-6 font-outfit text-left">
          Pilih Topik Belajar
        </h2>
        
        <div class="flex flex-col gap-5 w-full">
          <div 
            v-for="mod in modules" 
            :key="mod.id"
            @mouseenter="playPopSound"
            @click="handleModuleClick($event, mod)"
            class="flex items-center justify-between p-5 border-2 rounded-[28px] shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer select-none bg-white hover:-translate-y-1 active:translate-y-0"
            :class="{
              'border-[#fca5a5] bg-[#fff5f5]/40 hover:bg-[#fff5f5]/70': mod.id === 'd7',
              'border-[#93c5fd] bg-[#f0f7ff]/40 hover:bg-[#f0f7ff]/70': mod.id === 'd4',
              'border-[#a7f3d0] bg-[#f0fdf4]/40 hover:bg-[#f0fdf4]/70': mod.id === 'd1'
            }"
          >
            <div class="flex items-center gap-5">
              <div 
                class="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl shadow-inner shrink-0"
                :class="[mod.iconColor]"
              >
                {{ mod.icon }}
              </div>
              <div class="text-left font-outfit">

                <h3 class="text-lg md:text-xl font-extrabold text-gray-800 leading-snug">
                  {{ mod.title }}
                </h3>
                <span class="text-xs md:text-sm font-semibold text-gray-400">
                  {{ mod.subtext }}
                </span>
              </div>
            </div>
            
            <div class="text-gray-300 font-extrabold text-lg pr-2 hover:translate-x-1 transition-transform">
              &gt;
            </div>
          </div>
        </div>
      </div>
    </div>

    <button 
      class="fixed bottom-6 right-6 w-12 h-12 bg-[#1a1a1a] hover:bg-black rounded-full flex items-center justify-center text-white font-extrabold text-xl hover:scale-110 active:scale-95 transition-all duration-200 shadow-xl cursor-pointer z-20"
      @click="confetti({ particleCount: 15, spread: 60, colors: ['#5dc1b9', '#f7945d', '#92cbd6'] })"
    >
      ?
    </button>

    <div 
      ref="lottieContainer"
      class="absolute bottom-0 right-2 w-[340px] h-[190px] md:w-[680px] md:h-[380px] pointer-events-none opacity-[0.6] z-0 select-none overflow-hidden transition-all duration-300"
    ></div>
  </div>
</template>

<style scoped>
@keyframes bounce-slow {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-7px); }
}
.animate-bounce-slow {
  animation: bounce-slow 3s infinite ease-in-out;
}

@keyframes pulse-slow {
  0%, 100% { transform: scale(1) translateY(-50%) rotate(0deg); opacity: 0.9; }
  50% { transform: scale(1.05) translateY(-50%) rotate(5deg); opacity: 0.95; }
}
.animate-pulse-slow {
  animation: pulse-slow 5s infinite ease-in-out;
}

@keyframes nod {
  0%, 100% { transform: scale(1) translateY(0); }
  50% { transform: scale(1.04) translateY(-2px); }
}
.animate-nod {
  animation: nod 2.5s infinite ease-in-out;
}

@keyframes wiggle {
  0%, 100% { transform: rotate(0deg) scale(1); }
  50% { transform: rotate(3deg) scale(1.02); }
}
.animate-wiggle {
  animation: wiggle 2.5s infinite ease-in-out;
}

.transition-all {
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
}

.font-outfit {
  font-family: 'Outfit', sans-serif;
}
</style>
