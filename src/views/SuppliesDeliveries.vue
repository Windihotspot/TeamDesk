<script setup>
import { ref, computed, reactive, onMounted } from 'vue'
import MainLayout from '@/layouts/full/MainLayout.vue'
import ApiService from '@/services/api'
import { supabase } from '@/services/supabase.js'

// ─── STATE ───────────────────────────────────────────────
const loading = ref(false)
const deliveries = ref([])
const purchaseOrders = ref([])
const search = ref('')
const filterStatus = ref('All')

// dialogs
const createDialog = ref(false)
const detailDialog = ref(false)
const trackingDialog = ref(false)
const statusDialog = ref(false)
const confirmDialog = ref(false)

// date menus
const shippedDateMenu = ref(false)
const expectedDateMenu = ref(false)
const trackingShippedMenu = ref(false)
const trackingExpectedMenu = ref(false)

// form states
const createFormRef = ref(null)
const createFormValid = ref(false)
const savingCreate = ref(false)
const createError = ref('')
const confirmFormRef = ref(null)
const confirmFormValid = ref(false)
const actioning = ref(false)
const actionError = ref('')

// targets
const selectedDelivery = ref(null)
const trackingTarget = ref(null)
const statusTarget = ref(null)
const confirmTarget = ref(null)

// create fields
const createFields = reactive({
  purchase_order_id: null,
  request_id: null,
  quantity_ordered: 1,
  tracking_number: '',
  courier: '',
  shipped_date: null,
  shipped_date_display: '',
  expected_date: null,
  expected_date_display: '',
  delivery_address: '',
  delivery_notes: ''
})

// tracking fields
const trackingFields = reactive({
  tracking_number: '',
  courier: '',
  shipped_date: null,
  shipped_date_display: '',
  expected_date: null,
  expected_date_display: ''
})

// status fields
const newDeliveryStatus = ref(null)
const statusNotes = ref('')

// confirm fields
const confirmFields = reactive({
  quantity_received: null,
  quantity_damaged: 0,
  proof_of_delivery_url: '',
  delivery_notes: ''
})

const snackbar = reactive({ show: false, text: '', color: 'success', icon: 'mdi-check-circle' })
const todayStr = new Date().toISOString().split('T')[0]

const statusFilterOptions = [
  'All',
  'processing',
  'shipped',
  'out_for_delivery',
  'delivered',
  'returned',
  'failed'
]

const deliveryStatusOptions = [
  { label: 'Not Shipped', value: 'not_shipped' },
  { label: 'Processing', value: 'processing' },
  { label: 'Shipped', value: 'shipped' },
  { label: 'Out for Delivery', value: 'out_for_delivery' },
  { label: 'Returned', value: 'returned' },
  { label: 'Failed', value: 'failed' }
]

// ─── COMPUTED ────────────────────────────────────────────
const filteredDeliveries = computed(() => {
  return deliveries.value.filter((d) => {
    const q = search.value.toLowerCase()
    const matchSearch =
      !q ||
      (d.tracking_number || '').toLowerCase().includes(q) ||
      (d.courier || '').toLowerCase().includes(q) ||
      (d.purchase_orders?.po_number || '').toLowerCase().includes(q) ||
      (d.purchase_orders?.supplies?.name || '').toLowerCase().includes(q)
    const matchStatus = filterStatus.value === 'All' || d.delivery_status === filterStatus.value
    return matchSearch && matchStatus
  })
})

const summaryStats = computed(() => {
  const all = deliveries.value
  return [
    {
      label: 'Total',
      value: all.length,
      icon: 'mdi-truck-delivery-outline',
      color: '#0f4c81',
      bg: '#e8f0fb'
    },
    {
      label: 'Processing',
      value: all.filter((d) => d.delivery_status === 'processing').length,
      icon: 'mdi-clock-outline',
      color: '#d97706',
      bg: '#fef3c7'
    },
    {
      label: 'Shipped',
      value: all.filter((d) => d.delivery_status === 'shipped').length,
      icon: 'mdi-truck-fast-outline',
      color: '#0284c7',
      bg: '#e0f2fe'
    },
    {
      label: 'Out for Delivery',
      value: all.filter((d) => d.delivery_status === 'out_for_delivery').length,
      icon: 'mdi-map-marker-path',
      color: '#7c3aed',
      bg: '#ede9fe'
    },
    {
      label: 'Delivered',
      value: all.filter((d) => d.delivery_status === 'delivered').length,
      icon: 'mdi-package-check',
      color: '#059669',
      bg: '#d1fae5'
    },
    {
      label: 'Failed/Returned',
      value: all.filter((d) => ['failed', 'returned'].includes(d.delivery_status)).length,
      icon: 'mdi-alert-circle-outline',
      color: '#dc2626',
      bg: '#fee2e2'
    }
  ]
})

// ─── TABLE HEADERS ───────────────────────────────────────
const tableHeaders = [
  { title: 'PO Number', key: 'po_number', sortable: false },
  { title: 'Supply', key: 'supply', sortable: false },
  { title: 'Supplier', key: 'supplier', sortable: false },
  { title: 'Status', key: 'delivery_status', sortable: true },
  { title: 'Tracking', key: 'tracking_number', sortable: false },
  { title: 'Expected', key: 'expected_date', sortable: true },
  { title: 'Actions', key: 'actions', sortable: false, align: 'center' }
]

// ─── FETCH ───────────────────────────────────────────────
async function fetchDeliveries() {
  loading.value = true
  try {
    const res = await ApiService.get('/supplies-deliveries?limit=100')
    deliveries.value = res.data.deliveries || []
  } catch (err) {
    console.error('fetchDeliveries error:', err)
    showSnack('Failed to load deliveries.', 'error', 'mdi-alert-circle-outline')
  } finally {
    loading.value = false
  }
}

async function fetchPurchaseOrders() {
  const { data } = await supabase
    .from('purchase_orders')
    .select('*')
    .not('status', 'eq', 'cancelled')
    .order('created_at', { ascending: false })
  console.log('purchase orders:', data)
  purchaseOrders.value = data || []
}

onMounted(() => {
  fetchDeliveries()
  fetchPurchaseOrders()
})

// ─── ROW CLICK ───────────────────────────────────────────
function onRowClick(_, row) {
  openDetailDialog(row.item)
}

// ─── CREATE DIALOG ───────────────────────────────────────
function openCreateDialog() {
  Object.assign(createFields, {
    purchase_order_id: null,
    request_id: null,
    quantity_ordered: 1,
    tracking_number: '',
    courier: '',
    shipped_date: null,
    shipped_date_display: '',
    expected_date: null,
    expected_date_display: '',
    delivery_address: '',
    delivery_notes: ''
  })
  createError.value = ''
  createDialog.value = true
}

function onPOSelected(id) {
  const po = purchaseOrders.value.find((p) => p.id === id)
  if (po) createFields.request_id = po.request_id || null
}

function onShippedDatePicked(date) {
  createFields.shipped_date_display = formatDate(date)
  shippedDateMenu.value = false
}
function clearShippedDate() {
  createFields.shipped_date = null
  createFields.shipped_date_display = ''
}
function onExpectedDatePicked(date) {
  createFields.expected_date_display = formatDate(date)
  expectedDateMenu.value = false
}
function clearExpectedDate() {
  createFields.expected_date = null
  createFields.expected_date_display = ''
}

async function submitCreate() {
  const { valid } = (await createFormRef.value?.validate()) ?? { valid: true }
  if (!valid) return
  savingCreate.value = true
  createError.value = ''
  try {
    await ApiService.post('/supplies-deliveries', {
      purchase_order_id: createFields.purchase_order_id,
      request_id: createFields.request_id || null,
      quantity_ordered: Number(createFields.quantity_ordered),
      tracking_number: createFields.tracking_number || null,
      courier: createFields.courier || null,
      shipped_date: createFields.shipped_date
        ? new Date(createFields.shipped_date).toISOString().split('T')[0]
        : null,
      expected_date: createFields.expected_date
        ? new Date(createFields.expected_date).toISOString().split('T')[0]
        : null,
      delivery_address: createFields.delivery_address || null,
      delivery_notes: createFields.delivery_notes || null
    })
    showSnack('Delivery record created!', 'success', 'mdi-check-circle-outline')
    createDialog.value = false
    await fetchDeliveries()
    await fetchPurchaseOrders()
  } catch (err) {
    createError.value = err?.response?.data?.error || 'Failed to create delivery.'
  } finally {
    savingCreate.value = false
  }
}

// ─── DETAIL DIALOG ───────────────────────────────────────
async function openDetailDialog(delivery) {
  selectedDelivery.value = delivery
  detailDialog.value = true
  try {
    const res = await ApiService.get(`/supplies-deliveries?action=get&id=${delivery.id}`)
    selectedDelivery.value = res.data
  } catch (err) {
    console.warn('Could not fetch full delivery details:', err)
  }
}

// ─── TRACKING DIALOG ─────────────────────────────────────
function openTrackingDialog(delivery) {
  trackingTarget.value = delivery
  Object.assign(trackingFields, {
    tracking_number: delivery.tracking_number || '',
    courier: delivery.courier || '',
    shipped_date: delivery.shipped_date || null,
    shipped_date_display: delivery.shipped_date ? formatDate(delivery.shipped_date) : '',
    expected_date: delivery.expected_date || null,
    expected_date_display: delivery.expected_date ? formatDate(delivery.expected_date) : ''
  })
  actionError.value = ''
  trackingDialog.value = true
}

function openTrackingFromDetail() {
  openTrackingDialog(selectedDelivery.value)
  detailDialog.value = false
}

function onTrackingShippedPicked(date) {
  trackingFields.shipped_date_display = formatDate(date)
  trackingShippedMenu.value = false
}
function clearTrackingShippedDate() {
  trackingFields.shipped_date = null
  trackingFields.shipped_date_display = ''
}
function onTrackingExpectedPicked(date) {
  trackingFields.expected_date_display = formatDate(date)
  trackingExpectedMenu.value = false
}
function clearTrackingExpectedDate() {
  trackingFields.expected_date = null
  trackingFields.expected_date_display = ''
}

async function submitTracking() {
  actioning.value = true
  actionError.value = ''
  try {
    await ApiService.patch('/supplies-deliveries', {
      action: 'update_tracking',
      id: trackingTarget.value.id,
      tracking_number: trackingFields.tracking_number || null,
      courier: trackingFields.courier || null,
      shipped_date: trackingFields.shipped_date
        ? new Date(trackingFields.shipped_date).toISOString().split('T')[0]
        : null,
      expected_date: trackingFields.expected_date
        ? new Date(trackingFields.expected_date).toISOString().split('T')[0]
        : null
    })
    showSnack('Tracking updated!', 'success', 'mdi-check-circle-outline')
    trackingDialog.value = false
    await fetchDeliveries()
  } catch (err) {
    actionError.value = err?.response?.data?.error || 'Failed to update tracking.'
  } finally {
    actioning.value = false
  }
}

// ─── STATUS DIALOG ───────────────────────────────────────
function openStatusDialog(delivery) {
  statusTarget.value = delivery
  newDeliveryStatus.value = delivery.delivery_status
  statusNotes.value = ''
  actionError.value = ''
  statusDialog.value = true
}

function openStatusFromDetail() {
  openStatusDialog(selectedDelivery.value)
  detailDialog.value = false
}

async function submitStatus() {
  if (!newDeliveryStatus.value) {
    actionError.value = 'Please select a status.'
    return
  }
  actioning.value = true
  actionError.value = ''
  try {
    await ApiService.patch('/supplies-deliveries', {
      action: 'update_status',
      id: statusTarget.value.id,
      delivery_status: newDeliveryStatus.value,
      notes: statusNotes.value || null
    })
    showSnack('Status updated!', 'success', 'mdi-check-circle-outline')
    statusDialog.value = false
    await fetchDeliveries()
  } catch (err) {
    actionError.value = err?.response?.data?.error || 'Failed to update status.'
  } finally {
    actioning.value = false
  }
}

// ─── CONFIRM RECEIVED ────────────────────────────────────
function openConfirmDialog(delivery) {
  confirmTarget.value = delivery
  Object.assign(confirmFields, {
    quantity_received: delivery.quantity_ordered,
    quantity_damaged: 0,
    proof_of_delivery_url: '',
    delivery_notes: ''
  })
  actionError.value = ''
  confirmDialog.value = true
}

function openConfirmFromDetail() {
  openConfirmDialog(selectedDelivery.value)
  detailDialog.value = false
}

async function submitConfirm() {
  const { valid } = (await confirmFormRef.value?.validate()) ?? { valid: true }
  if (!valid) return
  actioning.value = true
  actionError.value = ''
  try {
    await ApiService.patch('/supplies-deliveries', {
      action: 'confirm_received',
      id: confirmTarget.value.id,
      quantity_received: Number(confirmFields.quantity_received),
      quantity_damaged: Number(confirmFields.quantity_damaged || 0),
      proof_of_delivery_url: confirmFields.proof_of_delivery_url || null,
      delivery_notes: confirmFields.delivery_notes || null
    })
    showSnack('Delivery confirmed!', 'success', 'mdi-package-check')
    confirmDialog.value = false
    await fetchDeliveries()
    await fetchPurchaseOrders()
  } catch (err) {
    actionError.value = err?.response?.data?.error || 'Failed to confirm delivery.'
  } finally {
    actioning.value = false
  }
}

// ─── HELPERS ─────────────────────────────────────────────
function deliveryStatusLabel(s) {
  const map = {
    not_shipped: 'Not Shipped',
    processing: 'Processing',
    shipped: 'Shipped',
    out_for_delivery: 'Out for Delivery',
    delivered: 'Delivered',
    returned: 'Returned',
    failed: 'Failed'
  }
  return map[s] || s
}
function deliveryStatusColor(s) {
  const map = {
    not_shipped: 'grey',
    processing: 'warning',
    shipped: 'info',
    out_for_delivery: 'purple',
    delivered: 'success',
    returned: 'orange',
    failed: 'error'
  }
  return map[s] || 'grey'
}
function deliveryStatusIcon(s) {
  const map = {
    not_shipped: 'mdi-clock-outline',
    processing: 'mdi-cog-outline',
    shipped: 'mdi-truck-fast-outline',
    out_for_delivery: 'mdi-map-marker-path',
    delivered: 'mdi-package-check',
    returned: 'mdi-package-up',
    failed: 'mdi-alert-circle-outline'
  }
  return map[s] || 'mdi-help-circle-outline'
}
function deliveryTimeline(d) {
  const statuses = ['processing', 'shipped', 'out_for_delivery', 'delivered']
  const idx = statuses.indexOf(d.delivery_status)
  return [
    { label: 'Processing', done: idx >= 0, color: '#d97706', date: d.created_at },
    { label: 'Shipped', done: idx >= 1, color: '#0284c7', date: d.shipped_date },
    { label: 'Out for Delivery', done: idx >= 2, color: '#7c3aed', date: null },
    { label: 'Delivered', done: idx >= 3, color: '#059669', date: d.actual_delivery_date }
  ]
}
function isDelivered(delivery) {
  return delivery?.delivery_status === 'delivered'
}
function isOverdue(delivery) {
  if (!delivery?.expected_date || isDelivered(delivery)) return false
  return new Date(delivery.expected_date) < new Date()
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
                <v-icon color="#0f4c81" size="22">mdi-truck-delivery-outline</v-icon>
              </div>
              <h1 class="sr-page-title">Supply Deliveries</h1>
            </div>
            <p class="sr-page-subtitle">Track and manage all supply deliveries</p>
          </div>
          <v-btn
            color="#0f4c81"
            prepend-icon="mdi-plus"
            rounded="lg"
            elevation="0"
            class="sr-primary-btn"
            @click="openCreateDialog"
          >
            New Delivery
          </v-btn>
        </div>

        <!-- Stats -->
        <div class="sr-stats mt-5 grid grid-cols-2 md:grid-cols-6 gap-3">
          <div v-for="s in summaryStats" :key="s.label" class="sr-stat-card">
            <div class="sr-stat-icon">
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
            placeholder="Search by tracking, courier, PO number…"
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
            style="min-width: 180px; max-width: 220px"
          />
        </div>
      </div>

      <!-- LOADING -->
      <div
        v-if="loading"
        class="fixed inset-0 bg-white/80 backdrop-blur-sm flex flex-col items-center justify-center z-50"
      >
        <v-progress-circular indeterminate color="#0f4c81" size="56" width="2" />
        <p class="mt-4 text-sm text-gray-500 font-medium">Loading deliveries…</p>
      </div>

      <!-- TABLE -->
      <div v-else class="px-6 pb-10">
        <v-card rounded="xl" elevation="0" class="sr-table-card overflow-hidden">
          <v-data-table
            :headers="tableHeaders"
            :items="filteredDeliveries"
            :search="search"
            class="sr-table"
            hover
            @click:row="onRowClick"
          >
            <template #item.po_number="{ item }">
              <span class="sr-request-num">{{ item.purchase_orders?.po_number }}</span>
            </template>

            <template #item.supply="{ item }">
              <div class="flex items-center gap-2 py-1">
                <div class="sr-tbl-icon" :style="{ background: '#e8f0fb' }">
                  <v-icon color="#0f4c81" size="16">mdi-package-variant</v-icon>
                </div>
                <div>
                  <p class="font-semibold text-sm leading-tight">
                    {{ item.purchase_orders?.supplies?.name }}
                  </p>
                  <p class="text-xs text-grey-darken-1">
                    {{ item.quantity_ordered }} {{ item.purchase_orders?.supplies?.unit }}
                  </p>
                </div>
              </div>
            </template>

            <template #item.supplier="{ item }">
              <div class="flex items-center gap-2">
                <v-avatar size="28" color="#e8f0fb">
                  <span class="text-xs font-bold" style="color: #0f4c81">
                    {{ initials(item.purchase_orders?.suppliers?.name) }}
                  </span>
                </v-avatar>
                <span class="text-sm">{{ item.purchase_orders?.suppliers?.name }}</span>
              </div>
            </template>

            <template #item.delivery_status="{ item }">
              <v-chip
                size="small"
                :color="deliveryStatusColor(item.delivery_status)"
                variant="tonal"
                rounded="lg"
                class="font-semibold"
              >
                <v-icon start size="12">{{ deliveryStatusIcon(item.delivery_status) }}</v-icon>
                {{ deliveryStatusLabel(item.delivery_status) }}
              </v-chip>
            </template>

            <template #item.tracking_number="{ item }">
              <span class="text-sm font-mono">{{ item.tracking_number || '—' }}</span>
            </template>

            <template #item.expected_date="{ item }">
              <span
                :class="isOverdue(item) ? 'text-error font-semibold' : 'text-grey'"
                class="text-sm"
              >
                {{ item.expected_date ? formatDate(item.expected_date) : '—' }}
              </span>
            </template>

            <template #item.actions="{ item }">
              <div class="flex gap-1" @click.stop>
                <v-tooltip text="View details" location="top">
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
                <v-tooltip text="Update tracking" location="top">
                  <template #activator="{ props }">
                    <v-btn
                      v-bind="props"
                      icon="mdi-map-marker-path"
                      size="x-small"
                      color="grey"
                      variant="text"
                      rounded="lg"
                      :disabled="isDelivered(item)"
                      @click="openTrackingDialog(item)"
                    />
                  </template>
                </v-tooltip>
                <v-tooltip text="Confirm received" location="top">
                  <template #activator="{ props }">
                    <v-btn
                      v-bind="props"
                      icon="mdi-package-check"
                      size="x-small"
                      color="success"
                      variant="tonal"
                      rounded="lg"
                      :disabled="isDelivered(item)"
                      @click="openConfirmDialog(item)"
                    />
                  </template>
                </v-tooltip>
              </div>
            </template>

            <template #no-data>
              <div class="sr-empty py-16 text-center">
                <v-icon size="56" color="#0f4c81" style="opacity: 0.25"
                  >mdi-truck-delivery-outline</v-icon
                >
                <p class="mt-3 font-semibold text-grey-darken-2">No deliveries found</p>
                <p class="text-sm text-grey mt-1">Create a delivery record from a purchase order</p>
                <v-btn
                  color="#0f4c81"
                  variant="tonal"
                  rounded="lg"
                  prepend-icon="mdi-plus"
                  class="mt-4"
                  @click="openCreateDialog"
                  >New Delivery</v-btn
                >
              </div>
            </template>
          </v-data-table>
        </v-card>
      </div>

      <!-- ══ CREATE DIALOG ══ -->
      <v-dialog v-model="createDialog" max-width="560" scrollable>
        <v-card rounded="xl" elevation="0">
          <div class="sr-dialog-header">
            <div class="flex items-center justify-between">
              <h3 class="text-white font-bold text-lg">New Delivery Record</h3>
              <v-btn
                icon="mdi-close"
                variant="text"
                color="white"
                size="small"
                @click="createDialog = false"
              />
            </div>
            <p class="text-white text-xs opacity-60 mt-1">
              Create a delivery record from a purchase order.
            </p>
          </div>

          <v-card-text class="pa-5">
            <v-form ref="createFormRef" v-model="createFormValid">
              <v-autocomplete
                v-model="createFields.purchase_order_id"
                :items="purchaseOrders"
                item-title="po_number"
                item-value="id"
                label="Purchase Order *"
                variant="outlined"
                density="comfortable"
                rounded="lg"
                prepend-inner-icon="mdi-cart-outline"
                :rules="[(v) => !!v || 'Required']"
                @update:model-value="onPOSelected"
              >
                <template #item="{ item, props }">
                  <v-list-item v-bind="props">
                    <template #append>
                      <span class="text-xs text-grey">{{ item.raw.supplies?.name }}</span>
                    </template>
                  </v-list-item>
                </template>
              </v-autocomplete>

              <v-text-field
                v-model.number="createFields.quantity_ordered"
                label="Quantity Ordered *"
                type="number"
                variant="outlined"
                density="comfortable"
                rounded="lg"
                prepend-inner-icon="mdi-counter"
                :rules="[(v) => !!v || 'Required', (v) => v > 0 || 'Must be > 0']"
                class="mt-1"
              />

              <div class="grid grid-cols-2 gap-4 mt-1">
                <v-text-field
                  v-model="createFields.tracking_number"
                  label="Tracking Number"
                  variant="outlined"
                  density="comfortable"
                  rounded="lg"
                  prepend-inner-icon="mdi-barcode"
                />
                <v-text-field
                  v-model="createFields.courier"
                  label="Courier"
                  variant="outlined"
                  density="comfortable"
                  rounded="lg"
                  prepend-inner-icon="mdi-truck-outline"
                />
              </div>

              <div class="grid grid-cols-2 gap-4 mt-1">
                <v-menu v-model="shippedDateMenu" :close-on-content-click="false">
                  <template #activator="{ props }">
                    <v-text-field
                      v-bind="props"
                      v-model="createFields.shipped_date_display"
                      label="Shipped Date"
                      variant="outlined"
                      density="comfortable"
                      rounded="lg"
                      prepend-inner-icon="mdi-calendar-outline"
                      readonly
                      clearable
                      @click:clear="clearShippedDate"
                    />
                  </template>
                  <v-date-picker
                    v-model="createFields.shipped_date"
                    color="#0f4c81"
                    @update:model-value="onShippedDatePicked"
                  />
                </v-menu>

                <v-menu v-model="expectedDateMenu" :close-on-content-click="false">
                  <template #activator="{ props }">
                    <v-text-field
                      v-bind="props"
                      v-model="createFields.expected_date_display"
                      label="Expected Date"
                      variant="outlined"
                      density="comfortable"
                      rounded="lg"
                      prepend-inner-icon="mdi-calendar-clock-outline"
                      readonly
                      clearable
                      @click:clear="clearExpectedDate"
                    />
                  </template>
                  <v-date-picker
                    v-model="createFields.expected_date"
                    color="#0f4c81"
                    :min="todayStr"
                    @update:model-value="onExpectedDatePicked"
                  />
                </v-menu>
              </div>

              <v-text-field
                v-model="createFields.delivery_address"
                label="Delivery Address"
                variant="outlined"
                density="comfortable"
                rounded="lg"
                prepend-inner-icon="mdi-map-marker-outline"
                class="mt-1"
              />

              <v-textarea
                v-model="createFields.delivery_notes"
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
              v-if="createError"
              type="error"
              variant="tonal"
              rounded="lg"
              class="mt-3"
              closable
              @click:close="createError = ''"
            >
              {{ createError }}
            </v-alert>
          </v-card-text>

          <v-card-actions class="pa-5 pt-0">
            <v-btn variant="text" color="grey" rounded="lg" @click="createDialog = false"
              >Cancel</v-btn
            >
            <v-spacer />
            <v-btn
              color="#0f4c81"
              rounded="lg"
              elevation="0"
              prepend-icon="mdi-send-outline"
              :loading="savingCreate"
              @click="submitCreate"
              >Create Delivery</v-btn
            >
          </v-card-actions>
        </v-card>
      </v-dialog>

      <!-- ══ DETAIL DIALOG ══ -->
      <v-dialog v-model="detailDialog" max-width="640" scrollable>
        <v-card v-if="selectedDelivery" rounded="xl" elevation="0">
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
                <v-icon color="white" size="28">mdi-truck-delivery-outline</v-icon>
              </div>
              <div class="flex-1">
                <p class="text-white text-xs opacity-60 uppercase tracking-widest font-semibold">
                  Delivery
                </p>
                <p class="text-white font-bold text-lg">
                  {{ selectedDelivery.purchase_orders?.po_number }}
                </p>
                <p class="text-white text-sm opacity-70 mt-0.5">
                  {{ selectedDelivery.purchase_orders?.supplies?.name }}
                </p>
              </div>
              <v-chip
                size="small"
                :color="deliveryStatusColor(selectedDelivery.delivery_status)"
                variant="flat"
                rounded="lg"
                class="font-bold m-2"
              >
                <v-icon start size="12">{{
                  deliveryStatusIcon(selectedDelivery.delivery_status)
                }}</v-icon>
                {{ deliveryStatusLabel(selectedDelivery.delivery_status) }}
              </v-chip>
            </div>

            <div class="sr-detail-stats mt-4 grid grid-cols-3 gap-3 m-4">
              <div class="sr-detail-stat">
                <p class="sr-detail-stat-val">{{ selectedDelivery.quantity_ordered }}</p>
                <p class="sr-detail-stat-lbl">Ordered</p>
              </div>
              <div class="sr-detail-stat">
                <p class="sr-detail-stat-val">{{ selectedDelivery.quantity_received ?? '—' }}</p>
                <p class="sr-detail-stat-lbl">Received</p>
              </div>
              <div class="sr-detail-stat">
                <p class="sr-detail-stat-val">{{ selectedDelivery.quantity_damaged ?? '0' }}</p>
                <p class="sr-detail-stat-lbl">Damaged</p>
              </div>
            </div>
          </div>

          <v-card-text class="pa-5">
            <div class="grid grid-cols-2 gap-4">
              <div class="sr-info-item">
                <v-icon size="15" color="#0f4c81">mdi-truck-outline</v-icon>
                <div>
                  <p class="sr-info-lbl">Supplier</p>
                  <p class="sr-info-val">{{ selectedDelivery.purchase_orders?.suppliers?.name }}</p>
                </div>
              </div>
              <div class="sr-info-item">
                <v-icon size="15" color="#0f4c81">mdi-barcode</v-icon>
                <div>
                  <p class="sr-info-lbl">Tracking Number</p>
                  <p class="sr-info-val font-mono">{{ selectedDelivery.tracking_number || '—' }}</p>
                </div>
              </div>
              <div class="sr-info-item">
                <v-icon size="15" color="#0f4c81">mdi-truck-fast-outline</v-icon>
                <div>
                  <p class="sr-info-lbl">Courier</p>
                  <p class="sr-info-val">{{ selectedDelivery.courier || '—' }}</p>
                </div>
              </div>
              <div class="sr-info-item">
                <v-icon size="15" color="#0f4c81">mdi-calendar-arrow-right</v-icon>
                <div>
                  <p class="sr-info-lbl">Shipped Date</p>
                  <p class="sr-info-val">
                    {{
                      selectedDelivery.shipped_date
                        ? formatDate(selectedDelivery.shipped_date)
                        : '—'
                    }}
                  </p>
                </div>
              </div>
              <div class="sr-info-item">
                <v-icon size="15" color="#0f4c81">mdi-calendar-clock-outline</v-icon>
                <div>
                  <p class="sr-info-lbl">Expected Date</p>
                  <p
                    class="sr-info-val"
                    :class="isOverdue(selectedDelivery) ? 'text-error font-semibold' : ''"
                  >
                    {{
                      selectedDelivery.expected_date
                        ? formatDate(selectedDelivery.expected_date)
                        : '—'
                    }}
                  </p>
                </div>
              </div>
              <div class="sr-info-item">
                <v-icon size="15" color="#0f4c81">mdi-calendar-check-outline</v-icon>
                <div>
                  <p class="sr-info-lbl">Actual Delivery</p>
                  <p class="sr-info-val">
                    {{
                      selectedDelivery.actual_delivery_date
                        ? formatDate(selectedDelivery.actual_delivery_date)
                        : '—'
                    }}
                  </p>
                </div>
              </div>
              <div class="sr-info-item">
                <v-icon size="15" color="#0f4c81">mdi-account-check-outline</v-icon>
                <div>
                  <p class="sr-info-lbl">Received By</p>
                  <p class="sr-info-val">
                    {{
                      selectedDelivery.received_by_user
                        ? `${selectedDelivery.received_by_user.first_name} ${selectedDelivery.received_by_user.last_name}`
                        : '—'
                    }}
                  </p>
                </div>
              </div>
              <div class="sr-info-item">
                <v-icon size="15" color="#0f4c81">mdi-map-marker-outline</v-icon>
                <div>
                  <p class="sr-info-lbl">Delivery Address</p>
                  <p class="sr-info-val">{{ selectedDelivery.delivery_address || '—' }}</p>
                </div>
              </div>
            </div>

            <div
              v-if="selectedDelivery.delivery_notes"
              class="mt-4 p-4 rounded-xl"
              style="background: #f5f8fc"
            >
              <p class="text-xs font-semibold text-grey-darken-2 mb-1">Delivery Notes</p>
              <p class="text-sm" style="color: #374151">{{ selectedDelivery.delivery_notes }}</p>
            </div>

            <!-- Delivery Timeline -->
            <div class="mt-5">
              <p class="text-sm font-bold mb-3" style="color: #0f4c81">Delivery Timeline</p>
              <div class="space-y-2">
                <div
                  v-for="step in deliveryTimeline(selectedDelivery)"
                  :key="step.label"
                  class="flex items-center gap-3"
                >
                  <v-icon :color="step.done ? step.color : 'grey'" size="18">
                    {{ step.done ? 'mdi-check-circle' : 'mdi-circle-outline' }}
                  </v-icon>
                  <span class="text-sm flex-1" :class="step.done ? 'font-semibold' : 'text-grey'">
                    {{ step.label }}
                  </span>
                  <span v-if="step.date" class="text-xs text-grey">{{
                    formatDate(step.date)
                  }}</span>
                </div>
              </div>
            </div>
          </v-card-text>

          <v-card-actions class="pa-5 pt-0 gap-2 flex-wrap">
            <v-spacer />
            <v-btn
              v-if="!isDelivered(selectedDelivery)"
              color="grey"
              variant="tonal"
              rounded="lg"
              prepend-icon="mdi-map-marker-path"
              @click="openTrackingFromDetail"
              >Update Tracking</v-btn
            >
            <v-btn
              v-if="!isDelivered(selectedDelivery)"
              color="info"
              variant="tonal"
              rounded="lg"
              prepend-icon="mdi-list-status"
              @click="openStatusFromDetail"
              >Update Status</v-btn
            >
            <v-btn
              v-if="!isDelivered(selectedDelivery)"
              color="success"
              variant="flat"
              rounded="lg"
              prepend-icon="mdi-package-check"
              @click="openConfirmFromDetail"
              >Confirm Received</v-btn
            >
          </v-card-actions>
        </v-card>
      </v-dialog>

      <!-- ══ UPDATE TRACKING DIALOG ══ -->
      <v-dialog v-model="trackingDialog" max-width="480">
        <v-card rounded="xl" elevation="0" class="">
          <div
            class="sr-dialog-header"
            style="background: linear-gradient(135deg, #0284c7, #0f4c81)"
          >
            <div class="flex items-center justify-between p-2">
              <h3 class="text-white font-bold text-lg">Update Tracking</h3>
              <v-btn
                icon="mdi-close"
                variant="text"
                color="white"
                size="small"
                @click="trackingDialog = false"
              />
            </div>
            <p class="text-white text-xs opacity-60 mt-1 p-2">
              {{ trackingTarget?.purchase_orders?.po_number }}
            </p>
          </div>
          <v-card-text class="pa-5">
            <div class="grid grid-cols-2 gap-4">
              <v-text-field
                v-model="trackingFields.tracking_number"
                label="Tracking Number"
                variant="outlined"
                density="comfortable"
                rounded="lg"
                prepend-inner-icon="mdi-barcode"
              />
              <v-text-field
                v-model="trackingFields.courier"
                label="Courier"
                variant="outlined"
                density="comfortable"
                rounded="lg"
                prepend-inner-icon="mdi-truck-outline"
              />
            </div>

            <div class="grid grid-cols-2 gap-4 mt-1">
              <v-menu v-model="trackingShippedMenu" :close-on-content-click="false">
                <template #activator="{ props }">
                  <v-text-field
                    v-bind="props"
                    v-model="trackingFields.shipped_date_display"
                    label="Shipped Date"
                    variant="outlined"
                    density="comfortable"
                    rounded="lg"
                    prepend-inner-icon="mdi-calendar-outline"
                    readonly
                    clearable
                    @click:clear="clearTrackingShippedDate"
                  />
                </template>
                <v-date-picker
                  v-model="trackingFields.shipped_date"
                  color="#0f4c81"
                  @update:model-value="onTrackingShippedPicked"
                />
              </v-menu>

              <v-menu v-model="trackingExpectedMenu" :close-on-content-click="false">
                <template #activator="{ props }">
                  <v-text-field
                    v-bind="props"
                    v-model="trackingFields.expected_date_display"
                    label="Expected Date"
                    variant="outlined"
                    density="comfortable"
                    rounded="lg"
                    prepend-inner-icon="mdi-calendar-clock-outline"
                    readonly
                    clearable
                    @click:clear="clearTrackingExpectedDate"
                  />
                </template>
                <v-date-picker
                  v-model="trackingFields.expected_date"
                  color="#0f4c81"
                  :min="todayStr"
                  @update:model-value="onTrackingExpectedPicked"
                />
              </v-menu>
            </div>

            <v-alert
              v-if="actionError"
              type="error"
              variant="tonal"
              rounded="lg"
              class="mt-3"
              closable
              @click:close="actionError = ''"
            >
              {{ actionError }}
            </v-alert>
          </v-card-text>
          <v-card-actions class="pa-5 pt-0">
            <v-btn variant="text" color="grey" rounded="lg" @click="trackingDialog = false"
              >Cancel</v-btn
            >
            <v-spacer />
            <v-btn
              color="#0f4c81"
              rounded="lg"
              elevation="0"
              prepend-icon="mdi-content-save-outline"
              :loading="actioning"
              @click="submitTracking"
            >
              Save Tracking
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>

      <!-- ══ UPDATE STATUS DIALOG ══ -->
      <v-dialog v-model="statusDialog" max-width="420">
        <v-card rounded="xl" elevation="0">
          <div
            class="sr-dialog-header"
            style="background: linear-gradient(135deg, #7c3aed, #0f4c81)"
          >
            <div class="flex items-center justify-between m-2">
              <h3 class="text-white font-bold text-lg">Update Status</h3>
              <v-btn
                icon="mdi-close"
                variant="text"
                color="white"
                size="small"
                @click="statusDialog = false"
              />
            </div>
            <p class="text-white text-xs opacity-60 mt-1 m-2">
              {{ statusTarget?.purchase_orders?.po_number }}
            </p>
          </div>
          <v-card-text class="pa-5">
            <v-select
              v-model="newDeliveryStatus"
              :items="deliveryStatusOptions"
              item-title="label"
              item-value="value"
              label="New Status *"
              variant="outlined"
              density="comfortable"
              rounded="lg"
              prepend-inner-icon="mdi-list-status"
              :rules="[(v) => !!v || 'Required']"
            />
            <v-textarea
              v-model="statusNotes"
              label="Notes (optional)"
              variant="outlined"
              density="comfortable"
              rounded="lg"
              rows="3"
              prepend-inner-icon="mdi-text-box-outline"
              class="mt-1"
            />
            <v-alert
              v-if="actionError"
              type="error"
              variant="tonal"
              rounded="lg"
              class="mt-3"
              closable
              @click:close="actionError = ''"
            >
              {{ actionError }}
            </v-alert>
          </v-card-text>
          <v-card-actions class="pa-5 pt-0">
            <v-btn variant="text" color="grey" rounded="lg" @click="statusDialog = false"
              >Cancel</v-btn
            >
            <v-spacer />
            <v-btn
              color="deep-purple"
              rounded="lg"
              elevation="0"
              prepend-icon="mdi-check"
              :loading="actioning"
              @click="submitStatus"
            >
              Update Status
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>

      <!-- ══ CONFIRM RECEIVED DIALOG ══ -->
      <v-dialog v-model="confirmDialog" max-width="480">
        <v-card rounded="xl" elevation="0">
          <div
            class="sr-dialog-header"
            style="background: linear-gradient(135deg, #059669, #0f4c81)"
          >
            <div class="flex items-center justify-between m-2">
              <h3 class="text-white font-bold text-lg">Confirm Delivery Received</h3>
              <v-btn
                icon="mdi-close"
                variant="text"
                color="white"
                size="small"
                @click="confirmDialog = false"
              />
            </div>
            <p class="text-white text-xs opacity-60 m-2">
              {{ confirmTarget?.purchase_orders?.po_number }} —
              {{ confirmTarget?.purchase_orders?.supplies?.name }}
            </p>
          </div>
          <v-card-text class="pa-5">
            <v-form ref="confirmFormRef" v-model="confirmFormValid">
              <div class="grid grid-cols-2 gap-4">
                <v-text-field
                  v-model.number="confirmFields.quantity_received"
                  label="Quantity Received *"
                  type="number"
                  variant="outlined"
                  density="comfortable"
                  rounded="lg"
                  prepend-inner-icon="mdi-counter"
                  :hint="`Ordered: ${confirmTarget?.quantity_ordered}`"
                  persistent-hint
                  :rules="[
                    (v) => (v !== null && v !== '') || 'Required',
                    (v) => v >= 0 || 'Must be ≥ 0'
                  ]"
                />
                <v-text-field
                  v-model.number="confirmFields.quantity_damaged"
                  label="Quantity Damaged"
                  type="number"
                  variant="outlined"
                  density="comfortable"
                  rounded="lg"
                  prepend-inner-icon="mdi-package-variant-remove"
                />
              </div>
              <v-text-field
                v-model="confirmFields.proof_of_delivery_url"
                label="Proof of Delivery URL (optional)"
                variant="outlined"
                density="comfortable"
                rounded="lg"
                prepend-inner-icon="mdi-link-variant"
                class="mt-1"
              />
              <v-textarea
                v-model="confirmFields.delivery_notes"
                label="Delivery Notes (optional)"
                variant="outlined"
                density="comfortable"
                rounded="lg"
                rows="3"
                prepend-inner-icon="mdi-text-box-outline"
                class="mt-1"
              />
            </v-form>
            <v-alert
              v-if="actionError"
              type="error"
              variant="tonal"
              rounded="lg"
              class="mt-3"
              closable
              @click:close="actionError = ''"
            >
              {{ actionError }}
            </v-alert>
          </v-card-text>
          <v-card-actions class="pa-5 pt-0">
            <v-btn variant="text" color="grey" rounded="lg" @click="confirmDialog = false"
              >Cancel</v-btn
            >
            <v-spacer />
            <v-btn
              color="success"
              rounded="lg"
              elevation="0"
              prepend-icon="mdi-package-check"
              :loading="actioning"
              @click="submitConfirm"
            >
              Confirm Received
            </v-btn>
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
.v-btn {
  text-transform: none;
}
</style>
