<template>
  <div class="user-manage-container">
    <!-- 顶部筛选与操作栏 -->
    <div class="filter-header-bar">
      <div class="filter-left">
        <!-- 用户ID搜索 -->
        <span class="filter-label">用户id</span>
        <el-input
          v-model="queryParams.userId"
          placeholder="请输入要搜索的用户id"
          clearable
          class="filter-input filter-user-id"
          @keyup.enter="handleSearch"
          @clear="handleSearch"
        />

        <!-- 用户昵称搜索 -->
        <span class="filter-label">用户昵称</span>
        <el-input
          v-model="queryParams.nickName"
          placeholder="请输入要搜索的用户昵称"
          clearable
          class="filter-input filter-nick-name"
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
    </div>

    <!-- 用户数据表格展示区 -->
    <div class="table-container">
      <el-table
        v-loading="loading"
        :data="userList"
        class="custom-user-table"
        header-cell-class-name="custom-table-header"
        row-class-name="custom-table-row"
        stripe
        style="width: 100%"
      >
        <!-- 用户ID -->
        <el-table-column
          prop="userId"
          label="用户id"
          min-width="180"
          show-overflow-tooltip
        />

        <!-- 用户昵称 -->
        <el-table-column
          prop="nickName"
          label="用户昵称"
          min-width="110"
          show-overflow-tooltip
        >
          <template #default="{ row }">
            <span>{{ row.nickName || '-' }}</span>
          </template>
        </el-table-column>

        <!-- 用户性别 -->
        <el-table-column
          prop="sex"
          label="用户性别"
          width="90"
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
        >
          <template #default="{ row }">
            <span>{{ row.phone || '-' }}</span>
          </template>
        </el-table-column>

        <!-- 邮箱 -->
        <el-table-column
          prop="email"
          label="邮箱"
          min-width="140"
          show-overflow-tooltip
        >
          <template #default="{ row }">
            <span>{{ row.email || '-' }}</span>
          </template>
        </el-table-column>

        <!-- 微信号 -->
        <el-table-column
          prop="wechat"
          label="微信号"
          width="130"
          show-overflow-tooltip
        >
          <template #default="{ row }">
            <span>{{ row.wechat || '-' }}</span>
          </template>
        </el-table-column>

        <!-- 学校/专业 -->
        <el-table-column
          label="学校/专业"
          min-width="180"
          show-overflow-tooltip
        >
          <template #default="{ row }">
            <span>学校: {{ row.schoolName || '-' }}  专业: {{ row.majorName || '-' }}</span>
          </template>
        </el-table-column>

        <!-- 个人介绍 -->
        <el-table-column
          prop="introduce"
          label="个人介绍"
          min-width="130"
          show-overflow-tooltip
        >
          <template #default="{ row }">
            <span>{{ row.introduce || '-' }}</span>
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
            <el-tag
              v-if="row.status === 1"
              type="success"
              effect="plain"
              class="user-status-tag"
            >
              正常
            </el-tag>
            <el-tag
              v-else
              type="danger"
              effect="plain"
              class="user-status-tag"
            >
              拉黑
            </el-tag>
          </template>
        </el-table-column>

        <!-- 操作栏 -->
        <el-table-column
          label="操作"
          width="90"
          align="center"
          fixed="right"
        >
          <template #default="{ row }">
            <el-button
              v-if="row.status === 1"
              type="danger"
              link
              :loading="row.statusLoading"
              class="action-btn-danger"
              @click="handleToggleStatus(row)"
            >
              拉黑
            </el-button>
            <el-button
              v-else
              type="primary"
              link
              :loading="row.statusLoading"
              class="action-btn-primary"
              @click="handleToggleStatus(row)"
            >
              解禁
            </el-button>
          </template>
        </el-table-column>

        <!-- 暂无数据空状态 -->
        <template #empty>
          <el-empty description="暂无用户数据" :image-size="80" />
        </template>
      </el-table>
    </div>

    <!-- 底部分页控制栏 -->
    <div class="pagination-container">
      <div class="pagination-info">
        共 {{ total }} 条
      </div>
      <el-pagination
        v-model:current-page="queryParams.pageNum"
        v-model:page-size="queryParams.pageSize"
        :page-sizes="[10, 20, 50]"
        :total="total"
        layout="sizes, prev, pager, next, jumper"
        background
        @size-change="handleSizeChange"
        @current-change="handlePageChange"
      />
    </div>
  </div>
</template>

<script src="./UserManage.js"></script>
<style scoped lang="scss" src="./UserManage.scss"></style>
