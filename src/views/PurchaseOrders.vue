<template>
  <MainLayout>
    <div class="sr-page">
      <div class="sr-bg-mesh" />

      <!-- PAGE HEADER -->
      <div class="sr-header px-6 pt-6 pb-4">
        <div class="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div class="flex items-center gap-2 mb-1">
              <div class="sr-header-icon">
                <v-icon color="#0f4c81" size="22">mdi-cart-outline</v-icon>
              </div>
              <h1 class="sr-page-title">Purchase Orders</h1>
            </div>
            <p class="sr-page-subtitle">Manage and track all purchase orders</p>
          </div>
          <v-btn
            color="#0f4c81"
            prepend-icon="mdi-plus"
            rounded="lg"
            elevation="0"
            class="sr-primary-btn"
            @click="openCreateDialog"
          >
            New PO
          </v-btn>
        </div>

        <!-- Stats -->
        <div class="sr-stats mt-5 grid grid-cols-2 md:grid-cols-5 gap-3">
          <div v-for="s in summaryStats" :key="s.label" class="sr-stat-card">
            <div class="sr-stat-icon" :style="{ background: s.bg }">
              <v-icon :color="s.color" size="18">{{ s.icon }}</v-icon>
            </div>
            <div>
              <p class="sr-stat-val">{{ s.value }}</p>
              <p class="sr-stat-lbl">{{ s.label }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- FILTERS -->
      <div class="sr-filters px-6 py-3">
        <div class="flex flex-wrap gap-3 items-center">
          <v-text-field
            v-model="search"
            placeholder="Search by PO number, supplier, supply…"
            prepend-inner-icon="mdi-magnify"
            variant="outlined"
            density="compact"
            hide-details
            rounded="lg"
            bg-color="white"
            style="min-width: 220px; max-width: 340px"
            class="flex-1"
          />
          <v-select
            v-model="filterStatus"
            :items="statusFilterOptions"
            label="Status"
            variant="outlined"
            density="compact"
            hide-details
            rounded="lg"
            bg-color="white"
            style="min-width: 160px; max-width: 200px"
          />
        </div>
      </div>

      <!-- LOADING -->
      <div
        v-if="loading"
        class="fixed inset-0 bg-white/80 backdrop-blur-sm flex flex-col items-center justify-center z-50"
      >
        <v-progress-circular indeterminate color="#0f4c81" size="56" width="2" />
        <p class="mt-4 text-sm text-gray-500 font-medium">Loading purchase orders…</p>
      </div>

      <!-- TABLE -->
      <div v-else class="px-6 pb-10">
        <v-card rounded="xl" elevation="0" class="sr-table-card overflow-hidden">
          <v-data-table
            :headers="tableHeaders"
            :items="filteredPOs"
            :search="search"
            class="sr-table"
            hover
            @click:row="(_, row) => openDetailDialog(row.item)"
          >
            <template #item.po_number="{ item }">
              <span class="sr-request-num">{{ item.po_number }}</span>
            </template>

            <template #item.supply="{ item }">
              <div class="flex items-center gap-2 py-1">
                <div class="sr-tbl-icon" :style="{ background: '#e8f0fb' }">
                  <v-icon color="#0f4c81" size="16">mdi-package-variant</v-icon>
                </div>
                <div>
                  <p class="font-semibold text-sm leading-tight">{{ item.supplies?.name }}</p>
                  <p class="text-xs text-grey-darken-1">{{ item.quantity }} units</p>
                </div>
              </div>
            </template>

            <template #item.supplier="{ item }">
              <div class="flex items-center gap-2">
                <v-avatar size="28" color="#e8f0fb">
                  <span class="text-xs font-bold" style="color: #0f4c81">
                    {{ initials(item.suppliers?.name) }}
                  </span>
                </v-avatar>
                <span class="text-sm">{{ item.suppliers?.name }}</span>
              </div>
            </template>

            <template #item.status="{ item }">
              <v-chip
                size="small"
                :color="statusColor(item.status)"
                variant="tonal"
                rounded="lg"
                class="font-semibold"
              >
                <v-icon start size="12">{{ statusIcon(item.status) }}</v-icon>
                {{ statusLabel(item.status) }}
              </v-chip>
            </template>

            <template #item.grand_total="{ item }">
              <span class="font-semibold" style="color: #0f4c81">
                ₦{{ Number(item.grand_total || 0).toLocaleString() }}
              </span>
            </template>

            <template #item.created_at="{ item }">
              <span class="text-sm text-grey">{{ formatDate(item.created_at) }}</span>
            </template>

            <template #item.actions="{ item }">
              <div class="flex gap-1" @click.stop>
                <v-tooltip text="View" location="top">
                  <template #activator="{ props }">
                    <v-btn
                      v-bind="props"
                      icon="mdi-eye-outline"
                      size="x-small"
                      color="#0f4c81"
                      variant="tonal"
                      rounded="lg"
                      @click="openDetailDialog(item)"
                    />
                  </template>
                </v-tooltip>
                <v-tooltip text="Edit" location="top">
                  <template #activator="{ props }">
                    <v-btn
                      v-bind="props"
                      icon="mdi-pencil-outline"
                      size="x-small"
                      color="grey"
                      variant="text"
                      rounded="lg"
                      :disabled="item.status !== 'draft'"
                      @click="openEditDialog(item)"
                    />
                  </template>
                </v-tooltip>
                <v-tooltip text="Delete" location="top">
                  <template #activator="{ props }">
                    <v-btn
                      v-bind="props"
                      icon="mdi-delete-outline"
                      size="x-small"
                      color="error"
                      variant="text"
                      rounded="lg"
                      :disabled="item.status !== 'draft'"
                      @click="confirmDelete(item)"
                    />
                  </template>
                </v-tooltip>
              </div>
            </template>

            <template #no-data>
              <div class="sr-empty py-16 text-center">
                <v-icon size="56" color="#0f4c81" style="opacity: 0.25">mdi-cart-outline</v-icon>
                <p class="mt-3 font-semibold text-grey-darken-2">No purchase orders found</p>
                <p class="text-sm text-grey mt-1">Create a new PO from an approved request</p>
                <v-btn
                  color="#0f4c81"
                  variant="tonal"
                  rounded="lg"
                  prepend-icon="mdi-plus"
                  class="mt-4"
                  @click="openCreateDialog"
                >
                  New PO
                </v-btn>
              </div>
            </template>
          </v-data-table>
        </v-card>
      </div>

      <!-- ══ CREATE / EDIT DIALOG ══ -->
      <v-dialog v-model="formDialog" max-width="580" scrollable>
        <v-card rounded="xl" elevation="0">
          <div class="sr-dialog-header">
            <div class="flex items-center justify-between">
              <h3 class="text-white font-bold text-lg">
                {{ editMode ? `Edit PO: ${formFields.po_number}` : 'New Purchase Order' }}
              </h3>
              <v-btn
                icon="mdi-close"
                variant="text"
                color="white"
                size="small"
                @click="formDialog = false"
              />
            </div>
            <p class="text-white text-xs opacity-60 mt-1">
              {{
                editMode
                  ? 'Update PO details below.'
                  : 'Raise a PO from an approved supply request.'
              }}
            </p>
          </div>

          <v-card-text class="pa-5">
            <v-form ref="formRef" v-model="formValid">
              <!-- Request picker (create only) -->
              <v-autocomplete
                v-if="!editMode"
                v-model="formFields.request_id"
                :items="approvedRequests"
                item-title="label"
                item-value="id"
                label="Approved Request *"
                variant="outlined"
                density="comfortable"
                rounded="lg"
                prepend-inner-icon="mdi-clipboard-check-outline"
                :rules="[(v) => !!v || 'Required']"
                @update:model-value="onRequestSelected"
              />

              <!-- Supplier -->
              <v-autocomplete
                v-model="formFields.supplier_id"
                :items="suppliers"
                item-title="name"
                item-value="id"
                label="Supplier *"
                variant="outlined"
                density="comfortable"
                rounded="lg"
                prepend-inner-icon="mdi-truck-outline"
                :rules="[(v) => !!v || 'Required']"
                class="mt-1"
              />

              <div class="grid grid-cols-2 gap-4 mt-1">
                <v-text-field
                  v-model.number="formFields.quantity"
                  label="Quantity *"
                  type="number"
                  variant="outlined"
                  density="comfortable"
                  rounded="lg"
                  prepend-inner-icon="mdi-counter"
                  :rules="[(v) => !!v || 'Required', (v) => v > 0 || 'Must be > 0']"
                  @update:model-value="calcTotal"
                />
                <v-text-field
                  v-model.number="formFields.unit_price"
                  label="Unit Price *"
                  type="number"
                  variant="outlined"
                  density="comfortable"
                  rounded="lg"
                  prepend-inner-icon="mdi-currency-ngn"
                  :rules="[(v) => !!v || 'Required', (v) => v > 0 || 'Must be > 0']"
                  @update:model-value="calcTotal"
                />
              </div>

              <div class="grid grid-cols-2 gap-4 mt-1">
                <v-text-field
                  v-model.number="formFields.tax_amount"
                  label="Tax Amount"
                  type="number"
                  variant="outlined"
                  density="comfortable"
                  rounded="lg"
                  prepend-inner-icon="mdi-percent"
                  @update:model-value="calcTotal"
                />
                <v-text-field
                  :model-value="formFields.supplier_id ? `₦${grandTotal.toLocaleString()}` : '—'"
                  label="Grand Total"
                  variant="outlined"
                  density="comfortable"
                  rounded="lg"
                  prepend-inner-icon="mdi-cash"
                  readonly
                  bg-color="#f5f8fc"
                />
              </div>

              <v-menu v-model="deliveryDateMenu" :close-on-content-click="false">
                <template #activator="{ props }">
                  <v-text-field
                    v-bind="props"
                    v-model="formFields.expected_delivery_display"
                    label="Expected Delivery Date"
                    variant="outlined"
                    density="comfortable"
                    rounded="lg"
                    prepend-inner-icon="mdi-calendar-outline"
                    readonly
                    clearable
                    class="mt-1"
                    @click:clear="clearDeliveryDate"
                  />
                </template>

                <v-date-picker
                  v-model="formFields.expected_delivery_date"
                  color="#0f4c81"
                  :min="todayStr"
                  @update:model-value="onDeliveryDatePicked"
                />
              </v-menu>
              <v-textarea
                v-model="formFields.notes"
                label="Notes (optional)"
                variant="outlined"
                density="comfortable"
                rounded="lg"
                rows="3"
                prepend-inner-icon="mdi-text-box-outline"
                class="mt-1"
              />
            </v-form>

            <v-alert
              v-if="formError"
              type="error"
              variant="tonal"
              rounded="lg"
              class="mt-3"
              closable
              @click:close="formError = ''"
            >
              {{ formError }}
            </v-alert>
          </v-card-text>

          <v-card-actions class="pa-5 pt-0">
            <v-btn variant="text" color="grey" rounded="lg" @click="formDialog = false"
              >Cancel</v-btn
            >
            <v-spacer />
            <v-btn
              color="#0f4c81"
              rounded="lg"
              elevation="0"
              :prepend-icon="editMode ? 'mdi-content-save-outline' : 'mdi-send-outline'"
              :loading="savingForm"
              @click="submitForm"
            >
              {{ editMode ? 'Save Changes' : 'Create PO' }}
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>

      <!-- ══ DETAIL DIALOG ══ -->
      <v-dialog v-model="detailDialog" max-width="640" scrollable>
        <v-card v-if="selectedPO" rounded="xl" elevation="0">
          <div class="sr-detail-header">
            <v-btn
              icon="mdi-close"
              variant="text"
              color="white"
              size="small"
              class="sr-detail-close"
              @click="detailDialog = false"
            />
            <div class="flex items-start gap-4">
              <div class="sr-detail-icon-wrap">
                <v-icon color="white" size="28">mdi-cart-outline</v-icon>
              </div>
              <div class="flex-1">
                <p class="text-white text-xs opacity-60 uppercase tracking-widest font-semibold">
                  Purchase Order
                </p>
                <p class="text-white font-bold text-lg">{{ selectedPO.po_number }}</p>
                <p class="text-white text-sm opacity-70 mt-0.5">{{ selectedPO.supplies?.name }}</p>
              </div>
              <v-chip
                size="small"
                :color="statusColor(selectedPO.status)"
                variant="flat"
                rounded="lg"
                class="font-bold"
              >
                <v-icon start size="12">{{ statusIcon(selectedPO.status) }}</v-icon>
                {{ statusLabel(selectedPO.status) }}
              </v-chip>
            </div>

            <div class="sr-detail-stats mt-4 grid grid-cols-3 gap-3">
              <div class="sr-detail-stat">
                <p class="sr-detail-stat-val">{{ selectedPO.quantity }}</p>
                <p class="sr-detail-stat-lbl">Quantity</p>
              </div>
              <div class="sr-detail-stat">
                <p class="sr-detail-stat-val">
                  ₦{{ Number(selectedPO.unit_price || 0).toLocaleString() }}
                </p>
                <p class="sr-detail-stat-lbl">Unit Price</p>
              </div>
              <div class="sr-detail-stat">
                <p class="sr-detail-stat-val">
                  ₦{{ Number(selectedPO.grand_total || 0).toLocaleString() }}
                </p>
                <p class="sr-detail-stat-lbl">Grand Total</p>
              </div>
            </div>
          </div>

          <v-card-text class="pa-5">
            <div class="grid grid-cols-2 gap-4">
              <div class="sr-info-item">
                <v-icon size="15" color="#0f4c81">mdi-truck-outline</v-icon>
                <div>
                  <p class="sr-info-lbl">Supplier</p>
                  <p class="sr-info-val">{{ selectedPO.suppliers?.name }}</p>
                </div>
              </div>
              <div class="sr-info-item">
                <v-icon size="15" color="#0f4c81">mdi-account-outline</v-icon>
                <div>
                  <p class="sr-info-lbl">Raised By</p>
                  <p class="sr-info-val">
                    {{ selectedPO.raised_by_user?.first_name }}
                    {{ selectedPO.raised_by_user?.last_name }}
                  </p>
                </div>
              </div>
              <div class="sr-info-item">
                <v-icon size="15" color="#0f4c81">mdi-calendar-plus-outline</v-icon>
                <div>
                  <p class="sr-info-lbl">Created</p>
                  <p class="sr-info-val">{{ formatDate(selectedPO.created_at) }}</p>
                </div>
              </div>
              <div class="sr-info-item">
                <v-icon size="15" color="#0f4c81">mdi-calendar-clock-outline</v-icon>
                <div>
                  <p class="sr-info-lbl">Expected Delivery</p>
                  <p class="sr-info-val">
                    {{
                      selectedPO.expected_delivery_date
                        ? formatDate(selectedPO.expected_delivery_date)
                        : '—'
                    }}
                  </p>
                </div>
              </div>
              <div class="sr-info-item">
                <v-icon size="15" color="#0f4c81">mdi-percent</v-icon>
                <div>
                  <p class="sr-info-lbl">Tax Amount</p>
                  <p class="sr-info-val">
                    ₦{{ Number(selectedPO.tax_amount || 0).toLocaleString() }}
                  </p>
                </div>
              </div>
              <div class="sr-info-item">
                <v-icon size="15" color="#0f4c81">mdi-clipboard-check-outline</v-icon>
                <div>
                  <p class="sr-info-lbl">Linked Request</p>
                  <p class="sr-info-val">
                    #{{ selectedPO.supply_requests?.request_number || '—' }}
                  </p>
                </div>
              </div>
            </div>

            <div v-if="selectedPO.notes" class="mt-4 p-4 rounded-xl" style="background: #f5f8fc">
              <p class="text-xs font-semibold text-grey-darken-2 mb-1">Notes</p>
              <p class="text-sm" style="color: #374151">{{ selectedPO.notes }}</p>
            </div>

            <!-- Status timeline -->
            <div class="mt-5">
              <p class="text-sm font-bold mb-3" style="color: #0f4c81">Status Timeline</p>
              <div class="space-y-2">
                <div
                  v-for="step in statusTimeline(selectedPO)"
                  :key="step.label"
                  class="flex items-center gap-3"
                >
                  <v-icon :color="step.done ? step.color : 'grey'" size="18">
                    {{ step.done ? 'mdi-check-circle' : 'mdi-circle-outline' }}
                  </v-icon>
                  <div class="flex-1">
                    <span class="text-sm" :class="step.done ? 'font-semibold' : 'text-grey'">{{
                      step.label
                    }}</span>
                  </div>
                  <span v-if="step.date" class="text-xs text-grey">{{
                    formatDate(step.date)
                  }}</span>
                </div>
              </div>
            </div>
          </v-card-text>

          <!-- Status update actions -->
          <v-card-actions class="pa-5 pt-0 gap-2 flex-wrap">
            <v-spacer />
            <template v-if="selectedPO.status === 'draft'">
              <v-btn
                color="grey"
                variant="tonal"
                rounded="lg"
                prepend-icon="mdi-pencil-outline"
                @click="openEditFromDetail"
                >Edit</v-btn
              >
              <v-btn
                color="error"
                variant="tonal"
                rounded="lg"
                prepend-icon="mdi-delete-outline"
                @click="confirmDeleteFromDetail"
                >Delete</v-btn
              >
              <v-btn
                color="#0f4c81"
                variant="flat"
                rounded="lg"
                prepend-icon="mdi-send-outline"
                :loading="updatingStatus"
                @click="updateStatus('sent')"
                >Mark as Sent</v-btn
              >
            </template>
            <template v-else-if="selectedPO.status === 'sent'">
              <v-btn
                color="#0f4c81"
                variant="flat"
                rounded="lg"
                prepend-icon="mdi-check"
                :loading="updatingStatus"
                @click="updateStatus('acknowledged')"
                >Mark Acknowledged</v-btn
              >
            </template>
            <template v-else-if="selectedPO.status === 'acknowledged'">
              <v-btn
                color="success"
                variant="flat"
                rounded="lg"
                prepend-icon="mdi-package-check"
                :loading="updatingStatus"
                @click="updateStatus('fulfilled')"
                >Mark Fulfilled</v-btn
              >
            </template>
            <v-btn
              color="#0f4c81"
              variant="tonal"
              rounded="lg"
              prepend-icon="mdi-file-pdf-box"
              :loading="loadingPDF"
              @click="downloadPO(selectedPO)"
            >
              Export PDF
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>

      <!-- ══ DELETE CONFIRM ══ -->
      <v-dialog v-model="deleteDialog" max-width="400">
        <v-card rounded="xl" elevation="0" class="pa-2">
          <v-card-text class="text-center pa-6">
            <div class="sr-delete-icon mx-auto mb-4">
              <v-icon color="error" size="28">mdi-alert-circle-outline</v-icon>
            </div>
            <h3 class="font-bold text-lg mb-2">Delete this PO?</h3>
            <p class="text-grey text-sm">
              Purchase Order <strong>{{ poToDelete?.po_number }}</strong> will be permanently
              deleted. This cannot be undone.
            </p>
          </v-card-text>
          <v-card-actions class="pb-4 px-4 gap-2">
            <v-btn
              variant="outlined"
              color="grey"
              rounded="lg"
              class="flex-1"
              :disabled="deletingPO"
              @click="deleteDialog = false"
              >Keep</v-btn
            >
            <v-btn
              color="error"
              rounded="lg"
              class="flex-1"
              elevation="0"
              :loading="deletingPO"
              @click="deletePO"
              >Delete</v-btn
            >
          </v-card-actions>
        </v-card>
      </v-dialog>

      <!-- Snackbar -->
      <v-snackbar
        v-model="snackbar.show"
        :color="snackbar.color"
        rounded="lg"
        location="bottom right"
        :timeout="3500"
      >
        <div class="flex items-center gap-2">
          <v-icon>{{ snackbar.icon }}</v-icon>
          {{ snackbar.text }}
        </div>
      </v-snackbar>
    </div>
  </MainLayout>
</template>

<script setup>
import { ref, computed, reactive, onMounted } from 'vue'
import MainLayout from '@/layouts/full/MainLayout.vue'
import ApiService from '@/services/api'
import { supabase } from '@/services/supabase.js'
import { usePOExport } from '@/composables/Usepoexport'
const { downloadPO, loadingPDF } = usePOExport()

// ─── STATE ───────────────────────────────────────────────
const loading = ref(false)
const purchaseOrders = ref([])
const suppliers = ref([])
const approvedRequests = ref([])
const search = ref('')
const filterStatus = ref('All')

const formDialog = ref(false)
const detailDialog = ref(false)
const deleteDialog = ref(false)
const deliveryDateMenu = ref(false)
const editMode = ref(false)

const formRef = ref(null)
const formValid = ref(false)
const savingForm = ref(false)
const formError = ref('')
const grandTotal = ref(0)
const updatingStatus = ref(false)

const selectedPO = ref(null)
const poToDelete = ref(null)
const deletingPO = ref(false)

const formFields = reactive({
  id: null,
  po_number: null,
  request_id: null,
  supplier_id: null,
  quantity: 1,
  unit_price: 0,
  tax_amount: 0,
  expected_delivery_date: null,
  expected_delivery_display: '',
  notes: ''
})

const snackbar = reactive({ show: false, text: '', color: 'success', icon: 'mdi-check-circle' })
const todayStr = new Date().toISOString().split('T')[0]

const statusFilterOptions = ['All', 'draft', 'sent', 'acknowledged', 'fulfilled', 'cancelled']

// ─── COMPUTED ────────────────────────────────────────────
const filteredPOs = computed(() => {
  return purchaseOrders.value.filter((po) => {
    const q = search.value.toLowerCase()
    const matchSearch =
      !q ||
      (po.po_number || '').toLowerCase().includes(q) ||
      (po.suppliers?.name || '').toLowerCase().includes(q) ||
      (po.supplies?.name || '').toLowerCase().includes(q)
    const matchStatus = filterStatus.value === 'All' || po.status === filterStatus.value
    return matchSearch && matchStatus
  })
})

const clearDeliveryDate = () => {
  formFields.expected_delivery_date = null
  formFields.expected_delivery_display = ''
}

const summaryStats = computed(() => {
  const all = purchaseOrders.value
  return [
    {
      label: 'Total',
      value: all.length,
      icon: 'mdi-cart-outline',
      color: '#0f4c81',
      bg: '#e8f0fb'
    },
    {
      label: 'Draft',
      value: all.filter((p) => p.status === 'draft').length,
      icon: 'mdi-file-outline',
      color: '#d97706',
      bg: '#fef3c7'
    },
    {
      label: 'Sent',
      value: all.filter((p) => p.status === 'sent').length,
      icon: 'mdi-send-outline',
      color: '#0284c7',
      bg: '#e0f2fe'
    },
    {
      label: 'Fulfilled',
      value: all.filter((p) => p.status === 'fulfilled').length,
      icon: 'mdi-package-check',
      color: '#059669',
      bg: '#d1fae5'
    },
    {
      label: 'Cancelled',
      value: all.filter((p) => p.status === 'cancelled').length,
      icon: 'mdi-cancel',
      color: '#64748b',
      bg: '#f1f5f9'
    }
  ]
})

// ─── TABLE HEADERS ───────────────────────────────────────
const tableHeaders = [
  { title: 'PO Number', key: 'po_number', sortable: true },
  { title: 'Supply', key: 'supply', sortable: false },
  { title: 'Supplier', key: 'supplier', sortable: false },
  { title: 'Status', key: 'status', sortable: true },
  { title: 'Total', key: 'grand_total', sortable: true },
  { title: 'Created', key: 'created_at', sortable: true },
  { title: 'Actions', key: 'actions', sortable: false, align: 'center' }
]

// ─── FETCH ───────────────────────────────────────────────
async function fetchPOs() {
  loading.value = true
  try {
    const res = await ApiService.get('/purchase-orders?limit=100')
    purchaseOrders.value = res.data.purchase_orders || []
    console.log("PO'S:", purchaseOrders.value)
  } catch (err) {
    console.error('fetchPOs error:', err)
    showSnack('Failed to load purchase orders.', 'error', 'mdi-alert-circle-outline')
  } finally {
    loading.value = false
  }
}

async function fetchSuppliers() {
  const { data } = await supabase
    .from('suppliers')
    .select('id, name, email, contact_person')
    .eq('is_active', true)
    .order('name')
  suppliers.value = data || []
}

async function fetchApprovedRequests() {
  const { data } = await supabase
    .from('v_supply_requests_full')
    .select('id, request_number, supply_name, quantity_approved, unit_price')
    .eq('status', 'approved')
    .order('submitted_at', { ascending: false })
  approvedRequests.value = (data || []).map((r) => ({
    ...r,
    label: `#${r.request_number} — ${r.supply_name}`
  }))
}

onMounted(() => {
  fetchPOs()
  fetchSuppliers()
  fetchApprovedRequests()
})

// ─── CREATE DIALOG ───────────────────────────────────────
function openCreateDialog() {
  editMode.value = false
  Object.assign(formFields, {
    id: null,
    po_number: null,
    request_id: null,
    supplier_id: null,
    quantity: 1,
    unit_price: 0,
    tax_amount: 0,
    expected_delivery_date: null,
    expected_delivery_display: '',
    notes: ''
  })
  grandTotal.value = 0
  formError.value = ''
  formDialog.value = true
}

// ─── EDIT DIALOG ─────────────────────────────────────────
function openEditDialog(po) {
  editMode.value = true
  Object.assign(formFields, {
    id: po.id,
    po_number: po.po_number,
    request_id: po.request_id,
    supplier_id: po.supplier_id,
    quantity: po.quantity,
    unit_price: po.unit_price,
    tax_amount: po.tax_amount || 0,
    expected_delivery_date: po.expected_delivery_date || null,
    expected_delivery_display: po.expected_delivery_date
      ? formatDate(po.expected_delivery_date)
      : '',
    notes: po.notes || ''
  })
  grandTotal.value = Number(po.grand_total || 0)
  formError.value = ''
  formDialog.value = true
}

function openEditFromDetail() {
  openEditDialog(selectedPO.value)
  detailDialog.value = false
}

// ─── REQUEST SELECTED ────────────────────────────────────
function onRequestSelected(id) {
  const req = approvedRequests.value.find((r) => r.id === id)
  if (req) {
    formFields.quantity = req.quantity_approved || 1
    formFields.unit_price = Number(req.unit_price || 0)
    calcTotal()
  }
}

// ─── CALC TOTAL ──────────────────────────────────────────
function calcTotal() {
  grandTotal.value =
    (formFields.quantity || 0) * (formFields.unit_price || 0) + (formFields.tax_amount || 0)
}

// ─── DATE PICKED ─────────────────────────────────────────
function onDeliveryDatePicked(date) {
  formFields.expected_delivery_display = formatDate(date)
  deliveryDateMenu.value = false
}

// ─── SUBMIT FORM ─────────────────────────────────────────
async function submitForm() {
  const { valid } = (await formRef.value?.validate()) ?? { valid: true }
  if (!valid) return

  savingForm.value = true
  formError.value = ''

  try {
    if (editMode.value) {
      await ApiService.patch('/purchase-orders', {
        action: 'update',
        id: formFields.id,
        supplier_id: formFields.supplier_id,
        quantity: Number(formFields.quantity),
        unit_price: Number(formFields.unit_price),
        tax_amount: Number(formFields.tax_amount || 0),
        expected_delivery_date: formFields.expected_delivery_date || null,
        notes: formFields.notes || null
      })
      showSnack(`PO ${formFields.po_number} updated.`, 'success', 'mdi-check-circle-outline')
    } else {
      await ApiService.post('/purchase-orders', {
        request_id: formFields.request_id,
        supplier_id: formFields.supplier_id,
        quantity: Number(formFields.quantity),
        unit_price: Number(formFields.unit_price),
        tax_amount: Number(formFields.tax_amount || 0),
        expected_delivery_date: formFields.expected_delivery_date || null,
        notes: formFields.notes || null
      })
      showSnack('Purchase order created!', 'success', 'mdi-check-circle-outline')
    }
    formDialog.value = false
    await fetchPOs()
    await fetchApprovedRequests()
  } catch (err) {
    formError.value = err?.response?.data?.error || 'Failed to save. Please try again.'
    console.error('submitForm error:', err)
  } finally {
    savingForm.value = false
  }
}

// ─── DETAIL DIALOG ───────────────────────────────────────
async function openDetailDialog(po) {
  selectedPO.value = po
  detailDialog.value = true
  try {
    const res = await ApiService.get(`/purchase-orders?action=get&id=${po.id}`)
    selectedPO.value = res.data
  } catch (err) {
    console.warn('Could not fetch full PO details:', err)
  }
}

// ─── UPDATE STATUS ───────────────────────────────────────
async function updateStatus(status) {
  if (!selectedPO.value) return
  updatingStatus.value = true
  try {
    await ApiService.patch('/purchase-orders', {
      action: 'update_status',
      id: selectedPO.value.id,
      status
    })
    showSnack(`PO marked as ${statusLabel(status)}.`, 'success', 'mdi-check-circle-outline')
    detailDialog.value = false
    await fetchPOs()
  } catch (err) {
    showSnack(
      err?.response?.data?.error || 'Failed to update status.',
      'error',
      'mdi-alert-circle-outline'
    )
  } finally {
    updatingStatus.value = false
  }
}

// ─── DELETE ──────────────────────────────────────────────
function confirmDelete(po) {
  poToDelete.value = po
  deleteDialog.value = true
}

function confirmDeleteFromDetail() {
  confirmDelete(selectedPO.value)
  detailDialog.value = false
}

async function deletePO() {
  if (!poToDelete.value) return
  deletingPO.value = true
  try {
    await ApiService.patch('/purchase-orders', {
      action: 'delete',
      id: poToDelete.value.id
    })
    showSnack(`PO ${poToDelete.value.po_number} deleted.`, 'warning', 'mdi-delete-outline')
    deleteDialog.value = false
    await fetchPOs()
  } catch (err) {
    showSnack(
      err?.response?.data?.error || 'Failed to delete PO.',
      'error',
      'mdi-alert-circle-outline'
    )
  } finally {
    deletingPO.value = false
  }
}

// ─── HELPERS ─────────────────────────────────────────────
function statusLabel(s) {
  const map = {
    draft: 'Draft',
    sent: 'Sent',
    acknowledged: 'Acknowledged',
    fulfilled: 'Fulfilled',
    cancelled: 'Cancelled'
  }
  return map[s] || s
}
function statusColor(s) {
  const map = {
    draft: 'warning',
    sent: 'info',
    acknowledged: 'purple',
    fulfilled: 'success',
    cancelled: 'grey'
  }
  return map[s] || 'grey'
}
function statusIcon(s) {
  const map = {
    draft: 'mdi-file-outline',
    sent: 'mdi-send-outline',
    acknowledged: 'mdi-check',
    fulfilled: 'mdi-package-check',
    cancelled: 'mdi-cancel'
  }
  return map[s] || 'mdi-help-circle-outline'
}
function statusTimeline(po) {
  return [
    { label: 'Draft created', done: true, color: '#0f4c81', date: po.created_at },
    {
      label: 'Sent to supplier',
      done: ['sent', 'acknowledged', 'fulfilled'].includes(po.status),
      color: '#0284c7',
      date: po.sent_at
    },
    {
      label: 'Acknowledged',
      done: ['acknowledged', 'fulfilled'].includes(po.status),
      color: '#7c3aed',
      date: po.acknowledged_at
    },
    { label: 'Fulfilled', done: po.status === 'fulfilled', color: '#059669', date: po.fulfilled_at }
  ]
}
function formatDate(d) {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('en-NG', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}
function initials(name) {
  if (!name) return '?'
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}
function showSnack(text, color = 'success', icon = 'mdi-check-circle') {
  snackbar.text = text
  snackbar.color = color
  snackbar.icon = icon
  snackbar.show = true
}
</script>

<style scoped>
.v-btn {
  text-transform: none;
}
.sr-page {
  position: relative;
  min-height: 100vh;
  background: #f4f7fc;
}

.sr-bg-mesh {
  position: fixed;
  inset: 0;
  pointer-events: none;
  z-index: 0;
  background: radial-gradient(
      ellipse 600px 400px at 80% 10%,
      rgba(15, 76, 129, 0.05) 0%,
      transparent 70%
    ),
    radial-gradient(ellipse 400px 300px at 10% 80%, rgba(15, 76, 129, 0.04) 0%, transparent 70%);
}

.sr-header {
  position: relative;
  z-index: 1;
}

.sr-header-icon {
  width: 36px;
  height: 36px;
  background: #e8f0fb;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.sr-page-title {
  font-size: 1.5rem;
  font-weight: 800;
  color: #0f2942;
  letter-spacing: -0.02em;
}
.sr-page-subtitle {
  font-size: 0.875rem;
  color: #64748b;
  margin-top: 2px;
}

.sr-primary-btn {
  font-weight: 600;
  letter-spacing: 0;
}

/* Stats */
.sr-stat-card {
  background: white;
  border-radius: 14px;
  padding: 14px 16px;
  display: flex;
  align-items: center;
  gap: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.06);
}
.sr-stat-icon {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.sr-stat-val {
  font-size: 1.25rem;
  font-weight: 800;
  color: #0f2942;
  line-height: 1;
}
.sr-stat-lbl {
  font-size: 0.72rem;
  color: #94a3b8;
  margin-top: 3px;
  white-space: nowrap;
}

/* Filters */
.sr-filters {
  position: relative;
  z-index: 1;
}
.sr-view-toggle {
  display: flex;
  gap: 4px;
  background: white;
  padding: 3px;
  border-radius: 10px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.07);
}

/* Table */
.sr-table-card {
  border: 1px solid #e8eef6;
}
.sr-table :deep(.v-data-table__tr:hover td) {
  background: #f5f8fd !important;
  cursor: pointer;
}
.sr-request-num {
  font-family: 'Courier New', monospace;
  font-weight: 700;
  color: #0f4c81;
  font-size: 0.8rem;
}
.sr-tbl-icon {
  width: 30px;
  height: 30px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

/* Cards */
.sr-card {
  background: white;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  cursor: pointer;
  transition:
    transform 0.18s ease,
    box-shadow 0.18s ease;
  position: relative;
}
.sr-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 24px rgba(15, 76, 129, 0.12);
}
.sr-card-strip {
  height: 4px;
  width: 100%;
}
.sr-card-body {
  padding: 16px;
}
.sr-card-icon {
  width: 34px;
  height: 34px;
  background: #e8f0fb;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.sr-card-meta {
  margin-top: 10px;
  display: flex;
  flex-direction: column;
  gap: 5px;
}
.sr-meta-row {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.76rem;
  color: #64748b;
}
.sr-card-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 12px;
  padding-top: 10px;
  border-top: 1px solid #f0f4f8;
}
.sr-amount {
  font-weight: 700;
  color: #0f4c81;
  font-size: 0.95rem;
}

/* Detail dialog */
.sr-detail-header {
  background: linear-gradient(135deg, #0f4c81 0%, #1565c0 100%);
  padding: 24px;
  position: relative;
}
.sr-detail-close {
  position: absolute;
  top: 12px;
  right: 12px;
}
.sr-detail-icon-wrap {
  width: 52px;
  height: 52px;
  background: rgba(255, 255, 255, 0.18);
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.sr-detail-stats {
  margin-top: 16px;
}
.sr-detail-stat {
  background: rgba(255, 255, 255, 0.12);
  border-radius: 10px;
  padding: 10px 12px;
}
.sr-detail-stat-val {
  font-size: 1rem;
  font-weight: 800;
  color: white;
}
.sr-detail-stat-lbl {
  font-size: 0.7rem;
  color: rgba(255, 255, 255, 0.65);
  margin-top: 2px;
}

.sr-info-item {
  display: flex;
  align-items: flex-start;
  gap: 10px;
}
.sr-info-lbl {
  font-size: 0.7rem;
  color: #94a3b8;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}
.sr-info-val {
  font-size: 0.875rem;
  font-weight: 600;
  color: #1e293b;
  margin-top: 1px;
}

.sr-comment {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 10px;
  background: #f8fafc;
  border-radius: 10px;
}

/* Form dialog */
.sr-dialog-header {
  background: linear-gradient(135deg, #0f4c81 0%, #1565c0 100%);
  padding: 20px 24px;
}

/* Delete confirm */
.sr-delete-icon {
  width: 56px;
  height: 56px;
  background: #fef2f2;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* Empty state */
.sr-empty {
  color: #94a3b8;
}
</style>
