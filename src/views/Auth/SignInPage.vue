<script setup>

import { onMounted, reactive, ref } from 'vue'
import { authService } from '@/services/authService.js'


const show = ref(false)

function toggleVisibility() {
  show.value = !show.value
}

// const firstName = ref('')
// const lastName = ref('')
// const email = ref('')
// const teamName = ref('')
// const password = ref('')

//use reactive for filing forms instead of calling one by one and using ref()
const form = reactive({
  firstName: "",
  lastName: "",
  email: "",
  teamName: "",
  password: ""
})



const submitPage = async () => {
  try {
    const data = await authService.signup({...form})
    resetForm()
    console.log('✅ Success:', data)
  } catch (err) {
    console.error('Error:', err)
  }
}

</script>

<template>
  <v-container
    fluid
    class="flex flex-col items-center justify-center min-h-screen bg-[linear-gradient(135deg,#cfe9f1,#eaf3f7)] md:flex-row md:p-6 lg:p-8"
  >
    <v-card width="420" class="pa-9 rounded-xl elevation-10 text-center">
      <!-- Icon -->
      <div class="mb-6">
        <v-avatar size="64" class="mx-auto elevation-2">
          <v-icon size="32">mdi-login</v-icon>
        </v-avatar>
      </div>

      <!-- Title -->
      <h2 class="text-h5 font-weight-bold mb-2">Sign up with email</h2>

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

      <!-- First Name -->
      <v-text-field
        v-model="firstName"
        placeholder="First Name"
        prepend-inner-icon="mdi-account"
        variant="outlined"
        density="comfortable"
        rounded
      />

      <!-- Last Name -->
      <v-text-field
        v-model="lastName"
        placeholder="Last Name"
        prepend-inner-icon="mdi-account"
        variant="outlined"
        density="comfortable"
        rounded
      />

      <!--TeamName-->

      <v-text-field
        v-model="teamName"
        placeholder="Team Name"
        prepend-inner-icon="mdi-account-group"
        variant="outlined"
        density="comfortable"
        rounded
      />

      <!--Email-->

      <v-text-field
        v-model="email"
        placeholder="Email"
        prepend-inner-icon="mdi-email-outline"
        variant="outlined"
        density="comfortable"
        rounded
      />

      <!-- Password -->
      <v-text-field
        v-model="password"
        placeholder="Password"
        prepend-inner-icon="mdi-lock-outline"
        :type="show ? 'text' : 'password'"
        :append-inner-icon="show ? 'mdi-eye' : 'mdi-eye-off'"
        @click:append-inner="toggleVisibility"
        variant="outlined"
        density="comfortable"
        rounded
      />

      <!--confirm pasword-->
      <v-text-field
        v-model="password"
        placeholder="Confirm Password"
        prepend-inner-icon="mdi-lock-check-outline"
        append-inner-icon="mdi-eye-off"
        type="password"
        variant="outlined"
        density="comfortable"
        rounded
      />

      <!-- Button -->
      <v-btn @click="submitPage" block size="large" class="mb-6 text-white bg-black" rounded="lg">
        Get Started
      </v-btn>

      <!-- Divider -->
      <div class="align-center mb-4">
        <span class="mx-2 text-sm text-grey"> Or log in with </span>
      </div>

      <!-- Social buttons -->

      <!-- <button @click="sendtologin" class="align-center border px-4 py-2 rounded-xl">
        <img src="https://www.svgrepo.com/show/475656/google-color.svg" class="w-5 h-5" />
      </button> -->
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
