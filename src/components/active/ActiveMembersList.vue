<template>
  <section>
    <v-row>
      <v-col cols="12">
        <v-card class="rounded-lg" variant="flat" style="border: 1px solid #eee;">
          <!-- Section Header -->
          <v-card-text class="px-6 pt-6 pb-2">
            <h4 class="text-h6 font-weight-medium mb-2">Member List</h4>
          </v-card-text>

          <!-- Filter -->
          <v-card-text class="px-6 pt-0 pb-4">
            <v-select
              v-model="selectedWorkspace"
              :items="workspaceOptions"
              label="Filter by Workspace"
              item-title="name"
              item-value="id"
              clearable
              dense
              variant="outlined"
              style="max-width: 300px"
            />
          </v-card-text>

          <!-- Custom Table Header -->
          <div
            class="d-flex px-6 py-3"
            style="background-color: #FFFFFF !important; color: #2e2e2e; font-weight: 500; border-top: 1px solid #e0e0e0; border-bottom: 1px solid #e0e0e0;"
          >
            <div style="width: 50%; min-width: 240px;">Name</div>
            <div style="width: 35%;">Workspace</div>
            <div style="width: 15%;">Status</div>
          </div>

          <!-- Table Body -->
          <v-data-table
            :headers="headers"
            :items="filteredMembers"
            :loading="loading"
            class="elevation-0"
            hide-default-header
            :item-value="item => `${item.email}-${item.workspaceId}`"
          >
            <template v-slot:item="{ item }">
              <div class="d-flex px-6 py-3 align-center" style="border-bottom: 1px solid #eee;">
                <!-- Name -->
                <div class="d-flex align-center" style="width: 50%; min-width: 240px;">
                  <v-avatar
                    size="40"
                    class="rounded-circle mr-3"
                    :class="item.status === 'ACTIVE' ? 'avatar-border-active' : 'avatar-border-idle'"
                  >
                    <v-img v-if="item.profilePicture" :src="item.profilePicture" alt="User Avatar" />
                    <span v-else class="avatar-placeholder">{{ item.name.charAt(0).toUpperCase() }}</span>
                  </v-avatar>
                  <div class="d-flex flex-column align-left">
                    <div>{{ item.name }}</div>
                    <div class="text-caption">{{ item.email }}</div>
                  </div>
                </div>

                <!-- Workspace -->
                <div style="width: 35%;">{{ item.workspace }}</div>

                <!-- Status + Menu -->
                <div style="width: 15%;" class="d-flex align-center justify-space-between">
                  <div class="d-flex align-center">
                    <v-icon
                      :color="item.status === 'ACTIVE' ? 'green' : 'grey'"
                      size="small"
                      class="mr-1"
                    >mdi-checkbox-blank-circle</v-icon>
                    <span>{{ item.status === 'ACTIVE' ? 'Tracking' : 'Idle' }}</span>
                  </div>
                  <v-menu>
                    <template #activator="{ props }">
                      <v-btn icon variant="text" v-bind="props">
                        <v-icon>mdi-dots-vertical</v-icon>
                      </v-btn>
                    </template>
                    <v-list>
                      <v-list-item @click="handleViewProfile(item.workspaceId, item.id)">
                        <v-list-item-title>View</v-list-item-title>
                      </v-list-item>
                    </v-list>
                  </v-menu>
                </div>
              </div>
            </template>
          </v-data-table>

          <!-- No Data Message -->
          <v-alert
            v-if="!loading && filteredMembers.length === 0"
            type="info"
            class="mt-4 mx-6 mb-6"
          >
            No members found.
          </v-alert>
        </v-card>
      </v-col>
    </v-row>

    <!-- Profile Dialog -->
    <MemberProfileDialog
      v-model="profileDialog"
      :profile="profile"
      :status="profile?.status"
    />
  </section>
</template>

<script setup lang="ts">
    import { onMounted, ref, computed, onBeforeUnmount } from 'vue';
    import { useWorkspaces } from '@/hooks/workspace/useGetAllWorkspace';
    import { getAllUsersByWorkspace } from '@/services/user.services';
    import { useGetUserProfile } from '@/hooks/user/useMemberProfile';
    import MemberProfileDialog from '@/components/active/MemberProfileDialog.vue';
    import api from '../../axiosInstance/index';

    const { workspaces, fetchWorkspaces } = useWorkspaces();
    const loading = ref(true);
    const allMembers = ref<any[]>([]);
    const selectedWorkspace = ref<string | null>(null);
    const profileDialog = ref(false);
    const selectedUserId = ref<string | null>(null);
    const selectedWorkspaceId = ref<string | null>(null);

    const { profile, loading: loadingProfile, fetchProfile } = useGetUserProfile();


    let refetchInterval: number | undefined;

    const headers = [
      { text: 'Name', value: 'name' },
      { text: 'Workspace', value: 'workspace' },
      { text: 'Status', value: 'status' }
    ];

    const handleViewProfile = async (workspaceId: string, userId: string) => {
      selectedUserId.value = userId;
      selectedWorkspaceId.value = workspaceId;

      const member = allMembers.value.find(
        (m) => m.id === userId && m.workspaceId === workspaceId
      );

      await fetchProfile(workspaceId, userId);

      if (profile.value && member?.status) {
        profile.value.status = member.status;
      }

      profileDialog.value = true;
    };

    const workspaceOptions = computed(() => {
      const dynamicOptions = (workspaces.value || []).map(ws => ({
        name: ws.name,
        id: ws.id
      }));
      return [{ name: 'All Workspaces', id: 'ALL' }, ...dynamicOptions];
    });

    const filteredMembers = computed(() => {
      if (!selectedWorkspace.value || selectedWorkspace.value === 'ALL') {
        return allMembers.value;
      }
      return allMembers.value.filter(member => member.workspaceId === selectedWorkspace.value);
    });

    const isUserTimerRunning = async (workspaceId: string, userId: string): Promise<boolean> => {
      try {
        const { data } = await api.get(
          `workspaces/${workspaceId}/user/${userId}/time-entries?in-progress=true`
        );
        return data.length > 0 && data[0].timeInterval?.end === null;
      } catch (error) {
        console.error(`⛔ Error checking timer for user ${userId} in workspace ${workspaceId}:`, error);
        return false;
      }
    };

    // 🆕 Extract data fetching logic for reuse
    const loadMemberData = async () => {
      loading.value = true;
      await fetchWorkspaces();
      console.log("🚩 Workspaces fetched:", workspaces.value);

      if (!workspaces.value || workspaces.value.length === 0) {
        loading.value = false;
        return;
      }

      const userMap = new Map<string, any>();

      for (const workspace of workspaces.value) {
        try {
          const users = await getAllUsersByWorkspace(workspace.id);

          const userChecks = users.map(async (user: any) => {
            const uniqueKey = `${user.email}-${workspace.id}`;
            if (!userMap.has(uniqueKey)) {
              const isRunning = await isUserTimerRunning(workspace.id, user.id);

              userMap.set(uniqueKey, {
                id: user.id,
                name: user.name,
                email: user.email,
                profilePicture: user.profilePicture || null,
                workspace: workspace.name,
                workspaceId: workspace.id,
                status: isRunning ? 'ACTIVE' : 'INACTIVE'
              });
            }
          });

          await Promise.all(userChecks);
        } catch (e) {
          console.error(`❌ Failed to fetch users for workspace "${workspace.name}"`, e);
        }
      }

      allMembers.value = Array.from(userMap.values());
      localStorage.setItem(
        'activeMembersCache',
        JSON.stringify({ data: allMembers.value, timestamp: Date.now() })
      );

      console.log("✅ Members loaded from API and saved to localStorage");
      loading.value = false;
    };

    onMounted(async () => {
      const cacheKey = 'activeMembersCache';
      const cacheTTL = 1000 * 60 * 5; // 5 minutes

      const cached = localStorage.getItem(cacheKey);

      await fetchWorkspaces();
      if (cached) {
        try {
          const parsed = JSON.parse(cached);
          const age = Date.now() - parsed.timestamp;

          if (age < cacheTTL) {
            allMembers.value = parsed.data;
            console.log("✅ Loaded members from localStorage cache");
            loading.value = false;
          } else {
            await loadMemberData();
          }
        } catch (e) {
          console.warn("⚠️ Failed to parse localStorage cache:", e);
          await loadMemberData();
        }
      } else {
        await loadMemberData();
      }

      refetchInterval = window.setInterval(() => {
        console.log("🔁 Refetching member data...");
        loadMemberData().then(() => {
          console.log("✅ Refetching successful");
        });
      }, 3600000); // 1 hour
    });

    // 🧹 Cleanup interval on component unmount
    onBeforeUnmount(() => {
      if (refetchInterval) {
        clearInterval(refetchInterval);
      }
    });


</script>

<style>
.avatar-placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  color: white;
  background-color: #999;
  width: 100%;
  height: 100%;
  border-radius: 50%;
}

/* Enhanced border thickness and lighter green */
.avatar-border-active {
  border: 3px solid #00be00; /* lighter green */
}

.avatar-border-idle {
  border: 3px solid #B0BEC5; /* muted grey-blue */
}


</style>
