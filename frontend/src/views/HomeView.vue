<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge' // <-- Import Badge

const projects = ref([])
const isLoading = ref(true)

const backendURL = import.meta.env.VITE_BACKEND_URL
const router = useRouter()

// State untuk filter kategori
const selectedCategory = ref('Semua')

const fetchProjects = async () => {
  try {
    const response = await axios.get(`${backendURL}/api/projects`)
    projects.value = response.data
  } catch (error) {
    console.error("Gagal mengambil data proyek:", error)
  } finally {
    isLoading.value = false
  }
}

// Mengambil daftar kategori unik dari data proyek yang ada
const uniqueCategories = computed(() => {
  const categories = projects.value.map(p => p.category || 'Uncategorized')
  return ['Semua', ...new Set(categories)]
})

// Menyaring proyek berdasarkan kategori yang diklik
const filteredProjects = computed(() => {
  if (selectedCategory.value === 'Semua') {
    return projects.value
  }
  return projects.value.filter(p => (p.category || 'Uncategorized') === selectedCategory.value)
})

onMounted(() => {
  fetchProjects()
})
</script>

<template>
  <div>
    <div class="text-center py-16 mb-8 bg-white rounded-2xl shadow-sm border border-slate-100">
      <h1 class="text-4xl md:text-5xl font-extrabold text-slate-900 mb-4 tracking-tight">
        Eksplorasi Karya & <span class="text-blue-600">Portofolio</span>
      </h1>
      <p class="text-lg text-slate-600 max-w-2xl mx-auto px-4">
        Kumpulan proyek open-source dan aplikasi yang pernah saya kerjakan. 
        Jelajahi, pelajari, dan unduh untuk inspirasi atau referensi dalam pengembanganmu!
      </p>
    </div>

    <div v-if="isLoading" class="flex justify-center py-20">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
    </div>

    <div v-else-if="projects.length === 0" class="text-center py-20 text-slate-500">
      <p class="text-xl">Belum ada proyek yang dipublikasikan.</p>
    </div>

    <div v-else>
      <div class="flex flex-wrap justify-center gap-2 mb-10">
        <Button 
          v-for="cat in uniqueCategories" 
          :key="cat"
          @click="selectedCategory = cat"
          :variant="selectedCategory === cat ? 'default' : 'outline'"
          class="rounded-full px-6"
        >
          {{ cat }}
        </Button>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <Card v-for="project in filteredProjects" :key="project.id" class="flex flex-col h-full overflow-hidden hover:shadow-md transition-shadow relative">
          
          <div class="absolute top-4 right-4 z-10">
            <Badge class="bg-blue-600 hover:bg-blue-700 text-white shadow-md">{{ project.category || 'Uncategorized' }}</Badge>
          </div>

          <div class="h-48 bg-slate-100 relative overflow-hidden group">
            <img 
              v-if="project.thumbnail_url" 
              :src="`${backendURL}${project.thumbnail_url}`" 
              :alt="project.title"
              class="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
            />
          </div>

          <CardHeader>
            <CardTitle class="text-xl">{{ project.title }}</CardTitle>
            <CardDescription class="line-clamp-2 mt-2">
              {{ project.description }}
            </CardDescription>
          </CardHeader>
          
          <CardContent class="flex-grow"></CardContent>

          <CardFooter class="flex justify-between gap-4 pt-4 border-t border-slate-50">
            <RouterLink :to="`/project/${project.slug}`" class="w-full">
              <Button class="w-full">Lihat Detail & Download</Button>
            </RouterLink>
          </CardFooter>
        </Card>
      </div>
      
      <div v-if="filteredProjects.length === 0" class="text-center py-12 text-slate-500">
        Kategori ini belum memiliki proyek.
      </div>
    </div>
  </div>
</template>