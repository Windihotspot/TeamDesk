import Dashboard from '@/views/Dashboard.vue'
// import SignInPage from '@/views/Auth/SignInPage.vue'
import LoginPage from '@/views/Auth/LoginPage.vue'
import Attendance from '@/views/Attendance.vue'
import BrowseProjects from '@/views/BrowseProjects.vue'
import MyTasks from '@/views/MyTasks.vue'
import { createRouter, createWebHistory } from 'vue-router'
import Supplies from '@/views/Supplies.vue'
import Profile from '@/views/Profile.vue'
import SuppliersPage from '@/views/SuppliersPage.vue'
import SuppliesRequests from '@/views/SuppliesRequests.vue'
import SuppliesApproval from '@/views/SuppliesApproval.vue'
import PurchaseOrders from '@/views/PurchaseOrders.vue'
import SuppliesDeliveries from '@/views/SuppliesDeliveries.vue'
import SuppliesPayment from '@/views/SuppliesPayment.vue'
import TeamsPage from '@/views/TeamsPage.vue'

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
    },
    {
      path: '/profile',
      name: 'profile',
      component: Profile
    },
    {
      path: '/suppliers',
      name: 'suppliers',
      component: SuppliersPage
    },
    {
      path: '/supplies-requests',
      name: 'supplies-requests',
      component: SuppliesRequests
    },
    {
      path: '/supplies-approvals',
      name: 'supplies-approvals',
      component: SuppliesApproval
    },
    {
      path: '/supplies-deliveries',
      name: 'supplies-deliveries',
      component: SuppliesDeliveries
    },
    {
      path: '/purchase-orders',
      name: 'purchase-orders',
      component: PurchaseOrders
    },
    {
      path: '/payments',
      name: 'payments',
      component: SuppliesPayment
    },
    {
      path: '/teams',
      name: 'teams',
      component: TeamsPage
    },
    {
      path: '/projects/:id',
      name: 'ProjectDetails',
      component: () => import('@/views/ProjectDetails.vue')
    }
  ]
})

export default router
