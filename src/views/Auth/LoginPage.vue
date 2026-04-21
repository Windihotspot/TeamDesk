<script setup>
import { ref } from 'vue'
import LoginForm from '@/views/Auth/LoginForm.vue'
import SignupForm from '@/views/Auth/SignupForm.vue'

const authMode = ref('login')
</script>

<template>
  <!-- PAGE WRAPPER -->
  <div class="min-h-screen flex items-center justify-center bg-[linear-gradient(135deg,#e6f2f7,#f4f8fb)] px-4">

    <!-- CARD -->
    <div class="w-full max-w-md bg-white/90 backdrop-blur rounded-2xl shadow-xl p-6 sm:p-8">

      <!-- LOGO -->
      <div class="text-center mb-4">
        <h1 class="text-2xl font-bold text-gray-800">
          Team<span class="text-orange-500">Desk</span>
        </h1>
      </div>

      <!-- TOGGLE -->
      <div class="flex bg-gray-200 rounded-full p-1 mb-6 shadow-inner">
        <button
          class="flex-1 py-2 rounded-full text-sm transition-all"
          :class="authMode === 'login'
            ? 'bg-blue-900 text-white shadow'
            : 'text-gray-600'"
          @click="authMode = 'login'"
        >
          Log In
        </button>

        <button
          class="flex-1 py-2 rounded-full text-sm transition-all"
          :class="authMode === 'signup'
            ? 'bg-blue-900 text-white shadow'
            : 'text-gray-600'"
          @click="authMode = 'signup'"
        >
          Sign Up
        </button>
      </div>

      <!-- TRANSITION AREA -->
      <transition
        mode="out-in"
        enter-active-class="transition duration-300 ease-out"
        enter-from-class="opacity-0 translate-y-2 scale-95"
        enter-to-class="opacity-100 translate-y-0 scale-100"
        leave-active-class="transition duration-200 ease-in"
        leave-from-class="opacity-100"
        leave-to-class="opacity-0 scale-95"
      >
        <component
          :is="authMode === 'login' ? LoginForm : SignupForm"
          :key="authMode"
        />
      </transition>

    </div>
  </div>
</template>