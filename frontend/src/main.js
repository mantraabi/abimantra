// src/main.js

import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import router from './router'
import vue3GoogleLogin from 'vue3-google-login'
import { createHead } from '@vueuse/head'

const app = createApp(App)
const head = createHead()

app.use(head)
app.use(vue3GoogleLogin, {
  clientId: import.meta.env.VITE_GOOGLE_CLIENT_ID
})

app.use(router)
app.mount('#app')