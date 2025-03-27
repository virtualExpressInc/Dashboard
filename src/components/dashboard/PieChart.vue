<template>
  <section>
        <v-card>
          <v-card-text>
            <apexchart
            type="pie"
            :options="chartOptions"
            :series="chartSeries"
            height="350"
          />
          </v-card-text>
        </v-card>
  </section>
</template>

<script>
import VueApexCharts from "vue3-apexcharts";

export default {
  components: {
    apexchart: VueApexCharts,
  },
  data() {
    return {
      // Chart options for the pie chart
      chartOptions: {
        chart: {
          id: "pie-chart",
        },
        labels: ["Category A", "Category B", "Category C", "Category D"], // Pie chart labels
        title: {
          text: "Workspace Billables",
          align: "center",
        },
        legend: {
          position: "top",
        },
      },
      // Pie chart data series
      chartSeries: [44, 55, 13, 43], // Values for each category in the pie chart
    };
  },
};
</script>

<style scoped>
/* Add custom styles here if needed */
</style>
