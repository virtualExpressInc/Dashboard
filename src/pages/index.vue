<template>
  <div class="dashboard">
    <!-- Pass allMembers to CountCards -->
    <CountCards :allMembers="allMembers" />

    <!-- Charts Section -->
    <v-row>
      <v-col cols="12" md="6" class="chart-col">
        <BarGraph ref="barGraph" :style="{ minHeight: chartHeight + 'px' }" class="chart-container" />
      </v-col>
      <v-col cols="12" md="6" class="chart-col">
        <PieChart ref="pieChart" :style="{ minHeight: chartHeight + 'px' }" class="chart-container" />
      </v-col>
    </v-row>

    <v-row>
      <v-col cols="12" md="12" class="chart-col">
        <AverageSalaryChart ref="averageSalaryChart" class="chart-container" />
      </v-col>
    </v-row>

    <!-- Fetch Active Members and emit updates -->
    <ActiveMembersList @updateActiveMembers="updateAllMembers" />
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted, nextTick } from 'vue';
import BarGraph from '../components/dashboard/BarGraph.vue';
import PieChart from '../components/dashboard/PieChart.vue';
import AverageSalaryChart from '../components/dashboard/AverageSalaryChart.vue';
import CountCards from '../components/dashboard/CountCards.vue';
import ActiveMembersList from '../components/active/ActiveMembersList.vue';

const barGraph = ref<InstanceType<typeof BarGraph> | null>(null);
const pieChart = ref<InstanceType<typeof PieChart> | null>(null);
const averageSalaryChart = ref<InstanceType<typeof AverageSalaryChart> | null>(null);

const chartHeight = ref(350); // Default height for charts
const allMembers = ref<any[]>([]); // Hold members received from ActiveMembersList

// Handle emitted updated members from ActiveMembersList
const updateAllMembers = (newMembers: any[]) => {
  allMembers.value = newMembers;
  console.log("🟢 Updated allMembers in index.vue:", allMembers.value);
};
// Sync heights of charts dynamically
const synchronizeHeights = () => {
  nextTick(() => {
    const maxHeight = Math.max(
      barGraph.value?.$el.offsetHeight || 350,
      pieChart.value?.$el.offsetHeight || 350,
      averageSalaryChart.value?.$el.offsetHeight || 350,
      350
    );
    chartHeight.value = maxHeight;
  });
};

onMounted(() => {
  synchronizeHeights();
  window.addEventListener('resize', synchronizeHeights);
});
</script>

<style scoped>
.dashboard {
  padding: 8px;
}

.chart-col {
  display: flex;
  justify-content: center;
}

.chart-container {
  flex: 1;
  transition: min-height 0.3s ease;
  max-width: 100%;
}
</style>
