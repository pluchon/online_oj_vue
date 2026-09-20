<template>
  <div class="masonry-infinite-container">
    <!-- 瀑布流多列循环无缝平滑滚动（三通道独立专属图片、零重复、丝滑双组无缝跑马灯） -->
    <div
      v-for="(col, colIndex) in columnsData"
      :key="`col-${colIndex}`"
      class="masonry-column"
      :class="`col-dir-${col.direction}`"
      :style="{ '--scroll-duration': col.duration }"
    >
      <!-- 双轨组 A：主要渲染组 -->
      <div class="scroll-group">
        <div
          v-for="(item, itemIndex) in col.items"
          :key="`g1-${colIndex}-${item.id}-${itemIndex}`"
          class="masonry-card-wrapper"
          :style="{ height: `${item.height}px` }"
          @click="openUrl(item.url)"
        >
          <div
            class="masonry-card"
            :style="item.img ? { backgroundImage: `url(${item.img})` } : {}"
          >
            <!-- 博物学与算法几何古典线刻图谱（无图片时兜底） -->
            <div v-if="!item.img" class="card-engraving">
              <div class="card-inner-frame"></div>
              <div class="engraving-motif">
                <!-- Motif 1: 天体同心圆轨道与星位图 -->
                <svg v-if="item.motifType === 1" class="motif-svg" viewBox="0 0 120 120" fill="none">
                  <circle cx="60" cy="60" r="50" stroke="currentColor" stroke-width="0.8" stroke-dasharray="2 4" />
                  <circle cx="60" cy="60" r="34" stroke="currentColor" stroke-width="0.7" />
                  <circle cx="60" cy="60" r="18" stroke="currentColor" stroke-width="0.8" />
                  <circle cx="60" cy="26" r="3" fill="currentColor" />
                  <circle cx="78" cy="60" r="2.2" fill="currentColor" />
                  <line x1="60" y1="4" x2="60" y2="116" stroke="currentColor" stroke-width="0.5" stroke-dasharray="2 3" />
                  <line x1="4" y1="60" x2="116" y2="60" stroke="currentColor" stroke-width="0.5" stroke-dasharray="2 3" />
                  <path d="M25 95 L60 60 L95 95" stroke="currentColor" stroke-width="0.5" stroke-dasharray="1 3" />
                </svg>

                <!-- Motif 2: 斐波那契黄金螺旋几何 -->
                <svg v-else-if="item.motifType === 2" class="motif-svg" viewBox="0 0 120 120" fill="none">
                  <rect x="20" y="20" width="80" height="80" stroke="currentColor" stroke-width="0.7" stroke-dasharray="3 3" />
                  <rect x="20" y="20" width="50" height="50" stroke="currentColor" stroke-width="0.7" />
                  <rect x="70" y="20" width="30" height="30" stroke="currentColor" stroke-width="0.7" />
                  <circle cx="20" cy="70" r="50" stroke="currentColor" stroke-width="0.9" stroke-dasharray="2 2" />
                  <path d="M20 70 A50 50 0 0 1 70 20 A30 30 0 0 1 100 50" stroke="currentColor" stroke-width="1" />
                  <line x1="20" y1="20" x2="100" y2="100" stroke="currentColor" stroke-width="0.5" stroke-dasharray="2 4" />
                </svg>

                <!-- Motif 3: 算法树状拓扑图谱 -->
                <svg v-else-if="item.motifType === 3" class="motif-svg" viewBox="0 0 120 120" fill="none">
                  <circle cx="60" cy="24" r="5" stroke="currentColor" stroke-width="0.8" />
                  <circle cx="34" cy="58" r="4.5" stroke="currentColor" stroke-width="0.8" />
                  <circle cx="86" cy="58" r="4.5" stroke="currentColor" stroke-width="0.8" />
                  <circle cx="22" cy="92" r="3.5" stroke="currentColor" stroke-width="0.8" />
                  <circle cx="46" cy="92" r="3.5" stroke="currentColor" stroke-width="0.8" />
                  <circle cx="74" cy="92" r="3.5" stroke="currentColor" stroke-width="0.8" />
                  <circle cx="98" cy="92" r="3.5" stroke="currentColor" stroke-width="0.8" />
                  <line x1="60" y1="29" x2="34" y2="53.5" stroke="currentColor" stroke-width="0.6" />
                  <line x1="60" y1="29" x2="86" y2="53.5" stroke="currentColor" stroke-width="0.6" />
                  <line x1="34" y1="62.5" x2="22" y2="88.5" stroke="currentColor" stroke-width="0.6" stroke-dasharray="2 2" />
                  <line x1="34" y1="62.5" x2="46" y2="88.5" stroke="currentColor" stroke-width="0.6" stroke-dasharray="2 2" />
                  <line x1="86" y1="62.5" x2="74" y2="88.5" stroke="currentColor" stroke-width="0.6" stroke-dasharray="2 2" />
                  <line x1="86" y1="62.5" x2="98" y2="88.5" stroke="currentColor" stroke-width="0.6" stroke-dasharray="2 2" />
                  <circle cx="60" cy="60" r="52" stroke="currentColor" stroke-width="0.5" stroke-dasharray="2 4" />
                </svg>

                <!-- Motif 4: 植物叶脉微观蚀刻与坐标网格 -->
                <svg v-else class="motif-svg" viewBox="0 0 120 120" fill="none">
                  <path d="M60 16 C60 16, 32 46, 32 74 C32 94, 46 104, 60 104 C74 104, 88 94, 88 74 C88 46, 60 16, 60 16 Z" stroke="currentColor" stroke-width="0.9" />
                  <line x1="60" y1="16" x2="60" y2="104" stroke="currentColor" stroke-width="0.8" />
                  <path d="M60 40 Q46 48 36 58" stroke="currentColor" stroke-width="0.6" />
                  <path d="M60 40 Q74 48 84 58" stroke="currentColor" stroke-width="0.6" />
                  <path d="M60 58 Q46 66 34 78" stroke="currentColor" stroke-width="0.6" />
                  <path d="M60 58 Q74 66 86 78" stroke="currentColor" stroke-width="0.6" />
                  <path d="M60 76 Q50 82 40 92" stroke="currentColor" stroke-width="0.6" />
                  <path d="M60 76 Q70 82 80 92" stroke="currentColor" stroke-width="0.6" />
                  <line x1="12" y1="60" x2="108" y2="60" stroke="currentColor" stroke-width="0.4" stroke-dasharray="2 3" />
                </svg>
              </div>
            </div>

            <!-- 悬停轻柔微光遮罩 -->
            <div
              v-if="colorShiftOnHover"
              class="card-hover-overlay"
            />
          </div>
        </div>
      </div>

      <!-- 双轨组 B：克隆补位组，实现零像素偏差平滑衔接 -->
      <div class="scroll-group" aria-hidden="true">
        <div
          v-for="(item, itemIndex) in col.items"
          :key="`g2-${colIndex}-${item.id}-${itemIndex}`"
          class="masonry-card-wrapper"
          :style="{ height: `${item.height}px` }"
          @click="openUrl(item.url)"
        >
          <div
            class="masonry-card"
            :style="item.img ? { backgroundImage: `url(${item.img})` } : {}"
          >
            <div v-if="!item.img" class="card-engraving">
              <div class="card-inner-frame"></div>
              <div class="engraving-motif">
                <svg v-if="item.motifType === 1" class="motif-svg" viewBox="0 0 120 120" fill="none">
                  <circle cx="60" cy="60" r="50" stroke="currentColor" stroke-width="0.8" stroke-dasharray="2 4" />
                  <circle cx="60" cy="60" r="34" stroke="currentColor" stroke-width="0.7" />
                  <circle cx="60" cy="60" r="18" stroke="currentColor" stroke-width="0.8" />
                  <circle cx="60" cy="26" r="3" fill="currentColor" />
                  <circle cx="78" cy="60" r="2.2" fill="currentColor" />
                  <line x1="60" y1="4" x2="60" y2="116" stroke="currentColor" stroke-width="0.5" stroke-dasharray="2 3" />
                  <line x1="4" y1="60" x2="116" y2="60" stroke="currentColor" stroke-width="0.5" stroke-dasharray="2 3" />
                  <path d="M25 95 L60 60 L95 95" stroke="currentColor" stroke-width="0.5" stroke-dasharray="1 3" />
                </svg>
                <svg v-else-if="item.motifType === 2" class="motif-svg" viewBox="0 0 120 120" fill="none">
                  <rect x="20" y="20" width="80" height="80" stroke="currentColor" stroke-width="0.7" stroke-dasharray="3 3" />
                  <rect x="20" y="20" width="50" height="50" stroke="currentColor" stroke-width="0.7" />
                  <rect x="70" y="20" width="30" height="30" stroke="currentColor" stroke-width="0.7" />
                  <circle cx="20" cy="70" r="50" stroke="currentColor" stroke-width="0.9" stroke-dasharray="2 2" />
                  <path d="M20 70 A50 50 0 0 1 70 20 A30 30 0 0 1 100 50" stroke="currentColor" stroke-width="1" />
                  <line x1="20" y1="20" x2="100" y2="100" stroke="currentColor" stroke-width="0.5" stroke-dasharray="2 4" />
                </svg>
                <svg v-else-if="item.motifType === 3" class="motif-svg" viewBox="0 0 120 120" fill="none">
                  <circle cx="60" cy="24" r="5" stroke="currentColor" stroke-width="0.8" />
                  <circle cx="34" cy="58" r="4.5" stroke="currentColor" stroke-width="0.8" />
                  <circle cx="86" cy="58" r="4.5" stroke="currentColor" stroke-width="0.8" />
                  <circle cx="22" cy="92" r="3.5" stroke="currentColor" stroke-width="0.8" />
                  <circle cx="46" cy="92" r="3.5" stroke="currentColor" stroke-width="0.8" />
                  <circle cx="74" cy="92" r="3.5" stroke="currentColor" stroke-width="0.8" />
                  <circle cx="98" cy="92" r="3.5" stroke="currentColor" stroke-width="0.8" />
                  <line x1="60" y1="29" x2="34" y2="53.5" stroke="currentColor" stroke-width="0.6" />
                  <line x1="60" y1="29" x2="86" y2="53.5" stroke="currentColor" stroke-width="0.6" />
                  <line x1="34" y1="62.5" x2="22" y2="88.5" stroke="currentColor" stroke-width="0.6" stroke-dasharray="2 2" />
                  <line x1="34" y1="62.5" x2="46" y2="88.5" stroke="currentColor" stroke-width="0.6" stroke-dasharray="2 2" />
                  <line x1="86" y1="62.5" x2="74" y2="88.5" stroke="currentColor" stroke-width="0.6" stroke-dasharray="2 2" />
                  <line x1="86" y1="62.5" x2="98" y2="88.5" stroke="currentColor" stroke-width="0.6" stroke-dasharray="2 2" />
                  <circle cx="60" cy="60" r="52" stroke="currentColor" stroke-width="0.5" stroke-dasharray="2 4" />
                </svg>
                <svg v-else class="motif-svg" viewBox="0 0 120 120" fill="none">
                  <path d="M60 16 C60 16, 32 46, 32 74 C32 94, 46 104, 60 104 C74 104, 88 94, 88 74 C88 46, 60 16, 60 16 Z" stroke="currentColor" stroke-width="0.9" />
                  <line x1="60" y1="16" x2="60" y2="104" stroke="currentColor" stroke-width="0.8" />
                  <path d="M60 40 Q46 48 36 58" stroke="currentColor" stroke-width="0.6" />
                  <path d="M60 40 Q74 48 84 58" stroke="currentColor" stroke-width="0.6" />
                  <path d="M60 58 Q46 66 34 78" stroke="currentColor" stroke-width="0.6" />
                  <path d="M60 58 Q74 66 86 78" stroke="currentColor" stroke-width="0.6" />
                  <path d="M60 76 Q50 82 40 92" stroke="currentColor" stroke-width="0.6" />
                  <path d="M60 76 Q70 82 80 92" stroke="currentColor" stroke-width="0.6" />
                  <line x1="12" y1="60" x2="108" y2="60" stroke="currentColor" stroke-width="0.4" stroke-dasharray="2 3" />
                </svg>
              </div>
            </div>
            <div
              v-if="colorShiftOnHover"
              class="card-hover-overlay"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script src="./Masonry.js"></script>
<style scoped lang="scss" src="./Masonry.scss"></style>
