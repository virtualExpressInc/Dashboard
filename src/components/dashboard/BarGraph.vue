<template>
  <section>
        <v-card>
          <v-card-text>
            <apexchart
              type="bar"
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
      chartOptions: {
        chart: {
          id: "bar-chart",
        },
        xaxis: {
          categories: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul"],
        },
        title: {
          text: "Monthly Billables",
          align: "center",
        },
      },
      chartSeries: [
        {
          name: "Bilables",
          data: [30, 40, 35, 50, 49, 60, 70],
        },
      ],
    };
  },
};
</script>

<style>
/* Add custom styles here */
</style>
