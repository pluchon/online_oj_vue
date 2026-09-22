<template>
  <div
    class="ai-glow-border"
    :class="{ 'is-active': active, 'is-overlay': overlay }"
    :style="glowStyle"
  >
    <!-- 外发光：先裁成边框环再整体模糊，光晕只沿边框分布 -->
    <span class="glow-halo" aria-hidden="true"><span class="glow-band"></span></span>
    <!-- 边框光带 -->
    <span class="glow-band glow-ring" aria-hidden="true"></span>
    <div v-if="!overlay" class="glow-content">
      <slot />
    </div>
  </div>
</template>

<script src="./AiGlowBorder.js"></script>
<style lang="scss" scoped src="./AiGlowBorder.scss"></style>
