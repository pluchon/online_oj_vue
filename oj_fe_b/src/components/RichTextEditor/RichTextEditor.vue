<template>
  <div class="rich-text-editor-container" :class="{ 'is-disabled': disabled }">
    <!-- 编辑器顶部工具栏 -->
    <Toolbar
      class="editor-toolbar"
      :editor="editorRef"
      :default-config="toolbarConfig"
      :mode="mode"
    />
    <!-- 富文本编辑核心区域 -->
    <Editor
      class="editor-content"
      :style="{ height: height, minHeight: minHeight }"
      :model-value="modelValue"
      :default-config="editorConfig"
      :mode="mode"
      @on-created="handleCreated"
      @on-change="handleChange"
    />
  </div>
</template>

<script src="./RichTextEditor.js"></script>
<style lang="scss" scoped src="./RichTextEditor.scss"></style>
