<template>
  <svg class="ai-sparkle-loader" :width="size" :height="size" viewBox="0 0 64 64" role="img" aria-label="AI 生成中">
    <defs>
      <linearGradient :id="gradientId" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#4285f4">
          <animate attributeName="stop-color" values="#4285f4;#9b72cb;#d96570;#4285f4" dur="3s" repeatCount="indefinite" />
        </stop>
        <stop offset="100%" stop-color="#d96570">
          <animate attributeName="stop-color" values="#d96570;#4285f4;#9b72cb;#d96570" dur="3s" repeatCount="indefinite" />
        </stop>
      </linearGradient>
    </defs>
    <!-- 主星：四角星，缓慢旋转并呼吸缩放 -->
    <path class="star star-main" :fill="`url(#${gradientId})`" :d="STAR_PATH" />
    <!-- 两颗小星：错峰闪烁 -->
    <path class="star star-small star-a" :fill="`url(#${gradientId})`" :d="STAR_PATH" transform="translate(44 4) scale(0.28)" />
    <path class="star star-small star-b" :fill="`url(#${gradientId})`" :d="STAR_PATH" transform="translate(6 42) scale(0.22)" />
  </svg>
</template>

<script src="./AiSparkleLoader.js"></script>
<style lang="scss" scoped src="./AiSparkleLoader.scss"></style>
