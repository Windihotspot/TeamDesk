<script setup>
import { reactive, ref } from 'vue'
import { authService } from '@/services/authService.js'

const show = ref(false)
const authMode = ref('signup') // toggle state

function toggleVisibility() {
  show.value = !show.value
}

const form = reactive({
  firstName: "",
  lastName: "",
  email: "",
  teamName: "",
  password: ""
})

const submitPage = async () => {
  try {
    const data = await authService.signup({ ...form })
    console.log('✅ Success:', data)
  } catch (err) {
    console.error('Error:', err)
  }
}
</script>

<template>
  <v-container
    fluid
    class="flex items-center justify-center bg-[linear-gradient(135deg,#e6f2f7,#f4f8fb)] px-4"
  >
    <v-card
      class="w-full max-w-md p-6 sm:p-8 rounded-2xl shadow-xl text-center"
    >
      <!-- Logo -->
      <!-- <div class="mb-4">
        <h1 class="text-2xl font-bold text-gray-800">
          Team<span class="text-orange-500">Desk</span>
        </h1>
      </div> -->

      <!-- Toggle -->
      <!-- <div class="bg-gray-200 rounded-full p-1 flex mb-6 shadow-inner">
        <button
          class="flex-1 py-2 text-sm rounded-full transition-all"
          :class="authMode === 'login'
            ? 'bg-white shadow text-gray-800'
            : 'text-gray-500'"
          @click="authMode = 'login'"
        >
          Log In
        </button>

        <button
          class="flex-1 py-2 text-sm rounded-full transition-all"
          :class="authMode === 'signup'
            ? 'bg-blue-900 text-white shadow'
            : 'text-gray-500'"
          @click="authMode = 'signup'"
        >
          Sign Up
        </button>
      </div> -->

      <!-- Title -->
      <h2 class="text-lg sm:text-xl font-semibold text-gray-800 mb-1">
        Create Account
      </h2>

      <p class="text-sm text-gray-500 mb-6">
        Your workspace for managing tasks and daily operations.
      </p>

      <!-- FORM -->
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
          
          <!-- SIGNUP -->
          <div v-if="authMode === 'signup'" class="space-y-4">

            <v-text-field
              v-model="form.firstName"
              placeholder="First Name"
              prepend-inner-icon="mdi-account"
              variant="outlined"
              density="comfortable"
              rounded
            />

            <v-text-field
              v-model="form.lastName"
              placeholder="Last Name"
              prepend-inner-icon="mdi-account"
              variant="outlined"
              density="comfortable"
              rounded
            />

            <v-text-field
              v-model="form.teamName"
              placeholder="Team Name"
              prepend-inner-icon="mdi-account-group"
              variant="outlined"
              density="comfortable"
              rounded
            />

            <v-text-field
              v-model="form.email"
              placeholder="Email"
              prepend-inner-icon="mdi-email-outline"
              variant="outlined"
              density="comfortable"
              rounded
            />

            <v-text-field
              v-model="form.password"
              placeholder="Password"
              prepend-inner-icon="mdi-lock-outline"
              :type="show ? 'text' : 'password'"
              :append-inner-icon="show ? 'mdi-eye' : 'mdi-eye-off'"
              @click:append-inner="toggleVisibility"
              variant="outlined"
              density="comfortable"
              rounded
            />

            <v-text-field
              placeholder="Confirm Password"
              prepend-inner-icon="mdi-lock-check-outline"
              :type="show ? 'text' : 'password'"
              :append-inner-icon="show ? 'mdi-eye' : 'mdi-eye-off'"
              variant="outlined"
              density="comfortable"
              rounded
            />

            <p class="text-xs text-gray-400">
              Password strength : weak / strong
            </p>

            <v-btn
              block
              size="large"
              rounded="lg"
              class="bg-blue-900 text-black"
              @click="submitPage"
            >
              Sign Up
            </v-btn>

            <p class="text-sm text-gray-500 mt-4">
              Already have an account?
            </p>
          </div>

          <!-- LOGIN -->
          <div v-else class="space-y-4">

            <v-text-field
              v-model="form.email"
              placeholder="Email"
              prepend-inner-icon="mdi-email-outline"
              variant="outlined"
              density="comfortable"
              rounded
            />

            <v-text-field
              v-model="form.password"
              placeholder="Password"
              prepend-inner-icon="mdi-lock-outline"
              :type="show ? 'text' : 'password'"
              :append-inner-icon="show ? 'mdi-eye' : 'mdi-eye-off'"
              @click:append-inner="toggleVisibility"
              variant="outlined"
              density="comfortable"
              rounded
            />

            <v-btn
              block
              size="large"
              rounded="lg"
              class="bg-blue-900 text-white"
            >
              Log In
            </v-btn>

            <p class="text-sm text-gray-500 mt-4">
              Don’t have an account?
            </p>
          </div>

        </div>
      </transition>
    </v-card>
  </v-container>
</template>