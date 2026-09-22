// AI 生成中星光加载图标：渐变四角星旋转呼吸，两颗小星错峰闪烁
import { defineComponent } from 'vue'

// 四角星路径（中心 32,32，四条弧形边收向中心）
const STAR_PATH = 'M32 4 C34 20 44 30 60 32 C44 34 34 44 32 60 C30 44 20 34 4 32 C20 30 30 20 32 4 Z'

// 渐变 id 计数，保证同页多个实例互不干扰
let instanceSeq = 0

export default defineComponent({
  name: 'AiSparkleLoader',
  props: {
    // 图标边长（像素）
    size: {
      type: Number,
      default: 48,
    },
  },
  setup() {
    instanceSeq += 1
    return {
      STAR_PATH,
      gradientId: `ai-sparkle-gradient-${instanceSeq}`,
    }
  },
})
