<script setup>
import { ref, onMounted, computed, watch } from 'vue'
import { supabase } from '@/services/supabase'
import ApiService from '@/services/api'
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()

const props = defineProps({
  modelValue: {
    type: [String, Number],
    default: null
  },
  label: {
    type: String,
    default: 'Select Team'
  }
})

// emit('team-loaded', team)

const emit = defineEmits([
  'update:modelValue',
  'team-loaded'
])

const teams = ref([])
const loading = ref(false)

const selectedTeam = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

const getTeams = async () => {
  loading.value = true

  try {
    const { data, error } = await supabase
      .from('teams')
      .select('*')
      .order('name')

    if (error) throw error

    teams.value = data || []

    console.log('✅ Teams loaded:', teams.value)
    console.table(teams.value) // Optional: displays the data in a table
  } catch (err) {
    console.error('❌ Error fetching teams:', err)
  } finally {
    loading.value = false
  }
}

onMounted(getTeams)
</script>

<template>
  <v-select
    v-model="selectedTeam"
    :items="teams"
    item-title="name"
    item-value="id"
    :label="label"
    variant="outlined"
    clearable
    :loading="loading"
  />
</template>