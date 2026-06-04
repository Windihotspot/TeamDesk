<script setup>
defineProps({
  totalProjects: {
    type: Number,
    default: 0
  },
  activeTasksCount: {
    type: Number,
    default: 0
  }
})
</script>

<template>
  <div class="grid grid-cols-2 gap-8">
    <!-- Total Projects -->
    <div>
      <div class="flex items-center gap-2 text-gray-500 text-sm mb-1">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
          />
        </svg>
        <span>Total projects</span>
      </div>
      <div class="flex items-end gap-3">
        <span class="text-4xl font-bold text-gray-900">{{ totalProjects }}</span>
        <div
          class="flex items-center gap-1 bg-red-50 text-red-500 text-xs px-2 py-0.5 rounded-full mb-1"
        >
          36.8%
        </div>
      </div>
    </div>

    <!-- Active Tasks -->
    <div>
      <div class="flex items-center gap-2 text-gray-500 text-sm mb-1">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
          />
        </svg>
        <span>Active tasks</span>
      </div>
      <div class="flex items-end gap-3">
        <span class="text-4xl font-bold text-gray-900">{{ activeTasksCount }}</span>
        <div
          class="flex items-center gap-1 bg-green-50 text-green-600 text-xs px-2 py-0.5 rounded-full mb-1"
        >
          36.8%
        </div>
      </div>
    </div>
  </div>
</template>
