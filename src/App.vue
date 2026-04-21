<script setup lang="ts">
import { RouterView } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { onMounted } from 'vue'

const auth = useAuthStore()

onMounted(async () => {
  await auth.fetchSession()   // ✅ WAIT for it
  auth.initAuthListener()
})
</script>

<template>
  <main class="">
    <RouterView />
  </main>
</template>

<style>
.custom-btn {
  background-color: #27bfa0;
}
</style>
