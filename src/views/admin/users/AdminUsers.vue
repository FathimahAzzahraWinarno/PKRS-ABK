<script setup>
import { ref, defineProps, defineEmits, defineExpose } from 'vue'

const props = defineProps({
  allUsersList: {
    type: Array,
    required: true,
    default: () => []
  },
  activeTab: {
    type: String,
    required: true,
    default: 'approved'
  },
  isPasswordSaving: {
    type: Object,
    required: true,
    default: () => ({})
  }
})

const emit = defineEmits(['update:activeTab', 'approve', 'reject', 'reset-password'])

// Local state for password inputs
const passwordInputs = ref({})

// Method to clear a specific user's password input (called by parent upon successful reset)
const clearPasswordInput = (userId) => {
  passwordInputs.value[userId] = ''
}

// Expose the method to parent
defineExpose({
  clearPasswordInput
})

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

const onResetPasswordClick = (userId, username) => {
  const newPassword = passwordInputs.value[userId] || ''
  emit('reset-password', userId, username, newPassword)
}
</script>

<template>
  <div class="flex-grow flex flex-col gap-6">
    <!-- TABS SELECTOR (Disetujui vs Pending) -->
    <div class="flex items-center border-b border-[#ebf9f8] bg-white/60 rounded-t-[20px] px-4">
      <button 
        @click="emit('update:activeTab', 'approved')"
        class="px-6 py-3.5 text-sm font-extrabold transition-all border-b-4 cursor-pointer"
        :class="props.activeTab === 'approved' ? 'border-[#70d5c9] text-[#5dc1b9]' : 'border-transparent text-[#6b7280] hover:text-[#5dc1b9]'"
      >
        Pengguna Aktif ({{ props.allUsersList.filter(u => u.status === 'approved').length }})
      </button>
      <button 
        @click="emit('update:activeTab', 'pending')"
        class="px-6 py-3.5 text-sm font-extrabold transition-all border-b-4 cursor-pointer"
        :class="props.activeTab === 'pending' ? 'border-[#ff8c52] text-[#ff8c52]' : 'border-transparent text-[#6b7280] hover:text-[#ff8c52]'"
      >
        Menunggu Persetujuan ({{ props.allUsersList.filter(u => u.status === 'pending').length }})
      </button>
    </div>

    <!-- TAB 1: APPROVED USERS LIST -->
    <div v-if="props.activeTab === 'approved'" class="bg-white/80 backdrop-blur-md border border-white/80 rounded-[32px] p-6 shadow-sm flex flex-col gap-4">
      <!-- Empty Approved state -->
      <div v-if="props.allUsersList.filter(u => u.status === 'approved').length === 0" class="py-12 flex flex-col items-center justify-center text-center">
        <span class="text-5xl mb-3">👦</span>
        <h4 class="text-lg font-black text-[#7cd0b8] uppercase">Tidak Ada Pengguna Aktif</h4>
        <p class="text-xs text-[#7a7a7a] font-bold max-w-[280px] mt-1">Belum ada akun pendaftar yang disetujui untuk belajar.</p>
      </div>

      <!-- Table of approved users -->
      <div v-else class="overflow-x-auto w-full">
        <table class="w-full text-left border-collapse min-w-[650px]">
          <thead>
            <tr class="border-b border-[#ebf9f8] text-[#8a8a8a] text-xs font-bold uppercase tracking-wider">
              <th class="pb-3 pl-2">Nama Lengkap</th>
              <th class="pb-3">Nama Pengguna</th>
              <th class="pb-3">Tanggal Disetujui</th>
              <th class="pb-3 w-[260px] pl-4">Ubah Kata Sandi Baru</th>
              <th class="pb-3 text-center pr-2">Aksi</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-[#fafefa] text-sm text-[#374151]">
            <tr 
              v-for="user in props.allUsersList.filter(u => u.status === 'approved')" 
              :key="user.id"
              class="hover:bg-[#ebf9f8]/10 transition-colors"
            >
              <td class="py-4 pl-2 font-extrabold text-[#374151]">{{ user.nama || user.username }}</td>
              <td class="py-4 font-semibold text-[#8a8a8a] lowercase">@{{ user.username }}</td>
              <td class="py-4 font-semibold text-[#9ca3af] text-xs">{{ formatDate(user.created_at) }}</td>
              <td class="py-4 pl-4">
                <!-- Password reset input field -->
                <div class="relative w-full">
                  <input 
                    v-model="passwordInputs[user.id]"
                    type="text" 
                    placeholder="Sandi Baru (Kosong)"
                    class="w-full px-4 py-2 text-xs border border-[#70d5c9]/50 rounded-[12px] outline-none text-[#374151] font-medium bg-[#fafefa] focus:bg-white focus:ring-2 focus:ring-[#70d5c9]/25 transition-all duration-200 pr-10"
                  />
                  <span class="absolute right-3 top-1/2 -translate-y-1/2 text-xs opacity-50 select-none">🔒</span>
                </div>
              </td>
              <td class="py-4 text-center">
                <!-- Submit new password -->
                <button 
                  @click="onResetPasswordClick(user.id, user.username)"
                  class="px-4 py-2.5 bg-[#ff8c52] hover:bg-[#ff7936] text-white font-extrabold rounded-[12px] text-xs shadow-md shadow-[#ff8c52]/15 active:scale-95 hover:scale-102 transition-all cursor-pointer flex items-center justify-center gap-1 mx-auto min-w-[90px]"
                  :disabled="props.isPasswordSaving[user.id]"
                >
                  <span v-if="props.isPasswordSaving[user.id]">Proses...</span>
                  <span v-else class="flex items-center gap-1">🔑 Simpan</span>
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- TAB 2: PENDING USERS LIST -->
    <div v-if="props.activeTab === 'pending'" class="bg-white/80 backdrop-blur-md border border-white/80 rounded-[32px] p-6 shadow-sm flex flex-col gap-4">
      <!-- Empty Pending state -->
      <div v-if="props.allUsersList.filter(u => u.status === 'pending').length === 0" class="py-12 flex flex-col items-center justify-center text-center">
        <span class="text-5xl mb-3">🦉</span>
        <h4 class="text-lg font-black text-[#ff8c52] uppercase">Antrean Bersih!</h4>
        <p class="text-xs text-[#7a7a7a] font-bold max-w-[280px] mt-1">Tidak ada anak hebat yang sedang menunggu persetujuan.</p>
      </div>

      <!-- Table of all pending users -->
      <div v-else class="overflow-x-auto w-full">
        <table class="w-full text-left border-collapse min-w-[600px]">
          <thead>
            <tr class="border-b border-[#ebf9f8] text-[#8a8a8a] text-xs font-bold uppercase tracking-wider">
              <th class="pb-3 pl-2">Nama Lengkap</th>
              <th class="pb-3">Nama Pengguna</th>
              <th class="pb-3">Tanggal Mendaftar</th>
              <th class="pb-3 text-center pr-2">Tindakan</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-[#fafefa] text-sm text-[#374151]">
            <tr 
              v-for="user in props.allUsersList.filter(u => u.status === 'pending')" 
              :key="user.id"
              class="hover:bg-[#ebf9f8]/10 transition-colors"
            >
              <td class="py-4 pl-2 font-extrabold text-[#374151]">{{ user.nama || user.username }}</td>
              <td class="py-4 font-semibold text-[#8a8a8a] lowercase">@{{ user.username }}</td>
              <td class="py-4 font-semibold text-[#9ca3af] text-xs">{{ formatDate(user.created_at) }}</td>
              <td class="py-4">
                <div class="flex items-center justify-center gap-2.5">
                  <button 
                    @click="emit('reject', user.id, user.nama || user.username)"
                    class="px-4 py-2 border-2 border-[#ffa1b5] text-[#ff6b8b] hover:bg-[#fff5f6] font-extrabold rounded-[14px] text-xs active:scale-95 transition-all cursor-pointer flex items-center gap-1"
                  >
                    ❌ Tolak
                  </button>
                  <button 
                    @click="emit('approve', user.id, user.nama || user.username)"
                    class="px-4 py-2 bg-[#70d5c9] hover:bg-[#5dc1b9] text-white font-extrabold rounded-[14px] text-xs shadow-md shadow-[#70d5c9]/25 hover:shadow-lg active:scale-95 transition-all cursor-pointer flex items-center gap-1"
                  >
                    ✅ Setujui
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
