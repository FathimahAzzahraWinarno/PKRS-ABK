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

// Interactive background states
const mouseX = ref(0)
const mouseY = ref(0)
const isBlinking = ref(false)

const handleMouseMove = (e) => {
  mouseX.value = (e.clientX / window.innerWidth) - 0.5
  mouseY.value = (e.clientY / window.innerHeight) - 0.5
}
// Sparkle/Blink effect timer and full-screen overrides
let blinkInterval
onMounted(() => {
  window.addEventListener('mousemove', handleMouseMove)
  
  // Add full screen layout classes to body and app
  const app = document.getElementById('app')
  if (app) {
    app.classList.add('full-screen-layout')
  }
  document.body.classList.add('full-screen-body')
  
  // Load Lottie animation offline and bug-free via imported animationData
  try {
    lottieInstance = lottie.loadAnimation({
      container: lottieContainer.value,
      renderer: 'svg',
      loop: true,
      autoplay: true,
      animationData: childLottie
    })
  } catch (e) {
    // Could not load local child lottie animation
  }
  
  // Owl & Avatar blinks every 3.5 seconds
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

  // Destroy Lottie player to release browser memory safely
  if (lottieInstance) {
    lottieInstance.destroy()
  }
})

// Web Audio API Synthesizers for sensory musical feedback
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
    
    // Play note with a cute bell-like vibrato envelope
    osc.frequency.setValueAtTime(freq, ctx.currentTime)
    osc.frequency.linearRampToValueAtTime(freq * 1.01, ctx.currentTime + 0.05)
    osc.frequency.linearRampToValueAtTime(freq, ctx.currentTime + 0.1)
    
    gain.gain.setValueAtTime(0.2, ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.65)
    
    osc.start()
    osc.stop(ctx.currentTime + 0.65)
  } catch (e) {}
}

// Module configuration (3 modules matching screenshot)
const modules = ref([
  {
    title: 'Mengenal Tubuhku',
    desc: 'Yuk belajar tentang bagian-bagian tubuh kita!',
    borderColor: 'border-[#5dc1b9]',
    bgColor: 'bg-[#ebf9f8]',
    iconColor: 'bg-[#b6ece8]',
    buttonColor: 'bg-[#5dc1b9] hover:bg-[#4ab0a8] shadow-[#5dc1b9]/30',
    colorHex: '#5dc1b9',
    noteFreq: 523.25, // C5 note
    oscType: 'sine',
    type: 'body'
  },
  {
    title: 'Makanan Sehat',
    desc: 'Belajar memilih makanan yang baik untuk tubuh',
    borderColor: 'border-[#f7945d]',
    bgColor: 'bg-[#fff4ee]',
    iconColor: 'bg-[#ffd3ba]',
    buttonColor: 'bg-[#f7945d] hover:bg-[#e6834c] shadow-[#f7945d]/30',
    colorHex: '#f7945d',
    noteFreq: 659.25, // E5 note
    oscType: 'triangle',
    type: 'food'
  },
  {
    title: 'Olahraga & Aktivitas',
    desc: 'Bergerak aktif untuk tubuh yang kuat!',
    borderColor: 'border-[#92cbd6]',
    bgColor: 'bg-[#e0f4f7]',
    iconColor: 'bg-[#b5e3eb]',
    buttonColor: 'bg-[#92cbd6] hover:bg-[#7dbcc8] shadow-[#92cbd6]/30',
    colorHex: '#92cbd6',
    noteFreq: 783.99, // G5 note
    oscType: 'sine',
    type: 'sport'
  }
])

const handleModuleClick = (e, mod) => {
  playNote(mod.noteFreq, mod.oscType)
  
  // Confetti explosion from click coordinates
  const x = e.clientX / window.innerWidth
  const y = e.clientY / window.innerHeight
  
  confetti({
    particleCount: 18,
    spread: 65,
    origin: { x, y },
    colors: [mod.colorHex, '#ffffff']
  })

  if (mod.type === 'body') {
    setTimeout(() => {
      router.push('/mengenal-tubuhku')
    }, 700)
  } else if (mod.type === 'food') {
    setTimeout(() => {
      router.push('/makanan-sehat')
    }, 700)
  } else if (mod.type === 'sport') {
    setTimeout(() => {
      router.push('/olahraga-aktivitas')
    }, 700)
  }
}

// Logout action
const handleLogout = () => {
  // Clear auth session from local storage
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
    <!-- DECORATIVE FLOATING PARALLAX BACKGROUND BUBBLES -->
    <!-- Green bubble -->
    <div 
      class="absolute w-36 h-36 bg-[#7cd0b8] rounded-full opacity-20 filter blur-[2px] transition-transform duration-300 ease-out pointer-events-none"
      :style="{ transform: `translate(${mouseX * -25}px, ${mouseY * -25}px)`, left: '4%', top: '22%' }"
    ></div>
    
    <!-- Yellow bubble -->
    <div 
      class="absolute w-40 h-40 bg-[#fbc72b] rounded-full opacity-20 filter blur-[2px] transition-transform duration-300 ease-out pointer-events-none"
      :style="{ transform: `translate(${mouseX * -15}px, ${mouseY * -15}px)`, left: '20%', bottom: '2%' }"
    ></div>
    
    <!-- Light Blue bubble -->
    <div 
      class="absolute w-44 h-44 bg-[#9ad2d8] rounded-full opacity-25 filter blur-[2px] transition-transform duration-300 ease-out pointer-events-none"
      :style="{ transform: `translate(${mouseX * 30}px, ${mouseY * 30}px)`, left: '48%', top: '1%' }"
    ></div>



    <!-- Crescent Moon/Banana (top-right) -->
    <div 
      class="absolute w-12 h-12 fill-[#fad02c] transition-transform duration-300 ease-out rotate-[25deg] pointer-events-none opacity-30"
      :style="{ transform: `translate(${mouseX * -20}px, ${mouseY * -20}px)`, right: '14%', top: '14%' }"
    >
      <svg class="w-full h-full text-[#fbc72b] fill-current" viewBox="0 0 24 24">
        <path d="M12.3 22h-.1c-5.5 0-10-4.5-10-10S6.7 2 12.2 2c.7 0 1.4.1 2 .3-.4.5-.6 1.1-.6 1.7 0 2.2 1.8 4 4 4 .6 0 1.2-.2 1.7-.6.2.6.3 1.3.3 2 0 5.5-4.5 10-9.8 10-.2 0-.3.4-.5.6z" />
      </svg>
    </div>

    <!-- Gold Star (top-left near logo) -->
    <svg 
      class="absolute w-8 h-8 fill-[#fbc72b] transition-transform duration-300 ease-out animate-bounce-slow pointer-events-none opacity-40"
      :style="{ transform: `translate(${mouseX * 12}px, ${mouseY * 12}px)`, left: '6%', top: '12%' }"
      viewBox="0 0 24 24"
    >
      <path d="M12 .587l3.668 7.431 8.2 1.192-5.934 5.787 1.4 8.168L12 18.896l-7.334 3.857 1.4-8.168L.132 9.41l8.2-1.192L12 .587z"/>
    </svg>

    <!-- MAIN PAGE CONTAINER -->
    <div class="max-w-[1040px] mx-auto flex flex-col items-center relative z-10">
      
      <!-- PAGE-SPECIFIC HEADER NAVBAR (Matching Screenshot) -->
      <div class="w-full flex items-center justify-between mb-8 px-2">
        <!-- Logo & Branding -->
        <div class="flex items-center gap-3">
          <!-- Teal Mascot circle -->
          <div class="w-14 h-14 bg-[#70d5c9] rounded-full flex items-center justify-center border-2 border-white shadow-md hover:scale-105 active:scale-95 transition-transform duration-200 cursor-pointer">
            <svg width="46" height="46" viewBox="0 0 160 160" class="overflow-visible select-none pointer-events-none">
              <!-- Ears -->
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
              <!-- Pupils -->
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
          
          <!-- Brand and welcome greeting text -->
          <div class="flex flex-col select-none">
            <h1 class="text-2xl font-extrabold text-[#f88f57] font-outfit uppercase tracking-wider leading-none">
              PKRS-ABK
            </h1>
            <p class="text-xs md:text-sm font-bold text-[#6b7280] font-outfit mt-1">
              Halo, {{ loggedInUser.nama || loggedInUser.username || 'Teman Hebat' }}! Ayo belajar bersama 🎉
            </p>
          </div>
        </div>
        
        <!-- Premium Styled Logout Button (Same as AdminView) -->
        <button 
          class="bg-[#fff5f6] hover:bg-[#ffa1b5] border-2 border-[#ffa1b5] text-[#ff6b8b] hover:text-white font-extrabold rounded-[20px] px-6 py-2.5 shadow-sm active:scale-95 hover:scale-105 transition-all duration-200 text-sm md:text-base cursor-pointer flex items-center gap-2"
          @click="handleLogout"
        >
          <!-- Sign-out Exit Icon SVG -->
          <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 stroke-current" fill="none" viewBox="0 0 24 24">
            <path stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
          </svg>
          <span>Keluar</span>
        </button>
      </div>



      <!-- ADVENTURES CARD GRID (Exactly 3 cards, NO progress bars) -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6 w-full px-2">
        <div 
          v-for="mod in modules" 
          :key="mod.title"
          class="flex flex-col items-center text-center p-6 md:p-8 bg-white border-2 rounded-[32px] shadow-md hover:shadow-2xl transition-all duration-300 cursor-pointer"
          :class="[mod.borderColor, mod.bgColor, 'hover:-translate-y-2']"
          @mouseenter="playPopSound"
          @click="handleModuleClick($event, mod)"
        >
          <!-- Mascot Circle -->
          <div 
            class="w-20 h-20 rounded-full flex items-center justify-center mb-6 shadow-sm border border-white transition-transform duration-300"
            :class="[mod.iconColor]"
          >
            <!-- Customized High-Fidelity Animated SVG Icons -->
            <!-- 1. Body avatar -->
            <svg 
              v-if="mod.type === 'body'" 
              viewBox="0 0 100 100" 
              class="w-16 h-16 animate-nod select-none pointer-events-none"
            >
              <circle cx="22" cy="50" r="5.5" fill="#fca5a5" />
              <circle cx="78" cy="50" r="5.5" fill="#fca5a5" />
              <circle cx="50" cy="50" r="28" fill="#fca5a5" />
              <path d="M 22,38 C 22,18 78,18 78,38 C 65,28 35,28 22,38 Z" fill="#fbbf24" />
              <path d="M 21,38 C 30,28 45,33 50,42 C 55,33 70,28 79,38" stroke="#d97706" stroke-width="2" fill="none" />
              <g v-if="!isBlinking">
                <circle cx="40" cy="48" r="4" fill="#2563eb" />
                <circle cx="38" cy="46" r="1.5" fill="#ffffff" />
                <circle cx="60" cy="48" r="4" fill="#2563eb" />
                <circle cx="58" cy="46" r="1.5" fill="#ffffff" />
              </g>
              <g v-else>
                <path d="M 36,48 Q 40,51 44,48" stroke="#1f2937" stroke-width="2.5" fill="none" stroke-linecap="round" />
                <path d="M 56,48 Q 60,51 64,48" stroke="#1f2937" stroke-width="2.5" fill="none" stroke-linecap="round" />
              </g>
              <circle cx="30" cy="55" r="4.5" fill="#f472b6" opacity="0.5" />
              <circle cx="70" cy="55" r="4.5" fill="#f472b6" opacity="0.5" />
              <path d="M 44,59 Q 50,64 56,59" stroke="#be185d" stroke-width="2.5" fill="none" stroke-linecap="round" />
            </svg>

            <!-- 2. Food smiling fruit bowl -->
            <svg 
              v-else-if="mod.type === 'food'" 
              viewBox="0 0 100 100" 
              class="w-16 h-16 animate-wiggle select-none pointer-events-none"
            >
              <ellipse cx="50" cy="45" rx="19" ry="9" fill="#22c55e" />
              <circle cx="42" cy="42" r="5" fill="#ef4444" />
              <circle cx="58" cy="41" r="5" fill="#facc15" />
              <circle cx="50" cy="38" r="4" fill="#3b82f6" />
              <path d="M 28,45 C 28,66 72,66 72,45 Z" fill="#94a3b8" />
              <ellipse cx="50" cy="45" rx="22" ry="5.5" fill="#cbd5e1" />
              <path d="M 46,53 Q 50,57 54,53" stroke="#1e293b" stroke-width="2.2" fill="none" stroke-linecap="round" />
              <circle cx="42" cy="51" r="1.5" fill="#f472b6" />
              <circle cx="58" cy="51" r="1.5" fill="#f472b6" />
            </svg>

            <!-- 3. Sport colorful ball -->
            <svg 
              v-else-if="mod.type === 'sport'" 
              viewBox="0 0 100 100" 
              class="w-16 h-16 transition-transform duration-300 ease-out hover:rotate-[360deg] active:scale-90 select-none pointer-events-none"
            >
              <circle cx="50" cy="50" r="25" fill="#ffffff" stroke="#64748b" stroke-width="2" />
              <polygon points="50,38 56,44 54,51 46,51 44,44" fill="#3b82f6" />
              <line x1="50" y1="38" x2="50" y2="25" stroke="#64748b" stroke-width="2" />
              <line x1="44" y1="44" x2="31" y2="38" stroke="#64748b" stroke-width="2" />
              <line x1="56" y1="44" x2="69" y2="38" stroke="#64748b" stroke-width="2" />
              <line x1="46" y1="51" x2="39" y2="63" stroke="#64748b" stroke-width="2" />
              <line x1="54" y1="51" x2="61" y2="63" stroke="#64748b" stroke-width="2" />
              <circle cx="50" cy="25" r="3.2" fill="#f43f5e" />
              <circle cx="31" cy="38" r="3.2" fill="#10b981" />
              <circle cx="69" cy="38" r="3.2" fill="#f59e0b" />
              <circle cx="39" cy="63" r="3.2" fill="#8b5cf6" />
              <circle cx="61" cy="63" r="3.2" fill="#ec4899" />
            </svg>
          </div>

          <!-- Module Title -->
          <h3 class="text-xl font-extrabold text-[#374151] mb-2 font-outfit">
            {{ mod.title }}
          </h3>
          
          <!-- Module Description -->
          <p class="text-sm font-semibold text-[#6b7280] leading-relaxed max-w-[210px] mb-8 font-outfit">
            {{ mod.desc }}
          </p>

          <!-- Submit Button (Large & tactile for ABK) -->
          <button 
            type="button"
            class="w-full py-4 text-white font-extrabold text-base rounded-[20px] shadow-md transition-all duration-200 hover:scale-[1.03] active:scale-[0.97] cursor-pointer"
            :class="[mod.buttonColor]"
          >
            Mulai Belajar →
          </button>
        </div>
      </div>

    </div>

    <!-- HELP QUESTION ICON BUTTON -->
    <button 
      class="fixed bottom-6 right-6 w-12 h-12 bg-[#1a1a1a] hover:bg-black rounded-full flex items-center justify-center text-white font-extrabold text-xl hover:scale-110 active:scale-95 transition-all duration-200 shadow-xl cursor-pointer z-20"
      @click="confetti({ particleCount: 15, spread: 60, colors: ['#5dc1b9', '#f7945d', '#92cbd6'] })"
    >
      ?
    </button>

    <!-- LOTTIE BACKGROUND ANIMATION (Jalan otomatis menggunakan file child.json kustom, nempel di bawah) -->
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
  animation: nod 2s infinite ease-in-out;
}

@keyframes wiggle {
  0%, 100% { transform: rotate(0deg) scale(1); }
  50% { transform: rotate(3deg) scale(1.02); }
}
.animate-wiggle {
  animation: wiggle 2.5s infinite ease-in-out;
}

/* Tactile button scales */
.transition-all {
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
}

@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800&display=swap');
.font-outfit {
  font-family: 'Outfit', sans-serif;
}
</style>
