<template>
  <MainLayout>
    <div class="sr-page">
      <div class="sr-bg-mesh" />

      <!-- ── PAGE HEADER ── -->
      <div class="sr-header px-6 pt-6 pb-4">
        <div class="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div class="flex items-center gap-2 mb-1">
              <div class="sr-header-icon">
                <v-icon color="#0f4c81" size="22">mdi-clipboard-list-outline</v-icon>
              </div>
              <h1 class="sr-page-title">Supply Requests</h1>
            </div>
            <p class="sr-page-subtitle">
              Track, manage and action all supply requests in one place
            </p>
          </div>
          <v-btn
            color="#0f4c81"
            prepend-icon="mdi-plus"
            rounded="lg"
            elevation="0"
            class="sr-primary-btn"
            @click="openCreateDialog"
          >
            New Request
          </v-btn>
        </div>

        <!-- Stats -->
        <div class="sr-stats mt-5 grid grid-cols-2 md:grid-cols-6 gap-3">
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

      <!-- ── FILTERS BAR ── -->
      <div class="sr-filters px-6 py-3">
        <div class="flex flex-wrap gap-3 items-center">
          <v-text-field
            v-model="search"
            placeholder="Search by supply name, requester, #number…"
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
          <v-select
            v-model="filterPriority"
            :items="priorityFilterOptions"
            label="Priority"
            variant="outlined"
            density="compact"
            hide-details
            rounded="lg"
            bg-color="white"
            style="min-width: 150px; max-width: 180px"
          />
          <v-spacer />
          <!-- View toggle -->
          <div class="sr-view-toggle">
            <v-btn
              :variant="viewMode === 'table' ? 'flat' : 'text'"
              :color="viewMode === 'table' ? '#0f4c81' : 'grey'"
              icon="mdi-table"
              size="small"
              rounded="lg"
              @click="viewMode = 'table'"
            />
            <v-btn
              :variant="viewMode === 'cards' ? 'flat' : 'text'"
              :color="viewMode === 'cards' ? '#0f4c81' : 'grey'"
              icon="mdi-view-grid"
              size="small"
              rounded="lg"
              @click="viewMode = 'cards'"
            />
          </div>
        </div>

        <!-- Active filter chips -->
        <div v-if="activeFilters.length" class="mt-2 flex flex-wrap gap-2">
          <v-chip
            v-for="f in activeFilters"
            :key="f.key"
            size="small"
            closable
            color="#0f4c81"
            variant="tonal"
            @click:close="clearFilter(f.key)"
            >{{ f.label }}</v-chip
          >
          <v-chip size="small" variant="text" color="grey" @click="clearAllFilters"
            >Clear all</v-chip
          >
        </div>
      </div>

      <!-- ── LOADING ── -->
      <div
        v-if="loading"
        class="fixed inset-0 bg-white/80 backdrop-blur-sm flex flex-col items-center justify-center z-50"
      >
        <v-progress-circular indeterminate color="#0f4c81" size="56" width="2" />
        <p class="mt-4 text-sm text-gray-500 font-medium">Loading requests…</p>
      </div>

      <!-- ── TABLE VIEW ── -->
      <div v-else-if="viewMode === 'table'" class="px-6 pb-10">
        <v-card rounded="xl" elevation="0" class="sr-table-card overflow-hidden">
          <v-data-table
            :headers="tableHeaders"
            :items="filteredRequests"
            :search="search"
            class="sr-table"
            hover
            @click:row="(_, row) => openDetailDialog(row.item)"
          >
            <template #item.supply_name="{ item }">
              <div class="flex items-center gap-2 py-1">
                <div class="sr-tbl-icon" :style="{ background: '#e8f0fb' }">
                  <v-icon color="#0f4c81" size="16">mdi-package-variant</v-icon>
                </div>
                <div>
                  <p class="font-semibold text-sm leading-tight">{{ item.supply_name }}</p>
                  <!-- <p class="text-xs text-grey-darken-1">
                    {{ item.quantity_requested }} {{ item.unit }}
                  </p> -->
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

            <template #item.priority="{ item }">
              <v-chip
                size="small"
                :color="priorityColor(item.priority)"
                variant="tonal"
                rounded="lg"
                >{{ item.priority }}</v-chip
              >
            </template>

            <template #item.total_amount="{ item }">
              <span class="font-semibold" style="color: #0f4c81">
                ₦{{ Number(item.estimated_total || 0).toLocaleString() }}
              </span>
            </template>

            <template #item.submitted_at="{ item }">
              <span class="text-sm text-grey">{{ formatDate(item.submitted_at) }}</span>
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
                <v-tooltip text="Edit" location="top">
                  <template #activator="{ props }">
                    <v-btn
                      v-bind="props"
                      icon="mdi-pencil-outline"
                      size="x-small"
                      color="grey"
                      variant="text"
                      rounded="lg"
                      :disabled="!canEdit(item)"
                      @click="openEditDialog(item)"
                    />
                  </template>
                </v-tooltip>
                <v-tooltip text="Copy link" location="top">
                  <template #activator="{ props }">
                    <!-- <v-btn
                      v-bind="props"
                      icon="mdi-link-variant"
                      size="x-small"
                      color="grey"
                      variant="text"
                      rounded="lg"
                      @click="copyLink(item)"
                    /> -->
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
                      @click="confirmDelete(item)"
                    />
                  </template>
                </v-tooltip>
              </div>
            </template>

            <template #no-data>
              <div class="sr-empty py-16 text-center">
                <v-icon size="56" color="#0f4c81" style="opacity: 0.25"
                  >mdi-clipboard-list-outline</v-icon
                >
                <p class="mt-3 font-semibold text-grey-darken-2">No requests found</p>
                <p class="text-sm text-grey mt-1">Adjust your filters or create a new request</p>
                <v-btn
                  color="#0f4c81"
                  variant="tonal"
                  rounded="lg"
                  prepend-icon="mdi-plus"
                  class="mt-4"
                  @click="openCreateDialog"
                  >New Request</v-btn
                >
              </div>
            </template>
          </v-data-table>
        </v-card>
      </div>

      <!-- ── CARDS VIEW ── -->
      <div v-else class="px-6 pb-10">
        <div
          v-if="filteredRequests.length"
          class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
        >
          <div
            v-for="req in filteredRequests"
            :key="req.id"
            class="sr-card"
            @click="openDetailDialog(req)"
          >
            <!-- Status strip -->
            <div class="sr-card-strip" :style="{ background: statusHex(req.status) }" />

            <div class="sr-card-body">
              <div class="flex items-start justify-between mb-3">
                <v-chip
                  size="x-small"
                  :color="statusColor(req.status)"
                  variant="tonal"
                  rounded="lg"
                >
                  {{ statusLabel(req.status) }}
                </v-chip>
              </div>

              <div class="flex items-center gap-2 mb-2">
                <div class="sr-card-icon">
                  <v-icon color="#0f4c81" size="18">mdi-package-variant</v-icon>
                </div>
                <div>
                  <p class="font-semibold text-sm leading-tight">{{ req.supply_name }}</p>
                </div>
              </div>

              <div class="sr-card-meta">
                <div class="sr-meta-row">
                  <v-icon size="13" color="grey">mdi-account-outline</v-icon>
                  <span>{{ req.requester_name }}</span>
                </div>
                <div class="sr-meta-row">
                  <v-icon size="13" color="grey">mdi-calendar-outline</v-icon>
                  <span>{{ formatDate(req.submitted_at) }}</span>
                </div>
                <div class="sr-meta-row">
                  <v-icon size="13" :color="priorityColor(req.priority)">mdi-flag</v-icon>
                  <span
                    :style="{ color: priorityColor(req.priority) }"
                    class="capitalize font-medium"
                    >{{ req.priority }}</span
                  >
                </div>
              </div>

              <div class="sr-card-footer">
                <span class="sr-amount"
                  >₦{{ Number(req.estimated_total || 0).toLocaleString() }}</span
                >
                <div class="flex gap-1" @click.stop>
                  <v-btn
                    icon="mdi-pencil-outline"
                    size="x-small"
                    color="grey"
                    variant="text"
                    rounded="lg"
                    :disabled="!canEdit(req)"
                    @click="openEditDialog(req)"
                  />
                  <!-- <v-btn
                    icon="mdi-link-variant"
                    size="x-small"
                    color="grey"
                    variant="text"
                    rounded="lg"
                    @click="copyLink(req)"
                  /> -->
                  <v-btn
                    icon="mdi-delete-outline"
                    size="x-small"
                    color="error"
                    variant="text"
                    rounded="lg"
                    @click="confirmDelete(req)"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div v-else class="sr-empty py-20 text-center">
          <v-icon size="64" color="#0f4c81" style="opacity: 0.2">mdi-clipboard-list-outline</v-icon>
          <p class="mt-3 font-semibold text-grey-darken-2">No requests found</p>
          <p class="text-sm text-grey mt-1">Adjust your filters or create a new request</p>
          <v-btn
            color="#0f4c81"
            variant="tonal"
            rounded="lg"
            prepend-icon="mdi-plus"
            class="mt-4"
            @click="openCreateDialog"
            >New Request</v-btn
          >
        </div>
      </div>

      <!-- ════════════════════════════════════════
           CREATE / EDIT DIALOG
      ════════════════════════════════════════ -->
      <v-dialog v-model="formDialog" max-width="560" scrollable>
        <v-card rounded="xl" elevation="0">
          <!-- Header -->
          <div class="sr-dialog-header">
            <div class="flex items-center justify-between">
              <h3 class="text-white font-bold text-lg">
                {{ editMode ? `Edit Request:  ${formFields.supply_name}` : 'New Supply Request' }}
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
                  ? 'Update the details below and save.'
                  : 'Fill in the details to submit a new request.'
              }}
            </p>
          </div>

          <v-card-text class="pa-5">
            <v-form ref="formRef" v-model="formValid">
              <!-- Supply picker -->
              <v-autocomplete
                v-model="formFields.supply_id"
                :items="supplies"
                item-title="name"
                item-value="id"
                label="Supply *"
                variant="outlined"
                density="comfortable"
                rounded="lg"
                prepend-inner-icon="mdi-package-variant"
                :rules="[(v) => !!v || 'Required']"
                :disabled="editMode"
                @update:model-value="onSupplySelected"
              >
                <template #item="{ item, props }">
                  <v-list-item v-bind="props">
                    <template #append>
                      <span class="text-xs text-grey">{{ item.raw.current_stock }} in stock</span>
                    </template>
                  </v-list-item>
                </template>
              </v-autocomplete>

              <div class="grid grid-cols-2 gap-4 mt-1">
                <v-text-field
                  v-model.number="formFields.quantity_requested"
                  label="Quantity *"
                  type="number"
                  variant="outlined"
                  density="comfortable"
                  rounded="lg"
                  prepend-inner-icon="mdi-counter"
                  :rules="[
                    (v) => !!v || 'Required',
                    (v) => v > 0 || 'Must be > 0',
                    (v) =>
                      !selectedSupply ||
                      v <= selectedSupply.current_stock ||
                      `Only ${selectedSupply?.current_stock} in stock`
                  ]"
                  @update:model-value="calcEstimate"
                />
                <v-text-field
                  :model-value="formFields.supply_id ? `₦${estimatedTotal.toLocaleString()}` : '—'"
                  label="Estimated Total"
                  variant="outlined"
                  density="comfortable"
                  rounded="lg"
                  prepend-inner-icon="mdi-cash"
                  readonly
                  bg-color="#f5f8fc"
                />
              </div>

              <v-select
                v-model="formFields.priority"
                :items="['low', 'normal', 'urgent']"
                label="Priority"
                variant="outlined"
                density="comfortable"
                rounded="lg"
                prepend-inner-icon="mdi-flag-outline"
                class="mt-1"
              />

              <v-menu v-model="formDateMenu" :close-on-content-click="false">
                <template #activator="{ props }">
                  <v-text-field
                    v-bind="props"
                    v-model="formFields.needed_by_display"
                    label="Needed By (optional)"
                    variant="outlined"
                    density="comfortable"
                    rounded="lg"
                    prepend-inner-icon="mdi-calendar-outline"
                    readonly
                    clearable
                    class="mt-1"
                    @click:clear="clearNeededBy"
                  />
                </template>
                <v-date-picker
                  v-model="formFields.needed_by_date"
                  color="#0f4c81"
                  :min="todayStr"
                  @update:model-value="onDatePicked"
                />
              </v-menu>

              <v-textarea
                v-model="formFields.reason"
                label="Reason / Justification (optional)"
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
              >{{ formError }}</v-alert
            >
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
              {{ editMode ? 'Save Changes' : 'Submit Request' }}
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>

      <!-- ════════════════════════════════════════
           DETAIL DIALOG
      ════════════════════════════════════════ -->
      <v-dialog v-model="detailDialog" max-width="600" scrollable>
        <v-card v-if="selectedRequest" rounded="xl" elevation="0">
          <!-- Hero header -->
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
                <p class="text-white text-sm opacity-70 mt-0.5">
                  {{ selectedRequest.supply_name }}
                </p>
              </div>
              <v-chip
                size="small"
                :color="statusColor(selectedRequest.status)"
                variant="flat"
                rounded="lg"
                class="font-bold"
              >
                <v-icon start size="12">{{ statusIcon(selectedRequest.status) }}</v-icon>
                {{ statusLabel(selectedRequest.status) }}
              </v-chip>
            </div>

            <!-- Quick stats -->
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
              <!-- <div class="sr-info-item">
                <v-icon size="15" color="#0f4c81">mdi-account-check-outline</v-icon>
                <div>
                  <p class="sr-info-lbl">Approver</p>
                  <p class="sr-info-val">{{ selectedRequest.approver_name || 'Not assigned' }}</p>
                </div>
              </div> -->
              <div class="sr-info-item">
                <v-icon size="15" color="#0f4c81">mdi-office-building-outline</v-icon>
                <div>
                  <p class="sr-info-lbl">Team</p>
                  <p class="sr-info-val">{{ selectedRequest.team_name || '—' }}</p>
                </div>
              </div>
            </div>

            <!-- Reason -->
            <div
              v-if="selectedRequest.reason"
              class="mt-4 p-4 rounded-xl"
              style="background: #f5f8fc"
            >
              <p class="text-xs font-semibold text-grey-darken-2 mb-1">Reason / Justification</p>
              <p class="text-sm" style="color: #374151">{{ selectedRequest.reason }}</p>
            </div>

            <!-- Comments -->
            <!-- Comments -->
            <div class="mt-5">
              <p class="text-sm font-bold mb-3" style="color: #0f4c81">Comments</p>

              <!-- Skeleton -->
              <div v-if="loadingComments" class="space-y-3">
                <div v-for="i in 3" :key="i" class="flex gap-3 items-start">
                  <div class="flex-1">
                    <v-skeleton-loader type="text" width="30%" class="mb-1" />
                    <v-skeleton-loader type="text" width="80%" />
                    <v-skeleton-loader type="text" width="20%" class="mt-1" />
                  </div>
                </div>
              </div>

              <!-- Loaded -->
              <template v-else>
                <div v-if="detailComments.length" class="space-y-3">
                  <div v-for="c in detailComments" :key="c.id" class="sr-comment">
                    <v-avatar size="28" color="#e8f0fb">
                      <span class="text-xs font-bold" style="color: #0f4c81">
                        {{ initials(`${c.users?.first_name} ${c.users?.last_name}`) }}
                      </span>
                    </v-avatar>
                    <div class="flex-1">
                      <p class="text-xs font-semibold">
                        {{ c.users?.first_name }} {{ c.users?.last_name }}
                      </p>
                      <p class="text-sm mt-0.5">{{ c.content }}</p>
                      <p class="text-xs text-grey mt-0.5">{{ formatDate(c.created_at) }}</p>
                    </div>
                  </div>
                </div>
                <p v-else class="text-sm text-grey">No comments yet.</p>
              </template>

              <!-- Add comment -->
              <div class="flex gap-2 mt-3">
                <v-text-field
                  v-model="newComment"
                  placeholder="Add a comment…"
                  variant="outlined"
                  density="compact"
                  rounded="lg"
                  hide-details
                  class="flex-1"
                  @keyup.enter="addComment"
                />
                <v-btn
                  icon="mdi-send"
                  color="#0f4c81"
                  variant="tonal"
                  rounded="lg"
                  size="small"
                  :loading="addingComment"
                  @click="addComment"
                />
              </div>
            </div>
          </v-card-text>

          <v-card-actions class="pa-5 pt-0 gap-2 flex-wrap">
            <!-- <v-btn
              variant="outlined"
              color="grey"
              rounded="lg"
              prepend-icon="mdi-link-variant"
              @click="copyLink(selectedRequest)"
              >Copy Link</v-btn
            > -->
            <v-spacer />
            <v-btn
              v-if="canEdit(selectedRequest)"
              variant="outlined"
              color="#0f4c81"
              rounded="lg"
              prepend-icon="mdi-pencil-outline"
              @click="openEditFromDetail"
              >Edit</v-btn
            >
            <v-btn
              v-if="canDelete(selectedRequest)"
              color="error"
              variant="tonal"
              rounded="lg"
              prepend-icon="mdi-delete-outline"
              @click="confirmDeleteFromDetail"
              >Cancel Request</v-btn
            >
          </v-card-actions>
        </v-card>
      </v-dialog>

      <!-- ════════════════════════════════════════
           DELETE / CANCEL CONFIRM
      ════════════════════════════════════════ -->
      <v-dialog v-model="deleteDialog" max-width="500">
        <v-card rounded="xl" elevation="0" class="pa-2">
          <v-card-text class="text-center pa-6">
            <div class="sr-delete-icon mx-auto mb-4">
              <v-icon
                :color="requestToDelete?._deleteAction === 'delete' ? 'error' : 'warning'"
                size="28"
              >
                mdi-alert-circle-outline
              </v-icon>
            </div>
            <h3 class="font-bold text-lg mb-2">
              {{
                requestToDelete?._deleteAction === 'delete'
                  ? 'Delete this Request?'
                  : 'Cancel this Request?'
              }}
            </h3>
            <p class="text-grey text-sm">
              Request <strong>#{{ requestToDelete?.request_number }}</strong> for
              <strong>{{ requestToDelete?.supply_name }}</strong>
              {{
                requestToDelete?._deleteAction === 'delete'
                  ? 'will be permanently deleted.'
                  : 'will be cancelled.'
              }}
              This cannot be undone.
            </p>
          </v-card-text>
          <v-card-actions class="pb-4 px-4 gap-2">
            <v-btn
              variant="outlined"
              color="grey"
              rounded="lg"
              class="flex-1"
              :disabled="deletingRequest"
              @click="deleteDialog = false"
              >Keep</v-btn
            >
            <v-btn
              color="warning"
              rounded="lg"
              class="flex-1"
              elevation="0"
              variant="tonal"
              :loading="deletingRequest"
              @click="cancelRequest"
              >Cancel Request</v-btn
            >
            <v-btn
              color="error"
              rounded="lg"
              class="flex-1"
              elevation="0"
              :loading="deletingRequest"
              @click="hardDeleteRequest"
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

const BASE_URL = 'https://team-desk-sandy.vercel.app/supplies-requests'

// ─── STATE ───────────────────────────────────────────────
const loading = ref(false)
const requests = ref([])
const supplies = ref([]) // for the supply picker dropdown

// filters
const search = ref('')
const filterStatus = ref('All')
const filterPriority = ref('All')
const viewMode = ref('table')

// dialogs
const formDialog = ref(false)
const detailDialog = ref(false)
const deleteDialog = ref(false)
const formDateMenu = ref(false)
const editMode = ref(false)

// form
const formRef = ref(null)
const formValid = ref(false)
const savingForm = ref(false)
const formError = ref('')
const estimatedTotal = ref(0)
const selectedSupply = ref(null)

const formFields = reactive({
  id: null,
  request_number: null,
  supply_id: null,
  quantity_requested: 1,
  priority: 'normal',
  needed_by_date: null,
  needed_by_display: '',
  reason: ''
})

// detail
const selectedRequest = ref(null)
const detailComments = ref([])
const newComment = ref('')
const addingComment = ref(false)

// delete
const requestToDelete = ref(null)
const deletingRequest = ref(false)

// snackbar
const snackbar = reactive({ show: false, text: '', color: 'success', icon: 'mdi-check-circle' })

const todayStr = new Date().toISOString().split('T')[0]

// ─── FILTER OPTIONS ──────────────────────────────────────
const statusFilterOptions = [
  'All',
  'pending_approval',
  'approved',
  'fulfilled',
  'rejected',
  'cancelled'
]
const priorityFilterOptions = ['All', 'low', 'normal', 'urgent']

// ─── COMPUTED ────────────────────────────────────────────
const activeFilters = computed(() => {
  const f = []
  if (filterStatus.value !== 'All')
    f.push({ key: 'status', label: `Status: ${filterStatus.value}` })
  if (filterPriority.value !== 'All')
    f.push({ key: 'priority', label: `Priority: ${filterPriority.value}` })
  return f
})

const filteredRequests = computed(() => {
  return requests.value.filter((r) => {
    const q = search.value.toLowerCase()
    const matchSearch =
      !q ||
      (r.supply_name || '').toLowerCase().includes(q) ||
      (r.requester_name || '').toLowerCase().includes(q) ||
      String(r.request_number || '').includes(q)
    const matchStatus = filterStatus.value === 'All' || r.status === filterStatus.value
    const matchPriority = filterPriority.value === 'All' || r.priority === filterPriority.value
    return matchSearch && matchStatus && matchPriority
  })
})

const summaryStats = computed(() => {
  const all = requests.value
  const total = all.length
  const pending = all.filter((r) => r.status === 'pending_approval').length
  const approved = all.filter((r) => r.status === 'approved').length
  const fulfilled = all.filter((r) => r.status === 'fulfilled').length
  const rejected = all.filter((r) => r.status === 'rejected').length
  const cancelled = all.filter((r) => r.status === 'cancelled').length
  return [
    {
      label: 'Total',
      value: total,
      icon: 'mdi-clipboard-list-outline',
      color: '#0f4c81',
      bg: '#e8f0fb'
    },
    {
      label: 'Pending',
      value: pending,
      icon: 'mdi-clock-outline',
      color: '#d97706',
      bg: '#fef3c7'
    },
    {
      label: 'Approved',
      value: approved,
      icon: 'mdi-check-circle-outline',
      color: '#059669',
      bg: '#d1fae5'
    },
    {
      label: 'Fulfilled',
      value: fulfilled,
      icon: 'mdi-package-check',
      color: '#0284c7',
      bg: '#e0f2fe'
    },
    { label: 'Cancelled', value: cancelled, icon: 'mdi-cancel', color: '#64748b', bg: '#f1f5f9' },
    {
      label: 'Rejected',
      value: rejected,
      icon: 'mdi-close-circle-outline',
      color: '#dc2626',
      bg: '#fee2e2'
    }
  ]
})

// ─── TABLE HEADERS ───────────────────────────────────────
const tableHeaders = [
  { title: 'Supply', key: 'supply_name', sortable: true },
  { title: 'Requester', key: 'requester_name', sortable: true },
  { title: 'Status', key: 'status', sortable: true },
  { title: 'Priority', key: 'priority', sortable: true },
  { title: 'Total', key: 'total_amount', sortable: true },
  { title: 'Date', key: 'submitted_at', sortable: true },
  { title: 'Actions', key: 'actions', sortable: false, align: 'center' }
]

// ─── FETCH REQUESTS ──────────────────────────────────────
async function fetchRequests() {
  loading.value = true
  try {
    // Use the edge function via ApiService so auth headers are sent
    const res = await ApiService.get('/supplies-requests?limit=100')
    console.log('supplies-requests response:', res)
    requests.value = res.data.requests || []
  } catch (err) {
    console.error('fetchRequests error:', err)
    showSnack('Failed to load requests.', 'error', 'mdi-alert-circle-outline')
  } finally {
    loading.value = false
  }
}

// ─── FETCH SUPPLIES (for the create form picker) ─────────
async function fetchSupplies() {
  const { data, error } = await supabase
    .from('supplies')
    .select('id, name, unit, unit_price, current_stock')
    .is('deleted_at', null)
    .eq('is_active', true)
    .order('name')
  if (!error) supplies.value = data || []
}

onMounted(() => {
  fetchRequests()
  fetchSupplies()
})

// ─── HELPERS ─────────────────────────────────────────────
function statusLabel(s) {
  const map = {
    pending_approval: 'Pending',
    approved: 'Approved',
    fulfilled: 'Fulfilled',
    rejected: 'Rejected',
    cancelled: 'Cancelled',
    draft: 'Draft'
  }
  return map[s] || s
}
function statusColor(s) {
  const map = {
    pending_approval: 'warning',
    approved: 'success',
    fulfilled: 'info',
    rejected: 'error',
    cancelled: '#e03c3c',
    draft: 'grey'
  }
  return map[s] || 'grey'
}
function statusHex(s) {
  const map = {
    pending_approval: '#f59e0b',
    approved: '#10b981',
    fulfilled: '#0ea5e9',
    rejected: '#ef4444',
    cancelled: '#e03c3c',
    draft: '#cbd5e1'
  }
  return map[s] || '#cbd5e1'
}
function statusIcon(s) {
  const map = {
    pending_approval: 'mdi-clock-outline',
    approved: 'mdi-check-circle-outline',
    fulfilled: 'mdi-package-check',
    rejected: 'mdi-close-circle-outline',
    cancelled: 'mdi-cancel',
    draft: 'mdi-pencil-outline'
  }
  return map[s] || 'mdi-help-circle-outline'
}
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
function canEdit(req) {
  return ['draft', 'pending_approval'].includes(req.status)
}
function canDelete(req) {
  return ['draft', 'pending_approval'].includes(req.status)
}

// ─── FILTER HELPERS ──────────────────────────────────────
function clearFilter(key) {
  if (key === 'status') filterStatus.value = 'All'
  if (key === 'priority') filterPriority.value = 'All'
}
function clearAllFilters() {
  filterStatus.value = 'All'
  filterPriority.value = 'All'
  search.value = ''
}

// ─── COPY LINK ───────────────────────────────────────────
async function copyLink(req) {
  const url = `${BASE_URL}/${req.id}`
  console.log('copy link url:', url)
  try {
    await navigator.clipboard.writeText(url)
    showSnack('Link copied to clipboard!', 'success', 'mdi-link-variant')
  } catch {
    showSnack('Could not copy link.', 'error', 'mdi-alert-circle-outline')
  }
}

// ─── CREATE DIALOG ───────────────────────────────────────
function openCreateDialog() {
  editMode.value = false
  Object.assign(formFields, {
    id: null,
    request_number: null,
    supply_id: null,
    quantity_requested: 1,
    priority: 'normal',
    needed_by_date: null,
    needed_by_display: '',
    reason: ''
  })
  selectedSupply.value = null
  estimatedTotal.value = 0
  formError.value = ''
  formDialog.value = true
}

// ─── EDIT DIALOG ─────────────────────────────────────────
function openEditDialog(req) {
  console.log('edit request:', req)
  editMode.value = true
  Object.assign(formFields, {
    id: req.id,
    request_number: req.request_number,
    supply_name: req.supply_name,
    supply_id: req.supply_id,
    quantity_requested: req.quantity_requested,
    priority: req.priority,
    needed_by_date: req.needed_by_date || null,
    needed_by_display: req.needed_by_date ? formatDate(req.needed_by_date) : '',
    reason: req.reason || ''
  })
  selectedSupply.value = supplies.value.find((s) => s.id === req.supply_id) || null
  estimatedTotal.value = Number(req.estimated_total || 0)
  formError.value = ''
  formDialog.value = true
}

function openEditFromDetail() {
  openEditDialog(selectedRequest.value)
  console.log('selected request:', selectedRequest.value)
  detailDialog.value = false
}

// ─── SUPPLY SELECTED ─────────────────────────────────────
function onSupplySelected(id) {
  selectedSupply.value = supplies.value.find((s) => s.id === id) || null
  calcEstimate()
}
function calcEstimate() {
  estimatedTotal.value =
    (formFields.quantity_requested || 0) * (selectedSupply.value?.unit_price || 0)
}

// ─── DATE PICKED ─────────────────────────────────────────
function onDatePicked(date) {
  formFields.needed_by_display = formatDate(date)
  formDateMenu.value = false
}
function clearNeededBy() {
  formFields.needed_by_date = null
  formFields.needed_by_display = ''
}

// ─── SUBMIT FORM (create or edit) ────────────────────────
async function submitForm() {
  const { valid } = (await formRef.value?.validate()) ?? { valid: true }
  if (!valid) return

  savingForm.value = true
  formError.value = ''

  try {
    const payload = {
      supply_id: formFields.supply_id,
      quantity_requested: Number(formFields.quantity_requested),
      priority: formFields.priority || 'normal',
      needed_by_date: formFields.needed_by_date
        ? new Date(formFields.needed_by_date).toISOString().split('T')[0]
        : null,
      reason: formFields.reason || null
    }

    if (editMode.value) {
      // PATCH — update mutable fields (edge function would need an update action;
      // adjust the action name to match your backend implementation)
      await ApiService.patch('/supplies-requests', {
        action: 'update',
        id: formFields.id,
        ...payload
      })
      showSnack(
        `Request #${formFields.supply_name} updated.`,
        'success',
        'mdi-check-circle-outline'
      )
    } else {
      console.log('supplies requests payload:', payload)
      const res = await ApiService.post('/supplies-requests', payload)
      console.log('supplies requests response:', res)
      showSnack('Request submitted!', 'success', 'mdi-check-circle-outline')
    }

    formDialog.value = false
    await fetchRequests()
  } catch (err) {
    const msg = err?.response?.data?.error || err?.message || ''
    formError.value = msg || 'Failed to save. Please try again.'
    console.error('submitForm error:', err)
  } finally {
    savingForm.value = false
  }
}
const loadingComments = ref(false)
// ─── DETAIL DIALOG ───────────────────────────────────────
async function openDetailDialog(req) {
  console.log('details dialog:', req)
  selectedRequest.value = req
  detailComments.value = []
  newComment.value = ''
  detailDialog.value = true
  loadingComments.value = true
  // Fetch full details + comments from edge function
  try {
    const full = await ApiService.get(`/supplies-requests?action=get&id=${req.id}`)
    console.log('supplie request full:', full)
    detailComments.value = full.data.comments || []
  } catch (err) {
    console.warn('Could not fetch full details:', err)
  } finally {
    loadingComments.value = false
  }
}

// ─── ADD COMMENT ─────────────────────────────────────────
async function addComment() {
  if (!newComment.value.trim() || !selectedRequest.value) return
  addingComment.value = true
  try {
    const comment = await ApiService.post('/supplies-requests', {
      action: 'add_comment',
      request_id: selectedRequest.value.id,
      content: newComment.value.trim()
    })
    console.log('comment response:', comment)
    detailComments.value.push(comment)
    newComment.value = ''
  } catch (err) {
    showSnack('Failed to add comment.', 'error', 'mdi-alert-circle-outline')
  } finally {
    addingComment.value = false
  }
}
function cancelRequest() {
  requestToDelete.value._deleteAction = 'cancel'
  deleteRequest()
}

function hardDeleteRequest() {
  requestToDelete.value._deleteAction = 'delete'
  deleteRequest()
}
// ─── DELETE / CANCEL ─────────────────────────────────────
function confirmDelete(req, action = 'cancel') {
  requestToDelete.value = req
  requestToDelete.value._deleteAction = action
  deleteDialog.value = true
}
function confirmDeleteFromDetail() {
  confirmDelete(selectedRequest.value)
  detailDialog.value = false
}

async function deleteRequest() {
  if (!requestToDelete.value) return
  deletingRequest.value = true
  try {
    const action = requestToDelete.value._deleteAction || 'cancel'
    const payload = { action, id: requestToDelete.value.id }
    await ApiService.patch('/supplies-requests', payload)
    showSnack(
      action === 'delete'
        ? `Request #${requestToDelete.value.supply_name} deleted.`
        : `Request #${requestToDelete.value.supply_name} cancelled.`,
      action === 'delete' ? 'error' : 'warning',
      action === 'delete' ? 'mdi-delete-outline' : 'mdi-cancel'
    )
    deleteDialog.value = false
    await fetchRequests()
  } catch (err) {
    const msg = err?.response?.data?.error || 'Failed to process request.'
    showSnack(msg, 'error', 'mdi-alert-circle-outline')
  } finally {
    deletingRequest.value = false
  }
}

// ─── SNACKBAR ────────────────────────────────────────────
function showSnack(text, color = 'success', icon = 'mdi-check-circle') {
  snackbar.text = text
  snackbar.color = color
  snackbar.icon = icon
  snackbar.show = true
}
</script>

<!-- ── SCOPED STYLES ── -->
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
