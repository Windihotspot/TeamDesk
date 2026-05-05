<script setup>
import { ref, computed, onMounted } from 'vue'
import { supabase } from '@/services/supabase'

const props = defineProps({
  selectedCategory: String
})

const emit = defineEmits(['update:selectedCategory'])

const selectedCategory = computed({
  get: () => props.selectedCategory,
  set: (val) => emit('update:selectedCategory', val)
})

const teams = ref([])
const loading = ref(false)

const getTeams = async () => {
  loading.value = true
  try {
    const { data, error } = await supabase.from('teams').select('*')
    if (error) throw error
    teams.value = data || []
  } catch (err) {
    console.error('Error fetching teams:', err)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  getTeams()
})

const categoryOptions = computed(() =>
  teams.value.map(team => ({
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
  :loading="loading"
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