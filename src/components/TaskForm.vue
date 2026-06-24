<script setup>
defineProps({
  loading: Boolean,
  taskForm: Object
})

const emit = defineEmits(['save', 'cancel'])
</script>

<template>
  <div class="bg-white rounded-3xl p-4 mb-4 border-2 border-dashed border-gray-200">
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
    <select
      v-model="taskForm.priority"
      class="mt-3 border rounded-lg p-2 w-full"
    >
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
        @click="$emit('save')"
        :disabled="loading"
        class="bg-[#5b2c52] text-white px-4 py-2 rounded-lg"
      >
        {{ loading ? 'Saving...' : 'Create Task' }}
      </button>

      <button
        @click="$emit('cancel')"
        class="border px-4 py-2 rounded-lg"
      >
        Cancel
      </button>
    </div>
  </div>
</template>