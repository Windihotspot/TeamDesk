<script setup>
import { ref } from 'vue'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import Filtericon from '@/components/Filtericon.vue'

const showFilterModal = ref(false)
const selectedCategory = ref('')

const dashboardData = ref({
  teams: []
})

const openFilterModal = () => {
  showFilterModal.value = true
}

const closeFilterModal = () => {
  showFilterModal.value = false
}

const comments = ref([
  {
    id: 1,
    author: 'ifiok Usanga',
    product: 'snr dev',
    time: '09:00 AM',
    text: '',
    avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Joyce'
  },
  {
    id: 2,
    author: 'Gladyce',
    product: 'Food App',
    time: '08:45 AM',
    text: 'Love the new update 🎉',
    avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Gladyce'
  }
])
const newComment = ref('')

const addComment = () => {
  const text = newComment.value.trim()
  if (!text) return

  const comment = {
    id: Date.now(),
    author: 'You',
    product: 'Current Project',
    time: new Date().toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit'
    }),
    text,
    avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=You'
  }

  comments.value.unshift(comment)
  newComment.value = ''
}
</script>

<template>
  <div class="bg-blue-50 border-gray-400 rounded-2xl p-6 shadow-lg">
    <div class="flex items-center justify-between mb-4">
      <h2 class="text-lg font-semibold text-gray-800 mb-4">Comments</h2>
      <font-awesome-icon icon="sliders" class="mr-7 hover:bg-gray-200" @click="openFilterModal" />
      <!-- Modal -->
      <div
        v-if="showFilterModal"
        class="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
      >
        <div class="bg-white p-5 rounded-lg w-[400px] relative">
          <!-- close button -->
          <button class="absolute top-2 right-2 text-gray-600" @click="closeFilterModal">✕</button>

          <!-- your component -->
          <Filtericon :teams="dashboardData?.teams" v-model:selectedCategory="selectedCategory" />
        </div>
      </div>
    </div>
    <div class="flex flex-col gap-4">
      <div v-for="comment in comments" :key="comment.id" class="flex gap-3">
        <img :src="comment.avatar" class="w-9 h-9 rounded-full object-cover" />

        <div>
          <div class="flex gap-2">
            <span class="text-sm font-semibold">
              {{ comment.author }}
            </span>
            <span class="text-xs text-gray-400">on</span>
            <span class="text-xs text-gray-600">
              {{ comment.product }}
            </span>
          </div>

          <p class="text-xs text-gray-400">
            {{ comment.time }}
          </p>

          <p class="text-sm text-gray-600">
            {{ comment.text }}
          </p>
        </div>
      </div>
    </div>
    <!-- Input box -->
<div class="mt-6 flex gap-2">
  <input
    v-model="newComment"
    type="text"
    placeholder="Write a comment..."
    class="flex-1 px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
    @keyup.enter="addComment"
  />

  <button
    @click="addComment"
    class="px-4 py-2 bg-blue-500 text-white text-sm rounded-lg hover:bg-blue-600"
  >
    Send
  </button>
</div>
  </div>
</template>
