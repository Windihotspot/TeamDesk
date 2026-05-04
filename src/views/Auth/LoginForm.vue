<script setup>
import { useRouter } from 'vue-router'
import { ref } from 'vue'

import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const auth = useAuthStore()

// 🔹 REQUIRED (you were missing this)
const authMode = ref('login')

// 🔹 password toggle
const show = ref(false)
const toggleVisibility = () => {
  show.value = !show.value
}

// 🔹 form state
const form = ref({
  email: '',
  password: ''
})

const loading = ref(false)

// 🔹 login
const submit = async () => {
  loading.value = true
  const { email, password } = form.value
  console.log(form.value)
  try {
    const data = await auth.login({ email, password })

    console.log('✅ User:', data.user)
    console.log('✅ Session:', data.session)

    router.push('/dashboard')
  } catch (err) {
    console.error('❌ Login error:', err.message)
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <v-container
    fluid
    class="flex items-center justify-center bg-[linear-gradient(135deg,#e6f2f7,#f4f8fb)] pa-0"
  >
    <v-card class="w-full max-w-md rounded-2xl shadow-xl">
      <div class="p-6 sm:p-8">
        <!-- 🔹 TOGGLE -->
        <!-- <div class="bg-gray-200 rounded-full p-1 flex mb-6 shadow-inner">
        <button
          class="flex-1 py-2 text-sm rounded-full flex items-center justify-center gap-2 transition-all"
          :class="authMode === 'login'
            ? 'bg-blue-900 text-white shadow'
            : 'text-gray-600'"
          @click="authMode = 'login'"
        >
          <v-icon size="18">mdi-login</v-icon>
          Log In
        </button>

        <button
          class="flex-1 py-2 text-sm rounded-full transition-all"
          :class="authMode === 'signup'
            ? 'bg-white shadow text-gray-800'
            : 'text-gray-600'"
          @click="authMode = 'signup'"
        >
          Sign Up
        </button>
      </div> -->

        <!-- 🔹 TRANSITION -->
        <transition
          mode="out-in"
          enter-active-class="transition duration-300 ease-out"
          enter-from-class="opacity-0 translate-y-2 scale-95"
          enter-to-class="opacity-100 translate-y-0 scale-100"
          leave-active-class="transition duration-200 ease-in"
          leave-from-class="opacity-100"
          leave-to-class="opacity-0 scale-95"
        >
          <div :key="authMode">
            <!-- ✅ LOGIN -->
            <div v-if="authMode === 'login'" class="space-y-5">
              <h2 class="text-lg font-semibold text-gray-800">Welcome Back,</h2>

              <!-- Email -->
              <v-text-field
                v-model="form.email"
                placeholder="Email"
                prepend-inner-icon="mdi-email-outline"
                class="[&_.v-field__prepend-inner_.v-icon]:!text-[#0B1F3A]"
                variant="outlined"
                density="comfortable"
                rounded-md
                :rules="[
                  (v) => !!v || 'Email is required',
                  (v) => /.+@.+\..+/.test(v) || 'Email must be valid'
                ]"
              />

              <!-- Password -->
              <v-text-field
                v-model="form.password"
                placeholder="Password"
                prepend-inner-icon="mdi-lock-outline"
                :type="show ? 'text' : 'password'"
                :append-inner-icon="show ? 'mdi-eye' : 'mdi-eye-off'"
                @click:append-inner="toggleVisibility"
                variant="outlined"
                density="comfortable"
                rounded-md
                :rules="[
                  (v) => !!v || 'Password is required',
                  
                ]"
              />

              <div class="text-right">
                <button class="text-sm text-gray-600 hover:underline">Forget Password ?</button>
              </div>

              <v-btn
                block
                size="large"
                rounded="lg"
                color="#0B1F3A"
                :loading="loading"
                class="text-white"
                @click="submit"
              >
                <v-icon start>mdi-login</v-icon>
                Log In
              </v-btn>

              <!-- Divider -->
              <div class="flex items-center gap-3 my-4">
                <div class="flex-1 h-px bg-gray-300"></div>
                <span class="text-sm text-gray-500">or continue with</span>
                <div class="flex-1 h-px bg-gray-300"></div>
              </div>

              <!-- Google -->
              <div class="flex justify-center">
                <button class="p-2 rounded-full hover:bg-gray-100 transition">
                  <img src="https://www.svgrepo.com/show/475656/google-color.svg" class="w-6 h-6" />
                </button>
              </div>
            </div>

            <!-- ✅ SIGNUP (placeholder or import your real one) -->
            <div v-else class="text-center text-gray-500">
              <p>Signup form goes here</p>
            </div>
          </div>
        </transition>
      </div>
    </v-card>
  </v-container>
</template>
