# 编辑器布局与评分信息精简验证记录

## 验证时间

- 2026-07-06

## 验收标准结果

- 工作区顶部不再显示模块数量卡片或等价模块计数信息：通过。`.metric-pill` 和 `.toolbar-metrics` 已不再渲染。
- 全局 header 中可见当前评分：通过。新增 `data-testid="header-score"`，中文显示“评分 80”。
- 当前评分在页面滚动时随 sticky header 保持可见：通过。E2E 和浏览器 smoke 均覆盖。
- 页面中不再显示“本地草稿”状态标签或按钮：通过。
- 页面左上工作区不再显示“简历搭建”和“编辑工作台”：通过。
- 雷达评分组件显示在左侧模块选择区域下方：通过。新增 `data-testid="left-score-panel"`。
- 雷达评分在桌面端不遮挡模块列表和“添加模块”按钮：通过。桌面 smoke 通过。
- 雷达评分在移动端或窄屏布局下仍可访问，且不导致 body 横向溢出：通过。`390x844` smoke 通过。
- 中间编辑区标题保持为“简历编辑”：通过。`ResumeCanvas` 未改动，E2E 主流程通过。
- 原有主题切换、撤销/重做、PDF 导出、模块拖拽和预览同步功能不回退：通过。全量 E2E 7 个用例通过。
- 中文和英文 UI 下，评分相关文案不出现 raw i18n key：通过。Header 评分复用现有 `editor.metrics.score`。
- 相关测试覆盖元素移除、评分 header 展示和雷达图左侧展示：通过。`tests/e2e/editor.spec.ts` 已更新。

## 命令验证

- `Get-Command npx`
  - 结果：通过。
  - 摘要：`npx` 可用，满足浏览器自动化前置条件。
- `corepack yarn workspace @airesumecraft/editor typecheck`
  - 结果：通过。
  - 摘要：为 editor workspace 显式声明 `vue-tsc` devDependency 后，editor 包类型检查可直接运行。
- `corepack yarn exec vue-tsc -p apps/editor/tsconfig.json --noEmit`
  - 结果：通过。
  - 摘要：作为 editor 聚焦类型检查补充。
- `corepack yarn typecheck`
  - 结果：通过。
  - 摘要：editor、portfolio、shared 类型检查均通过。
- `corepack yarn lint`
  - 结果：通过。
  - 摘要：无 lint error；仍有 Node CommonJS/ESM experimental warning，不阻塞。
- `corepack yarn test:unit`
  - 结果：通过。
  - 摘要：editor 3 个测试文件 27 个测试通过；shared 1 个测试文件 9 个测试通过。
- `corepack yarn test:e2e -- tests/e2e/editor.spec.ts`
  - 结果：通过。
  - 摘要：Chromium 7 个 E2E 测试通过。
- `corepack yarn test:e2e`
  - 结果：通过。
  - 摘要：Chromium 7 个 E2E 测试通过。
- `corepack yarn build`
  - 结果：通过。
  - 摘要：editor Vite build 和 portfolio Nuxt/Nitro build 均完成。
- `git diff --check`
  - 结果：通过。
  - 摘要：仅输出 `yarn.lock` CRLF 将被 Git 规范化为 LF 的提示，不阻塞。

## 浏览器烟测

- dev server
  - URL：`http://localhost:5175/`。
  - 说明：`5173` 和 `5174` 已被占用，Vite 自动切换到 `5175`。
- 桌面视口 `1872x1009`
  - 结果：通过。
  - 检查项：header 评分可见且为 80、旧工作区标题和本地草稿不可见、旧 metric 不存在、左侧雷达可见、无 body 横向溢出、滚动后 header 保持顶部可见、无 actionable console errors。
  - 截图：`output/playwright/editor-layout-verify-desktop.png`。
- 移动视口 `390x844`
  - 结果：通过。
  - 检查项：header 评分可见、左侧雷达可见、无 body 横向溢出、无 actionable console errors。
  - 截图：`output/playwright/editor-layout-verify-mobile.png`。
- PDF 导出 smoke
  - 结果：通过。
  - 证据：已触发 `export-pdf-button`，并生成 `output/pdf-export/editor-layout-verify.pdf`。

## 变更文件

- `apps/editor/src/App.vue`
- `apps/editor/src/components/ResumeWorkspace.vue`
- `apps/editor/src/styles.css`
- `tests/e2e/editor.spec.ts`
- `apps/editor/package.json`
- `yarn.lock`
- `README.md`
- `CODE_MAP.md`
- `PROJECT_PROGRESS.md`
- `specs/editor-layout-metrics-cleanup/spec.md`
- `specs/editor-layout-metrics-cleanup/plan.md`
- `specs/editor-layout-metrics-cleanup/tasks.md`
- `specs/editor-layout-metrics-cleanup/verify.md`

## 已知风险

- Editor 构建仍有 Vite 大 chunk warning，主要来自图表和富依赖包；本次布局调整未扩大该风险。
- Portfolio/Nuxt 构建仍有 Nitro 外部依赖 warning 和 Node deprecation warning；当前构建成功，不阻塞本功能。
- `yarn add` 和部分 Storybook/MSW 依赖仍提示 peer dependency warning；当前测试和构建通过。

## 后续任务

- 无阻塞后续任务。
- 可选优化：后续可将 ECharts/PDF 导出相关依赖动态导入，降低 editor 首包体积。
