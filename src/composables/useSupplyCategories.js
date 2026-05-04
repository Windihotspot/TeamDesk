import { ref, onMounted } from 'vue'
import { supabase } from '@/services/supabase' // adjust path if needed

export function useSupplyCategories() {
  const categories = ref([])
  const categoryOptions = ref(['All'])
  const loading = ref(false)
  const error = ref(null)

  const fetchCategories = async () => {
    loading.value = true
    error.value = null

    try {
      console.log('📦 Fetching supply categories...')

      const { data, error: err } = await supabase
        .from('supply_categories')
        .select('*')
        .eq('is_active', true)
        .order('name', { ascending: true })

      if (err) {
        console.error('❌ Supabase error:', err)
        throw err
      }

      console.log('✅ Categories fetched:', data)

      categories.value = data || []

      // build dropdown options
      categoryOptions.value = ['All', ...(data?.map((c) => c.name) || [])]
    } catch (err) {
      error.value = err.message || 'Failed to fetch categories'
    } finally {
      loading.value = false
    }
  }

  onMounted(() => {
    fetchCategories()
  })

  return {
    categories,
    categoryOptions,
    loading,
    error,
    fetchCategories
  }
}
