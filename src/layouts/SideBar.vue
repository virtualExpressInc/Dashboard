<template>
  <v-navigation-drawer v-model="drawer" :rail="rail" permanent :elevation="0" expand-on-hover @click="rail = false">
    <v-list class="bg-primary border">
      <v-list-item>
        <template v-slot:prepend v-if="rail === true">
          <v-avatar rounded="0" size="35">
            <v-img height="40" :src="VeiIcon" />
          </v-avatar>
        </template>
        <v-list-title v-if="rail === false">
          <v-img height="40" :src="VeiLogo" />
        </v-list-title>
        <template v-slot:append>
          <v-btn
            @click.stop="rail = !rail"
            size="small"
            variant="text"
            :icon="rail === false ? 'mdi-chevron-left' : 'mdi-chevron-right'"
          ></v-btn>
        </template>
      </v-list-item>
    </v-list>
    <v-divider />

    <v-list dense>
      <v-list-item
        v-for="item in navItems"
        :key="item.path"
        :to="item.path"
        :prepend-icon="item.icon"
        :active="route.path === item.path"
      >
        <v-list-item-title>{{ item.name }}</v-list-item-title>
      </v-list-item>
    </v-list>
  </v-navigation-drawer>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import { useRoute } from 'vue-router';
import VeiIcon from '../assets/vei-icon.png';
import VeiLogo from '../assets/vei-logo.png';

interface RouteItem {
  path: string;
  name: string;
  icon: string;
}

const route = useRoute();
const drawer = ref(true);
const rail = ref(window.innerWidth <= 768);

const navItems = ref<RouteItem[]>([
  { path: '/', name: 'Dashboard', icon: 'mdi-view-dashboard' },
  { path: '/clients', name: 'Clients', icon: 'mdi-account-group' },
  { path: '/members', name: 'Members', icon: 'mdi-account-multiple' },
  // { path: '/projects', name: 'Projects', icon: 'mdi-briefcase' },
  // { path: '/reports', name: 'Reports', icon: 'mdi-chart-bar' },
  // { path: '/settings', name: 'Settings', icon: 'mdi-cog' }
]);

const updateRailOnResize = () => {
  rail.value = window.innerWidth <= 768;
};

onMounted(() => {
  window.addEventListener('resize', updateRailOnResize);
});

onUnmounted(() => {
  window.removeEventListener('resize', updateRailOnResize);
});
</script>

<style>
.v-navigation-drawer {
  border: none !important;
}
</style>
