<script setup lang="ts">
import { ref, onMounted } from 'vue'
import MainLayout from '@/layouts/full/MainLayout.vue'
import { useAuthStore } from '@/stores/auth'
import ApiService from '@/services/api'

const authStore = useAuthStore()

interface Supply {
  id: string
  name: string
  is_read: boolean
  created_at: string
  created_by_user: {
    first_name: string | null
    last_name: string | null
    email: string
  } | null
}

const supplies = ref<Supply[]>([])
const supplyName = ref('')
const editingId = ref<string | null>(null)

const loading = ref(false)
const saving = ref(false)
const errorMessage = ref('')

// FETCH SUPPLIES
const loadSupplies = async () => {
  loading.value = true
  errorMessage.value = ''

  try {
    // Ensure the auth store has the current session
    if (!authStore.session) {
      await authStore.fetchSession()
    }

    if (!authStore.session) {
      throw new Error('Please log in to manage supplies.')
    }

    const response = await ApiService.post<{ data: Supply[] }>('inhouse-supply', { action: 'list' })

    supplies.value = response.data ?? []
  } catch (err: any) {
    errorMessage.value = err.response?.data?.error || err.message || 'Failed to load supplies.'
  } finally {
    loading.value = false
  }
}

// CREATE / UPDATE SUPPLY
const saveSupply = async () => {
  const name = supplyName.value.trim()

  if (!name || saving.value) return

  saving.value = true
  errorMessage.value = ''

  try {
    const action = editingId.value ? 'update' : 'create'

    await ApiService.post('inhouse-supply', {
      action,
      name,
      ...(editingId.value && {
        supply_id: editingId.value
      })
    })

    supplyName.value = ''
    editingId.value = null

    await loadSupplies()
  } catch (err: any) {
    errorMessage.value = err.response?.data?.error || err.message || 'Failed to save supply.'
  } finally {
    saving.value = false
  }
}

// EDIT SUPPLY
const editSupply = (supply: Supply) => {
  supplyName.value = supply.name
  editingId.value = supply.id
}

// DELETE SUPPLY
const deleteSupply = async (id: string) => {
  //   if (!confirm('Are you sure you want to delete this supply?')) return

  errorMessage.value = ''

  try {
    await ApiService.post('inhouse-supply', {
      action: 'delete',
      supply_id: id
    })

    await loadSupplies()
  } catch (err: any) {
    errorMessage.value = err.response?.data?.error || err.message || 'Failed to delete supply.'
  }
}

// MARK SUPPLY AS READ
const markAsRead = async (id: string) => {
  errorMessage.value = ''

  try {
    await ApiService.post('inhouse-supply', {
      action: 'mark_read',
      supply_id: id
    })

    await loadSupplies()
  } catch (err: any) {
    errorMessage.value = err.response?.data?.error || err.message || 'Failed to update supply.'
  }
}

// CANCEL EDIT
const cancelEdit = () => {
  supplyName.value = ''
  editingId.value = null
}

onMounted(loadSupplies)
</script>

<template>
  <MainLayout>
    <div class="space-y-6">
      <!-- Header -->
      <div>
        <h1 class="text-2xl font-semibold text-gray-900">In-house Supplies</h1>
        <p class="text-sm text-gray-500 mt-1">Manage your in-house supply entries.</p>
      </div>

      <!-- Add / Edit Supply -->
      <form @submit.prevent="saveSupply" class="flex flex-col sm:flex-row gap-3">
        <input
          v-model="supplyName"
          type="text"
          placeholder="Enter supply name"
          maxlength="120"
          required
          class="flex-1 border border-gray-300 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
        />

        <div class="flex gap-2">
          <button
            type="submit"
            :disabled="saving || !supplyName.trim()"
            class="px-5 py-3 rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {{ saving ? 'Saving...' : editingId ? 'Update' : 'Add Supply' }}
          </button>

          <button
            v-if="editingId"
            type="button"
            @click="cancelEdit"
            class="px-4 py-3 rounded-lg border border-gray-300"
          >
            Cancel
          </button>
        </div>
      </form>

      <!-- Error -->
      <p v-if="errorMessage" class="text-sm text-red-600">
        {{ errorMessage }}
      </p>

      <!-- Supply List -->
      <div class="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <div class="px-5 py-4 border-b border-gray-200 flex justify-between">
          <h2 class="font-semibold text-gray-800">Supply Entries</h2>

          <span class="text-sm text-gray-500"> {{ supplies.length }} entries </span>
        </div>

        <div v-if="loading" class="p-6 text-center text-gray-500">Loading supplies...</div>

        <div v-else-if="!supplies.length" class="p-6 text-center text-gray-500">
          No supplies added yet.
        </div>

        <div v-else class="divide-y divide-gray-100">
          <div
            v-for="supply in supplies"
            :key="supply.id"
            class="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
          >
            <div>
              <p class="font-medium text-gray-800">
                {{ supply.name }}
              </p>

              <p class="text-xs text-gray-500 mt-1">
                Added by:
                <span class="font-medium text-gray-700">
                  {{
                    supply.created_by_user
                      ? `${supply.created_by_user.first_name ?? ''} ${supply.created_by_user.last_name ?? ''}`.trim() ||
                        supply.created_by_user.email
                      : 'Unknown user'
                  }}
                </span>
              </p>

              <span
                :class="
                  supply.is_read ? 'text-green-600 bg-green-50' : 'text-orange-600 bg-orange-50'
                "
                class="inline-block mt-2 px-3 py-1 rounded-full text-xs font-medium"
              >
                {{ supply.is_read ? 'Read' : 'Unread' }}
              </span>
            </div>

            <div class="flex flex-wrap gap-2">
              <button
                v-if="!supply.is_read"
                @click="markAsRead(supply.id)"
                class="px-3 py-2 text-sm rounded-lg bg-green-50 text-green-700 hover:bg-green-100"
              >
                Mark as Read
              </button>

              <button
                @click="editSupply(supply)"
                class="px-3 py-2 text-sm rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100"
              >
                Edit
              </button>

              <button
                @click="deleteSupply(supply.id)"
                class="px-3 py-2 text-sm rounded-lg bg-red-50 text-red-600 hover:bg-red-100"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </MainLayout>
</template>
