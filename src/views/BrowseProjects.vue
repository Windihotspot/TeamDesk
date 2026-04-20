<script setup>
import MainLayout from '@/layouts/full/MainLayout.vue'


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
              <v-btn icon size="small" class="text-black rounded-lg ">
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
              <v-btn icon size="small" class="text-black rounded-lg">
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
  </MainLayout>
</template>
