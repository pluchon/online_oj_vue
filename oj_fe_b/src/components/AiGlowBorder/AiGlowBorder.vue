<template>
  <div class="ai-glow-border" :class="{ 'is-active': active }" :style="glowStyle">
    <!-- 外发光（模糊后的环绕光带） -->
    <span class="glow-halo" aria-hidden="true"></span>
    <!-- 边框光带（只保留边框宽度的一圈） -->
    <span class="glow-ring" aria-hidden="true"></span>
    <div class="glow-content">
      <slot />
    </div>
  </div>
</template>

<script src="./AiGlowBorder.js"></script>
<style lang="scss" scoped src="./AiGlowBorder.scss"></style>
