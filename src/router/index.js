import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView
    },
    {
      path: '/bulkdelete',
      name: 'Bulk Delete',
      component: () => import('../views/BulkDelete.vue')
    },
    {
      path: '/auspostops',
      name: 'Auspost Ops',
      component: () => import('../views/AuspostOps.vue')
    },
    // {
    //   path: '/formtest',
    //   name: 'Form Test',
    //   component: () => import('../views/FormTest.vue')
    // }
  ]
})

export default router
