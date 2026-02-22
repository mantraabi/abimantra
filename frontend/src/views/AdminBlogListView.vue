<script setup>
import { ref, onMounted } from 'vue'
import { RouterLink } from 'vue-router'
import axios from 'axios'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'

const blogs = ref([])
const isLoading = ref(true)
const backendURL = import.meta.env.VITE_BACKEND_URL

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

const handleDelete = async (id, title) => {
  if (!confirm(`Yakin ingin menghapus artikel "${title}"?`)) return

  const token = localStorage.getItem('token')
  try {
    await axios.delete(`${backendURL}/api/blogs/${id}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
    alert('Artikel berhasil dihapus!')
    fetchBlogs()
  } catch (error) {
    console.error(error)
    alert('Gagal menghapus artikel.')
  }
}

onMounted(() => {
  fetchBlogs()
})
</script>

<template>
  <div>
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-2xl font-bold text-slate-900">Kelola Artikel Blog</h1>
      <RouterLink to="/admin/blog/add">
        <Button>+ Tulis Artikel Baru</Button>
      </RouterLink>
    </div>

    <div class="bg-white rounded-lg border shadow-sm">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead class="w-[50px]">No</TableHead>
            <TableHead>Judul Artikel</TableHead>
            <TableHead>Penulis</TableHead>
            <TableHead>Tanggal Dibuat</TableHead>
            <TableHead class="text-right">Aksi</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow v-if="isLoading">
            <TableCell colspan="5" class="text-center py-8 text-slate-500">Memuat data...</TableCell>
          </TableRow>
          <TableRow v-else-if="blogs.length === 0">
            <TableCell colspan="5" class="text-center py-8 text-slate-500">Belum ada artikel. Yuk tulis sesuatu!</TableCell>
          </TableRow>
          <TableRow v-for="(blog, index) in blogs" :key="blog.id">
            <TableCell class="font-medium">{{ index + 1 }}</TableCell>
            <TableCell>{{ blog.title }}</TableCell>
            <TableCell>{{ blog.author_name || 'Admin' }}</TableCell>
            <TableCell>{{ new Date(blog.created_at).toLocaleDateString('id-ID') }}</TableCell>
            <TableCell class="text-right space-x-2">
              <RouterLink :to="`/admin/blog/edit/${blog.slug}`">
                <Button variant="outline" size="sm" class="text-blue-600 border-blue-200 hover:bg-blue-50">Edit</Button>
              </RouterLink>
              <Button variant="outline" size="sm" class="text-red-600 border-red-200 hover:bg-red-50" @click="handleDelete(blog.id, blog.title)">Hapus</Button>
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>
  </div>
</template>