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

import { ref, onMounted } from 'vue'

const isEditMode = ref(false)
const showProjects = ref(false)

const form = ref({
  projectsName: '',
  team_id: '',
  description: ''
})

const openAddProjects = async () => {
  showProjects.value = true
}

const getTeams = async () => {
  try {
    const { data, error } = await supabase.from('teams').select('*').eq('owner_id', user.id)

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

onMounted(() => {
  getTeams()
})
</script>

<template>
  <MainLayout>
    <div class="">
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
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

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div
              v-for="project in projects"
              :key="project.name"
              class="flex items-center justify-between bg-gray-50 rounded-xl p-3"
            >
              <div class="flex items-center gap-3">
                <div :class="project.color" class="w-8 h-8 rounded-md"></div>
                <div>
                  <p class="font-medium text-sm">{{ project.name }}</p>
                  <p class="text-xs text-gray-500">
                    {{ project.tasks }}
                  </p>
                </div>
              </div>
              <v-icon size="18">mdi-dots-vertical</v-icon>
            </div>
          </div>
        </v-card>

        <!-- Team Members -->
        <v-card class="rounded-2xl shadow-sm pa-4">
          <div class="flex justify-between items-center mb-4">
            <h2 class="font-bold text-md">Team Members</h2>

            <div class="flex items-center gap-2">
              <v-btn @click="openAddTeams" icon size="small" class="text-black rounded-lg">
                <v-icon>mdi-plus</v-icon>
              </v-btn>
              <v-btn icon size="small" variant="text">
                <v-icon>mdi-dots-vertical</v-icon>
              </v-btn>
            </div>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div
              v-for="member in members"
              :key="member.email"
              class="flex items-center justify-between bg-gray-50 rounded-xl p-3"
            >
              <div class="flex items-center gap-3">
                <v-avatar size="36">
                  <img :src="member.avatar" />
                </v-avatar>
                <div>
                  <p class="font-medium text-sm">{{ member.name }}</p>
                  <p class="text-xs text-gray-500">
                    {{ member.email }}
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
              v-model="form.projectsName"
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
            @click="getTeams"
            :disabled="!formValid || submitting"
            >Save</v-btn
          >
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog v-model="showTeamMembers" max-width="500px" persistent>
      <v-card class="p-4">
        <v-card-title class="text-lg font-semibold">
          {{ isEditMode ? 'Edit Teams Record' : 'Add Teams Record' }}
        </v-card-title>

        <v-card-text>
          <v-form ref="formRef" v-model="formValid" lazy-validation :disabled="submitting">
            <v-text-field
              v-model="formTeam.name"
              :items="name"
              label="Name"
              variant="outlined"
              color="green"
            />

            <v-select
              v-model="formTeam.projectsName"
              :items="projectsName"
              item-title="name"
              label="Projects Name"
              variant="outlined"
              color="green"
              class="mt-3"
            />
          </v-form>
        </v-card-text>

        <v-card-actions class="justify-end space-x-2">
          <v-btn text color="grey" @click="showTeamMembers = false">Cancel</v-btn>
          <v-btn
            :loading="submitting"
            color="green"
            @click="submitAttendance"
            :disabled="!formValid || submitting"
            >Save</v-btn
          >
        </v-card-actions>
      </v-card>
    </v-dialog>
  </MainLayout>
</template>
