<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  tasks: Array,
  projects: Array
})

const showAllTasks = ref(false)

const showModal = ref(false)
const selectedTask = ref(null)
const editableDescription = ref('')

const openTaskModal = (task) => {
  showModal.value = true
  selectedTask.value = {
    name: task.title,
    description: task.description
  }
  editableDescription.value = task.description
}

const visibleTasks = computed(() => {
  return showAllTasks.value ? props.tasks : props.tasks.slice(0, 5)
})
</script>
<template>
  <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
    <!-- TASKS CARD -->
    <div class="bg-white rounded-2xl border-gray-400 p-4 shadow-lg">
      <!-- HEADER (Title + Dropdown) -->
      <div class="flex items-center justify-between mb-4">
        <h2 class="text-lg font-semibold text-gray-800">All Task</h2>
        <font-awesome-icon icon="sliders" class="mr-7 hover:bg-gray-200" @click="openFilterModal" />
        <!-- Modal -->
        <div
          v-if="showFilterModal"
          class="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
        >
          <div class="bg-white p-5 rounded-lg w-[400px] relative">
            <!-- close button -->
            <button class="absolute top-2 right-2 text-gray-600" @click="closeFilterModal">
              ✕
            </button>

            <!-- your component -->
            <Filtericon :teams="dashboardData?.teams" v-model:selectedCategory="selectedCategory" />
          </div>
        </div>
      </div>

      <!-- TASK LIST -->
      <ul class="flex flex-col gap-3">
        <li v-for="task in visibleTasks" :key="task.title" class="border-b pb-2 flex gap-3">
          <img
            :src="task.avatar"
            :alt="task.title"
            class="w-10 h-10 rounded-full object-cover flex-shrink-0"
          />

          <details class="cursor-pointer flex-1">
            <summary class="text-sm text-gray-700 truncate flex items-center justify-between">
              <span>{{ task.title }}</span>

              <button
                @click.stop.prevent="openTaskModal(task)"
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
    <div class="bg-white border-gray-400 rounded-2xl p-6 shadow-lg">
      <div class="flex items-center justify-between mb-4">
        <h2 class="text-lg font-semibold text-gray-800 text-center mb-4">Projects</h2>
        <font-awesome-icon icon="sliders" class="mr-7 hover:bg-gray-200" @click="openFilterModal" />
        <!-- Modal -->
        <div
          v-if="showFilterModal"
          class="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
        >
          <div class="bg-white p-5 rounded-lg w-[400px] relative">
            <!-- close button -->
            <button class="absolute top-2 right-2 text-gray-600" @click="closeFilterModal">
              ✕
            </button>

            <!-- your component -->
            <Filtericon :teams="dashboardData?.teams" v-model:selectedCategory="selectedCategory" />
          </div>
        </div>
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
