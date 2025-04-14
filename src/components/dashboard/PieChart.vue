<template>
  <section style="height: 100%;">
    <v-card style="height: 100%;">
      <v-card-text class="text-center" style="height: 100%; min-height: 200px; padding: 8px;">
        <v-progress-circular
          v-if="loading"
          indeterminate
          color="primary"
          size="64"
          style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%);"
        ></v-progress-circular>
        
        <template v-else>
          <div style="height: calc(100% - 120px); min-height: 100px;">
            <apexchart
              type="pie"
              :options="chartOptions"
              :series="seriesData"
              style="width: 100%; height: 100%;"
            />
          </div>
          
          <div class="legend-container mt-2" style="max-height: 100px; overflow-y: auto;">
            <div 
            v-for="(workspace, index) in workspaceTotals" 
              :key="workspace.id"
              class="legend-item"
              style="min-width: 120px;"
            >
              <span 
                class="color-indicator"
                :style="{ backgroundColor: getColor(index) }"
              ></span>
              <span class="legend-name">{{ (workspace.name) }}</span>
              <span class="legend-percentage">({{ getPercentage(workspace.id) }}%)</span>
            </div>
          </div>
          
          <div class="mt-2 text-center">
            <v-chip class="ma-1" color="primary" small>
              {{ currentYear }} Billables: ₱{{ moneyFormat(totalOwed) }}
            </v-chip>
          </div>
        </template>
      </v-card-text>
    </v-card>
  </section>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted, computed, watchEffect } from "vue";
import VueApexCharts from "vue3-apexcharts";
import { useWorkspaces } from "@/hooks/workspace/useGetAllWorkspace";
import { useUsersByWorkspace } from "@/hooks/user/useGetAllUsersByWorkspace";
import { useGetUserData } from "@/hooks/user/useGetUserData";
import { hourlyTime } from "@/helpers/hourlyTime";
import { moneyFormat } from "@/helpers/moneyFormat";

    interface WorkspaceTotal {
      id: string;
      name: string;
      total: number;
    }

    export default defineComponent({
      name: "YearlyBillablesPieChart",
      components: {
        apexchart: VueApexCharts,
      },
      props: {
        height: {
          type: Number,
          default: 200
        }
      },
      setup(props) {
        const { workspaces, fetchWorkspaces } = useWorkspaces();
        const workspaceTotals = ref<WorkspaceTotal[]>([]);
        const totalOwed = ref<number>(0);
        const loading = ref(true);
        const currentDate = new Date();
        const currentYear = currentDate.getFullYear();

        const colors: string[] = ['#008FFB', '#00E396', '#FEB019', '#FF4560', '#775DD0', '#546E7A', '#26a69a', '#D10CE8'];

        const chartHeight = computed(() => props.height - 120);

        const chartOptions = ref({});
        const seriesData = ref<number[]>([]);

        const getColor = (index: number) => colors[index % colors.length];
        const getPercentage = (id: string) => {
          const wt = workspaceTotals.value.find(w => w.id === id);
          return wt ? ((wt.total / totalOwed.value) * 100).toFixed(1) : '0.0';
        };

        const getCurrentYearRange = () => {
          return {
            start: new Date(currentYear, 0, 1).toISOString(),
            end: new Date(currentYear, 11, 31).toISOString()
          };
        };

        const computeYearlyBillables = async () => {
          try {
            loading.value = true;
            await fetchWorkspaces();
            if (!workspaces.value || workspaces.value.length === 0) return;

            const { start, end } = getCurrentYearRange();
            const payload = {
              start,
              end,
              type: "PROJECT",
              sortOrder: "DESCENDING",
              sortColumn: "DATE",
              page: 1,
              pageSize: 100
            };

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

            localStorage.setItem("yearlyBillablesData", JSON.stringify({
              data: calculations,
              total: grandTotal,
              cachedAt: new Date().toISOString()
            }));

            console.log("[PieChart] Cached new data.");
          } catch (error) {
            console.error("Error computing yearly billables:", error);
          } finally {
            loading.value = false;
          }
        };

        onMounted(() => {
          const cache = localStorage.getItem("yearlyBillablesData");
          if (cache) {
            try {
              const parsed = JSON.parse(cache);
              const cachedTime = new Date(parsed.cachedAt).getTime();
              const now = Date.now();
              const maxAge = 1000 * 60 * 60 * 24;

              if (now - cachedTime < maxAge) {
                workspaceTotals.value = parsed.data;
                totalOwed.value = parsed.total;
                console.log("[PieChart] Loaded from cache");
                loading.value = false;
                return;
              }
            } catch (e) {
              console.warn("[PieChart] Cache parsing error:", e);
            }
          }

          computeYearlyBillables();
        });

        watchEffect(() => {
          if (!workspaceTotals.value.length || !totalOwed.value) return;

          // update seriesData and chartOptions
          seriesData.value = workspaceTotals.value.map(wt => (wt.total / totalOwed.value) * 100);

          chartOptions.value = {
            chart: {
              id: "pie-chart",
              type: "pie",
              height: chartHeight.value
            },
            colors: colors,
            labels: workspaceTotals.value.map(wt => wt.name),
            dataLabels: {
              enabled: true,
              formatter: (val: number) => `${val.toFixed(1)}%`,
              style: {
                colors: ["#fff"],
                fontSize: "12px",
                fontWeight: "bold"
              }
            },
            legend: {
              show: false
            },
            tooltip: {
              enabled: true,
              custom: ({ series, seriesIndex }: { series: number[]; seriesIndex: number }) => {
                const workspace = workspaceTotals.value[seriesIndex];
                return `
                  <div class="custom-tooltip">
                    <strong>${workspace?.name}</strong><br>
                    ${series[seriesIndex].toFixed(1)}% (₱${moneyFormat(workspace.total)})
                  </div>
                `;
              }
            },
            responsive: [{
              breakpoint: 600,
              options: {
                chart: { width: '100%' },
                legend: { position: 'bottom' },
                dataLabels: { enabled: false }
              }
            }]
          };
        });

        return {
          chartOptions,
          seriesData,
          workspaceTotals,
          totalOwed,
          currentYear,
          loading,
          moneyFormat,
          getColor,
          getPercentage,
          chartHeight
        };
      },
    });
</script>



<style scoped>
.v-card {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.v-card-text {
  position: relative;
  flex: 1;
  display: flex;
  flex-direction: column;
}

.legend-container {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 8px;
  padding: 4px;
}

.legend-item {
  display: flex;
  align-items: center;
  padding: 2px;
  background: rgba(0,0,0,0.05);
  border-radius: 4px;
}

.color-indicator {
  display: inline-block;
  width: 12px;
  height: 12px;
  border-radius: 3px;
  margin-right: 6px;
  flex-shrink: 0;
}

.legend-name {
  font-size: 0.8rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 100px;
}

.legend-percentage {
  font-size: 0.8rem;
  margin-left: 4px;
  color: rgba(0, 0, 0, 0.7);
}

@media (max-width: 600px) {
  .legend-name {
    max-width: 70px;
  }
  
  .legend-item {
    min-width: 100px;
  }
}
</style>