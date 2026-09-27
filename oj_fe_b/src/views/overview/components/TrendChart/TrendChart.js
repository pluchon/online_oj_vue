// 提交趋势图：柱状显示提交数与通过数，折线显示通过率（ECharts 按需引入）
import { defineComponent, ref, watch, onMounted, onBeforeUnmount } from 'vue'
import * as echarts from 'echarts/core'
import { BarChart, LineChart } from 'echarts/charts'
import { GridComponent, TooltipComponent, LegendComponent } from 'echarts/components'
import { CanvasRenderer } from 'echarts/renderers'

echarts.use([BarChart, LineChart, GridComponent, TooltipComponent, LegendComponent, CanvasRenderer])

// 与页面画卷风格一致的配色
const COLORS = {
  submit: '#b7a78f',
  pass: '#3d7a57',
  rate: '#8b352a',
  text: '#5c5145',
  line: 'rgba(195, 180, 160, 0.45)'
}

// 统一字体
const FONT_FAMILY = "'Songti SC', 'SimSun', serif"

// 入场动画：柱子依次从底部长出，折线从左往右画出
const ANIMATION = {
  animationDuration: 900,
  animationEasing: 'cubicOut'
}

// 生成图表配置（没有已出结论提交的点通过率按 0 画，折线不断开）
function buildOption(data) {
  return {
    color: [COLORS.submit, COLORS.pass, COLORS.rate],
    textStyle: { fontFamily: FONT_FAMILY, color: COLORS.text },
    grid: { left: 40, right: 48, top: 24, bottom: 64 },
    legend: { bottom: 0, left: 'center', itemWidth: 12, itemHeight: 8, itemGap: 20, textStyle: { color: COLORS.text } },
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' },
      // ECharts 默认把提示框层级设得极高，打开弹窗时残留的提示框会盖在弹窗上；降到遮罩之下
      extraCssText: 'z-index: 10;'
    },
    xAxis: {
      type: 'category',
      data: data.map((item) => item.label),
      axisLine: { lineStyle: { color: COLORS.line } },
      axisTick: { show: false },
      axisLabel: { hideOverlap: true }
    },
    yAxis: [
      {
        type: 'value',
        minInterval: 1,
        splitLine: { lineStyle: { color: COLORS.line, type: 'dashed' } }
      },
      {
        type: 'value',
        min: 0,
        max: 100,
        axisLabel: { formatter: '{value}%' },
        splitLine: { show: false }
      }
    ],
    series: [
      {
        name: '提交数',
        type: 'bar',
        barMaxWidth: 18,
        data: data.map((item) => item.submitCount),
        ...ANIMATION,
        animationDelay: (index) => index * 30
      },
      {
        name: '通过数',
        type: 'bar',
        barMaxWidth: 18,
        data: data.map((item) => item.passCount),
        ...ANIMATION,
        animationDelay: (index) => index * 30 + 60
      },
      {
        name: '通过率',
        type: 'line',
        yAxisIndex: 1,
        symbolSize: 7,
        data: data.map((item) => item.passRate ?? 0),
        tooltip: { valueFormatter: (value) => `${value}%` },
        ...ANIMATION,
        animationDuration: 1200
      }
    ]
  }
}

export default defineComponent({
  name: 'TrendChart',
  props: {
    // 趋势中的各个点：[{ label, submitCount, passCount, passRate }]
    data: {
      type: Array,
      default: () => []
    }
  },
  setup(props) {
    // 图表容器
    const chartRef = ref(null)

    // 图表实例与尺寸监听
    let chart = null
    let resizeObserver = null

    // 按最新数据重绘：先清空再设置，每次切换都重新播放入场动画，而不是在新旧数据之间过渡
    const render = () => {
      if (chart) {
        chart.clear()
        chart.setOption(buildOption(props.data))
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

    watch(() => props.data, render, { deep: true })

    return {
      chartRef
    }
  }
})
