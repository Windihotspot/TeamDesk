import { ref } from 'vue'
import { supabase } from '@/services/supabase.js'

export function useProfile() {
  const profile = ref(null)
  const loading = ref(false)
  const error = ref(null)

  const fetchProfile = async () => {
    loading.value = true

    const { data, error: err } = await supabase
      .from('profiles')
      .select('*')
    //   .eq('user_id', userId)
      .single()
    
    if (err) {
      error.value = err.message
      profile.value = null
    } else {
      profile.value = data
    }
    console.log("data:", data)

    loading.value = false
  }

  return {
    profile,
    loading,
    error,
    fetchProfile,
  }
}