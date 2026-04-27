<script setup>
import MainLayout from '@/layouts/full/MainLayout.vue'
import { supabase } from '@/services/supabase.js'

// const projects = [
//   { name: "Starlight Initiative", tasks: "2 Tasks due soon", color: "bg-orange-500" },
//   { name: "Project Zenith", tasks: "4 Tasks due soon", color: "bg-blue-500" },
//   { name: "Evergreen Project", tasks: "1 Task due soon", color: "bg-green-500" },
//   { name: "Capstone Initiative", tasks: "8 Tasks due soon", color: "bg-lime-500" },
//   { name: "Project Phoenix", tasks: "3 Tasks due soon", color: "bg-red-500" },
//   { name: "Project Chimera", tasks: "No tasks", color: "bg-gray-800" },
// ];

// const members = [
//   {
//     name: "Elowen Frost",
//     email: "elowen.frost@email.com",
//     avatar: "https://i.pravatar.cc/40?img=1",
//   },
//   {
//     name: "Jasper Thorne",
//     email: "jasper.thorne@email.com",
//     avatar: "https://i.pravatar.cc/40?img=2",
//   },
//   {
//     name: "Willow Briar",
//     email: "willow.briar@email.com",
//     avatar: "https://i.pravatar.cc/40?img=3",
//   },
//   {
//     name: "Silas Blackwood",
//     email: "silas.blackwood@email.com",
//     avatar: "https://i.pravatar.cc/40?img=4",
//   },
//   {
//     name: "Luna Sterling",
//     email: "luna.sterling@email.com",
//     avatar: "https://i.pravatar.cc/40?img=5",
//   },
//   {
//     name: "Griffin Wilde",
//     email: "griffin.wilde@email.com",
//     avatar: "https://i.pravatar.cc/40?img=6",
//   },
// ];

import { ref, onMounted, computed } from 'vue'
import { useAuthStore } from '@/stores/auth.js'
import { useProjectStore } from '@/stores/project.js'

//declare var for authStore in auth.js
const authStore = useAuthStore()
const projectStore = useProjectStore()

const user = computed(() => authStore.user)
console.log(user)

const isEditMode = ref(false)

const projects = ref([])

const showProjects = ref(false)


//make the form an empty array first
const form = ref({
  name: '',
  team_id: '',
  description: '',
  status: 'active'
})


//@click of add projects
const openAddProjects = () => {
  showProjects.value = true
}

//@click submit new projects
const submitProject = async () => {
  try {
    await projectStore.createProject(form.value)
    console.log('✅ Project created')
    showProjects.value = false // close dialog after save
    form.value = { name: '', team_id: null, description: '', status: 'active' } // reset form
  } catch (err) {
    console.error('❌ Error:', err.message)
  }
}


const isLoading = ref(true)




//on load of projects page :added a loading feature to it 
const fetchProject = async () => {
  isLoading.value = true

  try {
    const { data, error } = await supabase.from('projects').select('*')
    console.log('Projects:', data)
    if (!error) {
      projects.value = data
    }
  } catch (err) {
    console.error(err)
  } finally {
    isLoading.value = false
  }
}

onMounted(() => {
  fetchProject()
})

//shows teams dropdown as an empty array
const teams = ref([])


//func to get already existing teams from supabase
const getTeams = async () => {
  //checks if user is logged in
  if (!user.value) return
  try {
    const { data, error } = await supabase.from('teams').select('*')

    // returns/shows teams from supabase
    teams.value = data 

    if (error) throw error

    console.log('teams', data)
    return data
  } catch (error) {
    console.log('error fetching teams: ', error)
  }
}

const showTeamMembers = ref(false)

const formTeam = ref({
  name: '',
  projects: ''
})

const openAddTeams = async () => {
  showTeamMembers.value = true
}

onMounted(async () => {
  if (!authStore.user) {
    await authStore.fetchSession()
  }
  await getTeams()
})
</script>

<template>
  <MainLayout>
    <div
      v-if="isLoading"
      class="fixed inset-0 bg-white/80 backdrop-blur-sm flex flex-col items-center justify-center z-50"
    >
      <v-progress-circular indeterminate color="blue" size="60" width="2" />

      <p class="mt-4 text-sm text-gray-500 font-medium">Loading Project data...</p>
    </div>

    <div v-else>
      <div class="grid grid-cols-1 lg:grid-cols-1 ">
        <!-- Active Projects -->
        <v-card class="rounded-2xl shadow-sm pa-4">
          <div class="flex justify-between items-center mb-4">
            <h2 class="font-bold text-md">Browse Projects</h2>

            <div class="flex items-center gap-2">
              <v-select
                density="compact"
                variant="outlined"
                hide-details
                class="w-34"
                :items="['Due Date', 'Name']"
                model-value="Due Date"
              />
              <v-btn @click="openAddProjects" icon size="small" class="text-black rounded-lg">
                <v-icon>mdi-plus</v-icon>
              </v-btn>
              <v-btn icon size="small" variant="text">
                <v-icon>mdi-dots-vertical</v-icon>
              </v-btn>
            </div>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-1">
            <div
              v-for="project in projects"
              :key="project.id"
              class="flex items-center justify-between bg-gray-50 rounded-xl p-3"
            >
              <div class="flex items-center gap-3">
                <div class="w-8 h-8 rounded-md"></div>
                <div>
                  <p class="font-medium text-sm">{{ project.name }}</p>
                  <p class="text-xs text-gray-500">
                    {{ project.description }}
                  </p>
                </div>
              </div>
              <v-icon size="18">mdi-dots-vertical</v-icon>
            </div>
          </div>
        </v-card>
      </div>
    </div>

    <!-- ✅ Projects Add Dialog -->
    <v-dialog v-model="showProjects" max-width="500px" persistent>
      <v-card class="p-4">
        <v-card-title class="text-lg font-semibold">
          {{ isEditMode ? 'Edit Projects Record' : 'Add Projects Record' }}
        </v-card-title>

        <v-card-text>
          <v-form ref="formRef" v-model="formValid" lazy-validation :disabled="submitting">
            <v-text-field
              v-model="form.name"
              :items="projectsName"
              label="Projects Name"
              variant="outlined"
              color="green"
            />

            <v-select
              v-model="form.team_id"
              :items="teams"
              item-title="name"
              item-value="id"
              label="Select Team"
              variant="outlined"
              class="mt-3"
            />

            <v-textarea
              v-model="form.description"
              label="Description"
              rows="2"
              variant="outlined"
              color="green"
              class="mt-3"
            />
          </v-form>
        </v-card-text>

        <v-card-actions class="justify-end space-x-2">
          <v-btn text color="grey" @click="showProjects = false">Cancel</v-btn>
          <v-btn
            :loading="submitting"
            color="green"
            @click="submitProject"
            
            >Save</v-btn
          >
        </v-card-actions>
      </v-card>
    </v-dialog>
  </MainLayout>
</template>
