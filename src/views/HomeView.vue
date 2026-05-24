<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import confetti from 'canvas-confetti'

// Interactive background states
const mouseX = ref(0)
const mouseY = ref(0)

const handleMouseMove = (e) => {
  mouseX.value = (e.clientX / window.innerWidth) - 0.5
  mouseY.value = (e.clientY / window.innerHeight) - 0.5
}

onMounted(() => {
  window.addEventListener('mousemove', handleMouseMove)
})

onUnmounted(() => {
  window.removeEventListener('mousemove', handleMouseMove)
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
    osc.frequency.setValueAtTime(400, ctx.currentTime)
    osc.frequency.exponentialRampToValueAtTime(800, ctx.currentTime + 0.1)
    
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
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.6)
    
    osc.start()
    osc.stop(ctx.currentTime + 0.6)
  } catch (e) {}
}

// Interactive Cards config
const adventures = ref([
  {
    title: 'Mengenal Anggota Tubuh',
    icon: '🧠',
    desc: 'Mari kenali kepalamu, tanganmu, kakimu, dan organ hebat di tubuhmu!',
    bg: 'bg-[#ebf9f8]',
    border: 'border-[#70d5c9]',
    iconBg: 'bg-[#70d5c9]/25',
    color: '#70d5c9',
    noteFreq: 523.25, // C5 note
    oscType: 'sine',
    hoverClass: 'hover:border-[#70d5c9] hover:bg-[#ebf9f8]/80 hover:-translate-y-2 hover:shadow-[#70d5c9]/20'
  },
  {
    title: 'Makanan Bergizi & Kuat',
    icon: '🍎',
    desc: 'Makan buah-buahan, sayur segar, susu lezat, agar tubuh menjadi kuat!',
    bg: 'bg-[#fff4ee]',
    border: 'border-[#ff8c52]',
    iconBg: 'bg-[#ff8c52]/25',
    color: '#ff8c52',
    noteFreq: 659.25, // E5 note
    oscType: 'triangle',
    hoverClass: 'hover:border-[#ff8c52] hover:bg-[#fff4ee]/80 hover:-translate-y-2 hover:shadow-[#ff8c52]/20'
  },
  {
    title: 'Tubuh Bersih & Segar',
    icon: '🧼',
    desc: 'Mandi yang bersih, rajin gosok gigi, dan cuci tangan sebelum makan!',
    bg: 'bg-[#f6f4fe]',
    border: 'border-[#b4a6f2]',
    iconBg: 'bg-[#b4a6f2]/25',
    color: '#b4a6f2',
    noteFreq: 783.99, // G5 note
    oscType: 'sine',
    hoverClass: 'hover:border-[#b4a6f2] hover:bg-[#f6f4fe]/80 hover:-translate-y-2 hover:shadow-[#b4a6f2]/20'
  },
  {
    title: 'Olahraga Ceria',
    icon: '🏃‍♂️',
    desc: 'Lari pagi, bermain sepeda, melompat gembira, tubuh sehat berenergi!',
    bg: 'bg-[#fffdf1]',
    border: 'border-[#fbc72b]',
    iconBg: 'bg-[#fbc72b]/25',
    color: '#fbc72b',
    noteFreq: 1046.50, // C6 note
    oscType: 'triangle',
    hoverClass: 'hover:border-[#fbc72b] hover:bg-[#fffdf1]/80 hover:-translate-y-2 hover:shadow-[#fbc72b]/20'
  }
])

const handleAdventureClick = (e, adventure) => {
  // Play beautiful instrument tone
  playNote(adventure.noteFreq, adventure.oscType)
  
  // Trigger local burst of colorful confetti right from click coordinates!
  const x = e.clientX / window.innerWidth
  const y = e.clientY / window.innerHeight
  
  confetti({
    particleCount: 15,
    spread: 60,
    origin: { x, y },
    colors: [adventure.color, '#ffffff']
  })
}
</script>

<template>
  <div class="relative w-full py-8 px-4 overflow-hidden select-none min-h-screen">
    <!-- DECORATIVE SLOW-FLOATING PARALLAX SHAPES -->
    <div 
      class="absolute w-36 h-36 bg-[#70d5c9] rounded-full opacity-15 filter blur-[2px] transition-transform duration-300 ease-out pointer-events-none"
      :style="{ transform: `translate(${mouseX * -20}px, ${mouseY * -20}px)`, left: '5%', top: '20%' }"
    ></div>
    <div 
      class="absolute w-44 h-44 bg-[#ff8c52] rounded-full opacity-15 filter blur-[2px] transition-transform duration-300 ease-out pointer-events-none"
      :style="{ transform: `translate(${mouseX * 30}px, ${mouseY * 30}px)`, right: '8%', top: '15%' }"
    ></div>
    <div 
      class="absolute w-40 h-40 bg-[#b4a6f2] rounded-full opacity-15 filter blur-[2px] transition-transform duration-300 ease-out pointer-events-none"
      :style="{ transform: `translate(${mouseX * -15}px, ${mouseY * -15}px)`, left: '12%', bottom: '15%' }"
    ></div>

    <!-- MAIN DASHBOARD CONTENT -->
    <div class="max-w-5xl mx-auto flex flex-col items-center text-center relative z-10">
      
      <!-- HERO BANNER SECTION -->
      <div class="mb-12 mt-6 flex flex-col items-center">
        <!-- Welcoming Mascot representation -->
        <div 
          class="w-24 h-24 bg-[#70d5c9] rounded-full flex items-center justify-center text-5xl shadow-lg border-4 border-white mb-4 hover:scale-110 hover:rotate-6 transition-all duration-300 cursor-pointer animate-bounce-slow"
          @click="playNote(800, 'sine')"
        >
          🦉
        </div>
        <h2 class="text-4xl md:text-5xl font-extrabold text-[#f88f57] uppercase tracking-wide animate-pulse mb-3 font-outfit">
          Ayo Belajar Hidup Sehat! 🌈
        </h2>
        <p class="max-w-2xl text-base md:text-lg font-bold text-[#6b7280] leading-relaxed font-outfit">
          Hai adik hebat! Pilih salah satu kartu petualangan di bawah ini untuk belajar menjaga kesehatan tubuhmu secara menyenangkan!
        </p>
      </div>

      <!-- ADVENTURES CARD GRID (LARGE BOUNCY BUTTONS FOR ABK TARGETS) -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6 w-full px-2">
        <div 
          v-for="adv in adventures" 
          :key="adv.title"
          class="flex flex-col items-center text-center p-6 md:p-8 bg-white border-4 border-white rounded-[32px] md:rounded-[40px] shadow-lg shadow-[#70d5c9]/5 transition-all duration-300 cursor-pointer hover:shadow-2xl"
          :class="['border-2', adv.border, adv.hoverClass]"
          @mouseenter="playPopSound"
          @click="handleAdventureClick($event, adv)"
        >
          <!-- Huge interactive Icon -->
          <div 
            class="w-20 h-20 rounded-[24px] flex items-center justify-center text-4xl mb-5 shadow-inner transition-transform duration-200"
            :class="[adv.iconBg]"
          >
            {{ adv.icon }}
          </div>
          <!-- Card Title -->
          <h3 class="text-xl md:text-2xl font-extrabold text-[#374151] mb-3 uppercase tracking-wide font-outfit">
            {{ adv.title }}
          </h3>
          <!-- Card Description -->
          <p class="text-sm md:text-base font-bold text-[#6b7280] leading-relaxed font-outfit max-w-[320px]">
            {{ adv.desc }}
          </p>
        </div>
      </div>

      <!-- PLAYFUL BANNER FOOTER -->
      <div class="mt-14 py-4 px-8 bg-white border-2 border-[#70d5c9]/30 rounded-2xl shadow-inner text-[#556b69] font-bold text-sm md:text-base flex items-center gap-2 animate-bounce-slow">
        <span>💡</span>
        <span>Tips Hari Ini: Jangan lupa minum air putih agar konsentrasi belajar meningkat!</span>
      </div>

    </div>
  </div>
</template>

<style scoped>
@keyframes bounce-slow {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-6px); }
}
.animate-bounce-slow {
  animation: bounce-slow 3.5s infinite ease-in-out;
}

/* Ensure smooth grid element transition scales */
.transition-all {
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
}

@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800&display=swap');
.font-outfit {
  font-family: 'Outfit', sans-serif;
}
</style>
