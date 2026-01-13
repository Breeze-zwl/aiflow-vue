<template>
  <div class="chat-container">
    <div class="chat-empty" v-if="messages.length === 0">
      <div class="chat-empty-icon">
        <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M24 4C12.954 4 4 12.954 4 24s8.954 20 20 20c3.262 0 6.348-.783 9.072-2.17l8.758 2.17-2.17-8.758C41.217 32.348 44 28.262 44 24c0-11.046-8.954-20-20-20z" stroke="#dcdfe6" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          <circle cx="16" cy="24" r="2" fill="#dcdfe6"/>
          <circle cx="24" cy="24" r="2" fill="#dcdfe6"/>
          <circle cx="32" cy="24" r="2" fill="#dcdfe6"/>
        </svg>
      </div>
      <p class="chat-empty-text">在下面的框中输入内容开始调试聊天机器人</p>
    </div>

    <div class="chat-messages" v-else ref="messagesRef">
      <div
        v-for="(msg, index) in messages"
        :key="index"
        class="chat-message"
        :class="msg.role === 'user' ? 'chat-message--user' : 'chat-message--bot'"
      >
        <div class="chat-message-avatar">
          <template v-if="msg.role === 'user'">
            <div class="avatar-user">
              <Icon icon="ep:user" />
            </div>
          </template>
          <template v-else>
            <div class="avatar-bot">
              <Icon icon="ep:chat-dot-round" />
            </div>
          </template>
        </div>
        <div class="chat-message-content">
          <div class="chat-message-header" v-if="msg.role === 'bot'">
            <span class="chat-message-name">智能助手</span>
            <span class="chat-message-model" v-if="msg.model">{{ msg.model }}</span>
          </div>
          <div class="chat-message-text" v-html="msg.content"></div>
        </div>
      </div>
      <div v-if="loading" class="chat-message chat-message--bot">
        <div class="chat-message-avatar">
          <div class="avatar-bot">
            <Icon icon="ep:chat-dot-round" />
          </div>
        </div>
        <div class="chat-message-content">
          <div class="chat-message-text">
            <span class="typing-indicator">
              <span></span><span></span><span></span>
            </span>
          </div>
        </div>
      </div>
    </div>

    <div class="chat-input-wrap">
      <el-input
        v-model="inputValue"
        placeholder="和 Bot 聊天"
        :disabled="loading"
        @keyup.enter="handleSend"
      >
        <template #suffix>
          <el-button
            type="primary"
            :icon="Promotion"
            circle
            size="small"
            :loading="loading"
            @click="handleSend"
          />
        </template>
      </el-input>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, nextTick, watch } from 'vue'
import { Promotion } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

export interface ChatMessage {
  role: 'user' | 'bot'
  content: string
  model?: string
  workflow?: string
}

const props = withDefaults(defineProps<{
  messages?: ChatMessage[]
  loading?: boolean
  params?: Record<string, any>
  beforeSend?: (message: string) => boolean | Promise<boolean>
}>(), {
  messages: () => [],
  loading: false,
  params: () => ({}),
})

const emit = defineEmits<{
  (e: 'send', message: string): void
}>()

const inputValue = ref('')
const messagesRef = ref<HTMLElement | null>(null)
const messageApi = ElMessage

const handleSend = async () => {
  const message = inputValue.value.trim()
  if (!message) {
    messageApi.warning('提问不能为空')
    return
  }
  if (props.loading) return
  if (props.beforeSend) {
    const canSend = await props.beforeSend(message)
    if (!canSend) return
  }
  inputValue.value = ''
  emit('send', message)
}

const scrollToBottom = () => {
  nextTick(() => {
    if (messagesRef.value) {
      messagesRef.value.scrollTop = messagesRef.value.scrollHeight
    }
  })
}

const reset = () => {
  inputValue.value = ''
}

watch(
  () => [props.messages, props.loading],
  () => {
    scrollToBottom()
  },
  { deep: true }
)

defineExpose({
  reset,
})
</script>

<style lang="scss" scoped>
.chat-container {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-height: 0;
  overflow: hidden;
}

.chat-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  flex: 1;
  color: #9ca3af;
}

.chat-empty-text {
  margin-top: 12px;
  font-size: 14px;
}

.chat-messages {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
}

.chat-message {
  display: flex;
  gap: 10px;
  margin-bottom: 14px;
}

.chat-message--user {
  flex-direction: row-reverse;
}

.chat-message-avatar {
  width: 28px;
  height: 28px;
}

.avatar-user,
.avatar-bot {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 14px;
}

.avatar-user {
  background: #3b82f6;
}

.avatar-bot {
  background: #10b981;
}

.chat-message-content {
  max-width: 80%;
}

.chat-message-header {
  display: flex;
  gap: 8px;
  align-items: center;
  margin-bottom: 4px;
  font-size: 12px;
  color: #94a3b8;
}

.chat-message-text {
  background: #f8fafc;
  padding: 10px 12px;
  border-radius: 10px;
  font-size: 14px;
  color: #1f2937;
  word-break: break-word;
}

.chat-message--user .chat-message-text {
  background: #e0f2fe;
}

.chat-input-wrap {
  padding: 12px 16px;
  border-top: 1px solid #e5e7eb;
  background: #fff;
}

.typing-indicator {
  display: inline-flex;
  gap: 4px;
}

.typing-indicator span {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #cbd5f5;
  animation: typing 1.2s infinite ease-in-out;
}

.typing-indicator span:nth-child(2) {
  animation-delay: 0.15s;
}

.typing-indicator span:nth-child(3) {
  animation-delay: 0.3s;
}

@keyframes typing {
  0%, 80%, 100% { transform: scale(0.8); opacity: 0.5; }
  40% { transform: scale(1); opacity: 1; }
}
</style>
