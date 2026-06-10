<script setup>
import { ref, computed } from 'vue'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import Filtericon from '@/components/Filtericon.vue'

const props = defineProps({
  visibleNewTasks: {
    type: Array,
    default: () => []
  },
  dashboardData: {
    type: Object,
    default: null
  },
  selectedCategory: {
    type: [String, Number, null],
    default: null
  }
})

const emit = defineEmits(['update:selectedCategory', 'openTask'])

const showFilterModal = ref(false)
const showAllNewTasks = ref(false)

const openFilterModal = () => {
  showFilterModal.value = true
}

const closeFilterModal = () => {
  showFilterModal.value = false
}

const displayedTasks = computed(() =>
  showAllNewTasks.value ? props.visibleNewTasks : props.visibleNewTasks.slice(0, 3)
)

const openTaskModal = (task) => {
  emit('openTask', task)
}

const hasTeamSelected = computed(() => !!props.selectedCategory)
</script>

<template>
  <div class="bg-blue-50 rounded-2xl border-gray-400 p-6 shadow-lg">
    <!-- HEADER -->
    <div class="flex items-center justify-between mb-4">
      <h2 class="text-lg font-semibold text-gray-800">Task in Progress</h2>
      <font-awesome-icon 
        icon="sliders" 
        class="text-gray-500 hover:text-gray-700 cursor-pointer p-2 hover:bg-gray-100 rounded-lg transition"
        @click="openFilterModal" 
      />
    </div>

    <!-- EMPTY STATE -->
    <div v-if="!hasTeamSelected" class="text-center text-gray-500 py-10 text-sm">
      Select a team to view tasks
    </div>

    <!-- TASK LIST -->
    <ul v-else class="flex flex-col gap-2">
      <li
        v-for="(task, index) in displayedTasks"
        :key="index"
        class="border-b pb-2 flex gap-2 items-start justify-between"
      >
        <div class="flex gap-2 flex-1">
          <img :src="task.avatar" class="w-6 h-6 rounded-full mt-1" />

          <details class="flex-1 cursor-pointer">
            <summary class="text-xs text-gray-700 flex items-center justify-between">
              <span>{{ task.title }}</span>

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

    <!-- See More Button -->
    <button
      v-if="hasTeamSelected && visibleNewTasks.length > 3"
      @click="showAllNewTasks = !showAllNewTasks"
      class="mt-3 text-xs text-blue-600 hover:underline"
    >
      {{ showAllNewTasks ? 'Show Less' : 'See More' }}
    </button>

    <!-- ==================== FILTER MODAL ==================== -->
    <Teleport to="body">
      <div
        v-if="showFilterModal"
        class="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
      >
        <div class="bg-white rounded-2xl w-full max-w-md mx-4 shadow-xl relative">
          <!-- Close Button -->
          <button 
            class="absolute -top-4 -right-4 bg-white w-9 h-9 rounded-full shadow-lg flex items-center justify-center text-gray-500 hover:text-gray-700 text-xl font-bold border border-gray-200"
            @click="closeFilterModal"
          >
            ✕
          </button>

          <div class="p-6">
            <Filtericon
              :teams="dashboardData?.teams || []"
              :model-value="selectedCategory"
              @update:modelValue="emit('update:selectedCategory', $event)"
            />
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>