import { ref, onMounted } from 'vue'
import { supabase } from '@/services/supabase'

export function useSuppliers() {
  const suppliers = ref([])
  const supplierOptions = ref([])
  const loading = ref(false)
  const error = ref(null)

  const fetchSuppliers = async () => {
    loading.value = true
    error.value = null

    try {
      console.log('📦 Fetching suppliers...')

      const { data, error: err } = await supabase
        .from('suppliers')
        .select('id, name')
        .eq('is_active', true)
        .order('name', { ascending: true })

      if (err) throw err

      console.log('✅ Suppliers fetched:', data)

      suppliers.value = data || []

      // IMPORTANT: include full objects so v-select can use id
      supplierOptions.value = data || []
    } catch (err) {
      console.error('❌ Supplier fetch error:', err)
      error.value = err.message
    } finally {
      loading.value = false
    }
  }

  onMounted(fetchSuppliers)

  return {
    suppliers,
    supplierOptions,
    loading,
    error,
    fetchSuppliers
  }
}
