import { defineStore } from 'pinia'
import { supabase } from '@/services/supabase'

export const useProjectStore = defineStore('project', {
  actions: {
    async createProject(projectData) {
      const user = (await supabase.auth.getUser()).data.user

      const { data, error } = await supabase
        .from('projects')
        .insert([
          {
            ...projectData,
            created_by: user.id
          }
        ])
        .select()
        .single()

      if (error) throw error

      return data
    }
  }
})