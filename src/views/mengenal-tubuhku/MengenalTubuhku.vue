<script setup>
import { ref, onMounted, onUnmounted, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import confetti from 'canvas-confetti'

const router = useRouter()

// UI state variables
const currentPhase = ref('learning') // 'learning' | 'quiz-intro' | 'quiz' | 'celebration'
const isVideoPlaying = ref(false)
const activeFactIndex = ref(0)
const isBlinking = ref(false)

// Voice speaking status
const isSpeaking = ref(false)

// Sound triggers using Web Audio API procedural synthesis
const playPopSound = () => {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)()
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.connect(gain)
    gain.connect(ctx.destination)
    
    osc.type = 'sine'
    osc.frequency.setValueAtTime(450, ctx.currentTime)
    osc.frequency.exponentialRampToValueAtTime(900, ctx.currentTime + 0.08)
    
    gain.gain.setValueAtTime(0.12, ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.08)
    
    osc.start()
    osc.stop(ctx.currentTime + 0.08)
  } catch (e) {}
}

const playNote = (freq, type = 'sine', duration = 0.3) => {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)()
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.connect(gain)
    gain.connect(ctx.destination)
    
    osc.type = type
    osc.frequency.setValueAtTime(freq, ctx.currentTime)
    
    gain.gain.setValueAtTime(0.15, ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration)
    
    osc.start()
    osc.stop(ctx.currentTime + duration)
  } catch (e) {}
}

// Correct answer sweep
const playCorrectSound = () => {
  const notes = [261.63, 329.63, 392.00, 523.25] // C4 - E4 - G4 - C5
  notes.forEach((freq, idx) => {
    setTimeout(() => {
      playNote(freq, 'sine', 0.4)
    }, idx * 100)
  })
}

// Incorrect low buzzer slide
const playIncorrectSound = () => {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)()
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.connect(gain)
    gain.connect(ctx.destination)
    
    osc.type = 'triangle'
    osc.frequency.setValueAtTime(140, ctx.currentTime)
    osc.frequency.linearRampToValueAtTime(90, ctx.currentTime + 0.4)
    
    gain.gain.setValueAtTime(0.2, ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4)
    
    osc.start()
    osc.stop(ctx.currentTime + 0.4)
  } catch (e) {}
}

// Victory chords
const playVictorySound = () => {
  const notes = [261.63, 329.63, 392.00, 523.25, 659.25, 783.99, 1046.50] // C4 arpeggio up to C6
  notes.forEach((freq, idx) => {
    setTimeout(() => {
      playNote(freq, 'sine', 0.5)
    }, idx * 80)
  })
}

// Interactive Facts Configuration
const facts = ref([
  {
    title: 'Mata 👁️',
    subtitle: 'Mata untuk Melihat',
    description: 'Mata membantu kita melihat indahnya dunia, membaca buku cerita, dan melihat warna-warni pelangi! Kita harus menjaga mata dengan tidak membaca di tempat gelap dan tidak melihat layar HP terlalu dekat.',
    voiceText: 'Mata membantu kita melihat indahnya dunia, membaca buku cerita, dan melihat warna-warni pelangi! Kita harus menjaga mata kita ya!',
    colorClass: 'border-[#ffa1b5] bg-[#fff0f3] text-[#e04f6e]',
    activeBg: 'bg-[#ffa1b5]/20 shadow-lg shadow-[#ffa1b5]/10',
    icon: '👁️',
    accentColor: '#ffa1b5'
  },
  {
    title: 'Telinga 👂',
    subtitle: 'Telinga untuk Mendengar',
    description: 'Telinga membantu kita mendengar nyanyian ceria, dongeng dari guru, dan musik yang indah! Kita harus menjaga telinga dengan tidak mendengarkan suara yang terlalu keras agar pendengaran kita tetap sehat.',
    voiceText: 'Telinga membantu kita mendengar nyanyian ceria, dongeng dari guru, dan musik yang indah! Jangan dengar suara keras-keras ya!',
    colorClass: 'border-[#92cbd6] bg-[#eef8fa] text-[#2c7d8f]',
    activeBg: 'bg-[#92cbd6]/20 shadow-lg shadow-[#92cbd6]/10',
    icon: '👂',
    accentColor: '#92cbd6'
  },
  {
    title: 'Hidung 👃',
    subtitle: 'Hidung untuk Mencium',
    description: 'Hidung membantu kita mencium wangi bunga segar, bau masakan ibu yang lezat, dan menghirup udara bersih! Kita harus menjaga hidung agar tetap bersih dan bernapas dengan lega.',
    voiceText: 'Hidung membantu kita mencium wangi bunga segar, bau masakan ibu yang lezat, dan menghirup udara bersih! Tarik napas dalam-dalam, hmmm segar!',
    colorClass: 'border-[#f7945d] bg-[#fff5f0] text-[#c45a1f]',
    activeBg: 'bg-[#f7945d]/20 shadow-lg shadow-[#f7945d]/10',
    icon: '👃',
    accentColor: '#f7945d'
  },
  {
    title: 'Lidah 👅',
    subtitle: 'Lidah untuk Mengecap',
    description: 'Lidah membantu kita merasakan lezatnya es krim manis, jeruk asam, garam asin, dan rasa segar sayuran! Lidah sangat ajaib karena bisa membedakan bermacam-macam rasa makanan enak.',
    voiceText: 'Lidah membantu kita merasakan lezatnya es krim manis, jeruk asam, garam asin, dan sayuran segar! Lidah kita sangat ajaib!',
    colorClass: 'border-[#5dc1b9] bg-[#ebf9f8] text-[#2b8a82]',
    activeBg: 'bg-[#5dc1b9]/20 shadow-lg shadow-[#5dc1b9]/10',
    icon: '👅',
    accentColor: '#5dc1b9'
  }
])

// Speech Synthesis Facts integration
const speakFact = (text) => {
  if ('speechSynthesis' in window) {
    isSpeaking.value = true
    window.speechSynthesis.cancel() // Stop any previous speech
    const utterance = new SpeechSynthesisUtterance(text)
    
    // Attempt to select Indonesian accent speaker
    const voices = window.speechSynthesis.getVoices()
    const idVoice = voices.find(v => v.lang.includes('id') || v.lang.includes('ID'))
    if (idVoice) {
      utterance.voice = idVoice
    }
    
    utterance.pitch = 1.35 // Higher cheerful kid voice pitch
    utterance.rate = 0.9 // Slower for clarity
    
    utterance.onend = () => {
      isSpeaking.value = false
    }
    utterance.onerror = () => {
      isSpeaking.value = false
    }
    
    window.speechSynthesis.speak(utterance)
  } else {
    alert("Speech Synthesis tidak didukung oleh browser Anda.")
  }
}

const handleFactClick = (idx) => {
  playPopSound()
  activeFactIndex.value = idx
  speakFact(facts.value[idx].voiceText)
  
  // Custom tiny local confetti burst
  confetti({
    particleCount: 8,
    spread: 45,
    colors: [facts.value[idx].accentColor, '#ffffff']
  })
}

// 5-Question Quiz Configuration
const questions = ref([
  {
    id: 1,
    question: "Mata kita gunakan untuk apa ya? 👁️",
    options: [
      { key: 'A', text: 'Mendengar musik yang ceria' },
      { key: 'B', text: 'Melihat pemandangan yang indah' },
      { key: 'C', text: 'Mencium bau kue yang lezat' },
      { key: 'D', text: 'Mengecap rasa permen manis' }
    ],
    correct: 'B',
    explanation: 'Hebat! Mata kita digunakan untuk melihat keindahan di sekitar kita! 👁️'
  },
  {
    id: 2,
    question: "Bagian tubuh mana yang kita gunakan untuk mendengar lagu atau musik? 👂",
    options: [
      { key: 'A', text: 'Hidung kita' },
      { key: 'B', text: 'Telinga kita' },
      { key: 'C', text: 'Lidah kita' },
      { key: 'D', text: 'Tangan kita' }
    ],
    correct: 'B',
    explanation: 'Keren! Telinga kita bertugas untuk mendengar suara musik dan suara ceria! 👂'
  },
  {
    id: 3,
    question: "Bagian tubuh apa yang bertugas mencium wangi bunga mawar di taman? 👃",
    options: [
      { key: 'A', text: 'Mata' },
      { key: 'B', text: 'Lidah' },
      { key: 'C', text: 'Hidung' },
      { key: 'D', text: 'Telinga' }
    ],
    correct: 'C',
    explanation: 'Bagus sekali! Hidung kita mendeteksi bau wangi dan menghirup udara segar! 👃'
  },
  {
    id: 4,
    question: "Bagian tubuh yang bisa merasakan rasa manis gula dan asin garam adalah... 👅",
    options: [
      { key: 'A', text: 'Lidah' },
      { key: 'B', text: 'Hidung' },
      { key: 'C', text: 'Mata' },
      { key: 'D', text: 'Telinga' }
    ],
    correct: 'A',
    explanation: 'Luar biasa! Lidah kita membantu kita mengecap manis, asam, asin, dan pahit! 👅'
  },
  {
    id: 5,
    question: "Semua panca indra kita sangat penting. Bagaimana cara kita merawatnya dengan baik? 💖",
    options: [
      { key: 'A', text: 'Mengucek mata dengan tangan yang kotor' },
      { key: 'B', text: 'Mendengar musik yang sangat keras' },
      { key: 'C', text: 'Menjaga kebersihan tubuh secara teratur' },
      { key: 'D', text: 'Tidak pernah membersihkan telinga' }
    ],
    correct: 'C',
    explanation: 'Sempurna! Menjaga kebersihan tubuh secara teratur membuat panca indra tetap sehat! 💖'
  }
])

// Active Quiz state variables
const currentQuestionIndex = ref(0)
const selectedOption = ref(null)
const isAnswered = ref(false)
const isCorrect = ref(null)
const score = ref(0)

const handleOptionSelect = (key, e) => {
  if (isAnswered.value) return // Prevents selecting twice
  
  selectedOption.value = key
  isAnswered.value = true
  
  const currentQuestion = questions.value[currentQuestionIndex.value]
  if (key === currentQuestion.correct) {
    isCorrect.value = true
    score.value++
    playCorrectSound()
    
    // Interactive local confetti burst from click
    const rect = e.target.getBoundingClientRect()
    const x = (rect.left + rect.width / 2) / window.innerWidth
    const y = (rect.top + rect.height / 2) / window.innerHeight
    confetti({
      particleCount: 15,
      spread: 50,
      origin: { x, y },
      colors: ['#4ade80', '#ffffff']
    })
  } else {
    isCorrect.value = false
    playIncorrectSound()
  }
}

const handleNextQuestion = () => {
  playPopSound()
  if (currentQuestionIndex.value < questions.value.length - 1) {
    currentQuestionIndex.value++
    selectedOption.value = null
    isAnswered.value = false
    isCorrect.value = null
  } else {
    // End Quiz and transition to celebration
    currentPhase.value = 'celebration'
    triggerCelebration()
  }
}

// Celebration details
const starAnimations = ref([false, false, false])
const computedStars = ref(0)

const triggerCelebration = () => {
  // Determine stars count
  if (score.value === 5) {
    computedStars.value = 3
  } else if (score.value >= 3) {
    computedStars.value = 2
  } else if (score.value >= 1) {
    computedStars.value = 1
  } else {
    computedStars.value = 0
  }
  
  playVictorySound()
  triggerMassiveConfetti()
  
  // Staggered star pops with pop synth notes
  starAnimations.value = [false, false, false]
  for (let i = 0; i < computedStars.value; i++) {
    setTimeout(() => {
      starAnimations.value[i] = true
      playNote(300 + i * 150, 'sine', 0.25)
    }, 600 + i * 400)
  }
}

const triggerMassiveConfetti = () => {
  const duration = 2.5 * 1000
  const end = Date.now() + duration
  
  ;(function frame() {
    confetti({
      particleCount: 4,
      angle: 60,
      spread: 50,
      origin: { x: 0, y: 0.8 },
      colors: ['#70d5c9', '#f88f57', '#ffa1b5', '#ffd3ba']
    })
    confetti({
      particleCount: 4,
      angle: 120,
      spread: 50,
      origin: { x: 1, y: 0.8 },
      colors: ['#70d5c9', '#f88f57', '#ffa1b5', '#ffd3ba']
    })
    
    if (Date.now() < end) {
      requestAnimationFrame(frame)
    }
  }())
}

const restartModule = () => {
  playPopSound()
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel()
  }
  currentPhase.value = 'learning'
  isVideoPlaying.value = false
  currentQuestionIndex.value = 0
  selectedOption.value = null
  isAnswered.value = false
  isCorrect.value = null
  score.value = 0
}

// Mascot blinking interval
let blinkInterval
onMounted(() => {
  // Force full screen overrides
  const app = document.getElementById('app')
  if (app) {
    app.classList.add('full-screen-layout')
  }
  document.body.classList.add('full-screen-body')
  
  // Pre-load Web Speech synthesizers API
  if ('speechSynthesis' in window) {
    window.speechSynthesis.getVoices()
  }
  
  // Mascot blink trigger every 3.8s
  blinkInterval = setInterval(() => {
    isBlinking.value = true
    setTimeout(() => {
      isBlinking.value = false
    }, 150)
  }, 3800)
  
  // Play initial chime
  setTimeout(() => {
    playNote(523.25, 'sine', 0.5) // C5 chime
  }, 100)
})

onUnmounted(() => {
  // Clear overrides
  const app = document.getElementById('app')
  if (app) {
    app.classList.remove('full-screen-layout')
  }
  document.body.classList.remove('full-screen-body')
  
  clearInterval(blinkInterval)
  
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel()
  }
})
</script>

<template>
  <div class="relative w-full py-6 px-4 overflow-hidden select-none min-h-screen bg-[#fbfaf3] font-outfit">
    <!-- DECORATIVE BACKGROUND BALLS -->
    <div class="absolute w-36 h-36 bg-[#70d5c9] rounded-full opacity-15 filter blur-[3px] pointer-events-none" style="left: -20px; top: 120px;"></div>
    <div class="absolute w-44 h-44 bg-[#ffa1b5] rounded-full opacity-15 filter blur-[3px] pointer-events-none" style="right: -40px; top: 300px;"></div>
    <div class="absolute w-40 h-40 bg-[#f88f57] rounded-full opacity-15 filter blur-[3px] pointer-events-none" style="left: 10%; bottom: -50px;"></div>

    <div class="max-w-[850px] mx-auto relative z-10 flex flex-col min-h-[90vh]">
      
      <!-- ==================== PHASE 1: LEARNING ==================== -->
      <div v-if="currentPhase === 'learning'" class="flex-grow flex flex-col">
        
        <!-- Header -->
        <div class="flex items-center justify-between mb-6">
          <button 
            @click="playPopSound(); router.push('/')"
            class="flex items-center gap-2 px-5 py-2.5 bg-white border border-gray-200 rounded-[20px] text-gray-500 font-extrabold text-sm hover:scale-105 active:scale-95 transition-all shadow-sm hover:shadow cursor-pointer"
          >
            <span>←</span> Kembali
          </button>
          
          <div class="flex items-center gap-3">
            <h1 class="text-xl md:text-2xl font-extrabold text-[#5dc1b9]">Mengenal Tubuhku</h1>
            <div class="w-11 h-11 bg-[#70d5c9] rounded-full flex items-center justify-center border-2 border-white shadow-sm overflow-hidden animate-nod">
              <svg viewBox="0 0 100 100" class="w-9 h-9">
                <circle cx="50" cy="50" r="28" fill="#fca5a5" />
                <path d="M 22,38 C 22,18 78,18 78,38 C 65,28 35,28 22,38 Z" fill="#fbbf24" />
                <path d="M 21,38 C 30,28 45,33 50,42 C 55,33 70,28 79,38" stroke="#d97706" stroke-width="2" fill="none" />
                <circle cx="40" cy="48" r="3.5" fill="#2563eb" />
                <circle cx="60" cy="48" r="3.5" fill="#2563eb" />
                <path d="M 44,59 Q 50,64 56,59" stroke="#be185d" stroke-width="2.5" fill="none" stroke-linecap="round" />
              </svg>
            </div>
          </div>
        </div>

        <!-- Video Player Card Container -->
        <div class="bg-white border-2 border-[#e8f6f5] rounded-[36px] p-6 md:p-8 shadow-md mb-8 flex flex-col">
          <div class="flex items-center gap-3 mb-4">
            <div class="w-12 h-12 bg-[#e8e2fa] rounded-2xl flex items-center justify-center text-xl shadow-inner">
              🎥
            </div>
            <div>
              <h2 class="text-xl md:text-2xl font-extrabold text-gray-800">Bagian-Bagian Tubuh Kita</h2>
              <p class="text-xs md:text-sm font-semibold text-gray-500 mt-0.5">Yuk simak video seru di bawah ini untuk mengenal bagian tubuh kita!</p>
            </div>
          </div>

          <!-- Clickable responsive YouTube Placeholder -->
          <div class="relative w-full aspect-video rounded-[24px] overflow-hidden border-4 border-white shadow-inner bg-gradient-to-tr from-[#70d5c9]/10 to-[#ffa1b5]/10 flex items-center justify-center">
            
            <div v-if="!isVideoPlaying" class="absolute inset-0 flex flex-col items-center justify-center p-4 text-center cursor-pointer group" @click="isVideoPlaying = true; playPopSound()">
              <!-- Background cover illustration -->
              <div class="absolute inset-0 bg-cover bg-center opacity-70 group-hover:scale-105 transition-transform duration-500" style="background-image: url('https://img.youtube.com/vi/g72D_1vLg6Y/maxresdefault.jpg')"></div>
              <div class="absolute inset-0 bg-black/30 group-hover:bg-black/25 transition-all duration-300"></div>
              
              <!-- Play Button overlay -->
              <button class="relative z-10 w-20 h-20 bg-[#ffa1b5] hover:bg-[#ff8fa7] text-white rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 active:scale-95 transition-all duration-200 cursor-pointer">
                <svg class="w-8 h-8 fill-current ml-1" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z" />
                </svg>
              </button>
              <span class="relative z-10 text-white font-extrabold text-lg mt-4 bg-black/40 px-4 py-1.5 rounded-full select-none">Putar Video Belajar 🌟</span>
            </div>

            <iframe 
              v-else
              class="w-full h-full rounded-[24px] border-4 border-white"
              src="https://www.youtube.com/embed/g72D_1vLg6Y?autoplay=1"
              title="Mengenal Anggota Tubuh"
              frameborder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowfullscreen
            ></iframe>
          </div>
        </div>

        <!-- Sensory Submodule Interactive Pills -->
        <div class="mb-8">
          <h3 class="text-lg font-extrabold text-gray-800 mb-4 flex items-center gap-2">
            <span>✨</span> Sentuh panca indra di bawah untuk mendengarkan suaranya:
          </h3>
          
          <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-5">
            <div 
              v-for="(fact, idx) in facts" 
              :key="fact.title"
              @click="handleFactClick(idx)"
              class="border-2 rounded-[28px] p-4 flex flex-col items-center text-center cursor-pointer transition-all duration-200 hover:-translate-y-1 active:translate-y-0.5 select-none"
              :class="[fact.colorClass, activeFactIndex === idx ? fact.activeBg + ' scale-105 border-4' : 'opacity-85 hover:opacity-100 border-dashed']"
            >
              <span class="text-3xl mb-2 filter drop-shadow">{{ fact.icon }}</span>
              <span class="font-extrabold text-base md:text-lg leading-tight">{{ fact.title }}</span>
            </div>
          </div>

          <!-- Large Active Speech Bubble Explanation -->
          <div 
            v-if="activeFactIndex !== null" 
            class="bg-white border-2 border-gray-100 rounded-[32px] p-6 shadow-sm flex flex-col md:flex-row items-center gap-6 relative transition-all duration-300 animate-slide-up"
          >
            <!-- Dialogue bubble pointer triangle pointing to top -->
            <div class="absolute -top-3 left-[20%] md:left-[12.5%] xl:left-[12.5%] w-6 h-6 bg-white border-t-2 border-l-2 border-gray-100 rotate-45 pointer-events-none hidden md:block"></div>
            
            <div class="w-16 h-16 rounded-full bg-gray-50 flex items-center justify-center text-4xl shadow-inner shrink-0">
              {{ facts[activeFactIndex].icon }}
            </div>
            
            <div class="flex-grow text-center md:text-left">
              <h4 class="text-lg font-extrabold text-[#374151]">{{ facts[activeFactIndex].subtitle }}</h4>
              <p class="text-sm font-semibold text-gray-500 mt-1.5 leading-relaxed">{{ facts[activeFactIndex].description }}</p>
            </div>

            <button 
              @click="playPopSound(); speakFact(facts[activeFactIndex].voiceText)"
              class="px-5 py-3 bg-[#70d5c9] hover:bg-[#5bb8ad] text-white font-extrabold rounded-[20px] flex items-center gap-2 shadow-md hover:shadow-lg active:scale-95 transition-all text-sm shrink-0 cursor-pointer"
              :class="{'animate-pulse bg-emerald-400 hover:bg-emerald-500': isSpeaking}"
            >
              <span>🔊</span> {{ isSpeaking ? 'Mendengar...' : 'Dengar Lagi' }}
            </button>
          </div>
        </div>

        <!-- Quiz Navigation Starter Box -->
        <div class="bg-gradient-to-r from-[#ffe9de] to-[#fff5f0] border-2 border-[#f7945d]/30 rounded-[32px] p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-sm mb-6">
          <div class="flex gap-4 items-start text-center md:text-left flex-col md:flex-row">
            <div class="w-14 h-14 bg-[#ffd3ba] rounded-2xl flex items-center justify-center text-3xl shadow-sm shrink-0 mx-auto">
              📝
            </div>
            <div>
              <h3 class="text-xl font-extrabold text-[#c45a1f]">Ayo Uji Pengetahuanmu!</h3>
              <p class="text-xs md:text-sm font-semibold text-[#8a4216] mt-1 leading-relaxed">
                Sudah mengerti tentang mata, telinga, hidung, dan lidah? <br />
                Cobalah jawab 5 pertanyaan seru untuk mendapatkan Bintang 3 emas!
              </p>
              
              <!-- Quick Stats Icons -->
              <div class="flex flex-wrap items-center justify-center md:justify-start gap-3 mt-4">
                <span class="px-3 py-1 bg-[#ffa1b5]/15 border border-[#ffa1b5]/30 text-[#e04f6e] text-xs font-extrabold rounded-full">📑 5 Soal</span>
                <span class="px-3 py-1 bg-[#92cbd6]/15 border border-[#92cbd6]/30 text-[#2c7d8f] text-xs font-extrabold rounded-full">⏰ 10 Menit</span>
                <span class="px-3 py-1 bg-[#5dc1b9]/15 border border-[#5dc1b9]/30 text-[#2b8a82] text-xs font-extrabold rounded-full">⭐ 3 Bintang</span>
              </div>
            </div>
          </div>

          <button 
            @click="playPopSound(); currentPhase = 'quiz-intro'"
            class="px-8 py-5 bg-[#f7945d] hover:bg-[#e6834c] text-white font-extrabold text-base md:text-lg rounded-[24px] shadow-lg shadow-[#f7945d]/20 hover:scale-[1.04] active:scale-[0.96] transition-all cursor-pointer whitespace-nowrap"
          >
            Mulai Kuis! 🚀
          </button>
        </div>

      </div>


      <!-- ==================== PHASE 2: QUIZ INTRO ==================== -->
      <div v-else-if="currentPhase === 'quiz-intro'" class="flex-grow flex flex-col justify-center items-center py-8">
        
        <div class="w-full max-w-xl bg-white border-2 border-gray-100 rounded-[40px] p-8 shadow-lg flex flex-col text-center">
          
          <div class="w-20 h-20 bg-[#fff5f0] border border-[#ffd3ba] rounded-full flex items-center justify-center text-4xl shadow-inner mx-auto mb-6">
            💡
          </div>
          
          <h2 class="text-2xl md:text-3xl font-extrabold text-gray-800 mb-2">Tips Mengerjakan Kuis</h2>
          <p class="text-sm font-semibold text-gray-500 mb-6">Agar kamu bisa mendapatkan bintang penuh, ikuti petunjuk di bawah ini ya:</p>
          
          <!-- Instructions bullet list -->
          <div class="bg-[#fbfaf3] rounded-[24px] p-5 text-left border border-gray-100 mb-8 space-y-3.5">
            <div class="flex items-start gap-3">
              <span class="w-6 h-6 bg-[#ff8c52] text-white rounded-full flex items-center justify-center text-xs font-extrabold mt-0.5">1</span>
              <p class="text-xs md:text-sm font-bold text-gray-600 leading-relaxed">Bacalah pertanyaan dengan tenang dan teliti.</p>
            </div>
            <div class="flex items-start gap-3">
              <span class="w-6 h-6 bg-[#70d5c9] text-white rounded-full flex items-center justify-center text-xs font-extrabold mt-0.5">2</span>
              <p class="text-xs md:text-sm font-bold text-gray-600 leading-relaxed">Pilihlah salah satu dari 4 tombol pilihan jawaban yang menurutmu benar.</p>
            </div>
            <div class="flex items-start gap-3">
              <span class="w-6 h-6 bg-[#ffa1b5] text-white rounded-full flex items-center justify-center text-xs font-extrabold mt-0.5">3</span>
              <p class="text-xs md:text-sm font-bold text-gray-600 leading-relaxed">Setelah memilih, kamu akan langsung tahu apakah jawabanmu benar atau salah beserta penjelasannya!</p>
            </div>
          </div>

          <!-- Buttons -->
          <div class="grid grid-cols-2 gap-4">
            <button 
              @click="playPopSound(); currentPhase = 'learning'"
              class="w-full py-4 bg-gray-100 hover:bg-gray-200 text-gray-600 font-extrabold text-base rounded-[20px] transition-all active:scale-95 cursor-pointer"
            >
              Belajar Lagi
            </button>
            <button 
              @click="playPopSound(); currentPhase = 'quiz'; currentQuestionIndex = 0; score = 0"
              class="w-full py-4 bg-[#70d5c9] hover:bg-[#5bb8ad] text-white font-extrabold text-base rounded-[20px] transition-all hover:scale-105 active:scale-95 shadow-md shadow-[#70d5c9]/15 cursor-pointer"
            >
              Siap, Mulai! 🚀
            </button>
          </div>
          
        </div>

      </div>


      <!-- ==================== PHASE 3: ACTIVE QUIZ ==================== -->
      <div v-else-if="currentPhase === 'quiz'" class="flex-grow flex flex-col">
        
        <!-- Header with Owl Mascot & Cancel Button -->
        <div class="flex items-center justify-between mb-5">
          <div class="flex items-center gap-3">
            <!-- Animated Owl Mascot -->
            <div class="w-12 h-12 bg-[#70d5c9] rounded-full flex items-center justify-center border-2 border-white shadow-sm overflow-hidden animate-wiggle">
              <svg width="40" height="40" viewBox="0 0 160 160">
                <rect x="42" y="50" width="76" height="76" rx="38" fill="#a06a50" />
                <ellipse cx="80" cy="98" rx="22" ry="18" fill="#fecaca" />
                <circle cx="62" cy="74" r="19" fill="#fad02c" stroke="#d97706" stroke-width="2.5" />
                <circle cx="98" cy="74" r="19" fill="#fad02c" stroke="#d97706" stroke-width="2.5" />
                <rect x="75" y="72" width="10" height="4" fill="#d97706" />
                <circle v-if="!isBlinking" cx="62" cy="74" r="13" fill="#ffffff" />
                <circle v-if="!isBlinking" cx="98" cy="74" r="13" fill="#ffffff" />
                <circle v-if="!isBlinking" cx="62" cy="74" r="6" fill="#1f2937" />
                <circle v-if="!isBlinking" cx="98" cy="74" r="6" fill="#1f2937" />
                <path v-else d="M 52,74 Q 62,81 72,74" stroke="#1f2937" stroke-width="3" fill="none" />
                <path v-if="isBlinking" d="M 88,74 Q 98,81 108,74" stroke="#1f2937" stroke-width="3" fill="none" />
                <polygon points="80,77 74,87 86,87" fill="#f97316" />
              </svg>
            </div>
            
            <h2 class="text-lg md:text-xl font-extrabold text-gray-700">Kuis: Mengenal Tubuhku</h2>
          </div>
          
          <button 
            @click="playPopSound(); restartModule()"
            class="px-4 py-2 border border-rose-200 bg-rose-50 text-rose-500 font-extrabold text-xs rounded-[16px] transition-all hover:bg-rose-100 active:scale-95 cursor-pointer"
          >
            ← Keluar Kuis
          </button>
        </div>

        <!-- Progress Bar Indicator -->
        <div class="mb-6 bg-white border-2 border-gray-100 rounded-[24px] p-4 shadow-sm">
          <div class="flex justify-between items-center mb-2 font-bold text-xs md:text-sm text-gray-500">
            <span>Progress Kuis</span>
            <span class="text-[#70d5c9]">Pertanyaan {{ currentQuestionIndex + 1 }} dari 5</span>
          </div>
          
          <div class="w-full h-4 bg-gray-100 rounded-full overflow-hidden border border-gray-200/50 p-0.5">
            <div 
              class="h-full bg-gradient-to-r from-[#70d5c9] to-[#5dc1b9] rounded-full transition-all duration-500 ease-out"
              :style="{ width: `${((currentQuestionIndex + 1) / 5) * 100}%` }"
            ></div>
          </div>
        </div>

        <!-- Main Question Card Container -->
        <div class="bg-white border-2 border-gray-100 rounded-[36px] p-6 md:p-8 shadow-sm flex-grow flex flex-col justify-center mb-6">
          <div class="flex gap-4 items-start mb-6">
            <div class="w-12 h-12 bg-[#70d5c9] text-white rounded-full flex items-center justify-center text-xl font-extrabold shrink-0 shadow-md">
              {{ currentQuestionIndex + 1 }}
            </div>
            <h3 class="text-xl md:text-2xl font-extrabold text-gray-800 leading-snug mt-1">
              {{ questions[currentQuestionIndex].question }}
            </h3>
          </div>

          <!-- Multiple choice grid options -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4 my-2">
            <button 
              v-for="opt in questions[currentQuestionIndex].options" 
              :key="opt.key"
              @click="handleOptionSelect(opt.key, $event)"
              class="border-2 rounded-[24px] p-5 text-left font-bold text-base md:text-lg flex items-center gap-4 transition-all duration-200 select-none cursor-pointer text-gray-800"
              :class="[
                // Default options classes
                !isAnswered ? 'border-gray-200 bg-white hover:border-[#70d5c9] hover:bg-[#e8f6f5]/20 hover:-translate-y-0.5 shadow-sm active:translate-y-0.5 text-gray-800' : '',
                // Selected option correct classes
                isAnswered && opt.key === questions[currentQuestionIndex].correct ? 'border-green-500 bg-green-50 text-green-700 shadow-md ring-2 ring-green-300' : '',
                // Selected option incorrect classes
                isAnswered && selectedOption === opt.key && opt.key !== questions[currentQuestionIndex].correct ? 'border-rose-500 bg-rose-50 text-rose-700 shadow-md ring-2 ring-rose-300' : '',
                // Other options classes when answered
                isAnswered && opt.key !== questions[currentQuestionIndex].correct && selectedOption !== opt.key ? 'border-gray-150 bg-gray-50/50 text-gray-400 opacity-60' : ''
              ]"
            >
              <!-- Option Badge letter -->
              <span 
                class="w-9 h-9 rounded-full flex items-center justify-center text-sm font-extrabold shrink-0 shadow-inner"
                :class="[
                  !isAnswered ? 'bg-[#fbfaf3] text-gray-500 border border-gray-200' : '',
                  isAnswered && opt.key === questions[currentQuestionIndex].correct ? 'bg-green-500 text-white' : '',
                  isAnswered && selectedOption === opt.key && opt.key !== questions[currentQuestionIndex].correct ? 'bg-rose-500 text-white' : '',
                  isAnswered && opt.key !== questions[currentQuestionIndex].correct && selectedOption !== opt.key ? 'bg-gray-200 text-gray-400' : ''
                ]"
              >
                <!-- Checkmark/crossmark replacement on select -->
                <span v-if="isAnswered && opt.key === questions[currentQuestionIndex].correct">✓</span>
                <span v-else-if="isAnswered && selectedOption === opt.key && opt.key !== questions[currentQuestionIndex].correct">✗</span>
                <span v-else>{{ opt.key }}</span>
              </span>

              <span class="leading-tight">{{ opt.text }}</span>
            </button>
          </div>
        </div>

        <!-- Correct/Incorrect Overlay Success banners at bottom -->
        <div 
          v-if="isAnswered" 
          class="rounded-[32px] p-5 md:p-6 border-2 shadow-sm animate-slide-up flex flex-col md:flex-row items-center justify-between gap-4 transition-all duration-300"
          :class="[
            isCorrect ? 'bg-green-50 border-green-200 text-green-800' : 'bg-rose-50 border-rose-200 text-rose-800'
          ]"
        >
          <div class="flex gap-4 items-start text-center md:text-left flex-col md:flex-row">
            <span class="text-4xl shrink-0 mx-auto">
              {{ isCorrect ? '🎉' : '💪' }}
            </span>
            <div>
              <h4 class="text-lg font-extrabold leading-tight">
                {{ isCorrect ? 'Jawaban Benar! Hebat Sekali! 🎉' : 'Aduh, Belum Tepat! Coba Lagi Ya! 💪' }}
              </h4>
              <p class="text-xs md:text-sm font-bold opacity-90 mt-1 leading-relaxed">
                {{ questions[currentQuestionIndex].explanation }}
              </p>
            </div>
          </div>

          <button 
            @click="handleNextQuestion"
            class="px-6 py-4 bg-[#70d5c9] hover:bg-[#5bb8ad] text-white font-extrabold text-sm md:text-base rounded-[20px] transition-all hover:scale-105 active:scale-95 shadow-md flex items-center gap-1 cursor-pointer whitespace-nowrap shrink-0 border border-teal-300"
          >
            Lanjut Pertanyaan →
          </button>
        </div>

      </div>


      <!-- ==================== PHASE 4: CELEBRATION ==================== -->
      <div v-else-if="currentPhase === 'celebration'" class="flex-grow flex flex-col justify-center items-center py-6">
        
        <div class="w-full max-w-xl bg-white border-2 border-gray-100 rounded-[44px] p-8 md:p-10 shadow-xl text-center relative overflow-hidden flex flex-col">
          
          <!-- Background celebration sparkle circle -->
          <div class="absolute w-64 h-64 bg-[#70d5c9]/10 rounded-full opacity-30 blur-[2px] -top-10 -left-10 pointer-events-none"></div>
          <div class="absolute w-64 h-64 bg-[#ffa1b5]/10 rounded-full opacity-30 blur-[2px] -bottom-10 -right-10 pointer-events-none"></div>

          <!-- Cheerful Owl Mascot celebration -->
          <div class="w-28 h-28 bg-[#f5f9f8] border-2 border-[#70d5c9]/40 rounded-full flex items-center justify-center shadow-lg mx-auto mb-6 overflow-hidden animate-bounce">
            <svg width="88" height="88" viewBox="0 0 160 160">
              <!-- Party Hat -->
              <polygon points="80,10 60,48 100,48" fill="#ffa1b5" />
              <circle cx="80" cy="8" r="4.5" fill="#fbc72b" />
              <rect x="42" y="50" width="76" height="76" rx="38" fill="#a06a50" />
              <ellipse cx="80" cy="98" rx="22" ry="18" fill="#fecaca" />
              <circle cx="62" cy="74" r="19" fill="#fad02c" stroke="#d97706" stroke-width="2.5" />
              <circle cx="98" cy="74" r="19" fill="#fad02c" stroke="#d97706" stroke-width="2.5" />
              <circle cx="62" cy="74" r="13" fill="#ffffff" />
              <circle cx="98" cy="74" r="13" fill="#ffffff" />
              <circle cx="62" cy="74" r="6" fill="#1f2937" />
              <circle cx="98" cy="74" r="6" fill="#1f2937" />
              <polygon points="80,77 74,87 86,87" fill="#f97316" />
            </svg>
          </div>

          <h2 class="text-3xl md:text-4xl font-extrabold text-gray-800 mb-1 leading-tight select-none">Hore! Kuis Selesai!</h2>
          <p class="text-sm font-semibold text-gray-500 mb-6">Kamu telah menyelesaikan kuis Mengenal Tubuhku.</p>

          <!-- Golden stars rating area -->
          <div class="flex items-center justify-center gap-4 mb-6">
            <span 
              v-for="(star, index) in [0, 1, 2]" 
              :key="index"
              class="text-5xl md:text-6xl transition-all duration-500 ease-out select-none filter drop-shadow"
              :class="[
                starAnimations[index] ? 'scale-110 rotate-0 opacity-100' : 'scale-0 -rotate-45 opacity-0',
                index < computedStars ? 'text-[#fbc72b]' : 'text-gray-200'
              ]"
            >
              ★
            </span>
          </div>

          <!-- Score Card Container -->
          <div class="bg-[#fbfaf3] rounded-[28px] border-2 border-dashed border-[#70d5c9]/50 p-5 mb-8 max-w-sm mx-auto w-full">
            <span class="text-xs font-extrabold uppercase text-[#2b8a82] tracking-wider">Hasil Akhir</span>
            <div class="text-4xl font-extrabold text-gray-800 mt-1 select-none">
              {{ score }} <span class="text-gray-400 text-2xl font-bold">/ 5</span>
            </div>
            <p class="text-xs md:text-sm font-bold text-[#556b69] mt-2 leading-relaxed">
              <span v-if="score === 5">Luar Biasa! Kamu adalah Bintang Panca Indra! 🌟🏆</span>
              <span v-else-if="score >= 3">Hebat! Kamu sudah memahami panca indramu dengan baik! 🎉</span>
              <span v-else-if="score >= 1">Bagus! Terus belajar ya, kamu pasti bisa lebih hebat lagi! 💪</span>
              <span v-else>Jangan menyerah! Ayo tonton videonya lagi dan coba kuisnya lagi! 💖</span>
            </p>
          </div>

          <!-- Action buttons -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button 
              @click="restartModule"
              class="w-full py-4 border-2 border-[#70d5c9] hover:bg-[#70d5c9]/10 text-[#2b8a82] font-extrabold text-base rounded-[20px] transition-all active:scale-95 cursor-pointer"
            >
              Ulangi Kuis 🔄
            </button>
            <button 
              @click="playPopSound(); router.push('/')"
              class="w-full py-4 bg-[#70d5c9] hover:bg-[#5bb8ad] text-white font-extrabold text-base rounded-[20px] transition-all hover:scale-105 active:scale-95 shadow-md shadow-[#70d5c9]/20 cursor-pointer"
            >
              Kembali ke Beranda 🏠
            </button>
          </div>

        </div>

      </div>

    </div>
  </div>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800&display=swap');
.font-outfit {
  font-family: 'Outfit', sans-serif;
}

/* Custom micro-animations */
@keyframes slide-up {
  0% { transform: translateY(20px); opacity: 0; }
  100% { transform: translateY(0); opacity: 1; }
}
.animate-slide-up {
  animation: slide-up 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}

@keyframes nod {
  0%, 100% { transform: scale(1) translateY(0); }
  50% { transform: scale(1.05) translateY(-3px); }
}
.animate-nod {
  animation: nod 2.5s infinite ease-in-out;
}

@keyframes wiggle {
  0%, 100% { transform: rotate(0deg) scale(1); }
  50% { transform: rotate(4deg) scale(1.04); }
}
.animate-wiggle {
  animation: wiggle 3s infinite ease-in-out;
}

.transition-all {
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
}
</style>
