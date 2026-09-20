<template>
  <div class="user-manage-panel">
    <!-- 检索与筛选横栏（左侧输入框无占位符，右侧放置搜索与重置按钮） -->
    <div class="filter-header-bar">
      <div class="filter-left">
        <!-- 用户ID搜索 -->
        <span class="filter-label">用户id</span>
        <el-input
          v-model="queryParams.userId"
          clearable
          class="filter-input filter-user-id"
          @keyup.enter="handleSearch"
          @clear="handleSearch"
        />

        <!-- 用户昵称搜索 -->
        <span class="filter-label">用户昵称</span>
        <el-input
          v-model="queryParams.nickName"
          clearable
          class="filter-input filter-nick-name"
          @keyup.enter="handleSearch"
          @clear="handleSearch"
        />
      </div>

      <!-- 搜索与重置按钮（统一定位在横栏最右侧） -->
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

    <!-- 用户数据表格展示区（学校与专业独立分列，全列超长截断+悬浮展示） -->
    <div class="table-container">
      <el-table
        v-loading="loading"
        :data="userList"
        class="custom-editorial-table"
        header-cell-class-name="editorial-table-header"
        row-class-name="editorial-table-row"
        style="width: 100%"
      >
        <!-- 用户ID -->
        <el-table-column
          prop="userId"
          label="用户id"
          min-width="190"
          show-overflow-tooltip
        >
          <template #default="{ row }">
            <span class="tabular-text">{{ row.userId }}</span>
          </template>
        </el-table-column>

        <!-- 用户昵称 -->
        <el-table-column
          prop="nickName"
          label="用户昵称"
          min-width="150"
          show-overflow-tooltip
        >
          <template #default="{ row }">
            <span class="user-nickname-text">{{ row.nickName || '-' }}</span>
          </template>
        </el-table-column>

        <!-- 用户性别 -->
        <el-table-column
          prop="sex"
          label="用户性别"
          width="100"
          align="center"
        >
          <template #default="{ row }">
            <span v-if="row.sex === 1" class="gender-text gender-male">男</span>
            <span v-else-if="row.sex === 2" class="gender-text gender-female">女</span>
            <span v-else class="gender-text gender-secret">保密</span>
          </template>
        </el-table-column>

        <!-- 手机号 -->
        <el-table-column
          prop="phone"
          label="手机号"
          width="130"
          align="center"
          show-overflow-tooltip
        >
          <template #default="{ row }">
            <span class="tabular-text">{{ row.phone || '-' }}</span>
          </template>
        </el-table-column>

        <!-- 邮箱 -->
        <el-table-column
          prop="email"
          label="邮箱"
          min-width="150"
          show-overflow-tooltip
        >
          <template #default="{ row }">
            <span class="email-text">{{ row.email || '-' }}</span>
          </template>
        </el-table-column>

        <!-- 微信号 -->
        <el-table-column
          prop="wechat"
          label="微信号"
          width="120"
          show-overflow-tooltip
        >
          <template #default="{ row }">
            <span>{{ row.wechat || '-' }}</span>
          </template>
        </el-table-column>

        <!-- 学校（独立分列） -->
        <el-table-column
          prop="schoolName"
          label="学校"
          min-width="140"
          show-overflow-tooltip
        >
          <template #default="{ row }">
            <span>{{ row.schoolName || '-' }}</span>
          </template>
        </el-table-column>

        <!-- 专业（独立分列） -->
        <el-table-column
          prop="majorName"
          label="专业"
          min-width="140"
          show-overflow-tooltip
        >
          <template #default="{ row }">
            <span>{{ row.majorName || '-' }}</span>
          </template>
        </el-table-column>

        <!-- 个人介绍 -->
        <el-table-column
          prop="introduce"
          label="个人介绍"
          min-width="150"
          show-overflow-tooltip
        >
          <template #default="{ row }">
            <span class="intro-text">{{ row.introduce || '-' }}</span>
          </template>
        </el-table-column>

        <!-- 用户状态 -->
        <el-table-column
          prop="status"
          label="用户状态"
          width="100"
          align="center"
        >
          <template #default="{ row }">
            <div class="status-indicator">
              <span
                class="status-dot"
                :class="row.status === 1 ? 'dot-active' : 'dot-banned'"
              >●</span>
              <span
                class="status-label"
                :class="row.status === 1 ? 'label-active' : 'label-banned'"
              >
                {{ row.status === 1 ? '正常' : '拉黑' }}
              </span>
            </div>
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
                @click="handleEdit(row)"
              >
                编辑
              </button>
              <button
                v-if="row.status === 1"
                type="button"
                class="action-btn btn-action-ban"
                :disabled="row.statusLoading"
                @click="handleToggleStatus(row)"
              >
                拉黑
              </button>
              <button
                v-else
                type="button"
                class="action-btn btn-action-unban"
                :disabled="row.statusLoading"
                @click="handleToggleStatus(row)"
              >
                解禁
              </button>
            </div>
          </template>
        </el-table-column>

        <!-- 暂无数据空状态：使用小蒙定制插画与针对性文案 -->
        <template #empty>
          <OjEmpty text="暂无用户数据" :image-size="130" />
        </template>
      </el-table>
    </div>

    <!-- 底部分页控制栏（固定10条/页，无每页条数选择器） -->
    <div class="pagination-container">
      <el-pagination
        v-model:current-page="queryParams.pageNum"
        :page-size="10"
        :total="total"
        layout="total, prev, pager, next, jumper"
        @current-change="handlePageChange"
      />
    </div>

    <!-- 编辑用户弹窗组件 -->
    <UserEditDialog
      ref="editDialogRef"
      @success="loadUserList"
    />
  </div>
</template>

<script src="./UserManage.js"></script>
<style scoped lang="scss" src="./UserManage.scss"></style>
