import HomePage from '@/views/HomePage.vue'
import SignInPage from '@/views/Auth/SignInPage.vue'
import LoginPage from '@/views/Auth/LoginPage.vue'
import BrowseProjects from '@/views/BrowseProjects.vue'
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
      path: '/browseProjects',
      name: 'browse',
      component: BrowseProjects,
    },
    {
      path: '/signin',
      name: 'SignIn',
      component: SignInPage
    },
    {
      path: '/login',
      name: 'Login',
      component: LoginPage
    }
    
  ]
})

export default router
