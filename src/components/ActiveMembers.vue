<script setup>
import { ref, computed, watch } from 'vue'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import Filtericon from '@/components/Filtericon.vue'

const showFilterModal = ref(false)

const openFilterModal = () => {
  showFilterModal.value = true
}

const closeFilterModal = () => {
  showFilterModal.value = false
}

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
  modelValue: {
    type: [String, Number, null],
    default: null
  }
})

const emit = defineEmits(['update:modelValue', 'team-loaded'])

const selectedCategoryModel = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

watch(selectedCategoryModel, (value) => {
  if (value != null) {
    showFilterModal.value = false
  }
})

const displayedCustomers = computed(() => {
  return props.customers.slice(0, 3)
})

const hasMoreMembers = computed(() => {
  return props.customers.length > 3
})
</script>

<template>
  <div class="bg-blue-50 rounded-2xl border-gray-400 p-8 shadow-lg">
    <div class="flex items-center justify-between mb-4">
      <h3 class="text-base font-semibold text-gray-800">Active Members</h3>
      <font-awesome-icon
        icon="sliders"
        class="mr-7 hover:bg-gray-200 cursor-pointer"
        @click="openFilterModal"
      />
    </div>

    <!-- Filter Modal -->
    <div
      v-if="showFilterModal"
      class="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
    >
      <div class="bg-white p-5 rounded-lg w-[400px] relative">
        <button
          class="absolute top-2 right-2 text-gray-600 hover:text-gray-900"
          @click="closeFilterModal"
        >
          ✕
        </button>

        <Filtericon v-model="selectedCategoryModel" @team-loaded="emit('team-loaded', $event)" />
      </div>
    </div>

    <div class="flex items-center gap-5">
      <div
        v-for="customer in displayedCustomers"
        :key="customer.id"
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

      <div v-if="hasMoreMembers" class="flex flex-col items-center justify-center">
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

    <!-- Members Modal -->
    <div
      v-if="showMembersModal"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
    >
      <div class="bg-white rounded-xl w-[95%] max-w-lg p-6 max-h-[80vh] overflow-y-auto">
        <div class="flex justify-between items-center mb-4">
          <h2 class="text-lg font-semibold">Team Members ({{ customers.length }})</h2>

          <button @click="closeMembersModal">✕</button>
        </div>

        <div
          v-for="member in customers"
          :key="member.id"
          class="flex items-center gap-3 py-3 border-b"
        >
          <img :src="member.avatar" class="w-10 h-10 rounded-full" />

          <div>
            <p class="font-medium">{{ member.name }}</p>
            <p class="text-sm text-gray-500">{{ member.email }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
