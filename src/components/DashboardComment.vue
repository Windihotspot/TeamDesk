<script setup>
import { ref, onMounted } from 'vue'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import Filtericon from '@/components/Filtericon.vue'
// import { supabase } from '../supabase'  

const props = defineProps({
  dashboardData: {
    type: Object,
    default: null
  }
})

const emit = defineEmits(['update:selectedCategory'])

const showFilterModal = ref(false)
const selectedCategory = ref(null)

const comments = ref([])
const newComment = ref('')
const isSubmitting = ref(false)

// 🔥 FETCH COMMENTS
const fetchComments = async () => {
  const { data, error } = await supabase
    .from('dashboard_comments')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching comments:', error)
  } else {
    comments.value = data || []
  }
}

// 🔥 ADD COMMENT TO SUPABASE
const addComment = async () => {
  const text = newComment.value.trim()
  if (!text || isSubmitting.value) return

  isSubmitting.value = true

  const newEntry = {
    author: 'You',
    product: 'Current Project',
    text,
    avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=You'
  }

  const { data, error } = await supabase
    .from('dashboard_comments')
    .insert([newEntry])
    .select()
    .single()

  if (error) {
    console.error('Error adding comment:', error)
    alert('Failed to post comment. Please try again.')
  } else if (data) {
    comments.value.unshift(data)
    newComment.value = ''
  }

  isSubmitting.value = false
}

const openFilterModal = () => {
  showFilterModal.value = true
}

const closeFilterModal = () => {
  showFilterModal.value = false
}

onMounted(() => {
  fetchComments()
})
</script>

<template>
  <div class="bg-blue-50 border border-gray-200 rounded-2xl p-6 shadow-lg">
    <!-- HEADER -->
    <div class="flex items-center justify-between mb-6">
      <h2 class="text-lg font-semibold text-gray-800">Comments</h2>
      <font-awesome-icon
        icon="sliders"
        class="text-gray-500 hover:text-gray-700 cursor-pointer p-2 hover:bg-gray-100 rounded-lg transition"
        @click="openFilterModal"
      />
    </div>

    <!-- COMMENTS LIST -->
    <div class="flex flex-col gap-5 max-h-[400px] overflow-y-auto pr-2">
      <div
        v-for="comment in comments"
        :key="comment.id"
        class="flex gap-3"
      >
        <img
          :src="comment.avatar"
          class="w-9 h-9 rounded-full object-cover flex-shrink-0"
        />
        <div class="flex-1">
          <div class="flex items-center gap-2">
            <span class="text-sm font-semibold text-gray-800">{{ comment.author }}</span>
            <span class="text-xs text-gray-400">•</span>
            <span class="text-xs text-gray-600">{{ comment.product }}</span>
          </div>

          <p class="text-xs text-gray-500 mt-0.5">
            {{ new Date(comment.created_at).toLocaleString([], {
              month: 'short',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            }) }}
          </p>

          <p class="text-sm text-gray-700 mt-1 leading-relaxed">
            {{ comment.text }}
          </p>
        </div>
      </div>

      <div v-if="comments.length === 0" class="text-center text-gray-500 py-8">
        No comments yet. Be the first to comment!
      </div>
    </div>

    <!-- COMMENT INPUT -->
    <div class="mt-6 flex gap-2">
      <input
        v-model="newComment"
        type="text"
        placeholder="Write a comment..."
        class="flex-1 px-4 py-3 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
        @keyup.enter="addComment"
        :disabled="isSubmitting"
      />
      <button
        @click="addComment"
        :disabled="isSubmitting || !newComment.trim()"
        class="px-5 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white text-sm font-medium rounded-xl transition"
      >
        {{ isSubmitting ? 'Sending...' : 'Send' }}
      </button>
    </div>

    <!-- ==================== FILTER MODAL ==================== -->
    <Teleport to="body">
      <div
        v-if="showFilterModal"
        class="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
      >
        <div class="bg-white rounded-2xl w-full max-w-md mx-4 shadow-2xl relative">
          <!-- Close Button -->
          <button
            class="absolute -top-4 -right-4 bg-white w-9 h-9 rounded-full shadow-lg flex items-center justify-center text-xl font-bold text-gray-500 hover:text-gray-700 border border-gray-200"
            @click="closeFilterModal"
          >
            ✕
          </button>

          <div class="p-6">
            <Filtericon
              :teams="dashboardData?.teams || []"
              v-model="selectedCategory"
            />
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>