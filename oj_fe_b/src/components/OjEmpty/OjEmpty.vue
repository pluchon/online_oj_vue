<template>
  <div class="oj-empty-container">
    <div class="empty-image-wrapper">
      <img
        :src="emptyImage"
        alt="空状态"
        class="empty-image"
        :style="imageStyle"
      />
    </div>
    <p v-if="text" class="empty-text">{{ text }}</p>
    <p v-if="subText" class="empty-subtext">{{ subText }}</p>
    <slot />
  </div>
</template>

<script src="./OjEmpty.js"></script>
<style scoped lang="scss" src="./OjEmpty.scss"></style>
