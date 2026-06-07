<script setup>
import { computed } from 'vue'

const props = defineProps({
  modelValue: { 
    type: [String, Number, null], 
    default: null 
  },
  teams: { 
    type: Array, 
    default: () => [] 
  }
})

const emit = defineEmits(['update:modelValue'])

const selectedCategoryModel = computed({
  get: () => props.modelValue,
  set: (val) => {
    console.log('🔄 Team selected in FilterIcon:', val)
    emit('update:modelValue', val)
  }
})

const categoryOptions = computed(() => {
  if (!props.teams?.length) {
    console.warn('⚠️ No teams available for filter')
    return []
  }
  return props.teams.map(team => ({
    title: team.name,
    value: team.id
  }))
})
</script>

<template>
  <div class="bg-white rounded-2xl shadow-sm p-6">
    <h2 class="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
      <i class="fas fa-filter"></i> 
      Select Team
    </h2>

    <v-select
      v-model="selectedCategoryModel"
      :items="categoryOptions"
      item-title="title"
      item-value="value"
      label="Choose Team"
      variant="outlined"
      density="compact"
      hide-details
      rounded="lg"
      clearable
      :disabled="!categoryOptions.length"
    />
    
    <p v-if="!categoryOptions.length" class="text-gray-500 text-sm mt-3">
      No teams available yet.
    </p>
  </div>
</template>