<template>
  <section>
    <v-card>
      <v-card-text>
        <apexchart
          type="pie"
          :options="chartOptions"
          :series="seriesData"
          height="350"
        />
        
        <div class="legend-container mt-4">
          <div 
            v-for="(workspace, index) in filteredWorkspaces" 
            :key="workspace.id"
            class="legend-item"
          >
            <span 
              class="color-indicator"
              :style="{ backgroundColor: getColor(index) }"
            ></span>
            <span class="legend-name">{{ workspace.name }}</span>
            <span class="legend-percentage">({{ getPercentage(workspace.id) }}%)</span>
          </div>
        </div>
        
        <div class="mt-4 text-center">
          <v-chip class="ma-2" color="primary">
            Yearly Total Owed: {{ moneyFormat(totalOwed) }}
          </v-chip>
        </div>
      </v-card-text>
    </v-card>
  </section>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted, computed } from "vue";
import VueApexCharts from "vue3-apexcharts";
import { useWorkspaces } from "../..//hooks/workspace/useGetAllWorkspace";
import { useUsersByWorkspace } from "../../hooks/user/useGetAllUsersByWorkspace";
import { useGetUserData } from "../../hooks/user/useGetUserData";
import { hourlyTime } from "../../helpers/hourlyTime";
import { moneyFormat } from "../../helpers/moneyFormat";

interface WorkspaceTotal {
  id: string;
  name: string;
  total: number;
}

export default defineComponent({
  components: {
    apexchart: VueApexCharts,
  },
  setup() {
    const { workspaces, fetchWorkspaces } = useWorkspaces();
    const workspaceTotals = ref<WorkspaceTotal[]>([]);
    const totalOwed = ref<number>(0);

    const colors: string[] = ['#008FFB', '#00E396', '#FEB019', '#FF4560', '#775DD0', '#546E7A', '#26a69a', '#D10CE8'];

    const filteredWorkspaces = computed(() => {
      return workspaces.value?.filter(ws => 
        workspaceTotals.value.some(wt => wt.id === ws.id && wt.total > 0)
      ) || [];
    });

    const chartOptions = ref({
      chart: { id: "pie-chart", type: 'pie' },
      colors: colors,
      labels: computed(() => filteredWorkspaces.value.map(ws => ws.name)),
      dataLabels: {
        enabled: true,
        formatter: (val: number) => `${val.toFixed(1)}%`,
        style: { colors: ['#fff'], fontSize: '12px', fontWeight: 'bold' }
      },
      legend: { show: false },
      tooltip: { 
        enabled: true,
        custom: ({ series, seriesIndex }: { series: number[]; seriesIndex: number }) => {
          const workspace = filteredWorkspaces.value[seriesIndex];
          return `
            <div class="custom-tooltip">
              <strong>${workspace.name}</strong><br>
              ${series[seriesIndex].toFixed(1)}% (${moneyFormat(workspaceTotals.value[seriesIndex].total)})
            </div>
          `;
        }
      }
    });

    const seriesData = computed(() => {
      if (totalOwed.value === 0) return [];
      return filteredWorkspaces.value.map(ws => {
        const wt = workspaceTotals.value.find(w => w.id === ws.id);
        return wt ? (wt.total / totalOwed.value) * 100 : 0;
      });
    });

    const getColor = (index: number) => colors[index % colors.length];
    const getPercentage = (id: string) => {
      const wt = workspaceTotals.value.find(w => w.id === id);
      return wt ? ((wt.total / totalOwed.value) * 100).toFixed(1) : '0.0';
    };

    const getCurrentYearRange = () => {
      const currentYear = new Date().getFullYear();
      return {
        start: new Date(currentYear, 0, 1).toISOString(),
        end: new Date(currentYear, 11, 31).toISOString()
      };
    };

    const computeYearlyBillables = async () => {
      try {
        await fetchWorkspaces();
        if (!workspaces.value || workspaces.value.length === 0) return;

        const { start, end } = getCurrentYearRange();
        const payload = { start, end, type: "PROJECT", sortOrder: "DESCENDING", sortColumn: "DATE", page: 1, pageSize: 100 };

        const calculations: WorkspaceTotal[] = [];
        let grandTotal = 0;

        for (const ws of workspaces.value) {
          const { users, fetchUsersByWorkspace } = useUsersByWorkspace(ws.id);
          await fetchUsersByWorkspace();
          if (!users.value || users.value.length === 0) continue;

          const { users: timeEntries, fetchUserData } = useGetUserData(ws.id, payload);
          await fetchUserData(payload);

          let wsTotal = 0;
          users.value.forEach(user => {
            const entries = timeEntries.value?.find(e => e.user.id === user.id);
            const hours = hourlyTime(entries?.totalTime || "PT0S");
            const rate = ws.memberships?.find(m => m.userId === user.id)?.hourlyRate?.amount || 0;
            wsTotal += hours * rate;
          });

          if (wsTotal > 0) {
            calculations.push({ id: ws.id, name: ws.name, total: wsTotal });
            grandTotal += wsTotal;
          }
        }

        workspaceTotals.value = calculations;
        totalOwed.value = grandTotal;
      } catch (error) {
        console.error("Error computing yearly billables:", error);
      }
    };

    onMounted(() => {
      computeYearlyBillables();
      setInterval(computeYearlyBillables, 300000);
    });

    return { 
      filteredWorkspaces,
      chartOptions, 
      seriesData,
      totalOwed,
      moneyFormat,
      getColor,
      getPercentage
    };
  },
});
</script>

<style scoped>
.legend-container {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 8px 16px;
  max-width: 800px;
  margin: 20px auto 0;
}

.legend-item {
  display: flex;
  align-items: center;
  min-width: 250px;
}

.color-indicator {
  display: inline-block;
  width: 16px;
  height: 16px;
  border-radius: 4px;
  margin-right: 8px;
  flex-shrink: 0;
}

.legend-name {
  display: inline-block;
  width: 150px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.legend-percentage {
  display: inline-block;
  width: 60px;
  text-align: right;
  color: rgba(0, 0, 0, 0.6);
}
</style>