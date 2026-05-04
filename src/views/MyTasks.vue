<script setup>
import MainLayout from '@/layouts/full/MainLayout.vue'

import { ref } from 'vue'

// const columns = ref([
//   {
//     id: 1,
//     title: 'Recently assigned',
//     tasks: [
//       { id: 1, title: 'Pop-up notification after submit' },
//       { id: 2, title: 'Add type ahead for selecting bank' }
//     ]
//   },
//   {
//     id: 2,
//     title: 'Do today',
//     tasks: []
//   },
//   {
//     id: 3,
//     title: 'Do next week',
//     tasks: []
//   },
//   {
//     id: 4,
//     title: 'Do later',
//     tasks: []
//   }
// ])
</script>

<template>
  <MainLayout>
    <!-- Top Controls -->
    <v-container fluid class="py-3">
      <div class="d-flex justify-space-between align-center">
        <div class="text-h5 font-weight-medium">My tasks</div>

        <div class="d-flex ga-2">
          <v-btn variant="outlined" size="small">Filters</v-btn>
          <v-btn variant="outlined" size="small">Sort</v-btn>
          <v-btn variant="outlined" size="small">Group</v-btn>
          <v-btn variant="outlined" size="small">Options</v-btn>
        </div>
      </div>
    </v-container>

    <!-- Kanban Board -->

    <div class="flex flex-col gap-4">
      <v-container>
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <!-- Recently assigned -->
          <v-card
            class="rounded-lg px-4 py-3 flex items-center justify-between bg-white border border-gray-200 hover:shadow-sm transition-all"
            elevation="0"
          >
            <span class="bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs font-medium">
              Recently assigned
            </span>

            <span class="text-gray-400 text-sm font-medium"> 20 </span>
          </v-card>

          <!-- Do today -->
          <v-card
            class="rounded-lg px-4 py-3 flex items-center justify-between bg-white border border-gray-200 hover:shadow-sm transition-all"
            elevation="0"
          >
            <span class="bg-blue-50 text-blue-600 px-2 py-1 rounded text-xs font-medium">
              Do today
            </span>

            <span class="text-gray-400 text-sm font-medium"> 0 </span>
          </v-card>

          <!-- Do next week -->
          <v-card
            class="rounded-lg px-4 py-3 flex items-center justify-between bg-white border border-gray-200 hover:shadow-sm transition-all"
            elevation="0"
          >
            <span class="bg-yellow-50 text-yellow-600 px-2 py-1 rounded text-xs font-medium">
              Do next week
            </span>

            <span class="text-gray-400 text-sm font-medium"> 0 </span>
          </v-card>

          <!-- Do later -->
          <v-card
            class="rounded-lg px-4 py-3 flex items-center justify-between bg-white border border-gray-200 hover:shadow-sm transition-all"
            elevation="0"
          >
            <span class="bg-purple-50 text-purple-600 px-2 py-1 rounded text-xs font-medium">
              Do later
            </span>

            <span class="text-gray-400 text-sm font-medium"> 0 </span>
          </v-card>
        </div>
      </v-container>

      <div class="flex gap-4 h-[80vh] overflow-hidden">
        <!-- LEFT COLUMN (tasks list) -->
        <div class="w-[300px] bg-[#1f2937] rounded-lg p-3 overflow-y-auto space-y-3">
          <!-- Task Card -->
          <v-card
            class="bg-[#111827] text-gray-200 p-3 rounded-lg border border-white/10"
            elevation="0"
          >
            <div class="flex items-start gap-2">
              <v-icon size="16" class="mt-1 text-gray-400">mdi-check-circle-outline</v-icon>

              <div>
                <p class="text-sm font-medium leading-snug">
                  Write endpoints for the Projects and tasks for team desk
                </p>

                <div class="mt-2 flex gap-2">
                  <span class="bg-pink-500/20 text-pink-300 px-2 py-0.5 text-xs rounded">
                    2026-General Tasks
                  </span>
                </div>
              </div>
            </div>
          </v-card>

          <!-- Task Card -->
          <v-card
            class="bg-[#111827] text-gray-200 p-3 rounded-lg border border-white/10"
            elevation="0"
          >
            <div class="flex items-start gap-2">
              <v-icon size="16" class="mt-1 text-gray-400">mdi-check-circle-outline</v-icon>

              <div>
                <p class="text-sm font-medium leading-snug">
                  Alert: Asana invitation could not be delivered to email
                </p>

                <p class="text-xs text-red-400 mt-2">Apr 21</p>
              </div>
            </div>
          </v-card>

          <!-- Task Card -->
          <v-card
            class="bg-[#111827] text-gray-200 p-3 rounded-lg border border-white/10"
            elevation="0"
          >
            <div class="flex items-start gap-2">
              <v-icon size="16" class="mt-1 text-gray-400">mdi-check-circle-outline</v-icon>

              <div>
                <p class="text-sm font-medium leading-snug">Search settlements data</p>

                <div class="mt-2 flex gap-2 flex-wrap">
                  <span class="bg-pink-500/20 text-pink-300 px-2 py-0.5 text-xs rounded">
                    QuidlyProject
                  </span>
                  <span class="bg-purple-500/20 text-purple-300 px-2 py-0.5 text-xs rounded">
                    2025-General Tasks
                  </span>
                </div>
              </div>
            </div>
          </v-card>
        </div>

        <!-- RIGHT SIDE (columns) -->
        <div class="flex-1 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <!-- Column -->
          <div class="space-y-3">
            <div class="text-gray-400 text-sm font-medium">Do today</div>

            <v-card
              class="rounded-lg px-4 py-3 flex items-center gap-2 bg-white/5 hover:bg-white/10 text-gray-300 cursor-pointer transition"
              elevation="0"
            >
              <v-icon size="16">mdi-plus</v-icon>
              <span class="text-sm">Add task</span>
            </v-card>
          </div>

          <!-- Column -->
          <div class="space-y-3">
            <div class="text-gray-400 text-sm font-medium">Do next week</div>

            <v-card
              class="rounded-lg px-4 py-3 flex items-center gap-2 bg-white/5 hover:bg-white/10 text-gray-300 cursor-pointer transition"
              elevation="0"
            >
              <v-icon size="16">mdi-plus</v-icon>
              <span class="text-sm">Add task</span>
            </v-card>
          </div>

          <!-- Column -->
          <div class="space-y-3">
            <div class="text-gray-400 text-sm font-medium">Do later</div>

            <v-card
              class="rounded-lg px-4 py-3 flex items-center gap-2 bg-white/5 hover:bg-white/10 text-gray-300 cursor-pointer transition"
              elevation="0"
            >
              <v-icon size="16">mdi-plus</v-icon>
              <span class="text-sm">Add task</span>
            </v-card>
          </div>
        </div>
      </div>
    </div>
  </MainLayout>
</template>
