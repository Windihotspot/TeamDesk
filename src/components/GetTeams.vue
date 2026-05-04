<script setup>
import { ref, onMounted} from 'vue'
import { supabase } from '@/services/supabase'
// import { useAuthStore } from '@/stores/auth'

// const authStore = useAuthStore()

// const user = computed(() => authStore.user)
// console.log(user)

// const props = defineProps({
//   modelValue: [String, null], // for v-model
//   label: {
//     type: String,
//     default: 'Select Team'
//   }
// })

// const emit = defineEmits(['update:modelValue'])

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

// onMounted(async () => {
//   // if (!authStore.user) {
//   //   await authStore.fetchSession()
//   // }
//   await getTeams()
// })
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
