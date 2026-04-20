import Dashboard from '@/views/Dashboard.vue'
import SignInPage from '@/views/Auth/SignInPage.vue'
import LoginPage from '@/views/Auth/LoginPage.vue'
import BrowseProjects from '@/views/BrowseProjects.vue'
import { createRouter, createWebHistory } from 'vue-router'
import Attendance from '@/views/Attendance.vue'

import Login from '@/views/Auth/Login.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'login',
      component: Login
    },
    {
      path: '/browseProjects',
      name: 'browse',
      component: BrowseProjects
    },
    {
      path: '/signin',
      name: 'SignIn',
      component: SignInPage
    },
    {
      path: '/dashboard',
      name: 'dashboard',
      component: Dashboard
    }
    ,
    {
      path: '/attendance',
      name: 'attendance',
      component: Attendance
    }
  ]
})

export default router
