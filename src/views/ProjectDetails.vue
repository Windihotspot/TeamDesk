<script setup>
import MainLayout from '@/layouts/full/MainLayout.vue'
import { useRoute } from 'vue-router'
import { onMounted, ref } from 'vue'
import ApiService from '@/services/api'
import TaskForm from '@/components/TaskForm.vue'
 
const route = useRoute()
const projectId = route.params.id
 
// ─── New Task Form State ──────────────────────────────────────────────────────
 
const openNewTask = ref(false)
const activeStatus = ref('todo')
 
const showNewTask = (status) => {
  activeStatus.value = status
  taskForm.value.status = status  // keeps the created task in the correct column
  openNewTask.value = true
}
 
// ─── Tasks State ─────────────────────────────────────────────────────────────
 
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
  project_id: projectId,
  team_id: null,
  start_date: null,
  due_date: null,
  assignee_ids: []
})
 
const loading = ref(true)
 
// ─── Fetch Tasks ─────────────────────────────────────────────────────────────
 
const fetchTasks = async () => {
  loading.value = true
  try {
    const [todoRes, inProgressRes, doneRes] = await Promise.all([
      ApiService.post('projects', { action: 'get', status: 'todo', project_id: projectId }),
      ApiService.post('projects', { action: 'get', status: 'in_progress', project_id: projectId }),
      ApiService.post('projects', { action: 'get', status: 'done', project_id: projectId })
    ])
 
    tasks.value = {
      todo: todoRes.data.tasks ?? [],
      in_progress: inProgressRes.data.tasks ?? [],
      done: doneRes.data.tasks ?? []
    }
  } catch (error) {
    console.error('❌ Error fetching tasks:', error)
  } finally {
    loading.value = false
  }
}
 
// ─── Create Task ─────────────────────────────────────────────────────────────
 
// const createTask = async () => {
//   if (!taskForm.value.title.trim()) {
//     alert('Task title required')
//     return
//   }
 
//   try {
//     await ApiService.post('tasks', {
//       action: 'create',
//       project_id: projectId,
//       title: taskForm.value.title,
//       description: taskForm.value.description,
//       status: taskForm.value.status,
//       priority: taskForm.value.priority,
//       start_date: taskForm.value.start_date,
//       due_date: taskForm.value.due_date,
//       team_id: taskForm.value.team_id,
//       assignee_ids: taskForm.value.assignee_ids
//     })
 
//     openNewTask.value = false
 
//     // Reset form but preserve project_id and active status
//     taskForm.value = {
//       title: '',
//       description: '',
//       status: activeStatus.value,
//       priority: 'medium',
//       project_id: projectId,
//       team_id: null,
//       start_date: null,
//       due_date: null,
//       assignee_ids: []
//     }
 
//     await fetchTasks()
//   } catch (err) {
//     console.error('❌ Error creating task:', err)
//   }
// }


const createTask = async () => {
  try {
    if (!taskForm.value.title.trim()) {
      alert('Task Title required')
      return
    }
    const payload = {
      action: 'create',
      project_id: projectId,
      title: taskForm.value.title,
      description: taskForm.value.description,
      status: taskForm.value.status,
      priority: taskForm.value.priority,
      start_date: taskForm.value.start_date,
      due_date: taskForm.value.due_date,
      team_id: taskForm.value.team_id,
      assignee_ids: taskForm.value.assignee_ids
    }
    const response = await ApiService.post('tasks', payload)

    openNewTask.value = false

    console.log('payload', payload)
    console.log('Created:', response.data)
 
    // Reset form but preserve project_id and active status
    taskForm.value = {
      title: '',
      description: '',
      status: activeStatus.value, 
      priority: 'medium',
      project_id: projectId,
      team_id: null,
      start_date: null,
      due_date: null,
      assignee_ids: []
    }

    await fetchTasks()
  } catch (error){
    console.log('Error creating task', error)
  }

}
 
// ─── Edit / Delete ───────────────────────────────────────────────────────────
 
const openTask = (task) => {
  console.log('Opened task:', task)
  // hook up your detail panel / drawer here
}
 
const editTask = (task) => {
  console.log('Edit task:', task)
  // populate taskForm and open edit dialog here
}
 
const deleteTask = async (taskId) => {
  try {
    await ApiService.post('tasks', {
      action: 'delete',
      task_id: taskId
    })
    await fetchTasks()
  } catch (err) {
    console.error('❌ Error deleting task:', err)
  }
}
 
// ─── Lifecycle ───────────────────────────────────────────────────────────────
 
onMounted(() => {
  fetchTasks()
})
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
          <div class="p-4 flex items-center justify-between">
            <div class="flex items-center gap-3">
              <div class="w-3 h-3 rounded-full bg-gray-400"></div>
              <h2 class="font-semibold text-gray-800">Todo</h2>
              <span class="text-xs bg-white px-2 py-1 rounded-full text-gray-500">
                {{ tasks.todo.length }}
              </span>
            </div>
            <button
              @click="showNewTask('todo')"
              class="w-8 h-8 rounded-xl hover:bg-white transition flex items-center justify-center"
            >
              +
            </button>
          </div>
 
          <div class="px-3 pb-3 flex-1 overflow-y-auto">
            <TaskForm
              v-if="openNewTask && activeStatus === 'todo'"
              :task-form="taskForm"
              :loading="loading"
              @save="createTask"
              @cancel="openNewTask = false"
            />
 
            <!-- SKELETON -->
            <template v-if="loading">
              <div v-for="i in 3" :key="i" class="bg-white rounded-3xl p-4 mb-4">
                <div class="flex justify-between items-start mb-6">
                  <div class="h-7 w-20 rounded-full bg-gray-200"></div>
                  <div class="flex gap-1">
                    <div class="w-1 h-1 rounded-full bg-gray-300"></div>
                    <div class="w-1 h-1 rounded-full bg-gray-300"></div>
                    <div class="w-1 h-1 rounded-full bg-gray-300"></div>
                  </div>
                </div>
                <div class="h-6 w-32 bg-gray-200 rounded mb-6"></div>
                <div class="flex gap-6 mb-6">
                  <div class="h-4 w-10 bg-gray-200 rounded"></div>
                  <div class="h-4 w-10 bg-gray-200 rounded"></div>
                </div>
                <div class="h-5 w-24 bg-gray-200 rounded"></div>
              </div>
            </template>
 
            <!-- REAL CARDS -->
            <template v-else>
              <div
                v-for="task in tasks.todo"
                :key="task.id"
                @click="openTask(task)"
                class="bg-white rounded-3xl p-4 mb-4 shadow-sm hover:shadow-md transition cursor-pointer"
              >
                <div class="flex items-start justify-between">
                  <span
                    class="text-xs px-3 py-1 rounded-full font-medium"
                    :class="{
                      'bg-red-100 text-red-600': task.priority === 'high',
                      'bg-yellow-100 text-yellow-600': task.priority === 'medium',
                      'bg-green-100 text-green-600': task.priority === 'low'
                    }"
                  >{{ task.priority }}</span>
                  <v-menu>
                    <template #activator="{ props }">
                      <button v-bind="props" class="text-gray-400">•••</button>
                    </template>
                    <v-list>
                      <v-list-item @click.stop="editTask(task)">
                        <v-list-item-title>Edit</v-list-item-title>
                      </v-list-item>
                      <v-list-item @click.stop="deleteTask(task.id)">
                        <v-list-item-title>Delete</v-list-item-title>
                      </v-list-item>
                    </v-list>
                  </v-menu>
                </div>
                <h3 class="font-semibold text-gray-900 mt-4">{{ task.title }}</h3>
                <p class="text-sm text-gray-500 mt-2 line-clamp-3">{{ task.description }}</p>
                <div class="mt-5 flex items-center gap-4 text-sm text-gray-500">
                  <span>💬 {{ task.comment_count || 0 }}</span>
                  <span>📎 {{ task.attachment_count || 0 }}</span>
                </div>
                <div class="mt-4 text-sm font-medium text-red-500">
                  {{ task.due_date || 'No due date' }}
                </div>
              </div>
            </template>
          </div>
        </div>
 
        <!-- IN PROGRESS -->
        <div class="w-[340px] min-w-[340px] bg-[#edf1f7] rounded-3xl flex flex-col">
          <div class="p-4 flex items-center justify-between">
            <div class="flex items-center gap-3">
              <div class="w-3 h-3 rounded-full bg-blue-500"></div>
              <h2 class="font-semibold text-gray-800">In Progress</h2>
              <span class="text-xs bg-white px-2 py-1 rounded-full text-gray-500">
                {{ tasks.in_progress.length }}
              </span>
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
 
            <!-- SKELETON -->
            <template v-if="loading">
              <div v-for="i in 3" :key="i" class="bg-white rounded-3xl p-4 mb-4">
                <div class="flex justify-between items-start mb-6">
                  <div class="h-7 w-20 rounded-full bg-gray-200"></div>
                  <div class="flex gap-1">
                    <div class="w-1 h-1 rounded-full bg-gray-300"></div>
                    <div class="w-1 h-1 rounded-full bg-gray-300"></div>
                    <div class="w-1 h-1 rounded-full bg-gray-300"></div>
                  </div>
                </div>
                <div class="h-6 w-32 bg-gray-200 rounded mb-6"></div>
                <div class="flex gap-6 mb-6">
                  <div class="h-4 w-10 bg-gray-200 rounded"></div>
                  <div class="h-4 w-10 bg-gray-200 rounded"></div>
                </div>
                <div class="h-5 w-24 bg-gray-200 rounded"></div>
              </div>
            </template>
 
            <!-- REAL CARDS -->
            <template v-else>
              <div
                v-for="task in tasks.in_progress"
                :key="task.id"
                @click="openTask(task)"
                class="bg-white rounded-3xl p-4 mb-4 shadow-sm hover:shadow-md transition cursor-pointer"
              >
                <div class="flex items-start justify-between">
                  <span
                    class="text-xs px-3 py-1 rounded-full font-medium"
                    :class="{
                      'bg-red-100 text-red-600': task.priority === 'high',
                      'bg-yellow-100 text-yellow-600': task.priority === 'medium',
                      'bg-green-100 text-green-600': task.priority === 'low'
                    }"
                  >{{ task.priority }}</span>
                  <v-menu>
                    <template #activator="{ props }">
                      <button v-bind="props" class="text-gray-400">•••</button>
                    </template>
                    <v-list>
                      <v-list-item @click.stop="editTask(task)">
                        <v-list-item-title>Edit</v-list-item-title>
                      </v-list-item>
                      <v-list-item @click.stop="deleteTask(task.id)">
                        <v-list-item-title>Delete</v-list-item-title>
                      </v-list-item>
                    </v-list>
                  </v-menu>
                </div>
                <h3 class="font-semibold text-gray-900 mt-4">{{ task.title }}</h3>
                <p class="text-sm text-gray-500 mt-2 line-clamp-3">{{ task.description }}</p>
                <div class="mt-5 flex items-center gap-4 text-sm text-gray-500">
                  <span>💬 {{ task.comment_count || 0 }}</span>
                  <span>📎 {{ task.attachment_count || 0 }}</span>
                </div>
                <div class="mt-4 text-sm font-medium text-red-500">
                  {{ task.due_date || 'No due date' }}
                </div>
              </div>
            </template>
          </div>
        </div>
 
        <!-- DONE -->
        <div class="w-[340px] min-w-[340px] bg-[#edf1f7] rounded-3xl flex flex-col">
          <div class="p-4 flex items-center justify-between">
            <div class="flex items-center gap-3">
              <div class="w-3 h-3 rounded-full bg-green-500"></div>
              <h2 class="font-semibold text-gray-800">Done</h2>
              <span class="text-xs bg-white px-2 py-1 rounded-full text-gray-500">
                {{ tasks.done.length }}
              </span>
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
 
            <!-- SKELETON -->
            <template v-if="loading">
              <div v-for="i in 3" :key="i" class="bg-white rounded-3xl p-4 mb-4">
                <div class="flex justify-between items-start mb-6">
                  <div class="h-7 w-20 rounded-full bg-gray-200"></div>
                  <div class="flex gap-1">
                    <div class="w-1 h-1 rounded-full bg-gray-300"></div>
                    <div class="w-1 h-1 rounded-full bg-gray-300"></div>
                    <div class="w-1 h-1 rounded-full bg-gray-300"></div>
                  </div>
                </div>
                <div class="h-6 w-32 bg-gray-200 rounded mb-6"></div>
                <div class="flex gap-6 mb-6">
                  <div class="h-4 w-10 bg-gray-200 rounded"></div>
                  <div class="h-4 w-10 bg-gray-200 rounded"></div>
                </div>
                <div class="h-5 w-24 bg-gray-200 rounded"></div>
              </div>
            </template>
 
            <!-- REAL CARDS -->
            <template v-else>
              <div
                v-for="task in tasks.done"
                :key="task.id"
                @click="openTask(task)"
                class="bg-white rounded-3xl p-4 mb-4 shadow-sm hover:shadow-md transition cursor-pointer"
              >
                <div class="flex items-start justify-between">
                  <span
                    class="text-xs px-3 py-1 rounded-full font-medium"
                    :class="{
                      'bg-red-100 text-red-600': task.priority === 'high',
                      'bg-yellow-100 text-yellow-600': task.priority === 'medium',
                      'bg-green-100 text-green-600': task.priority === 'low'
                    }"
                  >{{ task.priority }}</span>
                  <v-menu>
                    <template #activator="{ props }">
                      <button v-bind="props" class="text-gray-400">•••</button>
                    </template>
                    <v-list>
                      <v-list-item @click.stop="editTask(task)">
                        <v-list-item-title>Edit</v-list-item-title>
                      </v-list-item>
                      <v-list-item @click.stop="deleteTask(task.id)">
                        <v-list-item-title>Delete</v-list-item-title>
                      </v-list-item>
                    </v-list>
                  </v-menu>
                </div>
                <h3 class="font-semibold text-gray-900 mt-4">{{ task.title }}</h3>
                <p class="text-sm text-gray-500 mt-2 line-clamp-3">{{ task.description }}</p>
                <div class="mt-5 flex items-center gap-4 text-sm text-gray-500">
                  <span>💬 {{ task.comment_count || 0 }}</span>
                  <span>📎 {{ task.attachment_count || 0 }}</span>
                </div>
                <div class="mt-4 text-sm font-medium text-red-500">
                  {{ task.due_date || 'No due date' }}
                </div>
              </div>
            </template>
          </div>
        </div>
 
      </div>
    </div>
  </MainLayout>
</template>
