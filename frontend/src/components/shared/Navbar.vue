<script setup>
import { ref, onMounted, watch } from 'vue'
import { RouterLink, useRouter, useRoute } from 'vue-router'
import { Button } from '@/components/ui/button'
import { toast } from 'vue-sonner'

const router = useRouter()
const route = useRoute() // Untuk memantau perpindahan halaman

const isLoggedIn = ref(false)
const userName = ref('')

// Fungsi untuk mengecek status login dari LocalStorage
const checkAuthStatus = () => {
  const token = localStorage.getItem('token')
  const userData = localStorage.getItem('user')

  if (token && userData) {
    isLoggedIn.value = true
    userName.value = JSON.parse(userData).name
  } else {
    isLoggedIn.value = false
    userName.value = ''
  }
}

// Jalankan saat Navbar pertama kali dirender
onMounted(() => {
  checkAuthStatus()
})

// Pantau setiap kali URL berubah (misal: dari /login pindah ke /), cek ulang statusnya
watch(() => route.path, () => {
  checkAuthStatus()
})

// Fungsi untuk Logout
const handleLogout = () => {
  localStorage.removeItem('token')
  localStorage.removeItem('user')
  isLoggedIn.value = false

  toast.success('Anda telah berhasil logout.')

  router.push('/login') // Arahkan kembali ke halaman login
}
</script>

<template>
  <nav class="border-b bg-white shadow-sm sticky top-0 z-50">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex justify-between h-16 items-center">
        <div class="flex-shrink-0 flex items-center">
          <RouterLink to="/" class="text-2xl font-extrabold text-slate-900 tracking-tight">
            Abi<span class="text-blue-600">mantra.</span>
          </RouterLink>
        </div>

        <div class="hidden md:flex space-x-8">
          <RouterLink to="/" class="text-slate-600 hover:text-blue-600 transition-colors px-3 py-2 rounded-md font-medium">Home</RouterLink>
          <RouterLink to="/blog" class="text-slate-600 hover:text-blue-600 transition-colors px-3 py-2 rounded-md font-medium">Blog</RouterLink>
        </div>

        <div class="flex items-center space-x-4">
          <template v-if="!isLoggedIn">
            <RouterLink to="/login">
              <Button variant="default">Login</Button>
            </RouterLink>
          </template>

          <template v-else>
            <span class="text-sm font-medium text-slate-600 hidden sm:block">
              Hai, <span class="text-slate-900 font-bold">{{ userName }}</span>!
            </span>
            <Button variant="outline" class="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200" @click="handleLogout">
              Logout
            </Button>
          </template>
        </div>
      </div>
    </div>
  </nav>
</template>