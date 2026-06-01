<script setup>
import MainLayout from '@/layouts/full/MainLayout.vue'

import { ref } from 'vue'
import { supabase } from '@/services/supabase.js'
import ApiService from '@/services/api'

const openNewTask = ref(false)
const loading = ref(false)

const showNewTask = () => {
  openNewTask.value = true
}

const tasks = ref({
  todo: []
})

const taskForm = ref({
  title: '',
  description: '',
  status: 'todo',
  priority: 'medium',
  project_id: null,
  team_id: null,
  start_date: null,
  due_date: null,
  assignee_ids: []
})

const createTask = async () => {
  try {
    if (!taskForm.value.title.trim()) {
      alert('Task title required')
      return
    }

    loading.value = true

    const response = await ApiService.post('tasks', {
      action: 'create',

      project_id: taskForm.value.project_id,
      title: taskForm.value.title,
      description: taskForm.value.description,
      status: taskForm.value.status,
      priority: taskForm.value.priority,
      start_date: taskForm.value.start_date,
      due_date: taskForm.value.due_date,
      team_id: taskForm.value.team_id,
      assignee_ids: taskForm.value.assignee_ids
    })

    console.log('Created:', response.data)

    const newTask = response.data.data

    // Add newly created task into board immediately
    // if (!tasks.value[newTask.status]) {
    //   tasks.value[newTask.status] = []
    // }

    // tasks.value[newTask.status].unshift({
    //   ...newTask,
    //   comment_count: 0,
    //   attachment_count: 0,
    //   task_assignees: []
    // })

    openNewTask.value = false

    taskForm.value = {
      title: '',
      description: '',
      status: 'todo',
      priority: 'medium',
      project_id: null,
      team_id: null,
      start_date: null,
      due_date: null,
      assignee_ids: []
    }

    // refresh list
    // await fetchTasks()
  } catch (err) {
    console.log(err)
    // alert(err?.response?.data?.error || 'Task creation failed')
  } finally {
    loading.value = false
  }
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

          <!-- inputing new TASKS -->
          <div class="px-3 pb-3 flex-1 overflow-y-auto">
            
            <!-- EMPTY TASK CARD -->
            <div
              v-if="openNewTask"
              class="bg-white rounded-3xl p-4 mb-4 border-2 border-dashed border-gray-200"
            >
              <!-- STATUS -->
              <div class="flex justify-between">
                <select
                  v-model="taskForm.status"
                  class="text-xs px-3 py-1 rounded-full bg-gray-100"
                >
                  <option value="todo">Todo</option>
                  <option value="in_progress">In Progress</option>
                  <option value="done">Done</option>
                </select>
              </div>

              <!-- TITLE -->
              <input
                v-model="taskForm.title"
                placeholder="Task title"
                class="w-full mt-4 font-semibold outline-none"
              />

              <!-- DESCRIPTION -->
              <textarea
                v-model="taskForm.description"
                placeholder="Task description"
                class="w-full mt-3 text-sm outline-none resize-none"
              ></textarea>

              <!-- PRIORITY -->
              <select v-model="taskForm.priority" class="mt-3 border rounded-lg p-2 w-full">
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>

              <!-- DUE DATE -->
              <input
                type="date"
                v-model="taskForm.due_date"
                class="mt-3 border rounded-lg p-2 w-full"
              />

              <!-- BUTTONS -->
              <div class="flex gap-3 mt-4">
                <button
                  @click="createTask"
                  :disabled="loading"
                  class="bg-[#5b2c52] text-white px-4 py-2 rounded-lg"
                >
                  {{ loading ? 'Saving...' : 'Create Task' }}
                </button>

                <button @click="openNewTask = false" class="border px-4 py-2 rounded-lg">
                  Cancel
                </button>
              </div>
            </div>

            <!-- CARD -->
            <div
              v-for="task in tasks.todo"
              :key="task.id"
              class="bg-white rounded-3xl p-4 mb-4 shadow-sm hover:shadow-md transition cursor-pointer"
            >
              <!-- TOP -->
              <div class="flex items-start justify-between">
                <span
                  class="text-xs px-3 py-1 rounded-full font-medium"
                  :class="{
                    'bg-red-100 text-red-600': task.priority === 'high',
                    'bg-yellow-100 text-yellow-600': task.priority === 'medium',
                    'bg-green-100 text-green-600': task.priority === 'low'
                  }"
                >
                  {{ task.priority }}
                </span>

                <button class="text-gray-400">•••</button>
              </div>

              <!-- TITLE -->
              <h3 class="font-semibold text-gray-900 mt-4">
                {{ task.title }}
              </h3>

              <!-- DESCRIPTION -->
              <p class="text-sm text-gray-500 mt-2 line-clamp-3">
                {{ task.description }}
              </p>

              <!-- FOOTER -->
              <div class="mt-5 flex justify-between">
                <div class="flex items-center gap-4 text-sm text-gray-500">
                  <span>💬 {{ task.comment_count || 0 }}</span>
                  <span>📎 {{ task.attachment_count || 0 }}</span>
                </div>
              </div>

              <!-- DUE -->
              <div class="mt-4 text-sm font-medium text-red-500">
                {{ task.due_date || 'No due date' }}
              </div>
            </div>
          </div>

          <!-- TASK CARDS -->
          <!-- TASK CARDS -->
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
