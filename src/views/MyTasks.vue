<script setup>
import MainLayout from '@/layouts/full/MainLayout.vue'

import { ref } from 'vue'

const columns = ref([
  {
    id: 1,
    title: 'Recently assigned',
    tasks: [
      { id: 1, title: 'Pop-up notification after submit' },
      { id: 2, title: 'Add type ahead for selecting bank' }
    ]
  },
  {
    id: 2,
    title: 'Do today',
    tasks: []
  },
  {
    id: 3,
    title: 'Do next week',
    tasks: []
  },
  {
    id: 4,
    title: 'Do later',
    tasks: []
  }
])
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
    <v-container fluid>
      <div class="d-flex ga-4 overflow-x-auto pb-4">
        <!-- Column -->
        <v-card
          v-for="column in columns"
          :key="column.id"
          min-width="280"
          max-width="280"
          class="pa-3"
          rounded="lg"
        >
          <!-- Column Header -->
          <div class="d-flex justify-space-between align-center mb-3">
            <div class="font-weight-medium">
              {{ column.title }}
            </div>
            <div class="text-caption text-grey">
              {{ column.tasks.length }}
            </div>
          </div>

          <!-- Tasks -->
          <v-card
            v-for="task in column.tasks"
            :key="task.id"
            class="mb-3 pa-3"
            variant="outlined"
            rounded="lg"
          >
            <div class="text-body-2">
              {{ task.title }}
            </div>
          </v-card>

          <!-- Add Task -->
          <v-btn block variant="text" size="small"> + Add task </v-btn>
        </v-card>

        <!-- Add Section -->
        <v-card
          min-width="250"
          class="d-flex align-center justify-center"
          rounded="lg"
          variant="outlined"
        >
          <v-btn variant="text">+ Add section</v-btn>
        </v-card>
      </div>
    </v-container>
  </MainLayout>
</template>
