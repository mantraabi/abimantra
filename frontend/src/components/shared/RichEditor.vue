<script setup>
import { watch } from 'vue'
import { useEditor, EditorContent } from '@tiptap/vue-3'
import StarterKit from '@tiptap/starter-kit'
import Link from '@tiptap/extension-link'
import { Button } from '@/components/ui/button'

const props = defineProps({
  modelValue: {
    type: String,
    default: '',
  },
})

const emit = defineEmits(['update:modelValue'])

const editor = useEditor({
  content: props.modelValue,
  extensions: [
    StarterKit,
    Link.configure({
      openOnClick: false,
      HTMLAttributes: {
        class: 'text-blue-600 underline cursor-pointer',
      },
    }),
  ],
  onUpdate: ({ editor }) => {
    // Setiap kali user mengetik, kirim HTML-nya ke v-model induk
    emit('update:modelValue', editor.getHTML())
  },
  editorProps: {
    attributes: {
      // Class ini membuat area ketik terlihat seperti artikel (prose) dan menghilangkan outline biru bawaan browser
      class: 'prose prose-slate max-w-none focus:outline-none min-h-[300px] p-4',
    },
  },
})

// Jika ada perubahan data dari luar (misal saat proses Edit artikel), update isi editor
watch(() => props.modelValue, (value) => {
  const isSame = editor.value?.getHTML() === value
  if (isSame) return
  editor.value?.commands.setContent(value, false)
})

// Fungsi untuk menambahkan/menghapus Link
const setLink = () => {
  const previousUrl = editor.value.getAttributes('link').href
  const url = window.prompt('Masukkan URL tautan:', previousUrl || '')

  // Dibatalkan
  if (url === null) return

  // Dikosongkan (Hapus link)
  if (url === '') {
    editor.value.chain().focus().extendMarkRange('link').unsetLink().run()
    return
  }

  // Set link baru
  editor.value.chain().focus().extendMarkRange('link').setLink({ href: url }).run()
}
</script>

<template>
  <div v-if="editor" class="border rounded-md bg-white overflow-hidden flex flex-col">
    <div class="flex flex-wrap items-center gap-1 p-2 border-b bg-slate-50">
      
      <Button 
        type="button" variant="ghost" size="sm" 
        :class="{ 'bg-slate-200': editor.isActive('bold') }" 
        @click="editor.chain().focus().toggleBold().run()"
      >
        <span class="font-bold">B</span>
      </Button>

      <Button 
        type="button" variant="ghost" size="sm" 
        :class="{ 'bg-slate-200': editor.isActive('italic') }" 
        @click="editor.chain().focus().toggleItalic().run()"
      >
        <span class="italic font-serif">I</span>
      </Button>

      <div class="w-px h-6 bg-slate-300 mx-1"></div> <Button 
        type="button" variant="ghost" size="sm" 
        :class="{ 'bg-slate-200': editor.isActive('heading', { level: 2 }) }" 
        @click="editor.chain().focus().toggleHeading({ level: 2 }).run()"
      >
        H2
      </Button>

      <Button 
        type="button" variant="ghost" size="sm" 
        :class="{ 'bg-slate-200': editor.isActive('heading', { level: 3 }) }" 
        @click="editor.chain().focus().toggleHeading({ level: 3 }).run()"
      >
        H3
      </Button>

      <div class="w-px h-6 bg-slate-300 mx-1"></div> <Button 
        type="button" variant="ghost" size="sm" 
        :class="{ 'bg-slate-200': editor.isActive('bulletList') }" 
        @click="editor.chain().focus().toggleBulletList().run()"
      >
        • List
      </Button>

      <Button 
        type="button" variant="ghost" size="sm" 
        :class="{ 'bg-slate-200': editor.isActive('orderedList') }" 
        @click="editor.chain().focus().toggleOrderedList().run()"
      >
        1. List
      </Button>

      <div class="w-px h-6 bg-slate-300 mx-1"></div> <Button 
        type="button" variant="ghost" size="sm" 
        :class="{ 'bg-slate-200': editor.isActive('link') }" 
        @click="setLink"
      >
        🔗 Link
      </Button>
      
    </div>

    <EditorContent :editor="editor" class="flex-grow cursor-text" @click="editor.commands.focus()" />
  </div>
</template>

<style>
/* Memperbaiki sedikit gaya bawaan Tiptap agar lebih rapi */
.ProseMirror p.is-editor-empty:first-child::before {
  content: 'Tulis sesuatu yang luar biasa di sini...';
  float: left;
  color: #94a3b8;
  pointer-events: none;
  height: 0;
}
</style>