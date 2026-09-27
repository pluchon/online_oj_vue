// 标签通过率饼图：左侧环形图，右侧注记写标签与通过率（ECharts 按需引入）
import { defineComponent, ref, watch, onMounted, onBeforeUnmount } from 'vue'
import * as echarts from 'echarts/core'
import { PieChart } from 'echarts/charts'
import { TooltipComponent, LegendComponent } from 'echarts/components'
import { CanvasRenderer } from 'echarts/renderers'

echarts.use([PieChart, TooltipComponent, LegendComponent, CanvasRenderer])

// 两种色调：偏低用朱砂色系，偏高用松绿色系（由深到浅）
const PALETTES = {
  weak: ['#8b352a', '#a8382b', '#c0563f', '#d27b5f', '#e0a489'],
  strong: ['#2d5e43', '#2d7a4c', '#4a9166', '#74ad87', '#a3c9ad']
}

// 统一字体与文字颜色
const FONT_FAMILY = "'Songti SC', 'SimSun', serif"
const TEXT_COLOR = '#4e4438'

// 生成图表配置（通过率为 0 的标签也保留一小块，不从图上消失）
function buildOption(tags, tone) {
  const rateByName = Object.fromEntries(tags.map((tag) => [tag.tagName, tag.passRate ?? 0]))
  return {
    color: PALETTES[tone] || PALETTES.weak,
    textStyle: { fontFamily: FONT_FAMILY, color: TEXT_COLOR },
    tooltip: {
      trigger: 'item',
      formatter: (params) => `${params.name}：通过率 ${rateByName[params.name]}%`
    },
    legend: {
      orient: 'vertical',
      left: '47%',
      top: 'middle',
      itemWidth: 10,
      itemHeight: 10,
      itemGap: 10,
      icon: 'roundRect',
      textStyle: { fontSize: 12.5, color: TEXT_COLOR, width: 130, overflow: 'truncate' },
      formatter: (name) => `${name}  ${rateByName[name]}%`
    },
    series: [
      {
        type: 'pie',
        center: ['22%', '50%'],
        radius: ['40%', '70%'],
        minAngle: 8,
        avoidLabelOverlap: false,
        label: { show: false },
        labelLine: { show: false },
        itemStyle: { borderColor: '#fbf8f2', borderWidth: 2 },
        data: tags.map((tag) => ({ name: tag.tagName, value: tag.passRate ?? 0 })),
        animationDuration: 800,
        animationEasing: 'cubicOut'
      }
    ]
  }
}

export default defineComponent({
  name: 'TagPassPie',
  props: {
    // 标签通过率：[{ tagName, passRate }]
    tags: {
      type: Array,
      default: () => []
    },
    // 色调：weak（通过率偏低）或 strong（通过率偏高）
    tone: {
      type: String,
      default: 'weak'
    }
  },
  setup(props) {
    // 图表容器
    const chartRef = ref(null)

    // 图表实例与尺寸监听
    let chart = null
    let resizeObserver = null

    // 按最新数据重绘（先清空，每次都重新播放入场动画）
    const render = () => {
      if (chart) {
        chart.clear()
        chart.setOption(buildOption(props.tags, props.tone))
      }
    }

    onMounted(() => {
      chart = echarts.init(chartRef.value)
      render()
      resizeObserver = new ResizeObserver(() => chart?.resize())
      resizeObserver.observe(chartRef.value)
    })

    onBeforeUnmount(() => {
      resizeObserver?.disconnect()
      chart?.dispose()
      chart = null
    })

    watch(() => props.tags, render, { deep: true })

    return {
      chartRef
    }
  }
})
