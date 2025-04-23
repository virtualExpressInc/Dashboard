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
const emit = defineEmits(['updateActiveMembers']);

const { profile, fetchProfile } = useGetUserProfile();

let refetchInterval: number | undefined;

const headers = [
  { text: 'Name', value: 'name' },
  { text: 'Workspace', value: 'workspace' },
  { text: 'Status', value: 'status' }
];

const handleViewProfile = async (workspaceId: string, userId: string) => {
  selectedUserId.value = userId;
  selectedWorkspaceId.value = workspaceId;

  const member = allMembers.value.find(m => m.id === userId && m.workspaceId === workspaceId);
  emit('updateActiveMembers', allMembers.value);
  console.log("📤 Emitting updated allMembers to parent:", allMembers.value);
  await fetchProfile(workspaceId, userId);

  if (profile.value && member?.status) {
    profile.value.status = member.status;
    profile.value.totalWorkedThisWeek = member.totalWorkedThisWeek || 'PT0H';
  }

  profileDialog.value = true;
};

const workspaceOptions = computed(() => {
  const dynamicOptions = (workspaces.value || []).map(ws => ({ name: ws.name, id: ws.id }));
  return [{ name: 'All Workspaces', id: 'ALL' }, ...dynamicOptions];
});

const filteredMembers = computed(() => {
  if (!selectedWorkspace.value || selectedWorkspace.value === 'ALL') {
    return allMembers.value;
  }
  return allMembers.value.filter(member => member.workspaceId === selectedWorkspace.value);
});

// Check if user timer is running (rate-limited)
const isUserTimerRunning = async (workspaceId: string, userId: string): Promise<boolean> => {
  try {
    await new Promise(resolve => setTimeout(resolve, 200)); // 200ms delay between requests
    const { data } = await api.get(`workspaces/${workspaceId}/user/${userId}/time-entries?in-progress=true`);
    return data.length > 0 && data[0].timeInterval?.end === null;
  } catch (error) {
    return false;
  }
};

// Load all members with throttled status checks
const loadMemberData = async () => {
  loading.value = true;
  await fetchWorkspaces();
  console.log("🚩 loadMemberData triggered.");

  if (!workspaces.value || workspaces.value.length === 0) {
    loading.value = false;
    return;
  }

  const userMap = new Map<string, any>();

  for (const workspace of workspaces.value) {
    try {
      const users = await getAllUsersByWorkspace(workspace.id);

      for (const user of users) {
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
            status: isRunning ? 'ACTIVE' : 'INACTIVE',
            totalWorkedThisWeek: 'PT0H' // Static value for now
          });
        }
      }
    } catch (e) {
    }
  }

  allMembers.value = Array.from(userMap.values());
  localStorage.setItem('activeMembersCache', JSON.stringify({ data: allMembers.value, timestamp: Date.now() }));
  loading.value = false;
};

onMounted(async () => {
  const cacheKey = 'activeMembersCache';
  const cacheTTL = 1000 * 60 * 5;

  const cached = localStorage.getItem(cacheKey);
  await fetchWorkspaces();

  if (cached) {
    try {
      const parsed = JSON.parse(cached);
      const age = Date.now() - parsed.timestamp;

      if (age < cacheTTL) {
        allMembers.value = parsed.data;
        loading.value = false;
        console.log("✅ Loaded members from localStorage cache.");
        emit('updateActiveMembers', allMembers.value);  // 🔥 Emit after cache load
        console.log("📤 Emitted updated members from cache:", allMembers.value);
      } else {
        await loadMemberData();
        console.log("🔄 Refetched data successfully after cache expiry.");
        emit('updateActiveMembers', allMembers.value);  // 🔥 Emit after refetch
        console.log("📤 Emitted updated members after cache expiry:", allMembers.value);
      }
    } catch (e) {
      await loadMemberData();
      console.log("🔄 Refetched data successfully after cache parse error.");
      emit('updateActiveMembers', allMembers.value);  // 🔥 Emit after parse error recovery
      console.log("📤 Emitted updated members after cache parse error:", allMembers.value);
    }
  } else {
    await loadMemberData();
    console.log("🔄 Refetched data successfully (no cache found).");
    emit('updateActiveMembers', allMembers.value);  // 🔥 Emit after no cache
    console.log("📤 Emitted updated members (no cache):", allMembers.value);
  }

  refetchInterval = window.setInterval(async () => {
    await loadMemberData();
    console.log("🔁 Periodic refetch successful.");
    emit('updateActiveMembers', allMembers.value);
    console.log("📤 Emitted updated members (periodic):", allMembers.value);
  }, 3600000); 
});

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
