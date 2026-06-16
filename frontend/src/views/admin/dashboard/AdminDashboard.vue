<script setup>
import { defineProps, defineEmits } from 'vue'

const props = defineProps({
  stats: {
    type: Object,
    required: true,
    default: () => ({ pending: 0, approved: 0, rejected: 0 })
  },
  latestPending: {
    type: Array,
    required: true,
    default: () => []
  }
})

const emit = defineEmits(['approve', 'reject', 'view-all'])

const formatDate = (isoString) => {
  if (!isoString) return '-'
  const date = new Date(isoString)
  return date.toLocaleString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}
</script>

<template>
  <div class="flex-grow flex flex-col gap-6">
    <!-- STATS COUNTER GRID -->
    <div class="grid grid-cols-1 sm:grid-cols-3 gap-6">
      <!-- Stats Card 1: Pending -->
      <div class="bg-white/80 backdrop-blur-md border border-white/80 rounded-[28px] p-5 shadow-sm flex items-center justify-between hover:shadow-md transition-all duration-200">
        <div class="flex flex-col">
          <span class="text-xs font-bold text-[#8a8a8a] uppercase tracking-wide">Antrean Request</span>
          <span class="text-3xl font-black text-[#f7945d] mt-1 font-outfit">{{ props.stats.pending }}</span>
        </div>
        <div class="w-12 h-12 bg-[#fff4ee] rounded-2xl flex items-center justify-center text-2xl">⏳</div>
      </div>

      <!-- Stats Card 2: Approved -->
      <div class="bg-white/80 backdrop-blur-md border border-white/80 rounded-[28px] p-5 shadow-sm flex items-center justify-between hover:shadow-md transition-all duration-200">
        <div class="flex flex-col">
          <span class="text-xs font-bold text-[#8a8a8a] uppercase tracking-wide">Pengguna Aktif</span>
          <span class="text-3xl font-black text-[#7cd0b8] mt-1 font-outfit">{{ props.stats.approved }}</span>
        </div>
        <div class="w-12 h-12 bg-[#ebf9f8] rounded-2xl flex items-center justify-center text-2xl">👦</div>
      </div>

      <!-- Stats Card 3: Rejected -->
      <div class="bg-white/80 backdrop-blur-md border border-white/80 rounded-[28px] p-5 shadow-sm flex items-center justify-between hover:shadow-md transition-all duration-200">
        <div class="flex flex-col">
          <span class="text-xs font-bold text-[#8a8a8a] uppercase tracking-wide">Request Ditolak</span>
          <span class="text-3xl font-black text-[#ffa1b5] mt-1 font-outfit">{{ props.stats.rejected }}</span>
        </div>
        <div class="w-12 h-12 bg-[#fff5f6] rounded-2xl flex items-center justify-center text-2xl">❌</div>
      </div>
    </div>

    <!-- 3 PENDAFTAR TERBARU TABLE -->
    <div class="bg-white/80 backdrop-blur-md border border-white/80 rounded-[32px] p-6 shadow-sm flex flex-col gap-4">
      <div class="flex items-center justify-between border-b border-[#e8f6f5] pb-4">
        <h3 class="text-base font-black text-[#374151] flex items-center gap-2">
          <span>Antrean Pendaftaran Terbaru (Maks 3)</span>
          <span v-if="props.latestPending.length > 0" class="bg-[#ff8c52] text-white text-xs px-2.5 py-0.5 rounded-full font-black">
            {{ props.latestPending.length }}
          </span>
        </h3>
        <button 
          @click="emit('view-all')"
          class="text-xs font-bold text-[#70d5c9] hover:underline cursor-pointer"
        >
          Lihat Semua Antrean →
        </button>
      </div>

      <!-- Empty Pending state in Dashboard -->
      <div v-if="props.latestPending.length === 0" class="py-12 flex flex-col items-center justify-center text-center">
        <span class="text-5xl mb-3">🦉</span>
        <h4 class="text-lg font-black text-[#f7945d] uppercase">Antrean Bersih!</h4>
        <p class="text-xs text-[#7a7a7a] font-bold max-w-[280px] mt-1">Tidak ada anak hebat yang sedang menunggu persetujuan.</p>
      </div>

      <!-- Table of 3 latest pending -->
      <div v-else class="overflow-x-auto w-full">
        <table class="w-full text-left border-collapse min-w-[500px]">
          <thead>
            <tr class="border-b border-[#ebf9f8] text-[#8a8a8a] text-xs font-bold uppercase tracking-wider">
              <th class="pb-3 pl-2">Nama Lengkap</th>
              <th class="pb-3">Nama Pengguna</th>
              <th class="pb-3">Waktu Registrasi</th>
              <th class="pb-3 text-center pr-2">Aksi Cepat</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-[#fafefa] text-sm text-[#374151]">
            <tr 
              v-for="user in props.latestPending" 
              :key="user.id"
              class="hover:bg-[#ebf9f8]/10 transition-colors"
            >
              <td class="py-4 pl-2 font-extrabold text-[#374151]">{{ user.nama || user.username }}</td>
              <td class="py-4 font-semibold text-[#8a8a8a] lowercase">@{{ user.username }}</td>
              <td class="py-4 font-semibold text-[#9ca3af] text-xs">{{ formatDate(user.created_at) }}</td>
              <td class="py-4">
                <div class="flex items-center justify-center gap-2">
                  <button 
                    @click="emit('reject', user.id, user.nama || user.username)"
                    class="px-4 py-2 border-2 border-[#ffa1b5]/60 hover:bg-[#fff5f6] text-[#ff6b8b] font-bold rounded-[12px] text-xs active:scale-95 transition-all cursor-pointer"
                  >
                    Tolak
                  </button>
                  <button 
                    @click="emit('approve', user.id, user.nama || user.username)"
                    class="px-4 py-2 bg-[#70d5c9] hover:bg-[#5dc1b9] text-white font-bold rounded-[12px] text-xs shadow-md shadow-[#70d5c9]/15 active:scale-95 transition-all cursor-pointer"
                  >
                    Setujui
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>
