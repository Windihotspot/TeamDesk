<script setup>
import MainLayout from '@/layouts/full/MainLayout.vue'
import { ref } from 'vue'
import { onMounted } from 'vue'
// import { useProfile } from '@/composables/useProfile.js'
import { supabase } from '@/services/supabase.js'

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

          <!-- Info -->

          <div v-if="profiles.length" class="flex items-center gap-4">
            <div v-for="profile in profiles" :key="profile.id">
              <h1>Welcome, {{ profile.first_name }} {{ profile.last_name }}!</h1>
            </div>
          </div>

          <!-- Out of office -->
          <div class="flex items-center gap-2 mt-2 text-sm">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="1.5"
                d="M8 7V3m8 4V3m-9 8h10m-11 9h12a2 2 0 002-2V7a2 2 0 00-2-2H6a2 2 0 00-2 2v11a2 2 0 002 2z"
              />
            </svg>

            <span>Set out of office</span>
          </div>

          <!-- Actions -->
          <div class="flex flex-wrap gap-5 mt-5 text-lg">
            <button class="hover:text-gray-700 transition">+ Add job title</button>

            <button class="hover:text-gray-700 transition">+ Add team or dept.</button>

            <button class="hover:text-gray-700 transition">+ Add about me</button>
          </div>

          <!-- Button -->
          <button
            class="mt-6 bg-blue-100 text-blue-600 px-5 py-2 rounded-lg hover:bg-blue-200 transition"
          >
            Edit profile
          </button>
        </div>
      </div>

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
          <!-- Item -->
          <div
            class="px-8 py-5 border-b border-gray-100 flex items-center justify-between hover:bg-gray-50 transition"
          >
            <div class="flex items-center gap-4">
              <div
                class="w-5 h-5 rounded-full border border-gray-400 flex items-center justify-center"
              >
                <div class="w-1.5 h-1.5 rounded-full bg-gray-400"></div>
              </div>

              <p class="text-lg">Alert: Asana invitation could not be delivered</p>
            </div>

            <span class="text-pink-400 text-sm">Apr 21</span>
          </div>

          <!-- Item -->
          <div
            class="px-8 py-5 border-b border-gray-100 flex items-center justify-between hover:bg-gray-50 transition"
          >
            <div class="flex items-center gap-4">
              <div class="w-5 h-5 rounded-full border border-gray-400"></div>

              <p class="text-lg">Write endpoints for the Projects and tasks for team desk</p>
            </div>

            <div
              class="bg-pink-50 border border-pink-100 rounded-md px-3 py-1 text-sm flex items-center gap-2"
            >
              <div class="w-2 h-2 rounded-full bg-pink-400"></div>
              2026-...
            </div>
          </div>

          <!-- Item -->
          <div
            class="px-8 py-5 border-b border-gray-100 flex items-center justify-between hover:bg-gray-50 transition"
          >
            <div class="flex items-center gap-4">
              <div class="w-5 h-5 rounded-full border border-gray-400"></div>

              <p class="text-lg">Search settlements data</p>
            </div>

            <div class="flex items-center gap-3">
              <div
                class="bg-purple-50 border border-purple-100 rounded-md px-3 py-1 text-sm flex items-center gap-2"
              >
                <div class="w-2 h-2 rounded-full bg-purple-400"></div>
                2025...
              </div>

              <div
                class="bg-pink-50 border border-pink-100 rounded-md px-3 py-1 text-sm flex items-center gap-2"
              >
                <div class="w-2 h-2 rounded-full bg-pink-300"></div>
                Quidly...
              </div>
            </div>
          </div>

          <!-- Show More -->
          <button class="w-full text-left px-8 py-6 hover:bg-gray-50 transition">Show more</button>
        </div>
      </div>

      <!-- PROJECTS -->
      <div class="mt-10 border border-gray-200 rounded-2xl p-8">
        <h2 class="text-4xl font-semibold text-gray-600 mb-8">My recent projects</h2>

        <!-- Project -->
        <div
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

            <span class="text-lg"> 2026-General Tasks </span>
          </div>

          <!-- Users -->
          <div class="flex items-center -space-x-2">
            <div
              class="w-10 h-10 rounded-full bg-purple-200 border-2 border-white flex items-center justify-center text-sm text-gray-700"
            >
              TE
            </div>

            <div
              class="w-10 h-10 rounded-full bg-pink-200 border-2 border-white flex items-center justify-center text-sm text-gray-700"
            >
              lu
            </div>

            <div
              class="w-10 h-10 rounded-full bg-blue-200 border-2 border-white flex items-center justify-center text-sm text-gray-700"
            >
              JO
            </div>

            <button
              class="w-10 h-10 rounded-full border border-gray-300 bg-white flex items-center justify-center"
            >
              ...
            </button>
          </div>
        </div>
      </div>
    </section>
  </MainLayout>
</template>
