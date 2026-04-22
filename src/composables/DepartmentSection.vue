<script setup>
import { ref } from 'vue'

const open = ref(false)
const selectedTeam = ref('Select Team')

const teams = [
'Team Quidly',
  'Dev Team',
  'Sales Team',
  'Graphics Team',
  'Systems Admin'
]

const selectTeam = (team) => {
  selectedTeam.value = team
}
</script>

<template>
  <div class="relative inline-block w-25">
    <!-- Button -->
    <button
      @click="open = !open"
      class="w-full px-4 py-2 bg-gray-100 text-gray-600 text-sm border-gray-400 hover:bg-gray-300 rounded-xl flex justify-between items-center"
    >
      {{ selectedTeam }}
      <span>▼</span>
    </button>

    <!-- Dropdown -->
    <div
      v-if="open"
      class="absolute mt-2 w-full bg-white shadow-lg rounded-xl border"
    >
      <div
        v-for="team in teams"
        :key="team"
        @click="selectTeam(team); open = false"
        class="px-4 py-2 hover:bg-gray-100 cursor-pointer"
      >
        {{ team }}
      </div>
    </div>
  </div>
</template>