// Masonry 瀑布流组件逻辑（三通道独立专属图片、零重复、双轨无缝平滑无限滚动）
import { computed } from 'vue'

export default {
  name: 'Masonry',
  props: {
    // 原始卡片数据池（12张图）
    items: {
      type: Array,
      default: () => []
    },
    // 鼠标悬停是否微缩放
    scaleOnHover: {
      type: Boolean,
      default: true
    },
    // 悬停缩放比例
    hoverScale: {
      type: Number,
      default: 0.96
    },
    // 是否启用悬停微光
    colorShiftOnHover: {
      type: Boolean,
      default: true
    }
  },
  setup(props) {
    // 三通道各自拥有专属互斥的图片集，杜绝跨列重复显示
    const columnsData = computed(() => {
      const col1 = []
      const col2 = []
      const col3 = []

      // 严格按照模3均分12张图片，确保每列4张图完全独立、绝不重复
      props.items.forEach((item, index) => {
        const mod = index % 3
        if (mod === 0) col1.push(item)
        else if (mod === 1) col2.push(item)
        else col3.push(item)
      })

      return [
        {
          // 第一列：专属第 1, 4, 7, 10 张图，平稳向上滚动
          direction: 'up',
          duration: '36s',
          items: col1
        },
        {
          // 第二列：专属第 2, 5, 8, 11 张图，平稳向下错落反向流动
          direction: 'down',
          duration: '42s',
          items: col2
        },
        {
          // 第三列：专属第 3, 6, 9, 12 张图，稍有速度差向上流动
          direction: 'up',
          duration: '38s',
          items: col3
        }
      ]
    })

    const openUrl = (url) => {
      if (url) {
        window.open(url, '_blank', 'noopener')
      }
    }

    return {
      columnsData,
      openUrl
    }
  }
}
