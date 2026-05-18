<template>
  <MainLayout>
    <v-container fluid class="suppliers-page pa-6">
      <!-- Header -->
      <div class="page-header mb-8">
        <div class="d-flex align-center justify-space-between flex-wrap gap-4">
          <div>
            <p class="page-subtitle mb-1">Vendor Management</p>
            <h1 class="page-title">Suppliers</h1>
          </div>
          <v-btn class="add-btn" prepend-icon="mdi-plus" @click="openCreateDialog" elevation="0">
            Add Supplier
          </v-btn>
        </div>

        <!-- Stats Row -->
        <div class="stats-row mt-6">
          <div class="stat-card">
            <span class="stat-value">{{ suppliers.length }}</span>
            <span class="stat-label">Total</span>
          </div>
          <div class="stat-card">
            <span class="stat-value text-success">{{ activeCount }}</span>
            <span class="stat-label">Active</span>
          </div>
          <div class="stat-card">
            <span class="stat-value text-error">{{ inactiveCount }}</span>
            <span class="stat-label">Inactive</span>
          </div>
        </div>
      </div>

      <!-- Filters Bar -->
      <div class="filters-bar mb-5 d-flex align-center gap-4 flex-wrap">
        <v-text-field
          v-model="search"
          prepend-inner-icon="mdi-magnify"
          placeholder="Search suppliers..."
          variant="outlined"
          density="compact"
          hide-details
          clearable
          class="search-field"
          style="max-width: 320px"
        />
        <v-select
          v-model="statusFilter"
          :items="statusOptions"
          variant="outlined"
          density="compact"
          hide-details
          class="status-filter"
          style="max-width: 160px"
        />
        <v-spacer />
        <div class="view-toggle">
          <v-btn
            :variant="viewMode === 'table' ? 'tonal' : 'text'"
            icon="mdi-table"
            size="small"
            @click="viewMode = 'table'"
          />
          <v-btn
            :variant="viewMode === 'grid' ? 'tonal' : 'text'"
            icon="mdi-view-grid"
            size="small"
            @click="viewMode = 'grid'"
          />
        </div>
      </div>

      <!-- Loading Skeleton -->
      <div v-if="loading" class="d-flex flex-column gap-3">
        <v-skeleton-loader
          v-for="i in 5"
          :key="i"
          type="list-item-avatar-two-line"
          class="rounded-lg"
        />
      </div>

      <!-- Empty State -->
      <div v-else-if="filteredSuppliers.length === 0" class="empty-state text-center py-16">
        <v-icon size="64" color="grey-lighten-1" class="mb-4">mdi-store-off-outline</v-icon>
        <h3 class="text-h6 text-grey-darken-1 mb-2">No suppliers found</h3>
        <p class="text-body-2 text-grey mb-6">
          {{
            search ? 'Try a different search term.' : 'Get started by adding your first supplier.'
          }}
        </p>
        <v-btn
          v-if="!search"
          class="add-btn"
          prepend-icon="mdi-plus"
          @click="openCreateDialog"
          elevation="0"
        >
          Add Supplier
        </v-btn>
      </div>

      <!-- TABLE VIEW -->
      <v-card v-else-if="viewMode === 'table'" class="data-card" elevation="0">
        <v-data-table
          :headers="headers"
          :items="filteredSuppliers"
          :items-per-page="10"
          class="suppliers-table"
          hover
        >
          <template #item.name="{ item }">
            <div class="d-flex align-center gap-3 py-2">
              <div class="supplier-avatar">{{ initials(item.name) }}</div>
              <div>
                <div class="font-weight-semibold supplier-name">{{ item.name }}</div>
                <div v-if="item.website" class="text-caption text-grey">
                  <v-icon size="10" class="mr-1">mdi-web</v-icon>{{ item.website }}
                </div>
              </div>
            </div>
          </template>

          <template #item.contact_person="{ item }">
            <span class="text-body-2">{{ item.contact_person || '—' }}</span>
          </template>

          <template #item.email="{ item }">
            <a v-if="item.email" :href="`mailto:${item.email}`" class="contact-link">
              <v-icon size="14" class="mr-1">mdi-email-outline</v-icon>{{ item.email }}
            </a>
            <span v-else class="text-grey">—</span>
          </template>

          <template #item.phone="{ item }">
            <span class="text-body-2">{{ item.phone || '—' }}</span>
          </template>

          <template #item.is_active="{ item }">
            <v-chip
              :color="item.is_active ? 'success' : 'error'"
              size="small"
              variant="tonal"
              :prepend-icon="item.is_active ? 'mdi-check-circle' : 'mdi-close-circle'"
            >
              {{ item.is_active ? 'Active' : 'Inactive' }}
            </v-chip>
          </template>

          <template #item.actions="{ item }">
            <div class="d-flex gap-1">
              <v-tooltip text="View Details" location="top">
                <template #activator="{ props }">
                  <v-btn
                    v-bind="props"
                    icon="mdi-eye-outline"
                    size="small"
                    variant="text"
                    color="primary"
                    @click="openViewDialog(item)"
                  />
                </template>
              </v-tooltip>
              <v-tooltip text="Edit" location="top">
                <template #activator="{ props }">
                  <v-btn
                    v-bind="props"
                    icon="mdi-pencil-outline"
                    size="small"
                    variant="text"
                    color="secondary"
                    @click="openEditDialog(item)"
                  />
                </template>
              </v-tooltip>
              <v-tooltip text="Delete" location="top">
                <template #activator="{ props }">
                  <v-btn
                    v-bind="props"
                    icon="mdi-trash-can-outline"
                    size="small"
                    variant="text"
                    color="error"
                    @click="confirmDelete(item)"
                  />
                </template>
              </v-tooltip>
            </div>
          </template>
        </v-data-table>
      </v-card>

      <!-- GRID VIEW -->
      <div v-else class="grid-view">
        <div v-for="supplier in filteredSuppliers" :key="supplier.id" class="supplier-card">
          <div
            class="card-header-strip"
            :class="supplier.is_active ? 'active-strip' : 'inactive-strip'"
          />
          <div class="card-body">
            <div class="d-flex align-start justify-space-between mb-3">
              <div class="supplier-avatar large">{{ initials(supplier.name) }}</div>
              <v-chip
                :color="supplier.is_active ? 'success' : 'error'"
                size="x-small"
                variant="tonal"
              >
                {{ supplier.is_active ? 'Active' : 'Inactive' }}
              </v-chip>
            </div>
            <h3 class="card-name mb-1">{{ supplier.name }}</h3>
            <p v-if="supplier.contact_person" class="card-contact mb-3">
              <v-icon size="13">mdi-account-outline</v-icon> {{ supplier.contact_person }}
            </p>
            <div class="card-details">
              <div v-if="supplier.email" class="detail-row">
                <v-icon size="13" color="grey">mdi-email-outline</v-icon>
                <a :href="`mailto:${supplier.email}`" class="contact-link text-truncate">{{
                  supplier.email
                }}</a>
              </div>
              <div v-if="supplier.phone" class="detail-row">
                <v-icon size="13" color="grey">mdi-phone-outline</v-icon>
                <span>{{ supplier.phone }}</span>
              </div>
              <div v-if="supplier.bank_name" class="detail-row">
                <v-icon size="13" color="grey">mdi-bank-outline</v-icon>
                <span>{{ supplier.bank_name }}</span>
              </div>
            </div>
          </div>
          <div class="card-actions">
            <v-btn
              size="small"
              variant="text"
              color="primary"
              prepend-icon="mdi-eye-outline"
              @click="openViewDialog(supplier)"
              >View</v-btn
            >
            <v-btn
              size="small"
              variant="text"
              color="secondary"
              prepend-icon="mdi-pencil-outline"
              @click="openEditDialog(supplier)"
              >Edit</v-btn
            >
            <v-btn
              size="small"
              variant="text"
              color="error"
              icon="mdi-trash-can-outline"
              @click="confirmDelete(supplier)"
            />
          </div>
        </div>
      </div>

      <!-- ===================== CREATE / EDIT DIALOG ===================== -->
      <v-dialog v-model="formDialog" max-width="720" persistent scrollable>
        <v-card class="form-dialog-card">
          <div class="dialog-header">
            <div>
              <p class="dialog-sub">
                {{ isEditing ? 'Update supplier info' : 'Register a new vendor' }}
              </p>
              <h2 class="dialog-title">{{ isEditing ? 'Edit Supplier' : 'New Supplier' }}</h2>
            </div>
            <v-btn icon="mdi-close" variant="text" @click="closeFormDialog" />
          </div>

          <v-divider />

          <v-card-text class="pa-6">
            <v-form ref="formRef" @submit.prevent="saveSupplier">
              <!-- Section: Basic Info -->
              <div class="form-section-label mb-3">
                <v-icon size="16" class="mr-2">mdi-store-outline</v-icon>Basic Information
              </div>
              <v-row dense>
                <v-col cols="12" md="8">
                  <v-text-field
                    v-model="form.name"
                    label="Supplier Name *"
                    variant="outlined"
                    density="comfortable"
                    :rules="[rules.required]"
                  />
                </v-col>
                <v-col cols="12" md="4">
                  <v-switch
                    v-model="form.is_active"
                    label="Active"
                    color="success"
                    hide-details
                    inset
                    class="mt-2"
                  />
                </v-col>
                <v-col cols="12" md="6">
                  <v-text-field
                    v-model="form.contact_person"
                    label="Contact Person"
                    variant="outlined"
                    density="comfortable"
                    prepend-inner-icon="mdi-account-outline"
                  />
                </v-col>
                <v-col cols="12" md="6">
                  <v-text-field
                    v-model="form.website"
                    label="Website"
                    variant="outlined"
                    density="comfortable"
                    prepend-inner-icon="mdi-web"
                    placeholder="https://"
                  />
                </v-col>
              </v-row>

              <!-- Section: Contact -->
              <div class="form-section-label mb-3 mt-4">
                <v-icon size="16" class="mr-2">mdi-card-account-phone-outline</v-icon>Contact
                Details
              </div>
              <v-row dense>
                <v-col cols="12" md="6">
                  <v-text-field
                    v-model="form.email"
                    label="Email Address"
                    variant="outlined"
                    density="comfortable"
                    prepend-inner-icon="mdi-email-outline"
                    :rules="[rules.email]"
                    type="email"
                  />
                </v-col>
                <v-col cols="12" md="6">
                  <v-text-field
                    v-model="form.phone"
                    label="Phone Number"
                    variant="outlined"
                    density="comfortable"
                    prepend-inner-icon="mdi-phone-outline"
                  />
                </v-col>
                <v-col cols="12">
                  <v-textarea
                    v-model="form.address"
                    label="Address"
                    variant="outlined"
                    density="comfortable"
                    prepend-inner-icon="mdi-map-marker-outline"
                    rows="2"
                    auto-grow
                  />
                </v-col>
              </v-row>

              <!-- Section: Banking -->
              <div class="form-section-label mb-3 mt-4">
                <v-icon size="16" class="mr-2">mdi-bank-outline</v-icon>Banking Information
              </div>
              <v-row dense>
                <v-col cols="12" md="6">
                  <v-text-field
                    v-model="form.bank_name"
                    label="Bank Name"
                    variant="outlined"
                    density="comfortable"
                    prepend-inner-icon="mdi-bank"
                  />
                </v-col>
                <v-col cols="12" md="6">
                  <v-text-field
                    v-model="form.account_number"
                    label="Account Number"
                    variant="outlined"
                    density="comfortable"
                    prepend-inner-icon="mdi-credit-card-outline"
                  />
                </v-col>
              </v-row>

              <!-- Notes -->
              <div class="form-section-label mb-3 mt-4">
                <v-icon size="16" class="mr-2">mdi-note-text-outline</v-icon>Notes
              </div>
              <v-textarea
                v-model="form.notes"
                label="Additional notes..."
                variant="outlined"
                density="comfortable"
                rows="3"
                auto-grow
              />
            </v-form>
          </v-card-text>

          <v-divider />
          <v-card-actions class="pa-4 d-flex justify-end gap-3">
            <v-btn variant="text" @click="closeFormDialog" :disabled="saving">Cancel</v-btn>
            <v-btn class="save-btn" :loading="saving" elevation="0" @click="saveSupplier">
              {{ isEditing ? 'Update Supplier' : 'Create Supplier' }}
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>

      <!-- ===================== VIEW DIALOG ===================== -->
      <v-dialog v-model="viewDialog" max-width="640" scrollable>
        <v-card class="form-dialog-card" v-if="selectedSupplier">
          <div class="dialog-header">
            <div class="d-flex align-center gap-4">
              <div class="supplier-avatar large">{{ initials(selectedSupplier.name) }}</div>
              <div>
                <h2 class="dialog-title">{{ selectedSupplier.name }}</h2>
                <v-chip
                  :color="selectedSupplier.is_active ? 'success' : 'error'"
                  size="small"
                  variant="tonal"
                  class="mt-1"
                >
                  {{ selectedSupplier.is_active ? 'Active' : 'Inactive' }}
                </v-chip>
              </div>
            </div>
            <v-btn icon="mdi-close" variant="text" @click="viewDialog = false" />
          </div>
          <v-divider />
          <v-card-text class="pa-6">
            <div class="detail-grid">
              <detail-row
                icon="mdi-account-outline"
                label="Contact Person"
                :value="selectedSupplier.contact_person"
              />
              <detail-row
                icon="mdi-email-outline"
                label="Email"
                :value="selectedSupplier.email"
                is-email
              />
              <detail-row icon="mdi-phone-outline" label="Phone" :value="selectedSupplier.phone" />
              <detail-row icon="mdi-web" label="Website" :value="selectedSupplier.website" />
              <detail-row
                icon="mdi-map-marker-outline"
                label="Address"
                :value="selectedSupplier.address"
              />
              <detail-row
                icon="mdi-bank-outline"
                label="Bank Name"
                :value="selectedSupplier.bank_name"
              />
              <detail-row
                icon="mdi-credit-card-outline"
                label="Account Number"
                :value="selectedSupplier.account_number"
              />
              <detail-row
                icon="mdi-note-text-outline"
                label="Notes"
                :value="selectedSupplier.notes"
              />
            </div>
            <div class="text-caption text-grey mt-6">
              Created {{ formatDate(selectedSupplier.created_at) }}
              <span v-if="selectedSupplier.updated_at !== selectedSupplier.created_at">
                · Updated {{ formatDate(selectedSupplier.updated_at) }}
              </span>
            </div>
          </v-card-text>
          <v-card-actions class="pa-4 d-flex justify-end gap-3">
            <!-- <v-btn
            variant="outlined"
            color="secondary"
            prepend-icon="mdi-pencil-outline"
            @click="
              openEditDialog(selectedSupplier)
              viewDialog = false
            "
          >
            Edit
          </v-btn> -->
            <!-- <v-btn
            variant="tonal"
            color="error"
            prepend-icon="mdi-trash-can-outline"
            @click="
              confirmDelete(selectedSupplier)
              viewDialog = false
            "
          >
            Delete
          </v-btn> -->
          </v-card-actions>
        </v-card>
      </v-dialog>

      <!-- ===================== DELETE CONFIRM ===================== -->
      <v-dialog v-model="deleteDialog" max-width="420" persistent>
        <v-card class="form-dialog-card pa-2">
          <v-card-text class="pa-6 text-center">
            <div class="delete-icon-wrap mb-4">
              <v-icon size="40" color="error">mdi-trash-can-outline</v-icon>
            </div>
            <h3 class="text-h6 font-weight-bold mb-2">Delete Supplier?</h3>
            <p class="text-body-2 text-grey-darken-1">
              You are about to permanently delete
              <strong class="text-black">{{ supplierToDelete?.name }}</strong
              >. This action cannot be undone.
            </p>
          </v-card-text>
          <v-card-actions class="px-6 pb-6 d-flex gap-3 justify-center">
            <v-btn
              variant="outlined"
              @click="deleteDialog = false"
              :disabled="deleting"
              class="flex-1-1"
              >Cancel</v-btn
            >
            <v-btn
              color="error"
              variant="flat"
              :loading="deleting"
              @click="deleteSupplier"
              class="flex-1-1"
              >Delete</v-btn
            >
          </v-card-actions>
        </v-card>
      </v-dialog>

      <!-- Snackbar -->
      <v-snackbar
        v-model="snackbar.show"
        :color="snackbar.color"
        location="bottom right"
        :timeout="3000"
        rounded="lg"
      >
        <v-icon class="mr-2">{{
          snackbar.color === 'success' ? 'mdi-check-circle' : 'mdi-alert-circle'
        }}</v-icon>
        {{ snackbar.message }}
      </v-snackbar>
    </v-container>
  </MainLayout>
</template>

<script setup>
import MainLayout from '@/layouts/full/MainLayout.vue'
import { ref, computed, onMounted } from 'vue'
import { supabase } from '@/services/supabase'
// ─── State ───────────────────────────────────────────────────────────────────
const suppliers = ref([])
const loading = ref(false)
const saving = ref(false)
const deleting = ref(false)
const search = ref('')
const statusFilter = ref('All')
const viewMode = ref('table')

const formDialog = ref(false)
const viewDialog = ref(false)
const deleteDialog = ref(false)
const isEditing = ref(false)
const selectedSupplier = ref(null)
const supplierToDelete = ref(null)
const formRef = ref(null)

const snackbar = ref({ show: false, message: '', color: 'success' })

const defaultForm = () => ({
  name: '',
  contact_person: '',
  email: '',
  phone: '',
  address: '',
  website: '',
  account_number: '',
  bank_name: '',
  notes: '',
  is_active: true
})
const form = ref(defaultForm())

// ─── Options ─────────────────────────────────────────────────────────────────
const statusOptions = ['All', 'Active', 'Inactive']

const headers = [
  { title: 'Supplier', key: 'name', minWidth: '220px' },
  { title: 'Contact Person', key: 'contact_person' },
  { title: 'Email', key: 'email' },
  { title: 'Phone', key: 'phone' },
  { title: 'Status', key: 'is_active', align: 'center' },
  { title: 'Actions', key: 'actions', sortable: false, align: 'center' }
]

// ─── Computed ─────────────────────────────────────────────────────────────────
const activeCount = computed(() => suppliers.value.filter((s) => s.is_active).length)
const inactiveCount = computed(() => suppliers.value.filter((s) => !s.is_active).length)

const filteredSuppliers = computed(() => {
  let list = suppliers.value
  if (statusFilter.value === 'Active') list = list.filter((s) => s.is_active)
  if (statusFilter.value === 'Inactive') list = list.filter((s) => !s.is_active)
  if (search.value) {
    const q = search.value.toLowerCase()
    list = list.filter(
      (s) =>
        s.name?.toLowerCase().includes(q) ||
        s.contact_person?.toLowerCase().includes(q) ||
        s.email?.toLowerCase().includes(q) ||
        s.phone?.toLowerCase().includes(q)
    )
  }
  return list
})

// ─── Validation Rules ─────────────────────────────────────────────────────────
const rules = {
  required: (v) => !!v || 'This field is required.',
  email: (v) => !v || /^\S+@\S+\.\S+$/.test(v) || 'Enter a valid email address.'
}

// ─── Helpers ─────────────────────────────────────────────────────────────────
const initials = (name) =>
  name
    ?.split(' ')
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join('') || '?'

const formatDate = (date) =>
  date
    ? new Date(date).toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      })
    : '—'

const notify = (message, color = 'success') => {
  snackbar.value = { show: true, message, color }
}

// ─── CRUD ─────────────────────────────────────────────────────────────────────
async function fetchSuppliers() {
  loading.value = true
  const { data, error } = await supabase
    .from('suppliers')
    .select('*')
    .order('created_at', { ascending: false })
  if (error) notify('Failed to load suppliers.', 'error')
  else suppliers.value = data
  loading.value = false
}

async function saveSupplier() {
  const { valid } = await formRef.value.validate()
  if (!valid) return

  saving.value = true
  const payload = { ...form.value }

  if (isEditing.value) {
    const { error } = await supabase
      .from('suppliers')
      .update({ ...payload, updated_at: new Date().toISOString() })
      .eq('id', selectedSupplier.value.id)
    if (error) notify('Failed to update supplier.', 'error')
    else {
      notify('Supplier updated successfully.')
      await fetchSuppliers()
      closeFormDialog()
    }
  } else {
    const { error } = await supabase.from('suppliers').insert([payload])
    if (error) notify('Failed to create supplier.', 'error')
    else {
      notify('Supplier created successfully.')
      await fetchSuppliers()
      closeFormDialog()
    }
  }
  saving.value = false
}

async function deleteSupplier() {
  deleting.value = true
  const { error } = await supabase.from('suppliers').delete().eq('id', supplierToDelete.value.id)
  if (error) notify('Failed to delete supplier.', 'error')
  else {
    notify('Supplier deleted.')
    suppliers.value = suppliers.value.filter((s) => s.id !== supplierToDelete.value.id)
    deleteDialog.value = false
  }
  deleting.value = false
}

// ─── Dialog Controls ──────────────────────────────────────────────────────────
function openCreateDialog() {
  isEditing.value = false
  form.value = defaultForm()
  formDialog.value = true
}

function openEditDialog(supplier) {
  isEditing.value = true
  selectedSupplier.value = supplier
  form.value = { ...supplier }
  formDialog.value = true
}

function openViewDialog(supplier) {
  selectedSupplier.value = supplier
  viewDialog.value = true
}

function confirmDelete(supplier) {
  supplierToDelete.value = supplier
  deleteDialog.value = true
}

function closeFormDialog() {
  formDialog.value = false
  formRef.value?.reset()
}

// ─── Lifecycle ────────────────────────────────────────────────────────────────
onMounted(fetchSuppliers)
</script>

<!-- detail-row sub-component (inline for single-file usage) -->
<script>
import { defineComponent, h } from 'vue'
export const DetailRow = defineComponent({
  name: 'DetailRow',
  props: { icon: String, label: String, value: String, isEmail: Boolean },
  setup(props) {
    return () =>
      props.value
        ? h('div', { class: 'detail-row-item' }, [
            h('div', { class: 'detail-row-label' }, [
              h('v-icon', { size: 14, class: 'mr-1' }, props.icon),
              props.label
            ]),
            props.isEmail
              ? h(
                  'a',
                  { href: `mailto:${props.value}`, class: 'contact-link detail-row-value' },
                  props.value
                )
              : h('div', { class: 'detail-row-value' }, props.value)
          ])
        : null
  }
})
</script>

<style scoped>
/* ── Page ── */
.v-btn {
  text-transform: none;
}
.suppliers-page {
  background: #f8f9fb;
  min-height: 100vh;
  font-family: 'DM Sans', sans-serif;
}

.page-subtitle {
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 1.5px;
  text-transform: uppercase;
  color: #94a3b8;
}

.page-title {
  font-size: 2rem;
  font-weight: 800;
  color: #0f172a;
  letter-spacing: -0.5px;
}

/* ── Stats ── */
.stats-row {
  display: flex;
  gap: 16px;
}

.stat-card {
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 14px 24px;
  display: flex;
  flex-direction: column;
  align-items: center;
  min-width: 90px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
}

.stat-value {
  font-size: 1.5rem;
  font-weight: 800;
  color: #0f172a;
  line-height: 1;
}

.stat-label {
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 1px;
  text-transform: uppercase;
  color: #94a3b8;
  margin-top: 4px;
}

/* ── Buttons ── */
.add-btn {
  background: #0f172a !important;
  color: white !important;
  border-radius: 10px;
  font-weight: 600;
  letter-spacing: 0.3px;
  padding: 0 24px;
  height: 44px;
}

.save-btn {
  background: #0f172a !important;
  color: white !important;
  border-radius: 8px;
  font-weight: 600;
  padding: 0 28px;
}

/* ── Data Table ── */
.data-card {
  border: 1px solid #e2e8f0;
  border-radius: 16px;
  overflow: hidden;
}

.suppliers-table :deep(th) {
  background: #f8f9fb !important;
  font-size: 11px !important;
  font-weight: 700 !important;
  letter-spacing: 1px !important;
  text-transform: uppercase !important;
  color: #64748b !important;
}

.suppliers-table :deep(tr:hover td) {
  background: #f1f5f9;
}

.supplier-avatar {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  font-weight: 700;
  font-size: 13px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.supplier-avatar.large {
  width: 48px;
  height: 48px;
  font-size: 16px;
  border-radius: 14px;
}

.supplier-name {
  font-size: 14px;
  color: #0f172a;
}

.contact-link {
  color: #6366f1;
  text-decoration: none;
  font-size: 13px;
}
.contact-link:hover {
  text-decoration: underline;
}

/* ── Grid View ── */
.grid-view {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 16px;
}

.supplier-card {
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 16px;
  overflow: hidden;
  transition:
    box-shadow 0.2s,
    transform 0.2s;
}
.supplier-card:hover {
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
  transform: translateY(-2px);
}

.card-header-strip {
  height: 4px;
}
.active-strip {
  background: linear-gradient(90deg, #22c55e, #16a34a);
}
.inactive-strip {
  background: linear-gradient(90deg, #f87171, #dc2626);
}

.card-body {
  padding: 20px;
}
.card-actions {
  border-top: 1px solid #f1f5f9;
  padding: 8px 12px;
  display: flex;
  align-items: center;
}

.card-name {
  font-size: 15px;
  font-weight: 700;
  color: #0f172a;
}

.card-contact {
  font-size: 12px;
  color: #64748b;
  display: flex;
  align-items: center;
  gap: 4px;
}

.card-details {
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.detail-row {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: #475569;
}

/* ── Dialogs ── */
.form-dialog-card {
  border-radius: 20px !important;
  overflow: hidden;
}

.dialog-header {
  padding: 24px 24px 20px;
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
}

.dialog-sub {
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 1.2px;
  text-transform: uppercase;
  color: #94a3b8;
  margin: 0 0 4px;
}

.dialog-title {
  font-size: 1.4rem;
  font-weight: 800;
  color: #0f172a;
  letter-spacing: -0.3px;
}

.form-section-label {
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 1.2px;
  text-transform: uppercase;
  color: #64748b;
  display: flex;
  align-items: center;
}

/* ── View Dialog Detail Rows ── */
.detail-grid {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.detail-row-item {
  display: grid;
  grid-template-columns: 150px 1fr;
  gap: 8px;
  align-items: start;
}

.detail-row-label {
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.8px;
  text-transform: uppercase;
  color: #94a3b8;
  display: flex;
  align-items: center;
  padding-top: 2px;
}

.detail-row-value {
  font-size: 14px;
  color: #0f172a;
  font-weight: 500;
  white-space: pre-wrap;
}

/* ── Delete ── */
.delete-icon-wrap {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: #fef2f2;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto;
}

/* ── Filters ── */
.search-field :deep(.v-field) {
  border-radius: 10px;
  background: white;
}
.status-filter :deep(.v-field) {
  border-radius: 10px;
  background: white;
}
.view-toggle {
  display: flex;
  gap: 4px;
  background: white;
  border-radius: 10px;
  padding: 4px;
  border: 1px solid #e2e8f0;
}
</style>
