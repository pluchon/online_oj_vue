<template>
  <div>
    <!-- 用户信息编辑主弹窗（采用全站通用古典弹窗模板） -->
    <OjDialog
      v-model="visible"
      title="编辑用户信息"
      width="540px"
      confirm-text="保存"
      loading-text="保存中..."
      :confirm-loading="submitting"
      @confirm="handleSubmit"
    >
      <el-form
        ref="formRef"
        :model="formData"
        :rules="formRules"
        label-width="88px"
        class="dialog-form"
      >
        <el-form-item label="用户ID">
          <el-input v-model="formData.userId" disabled class="dialog-input" />
        </el-form-item>

        <el-form-item label="用户昵称" prop="nickName">
          <el-input v-model="formData.nickName" clearable class="dialog-input" />
        </el-form-item>

        <el-form-item label="用户性别">
          <el-radio-group v-model="formData.sex" class="dialog-radio-group">
            <el-radio :value="1">男</el-radio>
            <el-radio :value="2">女</el-radio>
            <el-radio :value="0">保密</el-radio>
          </el-radio-group>
        </el-form-item>

        <el-form-item label="手机号" prop="phone">
          <el-input v-model="formData.phone" clearable maxlength="11" class="dialog-input" />
        </el-form-item>

        <el-form-item label="电子邮箱" prop="email">
          <el-input v-model="formData.email" clearable class="dialog-input" />
        </el-form-item>

        <el-form-item label="微信号">
          <el-input v-model="formData.wechat" clearable class="dialog-input" />
        </el-form-item>

        <el-form-item label="就读学校">
          <el-input v-model="formData.schoolName" clearable class="dialog-input" />
        </el-form-item>

        <el-form-item label="所属专业">
          <el-input v-model="formData.majorName" clearable class="dialog-input" />
        </el-form-item>

        <el-form-item label="个人介绍">
          <el-input
            v-model="formData.introduce"
            type="textarea"
            :autosize="{ minRows: 1, maxRows: 5 }"
            resize="none"
            maxlength="200"
            class="dialog-autosize-input"
          />
        </el-form-item>
      </el-form>
    </OjDialog>

    <!-- 表单内容提示弹窗（遵循同一套公共弹窗模板，非 Element-plus 原生弹窗） -->
    <OjDialog
      v-model="promptVisible"
      title="提示"
      width="380px"
      confirm-text="我知道了"
      @confirm="promptVisible = false"
    >
      <div class="dialog-prompt-message">
        <p>{{ promptMessage }}</p>
      </div>
    </OjDialog>
  </div>
</template>

<script src="./UserEditDialog.js"></script>
<style scoped lang="scss" src="./UserEditDialog.scss"></style>
