<script setup>
import { computed } from 'vue'
import { useRoute, RouterView } from 'vue-router'
import Navbar from '@/components/shared/Navbar.vue'
import Footer from '@/components/shared/Footer.vue'
import { Toaster } from '@/components/ui/sonner'
import 'vue-sonner/style.css'

const route = useRoute()

// Bernilai false jika kita sedang berada di halaman admin
const isPublicPage = computed(() => !route.path.startsWith('/admin'))
</script>

<template>
  <div class="min-h-screen bg-slate-50">
    <Navbar v-if="isPublicPage" />
    
    <main :class="isPublicPage ? 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8' : ''">
      <RouterView />
    </main>

    <Footer />
    <Toaster position="top-center" rich-colors />
  </div>
</template>
