// 提交趋势图：柱状显示每日提交数与通过数，折线显示通过率（ECharts 按需引入）
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

// 生成图表配置
function buildOption(data) {
  const dates = data.map((item) => item.date.slice(5))
  return {
    color: [COLORS.submit, COLORS.pass, COLORS.rate],
    textStyle: { fontFamily: FONT_FAMILY, color: COLORS.text },
    grid: { left: 40, right: 48, top: 40, bottom: 28 },
    legend: { top: 0, right: 0, itemWidth: 12, itemHeight: 8, textStyle: { color: COLORS.text } },
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' },
      valueFormatter: (value) => (value == null ? '-' : value)
    },
    xAxis: {
      type: 'category',
      data: dates,
      axisLine: { lineStyle: { color: COLORS.line } },
      axisTick: { show: false }
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
      { name: '提交数', type: 'bar', barMaxWidth: 18, data: data.map((item) => item.submitCount) },
      { name: '通过数', type: 'bar', barMaxWidth: 18, data: data.map((item) => item.passCount) },
      {
        name: '通过率',
        type: 'line',
        yAxisIndex: 1,
        // 没有已出结论提交的日子通过率为空，不连线也不平滑，避免画出不存在的数据
        connectNulls: false,
        symbolSize: 7,
        data: data.map((item) => item.passRate),
        tooltip: { valueFormatter: (value) => (value == null ? '-' : `${value}%`) }
      }
    ]
  }
}

export default defineComponent({
  name: 'TrendChart',
  props: {
    // 每日统计：[{ date: 'yyyy-MM-dd', submitCount, passCount, passRate }]
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

    // 按最新数据重绘
    const render = () => {
      if (chart) {
        chart.setOption(buildOption(props.data), true)
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
