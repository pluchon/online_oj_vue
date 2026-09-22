<template>
  <div class="code-editor-container" :class="{ 'is-disabled': disabled, 'is-dark': currentTheme === 'vs-dark' }">
    <!-- 顶部控制栏：支持标题展示、编程语言切换、主题切换、格式化 -->
    <div class="code-editor-header">
      <div class="header-left">
        <span v-if="title" class="editor-title">{{ title }}</span>
        <!-- 编程语言选择器 -->
        <el-select
          v-model="currentLanguage"
          size="small"
          class="lang-select"
          popper-class="dark-lang-select-popper"
          :disabled="disabled"
          @change="handleLanguageChange"
        >
          <el-option
            v-for="item in languageOptions"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
      </div>

      <div class="header-right">
        <!-- 复制代码按钮（copyable 时显示） -->
        <el-button
          v-if="copyable"
          size="small"
          class="header-btn"
          text
          @click="copyCode"
        >
          复制
        </el-button>
        <!-- 主题切换按钮 -->
        <el-tooltip :content="currentTheme === 'vs-dark' ? '切换为浅色代码主题' : '切换为深色代码主题'" placement="top">
          <el-button
            size="small"
            class="header-btn"
            text
            @click="toggleTheme"
          >
            {{ currentTheme === 'vs-dark' ? '深色' : '浅色' }}
          </el-button>
        </el-tooltip>
        <!-- 格式化代码按钮 -->
        <el-tooltip content="格式化代码格式" placement="top">
          <el-button
            size="small"
            class="header-btn"
            text
            :disabled="disabled || readOnly"
            @click="handleFormatCode"
          >
            格式化
          </el-button>
        </el-tooltip>
      </div>
    </div>

    <!-- Monaco 代码编辑器核心挂载容器 -->
    <div class="code-editor-body" :style="{ height: height }">
      <VueMonacoEditor
        :value="modelValue"
        :path="editorPath"
        :language="currentLanguage"
        :theme="currentTheme"
        :options="mergedOptions"
        @update:value="handleValueChange"
        @mount="handleEditorMount"
      />
    </div>
  </div>
</template>

<script src="./CodeEditor.js"></script>
<style lang="scss" scoped src="./CodeEditor.scss"></style>
