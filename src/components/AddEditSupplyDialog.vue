<template>
  <v-dialog v-model="model" max-width="600" scrollable>
    <v-card rounded="xl" elevation="0">
      <v-card-title class="pa-5 pb-2 flex items-center gap-3">
        <span class="font-bold text-lg">
          {{ isEdit ? 'Edit Supply' : 'Add New Supply' }}
        </span>
      </v-card-title>

      <v-divider />

      <v-card-text class="pa-5">
        <v-form ref="formRef">
          <div class="grid grid-cols-2 gap-4">
            <v-text-field
              v-model="form.name"
              label="Supply Name"
              class="col-span-2"
              variant="outlined"
              rounded="lg"
              :rules="[(v) => !!v || 'Name is required', (v) => v?.length >= 2 || 'Too short']"
            />

            <!-- CATEGORY (FROM COMPOSABLE) -->
            <v-select
              v-model="form.category_id"
              :items="categoryOptions"
              item-title="name"
              item-value="id"
              label="Category"
              variant="outlined"
              rounded="lg"
              :rules="[(v) => !!v || 'Category is required']"
            />

            <v-text-field v-model="form.sku" label="SKU" variant="outlined" rounded="lg" />
            <v-text-field v-model="form.unit" label="Unit" variant="outlined" rounded="lg" />

            <v-text-field
              v-model.number="form.price"
              label="Unit Price"
              type="number"
              variant="outlined"
              rounded="lg"
            />

            <v-text-field
              v-model.number="form.stock"
              label="Stock"
              type="number"
              variant="outlined"
              rounded="lg"
              :rules="[
                (v) => (v !== null && v !== '') || 'Stock required',
                (v) => v >= 0 || 'Must be 0 or more'
              ]"
            />

            <v-text-field
              v-model.number="form.maxStock"
              label="Max Stock"
              type="number"
              variant="outlined"
              rounded="lg"
            />

            <v-text-field
              v-model.number="form.reorderLevel"
              label="Reorder Level"
              type="number"
              variant="outlined"
              rounded="lg"
            />

            <v-text-field
              v-model="form.location"
              label="Location"
              class="col-span-2"
              variant="outlined"
              rounded="lg"
            />

            <v-select
              v-model="form.supplier_id"
              :items="supplierOptions"
              item-title="name"
              item-value="id"
              label="Supplier"
              variant="outlined"
              rounded="lg"
            />
          </div>
        </v-form>
      </v-card-text>

      <v-card-actions class="pa-5 pt-0">
        <v-btn variant="text" color="grey" @click="close">Cancel</v-btn>
        <v-spacer />
        <v-btn
          color="#0f4c81"
          variant="flat"
          :loading="loading"
          :disabled="loading"
          @click="emitSave"
        >
          <template #loader>
            <v-progress-circular indeterminate size="18" width="2" />
          </template>

          {{ loading ? 'Saving...' : isEdit ? 'Save Changes' : 'Add Supply' }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { ref, watch, computed } from 'vue'
import { useSupplyCategories } from '@/composables/useSupplyCategories'
import { useSuppliers } from '@/composables/useSuppliers'

const { categoryOptions } = useSupplyCategories()

const { supplierOptions } = useSuppliers()

const props = defineProps({
  modelValue: Boolean,
  model: Object,
  isEdit: Boolean,
  loading: Boolean
})

const emit = defineEmits(['update:modelValue', 'save', 'close'])

const model = computed({
  get: () => props.modelValue,
  set: (v) => emit('update:modelValue', v)
})

const form = ref({})
const formRef = ref(null)

watch(
  () => props.model,
  (val) => {
    form.value = {
      id: null,
      name: '',
      category_id: null,
      supplier_id: null, // ✅ KEEP ONLY THIS
      sku: '',
      unit: '',
      price: 0,
      stock: 0,
      maxStock: 0,
      reorderLevel: 0,
      location: '',
      ...(val || {})
    }
  },
  { immediate: true, deep: true }
)
watch(
  () => form.value.category_id,
  (val) => {
    console.log('🔥 category_id changed:', val)
  }
)
function close() {
  emit('close')
}
console.log('📦 categoryOptions INIT:', categoryOptions.value)

async function emitSave() {
  console.log('FORM BEFORE VALIDATE:', form.value)

  const { valid } = await formRef.value.validate()

  console.log('FORM AFTER VALIDATE:', form.value)

  if (!valid) return

  emit('save', form.value)
}
</script>

<style scoped>
.v-btn {
  text-transform: none;
}
</style>
