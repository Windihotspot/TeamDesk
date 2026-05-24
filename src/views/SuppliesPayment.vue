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
                <v-icon color="#0f4c81" size="22">mdi-cash-multiple</v-icon>
              </div>
              <h1 class="sr-page-title">Supply Payments</h1>
            </div>
            <p class="sr-page-subtitle">Track and manage all supply payment records</p>
          </div>
        </div>

        <!-- Financial Summary Cards -->
        <div class="mt-5 grid grid-cols-1 md:grid-cols-3 gap-4" v-if="summary">
          <div class="sr-finance-card">
            <div class="sr-finance-icon" style="background: #e8f0fb">
              <v-icon color="#0f4c81" size="20">mdi-cash-clock</v-icon>
            </div>
            <div>
              <p class="sr-finance-lbl">Total Due</p>
              <p class="sr-finance-val">₦{{ Number(summary.total_due || 0).toLocaleString() }}</p>
            </div>
          </div>
          <div class="sr-finance-card">
            <div class="sr-finance-icon" style="background: #d1fae5">
              <v-icon color="#059669" size="20">mdi-cash-check</v-icon>
            </div>
            <div>
              <p class="sr-finance-lbl">Total Paid</p>
              <p class="sr-finance-val" style="color: #059669">
                ₦{{ Number(summary.total_paid || 0).toLocaleString() }}
              </p>
            </div>
          </div>
          <div class="sr-finance-card">
            <div class="sr-finance-icon" style="background: #fee2e2">
              <v-icon color="#dc2626" size="20">mdi-cash-remove</v-icon>
            </div>
            <div>
              <p class="sr-finance-lbl">Outstanding Balance</p>
              <p class="sr-finance-val" style="color: #dc2626">
                ₦{{ Number(summary.total_balance || 0).toLocaleString() }}
              </p>
            </div>
          </div>
        </div>

        <!-- Stats -->
        <div class="sr-stats mt-4 grid grid-cols-2 md:grid-cols-3 gap-3">
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
            placeholder="Search by PO number, supplier, reference…"
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
        <p class="mt-4 text-sm text-gray-500 font-medium">Loading payments…</p>
      </div>

      <!-- TABLE -->
      <div v-else class="px-6 pb-10">
        <v-card rounded="xl" elevation="0" class="sr-table-card overflow-hidden">
          <v-data-table
            :headers="tableHeaders"
            :items="filteredPayments"
            :search="search"
            class="sr-table"
            hover
            @click:row="onRowClick"
          >
            <template #item.po_number="{ item }">
              <span class="sr-request-num">{{ item.purchase_orders?.po_number }}</span>
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

            <template #item.payment_status="{ item }">
              <v-chip
                size="small"
                :color="paymentStatusColor(item.payment_status)"
                variant="tonal"
                rounded="lg"
                class="font-semibold"
              >
                <v-icon start size="12">{{ paymentStatusIcon(item.payment_status) }}</v-icon>
                {{ paymentStatusLabel(item.payment_status) }}
              </v-chip>
            </template>

            <template #item.amount_due="{ item }">
              <span class="text-sm font-semibold" style="color: #0f4c81">
                ₦{{ Number(item.amount_due || 0).toLocaleString() }}
              </span>
            </template>

            <template #item.amount_paid="{ item }">
              <span class="text-sm font-semibold" style="color: #059669">
                ₦{{ Number(item.amount_paid || 0).toLocaleString() }}
              </span>
            </template>

            <template #item.balance="{ item }">
              <span
                class="text-sm font-semibold"
                :style="{ color: Number(item.balance) > 0 ? '#dc2626' : '#059669' }"
              >
                ₦{{ Number(item.balance || 0).toLocaleString() }}
              </span>
            </template>

            <template #item.approved_by_user="{ item }">
              <v-chip
                v-if="item.approved_by_user"
                size="x-small"
                color="success"
                variant="tonal"
                rounded="lg"
              >
                <v-icon start size="10">mdi-check</v-icon>
                Approved
              </v-chip>
              <v-chip v-else size="x-small" color="warning" variant="tonal" rounded="lg">
                Pending
              </v-chip>
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
                <v-tooltip text="Record payment" location="top">
                  <template #activator="{ props }">
                    <v-btn
                      v-bind="props"
                      icon="mdi-cash-plus"
                      size="x-small"
                      color="success"
                      variant="tonal"
                      rounded="lg"
                      :disabled="item.payment_status === 'paid'"
                      @click="openRecordDialog(item)"
                    />
                  </template>
                </v-tooltip>
                <v-tooltip text="Approve payment" location="top">
                  <template #activator="{ props }">
                    <v-btn
                      v-bind="props"
                      icon="mdi-check-decagram-outline"
                      size="x-small"
                      color="#0f4c81"
                      variant="tonal"
                      rounded="lg"
                      :disabled="!!item.approved_by"
                      @click="openApproveConfirm(item)"
                    />
                  </template>
                </v-tooltip>
              </div>
            </template>

            <template #no-data>
              <div class="sr-empty py-16 text-center">
                <v-icon size="56" color="#0f4c81" style="opacity: 0.25">mdi-cash-multiple</v-icon>
                <p class="mt-3 font-semibold text-grey-darken-2">No payment records found</p>
                <p class="text-sm text-grey mt-1">
                  Payment records are created automatically when a PO is raised
                </p>
              </div>
            </template>
          </v-data-table>
        </v-card>
      </div>

      <!-- ══ DETAIL DIALOG ══ -->
      <v-dialog v-model="detailDialog" max-width="640" scrollable>
        <v-card v-if="selectedPayment" rounded="xl" elevation="0">
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
                <v-icon color="white" size="28">mdi-cash-multiple</v-icon>
              </div>
              <div class="flex-1">
                <p class="text-white text-xs opacity-60 uppercase tracking-widest font-semibold">
                  Payment
                </p>
                <p class="text-white font-bold text-lg">
                  {{ selectedPayment.purchase_orders?.po_number }}
                </p>
                <p class="text-white text-sm opacity-70 mt-0.5">
                  {{ selectedPayment.purchase_orders?.suppliers?.name }}
                </p>
              </div>
              <v-chip
                size="small"
                :color="paymentStatusColor(selectedPayment.payment_status)"
                variant="flat"
                rounded="lg"
                class="font-bold"
              >
                <v-icon start size="12">{{
                  paymentStatusIcon(selectedPayment.payment_status)
                }}</v-icon>
                {{ paymentStatusLabel(selectedPayment.payment_status) }}
              </v-chip>
            </div>

            <div class="sr-detail-stats mt-4 grid grid-cols-3 gap-3">
              <div class="sr-detail-stat">
                <p class="sr-detail-stat-val">
                  ₦{{ Number(selectedPayment.amount_due || 0).toLocaleString() }}
                </p>
                <p class="sr-detail-stat-lbl">Amount Due</p>
              </div>
              <div class="sr-detail-stat">
                <p class="sr-detail-stat-val">
                  ₦{{ Number(selectedPayment.amount_paid || 0).toLocaleString() }}
                </p>
                <p class="sr-detail-stat-lbl">Amount Paid</p>
              </div>
              <div class="sr-detail-stat">
                <p class="sr-detail-stat-val">
                  ₦{{ Number(selectedPayment.balance || 0).toLocaleString() }}
                </p>
                <p class="sr-detail-stat-lbl">Balance</p>
              </div>
            </div>
          </div>

          <!-- Progress bar -->
          <div class="px-5 pt-4">
            <div class="flex justify-between text-xs text-grey mb-1">
              <span>Payment progress</span>
              <span>{{ paymentPercent(selectedPayment) }}%</span>
            </div>
            <v-progress-linear
              :model-value="paymentPercent(selectedPayment)"
              :color="paymentStatusColor(selectedPayment.payment_status)"
              rounded
              height="8"
              bg-color="#f1f5f9"
            />
          </div>

          <v-card-text class="pa-5">
            <div class="grid grid-cols-2 gap-4">
              <div class="sr-info-item">
                <v-icon size="15" color="#0f4c81">mdi-credit-card-outline</v-icon>
                <div>
                  <p class="sr-info-lbl">Payment Method</p>
                  <p class="sr-info-val capitalize">{{ selectedPayment.payment_method || '—' }}</p>
                </div>
              </div>
              <div class="sr-info-item">
                <v-icon size="15" color="#0f4c81">mdi-identifier</v-icon>
                <div>
                  <p class="sr-info-lbl">Payment Reference</p>
                  <p class="sr-info-val font-mono">
                    {{ selectedPayment.payment_reference || '—' }}
                  </p>
                </div>
              </div>
              <div class="sr-info-item">
                <v-icon size="15" color="#0f4c81">mdi-calendar-check-outline</v-icon>
                <div>
                  <p class="sr-info-lbl">Payment Date</p>
                  <p class="sr-info-val">
                    {{
                      selectedPayment.payment_date ? formatDate(selectedPayment.payment_date) : '—'
                    }}
                  </p>
                </div>
              </div>
              <div class="sr-info-item">
                <v-icon size="15" color="#0f4c81">mdi-account-outline</v-icon>
                <div>
                  <p class="sr-info-lbl">Paid By</p>
                  <p class="sr-info-val">
                    {{
                      selectedPayment.paid_by_user
                        ? `${selectedPayment.paid_by_user.first_name} ${selectedPayment.paid_by_user.last_name}`
                        : '—'
                    }}
                  </p>
                </div>
              </div>
              <div class="sr-info-item">
                <v-icon size="15" color="#0f4c81">mdi-check-decagram-outline</v-icon>
                <div>
                  <p class="sr-info-lbl">Approved By</p>
                  <p class="sr-info-val">
                    {{
                      selectedPayment.approved_by_user
                        ? `${selectedPayment.approved_by_user.first_name} ${selectedPayment.approved_by_user.last_name}`
                        : 'Not approved'
                    }}
                  </p>
                </div>
              </div>
              <div class="sr-info-item">
                <v-icon size="15" color="#0f4c81">mdi-currency-ngn</v-icon>
                <div>
                  <p class="sr-info-lbl">Currency</p>
                  <p class="sr-info-val">{{ selectedPayment.currency || 'NGN' }}</p>
                </div>
              </div>
            </div>

            <div
              v-if="selectedPayment.notes"
              class="mt-4 p-4 rounded-xl"
              style="background: #f5f8fc"
            >
              <p class="text-xs font-semibold text-grey-darken-2 mb-1">Notes</p>
              <p class="text-sm" style="color: #374151">{{ selectedPayment.notes }}</p>
            </div>

            <div v-if="selectedPayment.receipt_url" class="mt-3">
              <v-btn
                variant="tonal"
                color="#0f4c81"
                rounded="lg"
                prepend-icon="mdi-receipt-outline"
                size="small"
                :href="selectedPayment.receipt_url"
                target="_blank"
                >View Receipt</v-btn
              >
            </div>
          </v-card-text>

          <v-card-actions class="pa-5 pt-0 gap-2">
            <v-spacer />
            <v-btn
              v-if="!selectedPayment.approved_by"
              color="#0f4c81"
              variant="tonal"
              rounded="lg"
              prepend-icon="mdi-check-decagram-outline"
              @click="openApproveFromDetail"
              >Approve</v-btn
            >
            <v-btn
              v-if="selectedPayment.payment_status !== 'paid'"
              color="success"
              variant="flat"
              rounded="lg"
              prepend-icon="mdi-cash-plus"
              @click="openRecordFromDetail"
              >Record Payment</v-btn
            >
          </v-card-actions>
        </v-card>
      </v-dialog>

      <!-- ══ RECORD PAYMENT DIALOG ══ -->
      <v-dialog v-model="recordDialog" max-width="500" scrollable>
        <v-card rounded="xl" elevation="0">
          <div
            class="sr-dialog-header"
            style="background: linear-gradient(135deg, #059669, #0f4c81)"
          >
            <div class="flex items-center justify-between">
              <h3 class="text-white font-bold text-lg">Record Payment</h3>
              <v-btn
                icon="mdi-close"
                variant="text"
                color="white"
                size="small"
                @click="recordDialog = false"
              />
            </div>
            <p class="text-white text-xs opacity-60 mt-1">
              {{ recordTarget?.purchase_orders?.po_number }} — Balance: ₦{{
                Number(recordTarget?.balance || 0).toLocaleString()
              }}
            </p>
          </div>

          <v-card-text class="pa-5">
            <v-form ref="recordFormRef" v-model="recordFormValid">
              <v-text-field
                v-model.number="recordFields.amount_paid"
                label="Amount Paid *"
                type="number"
                variant="outlined"
                density="comfortable"
                rounded="lg"
                prepend-inner-icon="mdi-currency-ngn"
                :hint="`Max: ₦${Number(recordTarget?.balance || 0).toLocaleString()}`"
                persistent-hint
                :rules="[
                  (v) => !!v || 'Required',
                  (v) => v > 0 || 'Must be > 0',
                  (v) => v <= Number(recordTarget?.balance || 0) || 'Exceeds outstanding balance'
                ]"
              />

              <v-select
                v-model="recordFields.payment_method"
                :items="paymentMethods"
                item-title="label"
                item-value="value"
                label="Payment Method *"
                variant="outlined"
                density="comfortable"
                rounded="lg"
                prepend-inner-icon="mdi-credit-card-outline"
                :rules="[(v) => !!v || 'Required']"
                class="mt-3"
              />

              <v-text-field
                v-model="recordFields.payment_reference"
                label="Payment Reference"
                variant="outlined"
                density="comfortable"
                rounded="lg"
                prepend-inner-icon="mdi-identifier"
                class="mt-1"
              />

              <v-menu v-model="paymentDateMenu" :close-on-content-click="false">
                <template #activator="{ props }">
                  <v-text-field
                    v-bind="props"
                    v-model="recordFields.payment_date_display"
                    label="Payment Date"
                    variant="outlined"
                    density="comfortable"
                    rounded="lg"
                    prepend-inner-icon="mdi-calendar-outline"
                    readonly
                    clearable
                    class="mt-1"
                    @click:clear="clearPaymentDate"
                  />
                </template>
                <v-date-picker
                  v-model="recordFields.payment_date"
                  color="#0f4c81"
                  @update:model-value="onPaymentDatePicked"
                />
              </v-menu>

              <v-text-field
                v-model="recordFields.receipt_url"
                label="Receipt URL (optional)"
                variant="outlined"
                density="comfortable"
                rounded="lg"
                prepend-inner-icon="mdi-receipt-outline"
                class="mt-1"
              />

              <v-textarea
                v-model="recordFields.notes"
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
              v-if="recordError"
              type="error"
              variant="tonal"
              rounded="lg"
              class="mt-3"
              closable
              @click:close="recordError = ''"
            >
              {{ recordError }}
            </v-alert>
          </v-card-text>

          <v-card-actions class="pa-5 pt-0">
            <v-btn variant="text" color="grey" rounded="lg" @click="recordDialog = false"
              >Cancel</v-btn
            >
            <v-spacer />
            <v-btn
              color="success"
              rounded="lg"
              elevation="0"
              prepend-icon="mdi-cash-check"
              :loading="savingRecord"
              @click="submitRecord"
              >Record Payment</v-btn
            >
          </v-card-actions>
        </v-card>
      </v-dialog>

      <!-- ══ APPROVE CONFIRM DIALOG ══ -->
      <v-dialog v-model="approveDialog" max-width="400">
        <v-card rounded="xl" elevation="0" class="pa-2">
          <v-card-text class="text-center pa-6">
            <div class="sr-delete-icon mx-auto mb-4" style="background: #d1fae5">
              <v-icon color="success" size="28">mdi-check-decagram-outline</v-icon>
            </div>
            <h3 class="font-bold text-lg mb-2">Approve this Payment?</h3>
            <p class="text-grey text-sm">
              You are approving the payment record for
              <strong>{{ approveTarget?.purchase_orders?.po_number }}</strong
              >. This action cannot be undone.
            </p>
          </v-card-text>
          <v-card-actions class="pb-4 px-4 gap-2">
            <v-btn
              variant="outlined"
              color="grey"
              rounded="lg"
              class="flex-1"
              :disabled="approvingPayment"
              @click="approveDialog = false"
              >Cancel</v-btn
            >
            <v-btn
              color="success"
              rounded="lg"
              class="flex-1"
              elevation="0"
              :loading="approvingPayment"
              @click="submitApprove"
              >Approve</v-btn
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

// ─── STATE ───────────────────────────────────────────────
const loading = ref(false)
const payments = ref([])
const summary = ref(null)
const search = ref('')
const filterStatus = ref('All')

// dialogs
const detailDialog = ref(false)
const recordDialog = ref(false)
const approveDialog = ref(false)
const paymentDateMenu = ref(false)

// form
const recordFormRef = ref(null)
const recordFormValid = ref(false)
const savingRecord = ref(false)
const recordError = ref('')
const approvingPayment = ref(false)

// targets
const selectedPayment = ref(null)
const recordTarget = ref(null)
const approveTarget = ref(null)

const recordFields = reactive({
  amount_paid: null,
  payment_method: null,
  payment_reference: '',
  payment_date: null,
  payment_date_display: '',
  receipt_url: '',
  notes: ''
})

const snackbar = reactive({ show: false, text: '', color: 'success', icon: 'mdi-check-circle' })

const statusFilterOptions = ['All', 'unpaid', 'partially_paid', 'paid']

const paymentMethods = [
  { label: 'Bank Transfer', value: 'bank_transfer' },
  { label: 'Cash', value: 'cash' },
  { label: 'Cheque', value: 'cheque' },
  { label: 'Card', value: 'card' },
  { label: 'Mobile Money', value: 'mobile_money' },
  { label: 'Other', value: 'other' }
]

// ─── TABLE HEADERS ───────────────────────────────────────
const tableHeaders = [
  { title: 'PO Number', key: 'po_number', sortable: false },
  { title: 'Supplier', key: 'supplier', sortable: false },
  { title: 'Status', key: 'payment_status', sortable: true },
  { title: 'Amount Due', key: 'amount_due', sortable: true },
  { title: 'Paid', key: 'amount_paid', sortable: true },
  { title: 'Balance', key: 'balance', sortable: true },
  { title: 'Approval', key: 'approved_by_user', sortable: false },
  { title: 'Actions', key: 'actions', sortable: false, align: 'center' }
]

// ─── COMPUTED ────────────────────────────────────────────
const filteredPayments = computed(() => {
  return payments.value.filter((p) => {
    const q = search.value.toLowerCase()
    const matchSearch =
      !q ||
      (p.purchase_orders?.po_number || '').toLowerCase().includes(q) ||
      (p.purchase_orders?.suppliers?.name || '').toLowerCase().includes(q) ||
      (p.payment_reference || '').toLowerCase().includes(q)
    const matchStatus = filterStatus.value === 'All' || p.payment_status === filterStatus.value
    return matchSearch && matchStatus
  })
})

const summaryStats = computed(() => {
  if (!summary.value) return []
  return [
    {
      label: 'Unpaid',
      value: summary.value.unpaid,
      icon: 'mdi-clock-alert-outline',
      color: '#dc2626',
      bg: '#fee2e2'
    },
    {
      label: 'Partially Paid',
      value: summary.value.partially_paid,
      icon: 'mdi-cash-minus',
      color: '#d97706',
      bg: '#fef3c7'
    },
    {
      label: 'Fully Paid',
      value: summary.value.paid,
      icon: 'mdi-cash-check',
      color: '#059669',
      bg: '#d1fae5'
    }
  ]
})

// ─── FETCH ───────────────────────────────────────────────
async function fetchPayments() {
  loading.value = true
  try {
    const res = await ApiService.get('/supplies-payment?limit=100')
    payments.value = res.data.payments || []
  } catch (err) {
    console.error('fetchPayments error:', err)
    showSnack('Failed to load payments.', 'error', 'mdi-alert-circle-outline')
  } finally {
    loading.value = false
  }
}

async function fetchSummary() {
  try {
    const res = await ApiService.get('/supplies-payment?action=summary')
    summary.value = res.data
  } catch (err) {
    console.warn('Could not fetch payment summary:', err)
  }
}

onMounted(() => {
  fetchPayments()
  fetchSummary()
})

// ─── ROW CLICK ───────────────────────────────────────────
function onRowClick(_, row) {
  openDetailDialog(row.item)
}

// ─── DETAIL DIALOG ───────────────────────────────────────
async function openDetailDialog(payment) {
  selectedPayment.value = payment
  detailDialog.value = true
  try {
    const res = await ApiService.get(`/supplies-payment?action=get&id=${payment.id}`)
    selectedPayment.value = res.data
  } catch (err) {
    console.warn('Could not fetch full payment details:', err)
  }
}

// ─── RECORD PAYMENT ──────────────────────────────────────
function openRecordDialog(payment) {
  recordTarget.value = payment
  Object.assign(recordFields, {
    amount_paid: Number(payment.balance || 0),
    payment_method: null,
    payment_reference: '',
    payment_date: null,
    payment_date_display: '',
    receipt_url: '',
    notes: ''
  })
  recordError.value = ''
  recordDialog.value = true
}

function openRecordFromDetail() {
  openRecordDialog(selectedPayment.value)
  detailDialog.value = false
}

function onPaymentDatePicked(date) {
  recordFields.payment_date_display = formatDate(date)
  paymentDateMenu.value = false
}

function clearPaymentDate() {
  recordFields.payment_date = null
  recordFields.payment_date_display = ''
}

async function submitRecord() {
  const { valid } = (await recordFormRef.value?.validate()) ?? { valid: true }
  if (!valid) return
  savingRecord.value = true
  recordError.value = ''
  try {
    await ApiService.post('/supplies-payment', {
      payment_id: recordTarget.value.id,
      amount_paid: Number(recordFields.amount_paid),
      payment_method: recordFields.payment_method,
      payment_reference: recordFields.payment_reference || null,
      payment_date: recordFields.payment_date
        ? new Date(recordFields.payment_date).toISOString().split('T')[0]
        : null,
      receipt_url: recordFields.receipt_url || null,
      notes: recordFields.notes || null
    })
    showSnack('Payment recorded successfully!', 'success', 'mdi-cash-check')
    recordDialog.value = false
    await fetchPayments()
    await fetchSummary()
  } catch (err) {
    recordError.value = err?.response?.data?.error || 'Failed to record payment.'
  } finally {
    savingRecord.value = false
  }
}

// ─── APPROVE PAYMENT ─────────────────────────────────────
function openApproveConfirm(payment) {
  approveTarget.value = payment
  approveDialog.value = true
}

function openApproveFromDetail() {
  openApproveConfirm(selectedPayment.value)
  detailDialog.value = false
}

async function submitApprove() {
  approvingPayment.value = true
  try {
    await ApiService.patch('/supplies-payment', {
      action: 'approve',
      payment_id: approveTarget.value.id
    })
    showSnack('Payment approved!', 'success', 'mdi-check-decagram-outline')
    approveDialog.value = false
    await fetchPayments()
    await fetchSummary()
  } catch (err) {
    showSnack(
      err?.response?.data?.error || 'Failed to approve payment.',
      'error',
      'mdi-alert-circle-outline'
    )
  } finally {
    approvingPayment.value = false
  }
}

// ─── HELPERS ─────────────────────────────────────────────
function paymentStatusLabel(s) {
  const map = { unpaid: 'Unpaid', partially_paid: 'Partial', paid: 'Paid' }
  return map[s] || s
}
function paymentStatusColor(s) {
  return s === 'paid' ? 'success' : s === 'partially_paid' ? 'warning' : 'error'
}
function paymentStatusIcon(s) {
  return s === 'paid'
    ? 'mdi-cash-check'
    : s === 'partially_paid'
      ? 'mdi-cash-minus'
      : 'mdi-cash-clock'
}
function paymentPercent(payment) {
  const due = Number(payment.amount_due || 0)
  const paid = Number(payment.amount_paid || 0)
  if (!due) return 0
  return Math.min(100, Math.round((paid / due) * 100))
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
.v-btn {
  text-transform: none;
}
</style>
