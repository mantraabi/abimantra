<script setup>
import { ref, onMounted } from 'vue'
import { RouterLink } from 'vue-router'
import axios from 'axios'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'

const projects = ref([])
const isLoading = ref(true)
const backendURL = import.meta.env.VITE_BACKEND_URL

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

const handleDelete = async (id, title) => {
  if (!confirm(`Apakah kamu yakin ingin menghapus proyek "${title}" beserta file fisiknya secara permanen?`)) {
    return
  }

  const token = localStorage.getItem('token')
  try {
    await axios.delete(`${backendURL}/api/projects/${id}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
    
    alert('Proyek berhasil dihapus!')
    // Refresh tabel setelah dihapus
    fetchProjects()
  } catch (error) {
    console.error(error)
    alert('Gagal menghapus proyek.')
  }
}

onMounted(() => {
  fetchProjects()
})
</script>

<template>
  <div>
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-2xl font-bold text-slate-900">Daftar Proyek Portofolio</h1>
      <RouterLink to="/admin/project/add">
        <Button>+ Tambah Proyek Baru</Button>
      </RouterLink>
    </div>

    <div class="bg-white rounded-lg border shadow-sm">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead class="w-[50px]">No</TableHead>
            <TableHead>Judul Proyek</TableHead>
            <TableHead>Slug (URL)</TableHead>
            <TableHead>Tanggal Dibuat</TableHead>
            <TableHead class="text-right">Aksi</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow v-if="isLoading">
            <TableCell colspan="5" class="text-center py-8 text-slate-500">Memuat data...</TableCell>
          </TableRow>
          
          <TableRow v-else-if="projects.length === 0">
            <TableCell colspan="5" class="text-center py-8 text-slate-500">Belum ada proyek. Silakan tambah baru.</TableCell>
          </TableRow>

          <TableRow v-for="(project, index) in projects" :key="project.id">
            <TableCell class="font-medium">{{ index + 1 }}</TableCell>
            <TableCell>{{ project.title }}</TableCell>
            <TableCell class="text-slate-500">{{ project.slug }}</TableCell>
            <TableCell>{{ new Date(project.created_at).toLocaleDateString('id-ID') }}</TableCell>
            <TableCell class="text-right space-x-2">
              <RouterLink :to="`/admin/project/edit/${project.slug}`">
                <Button variant="outline" size="sm" class="text-blue-600 border-blue-200 hover:bg-blue-50">Edit</Button>
              </RouterLink>
              <Button variant="outline" size="sm" class="text-red-600 border-red-200 hover:bg-red-50" @click="handleDelete(project.id, project.title)">Hapus</Button>
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>
  </div>
</template>