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
// import FilterIcon from '@/components/filtericon.vue'

const showFilterModal = ref(false)

const toggleFilter = () => {
  showFilterModal.value = !showFilterModal.value
}
// const openFilterModal = () => {
//   showFilterModal.value = true
// }
// const closeFilterModal = () => {
//   showFilterModal.value = false
// }

// const customers = ref([])

/* ---------------- MONTH DROPDOWN ---------------- */
const monthStore = useMonthDropdownStore()
const { open, selected, selectedLabel, months, dropdownWrapper } = storeToRefs(monthStore)
const { toggle, select } = monthStore

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
// const showAllTasks = ref(false)
const showAllNewTasks = ref(false)

const visibleNewTasks = computed(() => {
  if (!selectedCategory.value) return []

  return showAllNewTasks.value ? newTasks.value : newTasks.value.slice(0, 5)
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

const teamComments = computed(() => selectedTeam.value?.comments || [])

const authStore = useAuthStore()

const loading = ref(true)
const error = ref(null)
const dashboardData = ref(null)
const selectedCategory = ref(null)

const onTeamLoaded = (data) => {
  const team = dashboardData.value.teams.find((t) => t.id === selectedCategory.value)

  if (!team) return

  team.projects = data.projects || []
  team.stats = data.stats || {}

  tasks.value = mapTasks([team])
  newTasks.value = mapNewTasks(tasks.value)
}

/* ---------------- MAPPING HELPERS (Updated for real data) ---------------- */
const mapCustomers = (teams) =>
  teams.flatMap((team) =>
    (team.members || []).map((member) => ({
      name: `${member.user?.first_name || ''} ${member.user?.last_name || ''}`,
      avatar:
        member.user?.avatar_url ||
        `https://api.dicebear.com/7.x/initials/svg?seed=${member.user?.first_name || 'user'}`,
      role: member.role
    }))
  )

const mapTasks = (teams) =>
  teams.flatMap((team) =>
    (team.projects || []).flatMap((project) =>
      (project.tasks || []).map((task) => ({
        title: task.title,
        description: task.description || task.status,
        avatar: 'https://api.dicebear.com/7.x/initials/svg?seed=task',
        project_id: project.id,
        project_name: project.name,
        ...task
      }))
    )
  )

const mapNewTasks = (allTasks) =>
  allTasks.filter((task) => ['todo', 'in_progress'].includes(task.status))

/* ---------------- COMPUTED ---------------- */
const selectedTeam = computed(() =>
  (dashboardData.value?.teams || []).find((team) => team.id === selectedCategory.value)
)

const filteredTasks = computed(() => {
  if (!selectedCategory.value) return []

  const team = dashboardData.value?.teams?.find((t) => t.id === selectedCategory.value)

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

// const activeTasks = computed(() =>
//   projects.value
//     .flatMap((p) => p.tasks || [])
//     .filter((t) => ['todo', 'in_progress'].includes(t.status))
// )

const activeTasksCount = computed(
  () =>
    projects.value
      .flatMap((p) => p.tasks || [])
      .filter((t) => ['todo', 'in_progress'].includes(t.status)).length
)

const customers = computed(() => {
  const team = dashboardData.value?.teams?.find(
    t => t.id === selectedCategory.value
  )

  return team ? mapCustomers([team]) : []
})

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

    const payload = {
      user_id: userId,
      team_id: teamId,
      include: ['projects', 'stats']
    }

    console.log('🚀 TEAM REQUEST:', payload)

    const res = await ApiService.post('dashboard', payload)

    logResponse(`Projects & Stats (${teamId})`, res)

    console.log(`📥 Projects/Stats for team ${teamId}:`, res)

    const extra = res?.data || res || {}
    console.log(extra)

    logResponse(`Team ${teamId} Response`, extra)

    if (dashboardData.value?.teams) {
      const teamIndex = dashboardData.value.teams.findIndex((t) => t.id === teamId)

      if (teamIndex !== -1) {
        const currentTeam = dashboardData.value.teams[teamIndex]

        const updatedTeam = {
          ...currentTeam,
          projects: extra.projects || [],
          stats: extra.stats || {}
        }

        dashboardData.value.teams.splice(teamIndex, 1, updatedTeam)

        // Show ONLY members of the selected team
        // customers.value = mapCustomers([teams])

        console.log(
          '✅ Successfully updated team:',
          dashboardData.value.teams[teamIndex].name,
          '- Projects:',
          dashboardData.value.teams[teamIndex].projects?.length || 0
        )
      }
    }

    // ✅ ONLY map tasks for selected team (NOT all teams)
    const selectedTeam = dashboardData.value?.teams?.find((t) => t.id === teamId)

    const teamTasks = mapTasks(selectedTeam ? [selectedTeam] : [])

    tasks.value = teamTasks
    newTasks.value = mapNewTasks(teamTasks)
  } catch (err) {
    console.error('❌ Failed to load team details:', err?.response?.data || err)
  } finally {
    isTeamLoading.value = false
  }
})



/* ---------------- FETCH DASHBOARD ---------------- */
const logResponse = (title, data) => {
  console.group(`📦 ${title}`)

  try {
    console.log(JSON.parse(JSON.stringify(data)))
  } catch {
    console.log(data)
  }

  console.groupEnd()
}
const fetchDashboard = async () => {
  loading.value = true
  error.value = null

  try {
    const userId = authStore.user?.id ?? authStore.session?.user?.id
    if (!userId) throw new Error('User not authenticated')

    console.log('🚀 Fetching dashboard for user:', userId)

    const payload = {
      user_id: userId,
      include: ['teams']
    }

    console.log('🚀 DASHBOARD REQUEST:', payload)

    const res = await ApiService.post('team-dashboard', payload)

    logResponse('Dashboard Response', res)

    // Handle both possible structures
    const rawData = res?.data || res || {}

    // logResponse('Parsed Dashboard Data', rawData)

    dashboardData.value = {
      teams: rawData.teams || [],
      stats: rawData.stats || {}
    }

    const teams = rawData.teams || []
    console.log('👥 Teams:', teams)

    teams.forEach((team) => {
      console.log(`🏢 Team: ${team.name}`)
      console.log('👤 Members:', team.members?.length || 0)
      console.log('💬 Comments:', team.comments?.length || 0)
    })
    console.log('👥 Teams loaded:', teams.length)
    console.log('📊 Global Stats:', rawData.stats)

    // customers.value = mapCustomers(teams)

    const allTasks = mapTasks(teams)
    tasks.value = allTasks
    newTasks.value = mapNewTasks(allTasks)

    const allProjects = teams.flatMap((team) => team.projects || [])

    console.group('📊 Dashboard Summary')

    console.log('👥 Active Members:', customers.value)
    console.log('📁 Projects:', allProjects)
    console.log('📁 Total Projects:', allProjects.length)
    console.log('📋 All Tasks:', tasks.value)
    console.log('🚀 Tasks In Progress:', newTasks.value)
    console.log(
      '✅ Active Tasks:',
      tasks.value.filter((task) => ['todo', 'in_progress'].includes(task.status))
    )

    console.groupEnd()

    // // Auto-select first team
    if (teams.length && !selectedCategory.value) {
      selectedCategory.value = teams[0].id

      console.log('🏷️ Auto-selected team:', teams[0].name, teams[0].id)
    }
  } catch (err) {
    console.error('❌ Dashboard fetch error:', err?.response?.data || err)
    error.value = err?.response?.data?.error || err.message || 'Failed to load dashboard'
  } finally {
    loading.value = false
  }
}

/* ---------------- LIFECYCLE ---------------- */
onMounted(async () => {
  monthStore.init()

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
    <div class="min-h-screen p-3 sm:p-4 md:p-6 font-['DM_Sans',sans-serif]">
      <div class="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_320px] gap-4 md:gap-5">
        <!-- LEFT COLUMN - Main Content -->
        <div class="flex flex-col gap-5">
          <!-- overviewcard -->
          <Overviewcard
            :loading="isTeamLoading"
            :total-projects="totalProjects"
            :active-tasks-count="activeTasksCount"
            v-model="selectedCategory"
            @team-loaded="onTeamLoaded"
          />
          <!-- Active Members -->
          <ActiveMembers
            :customers="customers"
            v-model="selectedCategory"
            @team-loaded="onTeamLoaded"
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
          <DashboardComment :comments="teamComments" />
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
