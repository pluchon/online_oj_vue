<template>
  <section class="ai-tutor-card">
    <!-- 头部：标题、剩余次数、关闭 -->
    <div class="tutor-header">
      <div class="tutor-title">
        <svg class="tutor-star" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M12 2.8l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 16.8l-5.4 2.9 1-6.1-4.4-4.3 6.1-.9z" />
        </svg>
        <span>AI 辅导</span>
      </div>
      <div class="tutor-header-right">
        <span v-if="session && session.available" class="quota-tag">今日剩余 {{ session.remaining }} 次</span>
        <button type="button" class="btn-close" aria-label="关闭" @click="$emit('close')">
          <el-icon><Close /></el-icon>
        </button>
      </div>
    </div>

    <!-- 加载、失败、不可用 -->
    <div v-if="loading" class="tutor-state">
      <el-icon class="is-loading"><Loading /></el-icon>
    </div>
    <div v-else-if="loadError" class="tutor-state">
      <span>加载失败</span>
      <button type="button" class="btn-text" @click="loadSession">重试</button>
    </div>
    <div v-else-if="session && !session.available" class="tutor-unavailable">
      <img :src="unavailableImage" alt="竞赛进行中，AI 辅导暂不可用" class="unavailable-img" />
    </div>

    <template v-else-if="session">
      <!-- 消息列表 -->
      <div ref="listRef" class="tutor-messages">
        <div v-if="!messages.length" class="tutor-intro">
          <p>我会帮你理清思路、分析提交和编译错误，但不会直接给出完整答案。</p>
          <p>只回答与本题相关的问题。</p>
        </div>
        <div
          v-for="(item, index) in messages"
          :key="item.messageId || `local-${index}`"
          class="tutor-message"
          :class="item.fromUser ? 'from-user' : 'from-ai'"
        >
          <div v-if="item.fromUser" class="bubble user-bubble">{{ item.content }}</div>
          <div v-else class="bubble ai-bubble">
            <div v-if="item.content" class="markdown-body" v-html="render(item.content)"></div>
            <div v-else-if="item.streaming" class="thinking">
              <el-icon class="is-loading"><Loading /></el-icon>
              <span>思考中</span>
            </div>
            <div v-if="item.failed" class="bubble-error">{{ item.failed }}</div>
          </div>
        </div>
      </div>

      <!-- 快捷操作 -->
      <div class="tutor-actions">
        <button
          v-for="action in quickActions"
          :key="action.code"
          type="button"
          class="action-chip"
          :disabled="asking || session.remaining <= 0"
          @click="ask(action.code, '')"
        >
          {{ action.label }}
        </button>
      </div>

      <!-- 输入区 -->
      <div class="tutor-input">
        <el-input
          v-model="draft"
          type="textarea"
          :autosize="{ minRows: 2, maxRows: 5 }"
          resize="none"
          maxlength="500"
          :disabled="asking || session.remaining <= 0"
          :placeholder="session.remaining > 0 ? '问问与本题有关的问题，Enter 发送，Shift+Enter 换行' : '今日次数已用完，明天再来吧'"
          @keydown.enter.exact.prevent="handleSend"
        />
        <button
          v-if="asking"
          type="button"
          class="btn-send is-stop"
          @click="stop"
        >
          停止
        </button>
        <button
          v-else
          type="button"
          class="btn-send"
          :disabled="!draft.trim() || session.remaining <= 0"
          @click="handleSend"
        >
          发送
        </button>
      </div>
    </template>
  </section>
</template>

<script src="./AiTutorPanel.js"></script>
<style lang="scss" scoped src="./AiTutorPanel.scss"></style>
