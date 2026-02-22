<script setup>
import { ref, onMounted, computed } from 'vue'
import { RouterLink } from 'vue-router'
import axios from 'axios'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

const blogs = ref([])
const isLoading = ref(true)
const backendURL = import.meta.env.VITE_BACKEND_URL

const selectedCategory = ref('Semua')

const fetchBlogs = async () => {
  try {
    const response = await axios.get(`${backendURL}/api/blogs`)
    blogs.value = response.data
  } catch (error) {
    console.error("Gagal mengambil data blog:", error)
  } finally {
    isLoading.value = false
  }
}

const uniqueCategories = computed(() => {
  const categories = blogs.value.map(b => b.category || 'Uncategorized')
  return ['Semua', ...new Set(categories)]
})

const filteredBlogs = computed(() => {
  if (selectedCategory.value === 'Semua') return blogs.value
  return blogs.value.filter(b => (b.category || 'Uncategorized') === selectedCategory.value)
})

onMounted(() => {
  fetchBlogs()
})
</script>

<template>
  <div class="max-w-5xl mx-auto">
    <div class="text-center py-12 mb-8">
      <h1 class="text-4xl font-extrabold text-slate-900 mb-4 tracking-tight">
        Catatan & <span class="text-blue-600">Tulisan</span>
      </h1>
      <p class="text-lg text-slate-600">Berbagi pengalaman, tutorial, dan cerita seputar pengembangan teknologi.</p>
    </div>

    <div v-if="isLoading" class="flex justify-center py-20">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
    </div>

    <div v-else-if="blogs.length === 0" class="text-center py-20 text-slate-500">
      <p class="text-xl">Belum ada artikel yang diterbitkan.</p>
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

      <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Card v-for="blog in filteredBlogs" :key="blog.id" class="flex flex-col h-full overflow-hidden hover:shadow-md transition-shadow relative">
          
          <div class="absolute top-4 left-4 z-10">
            <Badge class="bg-slate-900 text-white shadow-sm">{{ blog.category || 'Uncategorized' }}</Badge>
          </div>

          <RouterLink :to="`/blog/${blog.slug}`" class="block">
            <div class="h-48 bg-slate-100 relative overflow-hidden group">
              <img 
                v-if="blog.cover_image" 
                :src="`${backendURL}${blog.cover_image}`" 
                :alt="blog.title"
                class="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
              />
            </div>
          </RouterLink>

          <CardHeader>
            <div class="text-xs text-slate-500 mb-2">
              {{ new Date(blog.created_at).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' }) }} • Oleh {{ blog.author_name }}
            </div>
            <RouterLink :to="`/blog/${blog.slug}`" class="hover:underline">
              <CardTitle class="text-xl leading-tight">{{ blog.title }}</CardTitle>
            </RouterLink>
          </CardHeader>
        </Card>
      </div>
      
      <div v-if="filteredBlogs.length === 0" class="text-center py-12 text-slate-500">
        Belum ada tulisan di kategori ini.
      </div>
    </div>
  </div>
</template>