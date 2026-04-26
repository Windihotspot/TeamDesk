<template>
  <MainLayout>
    <div class="supplies-page">
      <!-- Background decoration -->
      <div class="bg-mesh" />

      <!-- Page Header -->
      <div class="page-header px-6 pt-6 pb-4">
        <div class="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 class="page-title">Supplies <span class="title-accent"></span></h1>
            <p class="page-subtitle">Browse, request, and track all office supplies in one place</p>
          </div>
          <div class="flex gap-3 flex-wrap">
            <v-btn
              variant="outlined"
              color="#0f4c81"
              prepend-icon="mdi-download-outline"
              class="action-btn-outline"
              rounded="lg"
            >
              Export
            </v-btn>
            <v-btn
              color="#0f4c81"
              prepend-icon="mdi-plus"
              class="action-btn-primary"
              rounded="lg"
              elevation="0"
              @click="openAddSupplyDialog"
            >
              Add Supply
            </v-btn>
          </div>
        </div>

        <!-- Stats Row -->
        <div class="stats-row mt-5 grid grid-cols-2 md:grid-cols-4 gap-3">
          <div v-for="stat in stats" :key="stat.label" class="stat-card p-4">
            <div class="stat-icon-wrap" :style="{ background: stat.bg }">
              <v-icon :color="stat.color" size="20">{{ stat.icon }}</v-icon>
            </div>
            <div>
              <p class="stat-value">{{ stat.value }}</p>
              <p class="stat-label">{{ stat.label }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Filters & Search -->
      <div class="filters-bar px-6 py-3 mt-4">
        <div class="flex flex-wrap gap-3 items-center">
          <v-text-field
            v-model="search"
            placeholder="Search supplies..."
            prepend-inner-icon="mdi-magnify"
            variant="outlined"
            density="compact"
            hide-details
            rounded="lg"
            class="search-field flex-1"
            style="min-width: 200px; max-width: 340px"
            bg-color="white"
          />
          <v-select
            v-model="selectedCategory"
            :items="categoryOptions"
            label="Category"
            variant="outlined"
            density="compact"
            hide-details
            rounded="lg"
            class="filter-select"
            style="min-width: 160px; max-width: 200px"
            bg-color="white"
          />
          <v-select
            v-model="selectedStatus"
            :items="statusOptions"
            label="Status"
            variant="outlined"
            density="compact"
            hide-details
            rounded="lg"
            class="filter-select"
            style="min-width: 150px; max-width: 180px"
            bg-color="white"
          />
          <v-spacer />
          <div class="view-toggle flex gap-1">
            <v-btn
              :variant="viewMode === 'grid' ? 'flat' : 'text'"
              :color="viewMode === 'grid' ? '#0f4c81' : 'grey'"
              icon="mdi-view-grid"
              size="small"
              rounded="lg"
              @click="viewMode = 'grid'"
            />
            <v-btn
              :variant="viewMode === 'list' ? 'flat' : 'text'"
              :color="viewMode === 'list' ? '#0f4c81' : 'grey'"
              icon="mdi-view-list"
              size="small"
              rounded="lg"
              @click="viewMode = 'list'"
            />
          </div>
        </div>

        <!-- Active Filters chips -->
        <div v-if="activeFilters.length" class="mt-2 flex flex-wrap gap-2">
          <v-chip
            v-for="f in activeFilters"
            :key="f.key"
            size="small"
            closable
            color="#0f4c81"
            variant="tonal"
            @click:close="clearFilter(f.key)"
          >
            {{ f.label }}
          </v-chip>
          <v-chip size="small" variant="text" color="grey" @click="clearAllFilters"
            >Clear all</v-chip
          >
        </div>
      </div>

      <!-- GRID VIEW -->
      <div v-if="viewMode === 'grid'" class="supplies-grid px-6 pb-8">
        <transition-group
          name="card-fade"
          tag="div"
          class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
        >
          <div
            v-for="supply in filteredSupplies"
            :key="supply.id"
            class="supply-card"
            @click="openDetailDialog(supply)"
          >
            <!-- Stock badge -->
            <div class="stock-badge" :class="getStockClass(supply.stock)">
              {{ getStockLabel(supply.stock) }}
            </div>

            <!-- Category color bar -->

            <div class="card-body">
              <!-- Icon + category -->
              <div class="flex items-center gap-2 mb-3">
                <div
                  class="supply-icon-wrap"
                  :style="{ background: getCategoryBg(supply.category) }"
                >
                  <v-icon :color="getCategoryColor(supply.category)" size="22">{{
                    supply.icon
                  }}</v-icon>
                </div>
                <span class="category-tag" :style="{ color: getCategoryColor(supply.category) }">
                  {{ supply.category }}
                </span>
              </div>

              <h3 class="supply-name">{{ supply.name }}</h3>
              <p class="supply-desc">{{ supply.description }}</p>

              <div class="supply-meta mt-3">
                <div class="meta-row">
                  <v-icon size="14" color="grey">mdi-package-variant</v-icon>
                  <span>{{ supply.unit }}</span>
                </div>
                <div class="meta-row">
                  <v-icon size="14" color="grey">mdi-map-marker-outline</v-icon>
                  <span>{{ supply.location }}</span>
                </div>
              </div>

              <!-- Stock indicator -->
              <div class="mt-3">
                <div class="flex justify-between items-center mb-1">
                  <span class="stock-text">Stock Level</span>
                  <span class="stock-count">{{ supply.stock }} / {{ supply.maxStock }}</span>
                </div>
                <v-progress-linear
                  :model-value="(supply.stock / supply.maxStock) * 100"
                  :color="getStockProgressColor(supply.stock, supply.maxStock)"
                  height="5"
                  rounded
                  bg-color="#f0f4f8"
                />
              </div>

              <!-- Price + actions -->
              <div class="card-footer mt-4">
                <div>
                  <span class="price-label">Unit Price</span>
                  <p class="price-value">₦{{ supply.price.toLocaleString() }}</p>
                </div>
                <div class="flex gap-2">
                  <v-btn
                    icon="mdi-cart-plus"
                    size="small"
                    color="#0f4c81"
                    variant="tonal"
                    rounded="lg"
                    @click.stop="openRequestDialog(supply)"
                  />
                  <v-btn
                    icon="mdi-dots-vertical"
                    size="small"
                    color="grey"
                    variant="text"
                    rounded="lg"
                    @click.stop="openActionsMenu($event, supply)"
                  />
                </div>
              </div>
            </div>
          </div>
        </transition-group>

        <!-- Empty state -->
        <div v-if="!filteredSupplies.length" class="empty-state">
          <v-icon size="64" color="#0f4c81" class="mb-4" style="opacity: 0.3"
            >mdi-package-variant-closed</v-icon
          >
          <p class="empty-title">No supplies found</p>
          <p class="empty-sub">Try adjusting your filters or add a new supply</p>
          <v-btn
            color="#0f4c81"
            variant="tonal"
            prepend-icon="mdi-plus"
            rounded="lg"
            class="mt-4"
            @click="openAddSupplyDialog"
          >
            Add Supply
          </v-btn>
        </div>
      </div>

      <!-- LIST VIEW -->
      <div v-else class="px-6 pb-8">
        <v-card rounded="xl" elevation="0" class="list-card overflow-hidden">
          <v-data-table
            :headers="tableHeaders"
            :items="filteredSupplies"
            :search="search"
            class="supplies-table"
            hover
            @click:row="(_, row) => openDetailDialog(row.item)"
          >
            <template #item.name="{ item }">
              <div class="flex items-center gap-3 py-2">
                <div
                  class="supply-icon-wrap-sm"
                  :style="{ background: getCategoryBg(item.category) }"
                >
                  <v-icon :color="getCategoryColor(item.category)" size="18">{{
                    item.icon
                  }}</v-icon>
                </div>
                <div>
                  <p class="font-semibold text-sm">{{ item.name }}</p>
                  <p class="text-xs text-grey-darken-1">{{ item.category }}</p>
                </div>
              </div>
            </template>
            <template #item.stock="{ item }">
              <div class="flex items-center gap-2">
                <v-progress-linear
                  :model-value="(item.stock / item.maxStock) * 100"
                  :color="getStockProgressColor(item.stock, item.maxStock)"
                  height="6"
                  rounded
                  style="width: 60px"
                  bg-color="#f0f4f8"
                />
                <span class="text-sm">{{ item.stock }}</span>
              </div>
            </template>
            <template #item.status="{ item }">
              <v-chip
                size="small"
                :color="getStockChipColor(item.stock)"
                variant="tonal"
                rounded="lg"
              >
                {{ getStockLabel(item.stock) }}
              </v-chip>
            </template>
            <template #item.price="{ item }">
              <span class="font-semibold" style="color: #0f4c81"
                >₦{{ item.price.toLocaleString() }}</span
              >
            </template>
            <template #item.actions="{ item }">
              <div class="flex gap-1">
                <v-btn
                  icon="mdi-cart-plus"
                  size="x-small"
                  color="#0f4c81"
                  variant="tonal"
                  rounded="lg"
                  @click.stop="openRequestDialog(item)"
                />
                <v-btn
                  icon="mdi-pencil-outline"
                  size="x-small"
                  color="grey"
                  variant="text"
                  rounded="lg"
                  @click.stop="openEditDialog(item)"
                />
                <v-btn
                  icon="mdi-delete-outline"
                  size="x-small"
                  color="error"
                  variant="text"
                  rounded="lg"
                  @click.stop="confirmDelete(item)"
                />
              </div>
            </template>
          </v-data-table>
        </v-card>
      </div>

      <!-- ============ DETAIL DIALOG ============ -->
      <v-dialog v-model="detailDialog" max-width="580" scrollable>
        <v-card v-if="selectedSupply" rounded="xl" elevation="0" class="detail-dialog-card">
          <div
            class="detail-header"
            :style="{ background: `linear-gradient(135deg, #0f4c81, #1a6dbf)` }"
          >
            <v-btn
              icon="mdi-close"
              variant="text"
              color="white"
              size="small"
              class="close-btn"
              @click="detailDialog = false"
            />
            <div class="flex items-center gap-4">
              <div class="detail-icon-wrap">
                <v-icon color="white" size="32">{{ selectedSupply.icon }}</v-icon>
              </div>
              <div>
                <p class="text-white text-xs font-semibold tracking-widest opacity-70 uppercase">
                  {{ selectedSupply.category }}
                </p>
                <h2 class="text-white text-xl font-bold">{{ selectedSupply.name }}</h2>
                <p class="text-white text-sm opacity-70">{{ selectedSupply.description }}</p>
              </div>
            </div>
            <div class="detail-stats-row mt-4 grid grid-cols-3 gap-3">
              <div class="detail-stat">
                <p class="detail-stat-val">{{ selectedSupply.stock }}</p>
                <p class="detail-stat-lbl">In Stock</p>
              </div>
              <div class="detail-stat">
                <p class="detail-stat-val">₦{{ selectedSupply.price.toLocaleString() }}</p>
                <p class="detail-stat-lbl">Unit Price</p>
              </div>
              <div class="detail-stat">
                <p class="detail-stat-val">{{ selectedSupply.requests }}</p>
                <p class="detail-stat-lbl">Requests</p>
              </div>
            </div>
          </div>

          <v-card-text class="pa-5">
            <div class="grid grid-cols-2 gap-4">
              <div class="detail-info-item">
                <v-icon size="16" color="#0f4c81">mdi-barcode</v-icon>
                <div>
                  <p class="detail-info-lbl">SKU / Code</p>
                  <p class="detail-info-val">{{ selectedSupply.sku }}</p>
                </div>
              </div>
              <div class="detail-info-item">
                <v-icon size="16" color="#0f4c81">mdi-map-marker-outline</v-icon>
                <div>
                  <p class="detail-info-lbl">Storage Location</p>
                  <p class="detail-info-val">{{ selectedSupply.location }}</p>
                </div>
              </div>
              <div class="detail-info-item">
                <v-icon size="16" color="#0f4c81">mdi-package-variant</v-icon>
                <div>
                  <p class="detail-info-lbl">Unit</p>
                  <p class="detail-info-val">{{ selectedSupply.unit }}</p>
                </div>
              </div>
              <div class="detail-info-item">
                <v-icon size="16" color="#0f4c81">mdi-store-outline</v-icon>
                <div>
                  <p class="detail-info-lbl">Supplier</p>
                  <p class="detail-info-val">{{ selectedSupply.supplier }}</p>
                </div>
              </div>
              <div class="detail-info-item">
                <v-icon size="16" color="#0f4c81">mdi-alert-circle-outline</v-icon>
                <div>
                  <p class="detail-info-lbl">Reorder Level</p>
                  <p class="detail-info-val">{{ selectedSupply.reorderLevel }} units</p>
                </div>
              </div>
              <div class="detail-info-item">
                <v-icon size="16" color="#0f4c81">mdi-calendar-outline</v-icon>
                <div>
                  <p class="detail-info-lbl">Last Restocked</p>
                  <p class="detail-info-val">{{ selectedSupply.lastRestocked }}</p>
                </div>
              </div>
            </div>

            <!-- Stock progress full -->
            <div class="mt-5 p-4 rounded-xl" style="background: #f5f8fc">
              <div class="flex justify-between mb-2">
                <span class="text-sm font-semibold" style="color: #0f4c81">Stock Level</span>
                <span class="text-sm text-grey"
                  >{{ selectedSupply.stock }} / {{ selectedSupply.maxStock }} units</span
                >
              </div>
              <v-progress-linear
                :model-value="(selectedSupply.stock / selectedSupply.maxStock) * 100"
                :color="getStockProgressColor(selectedSupply.stock, selectedSupply.maxStock)"
                height="10"
                rounded
                bg-color="#e2eaf4"
              />
              <p
                v-if="selectedSupply.stock <= selectedSupply.reorderLevel"
                class="text-xs mt-2 text-orange-600 flex items-center gap-1"
              >
                <v-icon size="14" color="orange">mdi-alert</v-icon>
                Stock is below reorder level. Consider restocking.
              </p>
            </div>
          </v-card-text>

          <v-card-actions class="pa-5 pt-0 gap-3">
            <v-btn
              variant="outlined"
              color="#0f4c81"
              rounded="lg"
              prepend-icon="mdi-pencil-outline"
              class="flex-1"
              @click="handleDetailEdit"
            >
              Edit
            </v-btn>
            <v-btn
              color="#0f4c81"
              rounded="lg"
              prepend-icon="mdi-cart-plus"
              class="flex-1"
              elevation="0"
              @click="handleDetailRequest"
            >
              Request
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>

      <!-- ============ REQUEST DIALOG ============ -->
      <v-dialog v-model="requestDialog" max-width="520" scrollable>
        <v-card v-if="requestSupply" rounded="xl" elevation="0">
          <div
            class="request-header pa-5"
            style="background: linear-gradient(135deg, #0f4c81 0%, #1565c0 100%)"
          >
            <div class="flex items-center justify-between mb-1">
              <h3 class="text-white font-bold text-lg">Request Supply</h3>
              <v-btn
                icon="mdi-close"
                variant="text"
                color="white"
                size="small"
                @click="requestDialog = false"
              />
            </div>
            <div class="flex items-center gap-3 mt-3">
              <div class="req-icon-wrap">
                <v-icon color="white" size="20">{{ requestSupply.icon }}</v-icon>
              </div>
              <div>
                <p class="text-white font-semibold text-sm">{{ requestSupply.name }}</p>
                <p class="text-white text-xs opacity-60">
                  {{ requestSupply.category }} · ₦{{ requestSupply.price.toLocaleString() }}/unit
                </p>
              </div>
            </div>
          </div>

          <v-card-text class="pa-5">
            <v-form ref="requestForm" v-model="requestFormValid">
              <div class="grid grid-cols-2 gap-4">
                <v-text-field
                  v-model="requestForm.requesterName"
                  label="Your Name"
                  variant="outlined"
                  density="comfortable"
                  rounded="lg"
                  prepend-inner-icon="mdi-account-outline"
                  :rules="[(v) => !!v || 'Required']"
                />
                <v-text-field
                  v-model="requestForm.department"
                  label="Department"
                  variant="outlined"
                  density="comfortable"
                  rounded="lg"
                  prepend-inner-icon="mdi-office-building-outline"
                  :rules="[(v) => !!v || 'Required']"
                />
                <v-text-field
                  v-model.number="requestForm.quantity"
                  label="Quantity"
                  type="number"
                  variant="outlined"
                  density="comfortable"
                  rounded="lg"
                  prepend-inner-icon="mdi-counter"
                  :rules="[
                    (v) => !!v || 'Required',
                    (v) => v > 0 || 'Must be > 0',
                    (v) => v <= requestSupply.stock || 'Exceeds stock'
                  ]"
                  @update:model-value="calcTotal"
                />
                <v-text-field
                  :model-value="`₦${requestTotal.toLocaleString()}`"
                  label="Estimated Total"
                  variant="outlined"
                  density="comfortable"
                  rounded="lg"
                  prepend-inner-icon="mdi-cash"
                  readonly
                  style="background: #f5f8fc"
                />
              </div>
              <v-select
                v-model="requestForm.priority"
                :items="['Low', 'Normal', 'Urgent']"
                label="Priority"
                variant="outlined"
                density="comfortable"
                rounded="lg"
                prepend-inner-icon="mdi-flag-outline"
                class="mt-1"
              />
              <v-menu v-model="datepickerMenu" :close-on-content-click="false">
                <template #activator="{ props }">
                  <v-text-field
                    v-bind="props"
                    v-model="requestForm.neededBy"
                    label="Needed By"
                    variant="outlined"
                    density="comfortable"
                    rounded="lg"
                    prepend-inner-icon="mdi-calendar-outline"
                    readonly
                    class="mt-1"
                  />
                </template>
                <v-date-picker
                  v-model="requestForm.neededByDate"
                  color="#0f4c81"
                  @update:model-value="setNeededBy"
                />
              </v-menu>
              <v-textarea
                v-model="requestForm.reason"
                label="Reason / Justification"
                variant="outlined"
                density="comfortable"
                rounded="lg"
                rows="3"
                prepend-inner-icon="mdi-text-box-outline"
                class="mt-1"
              />
            </v-form>

            <div class="mt-3 p-3 rounded-xl flex items-center gap-3" style="background: #e8f0fb">
              <v-icon color="#0f4c81" size="18">mdi-email-fast-outline</v-icon>
              <p class="text-xs" style="color: #0f4c81">
                An automated email notification will be sent to the supply manager and your
                department head upon submission.
              </p>
            </div>
          </v-card-text>

          <v-card-actions class="pa-5 pt-0">
            <v-btn variant="text" color="grey" rounded="lg" @click="requestDialog = false"
              >Cancel</v-btn
            >
            <v-spacer />
            <v-btn
              color="#0f4c81"
              rounded="lg"
              elevation="0"
              prepend-icon="mdi-send-outline"
              :loading="submittingRequest"
              @click="submitRequest"
            >
              Submit Request
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>

      <!-- ============ ADD / EDIT SUPPLY DIALOG ============ -->
      <v-dialog v-model="addEditDialog" max-width="600" scrollable>
        <v-card rounded="xl" elevation="0">
          <v-card-title class="pa-5 pb-2 flex items-center gap-3">
            <div class="dialog-title-icon">
              <v-icon color="#0f4c81" size="20">{{
                editMode ? 'mdi-pencil-outline' : 'mdi-plus'
              }}</v-icon>
            </div>
            <span class="font-bold text-lg">{{ editMode ? 'Edit Supply' : 'Add New Supply' }}</span>
          </v-card-title>
          <v-divider />
          <v-card-text class="pa-5">
            <v-form ref="supplyForm" v-model="supplyFormValid">
              <div class="grid grid-cols-2 gap-4">
                <v-text-field
                  v-model="supplyForm.name"
                  label="Supply Name"
                  variant="outlined"
                  density="comfortable"
                  rounded="lg"
                  :rules="[(v) => !!v || 'Required']"
                  class="col-span-2"
                />
                <v-select
                  v-model="supplyForm.category"
                  :items="categories"
                  label="Category"
                  variant="outlined"
                  density="comfortable"
                  rounded="lg"
                  :rules="[(v) => !!v || 'Required']"
                />
                <v-text-field
                  v-model="supplyForm.sku"
                  label="SKU / Code"
                  variant="outlined"
                  density="comfortable"
                  rounded="lg"
                />
                <v-text-field
                  v-model="supplyForm.description"
                  label="Description"
                  variant="outlined"
                  density="comfortable"
                  rounded="lg"
                  class="col-span-2"
                />
                <v-text-field
                  v-model.number="supplyForm.price"
                  label="Unit Price (₦)"
                  type="number"
                  variant="outlined"
                  density="comfortable"
                  rounded="lg"
                  prepend-inner-icon="mdi-currency-usd"
                  :rules="[(v) => !!v || 'Required']"
                />
                <v-text-field
                  v-model="supplyForm.unit"
                  label="Unit (e.g., Box, Piece)"
                  variant="outlined"
                  density="comfortable"
                  rounded="lg"
                  :rules="[(v) => !!v || 'Required']"
                />
                <v-text-field
                  v-model.number="supplyForm.stock"
                  label="Current Stock"
                  type="number"
                  variant="outlined"
                  density="comfortable"
                  rounded="lg"
                  :rules="[(v) => v >= 0 || 'Cannot be negative']"
                />
                <v-text-field
                  v-model.number="supplyForm.maxStock"
                  label="Maximum Stock"
                  type="number"
                  variant="outlined"
                  density="comfortable"
                  rounded="lg"
                />
                <v-text-field
                  v-model.number="supplyForm.reorderLevel"
                  label="Reorder Level"
                  type="number"
                  variant="outlined"
                  density="comfortable"
                  rounded="lg"
                />
                <v-text-field
                  v-model="supplyForm.location"
                  label="Storage Location"
                  variant="outlined"
                  density="comfortable"
                  rounded="lg"
                />
                <v-text-field
                  v-model="supplyForm.supplier"
                  label="Supplier Name"
                  variant="outlined"
                  density="comfortable"
                  rounded="lg"
                  class="col-span-2"
                />
              </div>
            </v-form>
          </v-card-text>
          <v-card-actions class="pa-5 pt-0">
            <v-btn variant="text" color="grey" rounded="lg" @click="addEditDialog = false"
              >Cancel</v-btn
            >
            <v-spacer />
            <v-btn
              color="#0f4c81"
              rounded="lg"
              elevation="0"
              :prepend-icon="editMode ? 'mdi-content-save-outline' : 'mdi-plus'"
              :loading="savingSupply"
              @click="saveSupply"
            >
              {{ editMode ? 'Save Changes' : 'Add Supply' }}
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>

      <!-- ============ DELETE CONFIRM ============ -->
      <v-dialog v-model="deleteDialog" max-width="380">
        <v-card rounded="xl" elevation="0" class="pa-2">
          <v-card-text class="text-center pa-6">
            <div class="delete-icon-wrap mx-auto mb-4">
              <v-icon color="error" size="32">mdi-delete-outline</v-icon>
            </div>
            <h3 class="font-bold text-lg mb-2">Delete Supply?</h3>
            <p class="text-grey text-sm">
              Are you sure you want to remove <strong>{{ supplyToDelete?.name }}</strong
              >? This action cannot be undone.
            </p>
          </v-card-text>
          <v-card-actions class="pb-4 px-4 gap-2">
            <v-btn
              variant="outlined"
              color="grey"
              rounded="lg"
              class="flex-1"
              @click="deleteDialog = false"
              >Cancel</v-btn
            >
            <v-btn color="error" rounded="lg" class="flex-1" elevation="0" @click="deleteSupply"
              >Delete</v-btn
            >
          </v-card-actions>
        </v-card>
      </v-dialog>

      <!-- Success Snackbar -->
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

      <!-- Actions Menu -->
      <v-menu
        v-model="actionsMenu.show"
        :position-x="actionsMenu.x"
        :position-y="actionsMenu.y"
        absolute
      >
        <v-list density="compact" rounded="lg" elevation="4">
          <v-list-item
            prepend-icon="mdi-eye-outline"
            title="View Details"
            @click="openDetailDialog(actionsMenu.supply)"
          />
          <v-list-item
            prepend-icon="mdi-pencil-outline"
            title="Edit"
            @click="openEditDialog(actionsMenu.supply)"
          />
          <v-list-item
            prepend-icon="mdi-cart-plus"
            title="Request"
            @click="openRequestDialog(actionsMenu.supply)"
          />
          <v-divider />
          <v-list-item
            prepend-icon="mdi-delete-outline"
            title="Delete"
            base-color="error"
            @click="confirmDelete(actionsMenu.supply)"
          />
        </v-list>
      </v-menu>
    </div>
  </MainLayout>
</template>

<script setup>
import { ref, computed, reactive } from 'vue'
import MainLayout from '@/layouts/full/MainLayout.vue'
// ─── VIEW MODE ───────────────────────────────────────────
const viewMode = ref('grid')

// ─── FILTERS ─────────────────────────────────────────────
const search = ref('')
const selectedCategory = ref('All')
const selectedStatus = ref('All')
const datepickerMenu = ref(false)

const categories = [
  'Stationery',
  'Electronics',
  'Cleaning',
  'Furniture',
  'Printing',
  'Pantry',
  'Safety'
]
const categoryOptions = ['All', ...categories]
const statusOptions = ['All', 'In Stock', 'Low Stock', 'Out of Stock']

const activeFilters = computed(() => {
  const f = []
  if (selectedCategory.value !== 'All')
    f.push({ key: 'category', label: `Category: ${selectedCategory.value}` })
  if (selectedStatus.value !== 'All')
    f.push({ key: 'status', label: `Status: ${selectedStatus.value}` })
  return f
})

function clearFilter(key) {
  if (key === 'category') selectedCategory.value = 'All'
  if (key === 'status') selectedStatus.value = 'All'
}

function clearAllFilters() {
  selectedCategory.value = 'All'
  selectedStatus.value = 'All'
  search.value = ''
}

// ─── CATEGORY COLORS ─────────────────────────────────────
const categoryColors = {
  Stationery: '#0f4c81',
  Electronics: '#6d28d9',
  Cleaning: '#0891b2',
  Furniture: '#92400e',
  Printing: '#1d4ed8',
  Pantry: '#15803d',
  Safety: '#dc2626'
}
const categoryBgs = {
  Stationery: '#e8f0fb',
  Electronics: '#ede9fe',
  Cleaning: '#e0f2fe',
  Furniture: '#fef3c7',
  Printing: '#dbeafe',
  Pantry: '#dcfce7',
  Safety: '#fee2e2'
}

function getCategoryColor(cat) {
  return categoryColors[cat] || '#0f4c81'
}
function getCategoryBg(cat) {
  return categoryBgs[cat] || '#e8f0fb'
}

// ─── STOCK HELPERS ───────────────────────────────────────
function getStockLabel(stock) {
  if (stock === 0) return 'Out of Stock'
  if (stock <= 10) return 'Low Stock'
  return 'In Stock'
}
function getStockClass(stock) {
  if (stock === 0) return 'badge-out'
  if (stock <= 10) return 'badge-low'
  return 'badge-in'
}
function getStockChipColor(stock) {
  if (stock === 0) return 'error'
  if (stock <= 10) return 'warning'
  return 'success'
}
function getStockProgressColor(stock, max) {
  const pct = (stock / max) * 100
  if (pct === 0) return '#ef4444'
  if (pct < 25) return '#f97316'
  if (pct < 50) return '#eab308'
  return '#22c55e'
}

// ─── SUPPLIES DATA ───────────────────────────────────────
const supplies = ref([
  {
    id: 1,
    name: 'A4 Copy Paper',
    category: 'Stationery',
    icon: 'mdi-file-document-outline',
    description: '80gsm premium copy paper, 500 sheets/ream',
    sku: 'STN-001',
    price: 3500,
    unit: 'Ream',
    stock: 45,
    maxStock: 100,
    reorderLevel: 15,
    location: 'Store A - Shelf 2',
    supplier: 'Leventis Office',
    lastRestocked: 'Apr 10, 2026',
    requests: 12
  },
  {
    id: 2,
    name: 'Ballpoint Pens (Blue)',
    category: 'Stationery',
    icon: 'mdi-pen',
    description: 'Medium point, smooth ink flow, box of 50',
    sku: 'STN-002',
    price: 1800,
    unit: 'Box',
    stock: 8,
    maxStock: 50,
    reorderLevel: 10,
    location: 'Store A - Shelf 3',
    supplier: 'Bic Nigeria',
    lastRestocked: 'Mar 28, 2026',
    requests: 24
  },
  {
    id: 3,
    name: 'HP LaserJet Toner',
    category: 'Printing',
    icon: 'mdi-printer-outline',
    description: 'Compatible with HP LJ Pro M404/M428 series',
    sku: 'PRT-001',
    price: 45000,
    unit: 'Cartridge',
    stock: 0,
    maxStock: 20,
    reorderLevel: 3,
    location: 'IT Store - Cabinet 1',
    supplier: 'HP Nigeria',
    lastRestocked: 'Feb 15, 2026',
    requests: 7
  },
  {
    id: 4,
    name: 'Hand Sanitizer',
    category: 'Safety',
    icon: 'mdi-hand-wash-outline',
    description: '70% alcohol gel, 500ml pump bottle',
    sku: 'SFT-001',
    price: 2500,
    unit: 'Bottle',
    stock: 30,
    maxStock: 60,
    reorderLevel: 10,
    location: 'Store B - Shelf 1',
    supplier: 'Dettol Nigeria',
    lastRestocked: 'Apr 18, 2026',
    requests: 18
  },
  {
    id: 5,
    name: 'USB-C Charging Cable',
    category: 'Electronics',
    icon: 'mdi-usb-c-port',
    description: '2m braided cable, 65W fast charge',
    sku: 'ELC-001',
    price: 8500,
    unit: 'Piece',
    stock: 15,
    maxStock: 30,
    reorderLevel: 5,
    location: 'IT Store - Drawer 3',
    supplier: 'Anker Nigeria',
    lastRestocked: 'Apr 5, 2026',
    requests: 9
  },
  {
    id: 6,
    name: 'Floor Cleaner Concentrate',
    category: 'Cleaning',
    icon: 'mdi-broom',
    description: 'Lemon scented, 5L can, dilutes 1:20',
    sku: 'CLN-001',
    price: 6000,
    unit: 'Can',
    stock: 6,
    maxStock: 24,
    reorderLevel: 6,
    location: 'Cleaning Supplies Room',
    supplier: 'Mr Muscle NG',
    lastRestocked: 'Apr 2, 2026',
    requests: 5
  },
  {
    id: 7,
    name: 'Nescafé Classic Coffee',
    category: 'Pantry',
    icon: 'mdi-coffee-outline',
    description: 'Instant coffee granules, 200g jar',
    sku: 'PNT-001',
    price: 4800,
    unit: 'Jar',
    stock: 22,
    maxStock: 40,
    reorderLevel: 8,
    location: 'Pantry Cabinet B',
    supplier: 'Nestle Nigeria',
    lastRestocked: 'Apr 20, 2026',
    requests: 31
  },
  {
    id: 8,
    name: 'Office Swivel Chair',
    category: 'Furniture',
    icon: 'mdi-seat-outline',
    description: 'Ergonomic mesh back, adjustable height',
    sku: 'FRN-001',
    price: 85000,
    unit: 'Piece',
    stock: 3,
    maxStock: 10,
    reorderLevel: 2,
    location: 'Furniture Store',
    supplier: 'Interiors Plus',
    lastRestocked: 'Jan 10, 2026',
    requests: 2
  },
  {
    id: 9,
    name: 'Sticky Notes (3x3)',
    category: 'Stationery',
    icon: 'mdi-note-text-outline',
    description: 'Pastel colors, 100 sheets/pad, 5 pads/pack',
    sku: 'STN-003',
    price: 1200,
    unit: 'Pack',
    stock: 40,
    maxStock: 80,
    reorderLevel: 15,
    location: 'Store A - Shelf 4',
    supplier: 'Post-it NG',
    lastRestocked: 'Apr 12, 2026',
    requests: 14
  },
  {
    id: 10,
    name: 'Wireless Mouse',
    category: 'Electronics',
    icon: 'mdi-mouse-outline',
    description: 'Logitech M280, 2.4GHz, 18-month battery',
    sku: 'ELC-002',
    price: 18000,
    unit: 'Piece',
    stock: 5,
    maxStock: 15,
    reorderLevel: 3,
    location: 'IT Store - Shelf 2',
    supplier: 'Logitech Nigeria',
    lastRestocked: 'Mar 15, 2026',
    requests: 6
  },
  {
    id: 11,
    name: 'A3 Printing Paper',
    category: 'Printing',
    icon: 'mdi-printer-pos-outline',
    description: '90gsm, 250 sheets/pack',
    sku: 'PRT-002',
    price: 5500,
    unit: 'Pack',
    stock: 18,
    maxStock: 40,
    reorderLevel: 8,
    location: 'Store A - Shelf 1',
    supplier: 'Leventis Office',
    lastRestocked: 'Apr 8, 2026',
    requests: 3
  },
  {
    id: 12,
    name: 'Tissue Paper (Rolls)',
    category: 'Cleaning',
    icon: 'mdi-paper-roll-outline',
    description: 'Soft 2-ply, 10 rolls per pack',
    sku: 'CLN-002',
    price: 3200,
    unit: 'Pack',
    stock: 25,
    maxStock: 60,
    reorderLevel: 10,
    location: 'Cleaning Supplies Room',
    supplier: 'Tissue World NG',
    lastRestocked: 'Apr 15, 2026',
    requests: 20
  }
])

// ─── STATS ───────────────────────────────────────────────
const stats = computed(() => [
  {
    label: 'Total Supplies',
    value: supplies.value.length,
    icon: 'mdi-package-variant',
    color: '#0f4c81',
    bg: '#e8f0fb'
  },
  {
    label: 'Low Stock',
    value: supplies.value.filter((s) => s.stock > 0 && s.stock <= s.reorderLevel).length,
    icon: 'mdi-alert-circle-outline',
    color: '#ea580c',
    bg: '#fff7ed'
  },
  {
    label: 'Out of Stock',
    value: supplies.value.filter((s) => s.stock === 0).length,
    icon: 'mdi-package-variant-closed-remove',
    color: '#dc2626',
    bg: '#fef2f2'
  },
  {
    label: 'Total Requests',
    value: supplies.value.reduce((a, s) => a + s.requests, 0),
    icon: 'mdi-clipboard-list-outline',
    color: '#15803d',
    bg: '#f0fdf4'
  }
])

// ─── FILTERED SUPPLIES ───────────────────────────────────
const filteredSupplies = computed(() => {
  return supplies.value.filter((s) => {
    const matchSearch =
      !search.value ||
      s.name.toLowerCase().includes(search.value.toLowerCase()) ||
      s.description.toLowerCase().includes(search.value.toLowerCase())
    const matchCat = selectedCategory.value === 'All' || s.category === selectedCategory.value
    const matchStatus =
      selectedStatus.value === 'All' ||
      (selectedStatus.value === 'In Stock' && s.stock > 10) ||
      (selectedStatus.value === 'Low Stock' && s.stock > 0 && s.stock <= 10) ||
      (selectedStatus.value === 'Out of Stock' && s.stock === 0)
    return matchSearch && matchCat && matchStatus
  })
})

// ─── TABLE HEADERS ───────────────────────────────────────
const tableHeaders = [
  { title: 'Supply', key: 'name', sortable: true },
  { title: 'SKU', key: 'sku', sortable: false },
  { title: 'Location', key: 'location', sortable: false },
  { title: 'Stock', key: 'stock', sortable: true },
  { title: 'Status', key: 'status', sortable: false },
  { title: 'Unit Price', key: 'price', sortable: true },
  { title: 'Actions', key: 'actions', sortable: false, align: 'center' }
]

// ─── DIALOGS ─────────────────────────────────────────────
const detailDialog = ref(false)
const selectedSupply = ref(null)

const requestDialog = ref(false)
const requestSupply = ref(null)
const requestFormValid = ref(false)
const submittingRequest = ref(false)
const requestForm = reactive({
  requesterName: '',
  department: '',
  quantity: 1,
  priority: 'Normal',
  neededBy: '',
  neededByDate: null,
  reason: ''
})
const requestTotal = ref(0)

function calcTotal() {
  requestTotal.value = (requestForm.quantity || 0) * (requestSupply.value?.price || 0)
}

function setNeededBy(date) {
  requestForm.neededBy = new Date(date).toLocaleDateString('en-NG', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
  datepickerMenu.value = false
}

const addEditDialog = ref(false)
const editMode = ref(false)
const supplyFormValid = ref(false)
const savingSupply = ref(false)
const supplyForm = reactive({
  id: null,
  name: '',
  category: '',
  sku: '',
  description: '',
  price: 0,
  unit: '',
  stock: 0,
  maxStock: 0,
  reorderLevel: 0,
  location: '',
  supplier: ''
})

const deleteDialog = ref(false)
const supplyToDelete = ref(null)

const actionsMenu = reactive({ show: false, x: 0, y: 0, supply: null })

// ─── SNACKBAR ────────────────────────────────────────────
const snackbar = reactive({ show: false, text: '', color: 'success', icon: 'mdi-check-circle' })
function showSnack(text, color = 'success', icon = 'mdi-check-circle') {
  snackbar.text = text
  snackbar.color = color
  snackbar.icon = icon
  snackbar.show = true
}

// ─── DIALOG OPENERS ──────────────────────────────────────
function openDetailDialog(supply) {
  selectedSupply.value = supply
  detailDialog.value = true
}

function openRequestDialog(supply) {
  requestSupply.value = supply
  requestForm.requesterName = ''
  requestForm.department = ''
  requestForm.quantity = 1
  requestForm.priority = 'Normal'
  requestForm.neededBy = ''
  requestForm.reason = ''
  requestTotal.value = supply.price
  requestDialog.value = true
}

function openAddSupplyDialog() {
  editMode.value = false
  Object.assign(supplyForm, {
    id: null,
    name: '',
    category: '',
    sku: '',
    description: '',
    price: 0,
    unit: '',
    stock: 0,
    maxStock: 0,
    reorderLevel: 0,
    location: '',
    supplier: ''
  })
  addEditDialog.value = true
}

function openEditDialog(supply) {
  editMode.value = true
  Object.assign(supplyForm, { ...supply })
  addEditDialog.value = true
}

function handleDetailRequest() {
  openRequestDialog(selectedSupply.value)
  detailDialog.value = false
}

function handleDetailEdit() {
  openEditDialog(selectedSupply.value)
  detailDialog.value = false
}

function openActionsMenu(event, supply) {
  actionsMenu.x = event.clientX
  actionsMenu.y = event.clientY
  actionsMenu.supply = supply
  actionsMenu.show = true
}

function confirmDelete(supply) {
  supplyToDelete.value = supply
  deleteDialog.value = true
}

// ─── ACTIONS ─────────────────────────────────────────────
async function submitRequest() {
  submittingRequest.value = true
  await new Promise((r) => setTimeout(r, 1500))
  submittingRequest.value = false
  requestDialog.value = false
  showSnack(
    `Request for ${requestSupply.value.name} submitted! Email notification sent.`,
    'success',
    'mdi-email-check'
  )
  const s = supplies.value.find((x) => x.id === requestSupply.value.id)
  if (s) s.requests++
}

async function saveSupply() {
  savingSupply.value = true
  await new Promise((r) => setTimeout(r, 1200))
  savingSupply.value = false
  if (editMode.value) {
    const idx = supplies.value.findIndex((s) => s.id === supplyForm.id)
    if (idx !== -1) supplies.value[idx] = { ...supplies.value[idx], ...supplyForm }
    showSnack(`${supplyForm.name} updated successfully.`)
  } else {
    supplies.value.push({
      ...supplyForm,
      id: Date.now(),
      icon: 'mdi-package-variant',
      requests: 0,
      lastRestocked: 'Not yet'
    })
    showSnack(`${supplyForm.name} added to catalog.`)
  }
  addEditDialog.value = false
}

function deleteSupply() {
  supplies.value = supplies.value.filter((s) => s.id !== supplyToDelete.value.id)
  deleteDialog.value = false
  showSnack(`${supplyToDelete.value.name} removed.`, 'error', 'mdi-delete-circle')
}
</script>

<style scoped>
.supplies-page {
  min-height: 100vh;
  position: relative;
}

.bg-mesh {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: radial-gradient(
      ellipse 60% 40% at 10% 0%,
      rgba(15, 76, 129, 0.07) 0%,
      transparent 70%
    ),
    radial-gradient(ellipse 40% 30% at 90% 100%, rgba(15, 76, 129, 0.05) 0%, transparent 70%);
  pointer-events: none;
  z-index: 0;
}

.page-header,
.filters-bar,
.supplies-grid,
.px-6 {
  position: relative;
  z-index: 1;
}

.page-title {
  font-size: 2rem;
  font-weight: 800;
  color: #1a2a3a;
  line-height: 1.2;
  letter-spacing: -0.5px;
}

.title-accent {
  color: #0f4c81;
  position: relative;
}

.page-subtitle {
  color: #64748b;
  font-size: 0.875rem;
  margin-top: 4px;
}

.action-btn-primary {
  font-weight: 700 !important;
  letter-spacing: 0.5px;
  text-transform: none !important;
  padding: 0 20px !important;
  height: 42px !important;
}

.action-btn-outline {
  font-weight: 600 !important;
  text-transform: none !important;
  height: 42px !important;
}

/* Stats */
.stat-card {
  background: white;
  border-radius: 14px;
  padding: 14px 16px;
  display: flex;
  align-items: center;
  gap: 12px;
  box-shadow: 0 1px 4px rgba(15, 76, 129, 0.06);
  border: 1px solid rgba(15, 76, 129, 0.07);
  transition:
    transform 0.2s,
    box-shadow 0.2s;
}
.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(15, 76, 129, 0.1);
}
.stat-icon-wrap {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.stat-value {
  font-size: 1.5rem;
  font-weight: 800;
  color: #1a2a3a;
  line-height: 1;
}
.stat-label {
  font-size: 0.72rem;
  color: #64748b;
  font-weight: 500;
  margin-top: 2px;
}

/* Filters */
.filters-bar {
  backdrop-filter: blur(10px);
}

/* Supply Card */
.supply-card {
  background: white;
  border-radius: 18px;
  overflow: hidden;
  position: relative;
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(15, 76, 129, 0.06);
  border: 1px solid rgba(15, 76, 129, 0.07);
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
}
.supply-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 32px rgba(15, 76, 129, 0.13);
  border-color: rgba(15, 76, 129, 0.2);
}

.category-bar {
  height: 4px;
  width: 100%;
}

.card-body {
  padding: 16px;
}

.stock-badge {
  position: absolute;
  top: 14px;
  right: 12px;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.5px;
  padding: 3px 9px;
  border-radius: 20px;
  z-index: 2;
}
.badge-in {
  background: #dcfce7;
  color: #15803d;
}
.badge-low {
  background: #fef3c7;
  color: #92400e;
}
.badge-out {
  background: #fee2e2;
  color: #dc2626;
}

.supply-icon-wrap {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.supply-icon-wrap-sm {
  width: 34px;
  height: 34px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.category-tag {
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.5px;
  text-transform: uppercase;
}

.supply-name {
  font-size: 0.95rem;
  font-weight: 700;
  color: #1a2a3a;
  margin-bottom: 4px;
  line-height: 1.3;
}

.supply-desc {
  font-size: 0.78rem;
  color: #64748b;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.supply-meta {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.meta-row {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 11px;
  color: #94a3b8;
}

.stock-text {
  font-size: 11px;
  color: #64748b;
}
.stock-count {
  font-size: 11px;
  font-weight: 600;
  color: #1a2a3a;
}

.card-footer {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  border-top: 1px solid #f1f5f9;
  padding-top: 12px;
}
.price-label {
  font-size: 10px;
  color: #94a3b8;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}
.price-value {
  font-size: 1rem;
  font-weight: 800;
  color: #0f4c81;
}

/* Card transition */
.card-fade-enter-active,
.card-fade-leave-active {
  transition: all 0.3s ease;
}
.card-fade-enter-from,
.card-fade-leave-to {
  opacity: 0;
  transform: scale(0.95);
}

/* List */
.list-card {
  border: 1px solid rgba(15, 76, 129, 0.08);
}
.supplies-table :deep(th) {
  font-size: 12px !important;
  font-weight: 700 !important;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: #64748b !important;
  background: #f8fafd !important;
}
.supplies-table :deep(tbody tr) {
  cursor: pointer;
  transition: background 0.15s;
}
.supplies-table :deep(tbody tr:hover) {
  background: #f0f6ff !important;
}

/* Detail dialog */
.detail-dialog-card {
  overflow: hidden;
}
.detail-header {
  padding: 24px;
  position: relative;
}
.close-btn {
  position: absolute;
  top: 12px;
  right: 12px;
}
.detail-icon-wrap {
  width: 60px;
  height: 60px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.detail-stats-row {
  margin-top: 16px;
}
.detail-stat {
  background: rgba(255, 255, 255, 0.15);
  border-radius: 12px;
  padding: 12px;
  text-align: center;
}
.detail-stat-val {
  font-size: 1.1rem;
  font-weight: 800;
  color: white;
}
.detail-stat-lbl {
  font-size: 11px;
  color: rgba(255, 255, 255, 0.7);
  margin-top: 2px;
}
.detail-info-item {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 12px;
  background: #f8fafd;
  border-radius: 12px;
}
.detail-info-lbl {
  font-size: 10px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: #94a3b8;
  font-weight: 600;
}
.detail-info-val {
  font-size: 0.85rem;
  font-weight: 600;
  color: #1a2a3a;
  margin-top: 2px;
}

/* Request dialog */
.req-icon-wrap {
  width: 38px;
  height: 38px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* Add dialog */
.dialog-title-icon {
  width: 36px;
  height: 36px;
  background: #e8f0fb;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* Delete */
.delete-icon-wrap {
  width: 64px;
  height: 64px;
  background: #fee2e2;
  border-radius: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* Empty state */
.empty-state {
  text-align: center;
  padding: 80px 20px;
  grid-column: 1 / -1;
}
.empty-title {
  font-size: 1.1rem;
  font-weight: 700;
  color: #1a2a3a;
  margin-bottom: 6px;
}
.empty-sub {
  font-size: 0.875rem;
  color: #64748b;
}
</style>
