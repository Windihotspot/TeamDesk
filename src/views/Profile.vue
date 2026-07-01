<script setup>
import MainLayout from '@/layouts/full/MainLayout.vue'
import { ref, onBeforeUnmount } from 'vue'
import { onMounted, watch } from 'vue'
// import { useProfile } from '@/composables/useProfile.js'
import { supabase } from '@/services/supabase.js'
import ApiService from '@/services/api'
import { useProjectStore } from '@/stores/project.js'

import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()
const projectStore = useProjectStore()
// const { profile, loading, error } = useProfile()

const profiles = ref([])
// const user.id = ref(null)

const fetchProfile = async () => {
  // loading.value = true

  const {
    data: { session }
  } = await supabase.auth.getSession()

  if (!session?.user) {
    error.value = 'No user logged in'
    loading.value = false
    return
  }

  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', session.user.id)
    console.log('profiles:', data)

    if (!error) {
      profiles.value = data
    }
  } catch (error) {
    console.error(error)
  }
}

onMounted(() => {
  fetchProfile()
})

const showEdit = ref(false)

const openEditProfile = () => {
  showEdit.value = true
}

const profile = ref({
  first_name: '',
  last_name: '',
  email: '',
  bio: ''
})

const cameraDialog = ref(false)
const video = ref(null)
const canvas = ref(null)
const imageUrl = ref('')

let stream = null

// Open Camera
const startCamera = async () => {
  cameraDialog.value = true

  try {
    stream = await navigator.mediaDevices.getUserMedia({
      video: {
        facingMode: 'user' // front camera
      },
      audio: false
    })

    video.value.srcObject = stream
  } catch (error) {
    console.error('Camera access denied:', error)
  }
}

// Take Photo
const capturePhoto = () => {
  const context = canvas.value.getContext('2d')

  canvas.value.width = video.value.videoWidth
  canvas.value.height = video.value.videoHeight

  context.drawImage(video.value, 0, 0, canvas.value.width, canvas.value.height)

  imageUrl.value = canvas.value.toDataURL('image/png')

  stopCamera()
  cameraDialog.value = false
}

// Stop Camera
const stopCamera = () => {
  if (stream) {
    stream.getTracks().forEach((track) => track.stop())
  }
}

onBeforeUnmount(() => {
  stopCamera()
})

// const allTasks = ref([tasks])

const tasks = ref({})

const loading = ref(true)

const fetchTasks = async () => {
  loading.value = true
  try {
    const userId = authStore.user?.id || authStore.session?.user?.id

    //we can pass multiuple properties inside a request
    //we can also use promise.all to make multiple request calls
    const res = await ApiService.post('tasks', { action: 'list', user_id: userId })

    tasks.value = {
      ...(res.data.created_tasks ?? []),
      ...(res.data.assigned_tasks ?? [])
    }
  } catch (error) {
    console.log(error)
  } finally {
    loading.value = false
  }
}

// onMounted(() => {
//   fetchTasks()
// })

watch(
  () => authStore.user?.id || authStore.session?.user?.id,
  (userId) => {
    if (userId) fetchTasks()
  },
  { immediate: true } // runs once on mount too
)

const isLoading = ref(true)

const projects = ref([])

const fetchProject = async () => {
  isLoading.value = true

  try {
    const { data, error } = await supabase.from('projects').select('*')
    console.log('Projects:', data)
    if (!error) {
      projects.value = data
    }
  } catch (err) {
    console.error(err)
  } finally {
    isLoading.value = false
  }
}

onMounted(() => {
  fetchProject()
})
</script>

<template>
  <MainLayout>
    <section class="min-h-screen bg-white text-gray-500 px-6 py-10">
      <div class="max-w-6xl mx-auto">
        <!-- PROFILE -->
        <div class="flex flex-col md:flex-row gap-6">
          <!-- Avatar -->
          <div class="relative">
            <div
              class="w-32 h-32 rounded-full bg-pink-200 flex items-center justify-center text-6xl font-light text-[#5b2c52]"
            >
              lu
            </div>

            <!-- Camera -->
            <button
              class="absolute bottom-1 right-1 w-10 h-10 rounded-full border border-gray-300 bg-white flex items-center justify-center shadow-sm"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="w-5 h-5 text-gray-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="1.5"
                  d="M3 7h3l2-2h8l2 2h3v11H3V7z"
                />
                <circle cx="12" cy="13" r="3.5" stroke-width="1.5" />
              </svg>
            </button>
          </div>

          <!-- Profile Info -->
          <div class="flex flex-col justify-center">
            <div v-if="profiles.length">
              <div v-for="profile in profiles" :key="profile.id">
                <h1 class="text-2xl font-semibold text-gray-800">
                  Welcome, {{ profile.first_name }} {{ profile.last_name }}!
                </h1>
              </div>
            </div>

            <!-- Button -->
            <button
              @click="openEditProfile"
              class="mt-4 w-fit bg-[#0f4c81] hover:bg-[#0c3d67] text-white px-4 py-2 rounded-lg transition-all duration-300"
            >
              Edit profile
            </button>
          </div>
        </div>
      </div>

      <!-- popup modal for editprofile-->

      <v-dialog v-model="showEdit" max-width="650" persistent>
        <v-card class="rounded-xl pa-4">
          <!-- Header -->
          <div class="d-flex align-center justify-space-between mb-4">
            <div>
              <h2 class="text-h5 font-weight-bold">Settings</h2>
              <p class="text-grey text-body-2">
                Update your personal information and profile photo.
              </p>
            </div>

            <v-btn icon="mdi-close" variant="text" @click="showEdit = false"></v-btn>
          </div>

          <v-divider class="mb-6"></v-divider>

          <!-- Profile Image -->
          <div class="d-flex flex-column align-center mb-6">
            <v-avatar size="90" class="mb-3">
              <v-img src="imageUrl"></v-img>
            </v-avatar>

            <v-btn @click="startCamera" size="small" variant="outlined" prepend-icon="mdi-camera">
              Upload your Photo
            </v-btn>
          </div>

          <!-- Camera Dialog -->
          <v-dialog v-model="cameraDialog" max-width="600">
            <v-card class="pa-4 rounded-xl">
              <div class="d-flex justify-space-between align-center mb-4">
                <h3 class="text-h6">Take a Photo</h3>

                <v-btn icon="mdi-close" variant="text" @click="cameraDialog = false" />
              </div>

              <!-- Live Camera -->
              <video ref="video" autoplay playsinline class="w-100 rounded-lg"></video>

              <canvas ref="canvas" class="d-none"></canvas>

              <v-card-actions class="mt-4">
                <v-spacer />

                <v-btn color="primary" prepend-icon="mdi-camera" @click="capturePhoto">
                  Capture
                </v-btn>
              </v-card-actions>
            </v-card>
          </v-dialog>

          <!-- Form -->
          <v-row>
            <v-col cols="12" md="6">
              <v-text-field
                label="First Name"
                variant="outlined"
                density="comfortable"
                v-model="profile.first_name"
              />
            </v-col>

            <v-col cols="12" md="6">
              <v-text-field
                label="Last Name"
                variant="outlined"
                density="comfortable"
                v-model="profile.last_name"
              />
            </v-col>

            <v-col cols="12">
              <v-text-field
                label="Email Address"
                variant="outlined"
                density="comfortable"
                v-model="profile.email"
              />
            </v-col>

            <v-col cols="12">
              <v-textarea label="Bio" variant="outlined" rows="3" auto-grow v-model="profile.bio" />
            </v-col>
          </v-row>

          <!-- Actions -->
          <v-card-actions class="mt-4">
            <v-spacer />

            <v-btn variant="text" @click="showEdit = false"> Cancel </v-btn>

            <v-btn color="primary" class="px-6"> Save Changes </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>

      <!-- TASKS -->
      <div class="mt-14 border border-gray-200 rounded-2xl overflow-hidden">
        <!-- Header -->
        <div class="flex items-center justify-between px-8 py-6 border-b border-gray-200">
          <div class="flex items-center gap-2">
            <h2 class="text-4xl font-semibold text-gray-600">My tasks</h2>

            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="w-4 h-4 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="1.5"
                d="M12 15v2m-6 0h12a2 2 0 002-2v-5a2 2 0 00-2-2h-1V7a5 5 0 10-10 0v1H6a2 2 0 00-2 2v5a2 2 0 002 2zm3-9a3 3 0 016 0v1H9V7z"
              />
            </svg>
          </div>

          <button
            class="border border-gray-300 px-4 py-2 rounded-lg text-sm hover:bg-gray-50 transition"
          >
            View all tasks
          </button>
        </div>

        <!-- List -->
        <div class="max-h-[420px] overflow-y-auto">
          <!-- Empty state -->
          <div v-if="loading" class="px-8 py-10 text-center text-gray-500">No tasks available.</div>

          <!-- Task List -->
          <template v-else>
            <div
              v-for="task in tasks"
              :key="task.id"
              class="px-8 py-5 border-b border-gray-100 flex items-center justify-between hover:bg-gray-50 transition"
            >
              <div class="flex items-center gap-4">
                <div
                  class="w-5 h-5 rounded-full border border-gray-400 flex items-center justify-center"
                >
                  <div v-if="task.completed" class="w-1.5 h-1.5 rounded-full bg-gray-400"></div>
                </div>

                <p class="text-lg">{{ task.title }}</p>
              </div>

              <span class="text-sm text-pink-400">
                {{ task.due_date }}
              </span>
            </div>

            <!-- Show More -->
            <button class="w-full text-left px-8 py-6 hover:bg-gray-50 transition">
              Show more
            </button>
          </template>
        </div>
      </div>

      <!-- PROJECTS -->
      <div class="mt-10 border border-gray-200 rounded-2xl p-8">
        <h2 class="text-4xl font-semibold text-gray-600 mb-8">My recent projects</h2>

        <!-- Empty state -->
        <div v-if="isLoading" class="py-10 text-center text-gray-500">
          No projects available.
        </div>

        <!-- Project List -->
        <template v-else>
          <div
            v-for="project in projects"
            :key="project.id"
            class="flex items-center justify-between hover:bg-gray-50 rounded-xl px-4 py-3 transition"
          >
            <div class="flex items-center gap-4">
              <!-- Icon -->
              <div class="w-10 h-10 rounded-lg bg-pink-100 flex items-center justify-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  class="w-5 h-5 text-pink-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="1.5"
                    d="M4 7h16M4 12h8m-8 5h16"
                  />
                </svg>
              </div>

              <div>
                <h3 class="text-lg font-medium">{{ project.name }}</h3>
                <p class="text-sm text-gray-500">{{ project.description }}</p>
              </div>
            </div>
          </div>
        </template>
      </div>
    </section>
  </MainLayout>
</template>
