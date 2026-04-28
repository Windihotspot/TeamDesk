<script setup>
import { supabase } from '@/services/supabase'
import MainLayout from '@/layouts/full/MainLayout.vue'
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import apexchart from 'vue3-apexcharts'
import { useMonthDropdownStore } from '../stores/usemonthstores'
import { storeToRefs } from 'pinia'
import '@fortawesome/fontawesome-free/css/all.min.css'
import confetti from 'canvas-confetti'
import { useAuthStore } from '@/stores/auth'
import ApiService from '@/services/api'
import DepartmentSection from '@/components/DepartmentSection.vue'
import taskCard from '@/components/taskCard.vue'

/* ---------------- MONTH DROPDOWN ---------------- */
const monthStore = useMonthDropdownStore()
const { open, selected, selectedLabel, months, dropdownWrapper } = storeToRefs(monthStore)
const { toggle, select } = monthStore

onMounted(() => monthStore.init())
onBeforeUnmount(() => monthStore.destroy())

/* ---------------- CUSTOMERS ---------------- */
const customers = ref([])

const showMembersModal = ref(false)
const openMembersModal = () => {
  showMembersModal.value = true
}
const closeMembersModal = () => {
  showMembersModal.value = false
}
/* ---------------- NEW TASKS ---------------- */
const newTasks = ref([])

const deleteNewTask = (index) => {
  NewTasks.value.splice(index, 1)
}

const toggleProgress = (task) => {
  task.inProgress = !task.inProgress
  task.showProgress = task.inProgress
}

/* ---------------- TASKS ---------------- */

const tasks = ref([])

const showModal = ref(false)
const selectedTask = ref(null)
const editableDescription = ref('')
const tagInput = ref('')

const openTaskModal = (task) => {
  showModal.value = true

  selectedTask.value = {
    name: task.name || task.title,
    description: task.description
  }

  editableDescription.value = task.description
}

const submitTaskUpdate = () => {
  if (!selectedTask.value) return

  selectedTask.value.description = editableDescription.value

  console.log({
    name: selectedTask.value.name,
    description: editableDescription.value,
    tag: tagInput.value
  })

  // close + reset
  showModal.value = false
  tagInput.value = ''
}

/* ---------------- VIEW TOGGLES ---------------- */
const showAllTasks = ref(false)
const showAllNewTasks = ref(false)

const visibleTasks = computed(() => (showAllTasks.value ? tasks.value : tasks.value.slice(0, 5)))

const visibleNewTasks = computed(() =>
  showAllNewTasks.value ? newTasks.value : newTasks.value.slice(0, 3)
  
)
/* ---------------- COMMENTS ---------------- */
const comments = ref([
  {
    id: 1,
    author: 'ifiok Usanga',
    product: 'snr dev',
    time: '09:00 AM',
    text: '',
    avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Joyce'
  },
  {
    id: 2,
    author: 'Gladyce',
    product: 'Food App',
    time: '08:45 AM',
    text: 'Love the new update 🎉',
    avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Gladyce'
  }
])
// completed tasks
const completeTask = (task, index) => {
  // 🎉 trigger confetti
  launchConfetti()

  // ➕ add to ALL TASKS
  tasks.value.unshift({
    title: task.name,
    description: task.description,
    avatar: task.avatar
  })

  // ❌ remove from NEW TASKS
  NewTasks.value.splice(index, 1)
}

/* ---------------- CONFETTI (IMPROVED) ---------------- */
const launchConfetti = () => {
  // burst 1
  confetti({
    particleCount: 60,
    spread: 70,
    origin: { y: 0.6 }
  })

  // burst 2 (slight delay for better effect)
  setTimeout(() => {
    confetti({
      particleCount: 40,
      spread: 100,
      origin: { y: 0.5 }
    })
  }, 150)
}
/* ---------------- CHART ---------------- */
const chartSeries = ref([
  {
    name: 'Product Views',
    data: [
      { x: 'Mon', y: 820000, fillColor: '#e5e7eb' },
      { x: 'Tue', y: 1100000, fillColor: '#e5e7eb' },
      { x: 'Wed', y: 950000, fillColor: '#e5e7eb' },
      { x: 'Thu', y: 2200000, fillColor: '#22c55e' },
      { x: 'Fri', y: 1600000, fillColor: '#e5e7eb' },
      { x: 'Sat', y: 1300000, fillColor: '#e5e7eb' },
      { x: 'Sun', y: 1800000, fillColor: '#e5e7eb' }
    ]
  }
])

const chartOptions = ref({
  chart: {
    type: 'bar',
    toolbar: { show: false },
    fontFamily: 'DM Sans, sans-serif',
    background: 'transparent'
  },
  plotOptions: {
    bar: {
      borderRadius: 10,
      columnWidth: '55%'
    }
  },
  dataLabels: { enabled: false },
  grid: { show: false },
  xaxis: {
    categories: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    axisBorder: { show: false },
    axisTicks: { show: false }
  },
  yaxis: { show: false }
})
// const dashboardData = ref(null)
// const loading = ref(false)

const authStore = useAuthStore()

const loading = ref(false)
const error = ref(null)
const dashboardData = ref(null)

// 🔥 Fetch dashboard
/* ---------------- HELPERS ---------------- */

// extract dashboard safely
const extractDashboard = (res) => {
  return res?.data?.dashboard || res?.dashboard || null
}

// map members → customers
const mapCustomers = (teams) => {
  return teams.flatMap((team) =>
    (team.members || []).map((member) => ({
      name: `${member.first_name} ${member.last_name}`,
      avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${member.first_name}`
    }))
  )
}

// map projects → tasks
const mapTasks = (teams) => {
  return teams.flatMap((team) =>
    (team.projects || []).flatMap((project) =>
      (project.tasks || []).map((task) => ({
        title: task.title,
        description: task.status,
        avatar: 'https://api.dicebear.com/7.x/initials/svg?seed=task'
      }))
    )
  )
}

const projects = ref([])

const mapProjects = (teams) => {
  return teams.flatMap((team) =>
    (team.projects || []).map((project) => ({
      name: project.name,
      id: project.id,
      status: project.status
    }))
  )
}

// filter new/in-progress tasks
const mapNewTasks = (allTasks) => {
  return allTasks.filter(
    (task) => task.description === 'todo' || task.description === 'in_progress'
  )
}

/* ---------------- FETCH ---------------- */

const fetchDashboard = async () => {
  loading.value = true
  error.value = null

  try {
    const userId = authStore.user?.id ?? authStore.session?.user?.id

    if (!userId) throw new Error('User not authenticated')

    const res = await ApiService.post('dashboard', {
      user_id: userId
    })

    console.log(res)
    const data = extractDashboard(res)
    if (!data) throw new Error('Invalid dashboard response')

    dashboardData.value = data

    const teams = data.teams || []

    customers.value = mapCustomers(teams)

    const allTasks = mapTasks(teams)
    tasks.value = allTasks

    NewTasks.value = mapNewTasks(allTasks)
    projects.value = mapProjects(teams)
    console.log(projects.value)
  } catch (err) {
    error.value = err?.response?.data?.error || err.message || 'Failed to load dashboard'
  } finally {
    loading.value = false
  }
}

/* ---------------- LIFECYCLE ---------------- */

onMounted(async () => {
  await authStore.fetchSession()
  await fetchDashboard()
   setTimeout(() => {
    tasks.value = ['Task 1', 'Task 2']
    loading.value = false
  }, 2000)
})

/* ---------------- COMPUTED ---------------- */

const totalProjects = computed(() => {
  return dashboardData.value?.stats?.total_projects || 0
})
</script>

<style>
@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap');

/* Subtle hover lift on product rows */
.group:hover img {
  transform: scale(1.05);
  transition: transform 0.2s ease;
}

/* Smooth transitions globally */
* {
  transition-property: background-color, border-color, color, opacity, box-shadow, transform;
  transition-duration: 150ms;
  transition-timing-function: ease;
}
</style>

<template>
  <main-layout>
    <div class="min-h-screen bg-[#f5f5f0] p-6 font-['DM_Sans',sans-serif]">
      <div class="grid grid-cols-1 xl:grid-cols-[1fr_320px] gap-5">
        
        <!-- LEFT COLUMN - Main Content -->
        <div class="flex flex-col gap-5">
          <!-- Overview Card -->

          <div class="bg-white rounded-2xl p-6 shadow-sm">
          <div>
    <div v-if="loading" class="flex justify-center py-6">
      <v-progress-circular indeterminate size="40" />
    </div>
  </div>
            <div class="flex items-center justify-between mb-4">
            <h2 class="text-lg font-semibold text-gray-800 mb-4">overview card</h2>
            <v-select
      v-model="selectedCategory"
      :items="categoryOptions"
      label="Category"
      variant="outlined"
      density="compact"
      hide-details
      rounded="lg"
      class="ml-4"
      style="max-width: 180px"
      bg-color="white"
    />
    </div>
            <!-- ... your overview content ... -->
            <div class="grid grid-cols-2 gap-8">
              <!-- Total Projects -->
              <div>
                <div class="flex items-center gap-2 text-gray-500 text-sm mb-1">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                          d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  <span>Total projects</span>
                </div>
                <div class="flex items-end gap-3">
                  <span class="text-4xl font-bold text-gray-900">{{ totalProjects }}</span>
                  <div class="flex items-center gap-1 bg-red-50 text-red-500 text-xs px-2 py-0.5 rounded-full mb-1">
                    36.8%
                  </div>
                </div>
              </div>

              <!-- Active Tasks -->
              <div>
                <div class="flex items-center gap-2 text-gray-500 text-sm mb-1">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                          d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                  </svg>
                  <span>Active tasks</span>
                </div>
                <div class="flex items-end gap-3">
                  <span class="text-4xl font-bold text-gray-900">4</span>
                  <div class="flex items-center gap-1 bg-green-50 text-green-600 text-xs px-2 py-0.5 rounded-full mb-1">
                    36.8%
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Active Members -->
          <div class="bg-white rounded-2xl p-8 shadow-sm">
            <!-- ... your active members content ... -->
             <h3 class="text-base font-semibold text-gray-800 mb-4">Active Members</h3>

            <div class="flex items-center gap-5">
              <div
                v-for="customer in customers"
                :key="customer.name"
                class="flex flex-col items-center gap-2"
              >
                <img
                  :src="customer.avatar"
                  :alt="customer.name"
                  class="w-12 h-12 rounded-full object-cover ring-2 ring-white shadow-md"
                />
                <span class="text-xs text-gray-500">
                  {{ customer.name }}
                </span>
              </div>

              <div class="flex flex-col items-center gap-2">
                <button
                  @click="openMembersModal"
                  class="w-12 h-12 rounded-full border-2 border-dashed border-gray-200 flex items-center justify-center hover:border-gray-400 hover:bg-gray-50"
                >
                  <svg
                    class="w-4 h-4 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </button>
                <span class="text-xs text-gray-500">View all</span>
              </div>
            </div>
            <div
              v-if="showMembersModal"
              class="fixed inset-0 bg-black/40 flex items-center justify-center z-50"
            >
              <div class="bg-white w-[90%] max-w-md rounded-2xl p-5 shadow-lg">
                <!-- Header -->
                <div class="flex justify-between items-center mb-4">
                   <div class="flex items-center justify-between mb-4">
                  <h3 class="text-sm font-semibold text-gray-800">
                    Active Members ({{ customers.length }})
                  </h3>
                   <v-select
      v-model="selectedCategory"
      :items="categoryOptions"
      label="Category"
      variant="outlined"
      density="compact"
      hide-details
      rounded="lg"
      class="ml-4"
      style="min-width: 160px; max-width: 200px"
      bg-color="white"
    />
    </div>

                  <button @click="closeMembersModal">
                    <i class="fas fa-times text-gray-400 hover:text-red-500"></i>
                  </button>
                </div>

                <!-- Members List -->
                <div class="flex flex-col gap-3 max-h-[400px] overflow-y-auto">
                  <div
                    v-for="member in customers"
                    :key="member.name"
                    class="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg"
                  >
                    <img :src="member.avatar" class="w-10 h-10 rounded-full object-cover" />

                    <span class="text-sm text-gray-700">
                      {{ member.name }}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Task Card -->
          <taskCard />
        </div>

        <!-- RIGHT COLUMN - Sidebar (New Tasks + Comments) -->
        <div class="flex flex-col gap-5">
          <!-- NEW TASK / IN PROGRESS -->
          <div class="bg-white rounded-2xl p-6 shadow-sm">
             <div class="flex items-center justify-between mb-4">
            <h2 class="text-lg font-semibold text-gray-800 text-center mb-4">
              Task in progress
            </h2>
            <v-select
      v-model="selectedCategory"
      :items="categoryOptions"
      label="Category"
      variant="outlined"
      density="compact"
      hide-details
      rounded="lg"
      class="ml-4"
      style="min-width: 160px; max-width: 200px"
      bg-color="white"
    />
            </div>

            <ul class="flex flex-col gap-2">
              <li
                v-for="(task, index) in visibleNewTasks"
                :key="index"
                class="border-b pb-2 flex gap-2 items-start justify-between"
              >
                <div class="flex gap-2 flex-1">
                  <img :src="task.avatar" class="w-6 h-6 rounded-full mt-1" />
                  <details class="flex-1 cursor-pointer">
                    <summary class="text-xs text-gray-700 flex items-center justify-between">
                      <span>{{ task.name }}</span>
                      <button
                        @click.stop="openTaskModal(task)"
                        class="text-gray-400 hover:text-blue-500"
                      >
                        <i class="fas fa-eye text-xs"></i>
                      </button>
                    </summary>
                    <p class="text-xs text-gray-600 mt-1">{{ task.description }}</p>
                  </details>
                </div>
              </li>
            </ul>

            <button
              @click="showAllNewTasks = !showAllNewTasks"
              class="mt-3 text-xs text-blue-600 hover:underline"
            >
              {{ showAllNewTasks ? 'Show Less' : 'See More' }}
            </button>
          </div>

          <!-- COMMENTS -->
          <div class="bg-white rounded-2xl p-6 shadow-sm">
            <h2 class="text-lg font-semibold text-gray-800 mb-4">Comments</h2>
            <div class="flex flex-col gap-4">
              <div v-for="comment in comments" :key="comment.id" class="flex gap-3">
                <img :src="comment.avatar" class="w-9 h-9 rounded-full object-cover" />
                <div>
                  <div class="flex gap-2">
                    <span class="text-sm font-semibold">{{ comment.author }}</span>
                    <span class="text-xs text-gray-400">on</span>
                    <span class="text-xs text-gray-600">{{ comment.product }}</span>
                  </div>
                  <p class="text-xs text-gray-400">{{ comment.time }}</p>
                  <p class="text-sm text-gray-600">{{ comment.text }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- TASK MODAL -->
      <div v-if="showModal" class="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
        <div class="bg-white w-[90%] max-w-md rounded-2xl p-5 shadow-lg">
          <div class="flex justify-between items-center mb-3">
            <h3 class="text-sm font-semibold text-gray-800">{{ selectedTask?.name }}</h3>
            <button @click="showModal = false">
              <i class="fas fa-times text-gray-400 hover:text-red-500"></i>
            </button>
          </div>

          <label class="text-xs text-gray-500">Description</label>
          <textarea
            v-model="editableDescription"
            class="w-full mt-1 p-2 border rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-400"
            rows="3"
          ></textarea>

          <label class="text-xs text-gray-500 mt-3 block">Tag / Assign</label>
          <input
            v-model="tagInput"
            type="text"
            placeholder="Enter email or name"
            class="w-full mt-1 p-2 border rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-400"
          />

          <button
            @click="submitTaskUpdate"
            class="w-full mt-4 bg-blue-600 text-white text-sm py-2 rounded-lg hover:bg-blue-700"
          >
            Submit
          </button>
        </div>
      </div>
    </div>
  </main-layout>
</template>