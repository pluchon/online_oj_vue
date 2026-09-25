<template>
  <div class="question-manage-container">
    <!-- 顶部查询与操作栏（左侧无占位符输入，右侧搜索/重置按钮） -->
    <div class="filter-header-bar">
      <div class="filter-left">
        <!-- 题目难度选择 -->
        <span class="filter-label">题目难度</span>
        <question-difficulty-select
          v-model="queryParams.difficulty"
          include-all
          class="filter-select"
          @change="handleSearch"
        />

        <!-- 题目标签筛选 -->
        <span class="filter-label">题目标签</span>
        <question-tag-select
          v-model="queryParams.tagId"
          v-model:category="queryParams.tagCategory"
          :options="tagOptions"
          :loading="tagLoading"
          class="filter-tag-select"
          @change="handleSearch"
        />

        <!-- 题目标题搜索 -->
        <span class="filter-label">题目标题</span>
        <el-input
          v-model="queryParams.title"
          clearable
          class="filter-input"
          @keyup.enter="handleSearch"
          @clear="handleSearch"
        />
      </div>

      <!-- 右侧筛选操作按钮组（添加按钮已移至表格左下角） -->
      <div class="filter-right">
        <button class="btn-reset" @click="openTagManage">
          <el-icon class="btn-icon"><CollectionTag /></el-icon>
          <span>标签管理</span>
        </button>
        <button class="btn-search" @click="handleSearch">
          <el-icon class="btn-icon"><Search /></el-icon>
          <span>搜索</span>
        </button>
        <button class="btn-reset" @click="handleReset">
          <el-icon class="btn-icon"><Refresh /></el-icon>
          <span>重置</span>
        </button>
      </div>
    </div>

    <!-- 题目数据表格展示区（列宽科学配比，创建时间不截断） -->
    <div class="table-container">
      <el-table
        v-loading="loading"
        :data="questionList"
        class="custom-editorial-table"
        header-cell-class-name="editorial-table-header"
        row-class-name="editorial-table-row"
        style="width: 100%"
      >
        <!-- 题目 ID -->
        <el-table-column
          prop="questionId"
          label="题目id"
          width="190"
          show-overflow-tooltip
        >
          <template #default="{ row }">
            <span class="tabular-text">{{ row.questionId }}</span>
          </template>
        </el-table-column>

        <!-- 题目标题 -->
        <el-table-column
          prop="title"
          label="题目标题"
          min-width="240"
          show-overflow-tooltip
        >
          <template #default="{ row }">
            <button type="button" class="question-title-link" @click="openPreview(row.questionId)">{{ row.title }}</button>
          </template>
        </el-table-column>

        <!-- 题目难度 -->
        <el-table-column
          prop="difficulty"
          label="题目难度"
          width="100"
          align="center"
        >
          <template #default="{ row }">
            <difficulty-tag :difficulty="row.difficulty" :desc="row.difficultyDesc" />
          </template>
        </el-table-column>

        <!-- 题目标签 -->
        <el-table-column
          label="标签"
          min-width="180"
        >
          <template #default="{ row }">
            <div v-if="row.tags && row.tags.length" class="tag-chip-list">
              <span
                v-for="tag in row.tags"
                :key="tag.tagId"
                class="tag-chip"
              >{{ tag.tagName }}</span>
            </div>
            <span v-else class="tag-empty">—</span>
          </template>
        </el-table-column>

        <!-- 创建人 -->
        <el-table-column
          prop="creatorName"
          label="创建人"
          width="130"
          align="center"
          show-overflow-tooltip
        />

        <!-- 创建时间 -->
        <el-table-column
          prop="createTime"
          label="创建时间"
          width="190"
          align="center"
          show-overflow-tooltip
        >
          <template #default="{ row }">
            <span class="tabular-text">{{ row.createTime }}</span>
          </template>
        </el-table-column>

        <!-- 操作栏（规范统一规格按钮，独立操作色彩识别） -->
        <el-table-column
          label="操作"
          width="160"
          align="center"
          fixed="right"
        >
          <template #default="{ row }">
            <div class="action-cell">
              <button
                type="button"
                class="action-btn btn-action-edit"
                @click="handleEditQuestion(row)"
              >
                编辑
              </button>
              <button
                type="button"
                class="action-btn btn-action-delete"
                @click="handleDeleteQuestion(row)"
              >
                删除
              </button>
            </div>
          </template>
        </el-table-column>

        <!-- 空状态展示：使用小蒙定制插画与针对性文案 -->
        <template #empty>
          <OjEmpty
            :text="loadError ? '题目列表加载失败' : '暂无题目数据'"
            :sub-text="loadError ? '请稍后点击搜索重试' : ''"
            :image-size="130"
          />
        </template>
      </el-table>
    </div>

    <!-- 底部通用分页器组件（左下角布局“添加题目”操作按钮） -->
    <pagination
      v-model:page="queryParams.pageNum"
      :limit="queryParams.pageSize"
      :total="total"
      @pagination="loadQuestionList"
    >
      <template #left>
        <button class="btn-add-bottom" @click="handleAddQuestion">
          <el-icon class="btn-icon"><Plus /></el-icon>
          <span>添加题目</span>
        </button>
      </template>
    </pagination>

    <!-- 题目新增与编辑抽屉组件 -->
    <!-- 题目详情预览 -->
    <QuestionPreview ref="previewRef" />

    <QuestionDrawer
      ref="questionDrawerRef"
      :tag-options="tagOptions"
      @success="handleDrawerSuccess"
    />

    <!-- 标签管理弹窗 -->
    <TagManageDialog ref="tagManageRef" @changed="handleTagsChanged" />
  </div>
</template>

<script src="./QuestionManage.js"></script>
<style scoped lang="scss" src="./QuestionManage.scss"></style>
