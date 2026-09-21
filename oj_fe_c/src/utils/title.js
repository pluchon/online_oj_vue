// 浏览器标签页标题工具

// 站点名称
const SITE_NAME = '墨衡 OJ'

// 设置标签页标题，格式为「页面名 · 墨衡 OJ」，无页面名时只显示站点名
export function setPageTitle(pageName) {
  document.title = pageName ? `${pageName} · ${SITE_NAME}` : SITE_NAME
}
