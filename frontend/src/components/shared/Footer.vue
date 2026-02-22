<script setup>
import { RouterLink } from 'vue-router'
const currentYear = new Date().getFullYear()
</script>

<template>
  <footer class="bg-slate-900 text-slate-300 py-12 border-t border-slate-800 mt-auto">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="grid grid-cols-1 md:grid-cols-4 gap-8">
        
        <div class="space-y-4">
          <h3 class="text-xl font-bold text-white tracking-tight">Abi<span class="text-blue-500">mantra.</span></h3>
          <p class="text-sm text-slate-400 leading-relaxed">
            Platform portofolio dan kumpulan proyek open-source. Dibangun dengan penuh semangat untuk berbagi pengetahuan dan karya inovatif.
          </p>
        </div>

        <div>
          <h4 class="text-white font-semibold mb-4">Quick Links</h4>
          <ul class="space-y-2 text-sm">
            <li><RouterLink to="/" class="hover:text-blue-400 transition-colors">Beranda</RouterLink></li>
            <li><RouterLink to="/blog" class="hover:text-blue-400 transition-colors">Artikel & Blog</RouterLink></li>
            <li><RouterLink to="/login" class="hover:text-blue-400 transition-colors">Login / Daftar</RouterLink></li>
          </ul>
        </div>

        <div>
          <h4 class="text-white font-semibold mb-4">Legal</h4>
          <ul class="space-y-2 text-sm">
            <li><RouterLink to="/privacy-policy" class="hover:text-blue-400 transition-colors">Privacy Policy</RouterLink></li>
            <li><RouterLink to="/terms-of-service" class="hover:text-blue-400 transition-colors">Terms of Service</RouterLink></li>
          </ul>
        </div>

        <div>
          <h4 class="text-white font-semibold mb-4">Contact</h4>
          <ul class="space-y-2 text-sm">
            <li class="flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-slate-400"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
              <a href="mailto:mantraabi68@gmail.com" class="hover:text-blue-400 transition-colors">mantraabi68@gmail.com</a>
            </li>
            
            <li class="flex items-center gap-2 mt-3">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-slate-400"><path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/></svg>
              <a href="https://t.me/mantraabi" target="_blank" class="hover:text-blue-400 transition-colors">Telegram</a>
            </li>
          </ul>
        </div>

      </div>

      <div class="border-t border-slate-800 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center text-sm text-slate-500">
        <p>&copy; {{ currentYear }} MyPorto. All rights reserved.</p>
        <p class="mt-2 md:mt-0">Built with Vue.js & Node.js</p>
      </div>
    </div>
  </footer>
</template>