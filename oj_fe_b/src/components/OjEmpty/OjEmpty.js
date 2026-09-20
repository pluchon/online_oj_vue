// 墨衡古籍风格空状态通用组件逻辑
import { defineComponent, computed } from 'vue'
import emptyImage from '@/assets/images/b_not_data_xiaomeng.png'

export default defineComponent({
  name: 'OjEmpty',
  props: {
    // 提示主标题文案
    text: {
      type: String,
      default: '暂无相关数据'
    },
    // 次要辅助描述文案
    subText: {
      type: String,
      default: ''
    },
    // 插画尺寸（支持数字或CSS字符串）
    imageSize: {
      type: [Number, String],
      default: 130
    }
  },
  setup(props) {
    const imageStyle = computed(() => {
      const size = typeof props.imageSize === 'number' ? `${props.imageSize}px` : props.imageSize
      return {
        width: size,
        height: size
      }
    })

    return {
      emptyImage,
      imageStyle
    }
  }
})
