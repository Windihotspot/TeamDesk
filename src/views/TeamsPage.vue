<script setup lang="ts">
import MainLayout from '@/layouts/full/MainLayout.vue'
import { ref, computed, onMounted } from 'vue'
import ApiService from '@/services/api'
import { supabase } from '@/services/supabase'

// ─── Types ────────────────────────────────────────────────────────────────────

interface User {
  id: string
  first_name: string
  last_name: string
  email: string
  avatar_url?: string
}

interface TeamMember {
  id: string
  role: 'admin' | 'member' | 'viewer'
  created_at: string
  user: User
}

interface Project {
  id: string
  name: string
  description?: string
  status: string
  created_at: string
  created_by_user?: User
}

interface Team {
  id: string
  name: string
  description?: string
  owner_id: string
  created_at: string
  owner?: User
  team_members?: TeamMember[]
  projects?: Project[]
}

interface TeamStats {
  members: { total: number; by_role: Record<string, number> }
  projects: { total: number; by_status: Record<string, number> }
  tasks: { total: number; by_status: Record<string, number> }
}

// ─── State ───────────────────────────────────────────────────────────────────

const teams = ref<Team[]>([])
const selectedTeam = ref<Team | null>(null)
const teamStats = ref<TeamStats | null>(null)
const teamMembers = ref<TeamMember[]>([])
const teamProjects = ref<Project[]>([])
const currentUser = ref<User | null>(null)
const allUsers = ref<User[]>([])

const loading = ref(false)
const actionLoading = ref(false)
const search = ref('')
const activeTab = ref('members')

// ─── Dialogs ─────────────────────────────────────────────────────────────────

const dialogs = ref({
  createTeam: false,
  editTeam: false,
  deleteTeam: false,
  addMember: false,
  editMember: false,
  removeMember: false,
  createProject: false,
  assignProject: false,
  unassignProject: false,
  teamDetail: false
})

// ─── Form Models ─────────────────────────────────────────────────────────────

const teamForm = ref({ name: '', description: '' })
const editTeamForm = ref({ name: '', description: '' })
// update the ref type
const memberForm = ref<{ user_id: string | null; role: 'admin' | 'member' | 'viewer' }>({
  user_id: null,
  role: 'member'
})
const editMemberForm = ref({
  user_id: null,
  role: 'member' as 'admin' | 'member' | 'viewer',
  member_id: ''
})
const removeMemberTarget = ref<TeamMember | null>(null)
const projectForm = ref({ name: '', description: '', status: 'active' })
const assignProjectForm = ref({ project_id: '' })
const unassignProjectTarget = ref<Project | null>(null)

const snackbar = ref({ show: false, message: '', color: 'success' })

// ─── Computed ─────────────────────────────────────────────────────────────────

const filteredTeams = computed(() =>
  teams.value.filter(
    (t) =>
      t.name.toLowerCase().includes(search.value.toLowerCase()) ||
      t.description?.toLowerCase().includes(search.value.toLowerCase())
  )
)

const roleColor = (role: string) =>
  ({ admin: 'purple', member: 'blue', viewer: 'grey' })[role] ?? 'grey'

const statusColor = (status: string) =>
  ({ active: 'green', archived: 'grey', inactive: 'red' })[status] ?? 'grey'

const memberInitials = (user: User) =>
  `${user.first_name?.[0] ?? ''}${user.last_name?.[0] ?? ''}`.toUpperCase()

const availableUsersToAdd = computed(() =>
  allUsers.value.filter((u) => !teamMembers.value.some((m) => m.user.id === u.id))
)

// ─── Helpers ──────────────────────────────────────────────────────────────────

function toast(message: string, color = 'success') {
  snackbar.value = { show: true, message, color }
}

function resetDialogs() {
  Object.keys(dialogs.value).forEach((k) => {
    ;(dialogs.value as Record<string, boolean>)[k] = false
  })
}

// ─── API Calls ────────────────────────────────────────────────────────────────

async function fetchCurrentUser() {
  const { data } = await supabase.auth.getUser()
  if (data.user) {
    const { data: profile } = await supabase
      .from('users')
      .select('*')
      .eq('auth_user_id', data.user.id)
      .maybeSingle()
    currentUser.value = profile
  }
}

async function fetchAllUsers() {
  const { data } = await supabase
    .from('users')
    .select('id, first_name, last_name, email, avatar_url')
    .is('deleted_at', null)
  allUsers.value = data ?? []
}

async function fetchTeams() {
  loading.value = true
  try {
    const res = await ApiService.post('/teams', { action: 'list_teams', limit: 50 })
    console.log('teams res:', res)
    teams.value = res.data ?? []
  } catch (e: any) {
    toast(e?.response?.data?.error ?? 'Failed to load teams', 'error')
  } finally {
    loading.value = false
  }
}
const detailLoading = ref(false)
async function openTeamDetail(team: Team) {
  // pre-populate from list data so cards show immediately
  selectedTeam.value = team
  teamMembers.value = team.team_members ?? []
  teamProjects.value = team.projects ?? []
  teamStats.value = null
  dialogs.value.teamDetail = true
  activeTab.value = 'members'

  // then fetch fresh detail + stats in background
  detailLoading.value = true
  try {
    await Promise.all([fetchTeamDetail(team.id), fetchTeamStats(team.id)])
  } finally {
    detailLoading.value = false
  }
}

async function fetchTeamDetail(teamId: string) {
  try {
    const res = await ApiService.post('/teams', { action: 'get_team', team_id: teamId })
    console.log("team details response:", res)
    selectedTeam.value = res.data
    teamMembers.value = res.data?.team_members ?? []
    teamProjects.value = res.data?.projects ?? []
  } catch (e: any) {
    console.log("team details error:", e)
    toast(e?.response?.data?.error ?? 'Failed to load team details', 'error')
  }
}

async function fetchTeamStats(teamId: string) {
  try {
    const res = await ApiService.post('/teams', { action: 'get_team_stats', team_id: teamId })
    teamStats.value = res.data
  } catch {
    teamStats.value = null
  }
}

async function createTeam() {
  if (!teamForm.value.name.trim()) return
  actionLoading.value = true
  try {
    await ApiService.post('/teams', {
      action: 'create_team',
      name: teamForm.value.name,
      description: teamForm.value.description,
      owner_id: currentUser.value?.id
    })
    toast('Team created successfully')
    dialogs.value.createTeam = false
    teamForm.value = { name: '', description: '' }
    await fetchTeams()
  } catch (e: any) {
    toast(e?.response?.data?.error ?? 'Failed to create team', 'error')
  } finally {
    actionLoading.value = false
  }
}

function openEditTeam(team: Team) {
  selectedTeam.value = team
  editTeamForm.value = { name: team.name, description: team.description ?? '' }
  dialogs.value.editTeam = true
}

function openDeleteTeam(team: Team) {
  selectedTeam.value = team
  dialogs.value.deleteTeam = true
}

async function updateTeam() {
  if (!selectedTeam.value) return
  actionLoading.value = true
  try {
    const res = await ApiService.post('/teams', {
      action: 'update_team',
      team_id: selectedTeam.value.id,
      name: editTeamForm.value.name,
      description: editTeamForm.value.description
    })
    selectedTeam.value = res.data
    // update in list
    const idx = teams.value.findIndex((t) => t.id === res.data.id)
    if (idx !== -1) teams.value[idx] = res.data
    toast('Team updated')
    dialogs.value.editTeam = false
  } catch (e: any) {
    toast(e?.response?.data?.error ?? 'Failed to update team', 'error')
  } finally {
    actionLoading.value = false
  }
}

async function deleteTeam() {
  if (!selectedTeam.value) return
  actionLoading.value = true
  try {
    await ApiService.post('/teams', { action: 'delete_team', team_id: selectedTeam.value.id })
    toast('Team deleted')
    dialogs.value.deleteTeam = false
    dialogs.value.teamDetail = false
    selectedTeam.value = null
    await fetchTeams()
  } catch (e: any) {
    toast(e?.response?.data?.error ?? 'Failed to delete team', 'error')
  } finally {
    actionLoading.value = false
  }
}

async function addMember() {
  if (!selectedTeam.value || !memberForm.value.user_id) return
  actionLoading.value = true
  try {
    const res = await ApiService.post('/teams', {
      action: 'add_member',
      team_id: selectedTeam.value.id,
      user_id: memberForm.value.user_id,
      role: memberForm.value.role
    })
    fetchTeams()
    toast('Member added')
    dialogs.value.addMember = false
    memberForm.value = { user_id: null as any, role: 'member' }
    await fetchTeamStats(selectedTeam.value.id)
  } catch (e: any) {
    toast(e?.response?.data?.error ?? 'Failed to add member', 'error')
  } finally {
    actionLoading.value = false
  }
}

function openEditMember(member: TeamMember) {
  editMemberForm.value = { user_id: member.user.id, role: member.role, member_id: member.id }
  dialogs.value.editMember = true
}

async function updateMember() {
  if (!selectedTeam.value) return
  actionLoading.value = true
  try {
    const res = await ApiService.post('/teams', {
      action: 'update_member',
      team_id: selectedTeam.value.id,
      user_id: editMemberForm.value.user_id,
      role: editMemberForm.value.role
    })
    const idx = teamMembers.value.findIndex((m) => m.id === editMemberForm.value.member_id)
    if (idx !== -1) teamMembers.value[idx] = res.data
    toast('Member role updated')
    dialogs.value.editMember = false
  } catch (e: any) {
    toast(e?.response?.data?.error ?? 'Failed to update member', 'error')
  } finally {
    actionLoading.value = false
  }
}

function openRemoveMember(member: TeamMember) {
  removeMemberTarget.value = member
  dialogs.value.removeMember = true
}

async function removeMember() {
  if (!selectedTeam.value || !removeMemberTarget.value) return
  actionLoading.value = true
  try {
    await ApiService.post('/teams', {
      action: 'remove_member',
      team_id: selectedTeam.value.id,
      user_id: removeMemberTarget.value.user.id
    })
    teamMembers.value = teamMembers.value.filter((m) => m.id !== removeMemberTarget.value!.id)
    toast('Member removed')
    dialogs.value.removeMember = false
    removeMemberTarget.value = null
    await fetchTeamStats(selectedTeam.value.id)
  } catch (e: any) {
    toast(e?.response?.data?.error ?? 'Failed to remove member', 'error')
  } finally {
    actionLoading.value = false
  }
}

async function createProject() {
  if (!selectedTeam.value || !projectForm.value.name.trim()) return
  actionLoading.value = true
  try {
    const res = await ApiService.post('/teams', {
      action: 'create_project',
      team_id: selectedTeam.value.id,
      name: projectForm.value.name,
      description: projectForm.value.description,
      status: projectForm.value.status,
      created_by: currentUser.value?.id
    })
    teamProjects.value.unshift(res.data)
    toast('Project created')
    dialogs.value.createProject = false
    projectForm.value = { name: '', description: '', status: 'active' }
    await fetchTeamStats(selectedTeam.value.id)
  } catch (e: any) {
    toast(e?.response?.data?.error ?? 'Failed to create project', 'error')
  } finally {
    actionLoading.value = false
  }
}

async function assignProject() {
  if (!selectedTeam.value || !assignProjectForm.value.project_id) return
  actionLoading.value = true
  try {
    const res = await ApiService.post('/teams', {
      action: 'assign_project',
      team_id: selectedTeam.value.id,
      project_id: assignProjectForm.value.project_id
    })
    teamProjects.value.unshift(res.data)
    toast('Project assigned to team')
    dialogs.value.assignProject = false
    assignProjectForm.value = { project_id: '' }
  } catch (e: any) {
    toast(e?.response?.data?.error ?? 'Failed to assign project', 'error')
  } finally {
    actionLoading.value = false
  }
}

function openUnassignProject(project: Project) {
  unassignProjectTarget.value = project
  dialogs.value.unassignProject = true
}

async function unassignProject() {
  if (!unassignProjectTarget.value) return
  actionLoading.value = true
  try {
    await ApiService.post('/teams', {
      action: 'unassign_project',
      project_id: unassignProjectTarget.value.id
    })
    teamProjects.value = teamProjects.value.filter((p) => p.id !== unassignProjectTarget.value!.id)
    toast('Project removed from team')
    dialogs.value.unassignProject = false
    unassignProjectTarget.value = null
    if (selectedTeam.value) await fetchTeamStats(selectedTeam.value.id)
  } catch (e: any) {
    toast(e?.response?.data?.error ?? 'Failed to unassign project', 'error')
  } finally {
    actionLoading.value = false
  }
}

// ── Inline member management (used inside create/edit team dialogs) ──────────

async function inlineAddMember() {
  if (!selectedTeam.value || !memberForm.value.user_id) return
  actionLoading.value = true
  try {
    const res = await ApiService.post('/teams', {
      action: 'add_member',
      team_id: selectedTeam.value.id,
      user_id: memberForm.value.user_id,
      role: memberForm.value.role
    })
    teamMembers.value.push(res.data)
    memberForm.value = { user_id: null, role: 'member' }
    toast('Member added')
  } catch (e: any) {
    toast(e?.response?.data?.error ?? 'Failed to add member', 'error')
  } finally {
    actionLoading.value = false
  }
}

async function inlineUpdateMemberRole(member: TeamMember, newRole: string) {
  if (!selectedTeam.value) return
  try {
    await ApiService.post('/teams', {
      action: 'update_member',
      team_id: selectedTeam.value.id,
      user_id: member.user.id,
      role: newRole
    })
    const idx = teamMembers.value.findIndex((m) => m.id === member.id)
    if (idx !== -1) teamMembers.value[idx] = { ...teamMembers.value[idx], role: newRole as TeamMember['role'] }
    toast('Role updated')
  } catch (e: any) {
    toast(e?.response?.data?.error ?? 'Failed to update role', 'error')
  }
}

async function inlineRemoveMember(member: TeamMember) {
  if (!selectedTeam.value) return
  try {
    await ApiService.post('/teams', {
      action: 'remove_member',
      team_id: selectedTeam.value.id,
      user_id: member.user.id
    })
    teamMembers.value = teamMembers.value.filter((m) => m.id !== member.id)
    toast('Member removed')
  } catch (e: any) {
    toast(e?.response?.data?.error ?? 'Failed to remove member', 'error')
  }
}

// ─── Init ─────────────────────────────────────────────────────────────────────

onMounted(async () => {
  await Promise.all([fetchCurrentUser(), fetchTeams(), fetchAllUsers()])
})
</script>

<template>
  <MainLayout>
    <v-container fluid class="teams-page pa-6">
      <!-- ── Page Header ──────────────────────────────────────────────────── -->
      <div class="page-header mb-6">
        <div class="d-flex align-center justify-space-between flex-wrap gap-3">
          <div>
            <h1 class="page-title">Teams</h1>
            <p class="page-subtitle">Manage your teams, members, and projects</p>
          </div>
          <v-btn
            color="primary"
            prepend-icon="mdi-plus"
            rounded="lg"
            elevation="0"
            @click="dialogs.createTeam = true"
          >
            New Team
          </v-btn>
        </div>

        <!-- Search -->
        <v-text-field
          v-model="search"
          placeholder="Search teams…"
          prepend-inner-icon="mdi-magnify"
          variant="outlined"
          density="comfortable"
          rounded="lg"
          hide-details
          class="mt-4 search-field"
          style="max-width: 420px"
          bg-color="surface"
          clearable
        />
      </div>

      <!-- ── Loading ──────────────────────────────────────────────────────── -->
      <div v-if="loading" class="d-flex justify-center align-center py-16">
        <v-progress-circular indeterminate color="primary" size="48" />
      </div>

      <!-- ── Empty State ──────────────────────────────────────────────────── -->
      <div v-else-if="filteredTeams.length === 0" class="empty-state text-center py-16">
        <v-icon size="72" color="grey-lighten-1">mdi-account-group-outline</v-icon>
        <p class="text-h6 mt-4 text-medium-emphasis">No teams yet</p>
        <p class="text-body-2 text-disabled mb-6">Create your first team to get started</p>
        <v-btn
          color="primary"
          rounded="lg"
          prepend-icon="mdi-plus"
          @click="dialogs.createTeam = true"
        >
          Create Team
        </v-btn>
      </div>

      <!-- ── Teams Grid ───────────────────────────────────────────────────── -->
       
      <v-row v-else>
        <v-col v-for="team in filteredTeams" :key="team.id" cols="12" sm="6" md="4" lg="3">
          <v-card class="team-card" rounded="xl" elevation="0" border @click="openTeamDetail(team)">
            <v-card-text class="pa-5">
              <!-- Team Avatar + Name -->
              <div class="d-flex align-center gap-3 mb-4">
                <v-avatar color="primary" size="44" class="team-avatar">
                  <span class="text-subtitle-1 font-weight-bold text-white">
                    {{ team.name[0] }}
                  </span>
                </v-avatar>
                <div class="flex-1 overflow-hidden">
                  <div class="text-subtitle-1 font-weight-semibold text-truncate">
                    {{ team.name }}
                  </div>
                  <div class="text-caption text-disabled text-truncate">
                    {{ team.owner?.first_name }} {{ team.owner?.last_name }}
                  </div>
                </div>
              </div>

              <!-- Description -->
              <p v-if="team.description" class="text-body-2 text-medium-emphasis mb-4 team-desc">
                {{ team.description }}
              </p>

              <!-- Stats row -->
              <div class="d-flex gap-4">
                <div class="stat-chip">
                  <v-icon size="14" color="primary">mdi-account-multiple</v-icon>
                  <span>{{ team.team_members?.length ?? 0 }} members</span>
                </div>
                <div class="stat-chip">
                  <v-icon size="14" color="secondary">mdi-folder-outline</v-icon>
                  <span>{{ team.projects?.length ?? 0 }} projects</span>
                </div>
              </div>
            </v-card-text>

            <!-- Quick actions -->
            <v-card-actions class="px-5 pb-4 pt-0">
              <v-spacer />
              <v-btn icon size="small" variant="text" @click.stop="openEditTeam(team)">
                <v-icon size="18">mdi-pencil-outline</v-icon>
                <v-tooltip activator="parent">Edit team</v-tooltip>
              </v-btn>
              <v-btn
                icon
                size="small"
                variant="text"
                color="error"
                @click.stop="openDeleteTeam(team)"
              >
                <v-icon size="18">mdi-trash-can-outline</v-icon>
                <v-tooltip activator="parent">Delete team</v-tooltip>
              </v-btn>
            </v-card-actions>
          </v-card>
        </v-col>
      </v-row>

      <!-- ════════════════════════════════════════════════════════════════════
         TEAM DETAIL DIALOG
    ═══════════════════════════════════════════════════════════════════════ -->
      <v-dialog v-model="dialogs.teamDetail" max-width="860" scrollable>
        <v-card v-if="selectedTeam" rounded="xl" elevation="4">
          <!-- Header -->
          <div class="detail-header px-6 pt-6 pb-4">
            <div class="d-flex align-center justify-space-between">
              <div class="d-flex align-center gap-4">
                <v-avatar color="primary" size="52">
                  <span class="text-h6 font-weight-bold text-white">{{
                    selectedTeam.name[0].toUpperCase()
                  }}</span>
                </v-avatar>
                <div>
                  <h2 class="text-h6 font-weight-bold">{{ selectedTeam.name }}</h2>
                  <p v-if="selectedTeam.description" class="text-body-2 text-medium-emphasis mt-1">
                    {{ selectedTeam.description }}
                  </p>
                  <p class="text-caption text-disabled mt-1">
                    Owner: {{ selectedTeam.owner?.first_name }} {{ selectedTeam.owner?.last_name }}
                  </p>
                </div>
              </div>
              <div class="d-flex gap-2">
                <v-btn icon variant="text" size="small" @click="openEditTeam(selectedTeam!)">
                  <v-icon>mdi-pencil-outline</v-icon>
                  <v-tooltip activator="parent">Edit</v-tooltip>
                </v-btn>
                <v-btn
                  icon
                  variant="text"
                  size="small"
                  color="error"
                  @click="dialogs.deleteTeam = true"
                >
                  <v-icon>mdi-trash-can-outline</v-icon>
                  <v-tooltip activator="parent">Delete</v-tooltip>
                </v-btn>
                <v-btn icon variant="text" size="small" @click="dialogs.teamDetail = false">
                  <v-icon>mdi-close</v-icon>
                </v-btn>
              </div>
            </div>

            <!-- Stats Bar -->
            <div v-if="teamStats" class="stats-bar mt-4 d-flex gap-3 flex-wrap">
              <div class="stat-pill">
                <span class="stat-value">{{ teamStats.members.total }}</span>
                <span class="stat-label">Members</span>
              </div>
              <div class="stat-pill">
                <span class="stat-value">{{ teamStats.projects.total }}</span>
                <span class="stat-label">Projects</span>
              </div>
              <div class="stat-pill">
                <span class="stat-value">{{ teamStats.tasks.total }}</span>
                <span class="stat-label">Tasks</span>
              </div>
              <div v-if="teamStats.tasks.by_status?.done" class="stat-pill success">
                <span class="stat-value">{{ teamStats.tasks.by_status.done }}</span>
                <span class="stat-label">Done</span>
              </div>
            </div>

            <!-- Tabs -->
            <v-tabs v-model="activeTab" color="primary" class="mt-4" density="compact">
              <v-tab value="members">
                <v-icon start size="16">mdi-account-multiple</v-icon>
                Members ({{ teamMembers.length }})
              </v-tab>
              <v-tab value="projects">
                <v-icon start size="16">mdi-folder-multiple-outline</v-icon>
                Projects ({{ teamProjects.length }})
              </v-tab>
            </v-tabs>
          </div>

          <v-divider />

          <v-card-text class="pa-0" style="max-height: 480px; overflow-y: auto">
            <v-tabs-window v-model="activeTab">
              <!-- ── Members Tab ─────────────────────────────────────────── -->
              <v-tabs-window-item value="members">
  <div class="tab-toolbar d-flex justify-end px-5 py-3">
    <v-btn
      color="primary"
      variant="tonal"
      size="small"
      prepend-icon="mdi-account-plus"
      rounded="lg"
      @click="dialogs.addMember = true"
    >
      Add Member
    </v-btn>
  </div>

  <!-- Skeleton while refreshing -->
  <div v-if="detailLoading" class="px-4 pb-4">
    <v-skeleton-loader
      v-for="n in (teamMembers.length || 3)"
      :key="n"
      type="list-item-avatar-two-line"
      class="mb-1"
    />
  </div>

  <v-list v-else lines="two" class="px-2">
    <v-list-item
      v-for="member in teamMembers"
      :key="member.id"
      rounded="lg"
      class="mb-1"
    >
      <template #prepend>
        <v-avatar :color="roleColor(member.role)" size="40">
          <img
            v-if="member.user?.avatar_url"
            :src="member.user.avatar_url"
            :alt="member.user.first_name"
          />
          <span v-else class="text-caption font-weight-bold text-white">
            {{ memberInitials(member.user) }}
          </span>
        </v-avatar>
      </template>

      <v-list-item-title class="font-weight-medium">
        {{ member.user?.first_name }} {{ member.user?.last_name }}
        <v-chip
          :color="roleColor(member.role)"
          size="x-small"
          class="ml-2"
          variant="tonal"
        >
          {{ member.role }}
        </v-chip>
      </v-list-item-title>
      <v-list-item-subtitle>{{ member.user?.email }}</v-list-item-subtitle>

      <template #append>
        <v-btn icon size="x-small" variant="text" @click="openEditMember(member)">
          <v-icon size="16">mdi-pencil-outline</v-icon>
          <v-tooltip activator="parent">Change role</v-tooltip>
        </v-btn>
        <v-btn
          icon
          size="x-small"
          variant="text"
          color="error"
          :disabled="member.user?.id === selectedTeam?.owner_id"
          @click="openRemoveMember(member)"
        >
          <v-icon size="16">mdi-account-remove-outline</v-icon>
          <v-tooltip activator="parent">
            {{ member.user?.id === selectedTeam?.owner_id ? 'Cannot remove owner' : 'Remove member' }}
          </v-tooltip>
        </v-btn>
      </template>
    </v-list-item>

    <div v-if="teamMembers.length === 0" class="text-center py-10">
      <v-icon size="48" color="grey-lighten-2">mdi-account-off-outline</v-icon>
      <p class="text-body-2 text-disabled mt-2">No members yet</p>
    </div>
  </v-list>
</v-tabs-window-item>

              <!-- ── Projects Tab ──────────────────────────────────────────── -->
              <v-tabs-window-item value="projects">
  <div class="tab-toolbar d-flex justify-end gap-2 px-5 py-3">
    <v-btn
      variant="tonal"
      size="small"
      prepend-icon="mdi-link-variant"
      rounded="lg"
      @click="dialogs.assignProject = true"
    >
      Assign Existing
    </v-btn>
    <v-btn
      color="primary"
      variant="tonal"
      size="small"
      prepend-icon="mdi-folder-plus-outline"
      rounded="lg"
      @click="dialogs.createProject = true"
    >
      New Project
    </v-btn>
  </div>

  <div v-if="detailLoading" class="px-4 pb-4">
    <v-skeleton-loader
      v-for="n in (teamProjects.length || 2)"
      :key="n"
      type="list-item-avatar-two-line"
      class="mb-1"
    />
  </div>

  <v-list v-else lines="two" class="px-2">
    <v-list-item
      v-for="project in teamProjects"
      :key="project.id"
      rounded="lg"
      class="mb-1"
    >
      <template #prepend>
        <v-avatar :color="statusColor(project.status)" size="38" variant="tonal">
          <v-icon size="18">mdi-folder-outline</v-icon>
        </v-avatar>
      </template>

      <v-list-item-title class="font-weight-medium">
        {{ project.name }}
        <v-chip
          :color="statusColor(project.status)"
          size="x-small"
          class="ml-2"
          variant="tonal"
        >
          {{ project.status }}
        </v-chip>
      </v-list-item-title>
      <v-list-item-subtitle>{{ project.description ?? 'No description' }}</v-list-item-subtitle>

      <template #append>
        <v-btn
          icon
          size="x-small"
          variant="text"
          color="error"
          @click="openUnassignProject(project)"
        >
          <v-icon size="16">mdi-link-variant-off</v-icon>
          <v-tooltip activator="parent">Unassign from team</v-tooltip>
        </v-btn>
      </template>
    </v-list-item>

    <div v-if="teamProjects.length === 0" class="text-center py-10">
      <v-icon size="48" color="grey-lighten-2">mdi-folder-open-outline</v-icon>
      <p class="text-body-2 text-disabled mt-2">No projects assigned</p>
    </div>
  </v-list>
</v-tabs-window-item>
            </v-tabs-window>
          </v-card-text>
        </v-card>
      </v-dialog>

      <!-- ════════════════════════════════════════════════════════════════════
         CREATE TEAM DIALOG
    ═══════════════════════════════════════════════════════════════════════ -->
      <v-dialog v-model="dialogs.createTeam" max-width="480">
        <v-card rounded="xl">
          <v-card-title class="text-h6 font-weight-bold pa-6 pb-3">
            <v-icon start color="primary">mdi-account-group-outline</v-icon>
            Create Team
          </v-card-title>
          <v-card-text class="px-6 pb-2">
            <v-text-field
              v-model="teamForm.name"
              label="Team name"
              variant="outlined"
              density="comfortable"
              rounded="lg"
              autofocus
              :rules="[(v) => !!v || 'Name is required']"
              class="mb-3"
            />
            <v-textarea
              v-model="teamForm.description"
              label="Description (optional)"
              variant="outlined"
              density="comfortable"
              rounded="lg"
              rows="3"
              no-resize
            />

            <v-divider class="my-4" />
<!-- <p class="text-subtitle-2 font-weight-semibold mb-3">
  <v-icon start size="16" color="primary">mdi-account-multiple-outline</v-icon>
  Members
</p> -->

<!-- Current members list (edit mode only — bind to teamMembers ref) -->
<!-- <v-list v-if="teamMembers.length" density="compact" class="mb-3 rounded-lg border">
  <v-list-item
    v-for="member in teamMembers"
    :key="member.id"
    density="compact"
    rounded="lg"
  >
    <template #prepend>
      <v-avatar :color="roleColor(member.role)" size="32">
        <img v-if="member.user.avatar_url" :src="member.user.avatar_url" />
        <span v-else class="text-caption text-white font-weight-bold">
          {{ memberInitials(member.user) }}
        </span>
      </v-avatar>
    </template>

    <v-list-item-title class="text-body-2">
      {{ member.user.first_name }} {{ member.user.last_name }}
      <v-chip :color="roleColor(member.role)" size="x-small" variant="tonal" class="ml-1">
        {{ member.role }}
      </v-chip>
    </v-list-item-title>
    <v-list-item-subtitle class="text-caption">{{ member.user.email }}</v-list-item-subtitle>

    <template #append>
      <v-select
        :model-value="member.role"
        :items="[
          { title: 'Admin', value: 'admin' },
          { title: 'Member', value: 'member' },
          { title: 'Viewer', value: 'viewer' }
        ]"
        density="compact"
        variant="plain"
        hide-details
        style="max-width: 100px"
        @update:model-value="(role) => inlineUpdateMemberRole(member, role)"
      />
      <v-btn
        icon
        size="x-small"
        variant="text"
        color="error"
        :disabled="member.user.id === selectedTeam?.owner_id"
        @click="inlineRemoveMember(member)"
      >
        <v-icon size="14">mdi-close</v-icon>
      </v-btn>
    </template>
  </v-list-item>
</v-list> -->

<!-- Add member inline -->
   <v-autocomplete
  v-model="memberForm.user_id"
  :items="availableUsersToAdd"
  item-value="id"
  :item-title="(u: User) => u ? `${u.first_name} ${u.last_name} (${u.email})` : ''"
  label="Select user"
  variant="outlined"
  density="comfortable"
  rounded="lg"
  class="mb-3"
  clearable
  no-data-text="No users available"
/>
<div class="d-flex gap-2 align-center">

  <v-select
    v-model="memberForm.role"
    :items="[
      { title: 'Admin', value: 'admin' },
      { title: 'Member', value: 'member' },
      { title: 'Viewer', value: 'viewer' }
    ]"
    variant="outlined"
    density="compact"
    rounded="lg"
    hide-details
   
  />
  <v-btn
    color="primary"
    variant="tonal"
    size="small"
    icon
    rounded="lg"
    :disabled="!memberForm.user_id"
    :loading="actionLoading"
    @click="inlineAddMember"
  >
    <v-icon>mdi-plus</v-icon>
  </v-btn>
</div>
          </v-card-text>
          <v-card-actions class="px-6 pb-6 pt-2">
            <v-spacer />
            <v-btn variant="text" rounded="lg" @click="dialogs.createTeam = false">Cancel</v-btn>
            <v-btn
              color="primary"
              variant="flat"
              rounded="lg"
              :loading="actionLoading"
              :disabled="!teamForm.name.trim()"
              @click="createTeam"
            >
              Create Team
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>

      <!-- ════════════════════════════════════════════════════════════════════
         EDIT TEAM DIALOG
    ═══════════════════════════════════════════════════════════════════════ -->
      <v-dialog v-model="dialogs.editTeam" max-width="480">
        <v-card rounded="xl">
          <v-card-title class="text-h6 font-weight-bold pa-6 pb-3">
            <v-icon start color="primary">mdi-pencil-outline</v-icon>
            Edit Team
          </v-card-title>
          <v-card-text class="px-6 pb-2">
            <v-text-field
              v-model="editTeamForm.name"
              label="Team name"
              variant="outlined"
              density="comfortable"
              rounded="lg"
              autofocus
              class="mb-3"
            />
            <v-textarea
              v-model="editTeamForm.description"
              label="Description"
              variant="outlined"
              density="comfortable"
              rounded="lg"
              rows="3"
              no-resize
            />

            <v-divider class="my-4" />
<!-- <p class="text-subtitle-2 font-weight-semibold mb-3">
  <v-icon start size="16" color="primary">mdi-account-multiple-outline</v-icon>
  Members
</p> -->

<!-- Current members list (edit mode only — bind to teamMembers ref) -->
<!-- <v-list v-if="teamMembers.length" density="compact" class="mb-3 rounded-lg border">
  <v-list-item
    v-for="member in teamMembers"
    :key="member.id"
    density="compact"
    rounded="lg"
  >
    <template #prepend>
      <v-avatar :color="roleColor(member.role)" size="32">
        <img v-if="member.user.avatar_url" :src="member.user.avatar_url" />
        <span v-else class="text-caption text-white font-weight-bold">
          {{ memberInitials(member.user) }}
        </span>
      </v-avatar>
    </template>

    <v-list-item-title class="text-body-2">
      {{ member.user.first_name }} {{ member.user.last_name }}
      <v-chip :color="roleColor(member.role)" size="x-small" variant="tonal" class="ml-1">
        {{ member.role }}
      </v-chip>
    </v-list-item-title>
    <v-list-item-subtitle class="text-caption">{{ member.user.email }}</v-list-item-subtitle>

    <template #append>
      <v-select
        :model-value="member.role"
        :items="[
          { title: 'Admin', value: 'admin' },
          { title: 'Member', value: 'member' },
          { title: 'Viewer', value: 'viewer' }
        ]"
        density="compact"
        variant="plain"
        hide-details
        style="max-width: 100px"
        @update:model-value="(role) => inlineUpdateMemberRole(member, role)"
      />
      <v-btn
        icon
        size="x-small"
        variant="text"
        color="error"
        :disabled="member.user.id === selectedTeam?.owner_id"
        @click="inlineRemoveMember(member)"
      >
        <v-icon size="14">mdi-close</v-icon>
      </v-btn>
    </template>
  </v-list-item>
</v-list> -->

<!-- Add member inline -->
    <v-autocomplete
  v-model="memberForm.user_id"
  :items="availableUsersToAdd"
  item-value="id"
  :item-title="(u: User) => u ? `${u.first_name} ${u.last_name} (${u.email})` : ''"
  label="Select user"
  variant="outlined"
  density="comfortable"
  rounded="lg"
  class="mb-3"
  clearable
  no-data-text="No users available"
/>
<div class="flex justify-between align-center">

  <v-select
    v-model="memberForm.role"
    :items="[
      { title: 'Admin', value: 'admin' },
      { title: 'Member', value: 'member' },
      { title: 'Viewer', value: 'viewer' }
    ]"
    variant="outlined"
    density="compact"
    rounded="lg"
    hide-details
   
  />
  <v-btn
    color="primary"
    variant="tonal"
    size="small"
    icon
    rounded="lg"
    :disabled="!memberForm.user_id"
    :loading="actionLoading"
    @click="inlineAddMember"
  >
    <v-icon>mdi-plus</v-icon>
  </v-btn>
</div>

          </v-card-text>
          <v-card-actions class="px-6 pb-6 pt-2">
            <v-spacer />
            <v-btn variant="text" rounded="lg" @click="dialogs.editTeam = false">Cancel</v-btn>
            <v-btn
              color="primary"
              variant="flat"
              rounded="lg"
              :loading="actionLoading"
              @click="updateTeam"
            >
              Save Changes
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>

      <!-- ════════════════════════════════════════════════════════════════════
         DELETE TEAM CONFIRM
    ═══════════════════════════════════════════════════════════════════════ -->
      <v-dialog v-model="dialogs.deleteTeam" max-width="420">
        <v-card rounded="xl">
          <v-card-text class="pa-6 text-center">
            <v-avatar color="error" variant="tonal" size="64" class="mb-4">
              <v-icon size="32" color="error">mdi-alert-circle-outline</v-icon>
            </v-avatar>
            <h3 class="text-h6 font-weight-bold mb-2">Delete Team</h3>
            <p class="text-body-2 text-medium-emphasis">
              Are you sure you want to delete <strong>{{ selectedTeam?.name }}</strong
              >? This will also soft-delete all projects linked to this team.
            </p>
          </v-card-text>
          <v-card-actions class="px-6 pb-6 pt-0">
            <v-spacer />
            <v-btn variant="text" rounded="lg" @click="dialogs.deleteTeam = false">Cancel</v-btn>
            <v-btn
              color="error"
              variant="flat"
              rounded="lg"
              :loading="actionLoading"
              @click="deleteTeam"
            >
              Delete
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>

      <!-- ════════════════════════════════════════════════════════════════════
         ADD MEMBER DIALOG
    ═══════════════════════════════════════════════════════════════════════ -->
      <v-dialog v-model="dialogs.addMember" max-width="460">
        <v-card rounded="xl">
          <v-card-title class="text-h6 font-weight-bold pa-6 pb-3">
            <v-icon start color="primary">mdi-account-plus-outline</v-icon>
            Add Member
          </v-card-title>
          <v-card-text class="px-6 pb-2">
           <v-autocomplete
  v-model="memberForm.user_id"
  :items="availableUsersToAdd"
  item-value="id"
  :item-title="(u: User) => u ? `${u.first_name} ${u.last_name} (${u.email})` : ''"
  label="Select user"
  variant="outlined"
  density="comfortable"
  rounded="lg"
  class="mb-3"
  clearable
  no-data-text="No users available"
/>
            <v-select
              v-model="memberForm.role"
              :items="[
                { title: 'Admin', value: 'admin' },
                { title: 'Member', value: 'member' },
                { title: 'Viewer', value: 'viewer' }
              ]"
              label="Role"
              variant="outlined"
              density="comfortable"
              rounded="lg"
            />
          </v-card-text>
          <v-card-actions class="px-6 pb-6 pt-2">
            <v-spacer />
            <v-btn variant="text" rounded="lg" @click="dialogs.addMember = false">Cancel</v-btn>
            <v-btn
              color="primary"
              variant="flat"
              rounded="lg"
              :loading="actionLoading"
              :disabled="!memberForm.user_id"
              @click="addMember"
            >
              Add Member
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>

      <!-- ════════════════════════════════════════════════════════════════════
         EDIT MEMBER ROLE DIALOG
    ═══════════════════════════════════════════════════════════════════════ -->
      <v-dialog v-model="dialogs.editMember" max-width="400">
        <v-card rounded="xl">
          <v-card-title class="text-h6 font-weight-bold pa-6 pb-3">
            <v-icon start color="primary">mdi-shield-account-outline</v-icon>
            Change Role
          </v-card-title>
          <v-card-text class="px-6 pb-2">
            <v-select
              v-model="editMemberForm.role"
              :items="[
                { title: 'Admin', value: 'admin' },
                { title: 'Member', value: 'member' },
                { title: 'Viewer', value: 'viewer' }
              ]"
              label="New role"
              variant="outlined"
              density="comfortable"
              rounded="lg"
            />
          </v-card-text>
          <v-card-actions class="px-6 pb-6 pt-2">
            <v-spacer />
            <v-btn variant="text" rounded="lg" @click="dialogs.editMember = false">Cancel</v-btn>
            <v-btn
              color="primary"
              variant="flat"
              rounded="lg"
              :loading="actionLoading"
              @click="updateMember"
            >
              Update Role
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>

      <!-- ════════════════════════════════════════════════════════════════════
         REMOVE MEMBER CONFIRM
    ═══════════════════════════════════════════════════════════════════════ -->
      <v-dialog v-model="dialogs.removeMember" max-width="400">
        <v-card rounded="xl">
          <v-card-text class="pa-6 text-center">
            <v-avatar color="warning" variant="tonal" size="56" class="mb-4">
              <v-icon size="28" color="warning">mdi-account-remove-outline</v-icon>
            </v-avatar>
            <h3 class="text-h6 font-weight-bold mb-2">Remove Member</h3>
            <p class="text-body-2 text-medium-emphasis">
              Remove
              <strong
                >{{ removeMemberTarget?.user.first_name }}
                {{ removeMemberTarget?.user.last_name }}</strong
              >
              from this team?
            </p>
          </v-card-text>
          <v-card-actions class="px-6 pb-6 pt-0">
            <v-spacer />
            <v-btn variant="text" rounded="lg" @click="dialogs.removeMember = false">Cancel</v-btn>
            <v-btn
              color="warning"
              variant="flat"
              rounded="lg"
              :loading="actionLoading"
              @click="removeMember"
            >
              Remove
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>

      <!-- ════════════════════════════════════════════════════════════════════
         CREATE PROJECT DIALOG
    ═══════════════════════════════════════════════════════════════════════ -->
      <v-dialog v-model="dialogs.createProject" max-width="480">
        <v-card rounded="xl">
          <v-card-title class="text-h6 font-weight-bold pa-6 pb-3">
            <v-icon start color="primary">mdi-folder-plus-outline</v-icon>
            New Project
          </v-card-title>
          <v-card-text class="px-6 pb-2">
            <v-text-field
              v-model="projectForm.name"
              label="Project name"
              variant="outlined"
              density="comfortable"
              rounded="lg"
              autofocus
              class="mb-3"
            />
            <v-textarea
              v-model="projectForm.description"
              label="Description (optional)"
              variant="outlined"
              density="comfortable"
              rounded="lg"
              rows="3"
              no-resize
              class="mb-3"
            />
            <v-select
              v-model="projectForm.status"
              :items="[
                { title: 'Active', value: 'active' },
                { title: 'Inactive', value: 'inactive' },
                { title: 'Archived', value: 'archived' }
              ]"
              label="Status"
              variant="outlined"
              density="comfortable"
              rounded="lg"
            />
          </v-card-text>
          <v-card-actions class="px-6 pb-6 pt-2">
            <v-spacer />
            <v-btn variant="text" rounded="lg" @click="dialogs.createProject = false">Cancel</v-btn>
            <v-btn
              color="primary"
              variant="flat"
              rounded="lg"
              :loading="actionLoading"
              :disabled="!projectForm.name.trim()"
              @click="createProject"
            >
              Create Project
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>

      <!-- ════════════════════════════════════════════════════════════════════
         ASSIGN EXISTING PROJECT DIALOG
    ═══════════════════════════════════════════════════════════════════════ -->
      <v-dialog v-model="dialogs.assignProject" max-width="460">
        <v-card rounded="xl">
          <v-card-title class="text-h6 font-weight-bold pa-6 pb-3">
            <v-icon start color="primary">mdi-link-variant</v-icon>
            Assign Project
          </v-card-title>
          <v-card-text class="px-6 pb-2">
            <p class="text-body-2 text-medium-emphasis mb-4">
              Enter the ID of a project to assign it to this team.
            </p>
            <v-text-field
              v-model="assignProjectForm.project_id"
              label="Project ID"
              variant="outlined"
              density="comfortable"
              rounded="lg"
              autofocus
              hint="You can find this in the projects page"
              persistent-hint
            />
          </v-card-text>
          <v-card-actions class="px-6 pb-6 pt-3">
            <v-spacer />
            <v-btn variant="text" rounded="lg" @click="dialogs.assignProject = false">Cancel</v-btn>
            <v-btn
              color="primary"
              variant="flat"
              rounded="lg"
              :loading="actionLoading"
              :disabled="!assignProjectForm.project_id.trim()"
              @click="assignProject"
            >
              Assign
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>

      <!-- ════════════════════════════════════════════════════════════════════
         UNASSIGN PROJECT CONFIRM
    ═══════════════════════════════════════════════════════════════════════ -->
      <v-dialog v-model="dialogs.unassignProject" max-width="400">
        <v-card rounded="xl">
          <v-card-text class="pa-6 text-center">
            <v-avatar color="error" variant="tonal" size="56" class="mb-4">
              <v-icon size="28" color="error">mdi-link-variant-off</v-icon>
            </v-avatar>
            <h3 class="text-h6 font-weight-bold mb-2">Unassign Project</h3>
            <p class="text-body-2 text-medium-emphasis">
              Remove <strong>{{ unassignProjectTarget?.name }}</strong> from this team? The project
              itself will not be deleted.
            </p>
          </v-card-text>
          <v-card-actions class="px-6 pb-6 pt-0">
            <v-spacer />
            <v-btn variant="text" rounded="lg" @click="dialogs.unassignProject = false"
              >Cancel</v-btn
            >
            <v-btn
              color="error"
              variant="flat"
              rounded="lg"
              :loading="actionLoading"
              @click="unassignProject"
            >
              Unassign
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>

      <!-- ── Snackbar ──────────────────────────────────────────────────────── -->
      <v-snackbar
        v-model="snackbar.show"
        :color="snackbar.color"
        rounded="lg"
        location="bottom right"
        :timeout="3500"
      >
        {{ snackbar.message }}
        <template #actions>
          <v-btn variant="text" icon size="small" @click="snackbar.show = false">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </template>
      </v-snackbar>
    </v-container>
  </MainLayout>
</template>

<style scoped>
.v-btn{
  text-transform: none;
}
.teams-page {
  min-height: 100vh;
}

.page-title {
  font-size: 1.75rem;
  font-weight: 700;
  letter-spacing: -0.3px;
  line-height: 1.2;
}

.page-subtitle {
  font-size: 0.875rem;
  color: rgba(var(--v-theme-on-surface), 0.55);
  margin-top: 4px;
}

.team-card {
  cursor: pointer;
  transition:
    box-shadow 0.18s ease,
    transform 0.18s ease;
}

.team-card:hover {
  box-shadow: 0 6px 24px rgba(0, 0, 0, 0.09) !important;
  transform: translateY(-2px);
}

.team-desc {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.stat-chip {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 0.78rem;
  color: rgba(var(--v-theme-on-surface), 0.6);
}

/* Detail dialog stats bar */
.stats-bar {
  gap: 10px;
}

.stat-pill {
  display: flex;
  flex-direction: column;
  align-items: center;
  background: rgba(var(--v-theme-primary), 0.07);
  border-radius: 10px;
  padding: 8px 16px;
  min-width: 72px;
}

.stat-pill.success {
  background: rgba(var(--v-theme-success), 0.1);
}

.stat-value {
  font-size: 1.2rem;
  font-weight: 700;
  line-height: 1;
  color: rgb(var(--v-theme-primary));
}

.stat-pill.success .stat-value {
  color: rgb(var(--v-theme-success));
}

.stat-label {
  font-size: 0.7rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-top: 3px;
  color: rgba(var(--v-theme-on-surface), 0.5);
}

.tab-toolbar {
  border-bottom: 1px solid rgba(var(--v-theme-on-surface), 0.07);
}

.detail-header {
  background: rgba(var(--v-theme-surface-variant), 0.35);
}

.search-field :deep(.v-field__outline) {
  --v-field-border-opacity: 0.2;
}
</style>
