<script setup>
import { supabase } from '@/services/supabase'
import MainLayout from '@/layouts/full/MainLayout.vue'
import { ref, computed, onMounted, onBeforeUnmount, watch } from 'vue'
import apexchart from 'vue3-apexcharts'
import { useMonthDropdownStore } from '../stores/usemonthstores'
import { storeToRefs } from 'pinia'
import '@fortawesome/fontawesome-free/css/all.min.css'
import confetti from 'canvas-confetti'
import { useAuthStore } from '@/stores/auth'
import ApiService from '@/services/api'
import taskCard from '@/components/taskCard.vue'
import DashboardComment from '@/components/DashboardComment.vue'
import ActiveMembers from '@/components/ActiveMembers.vue'
import NewtaskTaskinProgress from '@/components/NewtaskTaskinProgress.vue'
import Overviewcard from '@/components/overviewcard.vue'

const showFilterModal = ref(false)

const openFilterModal = () => {
  showFilterModal.value = true
}

const closeFilterModal = () => {
  showFilterModal.value = false
}

const customers = ref([])

/* ---------------- MONTH DROPDOWN ---------------- */
const monthStore = useMonthDropdownStore()
const { open, selected, selectedLabel, months, dropdownWrapper } = storeToRefs(monthStore)
const { toggle, select } = monthStore

onMounted(() => monthStore.init())
onBeforeUnmount(() => monthStore.destroy())

/* ---------------- NEW TASKS ---------------- */
const newTasks = ref([])

const deleteNewTask = (index) => {
  newTasks.value.splice(index, 1)
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
  newTasks.value.splice(index, 1)
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

const authStore = useAuthStore()

const loading = ref(false)
const error = ref(null)
const dashboardData = ref(null)

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

// filter new/in-progress tasks
const mapNewTasks = (allTasks) => {
  return allTasks.filter(
    (task) => task.description === 'todo' || task.description === 'in_progress'
  )
}

const activeTasks = computed(() => {
  const projects = selectedTeam.value?.projects || []

  return projects
    .flatMap((p) => p.tasks || [])
    .filter((t) => t.status === 'todo' || t.status === 'in_progress')
})

const activeTasksCount = computed(() => activeTasks.value.length)

const selectedCategory = ref(null)

const categoryOptions = computed(() => {
  return (dashboardData.value?.teams || []).map((team) => ({
    title: team.name,
    value: team.id
  }))
})

watch(selectedCategory, (newTeamId) => {
  const team = (dashboardData.value?.teams || []).find((t) => t.id === newTeamId)

  if (!team) return

  const allTasks = mapTasks([team])

  tasks.value = allTasks
  newTasks.value = mapNewTasks(allTasks)
})

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
    console.log('dashboard response:', res)
    const data = extractDashboard(res)
    if (!data) throw new Error('Invalid dashboard response')

    dashboardData.value = data

    const teams = data.teams || []

    customers.value = mapCustomers(teams)

    const allTasks = mapTasks(teams)
    tasks.value = allTasks

    newTasks.value = mapNewTasks(allTasks)
    // projects.value = mapProjects(teams)
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
  if (dashboardData.value?.teams?.length) {
    selectedCategory.value = dashboardData.value.teams[0].id
  }
})

/* ---------------- COMPUTED ---------------- */
const projects = computed(() => {
  return selectedTeam.value?.projects || []
})
const mapProjects = (teams) => {
  return teams.flatMap((team) => team.projects || [])
}
const totalProjects = computed(() => {
  return selectedTeam.value?.projects?.length || 0
})
const selectedTeam = computed(() => {
  return (dashboardData.value?.teams || []).find((team) => team.id === selectedCategory.value)
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
    <div class="min-h-screen p-6 font-['DM_Sans',sans-serif]">
      <div class="grid grid-cols-1 xl:grid-cols-[1fr_320px] gap-5">
        <!-- LEFT COLUMN - Main Content -->
        <div class="flex flex-col gap-5">
          <!-- Overview Card -->
          <Overviewcard
            :loading="loading"
            :total-projects="totalProjects"
            :active-tasks-count="activeTasksCount"
          />

          <!-- Active Members -->
          <ActiveMembers
            :customers="customers"
            :dashboard-data="dashboardData"
            v-model:selected-category="selectedCategory"
          />

          <!-- Task Card -->
          <taskCard :tasks="tasks" :projects="projects" />
        </div>

        <!-- RIGHT COLUMN -->
        <div class="flex flex-col gap-5">
          <!-- NEW TASK / IN PROGRESS -->
          <newtask-taskin-progress
            :visible-new-tasks="visibleNewTasks"
            :dashboard-data="dashboardData"
            :selected-category="selectedCategory"
            @update:selected-category="selectedCategory = $event"
            @open-task="openTaskModal"
          />

          <!-- COMMENTS -->
          <dashboard-comment />
        </div>
      </div>
    </div>
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
