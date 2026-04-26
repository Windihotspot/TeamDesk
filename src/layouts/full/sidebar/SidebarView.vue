<template>
  <div class="dash-sidebar flex flex-col h-full">
    <!-- TOP MENU -->
    <ul class="dash-menu mt-6 flex-1">
      <li
        v-for="item in menuItems"
        class="mt-4"
        :key="item.nav"
        :class="{ active: isActive(item) }"
        @click="router.push(item.route)"
      >
        <i :class="item.icon"></i>
        {{ item.label }}
      </li>
    </ul>

    <!-- BOTTOM ACTIONS -->
    <div class="dash-bottom">
      <ul class="dash-menu">
        <li class="logout" @click="signOut">
          <i class="mdi mdi-logout"></i>
          Logout
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()

const activeNav = ref('home')
const isActive = (item) => {
  return route.path === item.route || route.path.startsWith(item.route + '/')
}

const setView = (nav: string, e: Event) => {
  activeNav.value = nav
  showDashView(nav)
}

const showDashView = (nav: string) => {
  // replace with your real view logic
  console.log('switch view:', nav)
}

const signOut = () => {
  router.push('/')
}

/**
 * EXACT SVG STRINGS from your original HTML
 * (kept minimal for clarity but still identical usage)
 */
const menuItems = [
  {
    nav: 'dashboard',
    label: 'Dashboard',
    icon: 'mdi mdi-view-dashboard-outline',
    route: '/dashboard'
  },
  {
    nav: 'projects',
    label: 'Projects',
    icon: 'mdi mdi-briefcase-outline',
    route: '/browseProjects'
  },
  {
    nav: 'tasks',
    label: 'Tasks',
    icon: 'mdi mdi-format-list-checkbox',
    route: '/tasks'
  },
  {
    nav: 'supplies',
    label: 'Supplies',
    icon: 'mdi mdi-package-variant',
    route: '/supplies'
  },
  {
    nav: 'attendance',
    label: 'Attendance',
    icon: 'mdi mdi-calendar-check-outline',
    route: '/attendance'
  },

  {
    nav: 'profile',
    label: 'Profile',
    icon: 'mdi mdi-account-circle-outline',
    route: '/profile'
  },
  {
    nav: 'settings',
    label: 'Settings',
    icon: 'mdi mdi-cog-outline',
    route: '/settings'
  }
]
</script>

<style scoped>
.dash-sidebar {
  width: 260px;
  padding: 18px;
  background: var(--primary);
  height: 100vh;
  display: flex;
  flex-direction: column;
}

/* pushes logout to bottom */
.dash-bottom {
  margin-top: auto;
  padding-top: 12px;
}

/* logout styling */
.logout {
  color: #f87171 !important;
  font-weight: 500;
}

.logout:hover {
  background: rgba(239, 68, 68, 0.15) !important;
  color: #fff !important;
}
.dash-menu li i {
  font-size: 18px;
  width: 18px;
  height: 18px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}
.dash-sidebar {
  width: 260px;
  padding: 18px;
  background: var(--primary);

  /* KEY FIX */
  height: 100vh;
  display: flex;
  flex-direction: column;
}

/* SECTION LABEL */
.dash-menu-section {
  font-size: 11px;
  font-weight: 600;
  color: #9aa0a6;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  margin: 16px 8px 10px;
}

/* MENU LIST */

/* MENU ITEM */
.dash-menu li {
  display: flex;
  align-items: center;
  gap: 10px;

  padding: 10px 12px;
  border-radius: 12px;
  cursor: pointer;

  font-size: 14px;
  color: rgba(255, 255, 255, 0.7);

  transition: all 0.2s ease;
}

/* ICON */
.dash-menu li svg {
  width: 18px;
  height: 18px;
  flex-shrink: 0;
}

/* HOVER */
.dash-menu li:hover {
  background: rgba(255, 255, 255, 0.08);
  color: #fff;
}

/* ACTIVE STATE (THIS IS THE BIG ONE) */
.dash-menu li.active {
  background: linear-gradient(135deg, #0f4c81, #2563eb);
  color: #fff;
  font-weight: 600;
}

.dash-menu li.active i {
  color: #fff;
}

/* ACTIVE ICON COLOR */
.dash-menu li.active svg {
  color: #0b749e;
}

/* CREDIT CARD MATCHING IMAGE STYLE */
.dash-sidebar > div[style*='var(--grad)'] {
  border-radius: 16px;
  margin-top: 24px;
}
</style>
