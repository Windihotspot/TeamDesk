<script setup>
import MainLayout from '@/layouts/full/MainLayout.vue'

import { onMounted, ref } from 'vue'

import ApiService from '@/services/api'

import TaskForm from '@/components/TaskForm.vue'

const openNewTask = ref(false)
const activeStatus = ref('todo')

const showNewTask = (status) => {
  activeStatus.value = status
  taskForm.value.status = status
  openNewTask.value = true
}
const loading = ref(true)

const fetchTasks = async () => {
  try {
    const response = await ApiService.post('tasks', {
      action: 'list'
    })
    console.log(response)
    const allTasks = response.data
    tasks.value = {
      todo: allTasks.filter((task) => task.status === 'todo'),
      in_progress: allTasks.filter((task) => task.status === 'in_progress'),
      done: allTasks.filter((task) => task.status === 'done')
    }
  } catch (error) {
    console.log(error)
  }
}

onMounted(() => {
  fetchTasks()
})

const tasks = ref({
  todo: [],
  in_progress: [],
  done: []
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
    await fetchTasks()
  } catch (err) {
    console.log(err)
  } finally {
    loading.value = false
  }
}
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
            <div
              v-if="loading"
              v-for="n in 3"
              :key="`skeleton-${n}`"
              class="bg-white rounded-3xl p-4 mb-4 shadow-sm"
            >
              <!-- TOP -->
              <div class="flex items-start justify-between">
                <v-skeleton-loader type="chip" width="64" />
                <v-skeleton-loader type="text" width="24" />
              </div>

              <!-- TITLE -->
              <v-skeleton-loader type="text" width="75%" class="mt-4" />

              <!-- DESCRIPTION -->
              <div class="mt-2">
                <v-skeleton-loader type="text" width="100%" />
                <v-skeleton-loader type="text" width="85%" />
                <v-skeleton-loader type="text" width="65%" />
              </div>

              <!-- FOOTER -->
              <div class="mt-5 flex gap-4">
                <v-skeleton-loader type="text" width="40" />
                <v-skeleton-loader type="text" width="40" />
              </div>

              <!-- DUE -->
              <v-skeleton-loader type="text" width="96" class="mt-4" />
            </div>

            <!-- REAL CARDS -->
            <div
              v-else=""
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
              <h3 class="font-semibold text-gray-900 mt-4">{{ task.title }}</h3>

              <!-- DESCRIPTION -->
              <p class="text-sm text-gray-500 mt-2 line-clamp-3">{{ task.description }}</p>

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

            <div
              v-for="task in tasks.in_progress"
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
        </div>

        <!-- REVIEW -->
        <!-- <div class="w-[340px] min-w-[340px] bg-[#edf1f7] rounded-3xl flex flex-col">
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
        </div> -->

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

            <div
              v-for="task in tasks.done"
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
        </div>
      </div>
    </div>
  </MainLayout>
</template>
