<script setup>
import { ref, computed, onMounted, onBeforeUnmount, watch } from 'vue'
import { useMonthDropdownStore } from '../stores/usemonthstores'
import { storeToRefs } from 'pinia'
import confetti from 'canvas-confetti'
import { useAuthStore } from '@/stores/auth'
import ApiService from '@/services/api'
import MainLayout from '@/layouts/full/MainLayout.vue'
import taskCard from '@/components/taskCard.vue'
import DashboardComment from '@/components/DashboardComment.vue'
import ActiveMembers from '@/components/ActiveMembers.vue'
import NewtaskTaskinProgress from '@/components/NewtaskTaskinProgress.vue'
import Overviewcard from '@/components/overviewcard.vue'
import TotalProjectActiveTask from '@/components/TotalProjectActiveTask.vue'

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

/* ---------------- TASKS & NEW TASKS ---------------- */
const tasks = ref([])
const newTasks = ref([])

const deleteNewTask = (index) => newTasks.value.splice(index, 1)

const toggleProgress = (task) => {
  task.inProgress = !task.inProgress
  task.showProgress = task.inProgress
}

const showModal = ref(false)
const selectedTask = ref(null)
const editableDescription = ref('')
const tagInput = ref('')

const openTaskModal = (task) => {
  showModal.value = true
  selectedTask.value = { name: task.name || task.title, description: task.description }
  editableDescription.value = task.description || ''
}

const submitTaskUpdate = () => {
  if (!selectedTask.value) return
  selectedTask.value.description = editableDescription.value
  console.log('Task update:', {
    name: selectedTask.value.name,
    description: editableDescription.value,
    tag: tagInput.value
  })
  showModal.value = false
  tagInput.value = ''
}

/* ---------------- VIEW TOGGLES ---------------- */
const isTeamLoading = ref(false)
const showAllTasks = ref(false)
const showAllNewTasks = ref(false)

const visibleNewTasks = computed(() => {
  if (!selectedCategory.value) return []

  return showAllNewTasks.value ? newTasks.value : newTasks.value.slice('')
})
const completeTask = (task, index) => {
  launchConfetti()
  tasks.value.unshift({
    title: task.name || task.title,
    description: task.description,
    avatar: task.avatar
  })
  newTasks.value.splice(index, 1)
}

/* ---------------- CONFETTI ---------------- */
const launchConfetti = () => {
  confetti({ particleCount: 60, spread: 70, origin: { y: 0.6 } })
  setTimeout(() => confetti({ particleCount: 40, spread: 100, origin: { y: 0.5 } }), 150)
}

/* ---------------- CHART ---------------- */
const chartSeries = ref([
  {
    name: 'Product Views',
    data: [
      { x: 'Mon', y: 820000 },
      { x: 'Tue', y: 1100000 },
      { x: 'Wed', y: 950000 },
      { x: 'Thu', y: 2200000 },
      { x: 'Fri', y: 1600000 },
      { x: 'Sat', y: 1300000 },
      { x: 'Sun', y: 1800000 }
    ]
  }
])

const chartOptions = ref({
  chart: { type: 'bar', toolbar: { show: false }, background: 'transparent' },
  plotOptions: { bar: { borderRadius: 10, columnWidth: '55%' } },
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

const loading = ref(true)
const error = ref(null)
const dashboardData = ref(null)
const selectedCategory = ref(null)

/* ---------------- MAPPING HELPERS (Updated for real data) ---------------- */
const mapCustomers = (teams) =>
  teams.flatMap((team) =>
    (team.members || []).map((member) => ({
      name: `${member.first_name} ${member.last_name}`,
      avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${member.first_name}`
    }))
  )

const mapTasks = (teams) =>
  teams.flatMap((team) =>
    (team.projects || []).flatMap((project) =>
      (project.tasks || []).map((task) => ({
        title: task.title,
        description: task.status,
        avatar: 'https://api.dicebear.com/7.x/initials/svg?seed=task',
        ...task
      }))
    )
  )

const mapNewTasks = (allTasks) => allTasks.filter((t) => ['todo', 'in_progress'].includes(t.status))

/* ---------------- COMPUTED ---------------- */
const selectedTeam = computed(() =>
  (dashboardData.value?.teams || []).find((team) => team.id === selectedCategory.value)
)

const filteredTasks = computed(() => {
  if (!selectedCategory.value) return []

  const team = dashboardData.value?.teams?.find(
    (t) => t.id === selectedCategory.value
  )

  if (!team) return []

  return (team.projects || []).flatMap((project) =>
    (project.tasks || []).map((task) => ({
      title: task.title,
      description: task.description || task.status,
      status: task.status,
      avatar: 'https://api.dicebear.com/7.x/initials/svg?seed=task',
      ...task
    }))
  )
})

const projects = computed(() => selectedTeam.value?.projects || [])
const totalProjects = computed(() => projects.value.length)

const activeTasks = computed(() =>
  projects.value
    .flatMap((p) => p.tasks || [])
    .filter((t) => ['todo', 'in_progress'].includes(t.status))
)

const activeTasksCount = computed(() => activeTasks.value.length)

const categoryOptions = computed(() =>
  (dashboardData.value?.teams || []).map((team) => ({ title: team.name, value: team.id }))
)

/* ---------------- WATCH: Load projects & stats when team changes ---------------- */
/* ---------------- WATCH: Load projects & stats when team changes ---------------- */
watch(selectedCategory, async (teamId) => {
  if (!teamId) {
    console.log('⚠️ No team selected — clearing tasks')

    // IMPORTANT: clear tasks when no team is selected
    tasks.value = []
    newTasks.value = []

    return
  }

  console.log(`🔄 Switching to team: ${teamId}`)

  isTeamLoading.value = true

  try {
    const userId = authStore.user?.id ?? authStore.session?.user?.id
    if (!userId) return

    const res = await ApiService.post('dashboard', {
      user_id: userId,
      team_id: teamId,
      include: ['projects', 'stats']
    })

    console.log(`📥 Projects/Stats for team ${teamId}:`, res)

    const extra = res?.data?.dashboard || res?.dashboard || res || {}

    if (dashboardData.value?.teams) {
      const teamIndex = dashboardData.value.teams.findIndex((t) => t.id === teamId)

      if (teamIndex !== -1) {
        const currentTeam = dashboardData.value.teams[teamIndex]

        currentTeam.projects = extra.projects || currentTeam.projects || []
        currentTeam.stats = extra.stats || currentTeam.stats || []

        console.log(
          '✅ Successfully updated team:',
          currentTeam.name,
          '- Projects:',
          currentTeam.projects?.length || 0
        )
      }
    }

    // ✅ ONLY map tasks for selected team (NOT all teams)
    const selectedTeam = dashboardData.value?.teams?.find((t) => t.id === teamId)

    const teamTasks = mapTasks(selectedTeam ? [selectedTeam] : [])

    tasks.value = teamTasks
    newTasks.value = mapNewTasks(teamTasks)

    console.log('📊 Team Tasks Loaded:', teamTasks.length)
    console.log('📊 Active Tasks:', newTasks.value.length)
    console.log('📊 Updated Total Projects:', totalProjects.value)
    console.log('📊 Updated Active Tasks:', activeTasksCount.value)
  } catch (err) {
    console.error('Failed to load team details:', err)
  } finally {
    isTeamLoading.value = false
  }
})
/* ---------------- FETCH DASHBOARD ---------------- */
const fetchDashboard = async () => {
  loading.value = true
  error.value = null

  try {
    const userId = authStore.user?.id ?? authStore.session?.user?.id
    if (!userId) throw new Error('User not authenticated')

    console.log('🚀 Fetching dashboard for user:', userId)

    const res = await ApiService.post('dashboard', {
      user_id: userId,
      include: ['teams', 'notifications']
    })

    console.log('📥 FULL RAW RESPONSE:', res)
    console.log('📦 Response Structure:', Object.keys(res?.data || res || {}))

    // Handle both possible structures
    let rawData = res?.data?.dashboard || res?.dashboard || res?.data || res || {}

    dashboardData.value = rawData

    const teams = rawData.teams || []
    console.log('👥 Teams loaded:', teams.length)
    console.log('📊 Global Stats:', rawData.stats)

    customers.value = mapCustomers(teams)

    const allTasks = mapTasks(teams)
    tasks.value = allTasks
    newTasks.value = mapNewTasks(allTasks)

    console.log('✅ Total Tasks:', allTasks.length)
    console.log('✅ New/In-progress Tasks:', newTasks.value.length)

    // // Auto-select first team
    // if (teams.length && !selectedCategory.value) {
    //   selectedCategory.value = teams[0].id
    //   console.log('🏷️ Auto-selected team:', teams[0].name)
    // }
  } catch (err) {
    console.error('❌ Dashboard fetch error:', err)
    error.value = err?.response?.data?.error || err.message || 'Failed to load dashboard'
  } finally {
    loading.value = false
  }
}

/* ---------------- LIFECYCLE ---------------- */
onMounted(async () => {
  await authStore.fetchSession()
  await fetchDashboard()
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
          <!-- overviewcard -->
          <Overviewcard
            :loading="loading || isTeamLoading"
            :total-projects="totalProjects"
            :active-tasks-count="activeTasksCount"
            :dashboard-data="dashboardData"
            v-model="selectedCategory"
          />
          <!-- Active Members -->
          <ActiveMembers
            :customers="customers"
            :dashboard-data="dashboardData"
            v-model:selected-category="selectedCategory"
          />

          <!-- Task Card -->
          <taskCard
            :tasks="filteredTasks"
            :projects="projects"
            :teams="dashboardData?.teams || []"
            v-model="selectedCategory"
          />
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
