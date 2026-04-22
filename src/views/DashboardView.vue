<template>
  <div class="min-h-screen bg-gray-50 p-6">
    <!-- Header -->
    <div class="mb-6">
      <h1 class="text-2xl font-bold text-gray-800">Dashboard</h1>
      <p class="text-sm text-gray-500">Overview of your account</p>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="flex items-center justify-center py-20">
      <div class="animate-spin rounded-full h-10 w-10 border-b-2 border-purple-600"></div>
    </div>

    <!-- Error -->
    <div v-if="error" class="bg-red-100 text-red-700 p-4 rounded mb-4">
      {{ error }}
    </div>

    <!-- Content -->
    <div v-if="dashboard" class="grid grid-cols-1 md:grid-cols-3 gap-4">

      <!-- Loan Balance -->
      <div class="bg-white p-5 rounded-xl shadow">
        <p class="text-sm text-gray-500">Loan Balance</p>
        <h2 class="text-xl font-semibold text-gray-800">
          ₦{{ dashboard.loan_balance || 0 }}
        </h2>
      </div>

      <!-- Next Repayment -->
      <div class="bg-white p-5 rounded-xl shadow">
        <p class="text-sm text-gray-500">Next Repayment</p>
        <h2 class="text-xl font-semibold text-gray-800">
          ₦{{ dashboard.next_repayment_amount || 0 }}
        </h2>
      </div>

      <!-- Total Repaid -->
      <div class="bg-white p-5 rounded-xl shadow">
        <p class="text-sm text-gray-500">Total Repaid</p>
        <h2 class="text-xl font-semibold text-gray-800">
          ₦{{ dashboard.total_repaid_amount || 0 }}
        </h2>
      </div>
    </div>

    <!-- Repayment Details -->
    <div v-if="dashboard?.repayment_data" class="mt-6 bg-white p-5 rounded-xl shadow">
      <h3 class="font-semibold text-gray-700 mb-3">Repayment Summary</h3>

      <div class="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
        <div>
          <p class="text-gray-500">Paid Count</p>
          <p class="font-semibold">{{ dashboard.repayment_data.total_paid_count }}</p>
        </div>

        <div>
          <p class="text-gray-500">Total Schedules</p>
          <p class="font-semibold">{{ dashboard.repayment_data.total_number_of_schedule }}</p>
        </div>

        <div>
          <p class="text-gray-500">Next Amount</p>
          <p class="font-semibold">
            ₦{{ dashboard.repayment_data.next_repayment?.amount || 0 }}
          </p>
        </div>

        <div>
          <p class="text-gray-500">Due Date</p>
          <p class="font-semibold">
            {{ dashboard.repayment_data.next_repayment?.due_date || "N/A" }}
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import ApiService from '@/services/api'

const authStore = useAuthStore()

const loading = ref(false)
const error = ref(null)
const dashboard = ref(null)

// 🔥 Fetch dashboard
const fetchDashboard = async () => {
  loading.value = true
  error.value = null

  try {
    const userId = authStore.user?.id || authStore.session?.user?.id

    if (!userId) {
      throw new Error('User not authenticated')
    }

    const res = await ApiService.post('dashboard', {
      user_id: userId
    })
    console.log("res:", res)
    dashboard.value = res.dashboard
  } catch (err) {
    error.value = err?.response?.data?.error || err.message || 'Failed to load dashboard'
  } finally {
    loading.value = false
  }
}

onMounted(async () => {
  // ensure session is loaded
  await authStore.fetchSession()
  await fetchDashboard()
})
</script>