<script setup>
import { ref, computed } from 'vue'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import Filtericon from './Filtericon.vue'
import TotalProjectActiveTask from './TotalProjectActiveTask.vue'

const props = defineProps({
  loading: { type: Boolean, default: false },
  totalProjects: { type: Number, default: 0 },
  activeTasksCount: { type: Number, default: 0 },
  dashboardData: { type: Object, default: null },
  selectedCategory: { type: [String, Number, null], default: null }
})

const emit = defineEmits(['update:selectedCategory'])

const showFilterModal = ref(false)

const selectedCategoryProxy = computed({
  get: () => props.selectedCategory,
  set: (val) => emit('update:selectedCategory', val)
})
</script>

<template>
  <div class="bg-blue-50 rounded-2xl border-gray-600 p-6 shadow-lg">
    <div class="flex items-center justify-between mb-6">
      <h2 class="text-lg font-semibold text-gray-800">Overview</h2>
      <font-awesome-icon
        icon="sliders"
        class="text-xl cursor-pointer hover:text-blue-600 transition-colors"
        @click="showFilterModal = true"
      />
    </div>

    <!-- Filter Modal -->
    <div
      v-if="showFilterModal"
      class="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
    >
      <div class="bg-white p-6 rounded-2xl w-[420px] relative shadow-xl">
        <button
          class="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
          @click="showFilterModal = false"
        >
          ✕
        </button>

        <Filtericon
          :teams="props.dashboardData?.teams || []"
          v-model:selectedCategory="selectedCategoryProxy"
        />
      </div>
    </div>

    <TotalProjectActiveTask
      :total-projects="totalProjects"
      :active-tasks-count="activeTasksCount"
    />
  </div>
</template>
