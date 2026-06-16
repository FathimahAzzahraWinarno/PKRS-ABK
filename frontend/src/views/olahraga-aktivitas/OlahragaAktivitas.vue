<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import confetti from 'canvas-confetti'

const router = useRouter()

const currentPhase = ref('learning')
const selectedModule = ref({
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
  videoUrl: 'https://www.youtube.com/embed/g72D_1vLg6Y'
})
const isVideoPlaying = ref(false)
const activeFactIndex = ref(0)
const isBlinking = ref(false)
const isSpeaking = ref(false)

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

const playCorrectSound = () => {
  const notes = [392.00, 523.25, 659.25, 783.99]
  notes.forEach((freq, idx) => {
    setTimeout(() => {
      playNote(freq, 'sine', 0.4)
    }, idx * 100)
  })
}

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

const playVictorySound = () => {
  const notes = [392.00, 523.25, 659.25, 783.99, 1046.50, 1318.51, 1567.98]
  notes.forEach((freq, idx) => {
    setTimeout(() => {
      playNote(freq, 'sine', 0.5)
    }, idx * 80)
  })
}

const questions = ref([
  {
    id: 1,
    tag: 'PILIHAN GANDA',
    visualEmoji: '🔒 🧡',
    visualDescription: 'Siluet tubuh dengan warna biru (bagian umum) dan oranye+gembok (bagian privat)',
    question: 'Bagian tubuh mana yang disebut BAGIAN PRIVAT?',
    options: [
      { key: 'A', text: 'Tangan dan kaki' },
      { key: 'B', text: 'Wajah dan rambut' },
      { key: 'C', text: 'Bagian yang tertutup pakaian dalam' },
      { key: 'D', text: 'Telinga dan hidung' }
    ],
    correct: 'C',
    explanation: 'Bagian privat adalah bagian tubuh yang tertutup oleh pakaian dalam dan tidak boleh dilihat atau disentuh oleh orang lain sembarangan. 🔒'
  },
  {
    id: 2,
    tag: 'BENAR / SALAH',
    visualEmoji: '📏 🌱 ✓',
    visualDescription: 'Siluet anak sebelum dan sesudah pubertas dengan tanda besar "NORMAL!"',
    question: 'Benar atau salah: "Perubahan tubuh saat pubertas (seperti tumbuhnya rambut baru, suara berubah, atau haid) adalah hal yang normal."',
    options: [
      { key: 'A', text: 'BENAR' },
      { key: 'B', text: 'SALAH' }
    ],
    correct: 'A',
    explanation: 'Pubertas adalah proses alami dan normal. Tidak perlu malu atau takut. Tubuh berubah untuk tumbuh menjadi dewasa. 📏🌱'
  },
  {
    id: 3,
    tag: 'PILIHAN GANDA',
    visualEmoji: '🏷️ 🧬',
    visualDescription: 'Nama yang benar untuk bagian tubuh perempuan yang digunakan buang air kecil',
    question: 'Apa nama yang BENAR untuk bagian tubuh yang digunakan untuk buang air kecil pada anak perempuan?',
    options: [
      { key: 'A', text: 'Bagian bawah' },
      { key: 'B', text: 'Vagina' },
      { key: 'C', text: 'Tempat rahasia' },
      { key: 'D', text: 'Bagian itu' }
    ],
    correct: 'B',
    explanation: 'Penting tahu nama yang benar dari bagian tubuh. Nama yang benar untuk alat kelamin perempuan adalah vagina. 🏷️'
  },
  {
    id: 4,
    tag: 'SKENARIO SITUASI',
    visualEmoji: '😰 🩸',
    visualDescription: 'Ana terkejut melihat bercak darah di celananya dan merasa takut',
    question: 'Ana mendapati ada bercak darah di celananya dan merasa takut. Apa yang sebaiknya Ana lakukan?',
    options: [
      { key: 'A', text: 'Diam saja dan menyembunyikannya' },
      { key: 'B', text: 'Menangis sendirian dan tidak cerita' },
      { key: 'C', text: 'Segera cerita ke ibu atau guru perempuan yang dipercaya' },
      { key: 'D', text: 'Marah-marah kepada temannya' }
    ],
    correct: 'C',
    explanation: 'Menstruasi atau haid pertama adalah hal yang normal bagi anak perempuan yang mulai dewasa. Segera ceritakan kepada ibu atau guru perempuan agar dibantu memakai pembalut. 🩸💖'
  },
  {
    id: 5,
    tag: 'BENAR / SALAH',
    visualEmoji: '😊 🚿',
    visualDescription: 'Anak bersembunyi malu (salah) vs. anak merawat diri dengan senyum (benar)',
    question: 'Benar atau salah: "Perubahan saat pubertas seperti jerawat atau bau badan adalah sesuatu yang memalukan dan harus disembunyikan."',
    options: [
      { key: 'A', text: 'BENAR' },
      { key: 'B', text: 'SALAH' }
    ],
    correct: 'B',
    explanation: 'Perubahan fisik seperti jerawat atau bau badan saat pubertas adalah hal yang wajar. Kita hanya perlu rajin merawat kebersihan tubuh seperti mandi dengan sabun dan cuci muka. 🧼🚿'
  }
])

const getYoutubeId = (url) => {
  if (!url) return ''
  const parts = url.split('/')
  return parts[parts.length - 1]
}

const currentQuestionIndex = ref(0)
const selectedOption = ref(null)
const isAnswered = ref(false)
const isCorrect = ref(null)
const score = ref(0)

const handleOptionSelect = (key, e) => {
  if (isAnswered.value) return
  selectedOption.value = key
  isAnswered.value = true
  const currentQuestion = questions.value[currentQuestionIndex.value]
  if (key === currentQuestion.correct) {
    isCorrect.value = true
    score.value++
    playCorrectSound()
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
    currentPhase.value = 'celebration'
    triggerCelebration()
  }
}

const starAnimations = ref([false, false, false])
const computedStars = ref(0)

const triggerCelebration = () => {
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
  starAnimations.value = [false, false, false]
  for (let i = 0; i < computedStars.value; i++) {
    setTimeout(() => {
      starAnimations.value[i] = true
      playNote(392.00 + i * 150, 'sine', 0.25)
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
      colors: ['#a7f3d0', '#d1fae5', '#ffa1b5', '#ffd3ba']
    })
    confetti({
      particleCount: 4,
      angle: 120,
      spread: 50,
      origin: { x: 1, y: 0.8 },
      colors: ['#a7f3d0', '#d1fae5', '#ffa1b5', '#ffd3ba']
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
  router.push('/')
}

const restartQuiz = () => {
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

let blinkInterval
onMounted(() => {
  const app = document.getElementById('app')
  if (app) {
    app.classList.add('full-screen-layout')
  }
  document.body.classList.add('full-screen-body')
  if ('speechSynthesis' in window) {
    window.speechSynthesis.getVoices()
  }
  blinkInterval = setInterval(() => {
    isBlinking.value = true
    setTimeout(() => {
      isBlinking.value = false
    }, 150)
  }, 3800)
  setTimeout(() => {
    playNote(783.99, 'sine', 0.5)
  }, 100)
})

onUnmounted(() => {
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
    <div class="absolute w-36 h-36 bg-[#a7f3d0] rounded-full opacity-15 filter blur-[3px] pointer-events-none" style="left: -20px; top: 120px;"></div>
    <div class="absolute w-44 h-44 bg-[#d1fae5] rounded-full opacity-15 filter blur-[3px] pointer-events-none" style="right: -40px; top: 300px;"></div>
    <div class="absolute w-40 h-40 bg-[#ffa1b5] rounded-full opacity-15 filter blur-[3px] pointer-events-none" style="left: 10%; bottom: -50px;"></div>

    <div class="max-w-[850px] mx-auto relative z-10 flex flex-col min-h-[90vh]">
      <div v-if="currentPhase === 'learning'" class="flex-grow flex flex-col">
        <div class="flex items-center justify-between mb-6">
          <button
            @click="playPopSound(); router.push('/')"
            class="flex items-center gap-2 px-5 py-2.5 bg-white border border-gray-200 rounded-[20px] text-gray-500 font-extrabold text-sm hover:scale-105 active:scale-95 transition-all shadow-sm hover:shadow cursor-pointer"
          >
            <span>←</span> Kembali
          </button>
          
          <div class="flex items-center gap-3">
            <h1 class="text-xl md:text-2xl font-extrabold text-[#10b981]">
              {{ selectedModule ? selectedModule.title : 'Tubuhku Luar Biasa' }}
            </h1>
            <div class="w-11 h-11 bg-[#d1fae5] rounded-full flex items-center justify-center border-2 border-white shadow-sm overflow-hidden animate-nod">
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

        <div class="bg-white border-2 border-[#f0fdf4] rounded-[36px] p-6 md:p-8 shadow-md mb-8 flex flex-col">
          <div class="flex items-center gap-3 mb-4">
            <div class="w-12 h-12 bg-[#d1fae5] rounded-2xl flex items-center justify-center text-xl shadow-inner">
              💪
            </div>
            <div>
              <h2 class="text-xl md:text-2xl font-extrabold text-gray-800">
                Belajar {{ selectedModule ? selectedModule.title : 'Tubuhku Luar Biasa' }}
              </h2>
              <p class="text-xs md:text-sm font-semibold text-gray-500 mt-0.5">
                Yuk simak video seru di bawah ini untuk belajar tentang {{ selectedModule ? selectedModule.title.toLowerCase() : 'tubuhku luar biasa' }}!
              </p>
            </div>
          </div>

          <div class="relative w-full aspect-video rounded-[24px] overflow-hidden border-4 border-white shadow-inner bg-gradient-to-tr from-[#a7f3d0]/10 to-[#f0fdf4]/10 flex items-center justify-center">
            <div v-if="!isVideoPlaying" class="absolute inset-0 flex flex-col items-center justify-center p-4 text-center cursor-pointer group" @click="isVideoPlaying = true; playPopSound()">
              <div
                class="absolute inset-0 bg-cover bg-center opacity-70 group-hover:scale-105 transition-transform duration-500"
                :style="{ backgroundImage: `url('https://img.youtube.com/vi/${getYoutubeId(selectedModule?.videoUrl)}/maxresdefault.jpg')` }"
              ></div>
              <div class="absolute inset-0 bg-black/30 group-hover:bg-black/25 transition-all duration-300"></div>
              
              <button class="relative z-10 w-20 h-20 bg-[#10b981] hover:bg-[#059669] text-white rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 active:scale-95 transition-all duration-200 cursor-pointer">
                <svg class="w-8 h-8 fill-current ml-1" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z" />
                </svg>
              </button>
              <span class="relative z-10 text-white font-extrabold text-lg mt-4 bg-black/40 px-4 py-1.5 rounded-full select-none">Putar Video Belajar 🌟</span>
            </div>

            <iframe
              v-else
              class="w-full h-full rounded-[24px] border-4 border-white"
              :src="`https://www.youtube.com/embed/${getYoutubeId(selectedModule?.videoUrl)}?autoplay=1`"
              :title="selectedModule?.title"
              frameborder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowfullscreen
            ></iframe>
          </div>
        </div>

        <div class="bg-gradient-to-r from-[#f0fdf4] to-[#ecfdf5] border-2 border-[#a7f3d0]/30 rounded-[32px] p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-sm mb-6">
          <div class="flex gap-4 items-start text-center md:text-left flex-col md:flex-row">
            <div class="w-14 h-14 bg-[#d1fae5] rounded-2xl flex items-center justify-center text-3xl shadow-sm shrink-0 mx-auto">
              📝
            </div>
            <div>
              <h3 class="text-xl font-extrabold text-[#047857]">Ayo Uji Pengetahuanmu!</h3>
              <p class="text-xs md:text-sm font-semibold text-[#047857] mt-1 leading-relaxed">
                Sudah mengerti tentang pelajaran {{ selectedModule ? selectedModule.title : 'ini' }}? <br />
                Cobalah jawab 5 pertanyaan seru untuk mendapatkan Bintang 3 emas!
              </p>
              
              <div class="flex flex-wrap items-center justify-center md:justify-start gap-3 mt-4">
                <span class="px-3 py-1 bg-[#ffa1b5]/15 border border-[#ffa1b5]/30 text-[#e04f6e] text-xs font-extrabold rounded-full">📑 5 Soal</span>
                <span class="px-3 py-1 bg-[#92cbd6]/15 border border-[#92cbd6]/30 text-[#2c7d8f] text-xs font-extrabold rounded-full">⏰ 10 Menit</span>
                <span class="px-3 py-1 bg-[#5dc1b9]/15 border border-[#5dc1b9]/30 text-[#2b8a82] text-xs font-extrabold rounded-full">⭐ 3 Bintang</span>
              </div>
            </div>
          </div>

          <button
            @click="playPopSound(); currentPhase = 'quiz-intro'"
            class="px-8 py-5 bg-[#10b981] hover:bg-[#059669] text-white font-extrabold text-base md:text-lg rounded-[24px] shadow-lg shadow-[#10b981]/20 hover:scale-[1.04] active:scale-[0.96] transition-all cursor-pointer whitespace-nowrap"
          >
            Mulai Kuis! 🚀
          </button>
        </div>
      </div>

      <div v-else-if="currentPhase === 'quiz-intro'" class="flex-grow flex flex-col justify-center items-center py-8">
        <div class="w-full max-w-xl bg-white border-2 border-gray-100 rounded-[40px] p-8 shadow-lg flex flex-col text-center">
          <div class="w-20 h-20 bg-[#f0fdf4] border border-[#a7f3d0] rounded-full flex items-center justify-center text-4xl shadow-inner mx-auto mb-6">
            💡
          </div>
          
          <h2 class="text-2xl md:text-3xl font-extrabold text-gray-800 mb-2">Tips Mengerjakan Kuis</h2>
          <p class="text-sm font-semibold text-gray-500 mb-6">Agar kamu bisa mendapatkan bintang penuh, ikuti petunjuk di bawah ini ya:</p>
          
          <div class="bg-[#fbfaf3] rounded-[24px] p-5 text-left border border-gray-100 mb-8 space-y-3.5">
            <div class="flex items-start gap-3">
              <span class="w-6 h-6 bg-[#ff8c52] text-white rounded-full flex items-center justify-center text-xs font-extrabold mt-0.5">1</span>
              <p class="text-xs md:text-sm font-bold text-gray-600 leading-relaxed">Bacalah pertanyaan dengan tenang dan teliti.</p>
            </div>
            <div class="flex items-start gap-3">
              <span class="w-6 h-6 bg-[#70d5c9] text-white rounded-full flex items-center justify-center text-xs font-extrabold mt-0.5">2</span>
              <p class="text-xs md:text-sm font-bold text-gray-600 leading-relaxed">Pilihlah salah satu dari tombol pilihan jawaban yang menurutmu benar.</p>
            </div>
            <div class="flex items-start gap-3">
              <span class="w-6 h-6 bg-[#ffa1b5] text-white rounded-full flex items-center justify-center text-xs font-extrabold mt-0.5">3</span>
              <p class="text-xs md:text-sm font-bold text-gray-600 leading-relaxed">Setelah memilih, kamu akan langsung tahu apakah jawabanmu benar atau salah beserta penjelasannya!</p>
            </div>
          </div>

          <div class="grid grid-cols-2 gap-4">
            <button
              @click="playPopSound(); currentPhase = 'learning'"
              class="w-full py-4 bg-gray-100 hover:bg-gray-200 text-gray-600 font-extrabold text-base rounded-[20px] transition-all active:scale-95 cursor-pointer"
            >
              Belajar Lagi
            </button>
            <button
              @click="playPopSound(); currentPhase = 'quiz'; currentQuestionIndex = 0; score = 0"
              class="w-full py-4 bg-[#10b981] hover:bg-[#059669] text-white font-extrabold text-base rounded-[20px] transition-all hover:scale-105 active:scale-95 shadow-md shadow-[#10b981]/15 cursor-pointer"
            >
              Siap, Mulai! 🚀
            </button>
          </div>
        </div>
      </div>

      <div v-else-if="currentPhase === 'quiz'" class="flex-grow flex flex-col">
        <div class="flex items-center justify-between mb-5">
          <div class="flex items-center gap-3">
            <div class="w-12 h-12 bg-[#d1fae5] rounded-full flex items-center justify-center border-2 border-white shadow-sm overflow-hidden animate-wiggle">
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
            
            <h2 class="text-lg md:text-xl font-extrabold text-gray-700">
              Kuis: {{ selectedModule ? selectedModule.title : 'Tubuhku Luar Biasa' }}
            </h2>
          </div>
          
          <button
            @click="playPopSound(); restartModule()"
            class="px-4 py-2 border border-rose-200 bg-rose-50 text-rose-500 font-extrabold text-xs rounded-[16px] transition-all hover:bg-rose-100 active:scale-95 cursor-pointer"
          >
            ← Keluar Kuis
          </button>
        </div>

        <div class="mb-6 bg-white border-2 border-gray-100 rounded-[24px] p-4 shadow-sm">
          <div class="flex justify-between items-center mb-2 font-bold text-xs md:text-sm text-gray-500">
            <span>Progress Kuis</span>
            <span class="text-[#10b981]">Pertanyaan {{ currentQuestionIndex + 1 }} dari 5</span>
          </div>
          
          <div class="w-full h-4 bg-gray-100 rounded-full overflow-hidden border border-gray-200/50 p-0.5">
            <div
              class="h-full bg-gradient-to-r from-[#10b981] to-[#059669] rounded-full transition-all duration-500 ease-out"
              :style="{ width: `${((currentQuestionIndex + 1) / 5) * 100}%` }"
            ></div>
          </div>
        </div>

        <div class="bg-white border-2 border-gray-100 rounded-[36px] p-6 md:p-8 shadow-sm flex-grow flex flex-col justify-center mb-6">
          <div v-if="questions[currentQuestionIndex].tag" class="mb-4 self-start">
            <span class="px-4 py-1.5 bg-[#f2f1e8] text-[#8c8873] text-xs font-bold uppercase rounded-full tracking-wider">
              {{ questions[currentQuestionIndex].tag }}
            </span>
          </div>

          <div v-if="questions[currentQuestionIndex].visualEmoji" class="w-full bg-white border border-gray-200 rounded-[24px] p-5 mb-6 flex flex-col items-center justify-center text-center shadow-sm">
            <div class="text-5xl mb-3 filter drop-shadow">
              {{ questions[currentQuestionIndex].visualEmoji }}
            </div>
            <div class="text-sm font-semibold text-gray-500 italic leading-relaxed">
              {{ questions[currentQuestionIndex].visualDescription }}
            </div>
          </div>

          <div class="flex gap-4 items-start mb-6">
            <div class="w-12 h-12 bg-[#10b981] text-white rounded-full flex items-center justify-center text-xl font-extrabold shrink-0 shadow-md">
              {{ currentQuestionIndex + 1 }}
            </div>
            <h3 class="text-xl md:text-2xl font-extrabold text-gray-800 leading-snug mt-1">
              {{ questions[currentQuestionIndex].question }}
            </h3>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4 my-2">
            <button
              v-for="opt in questions[currentQuestionIndex].options"
              :key="opt.key"
              @click="handleOptionSelect(opt.key, $event)"
              class="border-2 rounded-[24px] p-5 text-left font-bold text-base md:text-lg flex items-center gap-4 transition-all duration-200 select-none cursor-pointer text-gray-800"
              :class="[
                !isAnswered ? 'border-gray-200 bg-white hover:border-[#10b981] hover:bg-[#f0fdf4]/20 hover:-translate-y-0.5 shadow-sm active:translate-y-0.5 text-gray-800' : '',
                isAnswered && opt.key === questions[currentQuestionIndex].correct ? 'border-green-500 bg-green-50 text-green-700 shadow-md ring-2 ring-green-300' : '',
                isAnswered && selectedOption === opt.key && opt.key !== questions[currentQuestionIndex].correct ? 'border-rose-500 bg-rose-50 text-rose-700 shadow-md ring-2 ring-rose-300' : '',
                isAnswered && opt.key !== questions[currentQuestionIndex].correct && selectedOption !== opt.key ? 'border-gray-150 bg-gray-50/50 text-gray-400 opacity-60' : ''
              ]"
            >
              <span
                class="w-9 h-9 rounded-full flex items-center justify-center text-sm font-extrabold shrink-0 shadow-inner"
                :class="[
                  !isAnswered ? 'bg-[#fbfaf3] text-gray-500 border border-gray-200' : '',
                  isAnswered && opt.key === questions[currentQuestionIndex].correct ? 'bg-green-500 text-white' : '',
                  isAnswered && selectedOption === opt.key && opt.key !== questions[currentQuestionIndex].correct ? 'bg-rose-500 text-white' : '',
                  isAnswered && opt.key !== questions[currentQuestionIndex].correct && selectedOption !== opt.key ? 'bg-gray-200 text-gray-400' : ''
                ]"
              >
                <span v-if="isAnswered && opt.key === questions[currentQuestionIndex].correct">✓</span>
                <span v-else-if="isAnswered && selectedOption === opt.key && opt.key !== questions[currentQuestionIndex].correct">✗</span>
                <span v-else>{{ opt.key }}</span>
              </span>

              <span class="leading-tight">{{ opt.text }}</span>
            </button>
          </div>
        </div>

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
            class="px-6 py-4 bg-[#10b981] hover:bg-[#059669] text-white font-extrabold text-sm md:text-base rounded-[20px] transition-all hover:scale-105 active:scale-95 shadow-md flex items-center gap-1 cursor-pointer whitespace-nowrap shrink-0 border border-emerald-300"
          >
            Lanjut Pertanyaan →
          </button>
        </div>
      </div>

      <div v-else-if="currentPhase === 'celebration'" class="flex-grow flex flex-col justify-center items-center py-6">
        <div class="w-full max-w-xl bg-white border-2 border-gray-100 rounded-[44px] p-8 md:p-10 shadow-xl text-center relative overflow-hidden flex flex-col">
          <div class="absolute w-64 h-64 bg-[#10b981]/10 rounded-full opacity-30 blur-[2px] -top-10 -left-10 pointer-events-none"></div>
          <div class="absolute w-64 h-64 bg-[#ffa1b5]/10 rounded-full opacity-30 blur-[2px] -bottom-10 -right-10 pointer-events-none"></div>

          <div class="w-28 h-28 bg-[#f5f9f8] border-2 border-[#10b981]/40 rounded-full flex items-center justify-center shadow-lg mx-auto mb-6 overflow-hidden animate-bounce">
            <svg width="88" height="88" viewBox="0 0 160 160">
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
          <p class="text-sm font-semibold text-gray-500 mb-6">Kamu telah menyelesaikan kuis {{ selectedModule ? selectedModule.title : 'Tubuhku Luar Biasa' }}.</p>

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

          <div class="bg-[#fbfaf3] rounded-[28px] border-2 border-dashed border-[#10b981]/50 p-5 mb-8 max-w-sm mx-auto w-full">
            <span class="text-xs font-extrabold uppercase text-[#047857] tracking-wider">Hasil Akhir</span>
            <div class="text-4xl font-extrabold text-gray-800 mt-1 select-none">
              {{ score }} <span class="text-gray-400 text-2xl font-bold">/ 5</span>
            </div>
            <p class="text-xs md:text-sm font-bold text-[#556b69] mt-2 leading-relaxed">
              <span v-if="score === 5">Luar Biasa! Kamu menjawab semua dengan benar! 🌟🏆</span>
              <span v-else-if="score >= 3">Hebat! Kamu sudah memahami pelajaran ini dengan baik! 🎉</span>
              <span v-else-if="score >= 1">Bagus! Terus belajar ya, kamu pasti bisa lebih hebat lagi! 💪</span>
              <span v-else>Jangan menyerah! Ayo tonton videonya lagi dan coba kuisnya lagi! 💖</span>
            </p>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button
              @click="restartQuiz"
              class="w-full py-4 border-2 border-[#10b981] hover:bg-[#10b981]/10 text-[#047857] font-extrabold text-base rounded-[20px] transition-all active:scale-95 cursor-pointer"
            >
              Ulangi Kuis 🔄
            </button>
            <button
              @click="restartModule"
              class="w-full py-4 bg-[#10b981] hover:bg-[#059669] text-white font-extrabold text-base rounded-[20px] transition-all hover:scale-105 active:scale-95 shadow-md shadow-[#10b981]/20 cursor-pointer"
            >
              Pilih Topik Lain 📚
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.font-outfit {
  font-family: 'Outfit', sans-serif;
}

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
