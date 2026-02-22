<script setup>
import { RouterLink, RouterView, useRouter } from 'vue-router'
import { Button } from '@/components/ui/button'
import { toast } from 'vue-sonner'

const router = useRouter()

const handleLogout = () => {
  localStorage.removeItem('token')
  localStorage.removeItem('user')
  toast.info('Sesi Admin telah diakhiri.')
  router.push('/login')
}
</script>

<template>
  <div class="flex min-h-screen bg-slate-50">
    
    <aside class="w-64 bg-slate-900 text-white flex flex-col">
      <div class="h-16 flex items-center px-6 border-b border-slate-800">
        <span class="text-xl font-bold tracking-tight">Admin<span class="text-blue-500">Panel</span></span>
      </div>
      
      <nav class="flex-1 py-6 px-3 space-y-1">
        <RouterLink to="/admin/projects" class="flex items-center px-3 py-2.5 bg-slate-800 rounded-md text-slate-100 font-medium">
          📁 Kelola Proyek
        </RouterLink>
        <RouterLink to="/admin/blogs" class="flex items-center px-3 py-2.5 hover:bg-slate-800 rounded-md text-slate-300 hover:text-white transition-colors font-medium">
          📝 Kelola Blog
        </RouterLink>
        <a href="/" target="_blank" class="flex items-center px-3 py-2.5 hover:bg-slate-800 rounded-md text-slate-300 hover:text-white transition-colors font-medium">
          🌐 Lihat Website
        </a>
      </nav>

      <div class="p-4 border-t border-slate-800">
        <Button variant="destructive" class="w-full bg-red-600 hover:bg-red-700" @click="handleLogout">
          Logout
        </Button>
      </div>
    </aside>

    <main class="flex-1 flex flex-col min-w-0 overflow-hidden">
      <header class="h-16 bg-white border-b flex items-center justify-between px-8">
        <h2 class="text-lg font-semibold text-slate-800">Dashboard Manajemen</h2>
      </header>
      
      <div class="flex-1 overflow-y-auto p-8">
        <RouterView />
      </div>
    </main>

  </div>
</template>