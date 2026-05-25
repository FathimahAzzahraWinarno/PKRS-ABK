<script setup>
import { RouterLink, RouterView, useRoute } from 'vue-router'

const route = useRoute()

// Web Audio API Synthesizer for cute child-friendly navigation sound feedback
const playPopSound = () => {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)()
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.connect(gain)
    gain.connect(ctx.destination)
    
    osc.type = 'sine'
    // Quick frequency sweep from 450Hz to 950Hz
    osc.frequency.setValueAtTime(450, ctx.currentTime)
    osc.frequency.exponentialRampToValueAtTime(950, ctx.currentTime + 0.1)
    
    gain.gain.setValueAtTime(0.18, ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1)
    
    osc.start()
    osc.stop(ctx.currentTime + 0.1)
  } catch (e) {
    // Ignore context blocked before user interaction
  }
}
</script>

<template>
  <div class="app-container select-none min-h-screen bg-[#fbfaf3] font-outfit">
    <!-- Top child-friendly navbar (Hidden on Login, Home, Admin and custom module pages to show custom headers) -->
    <header 
      v-if="!['/login', '/', '/mengenal-tubuhku', '/makanan-sehat', '/olahraga-aktivitas', '/admin'].includes(route.path)"
      class="max-w-6xl mx-auto px-4 pt-4"
    >
      <nav class="flex items-center justify-between px-6 py-4 bg-white/95 border border-[#e8f6f5] rounded-3xl shadow-lg shadow-[#70d5c9]/5 transition-all duration-300">
        <!-- Logo Branding -->
        <RouterLink 
          to="/" 
          class="flex items-center gap-2 group cursor-pointer"
          @click="playPopSound"
        >
          <div class="w-10 h-10 bg-[#70d5c9] rounded-2xl flex items-center justify-center text-xl shadow-inner group-hover:rotate-12 transition-transform duration-300">
            🦉
          </div>
          <span class="text-2xl font-extrabold text-[#f88f57] uppercase tracking-wide font-outfit select-none">
            PKRS-ABK
          </span>
        </RouterLink>

        <!-- Navigation Menus -->
        <div class="flex items-center gap-3">
          <RouterLink 
            to="/" 
            class="nav-item px-5 py-2.5 rounded-full font-bold text-base transition-all duration-200 hover:scale-105 active:scale-95 flex items-center gap-1.5 text-[#556b69] hover:bg-[#70d5c9]/10"
            active-class="bg-[#70d5c9]/15 text-[#3b8c82] border border-[#70d5c9]/20"
            @mouseenter="playPopSound"
          >
            <span>🏠</span>
            <span>Beranda</span>
          </RouterLink>

          <RouterLink 
            to="/login" 
            class="nav-item px-5 py-2.5 bg-[#ff8c52] hover:bg-[#ff7936] text-white rounded-full font-bold text-base shadow-md shadow-[#ff8c52]/20 transition-all duration-200 hover:scale-105 active:scale-95 flex items-center gap-1.5"
            active-class="opacity-90"
            @mouseenter="playPopSound"
          >
            <span>🚀</span>
            <span>Masuk</span>
          </RouterLink>
        </div>
      </nav>
    </header>

    <!-- Main Viewport Router Content -->
    <main class="w-full">
      <RouterView />
    </main>
  </div>
</template>

<style scoped>
/* Scoped custom helper transitions */
.nav-item {
  cursor: pointer;
}

/* Custom font loading integration */
@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800&display=swap');
.font-outfit {
  font-family: 'Outfit', sans-serif;
}
</style>
