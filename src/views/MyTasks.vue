<script setup>
import MainLayout from '@/layouts/full/MainLayout.vue'

import { ref } from 'vue'

const columns = ref([
  { id: 1, title: 'Recently assigned', color: '#64748b' },
  { id: 2, title: 'Do today', color: '#ef4444' },
  { id: 3, title: 'Do next week', color: '#f59e0b' },
  { id: 4, title: 'Do later', color: '#10b981' }
])

const tasks = ref([])

const tasksByColumn = (columnId) => {
  return tasks.value.filter(t => t.columnId === columnId)
}


defineEmits(['add-task', 'toggle-complete', 'task-click', 'task-menu'])
</script>

<template>
  <MainLayout>
    <div class="flex gap-4 overflow-x-auto pb-4 p-6 bg-gray-50 min-h-screen">
      <div
        v-for="column in columns"
        :key="column.id"
        class="flex flex-col flex-shrink-0 w-72 sm:w-80"
      >
        <!-- Column header -->
        <div class="flex items-center gap-2 mb-3 px-1">
          <span
            class="w-2.5 h-2.5 rounded-full flex-shrink-0"
            :style="{ background: column.color }"
          />
          <h2 class="text-sm font-semibold text-gray-700">{{ column.title }}</h2>
          <span class="text-xs font-medium text-gray-400 bg-gray-100 rounded-full px-2 py-0.5">
            {{ tasksByColumn(column.id).length }}
          </span> 
          <button
            @click="$emit('add-task', column.id)"
            class="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg
              viewBox="0 0 14 14"
              fill="none"
              stroke="currentColor"
              stroke-width="1.8"
              class="w-4 h-4"
            >
              <path d="M7 1v12M1 7h12" />
            </svg>
          </button>
        </div>

        <!-- Task cards -->
        <div class="flex flex-col gap-2.5 flex-1">
          <div
            v-for="task in tasksByColumn(column.id)"
            :key="task.id"
            class="bg-white rounded-xl border border-gray-100 p-3.5 group hover:shadow-sm hover:border-gray-200 transition-all cursor-pointer"
            :class="{ 'opacity-60': task.completed }"
            @click="$emit('task-click', task)"
          >
            <!-- Task name row -->
            <div class="flex items-start gap-2 mb-2.5">
              <button
                class="mt-0.5 w-4 h-4 rounded-full border-[1.5px] flex items-center justify-center flex-shrink-0 transition-colors"
                :class="
                  task.completed
                    ? 'bg-rose-500 border-rose-500'
                    : 'border-gray-300 hover:border-rose-400'
                "
                @click.stop="$emit('toggle-complete', task.id)"
              >
                <svg
                  v-if="task.completed"
                  viewBox="0 0 10 10"
                  fill="none"
                  stroke="white"
                  stroke-width="1.8"
                  stroke-linecap="round"
                  class="w-2.5 h-2.5"
                >
                  <path d="M1.5 5l2.5 2.5 4.5-4.5" />
                </svg>
              </button>

              <p
                class="flex-1 text-sm leading-snug text-gray-800"
                :class="{ 'line-through text-gray-400': task.completed }"
              >
                {{ task.name }}
              </p>

              <button
                class="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-gray-600 transition-all"
                @click.stop="$emit('task-menu', task)"
              >
                <svg viewBox="0 0 16 16" fill="currentColor" class="w-3.5 h-3.5">
                  <circle cx="4" cy="8" r="1.2" />
                  <circle cx="8" cy="8" r="1.2" />
                  <circle cx="12" cy="8" r="1.2" />
                </svg>
              </button>
            </div>

            <!-- Task meta row -->
            <div class="flex flex-wrap items-center gap-1.5">
              <!-- Priority dot -->
              <span
                class="w-2 h-2 rounded-full flex-shrink-0"
                :class="{
                  'bg-rose-500': task.priority === 'high',
                  'bg-amber-400': task.priority === 'medium',
                  'bg-green-500': task.priority === 'low',
                  'bg-gray-200': task.priority === 'none' || !task.priority
                }"
              />

              <!-- Project tag -->
              <span
                v-if="task.project"
                class="text-[11px] font-medium px-1.5 py-0.5 rounded-md"
                :style="{ background: task.project.bgColor, color: task.project.textColor }"
              >
                {{ task.project.name }}
              </span>

              <span class="flex-1" />

              <!-- Assignee avatar -->
              <div
                v-if="task.assignee"
                class="w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-semibold flex-shrink-0"
                :style="{ background: task.assignee.bgColor, color: task.assignee.textColor }"
                :title="task.assignee.name"
              >
                {{ task.assignee.initials }}
              </div>

              <!-- Due date -->
              <div
                v-if="task.dueDate"
                class="flex items-center gap-0.5 text-[11px]"
                :class="{
                  'text-rose-500': task.isOverdue,
                  'text-amber-600': task.isDueToday && !task.isOverdue,
                  'text-gray-400': !task.isOverdue && !task.isDueToday
                }"
              >
                <svg
                  viewBox="0 0 12 12"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="1.4"
                  class="w-3 h-3"
                >
                  <rect x="1" y="2" width="10" height="9" rx="1" />
                  <path d="M1 5h10M4 2V1M8 2V1" />
                </svg>
                <span>{{ task.dueDate }}</span>
              </div>
            </div>
          </div>

          <!-- Empty state -->
          <div
            v-if="tasksByColumn(column.id).length === 0"
            class="border-2 border-dashed border-gray-200 rounded-xl p-6 text-center"
          >
            <p class="text-xs text-gray-400">No tasks</p>
          </div>

          <!-- Add task row -->
          <button
            @click="$emit('add-task', column.id)"
            class="flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-gray-400 hover:text-gray-600 hover:bg-white border border-dashed border-gray-200 hover:border-gray-300 transition-all"
          >
            <svg
              viewBox="0 0 14 14"
              fill="none"
              stroke="currentColor"
              stroke-width="1.8"
              class="w-3.5 h-3.5"
            >
              <path d="M7 1v12M1 7h12" />
            </svg>
            Add task
          </button>
        </div>
      </div>
    </div>
  </MainLayout>
</template>
