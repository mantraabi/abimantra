<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import RichEditor from '@/components/shared/RichEditor.vue'
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

const router = useRouter()
const backendURL = import.meta.env.VITE_BACKEND_URL

const title = ref('')
const slug = ref('')
const content = ref('')
const category = ref('')
const coverImage = ref(null)

const isLoading = ref(false)

const generateSlug = () => {
  slug.value = title.value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '')
}

const handleImageChange = (e) => {
  coverImage.value = e.target.files[0]
}

const handleSubmit = async () => {
  isLoading.value = true
  const token = localStorage.getItem('token')
  
  const formData = new FormData()
  formData.append('title', title.value)
  formData.append('slug', slug.value)
  formData.append('content', content.value)
  formData.append('is_published', 'true')
    formData.append('category', category.value)
  
  if (coverImage.value) {
    formData.append('cover_image', coverImage.value)
  }

  try {
    await axios.post(`${backendURL}/api/blogs`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        Authorization: `Bearer ${token}`
      }
    })
    alert('Artikel berhasil dipublikasikan!')
    router.push('/admin/blogs')
  } catch (error) {
    console.error(error)
    alert('Gagal menyimpan artikel.')
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <div class="max-w-4xl mx-auto py-8">
    <Card>
      <CardHeader>
        <CardTitle class="text-2xl">Tulis Artikel Baru</CardTitle>
      </CardHeader>
      <CardContent>
        <form @submit.prevent="handleSubmit" class="space-y-6">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div class="space-y-2">
              <Label for="title">Judul Artikel</Label>
              <Input id="title" v-model="title" @input="generateSlug" placeholder="Contoh: Belajar Vue 3 dari Nol" required />
            </div>
            <div class="space-y-2">
              <Label for="slug">Slug (URL)</Label>
              <Input id="slug" v-model="slug" required />
            </div>

            <div class="space-y-2">
              <Label>Kategori Artikel</Label>
              <Select v-model="category" required>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih Kategori..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectItem value="Tutorial">Tutorial</SelectItem>
                    <SelectItem value="Tips & Trik">Tips & Trik</SelectItem>
                    <SelectItem value="Berita Teknologi">Berita Teknologi</SelectItem>
                    <SelectItem value="Opini">Opini</SelectItem>
                    <SelectItem value="Lainnya">Lainnya</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
            
          </div>

          <div class="space-y-2">
            <Label for="content">Isi Artikel</Label>
            <RichEditor v-model="content" />
          </div>

          <div class="space-y-2 p-4 border rounded-lg bg-slate-50">
            <Label for="cover_image">Gambar Cover (.jpg / .png)</Label>
            <Input id="cover_image" type="file" accept="image/*" @change="handleImageChange" class="bg-white" />
          </div>

          <Button type="submit" class="w-full" :disabled="isLoading">
            {{ isLoading ? 'Menyimpan...' : 'Publikasikan Artikel' }}
          </Button>
        </form>
      </CardContent>
    </Card>
  </div>
</template>