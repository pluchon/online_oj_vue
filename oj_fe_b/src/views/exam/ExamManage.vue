<template>
  <div class="exam-manage-container">
    <!-- 顶部筛选与操作栏（左侧无占位符输入，右侧操作按钮） -->
    <div class="filter-header-bar">
      <div class="filter-left">
        <!-- 时间范围筛选 -->
        <span class="filter-label">时间范围</span>
        <el-date-picker
          v-model="dateRange"
          type="datetimerange"
          range-separator="至"
          start-placeholder=""
          end-placeholder=""
          value-format="YYYY-MM-DD HH:mm:ss"
          :default-time="defaultTime"
          class="filter-date-picker"
          @change="handleDateChange"
        />

        <!-- 竞赛名称搜索 -->
        <span class="filter-label">竞赛名称</span>
        <el-input
          v-model="queryParams.title"
          clearable
          class="filter-input"
          @keyup.enter="handleSearch"
          @clear="handleSearch"
        />
      </div>

      <!-- 右侧操作按钮组（添加按钮已移至表格左下角） -->
      <div class="filter-right">
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

    <!-- 竞赛数据表格展示区（列宽科学配比，时间不截断） -->
    <div class="table-container">
      <el-table
        v-loading="loading"
        :data="examList"
        class="custom-editorial-table"
        header-cell-class-name="editorial-table-header"
        row-class-name="editorial-table-row"
        style="width: 100%"
      >
        <!-- 竞赛标题 -->
        <el-table-column
          prop="title"
          label="竞赛标题"
          min-width="200"
          show-overflow-tooltip
        >
          <template #default="{ row }">
            <span class="exam-title-text">{{ row.title }}</span>
          </template>
        </el-table-column>

        <!-- 竞赛开始时间 -->
        <el-table-column
          prop="startTime"
          label="竞赛开始时间"
          width="190"
          align="center"
          show-overflow-tooltip
        >
          <template #default="{ row }">
            <span class="tabular-text">{{ row.startTime }}</span>
          </template>
        </el-table-column>

        <!-- 竞赛结束时间 -->
        <el-table-column
          prop="endTime"
          label="竞赛结束时间"
          width="190"
          align="center"
          show-overflow-tooltip
        >
          <template #default="{ row }">
            <span class="tabular-text">{{ row.endTime }}</span>
          </template>
        </el-table-column>

        <!-- 参赛人数 -->
        <el-table-column
          label="参赛人数"
          width="90"
          align="center"
        >
          <template #default="{ row }">
            <span class="tabular-text">{{ row.enterCount ?? 0 }}</span>
          </template>
        </el-table-column>

        <!-- 是否开赛 -->
        <el-table-column
          label="是否开赛"
          width="100"
          align="center"
        >
          <template #default="{ row }">
            <div class="status-indicator">
              <span
                class="status-dot"
                :class="isStarted(row.startTime) ? 'dot-active' : 'dot-waiting'"
              >●</span>
              <span class="status-label">
                {{ isStarted(row.startTime) ? '已开赛' : '未开赛' }}
              </span>
            </div>
          </template>
        </el-table-column>

        <!-- 是否发布 -->
        <el-table-column
          label="是否发布"
          width="100"
          align="center"
        >
          <template #default="{ row }">
            <div class="status-indicator">
              <span
                class="status-dot"
                :class="isPublished(row) ? 'dot-active' : 'dot-waiting'"
              >●</span>
              <span class="status-label">
                {{ isPublished(row) ? '已发布' : '未发布' }}
              </span>
            </div>
          </template>
        </el-table-column>

        <!-- 创建用户 -->
        <el-table-column
          prop="creatorName"
          label="创建用户"
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
          width="245"
          align="center"
          fixed="right"
        >
          <template #default="{ row }">
            <span v-if="isStarted(row.startTime)" class="action-disabled-text">
              已开赛，不允许操作
            </span>
            <div v-else class="action-cell">
              <button
                type="button"
                class="action-btn btn-action-edit"
                @click="handleEditExam(row)"
              >
                编辑
              </button>
              <button
                type="button"
                class="action-btn btn-action-delete"
                @click="handleDeleteExam(row)"
              >
                删除
              </button>
              <button
                type="button"
                class="action-btn"
                :class="isPublished(row) ? 'btn-action-unpublish' : 'btn-action-publish'"
                @click="handleTogglePublish(row)"
              >
                {{ isPublished(row) ? '撤销发布' : '发布' }}
              </button>
            </div>
          </template>
        </el-table-column>

        <!-- 空状态展示：使用小蒙定制插画与针对性文案 -->
        <template #empty>
          <OjEmpty
            :text="loadError ? '竞赛列表加载失败' : '暂无竞赛数据'"
            :sub-text="loadError ? '请稍后点击搜索重试' : ''"
            :image-size="130"
          />
        </template>
      </el-table>
    </div>

    <!-- 底部通用分页器组件（左下角布局“添加竞赛”操作按钮） -->
    <pagination
      v-model:page="queryParams.pageNum"
      :limit="queryParams.pageSize"
      :total="total"
      @pagination="loadExamList"
    >
      <template #left>
        <button class="btn-add-bottom" @click="handleAddExam">
          <el-icon class="btn-icon"><Plus /></el-icon>
          <span>添加竞赛</span>
        </button>
      </template>
    </pagination>

    <!-- 竞赛新增与编辑抽屉组件 -->
    <ExamDrawer
      ref="examDrawerRef"
      @success="handleDrawerSuccess"
    />
  </div>
</template>

<script src="./ExamManage.js"></script>
<style scoped lang="scss" src="./ExamManage.scss"></style>
