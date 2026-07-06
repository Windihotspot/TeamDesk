

export const useTeamStore = defineStore('teams', () => {
    const teams = ref([])
    const loading = ref(false)

    const fetchTeams = async () => {
        loading.value = true

        const { data } = await supabase
            .from('teams')
            .select('*')
            .order('name')

        teams.value = data || []
        loading.value = false
    }

    return {
        teams,
        loading,
        fetchTeams
    }
})