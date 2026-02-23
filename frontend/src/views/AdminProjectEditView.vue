<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import axios from 'axios'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'


const route = useRoute()
const router = useRouter()
const backendURL = import.meta.env.VITE_BACKEND_URL

// State data proyek
const projectId = ref(null) // ID rahasia untuk keperluan update ke backend
const title = ref('')
const slug = ref('')
const description = ref('')
const demoUrl = ref('')
const oldThumbnail = ref('')
const category = ref('')
const is_published = ref(false)

// State file baru (jika ingin diganti)
const thumbnailFile = ref(null)
const projectFile = ref(null)

const isLoading = ref(true)
const isSaving = ref(false)

// Ambil data proyek lama berdasarkan slug di URL
const fetchProjectData = async () => {
  try {
    const response = await axios.get(`${backendURL}/api/projects/${route.params.slug}`)
    const data = response.data
    
    // Isi form dengan data lama
    projectId.value = data.id
    title.value = data.title
    slug.value = data.slug
    description.value = data.description
    demoUrl.value = data.demo_url || ''
    oldThumbnail.value = data.thumbnail_url
    category.value = data.category || ''
    
  } catch (error) {
    alert("Proyek tidak ditemukan!")
    router.push('/admin/projects')
  } finally {
    isLoading.value = false
  }
}

const handleThumbnailChange = (e) => thumbnailFile.value = e.target.files[0]
const handleProjectChange = (e) => projectFile.value = e.target.files[0]

// Buat slug dinamis jika judul diubah
const generateSlug = () => {
  slug.value = title.value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '')
}

// Proses Update (Edit)
const handleSubmit = async () => {
  isSaving.value = true
  const token = localStorage.getItem('token')
  const formData = new FormData()
  
  formData.append('title', title.value)
  formData.append('slug', slug.value)
  formData.append('description', description.value)
  formData.append('demo_url', demoUrl.value)
  formData.append('is_published', is_published.value)
    formData.append('category', category.value)
  
  // Hanya tambahkan file ke FormData JIKA admin mengupload file baru
  if (thumbnailFile.value) formData.append('thumbnail', thumbnailFile.value)
  if (projectFile.value) formData.append('project_file', projectFile.value)

  try {
    // Gunakan metode PUT ke endpoint edit menggunakan ID proyek
    await axios.put(`${backendURL}/api/projects/${projectId.value}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        Authorization: `Bearer ${token}`
      }
    })
    alert('Proyek berhasil diperbarui!')
    router.push('/admin/projects')
  } catch (error) {
    console.error(error)
    alert('Gagal memperbarui proyek.')
  } finally {
    isSaving.value = false
  }
}

onMounted(() => fetchProjectData())
</script>

<template>
  <div class="max-w-3xl mx-auto py-8">
    <div v-if="isLoading" class="text-center py-20 text-slate-500">Memuat data proyek...</div>
    
    <Card v-else>
      <CardHeader>
        <CardTitle class="text-2xl">Edit Proyek</CardTitle>
      </CardHeader>
      <CardContent>
        <form @submit.prevent="handleSubmit" class="space-y-6">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div class="space-y-2">
              <Label for="title">Judul Proyek</Label>
              <Input id="title" v-model="title" @input="generateSlug" required />
            </div>
            <div class="space-y-2">
              <Label for="slug">Slug (URL SEO)</Label>
              <Input id="slug" v-model="slug" required />
            </div>
            <div class="space-y-2">
              <Label>Kategori Proyek</Label>
              <Select v-model="category" required>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih Kategori..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectItem value="Web App">Web App</SelectItem>
                    <SelectItem value="Mobile App">Mobile App</SelectItem>
                    <SelectItem value="UI/UX Design">UI/UX Design</SelectItem>
                    <SelectItem value="Data Science">Data Science</SelectItem>
                    <SelectItem value="Lainnya">Lainnya</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
            <div class="grid gap-2 mb-4">
              <Label for="is_published">Status Publikasi</Label>
              <select 
                id="is_published" 
                v-model="is_published" 
                class="flex h-10 w-full items-center justify-between rounded-md border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-950 focus:ring-offset-2"
              >
                <option :value="false">Draft</option>
                <option :value="true">Publish</option>
              </select>
            </div>
          </div>

          <div class="space-y-2">
            <Label for="description">Deskripsi Detail</Label>
            <Textarea id="description" v-model="description" rows="5" required />
          </div>

          <div class="space-y-2">
            <Label for="demoUrl">URL Demo</Label>
            <Input id="demoUrl" v-model="demoUrl" />
          </div>

          <div class="p-4 border rounded-lg bg-slate-50 space-y-4">
            <p class="text-sm text-slate-500 mb-2">Biarkan kosong jika tidak ingin mengubah file/gambar lama.</p>
            
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div class="space-y-2">
                <Label for="thumbnail">Ganti Gambar Thumbnail (.jpg/.png)</Label>
                <div v-if="oldThumbnail" class="mb-2">
                  <img :src="`${backendURL}${oldThumbnail}`" class="h-20 w-auto rounded border" alt="Old Thumbnail" />
                </div>
                <Input id="thumbnail" type="file" accept="image/*" @change="handleThumbnailChange" class="bg-white" />
              </div>
              <div class="space-y-2">
                <Label for="project_file">Ganti File Source Code (.zip/.rar)</Label>
                <Input id="project_file" type="file" accept=".zip,.rar" @change="handleProjectChange" class="bg-white" />
              </div>
            </div>
          </div>

          <div class="flex gap-4">
            <Button type="button" variant="outline" class="w-full" @click="router.push('/admin/projects')">Batal</Button>
            <Button type="submit" class="w-full bg-blue-600" :disabled="isSaving">
              {{ isSaving ? 'Menyimpan...' : 'Simpan Perubahan' }}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  </div>
</template>