<script setup>
import MainLayout from '@/layouts/full/MainLayout.vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const projectId = route.params.id
</script>

<template>
  <MainLayout>
    <div class="h-screen bg-[#f6f7fb] flex flex-col overflow-hidden">
      <!-- HEADER -->
      <div class="bg-white border-b px-4 sm:px-6 py-4 flex items-center justify-between">
        <div>
          <h1 class="text-lg sm:text-2xl font-bold text-gray-900">Tasks</h1>

          <p class="text-xs sm:text-sm text-gray-500 mt-1">Manage your team workflow</p>
        </div>

        <div class="flex items-center gap-2 sm:gap-3">
          <button
            class="px-3 sm:px-4 py-2 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 transition text-sm"
          >
            Filter
          </button>

          <button
            @click="showNewTask('todo')"
            class="px-3 sm:px-5 py-2 rounded-xl bg-[#5b2c52] text-white hover:bg-[#4a2242] transition text-sm"
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
              @click="showNewTask('todo')"
              class="w-8 h-8 rounded-xl hover:bg-white transition flex items-center justify-center"
            >
              +
            </button>
          </div>

          <!-- inputing new TASKS -->
          <div class="px-3 pb-3 flex-1 overflow-y-auto">
            <!-- EMPTY TASK CARD -->
            <TaskForm
              v-if="openNewTask && activeStatus === 'todo'"
              :task-form="taskForm"
              :loading="loading"
              @save="createTask"
              @cancel="openNewTask = false"
            />

            <!-- SKELETON CARDS -->
            <div v-if="loading" class="d-flex flex-column gap-3">
              <v-card v-for="i in 8" :key="i" class="rounded-3xl pa-4 mb-4" elevation="0">
                <!-- Header -->
                <div class="flex justify-between items-start mb-6">
                  <div class="h-7 w-20 rounded-full bg-gray-200"></div>

                  <div class="flex gap-1">
                    <div class="w-1 h-1 rounded-full bg-gray-300"></div>
                    <div class="w-1 h-1 rounded-full bg-gray-300"></div>
                    <div class="w-1 h-1 rounded-full bg-gray-300"></div>
                  </div>
                </div>

                <!-- Task Title -->
                <div class="h-6 w-32 bg-gray-200 rounded mb-6"></div>

                <!-- Stats -->
                <div class="flex gap-6 mb-6">
                  <div class="h-4 w-10 bg-gray-200 rounded"></div>
                  <div class="h-4 w-10 bg-gray-200 rounded"></div>
                </div>

                <!-- Due Date -->
                <div class="h-5 w-24 bg-gray-200 rounded"></div>
              </v-card>
            </div>

            <!-- REAL CARDS -->
            
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
              @click="showNewTask('in_progress')"
              class="w-8 h-8 rounded-xl hover:bg-white transition flex items-center justify-center"
            >
              +
            </button>
          </div>

          <div class="px-3 pb-3 flex-1 overflow-y-auto">
            <TaskForm
              v-if="openNewTask && activeStatus === 'in_progress'"
              :task-form="taskForm"
              :loading="loading"
              @save="createTask"
              @cancel="openNewTask = false"
            />

            <!-- SKELETON CARDS -->
            <div v-if="loading" class="d-flex flex-column gap-3">
              <v-card v-for="i in 8" :key="i" class="rounded-3xl pa-4 mb-4" elevation="0">
                <!-- Header -->
                <div class="flex justify-between items-start mb-6">
                  <div class="h-7 w-20 rounded-full bg-gray-200"></div>

                  <div class="flex gap-1">
                    <div class="w-1 h-1 rounded-full bg-gray-300"></div>
                    <div class="w-1 h-1 rounded-full bg-gray-300"></div>
                    <div class="w-1 h-1 rounded-full bg-gray-300"></div>
                  </div>
                </div>

                <!-- Task Title -->
                <div class="h-6 w-32 bg-gray-200 rounded mb-6"></div>

                <!-- Stats -->
                <div class="flex gap-6 mb-6">
                  <div class="h-4 w-10 bg-gray-200 rounded"></div>
                  <div class="h-4 w-10 bg-gray-200 rounded"></div>
                </div>

                <!-- Due Date -->
                <div class="h-5 w-24 bg-gray-200 rounded"></div>
              </v-card>
            </div>

            
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
              @click="showNewTask('done')"
              class="w-8 h-8 rounded-xl hover:bg-white transition flex items-center justify-center"
            >
              +
            </button>
          </div>

          <div class="px-3 pb-3 flex-1 overflow-y-auto">
            <TaskForm
              v-if="openNewTask && activeStatus === 'done'"
              :task-form="taskForm"
              :loading="loading"
              @save="createTask"
              @cancel="openNewTask = false"
            />

            <!-- SKELETON CARDS -->
            <div v-if="loading" class="d-flex flex-column gap-3">
              <v-card v-for="i in 1" :key="i" class="rounded-3xl pa-4 mb-4" elevation="0">
                <!-- Header -->
                <div class="flex justify-between items-start mb-6">
                  <div class="h-7 w-20 rounded-full bg-gray-200"></div>

                  <div class="flex gap-1">
                    <div class="w-1 h-1 rounded-full bg-gray-300"></div>
                    <div class="w-1 h-1 rounded-full bg-gray-300"></div>
                    <div class="w-1 h-1 rounded-full bg-gray-300"></div>
                  </div>
                </div>

                <!-- Task Title -->
                <div class="h-6 w-32 bg-gray-200 rounded mb-6"></div>

                <!-- Stats -->
                <div class="flex gap-6 mb-6">
                  <div class="h-4 w-10 bg-gray-200 rounded"></div>
                  <div class="h-4 w-10 bg-gray-200 rounded"></div>
                </div>

                <!-- Due Date -->
                <div class="h-5 w-24 bg-gray-200 rounded"></div>
              </v-card>
            </div>

            
          </div>
        </div>
      </div>
    </div>
  </MainLayout>
</template>
