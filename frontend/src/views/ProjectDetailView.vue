<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import axios from 'axios'
import { Button } from '@/components/ui/button'
import { createHead } from '@vueuse/head'

const route = useRoute()
const router = useRouter()
const backendURL = import.meta.env.VITE_BACKEND_URL

const project = ref(null)
const isLoading = ref(true)
const downloadingId = ref(null)

useHead({
  title: () => project.value ? `${project.value.title} | Portofolio` : 'Memuat Proyek...',
  meta: [
    {
      name: 'description',
      content: () => project.value ? project.value.description.substring(0, 150) + '...' : 'Detail proyek portofolio.'
    },
    // ==========================================
    // OPEN GRAPH (Untuk Share WhatsApp / LinkedIn / Facebook)
    // ==========================================
    { property: 'og:title', content: () => project.value?.title },
    { property: 'og:description', content: () => project.value ? project.value.description.substring(0, 150) : '' },
    { property: 'og:image', content: () => project.value ? `${backendURL}${project.value.thumbnail_url}` : '' },
    { property: 'og:type', content: 'website' }
  ]
})

// Ambil data proyek berdasarkan slug dari URL & Set SEO
const fetchProjectDetail = async () => {
  try {
    const response = await axios.get(`${backendURL}/api/projects/${route.params.slug}`)
    project.value = response.data

    // ==========================================
    // LOGIKA SEO
    // ==========================================
    document.title = `${project.value.title} | Abimantra.`

    let metaDescription = document.querySelector('meta[name="description"]')
    if (!metaDescription) {
      metaDescription = document.createElement('meta')
      metaDescription.name = 'description'
      document.head.appendChild(metaDescription)
    }
    
    // Pastikan deskripsi ada sebelum dipotong
    if (project.value.description) {
      metaDescription.content = project.value.description.substring(0, 150) + '...'
    }
    // ==========================================

  } catch (error) {
    console.error("Gagal mengambil detail proyek:", error)
    alert("Proyek tidak ditemukan!")
    router.push('/')
  } finally {
    isLoading.value = false
  }
}

// Logika Download
const handleDownload = async () => {
  const token = localStorage.getItem('token')
  
  if (!token) {
    alert("Silakan login terlebih dahulu untuk mengunduh proyek ini.")
    router.push('/login')
    return
  }

  try {
    downloadingId.value = project.value.id
    
    const response = await axios.get(`${backendURL}/api/projects/${project.value.id}/download`, {
      headers: { Authorization: `Bearer ${token}` },
      responseType: 'blob' 
    })

    const url = window.URL.createObjectURL(new Blob([response.data]))
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', `${project.value.title}.zip`) 
    document.body.appendChild(link)
    link.click()
    link.remove()
    window.URL.revokeObjectURL(url)

  } catch (error) {
    console.error("Gagal mengunduh:", error)
    if (error.response?.status === 401) {
      alert("Sesi login berakhir, silakan login ulang.")
      localStorage.removeItem('token')
      router.push('/login')
    } else {
      alert("Gagal mengunduh file atau file tidak ditemukan di server.")
    }
  } finally {
    downloadingId.value = null
  }
}

onMounted(() => {
  fetchProjectDetail()
})
</script>

<template>
  <div class="max-w-4xl mx-auto py-8 px-4">
    <div v-if="isLoading" class="flex justify-center py-20">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
    </div>

    <div v-else-if="project">
      
      <Button variant="ghost" class="mb-6 pl-0 hover:bg-transparent text-slate-500 hover:text-slate-900" @click="router.push('/')">
        &larr; Kembali ke Portofolio
      </Button>

      <div class="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden mb-8">
        <div class="h-64 sm:h-80 md:h-96 w-full bg-slate-100 relative">
          <img 
            v-if="project.thumbnail_url" 
            :src="`${backendURL}${project.thumbnail_url}`" 
            :alt="project.title"
            class="object-cover w-full h-full"
          />
        </div>
        
        <div class="p-8">
          <h1 class="text-3xl md:text-4xl font-bold text-slate-900 mb-4">{{ project.title }}</h1>
          
          <div class="prose prose-slate max-w-none mb-8 text-slate-700 whitespace-pre-line">
            {{ project.description }}
          </div>

          <div class="flex flex-wrap gap-4 pt-6 border-t border-slate-100">
            <Button 
              size="lg"
              @click="handleDownload" 
              :disabled="downloadingId === project.id"
              class="w-full sm:w-auto"
            >
              {{ downloadingId === project.id ? 'Mengunduh Source Code...' : 'Download Source Code' }}
            </Button>
            
            <a v-if="project.demo_url" :href="project.demo_url" target="_blank" class="w-full sm:w-auto">
              <Button variant="outline" size="lg" class="w-full">
                Lihat Live Demo
              </Button>
            </a>
          </div>
        </div>
      </div>

    </div>
  </div>
</template>