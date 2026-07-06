<script setup>
import GetTeams from './GetTeams.vue'

defineProps({
  modelValue: {
    type: [String, Number],
    default: null
  }
})

const emit = defineEmits([
  'update:modelValue',
  'team-loaded'
])
</script>

<template>
  <div>
    <GetTeams
      :model-value="modelValue"
      @update:modelValue="emit('update:modelValue', $event)"
      @team-loaded="emit('team-loaded', $event)"
    />
  </div>
</template>