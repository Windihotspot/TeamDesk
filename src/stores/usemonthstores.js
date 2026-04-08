

// src/stores/monthDropdown.js
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

// src/stores/index.js


export const useMonthDropdownStore = defineStore('monthDropdown', () => {
  const open = ref(false)
  const selected = ref(null)
  const dropdownWrapper = ref(null)

  const months = computed(() => {
    const result = []
    const now = new Date()
    for (let i = 1; i <= 12; i++) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
      result.push({
        label: d.toLocaleString('default', { month: 'long', year: 'numeric' }),
        value: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
      })
    }
    return result
  })

  const selectedLabel = computed(
    () => months.value.find((m) => m.value === selected.value)?.label ?? 'Last month'
  )

  function toggle() {
    open.value = !open.value
  }

  function select(month) {
    selected.value = month.value
    open.value = false
  }

  function close() {
    open.value = false
  }

  function handleOutsideClick(e) {
    if (dropdownWrapper.value && !dropdownWrapper.value.contains(e.target)) {
      close()
    }
  }

  function init() {
    selected.value = months.value[0]?.value ?? null
    document.addEventListener('click', handleOutsideClick)
  }

  function destroy() {
    document.removeEventListener('click', handleOutsideClick)
  }

  return {
    open,
    selected,
    selectedLabel,
    months,
    dropdownWrapper,
    toggle,
    select,
    init,
    destroy
  }
})