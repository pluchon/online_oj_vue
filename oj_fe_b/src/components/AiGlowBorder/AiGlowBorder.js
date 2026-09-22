// AI 生成中光效边框：active 为 true 时彩色光带沿边框顺时针环绕，结束后淡出（参考 Vue Bits BorderGlow）
import { defineComponent, computed } from 'vue'

// 默认光带配色（蓝、红、黄、绿）
const DEFAULT_COLORS = ['#4285f4', '#ea4335', '#fbbc05', '#34a853']

export default defineComponent({
  name: 'AiGlowBorder',
  props: {
    // 是否播放环绕光效
    active: {
      type: Boolean,
      default: false,
    },
    // 圆角（像素）
    borderRadius: {
      type: Number,
      default: 8,
    },
    // 光带颜色（四色）
    colors: {
      type: Array,
      default: () => DEFAULT_COLORS,
    },
    // 叠加模式：不包裹内容，只作为父元素（需已定位）边框上的光效层
    overlay: {
      type: Boolean,
      default: false,
    },
    // 环绕一圈的时长（秒）
    duration: {
      type: Number,
      default: 2.4,
    },
  },
  setup(props) {
    // 通过 CSS 变量把参数交给样式
    const glowStyle = computed(() => ({
      '--glow-radius': `${props.borderRadius}px`,
      '--glow-duration': `${props.duration}s`,
      '--glow-c1': props.colors[0],
      '--glow-c2': props.colors[1] || props.colors[0],
      '--glow-c3': props.colors[2] || props.colors[0],
      '--glow-c4': props.colors[3] || props.colors[0],
    }))

    return {
      glowStyle,
    }
  },
})
