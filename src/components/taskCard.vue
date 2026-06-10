<script setup>
import { ref, computed } from 'vue'
import Filtericon from './Filtericon.vue'

const props = defineProps({
  tasks: { type: Array, default: () => [] },
  projects: { type: Array, default: () => [] },
  modelValue: { type: [String, Number, null], default: null },
  teams: { type: Array, default: () => [] }
})

const emit = defineEmits(['update:modelValue'])

const showAllTasks = ref(false)
const showModal = ref(false)
const selectedTask = ref(null)
const editableDescription = ref('')

const isFilterModalOpen = ref(false)

// v-model for team selection
const selectedCategoryModel = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val || null)
})

const openTaskModal = (task) => {
  showModal.value = true
  selectedTask.value = {
    name: task.title,
    description: task.description || task.status
  }
  editableDescription.value = task.description || ''
}

const openFilterModal = () => {
  isFilterModalOpen.value = true
}

const closeFilterModal = () => {
  isFilterModalOpen.value = false
}

const hasTeamSelected = computed(() => !!props.modelValue)

const visibleTasks = computed(() => {
  if (!hasTeamSelected.value) return []
  return showAllTasks.value ? props.tasks : props.tasks.slice(0, 5)
})

const visibleProjects = computed(() => {
  if (!hasTeamSelected.value) return []
  return props.projects
})
</script>

<template>
  <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
    <!-- TASKS CARD -->
    <div class="bg-blue-50 rounded-2xl border border-gray-200 p-4 shadow-lg">
      <div class="flex items-center justify-between mb-4">
        <h2 class="text-lg font-semibold text-gray-800">All Tasks</h2>
        <font-awesome-icon
          icon="sliders"
          class="text-gray-500 hover:text-gray-700 cursor-pointer p-2 hover:bg-gray-100 rounded-lg transition"
          @click="openFilterModal"
        />
      </div>

      <div v-if="!hasTeamSelected" class="text-center text-gray-500 py-10 text-sm">
        Select a team to view tasks
      </div>

      <ul v-else class="flex flex-col gap-3">
        <li
          v-for="task in visibleTasks"
          :key="task.id || task.title"
          class="border-b border-gray-200 pb-3 flex gap-3"
        >
          <img
            :src="task.avatar || 'https://api.dicebear.com/7.x/initials/svg?seed=task'"
            :alt="task.title"
            class="w-10 h-10 rounded-full object-cover flex-shrink-0"
          />
          <details class="cursor-pointer flex-1">
            <summary class="text-sm text-gray-700 flex items-center justify-between">
              <span class="truncate">{{ task.title }}</span>
              <button
                @click.stop.prevent="openTaskModal(task)"
                class="text-gray-400 hover:text-blue-600 ml-2"
              >
                <i class="fas fa-eye text-xs"></i>
              </button>
            </summary>
            <p class="mt-2 text-sm text-gray-600">{{ task.description }}</p>
          </details>
        </li>
      </ul>

      <button
        v-if="hasTeamSelected && tasks.length > 5"
        @click="showAllTasks = !showAllTasks"
        class="mt-4 text-xs text-blue-600 hover:underline font-medium"
      >
        {{ showAllTasks ? 'Show Less' : 'See More' }}
      </button>

      <!-- Task Detail Modal -->
      <div v-if="showModal" class="fixed inset-0 bg-black/60 flex items-center justify-center z-50 px-4">
        <div class="bg-white w-full max-w-[500px] rounded-3xl shadow-2xl p-6 relative">
          <button
            @click="showModal = false"
            class="absolute top-5 right-5 text-gray-400 hover:text-gray-600 text-xl"
          >
            ✕
          </button>

          <h2 class="text-2xl font-semibold text-gray-800 mb-6">
            {{ selectedTask?.name }}
          </h2>

          <div class="mb-5">
            <label class="block text-gray-500 text-sm mb-2">Description</label>
            <textarea
              v-model="editableDescription"
              rows="5"
              class="w-full rounded-2xl border border-gray-300 bg-gray-50 p-4 focus:ring-2 focus:ring-blue-400 outline-none"
            ></textarea>
          </div>

          <button
            class="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3.5 rounded-2xl transition"
            @click="showModal = false"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>

    <!-- PROJECTS CARD -->
    <div class="bg-blue-50 border border-gray-200 rounded-2xl p-6 shadow-lg">
      <div class="flex items-center justify-between mb-4">
        <h2 class="text-lg font-semibold text-gray-800">Projects</h2>
        <font-awesome-icon
          icon="sliders"
          class="text-gray-500 hover:text-gray-700 cursor-pointer p-2 hover:bg-gray-100 rounded-lg transition"
          @click="openFilterModal"
        />
      </div>

      <div v-if="!hasTeamSelected" class="text-center text-gray-500 py-10 text-sm">
        Select a team to view projects
      </div>

      <ul v-else class="flex flex-col gap-2 text-sm">
        <li
          v-for="(project, i) in visibleProjects"
          :key="i"
          class="border-b border-gray-200 py-2 text-gray-700"
        >
          {{ project.name }}
        </li>
      </ul>
    </div>

    <!-- ==================== FILTER MODAL ==================== -->
    <Teleport to="body">
      <div
        v-if="isFilterModalOpen"
        class="fixed inset-0 bg-black/50 flex items-center justify-center z-[60]"
      >
        <div class="bg-white rounded-2xl w-full max-w-md mx-4 shadow-2xl relative">
          <!-- Close Button -->
          <button
            @click="closeFilterModal"
            class="absolute -top-4 -right-4 bg-white w-9 h-9 rounded-full shadow-lg flex items-center justify-center text-gray-500 hover:text-gray-700 hover:bg-gray-100 z-10 text-xl font-bold border border-gray-200"
          >
            ✕
          </button>

          <div class="p-6">
            <Filtericon
              v-model="selectedCategoryModel"
              :teams="teams"
            />
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>