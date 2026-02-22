<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

const router = useRouter()
const backendURL = import.meta.env.VITE_BACKEND_URL

// State untuk form teks
const title = ref('')
const slug = ref('')
const description = ref('')
const demoUrl = ref('')
const category = ref('')

// State untuk file fisik
const thumbnailFile = ref(null)
const projectFile = ref(null)

const isLoading = ref(false)
const alertMessage = ref('')

// Menangkap file saat dipilih oleh user
const handleThumbnailChange = (e) => {
  thumbnailFile.value = e.target.files[0]
}
const handleProjectChange = (e) => {
  projectFile.value = e.target.files[0]
}

// Membuat slug otomatis dari judul (misal: "Aplikasi Kasir" -> "aplikasi-kasir")
const generateSlug = () => {
  slug.value = title.value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '')
}

const handleSubmit = async () => {
  isLoading.value = true
  alertMessage.value = ''
  
  const token = localStorage.getItem('token')
  
  // Karena ada file, kita WAJIB menggunakan FormData
  const formData = new FormData()
  formData.append('title', title.value)
  formData.append('slug', slug.value)
  formData.append('description', description.value)
  formData.append('demo_url', demoUrl.value)
  formData.append('is_published', 'true')
  formData.append('category', category.value)
  
  // Masukkan file jika ada
  if (thumbnailFile.value) formData.append('thumbnail', thumbnailFile.value)
  if (projectFile.value) formData.append('project_file', projectFile.value)

  try {
    await axios.post(`${backendURL}/api/projects`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        Authorization: `Bearer ${token}`
      }
    })
    
    alert('Proyek berhasil diunggah!')
    router.push('/') // Kembali ke Home untuk melihat hasilnya
    
  } catch (error) {
    console.error(error)
    alertMessage.value = error.response?.data?.message || 'Gagal mengunggah proyek.'
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <div class="max-w-3xl mx-auto py-8">
    <Card>
      <CardHeader>
        <CardTitle class="text-2xl">Tambah Proyek Baru</CardTitle>
      </CardHeader>
      <CardContent>
        <form @submit.prevent="handleSubmit" class="space-y-6">
          
          <div v-if="alertMessage" class="p-3 bg-red-50 text-red-600 rounded-md text-sm">
            {{ alertMessage }}
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div class="space-y-2">
              <Label for="title">Judul Proyek</Label>
              <Input id="title" v-model="title" @input="generateSlug" placeholder="Contoh: Aplikasi Ujian CBT" required />
            </div>

            <div class="space-y-2">
              <Label for="slug">Slug (URL SEO)</Label>
              <Input id="slug" v-model="slug" placeholder="aplikasi-ujian-cbt" required />
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
            
          </div>

          <div class="space-y-2">
            <Label for="description">Deskripsi Detail</Label>
            <Textarea 
              id="description" 
              v-model="description" 
              placeholder="Jelaskan fitur, teknologi yang digunakan, dan cara instalasinya di sini..." 
              rows="5"
              required 
            />
          </div>

          <div class="space-y-2">
            <Label for="demoUrl">URL Demo (Opsional)</Label>
            <Input id="demoUrl" v-model="demoUrl" placeholder="https://demo.aplikasiku.com" />
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 border rounded-lg bg-slate-50">
            <div class="space-y-2">
              <Label for="thumbnail">Gambar Thumbnail (.jpg / .png)</Label>
              <Input id="thumbnail" type="file" accept="image/*" @change="handleThumbnailChange" class="cursor-pointer bg-white" required />
            </div>

            <div class="space-y-2">
              <Label for="project_file">File Source Code (.zip / .rar)</Label>
              <Input id="project_file" type="file" accept=".zip,.rar" @change="handleProjectChange" class="cursor-pointer bg-white" required />
            </div>
          </div>

          <Button type="submit" class="w-full" :disabled="isLoading">
            {{ isLoading ? 'Mengunggah Data & File...' : 'Simpan & Publikasikan Proyek' }}
          </Button>

        </form>
      </CardContent>
    </Card>
  </div>
</template>