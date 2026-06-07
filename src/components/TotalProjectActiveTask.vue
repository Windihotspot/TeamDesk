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
  <div class="grid grid-cols-2 gap-6">
    <!-- Total Projects Card -->
    <div class="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
      <div class="flex items-center gap-3 text-gray-500 text-sm mb-3">
        <div class="w-8 h-8 bg-blue-100 rounded-xl flex items-center justify-center">
          <span class="text-blue-600 text-xl">📁</span>
        </div>
        <span class="font-medium">Total Projects</span>
      </div>
      
      <div class="flex items-baseline gap-2">
        <span class="text-5xl font-bold text-gray-900">{{ totalProjects }}</span>
      </div>
      
      <div class="text-xs text-emerald-600 mt-1 flex items-center gap-1">
        <span class="inline-block w-2 h-2 bg-emerald-500 rounded-full"></span>
        +12% from last month
      </div>
    </div>

    <!-- Active Tasks Card -->
    <div class="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
      <div class="flex items-center gap-3 text-gray-500 text-sm mb-3">
        <div class="w-8 h-8 bg-amber-100 rounded-xl flex items-center justify-center">
          <span class="text-amber-600 text-xl">⚡</span>
        </div>
        <span class="font-medium">Active Tasks</span>
      </div>
      
      <div class="flex items-baseline gap-2">
        <span class="text-5xl font-bold text-gray-900">{{ activeTasksCount }}</span>
      </div>
      
      <div class="text-xs text-amber-600 mt-1 flex items-center gap-1">
        <span class="inline-block w-2 h-2 bg-amber-500 rounded-full"></span>
        Currently in progress
      </div>
    </div>
  </div>
</template>