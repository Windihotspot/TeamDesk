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
  <v-select
            label="Teams"
            variant="outlined"
            density="compact"
            hide-details
            size="small"
            rounded="lg"
            class="filter-select"
            style="min-width: 80px; max-width: 200px"
            bg-color="white"
          />
</template>