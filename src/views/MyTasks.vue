<script setup>
import MainLayout from '@/layouts/full/MainLayout.vue'

import { ref } from 'vue'

// const columns = ref([
//   { id: 1, title: 'Recently assigned', color: '#64748b' },
//   { id: 2, title: 'Do today', color: '#ef4444' },
//   { id: 3, title: 'Do next week', color: '#f59e0b' },
//   { id: 4, title: 'Do later', color: '#10b981' }
// ])

// const tasks = ref([])

// const tasksByColumn = (columnId) => {
//   return tasks.value.filter((t) => t.columnId === columnId)
// }

// defineEmits(['add-task', 'toggle-complete', 'task-click', 'task-menu'])

const openNewTask = ref(false)

const showNewTask = () => {
  openNewTask.value = true
}
</script>

<template>
  <MainLayout>
    <div class="h-screen bg-[#f6f7fb] flex flex-col overflow-hidden">
      <!-- HEADER -->
      <div class="bg-white border-b px-6 py-5 flex items-center justify-between">
        <div>
          <h1 class="text-2xl font-bold text-gray-900">Tasks</h1>

          <p class="text-sm text-gray-500 mt-1">Manage your team workflow</p>
        </div>

        <div class="flex items-center gap-3">
          <button
            class="px-4 py-2 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 transition"
          >
            Filter
          </button>

          <button
            class="px-5 py-2 rounded-xl bg-[#5b2c52] text-white hover:bg-[#4a2242] transition"
          >
            + Create Task
          </button>
        </div>
      </div>

      <!-- SEARCH -->
      <div class="px-6 py-4 bg-white border-b">
        <div class="bg-[#f3f4f6] rounded-2xl px-4 py-3 flex items-center gap-3">
          <input
            type="text"
            placeholder="Search tasks..."
            class="bg-transparent outline-none w-full text-sm"
          />
        </div>
      </div>

      <!-- BOARD -->
      <div class="flex-1 overflow-x-auto overflow-y-hidden p-6 flex gap-5">
        <!-- TODO -->
        <div class="w-[340px] min-w-[340px] bg-[#edf1f7] rounded-3xl flex flex-col">
          <!-- HEADER -->
          <div class="p-4 flex items-center justify-between">
            <div class="flex items-center gap-3">
              <div class="w-3 h-3 rounded-full bg-gray-400"></div>

              <h2 class="font-semibold text-gray-800">Todo</h2>

              <span class="text-xs bg-white px-2 py-1 rounded-full text-gray-500"> 4 </span>
            </div>

            <button
              @click="showNewTask"
              class="w-8 h-8 rounded-xl hover:bg-white transition flex items-center justify-center"
            >
              +
            </button>
          </div>

          <!-- TASKS -->
          <div class="px-3 pb-3 flex-1 overflow-y-auto">
            <!-- EMPTY TASK CARD -->
            <!-- EMPTY TASK CARD -->
            <div
              v-if="openNewTask"
              class="bg-white rounded-3xl p-4 mb-4 border-2 border-dashed border-gray-200 hover:border-[#5b2c52] transition cursor-pointer"
            >
              <!-- TOP -->
              <div class="flex items-start justify-between">
                <span class="text-xs px-3 py-1 rounded-full font-medium bg-gray-100 text-gray-400">
                  Empty
                </span>

                <button class="text-gray-300 hover:text-gray-500">•••</button>
              </div>

              <!-- TITLE -->
              <h3 class="font-semibold text-gray-400 mt-4">Untitled Task</h3>

              <!-- DESCRIPTION -->
              <p class="text-sm text-gray-300 mt-2 line-clamp-3">
                Add a description for this task...
              </p>

              <!-- FOOTER -->
              <div class="mt-5 flex items-center justify-between">
                <div class="flex -space-x-2">
                  <div class="w-8 h-8 rounded-full border-2 border-white bg-gray-100"></div>

                  <div class="w-8 h-8 rounded-full border-2 border-white bg-gray-100"></div>
                </div>

                <div class="flex items-center gap-4 text-sm text-gray-300">
                  <div class="flex items-center gap-1">
                    💬
                    <span>0</span>
                  </div>

                  <div class="flex items-center gap-1">
                    📎
                    <span>0</span>
                  </div>
                </div>
              </div>

              <!-- DUE -->
              <div class="mt-4 text-sm font-medium text-gray-300">No due date</div>
            </div>

            <!-- CARD -->
            <div
              class="bg-white rounded-3xl p-4 mb-4 shadow-sm hover:shadow-md transition cursor-pointer"
            >
              <!-- TOP -->
              <div class="flex items-start justify-between">
                <span class="text-xs px-3 py-1 rounded-full font-medium bg-red-100 text-red-600">
                  High
                </span>

                <button class="text-gray-400 hover:text-gray-700">•••</button>
              </div>

              <!-- TITLE -->
              <h3 class="font-semibold text-gray-900 mt-4">Design Dashboard UI</h3>

              <!-- DESCRIPTION -->
              <p class="text-sm text-gray-500 mt-2 line-clamp-3">
                Create a clean admin dashboard for the project management app.
              </p>

              <!-- FOOTER -->
              <div class="mt-5 flex items-center justify-between">
                <!-- AVATARS -->
                <div class="flex -space-x-2">
                  <img
                    src="https://i.pravatar.cc/100?img=1"
                    class="w-8 h-8 rounded-full border-2 border-white object-cover"
                  />

                  <img
                    src="https://i.pravatar.cc/100?img=2"
                    class="w-8 h-8 rounded-full border-2 border-white object-cover"
                  />
                </div>

                <!-- COUNTS -->
                <div class="flex items-center gap-4 text-sm text-gray-500">
                  <div class="flex items-center gap-1">
                    💬
                    <span>5</span>
                  </div>

                  <div class="flex items-center gap-1">
                    📎
                    <span>2</span>
                  </div>
                </div>
              </div>

              <!-- DUE -->
              <div class="mt-4 text-sm font-medium text-red-500">Due Tomorrow</div>
            </div>
          </div>
        </div>

        <!-- IN PROGRESS -->
        <div class="w-[340px] min-w-[340px] bg-[#edf1f7] rounded-3xl flex flex-col">
          <div class="p-4 flex items-center justify-between">
            <div class="flex items-center gap-3">
              <div class="w-3 h-3 rounded-full bg-blue-500"></div>

              <h2 class="font-semibold text-gray-800">In Progress</h2>

              <span class="text-xs bg-white px-2 py-1 rounded-full text-gray-500"> 2 </span>
            </div>

            <button
              class="w-8 h-8 rounded-xl hover:bg-white transition flex items-center justify-center"
            >
              +
            </button>
          </div>
        </div>

        <!-- REVIEW -->
        <div class="w-[340px] min-w-[340px] bg-[#edf1f7] rounded-3xl flex flex-col">
          <div class="p-4 flex items-center justify-between">
            <div class="flex items-center gap-3">
              <div class="w-3 h-3 rounded-full bg-yellow-400"></div>

              <h2 class="font-semibold text-gray-800">Review</h2>

              <span class="text-xs bg-white px-2 py-1 rounded-full text-gray-500"> 1 </span>
            </div>

            <button
              class="w-8 h-8 rounded-xl hover:bg-white transition flex items-center justify-center"
            >
              +
            </button>
          </div>
        </div>

        <!-- DONE -->
        <div class="w-[340px] min-w-[340px] bg-[#edf1f7] rounded-3xl flex flex-col">
          <div class="p-4 flex items-center justify-between">
            <div class="flex items-center gap-3">
              <div class="w-3 h-3 rounded-full bg-green-500"></div>

              <h2 class="font-semibold text-gray-800">Done</h2>

              <span class="text-xs bg-white px-2 py-1 rounded-full text-gray-500"> 8 </span>
            </div>

            <button
              class="w-8 h-8 rounded-xl hover:bg-white transition flex items-center justify-center"
            >
              +
            </button>
          </div>
        </div>
      </div>
    </div>
  </MainLayout>
</template>
