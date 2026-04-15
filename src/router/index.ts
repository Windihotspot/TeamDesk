import Dashboard from '@/views/Dashboard.vue'
import HomePage from '@/views/HomePage.vue'
import { createRouter, createWebHistory } from 'vue-router'


const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomePage
    },
    {
      path: '/dashboard',
      name: 'dashboard',
      component: Dashboard
<<<<<<< HEAD
    }
=======
    },
>>>>>>> 3623b08aae478adb4e138207574e23e743b4e369
  ]
})

export default router
