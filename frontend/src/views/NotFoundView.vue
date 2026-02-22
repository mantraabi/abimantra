<script setup>
import { RouterLink } from 'vue-router'
import { Button } from '@/components/ui/button'
</script>

<template>
  <div class="min-h-[70vh] flex flex-col items-center justify-center text-center px-4">
    <h1 class="text-9xl font-extrabold text-slate-200 tracking-widest">404</h1>
    <div class="bg-blue-600 px-2 text-sm rounded rotate-12 absolute text-white shadow-sm">
      Halaman Tidak Ditemukan
    </div>
    
    <div class="mt-8 max-w-md">
      <h2 class="text-2xl font-bold text-slate-900 mb-4">Ups! Sepertinya Anda tersesat.</h2>
      <p class="text-slate-600 mb-8">
        Halaman yang Anda cari mungkin telah dihapus, namanya diubah, atau memang tidak pernah ada.
      </p>
      
      <RouterLink to="/">
        <Button size="lg" class="w-full sm:w-auto">
          &larr; Bawa Saya Pulang ke Beranda
        </Button>
      </RouterLink>
    </div>
  </div>
</template>