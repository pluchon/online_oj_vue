<template>
  <div class="question-manage-container">
    <!-- 顶部查询与操作栏 -->
    <div class="filter-header-bar">
      <div class="filter-left">
        <!-- 题目难度选择通用组件 -->
        <question-difficulty-select
          v-model="queryParams.difficulty"
          include-all
          class="filter-select"
          @change="handleSearch"
        />

        <!-- 题目标题搜索 -->
        <el-input
          v-model="queryParams.title"
          placeholder="请输入要搜索的题目标题"
          clearable
          class="filter-input"
          @keyup.enter="handleSearch"
          @clear="handleSearch"
        />

        <!-- 搜索与重置按钮 -->
        <el-button type="primary" class="btn-search" :icon="Search" @click="handleSearch">
          搜索
        </el-button>
        <el-button class="btn-reset" :icon="Refresh" @click="handleReset">
          重置
        </el-button>
      </div>

      <div class="filter-right">
        <!-- 添加题目操作按钮 -->
        <el-button type="primary" class="btn-add" :icon="Plus" plain @click="handleAddQuestion">
          + 添加题目
        </el-button>
      </div>
    </div>

    <!-- 题目数据表格展示区 -->
    <div class="table-container">
      <el-table
        v-loading="loading"
        :data="questionList"
        class="custom-question-table"
        header-cell-class-name="question-table-header"
        row-class-name="question-table-row"
        stripe
        style="width: 100%"
      >
        <!-- 题目 ID -->
        <el-table-column
          prop="questionId"
          label="题目id"
          min-width="200"
          show-overflow-tooltip
        />

        <!-- 题目标题 -->
        <el-table-column
          prop="title"
          label="题目标题"
          min-width="180"
          show-overflow-tooltip
        >
          <template #default="{ row }">
            <span class="question-title-text">{{ row.title }}</span>
          </template>
        </el-table-column>

        <!-- 题目难度 -->
        <el-table-column
          prop="difficulty"
          label="题目难度"
          width="120"
          align="center"
        >
          <template #default="{ row }">
            <difficulty-tag :difficulty="row.difficulty" :desc="row.difficultyDesc" />
          </template>
        </el-table-column>

        <!-- 创建人 -->
        <el-table-column
          prop="creatorName"
          label="创建人"
          width="140"
          align="center"
        />

        <!-- 创建时间 -->
        <el-table-column
          prop="createTime"
          label="创建时间"
          width="190"
          align="center"
        />

        <!-- 操作栏 -->
        <el-table-column
          label="操作"
          width="130"
          align="center"
          fixed="right"
        >
          <template #default="{ row }">
            <div class="action-btn-group">
              <el-button
                link
                type="primary"
                class="btn-action-edit"
                @click="handleEditQuestion(row)"
              >
                编辑
              </el-button>
              <el-button
                link
                type="danger"
                class="btn-action-delete"
                @click="handleDeleteQuestion(row)"
              >
                删除
              </el-button>
            </div>
          </template>
        </el-table-column>

        <!-- 空状态展示 -->
        <template #empty>
          <div class="table-empty-state">
            <el-empty description="暂无符合条件的题目数据" :image-size="100">
              <el-button type="primary" size="small" @click="handleReset">重置筛选</el-button>
            </el-empty>
          </div>
        </template>
      </el-table>
    </div>

    <!-- 底部通用分页器组件 -->
    <pagination
      v-model:page="queryParams.pageNum"
      v-model:limit="queryParams.pageSize"
      :total="total"
      @pagination="loadQuestionList"
    />

    <!-- 题目新增与编辑抽屉组件 -->
    <QuestionDrawer
      ref="questionDrawerRef"
      @success="handleDrawerSuccess"
    />
  </div>
</template>

<script src="./QuestionManage.js"></script>
<style scoped lang="scss" src="./QuestionManage.scss"></style>
