<script setup>
import { ref } from 'vue'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import Filtericon from '@/components/Filtericon.vue'

const showFilterModal = ref(false)

const openFilterModal = () => {
  showFilterModal.value = true
}

const closeFilterModal = () => {
  showFilterModal.value = false
}

/* ---------------- CUSTOMERS ---------------- */
// const customers = ref([])

const showMembersModal = ref(false)
const openMembersModal = () => {
  showMembersModal.value = true
}
const closeMembersModal = () => {
  showMembersModal.value = false
}

const props = defineProps({
  customers: {
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

const emit = defineEmits(['update:selectedCategory'])
</script>

<template>
  <div class="bg-blue-50 rounded-2xl border-gray-400 p-8 shadow-lg">
    <!-- ... your active members content ... -->
    <div class="flex items-center justify-between mb-4">
      <h3 class="text-base font-semibold text-gray-800 mb-4">Active Members</h3>
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
            :selectedCategory="props.selectedCategory"
            @update:selectedCategory="emit('update:selectedCategory', $event)"
          />
        </div>
      </div>
    </div>

    <div class="flex items-center gap-5">
      <div
        v-for="customer in customers"
        :key="customer.name"
        class="flex flex-col items-center gap-2"
      >
        <img
          :src="customer.avatar"
          :alt="customer.name"
          class="w-12 h-12 rounded-full object-cover ring-2 ring-white shadow-md"
        />
        <span class="text-xs text-gray-500">
          {{ customer.name }}
        </span>
      </div>

      <div class="flex flex-col items-center gap-2">
        <button
          @click="openMembersModal"
          class="w-12 h-12 rounded-full border-2 border-dashed border-gray-200 flex items-center justify-center hover:border-gray-400 hover:bg-gray-50"
        >
          <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M9 5l7 7-7 7"
            />
          </svg>
        </button>
        <span class="text-xs text-gray-500">View all</span>
      </div>
    </div>
    <div
      v-if="showMembersModal"
      class="fixed inset-0 bg-black/40 flex items-center justify-center z-50"
    >
      <div class="bg-white w-[90%] max-w-md rounded-2xl p-5 shadow-lg">
        <!-- Header -->
        <div class="flex justify-between items-center mb-4">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-sm font-semibold text-gray-800">
              Active Members ({{ customers.length }})
            </h3>
          </div>

          <button @click="closeMembersModal">
            <i class="fas fa-times text-gray-400 hover:text-red-500"></i>
          </button>
        </div>

        <!-- Members List -->
        <div class="flex flex-col gap-3 max-h-[400px] overflow-y-auto">
          <div
            v-for="member in customers"
            :key="member.name"
            class="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg"
          >
            <img :src="member.avatar" class="w-10 h-10 rounded-full object-cover" />

            <span class="text-sm text-gray-700">
              {{ member.name }}
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
