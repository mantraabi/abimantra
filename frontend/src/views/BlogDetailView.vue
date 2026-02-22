<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import axios from 'axios'
import { Button } from '@/components/ui/button'

const route = useRoute()
const router = useRouter()
const backendURL = import.meta.env.VITE_BACKEND_URL

const blog = ref(null)
const isLoading = ref(true)

const fetchBlogDetail = async () => {
  try {
    const response = await axios.get(`${backendURL}/api/blogs/${route.params.slug}`)
    blog.value = response.data

    // Setup SEO
    document.title = `${blog.value.title} | MyPorto Blog.`
    let metaDescription = document.querySelector('meta[name="description"]')
    if (!metaDescription) {
      metaDescription = document.createElement('meta')
      metaDescription.name = 'description'
      document.head.appendChild(metaDescription)
    }
    // Ambil sebagian konten teks (hapus tag HTML untuk meta description)
    if (blog.value.content) {
      const plainText = blog.value.content.replace(/<[^>]*>?/gm, '')
      metaDescription.content = plainText.substring(0, 150) + '...'
    }

  } catch (error) {
    alert("Artikel tidak ditemukan!")
    router.push('/blog')
  } finally {
    isLoading.value = false
  }
}

onMounted(() => {
  fetchBlogDetail()
})
</script>

<template>
  <div class="max-w-3xl mx-auto py-8 px-4">
    <div v-if="isLoading" class="flex justify-center py-20">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
    </div>

    <article v-else-if="blog" class="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
      
      <div v-if="blog.cover_image" class="w-full h-64 md:h-[400px] bg-slate-100 relative">
        <img :src="`${backendURL}${blog.cover_image}`" :alt="blog.title" class="object-cover w-full h-full" />
      </div>

      <div class="p-8 md:p-12">
        <Button variant="ghost" class="mb-6 pl-0 hover:bg-transparent text-slate-500" @click="router.push('/blog')">
          &larr; Kembali ke Daftar Blog
        </Button>

        <h1 class="text-3xl md:text-5xl font-extrabold text-slate-900 leading-tight mb-4">
          {{ blog.title }}
        </h1>
        
        <div class="flex items-center text-slate-500 mb-10 pb-10 border-b border-slate-100">
          <div class="text-sm font-medium uppercase tracking-wider">
            Ditulis oleh <span class="text-slate-900">{{ blog.author_name }}</span> pada {{ new Date(blog.created_at).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' }) }}
          </div>
        </div>

        <div 
          class="prose prose-slate md:prose-lg max-w-none text-slate-700 leading-relaxed whitespace-pre-wrap" 
          v-html="blog.content"
        ></div>

      </div>
    </article>
  </div>
</template>