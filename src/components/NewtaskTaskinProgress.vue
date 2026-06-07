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
</script>

<template>
  <div class="bg-blue-50 rounded-2xl border-gray-400 p-6 shadow-lg">
    <div class="flex items-center justify-between mb-4">
      <h2 class="text-lg font-semibold text-gray-800 text-center mb-4">Task in progress</h2>
      <font-awesome-icon icon="sliders" class="mr-7 hover:bg-gray-200" @click="openFilterModal" />
      <!-- Modal -->
      <div
        v-if="showFilterModal"
        class="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
      >
        <div class="bg-white p-5 rounded-lg w-[400px] relative">
          <!-- close button -->
          <button class="absolute top-2 right-2 text-gray-600" @click="closeFilterModal">✕</button>

          <!-- your component -->
          <Filtericon
            :teams="props.dashboardData?.teams || []"
            :model-value="props.selectedCategory"
            @update:modelValue="emit('update:selectedCategory', $event)"
          />
        </div>
      </div>
    </div>

    <ul class="flex flex-col gap-2">
      <li
        v-for="(task, index) in displayedTasks"
        :key="index"
        class="border-b pb-2 flex gap-2 items-start justify-between"
      >
        <div class="flex gap-2 flex-1">
          <img :src="task.avatar" class="w-6 h-6 rounded-full mt-1" />

          <details class="flex-1 cursor-pointer">
            <summary class="text-xs text-gray-700 flex items-center justify-between">
              <span>{{ task.title }} </span>

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
</template>
