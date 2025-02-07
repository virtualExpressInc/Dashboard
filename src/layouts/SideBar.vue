<template>
  <v-navigation-drawer v-model="drawer" :rail="rail" permanent :elevation="0" expand-on-hover @click="rail = false">
    <v-list class="bg-primary border">
      <v-list-item>
        <template v-slot:prepend v-if="rail === true" >
          <v-avatar rounded="0" size="35">
            <v-img height="40" :src="VeiIcon" />
          </v-avatar>
        </template>
        <v-list-title v-if="rail === false">
          <v-img height="40" :src="VeiLogo" />
        </v-list-title>
        <template v-slot:append>
          <v-btn @click.stop="rail = !rail" size="small" variant="text" :icon="rail === false ? 'mdi-chevron-left' : 'mdi-chevron-right'"></v-btn>
        </template>
      </v-list-item>
    </v-list>
    <v-divider />
  </v-navigation-drawer>
</template>

<script setup lang="ts">
import { computed, ref, onMounted, onUnmounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import VeiIcon from '../assets/vei-icon.png';
import VeiLogo from '../assets/vei-logo.png';

interface RouteItem {
  path: string;
  name: string;
  icon: string;
  children?: RouteItem[];
}

const route = useRoute();
const router = useRouter();
const drawer = ref(true);
const rail = ref(window.innerWidth <= 768); // Set rail to true if window width is 768px or less
const navItems = ref<RouteItem[]>([]);
const isLoading = ref(true);

const updateRailOnResize = () => {
  rail.value = window.innerWidth <= 768;
};

onMounted(() => {
  window.addEventListener('resize', updateRailOnResize);

  setTimeout(() => {
    isLoading.value = false;
  }, 1500);
});

onUnmounted(() => {
  window.removeEventListener('resize', updateRailOnResize);
});

const isChildActive = (routeItem: RouteItem) => {
  return routeItem.children?.some((child) => route.name === child.name);
};

const flattenRoutes = (routes: any): RouteItem[] => {
  let flattenedRoutes: RouteItem[] = [];
  routes.forEach((route: any) => {
    flattenedRoutes.push({
      path: route.path,
      name: route.name || '',
      icon: route.icon,
      children: route.children ? flattenRoutes(route.children) : []
    });
    if (route.children && route.children.length > 0) {
      const childRoutes = flattenRoutes(route.children);
      flattenedRoutes = flattenedRoutes.concat(childRoutes);
    }
  });
  return flattenedRoutes;
};

const routes = computed(() => {
  const rootRoute = router.getRoutes().find((r) => r.path === '/');
  if (rootRoute && rootRoute.children) {
    const navRoutes = rootRoute.children
      .filter((child) => child.meta && child.meta.isNav)
      .map((child) => ({
        path: child.path,
        name: child.name || '',
        icon: child?.icon,
        children: child.children ? flattenRoutes(child.children) : []
      }));
    return navRoutes;
  }
  return [];
});

</script>
<style>
.v-navigation-drawer {
  border: none !important;
}
</style>
