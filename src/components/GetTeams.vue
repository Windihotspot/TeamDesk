<script setup>
import { ref, onMounted} from 'vue'
import { supabase } from '@/services/supabase'

const teams = ref([])
const loading = ref(false)

// const auth = useAuthStore()

const getTeams = async () => {
  // if (!auth.user) return

  loading.value = true

  try {
    const { data, error } = await supabase.from('teams').select('*')

    console.log('✅ Teams loaded:', data)
    teams.value = data
    if (error) throw error
  } catch (err) {
    console.error('Error fetching teams:', err)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  getTeams()
})

</script>

<template>
  <v-select
 
    :items="teams"
    item-title="name"
    item-value="id"
    :label="label"
    variant="outlined"
    :loading="loading"
    clearable
  />
</template>
