<template>
  <div class="markdown-editor-container" :style="{ height }">
    <!-- 左半侧：Markdown 源码编辑区 -->
    <div class="editor-half">
      <div class="half-header">
        <span class="header-title">Markdown 源码编辑</span>
      </div>
      <div class="half-body">
        <textarea
          ref="textareaRef"
          :value="modelValue"
          :placeholder="placeholder"
          class="editor-textarea"
          @input="handleInput"
          @keydown="handleKeydown"
        />
      </div>
    </div>

    <!-- 右半侧：实时排版预览区 -->
    <div class="preview-half">
      <div class="half-header">
        <span class="header-title">实时排版预览</span>
      </div>
      <div class="half-body preview-scroll">
        <div v-if="htmlContent" class="markdown-body" v-html="htmlContent" />
        <div v-else class="preview-placeholder">
          <span>（预览区域）</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script src="./MarkdownEditor.js"></script>
<style scoped lang="scss" src="./MarkdownEditor.scss"></style>
