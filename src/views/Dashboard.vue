<<<<<<< HEAD
<template>
  <main-layout>
    <div class="min-h-screen bg-[#f5f5f0] p-6 font-['DM_Sans',sans-serif]">
      <!-- Google Font Import via style -->
=======
<script setup>
import MainLayout from '@/layouts/full/MainLayout.vue'
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import apexchart from 'vue3-apexcharts'
import { useMonthDropdownStore } from '../stores/usemonthstores'
import { storeToRefs } from 'pinia'
import '@fortawesome/fontawesome-free/css/all.min.css'
import confetti from 'canvas-confetti'

/* ---------------- MONTH DROPDOWN ---------------- */
const monthStore = useMonthDropdownStore()
const { open, selected, selectedLabel, months, dropdownWrapper } = storeToRefs(monthStore)
const { toggle, select } = monthStore

onMounted(() => monthStore.init())
onBeforeUnmount(() => monthStore.destroy())

/* ---------------- CUSTOMERS ---------------- */
const customers = ref([
  {
    name: 'ifiok usanga',
    avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Gladyce&backgroundColor=ffd5dc'
  },
  {
    name: 'olaiya Everjoy',
    avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Elbert&backgroundColor=c0aede'
  },
  {
    name: 'Olufemi Emmanuel ',
    avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Dash&backgroundColor=b6e3f4'
  },
  {
    name: 'Ojedele Emmanuel ',
    avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Joyce&backgroundColor=ffdfbf'
  },
  {
    name: 'Ejobu Emmanuel ',
    avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Marina&backgroundColor=d1f4d1'
  }
])

/* ---------------- NEW TASKS ---------------- */
const NewTasks = ref([
  {
    name: 'everjoy',
    description: 'Understand async/await',
    avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Task1',
    inProgress: false,
    showProgress: false
  },
  {
    name: 'dimeji',
    description: 'Sign up and login team members onto Teamdesk APIs',
    avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Task2',
    inProgress: false,
    showProgress: false
  },
  {
    name: 'emmanuel',
    description: 'Create dashboard summary cards using dummy data',
    avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Task3',
    inProgress: false,
    showProgress: false
  },
  {
    name: 'ojedele',
    description: 'Create a new ionic vue mobile app project',
    avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Task4',
    inProgress: false,
    showProgress: false
  }
])

const deleteNewTask = (index) => {
  NewTasks.value.splice(index, 1)
}

const toggleProgress = (task) => {
  task.inProgress = !task.inProgress
  task.showProgress = task.inProgress
}

/* ---------------- TASKS ---------------- */
const tasks = ref([
  {
    title: 'Collaborate in building the Fee calculator',
    description: 'Work on Quidly landing page calculator',
    avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Task1'
  },
  {
    title: 'Create homepage with navbar and footer',
    description: 'Using Vue.js',
    avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Task2'
  },
  {
    title: 'Improve mobile responsiveness',
    description: 'Optimize Quidly landing page',
    avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Task3'
  },
  {
    title: 'Learn TypeScript basics',
    description: 'From Vanilla JS → TS',
    avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Task4'
  },
  {
    title: 'Collaborate in building the Fee calculator',
    description: 'Work on Quidly landing page calculator',
    avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Task1'
  },
  {
    title: 'Create homepage with navbar and footer',
    description: 'Using Vue.js',
    avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Task2'
  },
  {
    title: 'Improve mobile responsiveness',
    description: 'Optimize Quidly landing page',
    avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Task3'
  },
  {
    title: 'Learn TypeScript basics',
    description: 'From Vanilla JS → TS',
    avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Task4'
  }
])

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
  showAllNewTasks.value ? NewTasks.value : NewTasks.value.slice(0, 3)
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
>>>>>>> 3623b08aae478adb4e138207574e23e743b4e369
      <div class="grid grid-cols-1 xl:grid-cols-[1fr_320px] gap-5">
        <!-- LEFT COLUMN -->
        <div class="flex flex-col gap-5">
          <!-- Overview Card -->
          <div class="bg-white rounded-2xl p-6 shadow-sm">
            <div class="flex items-center justify-between mb-6">
              <h2 class="text-lg font-semibold text-gray-800">Overview</h2>
<<<<<<< HEAD
              <div
                class="flex items-center gap-2 border border-gray-200 rounded-xl px-3 py-1.5 text-sm text-gray-600 cursor-pointer hover:bg-gray-50 transition-colors"
              >
                <span>Last month</span>
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </div>
            </div>

            <div class="grid grid-cols-2 gap-8">
              <!-- Customers -->
=======
            </div>

            <div class="grid grid-cols-2 gap-8">
              <!-- Total Projects -->
>>>>>>> 3623b08aae478adb4e138207574e23e743b4e369
              <div>
                <div class="flex items-center gap-2 text-gray-500 text-sm mb-1">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                  <span>Total projects</span>
                </div>
                <div class="flex items-end gap-3">
<<<<<<< HEAD
                  <span class="text-4xl font-bold text-gray-900 tracking-tight">50</span>
                  <div
                    class="flex items-center gap-1 bg-red-50 text-red-500 text-xs font-medium px-2 py-0.5 rounded-full mb-1"
                  >
                    <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2.5"
                        d="M5 15l7-7 7 7"
                      />
                    </svg>
                    36.8%
                  </div>
                </div>
                <p class="text-xs text-gray-400 mt-1">vs last month</p>
              </div>

              <!-- Balance -->
=======
                  <span class="text-4xl font-bold text-gray-900">12</span>
                  <div
                    class="flex items-center gap-1 bg-red-50 text-red-500 text-xs px-2 py-0.5 rounded-full mb-1"
                  >
                    36.8%
                  </div>
                </div>
              </div>

              <!-- Active Tasks -->
>>>>>>> 3623b08aae478adb4e138207574e23e743b4e369
              <div>
                <div class="flex items-center gap-2 text-gray-500 text-sm mb-1">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                    />
                  </svg>
                  <span>Active tasks</span>
                </div>
                <div class="flex items-end gap-3">
<<<<<<< HEAD
                  <span class="text-4xl font-bold text-gray-900 tracking-tight">20</span>
                  <div
                    class="flex items-center gap-1 bg-green-50 text-green-600 text-xs font-medium px-2 py-0.5 rounded-full mb-1"
                  >
                    <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2.5"
                        d="M5 15l7-7 7 7"
                      />
                    </svg>
                    36.8%
                  </div>
                </div>
                <p class="text-xs text-gray-400 mt-1">vs last month</p>
=======
                  <span class="text-4xl font-bold text-gray-900">4</span>
                  <div
                    class="flex items-center gap-1 bg-green-50 text-green-600 text-xs px-2 py-0.5 rounded-full mb-1"
                  >
                    36.8%
                  </div>
                </div>
>>>>>>> 3623b08aae478adb4e138207574e23e743b4e369
              </div>
            </div>
          </div>

<<<<<<< HEAD
          <!-- New Customers Card -->
          <div class="bg-white rounded-2xl p-6 shadow-sm">
            <h3 class="text-base font-semibold text-gray-800">857 new customers today!</h3>
            <p class="text-sm text-gray-400 mt-0.5 mb-5">
              Send a welcome message to all new customers.
            </p>
=======
          <!-- Active Members -->
          <div class="bg-white rounded-2xl p-6 shadow-sm">
            <h3 class="text-base font-semibold text-gray-800 mb-4">10 active members</h3>
>>>>>>> 3623b08aae478adb4e138207574e23e743b4e369

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
<<<<<<< HEAD
                <span class="text-xs text-gray-500">{{ customer.name }}</span>
              </div>

              <!-- View all button -->
              <div class="flex flex-col items-center gap-2">
                <button
                  class="w-12 h-12 rounded-full border-2 border-dashed border-gray-200 flex items-center justify-center hover:border-gray-400 hover:bg-gray-50 transition-all"
=======
                <span class="text-xs text-gray-500">
                  {{ customer.name }}
                </span>
              </div>

              <div class="flex flex-col items-center gap-2">
                <button
                  class="w-12 h-12 rounded-full border-2 border-dashed border-gray-200 flex items-center justify-center hover:border-gray-400 hover:bg-gray-50"
>>>>>>> 3623b08aae478adb4e138207574e23e743b4e369
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
          </div>

<<<<<<< HEAD
          <!-- Product View Chart -->
          <div class="bg-white rounded-2xl p-6 shadow-sm">
            <div class="flex items-center justify-between mb-2">
              <h2 class="text-lg font-semibold text-gray-800">Product view</h2>
              <div
                class="flex items-center gap-2 border border-gray-200 rounded-xl px-3 py-1.5 text-sm text-gray-600 cursor-pointer hover:bg-gray-50 transition-colors"
              >
                <span>Last 7 days</span>
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </div>
            </div>

            <div class="relative">
              <div
                class="absolute bottom-6 left-0 text-3xl font-bold text-gray-200 select-none z-0"
              >
                $10.2m
              </div>
              <apexchart
                type="bar"
                height="220"
                :options="chartOptions"
                :series="chartSeries"
                class="relative z-10"
              />
=======
          <!-- Task Chart -->
          <div class="bg-white rounded-2xl p-6 shadow-sm">
            <div class="flex flex-col gap-4">
              <!-- Header -->
              <h2 class="text-lg font-semibold text-gray-800">All Tasks</h2>

              <!-- Task List -->
              <ul class="flex flex-col gap-3">
                <li v-for="task in visibleTasks" :key="task.title" class="border-b pb-2 flex gap-3">
                  <!-- Task Avatar -->
                  <img
                    :src="task.avatar"
                    :alt="task.title"
                    class="w-10 h-10 rounded-full object-cover flex-shrink-0"
                  />

                  <!-- Task Content -->
                  <details class="cursor-pointer flex-1">
                    <summary class="text-sm text-gray-700 truncate">
                      {{ task.title }}
                      <button
                        @click.stop="openTaskModal(task)"
                        class="text-gray-400 hover:text-blue-500 ml-2"
                      >
                        <i class="fas fa-eye text-xs"></i>
                      </button>
                    </summary>
                    <p class="mt-2 text-sm text-gray-600">
                      {{ task.description }}
                    </p>
                  </details>
                </li>
              </ul>
              <button
                @click="showAllTasks = !showAllTasks"
                class="mt-3 text-xs text-blue-600 hover:underline self-start"
              >
                {{ showAllTasks ? 'Show Less' : 'See More' }}
              </button>
>>>>>>> 3623b08aae478adb4e138207574e23e743b4e369
            </div>
          </div>
        </div>

        <!-- RIGHT COLUMN -->
        <div class="flex flex-col gap-5">
<<<<<<< HEAD
          <!-- Popular Products -->
          <div class="bg-white rounded-2xl p-6 shadow-sm">
            <h2 class="text-lg font-semibold text-gray-800 mb-4">Popular products</h2>

            <div class="flex flex-col gap-3">
              <div
                v-for="product in products"
                :key="product.name"
                class="flex items-center gap-3 group"
              >
                <img
                  :src="product.image"
                  :alt="product.name"
                  class="w-12 h-12 rounded-xl object-cover flex-shrink-0"
                />
                <div class="flex-1 min-w-0">
                  <p class="text-sm font-medium text-gray-800 truncate">{{ product.name }}</p>
                  <span
                    :class="[
                      'text-xs font-medium px-2 py-0.5 rounded-full',
                      product.status === 'Active'
                        ? 'bg-green-50 text-green-600'
                        : 'bg-red-50 text-red-500'
                    ]"
                    >{{ product.status }}</span
                  >
                </div>
                <div class="text-sm font-semibold text-gray-800 text-right flex-shrink-0">
                  {{ product.price }}
                </div>
              </div>
            </div>

            <button
              class="w-full mt-5 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-600 font-medium hover:bg-gray-50 transition-colors"
            >
              All products
            </button>
          </div>

          <!-- Comments -->
=======
          <!-- NEW TASK -->
          <div class="bg-white rounded-2xl p-6 shadow-sm">
            <h2 class="text-lg font-semibold text-gray-800 text-center mb-4">
              New/Task in progress
            </h2>

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
                        class="text-gray-400 hover:text-blue-500 transition"
                        title="View task"
                      >
                        <i class="fas fa-eye text-xs"></i>
                      </button>
                    </summary>

                    <p class="text-xs text-gray-600 mt-1">
                      {{ task.description }}
                    </p>
                  </details>
                </div>
              </li>
            </ul>

            <!-- BUTTON -->
            <button
              @click="showAllNewTasks = !showAllNewTasks"
              class="mt-3 text-xs text-blue-600 hover:underline"
            >
              {{ showAllNewTasks ? 'Show Less' : 'See More' }}
            </button>
          </div>

          <!-- COMMENTS -->
>>>>>>> 3623b08aae478adb4e138207574e23e743b4e369
          <div class="bg-white rounded-2xl p-6 shadow-sm">
            <h2 class="text-lg font-semibold text-gray-800 mb-4">Comments</h2>

            <div class="flex flex-col gap-4">
              <div v-for="comment in comments" :key="comment.id" class="flex gap-3">
<<<<<<< HEAD
                <img
                  :src="comment.avatar"
                  :alt="comment.author"
                  class="w-9 h-9 rounded-full object-cover flex-shrink-0 mt-0.5"
                />
                <div>
                  <div class="flex items-baseline gap-2">
                    <span class="text-sm font-semibold text-gray-800">{{ comment.author }}</span>
                    <span class="text-xs text-gray-400">on</span>
                    <span class="text-xs font-medium text-gray-600">{{ comment.product }}</span>
                  </div>
                  <p class="text-xs text-gray-400 mt-0.5 mb-1">{{ comment.time }}</p>
                  <p class="text-sm text-gray-600 leading-relaxed">{{ comment.text }}</p>
=======
                <img :src="comment.avatar" class="w-9 h-9 rounded-full object-cover" />

                <div>
                  <div class="flex gap-2">
                    <span class="text-sm font-semibold">
                      {{ comment.author }}
                    </span>
                    <span class="text-xs text-gray-400">on</span>
                    <span class="text-xs text-gray-600">
                      {{ comment.product }}
                    </span>
                  </div>

                  <p class="text-xs text-gray-400">
                    {{ comment.time }}
                  </p>

                  <p class="text-sm text-gray-600">
                    {{ comment.text }}
                  </p>
>>>>>>> 3623b08aae478adb4e138207574e23e743b4e369
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
<<<<<<< HEAD
  </main-layout>
</template>

<script setup>
import MainLayout from '@/layouts/full/MainLayout.vue'
import { ref } from 'vue'
import apexchart from 'vue3-apexcharts'

// --- Customers ---
const customers = ref([
  {
    name: 'Gladyce',
    avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Gladyce&backgroundColor=ffd5dc'
  },
  {
    name: 'Elbert',
    avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Elbert&backgroundColor=c0aede'
  },
  {
    name: 'Dash',
    avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Dash&backgroundColor=b6e3f4'
  },
  {
    name: 'Joyce',
    avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Joyce&backgroundColor=ffdfbf'
  },
  {
    name: 'Marina',
    avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Marina&backgroundColor=d1f4d1'
  }
])

// --- Products ---
const products = ref([
  {
    name: 'Crypter - NFT UI Kit',
    price: '$3,250.00',
    status: 'Active',
    image: 'https://images.unsplash.com/photo-1639762681057-408e52192e55?w=100&h=100&fit=crop'
  },
  {
    name: 'Bento Pro 2.0 Illustrations',
    price: '$7,890.00',
    status: 'Active',
    image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=100&h=100&fit=crop'
  },
  {
    name: 'Fleet - travel shopping kit',
    price: '$1,500.00',
    status: 'Offline',
    image: 'https://images.unsplash.com/photo-1553361371-9b22f78e8b1d?w=100&h=100&fit=crop'
  },
  {
    name: 'SimpleSocial UI Design Kit',
    price: '$9,999.99',
    status: 'Active',
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=100&h=100&fit=crop'
  },
  {
    name: 'Bento Pro vol. 2',
    price: '$4,750.00',
    status: 'Active',
    image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=100&h=100&fit=crop'
  }
])

// --- Comments ---
const comments = ref([
  {
    id: 1,
    author: 'Joyce',
    product: 'Bento Pro 2.0',
    time: '09:00 AM',
    text: 'Great work! When HTML version will be available? ⚡',
    avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Joyce&backgroundColor=ffdfbf'
  },
  {
    id: 2,
    author: 'Gladyce',
    product: 'Food Delivery App',
    time: '08:45 AM',
    text: 'Love the new update, the UI feels so smooth now. Keep it up! 🎉',
    avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Gladyce&backgroundColor=ffd5dc'
  },
  {
    id: 3,
    author: 'Elbert',
    product: 'Crypter NFT Kit',
    time: '08:12 AM',
    text: 'Can you add a dark mode version? Would love to see that. 🌙',
    avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Elbert&backgroundColor=c0aede'
  }
])

// --- Chart ---
const chartSeries = ref([
  {
    name: 'Product Views',
    data: [820000, 1100000, 950000, 2200000, 1600000, 1300000, 1800000]
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
      columnWidth: '55%',
      colors: {
        ranges: [{ from: 0, to: 9999999, color: '#e5e7eb' }]
      }
    }
  },
  colors: ['#e5e7eb'],
  dataLabels: { enabled: false },
  grid: {
    show: false
  },
  xaxis: {
    categories: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    axisBorder: { show: false },
    axisTicks: { show: false },
    labels: {
      style: { colors: '#9ca3af', fontSize: '12px' }
    }
  },
  yaxis: { show: false },
  tooltip: {
    style: { fontFamily: 'DM Sans, sans-serif' },
    y: {
      formatter: (val) => `${(val / 1000000).toFixed(1)}m views`
    }
  },
  states: {
    hover: {
      filter: { type: 'none' }
    },
    active: {
      filter: { type: 'none' }
    }
  },
  fill: {
    type: 'solid',
    colors: ['#e5e7eb']
  }
  // Highlight Thursday (index 3) as the active/green bar
  // We override by using a custom series with per-point color
})

// Override bar colors manually so Thursday is green
chartSeries.value = [
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
]

// Update chart options to not override per-point colors
chartOptions.value = {
  ...chartOptions.value,
  colors: undefined,
  fill: undefined,
  tooltip: {
    ...chartOptions.value.tooltip,
    custom: ({ series, seriesIndex, dataPointIndex, w }) => {
      if (dataPointIndex === 3) {
        const val = series[seriesIndex][dataPointIndex]
        return `<div style="background:#1f2937;color:#fff;padding:6px 12px;border-radius:8px;font-size:12px;font-family:DM Sans,sans-serif;">
          <strong>${(val / 1000000).toFixed(1)}m</strong>
        </div>`
      }
      return ''
    }
  }
}
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
=======
    <div v-if="showModal" class="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div class="bg-white w-[90%] max-w-md rounded-2xl p-5 shadow-lg">
        <!-- HEADER -->
        <div class="flex justify-between items-center mb-3">
          <h3 class="text-sm font-semibold text-gray-800">
            {{ selectedTask?.name }}
          </h3>

          <button @click="showModal = false">
            <i class="fas fa-times text-gray-400 hover:text-red-500"></i>
          </button>
        </div>

        <!-- DESCRIPTION INPUT -->
        <label class="text-xs text-gray-500">Description</label>
        <textarea
          v-model="editableDescription"
          class="w-full mt-1 p-2 border rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-400"
          rows="3"
        ></textarea>

        <!-- TAG / EMAIL INPUT -->
        <label class="text-xs text-gray-500 mt-3 block"> Tag / Assign </label>
        <input
          v-model="tagInput"
          type="text"
          placeholder="Enter email or name"
          class="w-full mt-1 p-2 border rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-400"
        />

        <!-- SUBMIT -->
        <button
          @click="submitTaskUpdate"
          class="w-full mt-4 bg-blue-600 text-white text-sm py-2 rounded-lg hover:bg-blue-700"
        >
          Submit
        </button>
      </div>
    </div>
  </main-layout>
</template>
>>>>>>> 3623b08aae478adb4e138207574e23e743b4e369
