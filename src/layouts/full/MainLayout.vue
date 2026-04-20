<script setup>
import { ref, onMounted } from 'vue'
import SidebarView from './sidebar/SidebarView.vue'
const drawer = ref()
const innerW = window.innerWidth
import { useDisplay } from 'vuetify'

const { mdAndUp } = useDisplay()

onMounted(() => {
  drawer.value = mdAndUp.value // open on desktop, closed on mobile
})
</script>

<template>
  <v-app>
    <!--- Header -->
    <!-- ---------------------------------------------- -->
   
    <!-- ---------------------------------------------- -->
    <!--- Sidebar -->
    <!-- ---------------------------------------------- -->
    <v-navigation-drawer
      v-model="drawer"
      app
      :permanent="$vuetify.display.mdAndUp"
      :temporary="$vuetify.display.smAndDown"
      location="left"
      scrim="rgba(0,0,0,0.4)"
      class="side-bar"
    >
       <SidebarView />
    </v-navigation-drawer>

    <!-- ---------------------------------------------- -->

    <!-- ---------------------------------------------- -->
    <!--- Page Wrapper -->
    <!-- 🔥 Floating Menu Button (Mobile Only) -->
    <div>
      <v-icon
        class="fixed top-4 left-4 z-[2100] text-blue md:hidden"
        @click="drawer = !drawer"
        icon="mdi-menu"
      />
    </div>
    <!-- ---------------------------------------------- -->
    <v-main class="page-wrapper">
      <v-container fluid class="page-wrapper bg-blue-30">
        <slot />
      </v-container>
    </v-main>
  </v-app>
</template>

<style scoped>
.side-bar {
  z-index: 2000 !important;
  background: var(--primary);
}
.side-bar {
  overflow: hidden !important;
  background: var(--primary);
}

.side-bar::-webkit-scrollbar {
  display: none; /* Chrome, Safari */
}

.settings-icon {
  position: fixed;
  bottom: 16px;
  right: 16px;
  font-size: 36px;
  color: #121621;
  animation: rotate 5s linear infinite;
}

@keyframes rotate {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
</style>
