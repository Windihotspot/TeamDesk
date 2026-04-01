<script setup>
import router from '@/router'
import { ref } from 'vue'

const sendtologin = () => {
  router.push('/login')
}

const show = ref(false)

function toggleVisibility(){
    show.value = !show.value
}
</script>

<template>
  <v-container
    fluid
    class="flex flex-col items-center justify-center min-h-screen bg-[linear-gradient(135deg,#cfe9f1,#eaf3f7)]  md:flex-row md:p-6 lg:p-8"
  >
    <v-card width="420" class="pa-9 rounded-xl elevation-10 text-center">
      <!-- Icon -->
      <div class="mb-6">
        <v-avatar size="64" class="mx-auto elevation-2"> 
          <v-icon size="32">mdi-login</v-icon>
        </v-avatar>
      </div>

      <!-- Title -->
      <h2 class="text-h5 font-weight-bold mb-2">Sign in with email</h2>

      <p class="text-body-2 text-grey mb-6">
        Your workspace for managing tasks and daily operations.
      </p>

      <!-- Email -->
      <!-- <v-text-field
        placeholder="Email"
        prepend-inner-icon="mdi-email-outline"
        variant="outlined"
        density="comfortable"
        class="mb-4"
        rounded
      /> -->

      <v-responsive class="mx-auto mb-4 pt-2" max-width="344">
        <v-text-field
          hide-details="auto"
          placeholder="Email"
          prepend-inner-icon="mdi-email-outline"
          rounded
          variant="outlined"
          density="comfortable"
        ></v-text-field>
      </v-responsive>

      <!-- Password -->
      <v-text-field
        placeholder="Password"
        prepend-inner-icon="mdi-lock-outline"
        :type="show ? 'text' : 'password'"
        :append-inner-icon="show ? 'mdi-eye' : 'mdi-eye-off'"
        @click:append-inner="toggleVisibility"
        variant="outlined"
        density="comfortable"
        rounded
      />

      <!-- Forgot password -->
      <div class="text-right mb-4">
        <a href="#" class="text-caption text-grey"> Forgot password? </a>
      </div>

      <!-- Button -->
      <v-btn block size="large" class="mb-6 text-white bg-black" rounded="lg"> Get Started </v-btn>

      <!-- Divider -->
      <div class="align-center mb-4">
        <span class="mx-2 text-sm text-grey"> Or log in with </span>
      </div>

      <!-- Social buttons -->

      <button @click="sendtologin" class="align-center border px-4 py-2 rounded-xl">
        <img src="https://www.svgrepo.com/show/475656/google-color.svg" class="w-5 h-5" />
      </button>
    </v-card>
  </v-container>
</template>

<!-- <style scoped>
.fill-height {
  min-height: 100vh;
}

/* soft gradient background */
.bg-gradient {
  background: linear-gradient(135deg, #cfe9f1, #eaf3f7);
}
</style> -->
