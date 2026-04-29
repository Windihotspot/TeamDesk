<script setup>
import { computed } from 'vue'

const props = defineProps({
  teams: {
    type: Array,
    default: () => []
  },
  selectedCategory: String
})

const emit = defineEmits(['update:selectedCategory'])

const selectedCategory = computed({
  get: () => props.selectedCategory,
  set: (val) => emit('update:selectedCategory', val)
})

const categoryOptions = computed(() =>
  (props.teams || []).map((team) => ({
    title: team.name,
    value: team.id
  }))
)
</script>

<template>
    <div class=" items-center justify-between bg-white rounded-2xl shadow-sm p-4 w-full">
  
  <!-- Left: Heading -->
  <h2 class="text-lg font-semibold text-gray-800 ">
    Category Filter
  </h2>

  <!-- Right: Select -->
  <div class="mt-7 items-center">
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
      style="max-width: 200px"
      bg-color="white"
    />
  </div>

</div>
</template>