<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'vue-sonner'

import { GoogleLogin } from 'vue3-google-login'

const router = useRouter()
const isLoginMode = ref(true)
const backendURL = import.meta.env.VITE_BACKEND_URL

// Variabel Form
const name = ref('')
const email = ref('')
const password = ref('')

// ==========================================
// STATE BARU UNTUK OTP
// ==========================================
const showOTPForm = ref(false)
const otpCode = ref('')

// ==========================================
// FUNGSI SUBMIT MANUAL (LOGIN / REGISTER)
// ==========================================
const handleSubmit = async () => {
  try {
    if (isLoginMode.value) {
      // PROSES LOGIN
      const res = await axios.post(`${backendURL}/api/auth/login`, {
        email: email.value,
        password: password.value
      })
      
      localStorage.setItem('token', res.data.token)
      localStorage.setItem('user', JSON.stringify(res.data.user))
      
      toast.success('Login berhasil!')
      router.push('/')
      
    } else {
      // PROSES REGISTER
      const res = await axios.post(`${backendURL}/api/auth/register`, {
        name: name.value,
        email: email.value,
        password: password.value
      })
      
      toast.success(res.data.message || 'Cek email Anda untuk kode OTP.')
      // Munculkan layar OTP!
      showOTPForm.value = true 
    }
  } catch (error) {
    const errorMsg = error.response?.data?.message || 'Terjadi kesalahan.'
    
    // TANGKAP ERROR JIKA BELUM VERIFIKASI SAAT LOGIN
    if (error.response?.data?.needsVerification) {
      toast.error('Akun belum diverifikasi. Silakan masukkan OTP.')
      showOTPForm.value = true // Pindahkan ke layar OTP
    } else {
      toast.error(errorMsg)
    }
  }
}

// ==========================================
// FUNGSI BARU: VERIFIKASI OTP
// ==========================================
const handleVerifyOTP = async () => {
  try {
    const res = await axios.post(`${backendURL}/api/auth/verify-otp`, {
      email: email.value, // Kita ambil dari input email yang sudah diisi user sebelumnya
      otp: otpCode.value
    })
    
    toast.success('Verifikasi sukses! Silakan login.')
    
    // Kembalikan ke layar login, kosongkan password dan OTP
    showOTPForm.value = false
    isLoginMode.value = true
    password.value = ''
    otpCode.value = ''
    
  } catch (error) {
    toast.error(error.response?.data?.message || 'Kode OTP salah atau kadaluarsa.')
  }
}
// Fungsi untuk menangani login dengan Google
const handleGoogleLogin = async (response) => {
  // 1. KITA CETAK KE CONSOLE BROWSER UNTUK MELACAKNYA
  console.log("1. Data utuh dari Google:", response); 
  console.log("2. Isi Token (Credential):", response.credential);

  // 2. Jika token benar-benar kosong dari Google, hentikan proses
  if (!response.credential) {
    toast.error('Gagal mendapatkan token dari Google.');
    return;
  }

  try {
    // 3. Pastikan kita mengirimnya dalam bentuk JSON yang benar
    const res = await axios.post(`${backendURL}/api/auth/google`, {
      credential: response.credential
    }, {
      headers: { 'Content-Type': 'application/json' } // Paksa format JSON
    });
    
    localStorage.setItem('token', res.data.token)
    localStorage.setItem('user', JSON.stringify(res.data.user))
    
    toast.success(res.data.message || 'Login Google berhasil!')
    router.push('/')
  } catch (error) {
    console.error("Error dari Backend:", error.response?.data || error);
    toast.error(error.response?.data?.message || 'Gagal login dengan akun Google.')
  }
}

</script>

<template>
  <div class="flex items-center justify-center min-h-[80vh]">
    <Card class="overflow-hidden p-0 w-full max-w-4xl shadow-lg">
      <CardContent class="grid p-0 md:grid-cols-2">
        
       <form v-if="!showOTPForm" @submit.prevent="handleSubmit" class="p-8 md:p-12 flex flex-col justify-center gap-6">
          
          <div class="flex flex-col items-center gap-2 text-center mb-4">
            <h1 class="text-3xl font-bold">
              {{ isLoginMode ? 'Welcome back' : 'Create an Account' }}
            </h1>
            <p class="text-slate-500">
              {{ isLoginMode ? 'Login to download free projects' : 'Sign up to get full access' }}
            </p>
          </div>

          <div v-if="!isLoginMode" class="grid gap-2">
            <Label for="name">Full Name</Label>
            <Input id="name" type="text" v-model="name" placeholder="John Doe" required />
          </div>

          <div class="grid gap-2">
            <Label for="email">Email</Label>
            <Input id="email" type="email" v-model="email" placeholder="m@example.com" required />
          </div>

          <div class="grid gap-2">
            <div class="flex items-center justify-between">
              <Label for="password">Password</Label>
            </div>
            <Input id="password" type="password" v-model="password" required />
          </div>

          <Button type="submit" class="w-full mt-2">
            {{ isLoginMode ? 'Login' : 'Sign Up' }}
          </Button>

          <div class="relative my-4">
            <div class="absolute inset-0 flex items-center">
              <span class="w-full border-t"></span>
            </div>
            <div class="relative flex justify-center text-xs uppercase">
              <span class="bg-white px-2 text-slate-500">Atau lanjutkan dengan</span>
            </div>
          </div>
          <div class="flex justify-center w-full mt-2">
            <GoogleLogin :callback="handleGoogleLogin" prompt />
          </div>

          <p class="text-center text-sm text-slate-600 mt-4">
            {{ isLoginMode ? "Don't have an account?" : "Already have an account?" }}
            <button type="button" @click="isLoginMode = !isLoginMode" class="text-blue-600 font-semibold hover:underline">
              {{ isLoginMode ? 'Sign up' : 'Login' }}
            </button>
          </p>
        </form>

        <form v-else @submit.prevent="handleVerifyOTP" class="p-8 md:p-12 flex flex-col justify-center gap-6">
          <div class="flex flex-col items-center gap-2 text-center mb-4">
            <div class="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mb-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21.2 8.4c.5.38.8.97.8 1.6v10a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V10a2 2 0 0 1 .8-1.6l8-6a2 2 0 0 1 2.4 0l8 6Z"/><path d="m22 10-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 10"/></svg>
            </div>
            <h1 class="text-2xl font-bold">Cek Email Anda</h1>
            <p class="text-slate-500 text-sm">
              Kami telah mengirimkan 6 digit kode OTP ke <br>
              <span class="font-semibold text-slate-800">{{ email }}</span>
            </p>
          </div>

          <div class="grid gap-2 text-center">
            <Label for="otp">Kode Verifikasi (OTP)</Label>
            <Input 
              id="otp" 
              type="text" 
              v-model="otpCode" 
              placeholder="Masukkan 6 digit angka" 
              class="text-center text-2xl tracking-[0.5em] font-semibold py-6"
              maxlength="6"
              required 
            />
          </div>

          <Button type="submit" class="w-full mt-4">
            Verifikasi Akun
          </Button>

          <button type="button" @click="showOTPForm = false" class="text-sm text-slate-500 hover:text-slate-800 mt-2">
            &larr; Kembali ke halaman login
          </button>
        </form>

        <div class="bg-slate-100 relative hidden md:block">
          <img
            src="https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=800&q=80"
            alt="Workspace"
            class="absolute inset-0 h-full w-full object-cover"
          >
        </div>

      </CardContent>
    </Card>
  </div>
</template>