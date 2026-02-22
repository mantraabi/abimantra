<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import axios from 'axios'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

// PENTING: Import RichEditor yang baru saja kita buat
import RichEditor from '@/components/shared/RichEditor.vue'

const route = useRoute()
const router = useRouter()
const backendURL = import.meta.env.VITE_BACKEND_URL

const blogId = ref(null)
const title = ref('')
const slug = ref('')
const content = ref('')
const oldCoverImage = ref('')
const coverImageFile = ref(null)
const category = ref('')

const isLoading = ref(true)
const isSaving = ref(false)

const fetchBlogData = async () => {
  try {
    const response = await axios.get(`${backendURL}/api/blogs/${route.params.slug}`)
    const data = response.data
    
    blogId.value = data.id
    title.value = data.title
    slug.value = data.slug
    content.value = data.content // Ini akan otomatis mengisi RichEditor!
    oldCoverImage.value = data.cover_image
    category.value = data.category || ''
  } catch (error) {
    alert("Artikel tidak ditemukan!")
    router.push('/admin/blogs')
  } finally {
    isLoading.value = false
  }
}

const generateSlug = () => {
  slug.value = title.value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '')
}

const handleImageChange = (e) => {
  coverImageFile.value = e.target.files[0]
}

const handleSubmit = async () => {
  isSaving.value = true
  const token = localStorage.getItem('token')
  const formData = new FormData()
  
  formData.append('title', title.value)
  formData.append('slug', slug.value)
  formData.append('content', content.value)
  formData.append('is_published', 'true')
  
  if (coverImageFile.value) {
    formData.append('cover_image', coverImageFile.value)
  }
  formData.append('category', category.value)

  try {
    await axios.put(`${backendURL}/api/blogs/${blogId.value}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        Authorization: `Bearer ${token}`
      }
    })
    alert('Artikel berhasil diperbarui!')
    router.push('/admin/blogs')
  } catch (error) {
    console.error(error)
    alert('Gagal memperbarui artikel.')
  } finally {
    isSaving.value = false
  }
}

onMounted(() => fetchBlogData())
</script>

<template>
  <div class="max-w-4xl mx-auto py-8">
    <div v-if="isLoading" class="text-center py-20 text-slate-500">Memuat data artikel...</div>
    
    <Card v-else>
      <CardHeader>
        <CardTitle class="text-2xl">Edit Artikel</CardTitle>
      </CardHeader>
      <CardContent>
        <form @submit.prevent="handleSubmit" class="space-y-6">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div class="space-y-2">
              <Label for="title">Judul Artikel</Label>
              <Input id="title" v-model="title" @input="generateSlug" required />
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

          <div class="space-y-4 p-4 border rounded-lg bg-slate-50">
            <p class="text-sm text-slate-500">Biarkan kosong jika tidak ingin mengganti gambar cover lama.</p>
            <div class="space-y-2">
              <Label for="cover_image">Ganti Gambar Cover (.jpg / .png)</Label>
              <div v-if="oldCoverImage" class="mb-3">
                <img :src="`${backendURL}${oldCoverImage}`" class="h-32 w-auto rounded border object-cover" alt="Old Cover" />
              </div>
              <Input id="cover_image" type="file" accept="image/*" @change="handleImageChange" class="bg-white" />
            </div>
          </div>

          <div class="flex gap-4">
            <Button type="button" variant="outline" class="w-full" @click="router.push('/admin/blogs')">Batal</Button>
            <Button type="submit" class="w-full bg-blue-600" :disabled="isSaving">
              {{ isSaving ? 'Menyimpan...' : 'Simpan Perubahan' }}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  </div>
</template>