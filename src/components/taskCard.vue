<script setup>
import { ref, computed, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import ApiService from '@/services/api'

/* ---------------- STATE ---------------- */
const tasks = ref([])
const projects = ref([])
const showAllTasks = ref(false)

const showModal = ref(false)
const selectedTask = ref(null)
const editableDescription = ref('')

/* ---------------- TASK MODAL ---------------- */
const openTaskModal = (task) => {
  showModal.value = true

  selectedTask.value = {
    name: task.title,
    description: task.description
  }

  editableDescription.value = task.description
}

/* ---------------- COMPUTED ---------------- */
const visibleTasks = computed(() => {
  return showAllTasks.value
    ? tasks.value
    : tasks.value.slice(0, 5)
})

/* ---------------- HELPERS ---------------- */
const mapTasks = (teams) => {
  return teams.flatMap(team =>
    (team.projects || []).flatMap(project =>
      (project.tasks || []).map(task => ({
        title: task.title,
        description: task.status,
        avatar: 'https://api.dicebear.com/7.x/initials/svg?seed=task'
      }))
    )
  )
}

const mapProjects = (teams) => {
  return teams.flatMap(team =>
    (team.projects || []).map(project => ({
      name: project.name,
      id: project.id,
      status: project.status
    }))
  )
}

const mapNewTasks = (allTasks) => {
  return allTasks.filter(
    task =>
      task.description === 'todo' ||
      task.description === 'in_progress'
  )
}

const extractDashboard = (res) => {
  return res?.data?.dashboard || res?.dashboard || null
}

/* ---------------- FETCH ---------------- */
const authStore = useAuthStore()

const fetchDashboard = async () => {
  try {
    const userId =
      authStore.user?.id ?? authStore.session?.user?.id

    const res = await ApiService.post('dashboard', {
      user_id: userId
    })

    const data = extractDashboard(res)
    const teams = data?.teams || []

    const allTasks = mapTasks(teams)

    tasks.value = allTasks
    projects.value = mapProjects(teams)

  } catch (err) {
    console.error(err)
  }
}

/* ---------------- LIFECYCLE ---------------- */
onMounted(async () => {
  await authStore.fetchSession()
  await fetchDashboard()
})
</script>
<template>
   <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
    
  <!-- TASKS CARD -->
 <div class="bg-white rounded-2xl p-4 shadow-sm">
  
  <!-- HEADER (Title + Dropdown) -->
  <div class="flex items-center justify-between mb-4">
    <h2 class="text-lg font-semibold text-gray-800">
      All Task
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

  <!-- TASK LIST -->
  <ul class="flex flex-col gap-3">
    <li
      v-for="task in visibleTasks"
      :key="task.title"
      class="border-b pb-2 flex gap-3"
    >
      <img
        :src="task.avatar"
        :alt="task.title"
        class="w-10 h-10 rounded-full object-cover flex-shrink-0"
      />

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
    class="mt-3 text-xs text-blue-600 hover:underline"
  >
    {{ showAllTasks ? 'Show Less' : 'See More' }}
  </button>
</div>

  <!-- PROJECTS CARD -->
  <div class="bg-white rounded-2xl p-6 shadow-sm">
    <div class="flex items-center justify-between mb-4">
    <h2 class="text-lg font-semibold text-gray-800 text-center mb-4">
      Projects
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
        v-for="(project, index) in projects"
        :key="index"
        class="border-b pb-2 text-xs text-gray-700"
      >
        {{ project.name }}
      </li>
    </ul>
  </div>

</div>
</template>