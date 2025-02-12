import { createRouter, createWebHistory } from 'vue-router/auto';
import { setupLayouts } from 'virtual:generated-layouts';
import { routes } from 'vue-router/auto-routes';
import Login from '@/pages/login.vue';

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: setupLayouts([
    {
      path: '/login',
      name: 'Login',
      component: Login,
      meta: { layout: 'LoginLayout' }, // Specify the layout for login page
    },
    {
      path: '/',
      name: 'Dashboard',
      component: () => import('@/pages/index.vue'),
      meta: { requiresAuth: true }, // Protect this route
    },
  ]),
});

// Navigation Guard to protect routes
router.beforeEach((to, from, next) => {
  const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
  console.log('isAuthenticated', isAuthenticated)
  // If route requires authentication and user is not logged in, redirect to login page
  if (to.meta.requiresAuth && !isAuthenticated) {
    next({ name: 'Login' });
  } else {
    next(); // Proceed with navigation
  }
});

// Workaround for dynamic import errors in Vite
router.onError((err, to) => {
  if (err?.message?.includes?.('Failed to fetch dynamically imported module')) {
    if (!localStorage.getItem('vuetify:dynamic-reload')) {
      console.log('Reloading page to fix dynamic import error');
      localStorage.setItem('vuetify:dynamic-reload', 'true');
      location.assign(to.fullPath);
    } else {
      console.error('Dynamic import error, reloading did not fix it', err);
    }
  } else {
    console.error(err);
  }
});

router.isReady().then(() => {
  localStorage.removeItem('vuetify:dynamic-reload'); // Clean up reload flag
});

export default router;
