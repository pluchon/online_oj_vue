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
        <!-- 重置模板按钮插槽或快捷触发 -->
        <slot name="extra-actions" />
      </div>
    </div>

    <!-- Monaco 代码编辑器核心挂载容器 -->
    <div class="code-editor-body" :style="height && height !== '100%' ? { height: height } : {}">
      <VueMonacoEditor
        :value="modelValue"
        :language="currentLanguage"
        :theme="currentTheme"
        :options="mergedOptions"
        height="100%"
        width="100%"
        @update:value="handleValueChange"
        @mount="handleEditorMount"
      />
    </div>
  </div>
</template>

<script src="./CodeEditor.js"></script>
<style lang="scss" scoped src="./CodeEditor.scss"></style>
