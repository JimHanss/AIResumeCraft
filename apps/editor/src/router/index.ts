import { createRouter, createWebHistory } from 'vue-router'
import ResumeWorkspace from '../components/ResumeWorkspace.vue'

export const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'editor',
      component: ResumeWorkspace,
      meta: {
        requiresAuth: false,
      },
    },
  ],
})

router.beforeEach((to) => {
  if (to.meta.requiresAuth)
    return '/'
})
