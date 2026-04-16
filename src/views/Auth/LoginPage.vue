<script setup>
import { useRouter } from 'vue-router'
import { ref } from 'vue'
import { authService } from '@/services/authService.js'

const form = ref({
  email: '',
  password: ''
})

const router = useRouter()

// const submit = async () => {
//   try {
//     const data = await authService.login({ form.value })

//     console.log('FORM:', form)
//     console.log('✅ Success:', data)

//     router.push('/')

//   } catch (err) {
//     console.error('Error:', err)
//   }
// }

const submit = async () => {
  const payload = {
    email: form.value.email,
    password: form.value.password
  }
  console.log('Payload:', payload)
  try {
    const data = await authService.login(payload)

    console.log('✅ Success:', data)

    router.push('/')
  } catch (err) {
    console.error('Error:', err)
  }
}
</script>

<template>
  <v-container fluid class="d-flex align-center justify-center fill-height bg-gradient">
    <v-card width="420" class="pa-9 rounded-xl elevation-10 text-center">
      <div class="mb-6">
        <v-avatar size="64" class="mx-auto elevation-2">
          <v-icon size="32">mdi-login</v-icon>
        </v-avatar>
      </div>

      <h2 class="text-h5 font-weight-bold mb-2">Log In</h2>

      <v-responsive class="mx-auto mb-4 pt-2" max-width="344">
        <v-text-field
          v-model="form.email"
          hide-details="auto"
          placeholder="Email"
          prepend-inner-icon="mdi-email-outline"
          rounded
          variant="outlined"
          density="comfortable"
        ></v-text-field>
      </v-responsive>

      <v-text-field
        v-model="form.password"
        placeholder="Password"
        prepend-inner-icon="mdi-lock-outline"
        append-inner-icon="mdi-eye-off"
        type="password"
        variant="outlined"
        density="comfortable"
        rounded
      />

      <div class="text-right mb-4">
        <a href="#" class="text-caption text-grey"> Forgot password? </a>
      </div>

      <v-btn @click="submit" block size="large" class="mb-6 text-white bg-black" rounded="lg">
        Welcome Back
      </v-btn>
    </v-card>
  </v-container>
</template>

<style scoped>
.fill-height {
  min-height: 100vh;
}

/* soft gradient background */
.bg-gradient {
  background: linear-gradient(135deg, #cfe9f1, #eaf3f7);
}
</style>
