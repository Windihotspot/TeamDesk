<template>
  <div class="dash-sidebar mt-6">

    <ul class="dash-menu mt-6">
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
    nav: 'Projects',
    label: 'Projects',
    icon: 'mdi mdi-domain',
    route: '/browseProjects'
    
  },
 
  {
    nav: 'Attendance',
    label: 'Attendance',
    icon: 'mdi mdi-domain',
    route: '/attendance'
    
  },

  {
    nav: 'MyTasks',
    label: 'MyTasks',
    icon: 'mdi mdi-domain',
    route: '/tasks'
    
  },
 
]

</script>

<style scoped>
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
