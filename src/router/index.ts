import Dashboard from '@/views/Dashboard.vue'
// import SignInPage from '@/views/Auth/SignInPage.vue'
import LoginPage from '@/views/Auth/LoginPage.vue'
import Attendance from '@/views/Attendance.vue'
import BrowseProjects from '@/views/BrowseProjects.vue'
import MyTasks from '@/views/MyTasks.vue'
import { createRouter, createWebHistory } from 'vue-router'
import Supplies from '@/views/Supplies.vue'

// import LoginForm from '@/views/Auth/LoginForm.vue'

// import Login from '@/views/Auth/Login.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'loginpage',
      component: LoginPage
    },
    {
      path: '/browseProjects',
      name: 'browse',
      component: BrowseProjects
    },
    // {
    //   path: '/signin',
    //   name: 'SignIn',
    //   component: SignInPage
    // },
    {
      path: '/dashboard',
      name: 'dashboard',
      component: Dashboard
    },
    {
      path: '/attendance',
      name: 'attendance',
      component: Attendance
    },
    {
      path: '/tasks',
      name: 'tasks',
      component: MyTasks
    },
    {
      path: '/supplies',
      name: 'supplies',
      component: Supplies
    }
  ]
})

export default router
