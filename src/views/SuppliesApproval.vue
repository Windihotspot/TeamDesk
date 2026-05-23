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
                <v-icon color="#0f4c81" size="22">mdi-check-decagram-outline</v-icon>
              </div>
              <h1 class="sr-page-title">Approvals</h1>
            </div>
            <p class="sr-page-subtitle">Review and action pending supply requests</p>
          </div>
        </div>

        <!-- Stats -->
        <div class="sr-stats mt-5 grid grid-cols-2 md:grid-cols-4 gap-3">
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
            placeholder="Search by supply, requester, #number…"
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
            v-model="filterPriority"
            :items="['All', 'low', 'normal', 'urgent']"
            label="Priority"
            variant="outlined"
            density="compact"
            hide-details
            rounded="lg"
            bg-color="white"
            style="min-width: 150px; max-width: 180px"
          />
        </div>
      </div>

      <!-- LOADING -->
      <div
        v-if="loading"
        class="fixed inset-0 bg-white/80 backdrop-blur-sm flex flex-col items-center justify-center z-50"
      >
        <v-progress-circular indeterminate color="#0f4c81" size="56" width="2" />
        <p class="mt-4 text-sm text-gray-500 font-medium">Loading approvals…</p>
      </div>

      <!-- TABLE -->
      <div v-else class="px-6 pb-10">
        <v-card rounded="xl" elevation="0" class="sr-table-card overflow-hidden">
          <v-data-table
            :headers="tableHeaders"
            :items="filteredRequests"
            :search="search"
            class="sr-table"
            hover
            @click:row="(_, row) => openDetailDialog(row.item)"
          >
            <template #item.request_number="{ item }">
              <span class="sr-request-num">#{{ item.request_number }}</span>
            </template>

            <template #item.supply_name="{ item }">
              <div class="flex items-center gap-2 py-1">
                <div class="sr-tbl-icon" :style="{ background: '#e8f0fb' }">
                  <v-icon color="#0f4c81" size="16">mdi-package-variant</v-icon>
                </div>
                <div>
                  <p class="font-semibold text-sm leading-tight">{{ item.supply_name }}</p>
                  <p class="text-xs text-grey-darken-1">
                    {{ item.quantity_requested }} {{ item.unit }}
                  </p>
                </div>
              </div>
            </template>

            <template #item.requester_name="{ item }">
              <div class="flex items-center gap-2">
                <v-avatar size="28" color="#e8f0fb">
                  <span class="text-xs font-bold" style="color: #0f4c81">
                    {{ initials(item.requester_name) }}
                  </span>
                </v-avatar>
                <span class="text-sm">{{ item.requester_name }}</span>
              </div>
            </template>

            <template #item.priority="{ item }">
              <v-chip
                size="small"
                :color="priorityColor(item.priority)"
                variant="tonal"
                rounded="lg"
              >
                {{ item.priority }}
              </v-chip>
            </template>

            <template #item.estimated_total="{ item }">
              <span class="font-semibold" style="color: #0f4c81">
                ₦{{ Number(item.estimated_total || 0).toLocaleString() }}
              </span>
            </template>

            <template #item.submitted_at="{ item }">
              <span class="text-sm text-grey">{{ formatDate(item.submitted_at) }}</span>
            </template>

            <template #item.actions="{ item }">
              <div class="flex gap-1" @click.stop>
                <v-tooltip text="Approve" location="top">
                  <template #activator="{ props }">
                    <v-btn
                      v-bind="props"
                      icon="mdi-check-circle-outline"
                      size="x-small"
                      color="success"
                      variant="tonal"
                      rounded="lg"
                      @click="openApproveDialog(item)"
                    />
                  </template>
                </v-tooltip>
                <v-tooltip text="Reject" location="top">
                  <template #activator="{ props }">
                    <v-btn
                      v-bind="props"
                      icon="mdi-close-circle-outline"
                      size="x-small"
                      color="error"
                      variant="tonal"
                      rounded="lg"
                      @click="openRejectDialog(item)"
                    />
                  </template>
                </v-tooltip>
                <v-tooltip text="Escalate" location="top">
                  <template #activator="{ props }">
                    <v-btn
                      v-bind="props"
                      icon="mdi-share-outline"
                      size="x-small"
                      color="warning"
                      variant="tonal"
                      rounded="lg"
                      @click="openEscalateDialog(item)"
                    />
                  </template>
                </v-tooltip>
              </div>
            </template>

            <template #no-data>
              <div class="sr-empty py-16 text-center">
                <v-icon size="56" color="#0f4c81" style="opacity: 0.25"
                  >mdi-check-decagram-outline</v-icon
                >
                <p class="mt-3 font-semibold text-grey-darken-2">No pending approvals</p>
                <p class="text-sm text-grey mt-1">You're all caught up!</p>
              </div>
            </template>
          </v-data-table>
        </v-card>
      </div>

      <!-- ══ DETAIL DIALOG ══ -->
      <v-dialog v-model="detailDialog" max-width="600" scrollable>
        <v-card v-if="selectedRequest" rounded="xl" elevation="0">
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
                <v-icon color="white" size="28">mdi-clipboard-list-outline</v-icon>
              </div>
              <div class="flex-1">
                <p class="text-white text-xs opacity-60 uppercase tracking-widest font-semibold">
                  Supply Request
                </p>
                <p class="text-white font-bold text-lg">#{{ selectedRequest.request_number }}</p>
                <p class="text-white text-sm opacity-70 mt-0.5">
                  {{ selectedRequest.supply_name }}
                </p>
              </div>
              <v-chip size="small" color="warning" variant="flat" rounded="lg" class="font-bold">
                <v-icon start size="12">mdi-clock-outline</v-icon>
                Pending
              </v-chip>
            </div>
            <div class="sr-detail-stats mt-4 grid grid-cols-3 gap-3">
              <div class="sr-detail-stat">
                <p class="sr-detail-stat-val">{{ selectedRequest.quantity_requested }}</p>
                <p class="sr-detail-stat-lbl">Qty Requested</p>
              </div>
              <div class="sr-detail-stat">
                <p class="sr-detail-stat-val">
                  ₦{{ Number(selectedRequest.unit_price || 0).toLocaleString() }}
                </p>
                <p class="sr-detail-stat-lbl">Unit Price</p>
              </div>
              <div class="sr-detail-stat">
                <p class="sr-detail-stat-val">
                  ₦{{ Number(selectedRequest.estimated_total || 0).toLocaleString() }}
                </p>
                <p class="sr-detail-stat-lbl">Total</p>
              </div>
            </div>
          </div>

          <v-card-text class="pa-5">
            <div class="grid grid-cols-2 gap-4">
              <div class="sr-info-item">
                <v-icon size="15" color="#0f4c81">mdi-account-outline</v-icon>
                <div>
                  <p class="sr-info-lbl">Requested By</p>
                  <p class="sr-info-val">{{ selectedRequest.requester_name }}</p>
                </div>
              </div>
              <div class="sr-info-item">
                <v-icon size="15" color="#0f4c81">mdi-flag-outline</v-icon>
                <div>
                  <p class="sr-info-lbl">Priority</p>
                  <p
                    class="sr-info-val capitalize"
                    :style="{ color: priorityColor(selectedRequest.priority) }"
                  >
                    {{ selectedRequest.priority }}
                  </p>
                </div>
              </div>
              <div class="sr-info-item">
                <v-icon size="15" color="#0f4c81">mdi-calendar-plus-outline</v-icon>
                <div>
                  <p class="sr-info-lbl">Submitted</p>
                  <p class="sr-info-val">{{ formatDate(selectedRequest.submitted_at) }}</p>
                </div>
              </div>
              <div class="sr-info-item">
                <v-icon size="15" color="#0f4c81">mdi-calendar-clock-outline</v-icon>
                <div>
                  <p class="sr-info-lbl">Needed By</p>
                  <p class="sr-info-val">
                    {{
                      selectedRequest.needed_by_date
                        ? formatDate(selectedRequest.needed_by_date)
                        : '—'
                    }}
                  </p>
                </div>
              </div>
            </div>

            <div
              v-if="selectedRequest.reason"
              class="mt-4 p-4 rounded-xl"
              style="background: #f5f8fc"
            >
              <p class="text-xs font-semibold text-grey-darken-2 mb-1">Reason / Justification</p>
              <p class="text-sm" style="color: #374151">{{ selectedRequest.reason }}</p>
            </div>

            <!-- Approval History -->
            <div class="mt-5">
              <p class="text-sm font-bold mb-3" style="color: #0f4c81">Approval History</p>
              <div v-if="loadingHistory" class="space-y-3">
                <div v-for="i in 2" :key="i" class="flex gap-3 items-start">
                  <v-skeleton-loader type="avatar" width="28" height="28" />
                  <div class="flex-1">
                    <v-skeleton-loader type="text" width="40%" class="mb-1" />
                    <v-skeleton-loader type="text" width="70%" />
                  </div>
                </div>
              </div>
              <template v-else>
                <div v-if="approvalHistory.length" class="space-y-3">
                  <div v-for="h in approvalHistory" :key="h.id" class="sr-comment">
                    <v-avatar size="28" :color="historyColor(h.decision)">
                      <v-icon size="14" color="white">{{ historyIcon(h.decision) }}</v-icon>
                    </v-avatar>
                    <div class="flex-1">
                      <p class="text-xs font-semibold">
                        {{ h.users?.first_name }} {{ h.users?.last_name }}
                        <v-chip
                          size="x-small"
                          :color="historyColor(h.decision)"
                          variant="tonal"
                          rounded
                          class="ml-1"
                        >
                          {{ h.decision }}
                        </v-chip>
                      </p>
                      <p v-if="h.comments" class="text-sm mt-0.5">{{ h.comments }}</p>
                      <p class="text-xs text-grey mt-0.5">{{ formatDate(h.decided_at) }}</p>
                    </div>
                  </div>
                </div>
                <p v-else class="text-sm text-grey">No history yet.</p>
              </template>
            </div>
          </v-card-text>

          <v-card-actions class="pa-5 pt-0 gap-2">
            <v-spacer />
            <v-btn
              color="error"
              variant="tonal"
              rounded="lg"
              prepend-icon="mdi-close-circle-outline"
              @click="rejectFromDetail"
              >Reject</v-btn
            >
            <v-btn
              color="warning"
              variant="tonal"
              rounded="lg"
              prepend-icon="mdi-share-outline"
              @click="escalateFromDetail"
              >Escalate</v-btn
            >
            <v-btn
              color="success"
              variant="flat"
              rounded="lg"
              prepend-icon="mdi-check-circle-outline"
              @click="approveFromDetail"
              >Approve</v-btn
            >
          </v-card-actions>
        </v-card>
      </v-dialog>

      <!-- ══ APPROVE DIALOG ══ -->
      <v-dialog v-model="approveDialog" max-width="460">
        <v-card rounded="xl" elevation="0">
          <div
            class="sr-dialog-header"
            style="background: linear-gradient(135deg, #059669, #0f4c81)"
          >
            <div class="flex items-center justify-between">
              <h3 class="text-white font-bold text-lg">Approve Request</h3>
              <v-btn
                icon="mdi-close"
                variant="text"
                color="white"
                size="small"
                @click="approveDialog = false"
              />
            </div>
            <p class="text-white text-xs opacity-60 mt-1">
              #{{ actionTarget?.request_number }} — {{ actionTarget?.supply_name }}
            </p>
          </div>
          <v-card-text class="pa-5">
            <v-text-field
              v-model.number="approveQty"
              label="Quantity to Approve"
              type="number"
              variant="outlined"
              density="comfortable"
              rounded="lg"
              prepend-inner-icon="mdi-counter"
              :hint="`Requested: ${actionTarget?.quantity_requested}`"
              persistent-hint
            />
            <v-textarea
              v-model="approveComments"
              label="Comments (optional)"
              variant="outlined"
              density="comfortable"
              rounded="lg"
              rows="3"
              prepend-inner-icon="mdi-text-box-outline"
              class="mt-3"
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
            <v-btn variant="text" color="grey" rounded="lg" @click="approveDialog = false"
              >Cancel</v-btn
            >
            <v-spacer />
            <v-btn
              color="success"
              rounded="lg"
              elevation="0"
              prepend-icon="mdi-check-circle-outline"
              :loading="actioning"
              @click="submitApprove"
            >
              Approve
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>

      <!-- ══ REJECT DIALOG ══ -->
      <v-dialog v-model="rejectDialog" max-width="460">
        <v-card rounded="xl" elevation="0">
          <div
            class="sr-dialog-header"
            style="background: linear-gradient(135deg, #dc2626, #7f1d1d)"
          >
            <div class="flex items-center justify-between">
              <h3 class="text-white font-bold text-lg">Reject Request</h3>
              <v-btn
                icon="mdi-close"
                variant="text"
                color="white"
                size="small"
                @click="rejectDialog = false"
              />
            </div>
            <p class="text-white text-xs opacity-60 mt-1">
              #{{ actionTarget?.request_number }} — {{ actionTarget?.supply_name }}
            </p>
          </div>
          <v-card-text class="pa-5">
            <v-text-field
              v-model="rejectionReason"
              label="Reason for Rejection *"
              variant="outlined"
              density="comfortable"
              rounded="lg"
              prepend-inner-icon="mdi-alert-circle-outline"
              :rules="[(v) => !!v || 'Required']"
            />
            <v-textarea
              v-model="rejectComments"
              label="Additional Comments (optional)"
              variant="outlined"
              density="comfortable"
              rounded="lg"
              rows="3"
              prepend-inner-icon="mdi-text-box-outline"
              class="mt-3"
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
            <v-btn variant="text" color="grey" rounded="lg" @click="rejectDialog = false"
              >Cancel</v-btn
            >
            <v-spacer />
            <v-btn
              color="error"
              rounded="lg"
              elevation="0"
              prepend-icon="mdi-close-circle-outline"
              :loading="actioning"
              @click="submitReject"
            >
              Reject
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>

      <!-- ══ ESCALATE DIALOG ══ -->
      <v-dialog v-model="escalateDialog" max-width="460">
        <v-card rounded="xl" elevation="0">
          <div
            class="sr-dialog-header"
            style="background: linear-gradient(135deg, #d97706, #92400e)"
          >
            <div class="flex items-center justify-between">
              <h3 class="text-white font-bold text-lg">Escalate Request</h3>
              <v-btn
                icon="mdi-close"
                variant="text"
                color="white"
                size="small"
                @click="escalateDialog = false"
              />
            </div>
            <p class="text-white text-xs opacity-60 mt-1">
              #{{ actionTarget?.request_number }} — {{ actionTarget?.supply_name }}
            </p>
          </div>
          <v-card-text class="pa-5">
            <v-autocomplete
              v-model="escalateToUserId"
              :items="users"
              item-title="full_name"
              item-value="id"
              label="Escalate To *"
              variant="outlined"
              density="comfortable"
              rounded="lg"
              prepend-inner-icon="mdi-account-arrow-right-outline"
              :rules="[(v) => !!v || 'Required']"
            />
            <v-textarea
              v-model="escalateComments"
              label="Comments (optional)"
              variant="outlined"
              density="comfortable"
              rounded="lg"
              rows="3"
              prepend-inner-icon="mdi-text-box-outline"
              class="mt-3"
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
            <v-btn variant="text" color="grey" rounded="lg" @click="escalateDialog = false"
              >Cancel</v-btn
            >
            <v-spacer />
            <v-btn
              color="warning"
              rounded="lg"
              elevation="0"
              prepend-icon="mdi-share-outline"
              :loading="actioning"
              @click="submitEscalate"
            >
              Escalate
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

<script setup>
import { ref, computed, reactive, onMounted } from 'vue'
import MainLayout from '@/layouts/full/MainLayout.vue'
import ApiService from '@/services/api'
import { supabase } from '@/services/supabase.js'

// ─── STATE ───────────────────────────────────────────────
const loading = ref(false)
const requests = ref([])
const users = ref([])
const search = ref('')
const filterPriority = ref('All')

// dialogs
const detailDialog = ref(false)
const approveDialog = ref(false)
const rejectDialog = ref(false)
const escalateDialog = ref(false)
const actioning = ref(false)
const actionError = ref('')

const selectedRequest = ref(null)
const actionTarget = ref(null)
const approvalHistory = ref([])
const loadingHistory = ref(false)

// approve fields
const approveQty = ref(null)
const approveComments = ref('')

// reject fields
const rejectionReason = ref('')
const rejectComments = ref('')

// escalate fields
const escalateToUserId = ref(null)
const escalateComments = ref('')

const snackbar = reactive({ show: false, text: '', color: 'success', icon: 'mdi-check-circle' })

// ─── COMPUTED ────────────────────────────────────────────
const filteredRequests = computed(() => {
  return requests.value.filter((r) => {
    const q = search.value.toLowerCase()
    const matchSearch =
      !q ||
      (r.supply_name || '').toLowerCase().includes(q) ||
      (r.requester_name || '').toLowerCase().includes(q) ||
      String(r.request_number || '').includes(q)
    const matchPriority = filterPriority.value === 'All' || r.priority === filterPriority.value
    return matchSearch && matchPriority
  })
})

const summaryStats = computed(() => {
  const all = requests.value
  return [
    {
      label: 'Pending',
      value: all.length,
      icon: 'mdi-clock-outline',
      color: '#d97706',
      bg: '#fef3c7'
    },
    {
      label: 'Urgent',
      value: all.filter((r) => r.priority === 'urgent').length,
      icon: 'mdi-flag',
      color: '#dc2626',
      bg: '#fee2e2'
    },
    {
      label: 'Today',
      value: all.filter((r) => isToday(r.submitted_at)).length,
      icon: 'mdi-calendar-today',
      color: '#0284c7',
      bg: '#e0f2fe'
    },
    {
      label: 'Overdue',
      value: all.filter((r) => isOverdue(r.needed_by_date)).length,
      icon: 'mdi-calendar-alert',
      color: '#7c3aed',
      bg: '#ede9fe'
    }
  ]
})

// ─── TABLE HEADERS ───────────────────────────────────────
const tableHeaders = [
  { title: '#', key: 'request_number', sortable: true, width: '100px' },
  { title: 'Supply', key: 'supply_name', sortable: true },
  { title: 'Requester', key: 'requester_name', sortable: true },
  { title: 'Priority', key: 'priority', sortable: true },
  { title: 'Total', key: 'estimated_total', sortable: true },
  { title: 'Submitted', key: 'submitted_at', sortable: true },
  { title: 'Actions', key: 'actions', sortable: false, align: 'center' }
]

// ─── FETCH ───────────────────────────────────────────────
async function fetchPendingApprovals() {
  loading.value = true
  try {
    const res = await ApiService.get('/supplies-approvals')
    requests.value = Array.isArray(res.data) ? res.data : []
  } catch (err) {
    console.log('approvals error:', err)
    showSnack('Failed to load approvals.', 'error', 'mdi-alert-circle-outline')
  } finally {
    loading.value = false
  }
}

async function fetchUsers() {
  const { data, error } = await supabase
    .from('users')
    .select('id, first_name, last_name')
    .order('first_name')
  console.log('users error:', error)
  users.value = (data || []).map((u) => ({ ...u, full_name: `${u.first_name} ${u.last_name}` }))
}

onMounted(() => {
  fetchPendingApprovals()
  fetchUsers()
})

// ─── DETAIL DIALOG ───────────────────────────────────────
async function openDetailDialog(req) {
  selectedRequest.value = req
  approvalHistory.value = []
  detailDialog.value = true
  loadingHistory.value = true
  try {
    const res = await ApiService.get(`/supplies-approvals?action=history&request_id=${req.id}`)
    approvalHistory.value = res.data || []
  } catch (err) {
    console.warn('Could not fetch history:', err)
  } finally {
    loadingHistory.value = false
  }
}

// ─── APPROVE ─────────────────────────────────────────────
function openApproveDialog(req) {
  actionTarget.value = req
  approveQty.value = req.quantity_requested
  approveComments.value = ''
  actionError.value = ''
  approveDialog.value = true
}

async function submitApprove() {
  if (!approveQty.value || approveQty.value <= 0) {
    actionError.value = 'Please enter a valid quantity.'
    return
  }
  actioning.value = true
  actionError.value = ''
  try {
    await ApiService.post('/supplies-approvals', {
      action: 'approve',
      request_id: actionTarget.value.id,
      quantity_approved: Number(approveQty.value),
      comments: approveComments.value || null
    })
    showSnack(
      `Request #${actionTarget.value.supply_name} approved.`,
      'success',
      'mdi-check-circle-outline'
    )
    approveDialog.value = false
    await fetchPendingApprovals()
  } catch (err) {
    actionError.value = err?.response?.data?.error || 'Failed to approve request.'
  } finally {
    actioning.value = false
  }
}

// ─── REJECT ──────────────────────────────────────────────
function openRejectDialog(req) {
  actionTarget.value = req
  rejectionReason.value = ''
  rejectComments.value = ''
  actionError.value = ''
  rejectDialog.value = true
}

async function submitReject() {
  if (!rejectionReason.value.trim()) {
    actionError.value = 'Rejection reason is required.'
    return
  }
  actioning.value = true
  actionError.value = ''
  try {
    await ApiService.post('/supplies-approvals', {
      action: 'reject',
      request_id: actionTarget.value.id,
      rejection_reason: rejectionReason.value.trim(),
      comments: rejectComments.value || null
    })
    showSnack(
      `Request #${actionTarget.value.supply_name} rejected.`,
      'warning',
      'mdi-close-circle-outline'
    )
    rejectDialog.value = false
    await fetchPendingApprovals()
  } catch (err) {
    actionError.value = err?.response?.data?.error || 'Failed to reject request.'
  } finally {
    actioning.value = false
  }
}

// ─── ESCALATE ────────────────────────────────────────────
function openEscalateDialog(req) {
  actionTarget.value = req
  escalateToUserId.value = null
  escalateComments.value = ''
  actionError.value = ''
  escalateDialog.value = true
}

async function submitEscalate() {
  if (!escalateToUserId.value) {
    actionError.value = 'Please select a user to escalate to.'
    return
  }
  actioning.value = true
  actionError.value = ''
  try {
    await ApiService.post('/supplies-approvals', {
      action: 'escalate',
      request_id: actionTarget.value.id,
      escalate_to_user_id: escalateToUserId.value,
      comments: escalateComments.value || null
    })
    showSnack(`Request #${actionTarget.value.supply_name} escalated.`, 'info', 'mdi-share-outline')
    escalateDialog.value = false
    await fetchPendingApprovals()
  } catch (err) {
    actionError.value = err?.response?.data?.error || 'Failed to escalate request.'
  } finally {
    actioning.value = false
  }
}

// ─── HELPERS ─────────────────────────────────────────────
function priorityColor(p) {
  return p === 'urgent' ? '#dc2626' : p === 'low' ? '#94a3b8' : '#0f4c81'
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
function isToday(d) {
  if (!d) return false
  return new Date(d).toDateString() === new Date().toDateString()
}
function isOverdue(d) {
  if (!d) return false
  return new Date(d) < new Date()
}
function historyColor(decision) {
  return decision === 'approved' ? 'success' : decision === 'rejected' ? 'error' : 'warning'
}
function historyIcon(decision) {
  return decision === 'approved' ? 'mdi-check' : decision === 'rejected' ? 'mdi-close' : 'mdi-share'
}
function showSnack(text, color = 'success', icon = 'mdi-check-circle') {
  snackbar.text = text
  snackbar.color = color
  snackbar.icon = icon
  snackbar.show = true
}
function approveFromDetail() {
  openApproveDialog(selectedRequest.value)
  detailDialog.value = false
}

function rejectFromDetail() {
  openRejectDialog(selectedRequest.value)
  detailDialog.value = false
}

function escalateFromDetail() {
  openEscalateDialog(selectedRequest.value)
  detailDialog.value = false
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
