import Dashboard from '@/views/Dashboard.vue'
// import SignInPage from '@/views/Auth/SignInPage.vue'
import LoginPage from '@/views/Auth/LoginPage.vue'
import Attendance from '@/views/Attendance.vue'
import BrowseProjects from '@/views/BrowseProjects.vue'
import { createRouter, createWebHistory } from 'vue-router'

<<<<<<< HEAD

// import LoginForm from '@/views/Auth/LoginForm.vue'
import MyTasks from '@/views/MyTasks.vue'
=======
import Login from '@/views/Auth/Login.vue'
import Tasks from '@/views/Tasks.vue'
>>>>>>> 4b3aa9b99549cec9ed735bea740c99dd74294248

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
<<<<<<< HEAD
      component: MyTasks
=======
      component: Tasks
>>>>>>> 4b3aa9b99549cec9ed735bea740c99dd74294248
    }
  ]
})

export default router
