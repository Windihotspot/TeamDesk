import HomePage from '@/views/HomePage.vue'
import SignInPage from '@/views/Auth/SignInPage.vue'
import LoginPage from '@/views/Auth/LoginPage.vue'
import BrowseProjects from '@/views/BrowseProjects.vue'
import { createRouter, createWebHistory } from 'vue-router'
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
    }
    // {
    //   path: '/login',
    //   name: 'Login',
    //   component: LoginPage
    // }
  ]
})

import { useAuthStore } from '@/stores/auth'

router.beforeEach((to, from, next) => {
  const auth = useAuthStore()

  if (to.meta.requiresAuth && !auth.isAuthenticated) {
    return next('/login')
  }

  next()
})

export default router
