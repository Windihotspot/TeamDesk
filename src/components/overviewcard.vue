<script setup>
import { ref, computed } from 'vue'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import Filtericon from './Filtericon.vue'
import TotalProjectActiveTask from './TotalProjectActiveTask.vue'

const props = defineProps({
  loading: { type: Boolean, default: false },
  totalProjects: { type: Number, default: 0 },
  activeTasksCount: { type: Number, default: 0 },
  dashboardData: { type: Object, default: () => ({}) },
  modelValue: { type: [String, Number, null], default: null }
})

const emit = defineEmits(['update:modelValue'])

const showFilterModal = ref(false)

// Two-way binding proxy
const selectedCategoryModel = computed({
  get: () => props.modelValue,
  set: (val) => {
    console.log('🔄 Team selected from OverviewCard:', val)
    emit('update:modelValue', val)
  }
})
</script>

<template>
  <div class="bg-blue-50 rounded-2xl border border-gray-200 p-6 shadow-lg relative">
    <div class="flex items-center justify-between mb-6">
      <h2 class="text-xl font-semibold text-gray-800">Overview</h2>
      
      <!-- Filter Icon -->
      <FontAwesomeIcon
        icon="sliders"
        class="text-2xl cursor-pointer hover:text-blue-600 transition-colors p-1"
        @click="showFilterModal = true"
      />
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="py-10 text-center">
      <div class="text-gray-500">Loading overview...</div>
    </div>

    <!-- Stats Content -->
    <TotalProjectActiveTask
      v-else
      :total-projects="totalProjects"
      :active-tasks-count="activeTasksCount"
    />

    <!-- Filter Modal -->
    <Teleport to="body">
      <div
        v-if="showFilterModal"
        class="fixed inset-0 bg-black/70 flex items-center justify-center z-50"
        @click.self="showFilterModal = false"
      >
        <div 
          class="bg-white p-6 rounded-2xl w-full max-w-md relative shadow-2xl"
          @click.stop
        >
          <button
            class="absolute top-4 right-4 text-3xl leading-none text-gray-400 hover:text-gray-600"
            @click="showFilterModal = false"
          >
            ✕
          </button>

          <Filtericon
            v-model="selectedCategoryModel"
            :teams="dashboardData?.teams || []"
          />
        </div>
      </div>
    </Teleport>
  </div>
</template>