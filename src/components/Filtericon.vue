<script setup>
import { computed } from 'vue'

const props = defineProps({
  selectedCategory: {
    type: [String, Number, null],
    default: null
  },
  teams: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['update:selectedCategory'])

const selectedCategory = computed({
  get: () => props.selectedCategory,
  set: (val) => {
    console.log('🔄 Filter changed - Selected Team ID:', val)
    emit('update:selectedCategory', val)
  }
})

const categoryOptions = computed(() =>
  props.teams.map((team) => ({
    title: team.name,
    value: team.id
  }))
)
</script>

<template>
  <div class="bg-white rounded-2xl shadow-sm p-6 w-full">
    <h2 class="text-lg font-semibold text-gray-800 mb-4">Category Filter</h2>

    <v-select
      v-model="selectedCategory"
      :items="categoryOptions"
      item-title="title"
      item-value="value"
      label="Select Team"
      variant="outlined"
      density="compact"
      hide-details
      rounded="lg"
      bg-color="white"
      style="max-width: 280px"
    />
  </div>
</template>
