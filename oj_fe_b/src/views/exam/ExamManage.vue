<template>
  <div class="exam-manage-container">
    <!-- 顶部筛选与操作栏 -->
    <div class="filter-header-bar">
      <div class="filter-left">
        <!-- 时间范围筛选 -->
        <el-date-picker
          v-model="dateRange"
          type="datetimerange"
          range-separator="至"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          value-format="YYYY-MM-DD HH:mm:ss"
          :default-time="defaultTime"
          class="filter-date-picker"
          @change="handleDateChange"
        />

        <!-- 竞赛名称搜索 -->
        <el-input
          v-model="queryParams.title"
          placeholder="请输入您要搜索的竞赛名称"
          clearable
          class="filter-input"
          @keyup.enter="handleSearch"
          @clear="handleSearch"
        />

        <!-- 搜索与重置按钮 -->
        <el-button type="primary" class="btn-search" @click="handleSearch">
          搜索
        </el-button>
        <el-button class="btn-reset" @click="handleReset">
          重置
        </el-button>
      </div>

      <div class="filter-right">
        <!-- 添加竞赛操作按钮 -->
        <el-button type="primary" class="btn-add" plain @click="handleAddExam">
          + 添加竞赛
        </el-button>
      </div>
    </div>

    <!-- 竞赛数据表格展示区 -->
    <div class="table-container">
      <el-table
        v-loading="loading"
        :data="examList"
        class="custom-exam-table"
        header-cell-class-name="custom-table-header"
        row-class-name="custom-table-row"
        stripe
        style="width: 100%"
      >
        <!-- 竞赛标题 -->
        <el-table-column
          prop="title"
          label="竞赛标题"
          min-width="180"
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
        />

        <!-- 竞赛结束时间 -->
        <el-table-column
          prop="endTime"
          label="竞赛结束时间"
          width="190"
          align="center"
        />

        <!-- 是否开赛（前端动态计算开赛状态） -->
        <el-table-column
          label="是否开赛"
          width="120"
          align="center"
        >
          <template #default="{ row }">
            <el-tag
              :type="isStarted(row.startTime) ? 'warning' : 'info'"
              class="exam-status-tag"
            >
              {{ isStarted(row.startTime) ? '已开赛' : '未开赛' }}
            </el-tag>
          </template>
        </el-table-column>

        <!-- 是否发布 -->
        <el-table-column
          label="是否发布"
          width="120"
          align="center"
        >
          <template #default="{ row }">
            <el-tag
              :type="row.status === 1 ? 'success' : 'info'"
              class="exam-status-tag"
            >
              {{ row.status === 1 ? '已发布' : '未发布' }}
            </el-tag>
          </template>
        </el-table-column>

        <!-- 创建用户 -->
        <el-table-column
          prop="creatorName"
          label="创建用户"
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
          width="180"
          align="center"
          fixed="right"
        >
          <template #default="{ row }">
            <span v-if="isStarted(row.startTime)" class="action-disabled-text">
              已开赛，不允许操作
            </span>
            <div v-else class="action-btn-group">
              <el-button
                link
                type="primary"
                class="action-btn-link"
                @click="handleEditExam(row)"
              >
                编辑
              </el-button>
              <el-button
                link
                type="primary"
                class="action-btn-link"
                @click="handleDeleteExam(row)"
              >
                删除
              </el-button>
              <el-button
                link
                type="primary"
                class="action-btn-link"
                @click="handleTogglePublish(row)"
              >
                {{ row.status === 1 ? '撤销发布' : '发布' }}
              </el-button>
            </div>
          </template>
        </el-table-column>

        <!-- 空状态展示 -->
        <template #empty>
          <div class="table-empty-state">
            <el-empty description="暂无符合条件的竞赛数据" :image-size="100">
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
      @pagination="loadExamList"
    />

    <!-- 竞赛新增与编辑抽屉组件 -->
    <ExamDrawer
      ref="examDrawerRef"
      @success="handleDrawerSuccess"
    />
  </div>
</template>

<script src="./ExamManage.js"></script>
<style scoped lang="scss" src="./ExamManage.scss"></style>
