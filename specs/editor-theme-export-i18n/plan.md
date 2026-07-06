# 编辑器主题、导出与国际化技术计划

## 范围决策

- 本计划只覆盖技术方案和落地步骤，不修改产品代码。
- 继续使用现有 Vue 3、Vite、TypeScript、Pinia、Naive UI、vue-i18n 和 ECharts 技术栈。
- PDF 导出按需求使用 `html2canvas` 和 `jsPDF`，需要新增编辑器依赖。
- 简历主题作用域限定在右侧简历预览纸张，不影响编辑器外壳的浅蓝/深色模式。
- 主题、预览排版设置和导出质量属于编辑器偏好，放入 `useResumeStore.preferences` 并持久化。
- 撤销/重做历史仅当前会话有效，不进入 persisted state。
- 雷达图复用现有 `ResumeScoreRadar.vue`，先接入确定性的 `document.score` 模拟数据。
- 规格文档和后续 plan/tasks/verify/update docs 文档统一用中文编写。

## 受影响文件和模块

- `package.json`
  - 若新增根级脚本或测试命令才需要调整；常规依赖应放到 editor package。
- `apps/editor/package.json`
  - 新增 `html2canvas` 和 `jspdf` 依赖。
  - 保留现有 `echarts` 依赖，不重复引入图表库。
- `apps/editor/src/stores/resume.ts`
  - 扩展 `preferences`：预览主题、字体、字号、行距、强调色、导出质量。
  - 新增主题、导出质量和预览排版设置的 setter。
  - 新增撤销/重做历史栈、`canUndo`、`canRedo`、`undo()`、`redo()`。
  - 所有会改变简历内容、模块顺序或偏好的 action 需要记录历史快照。
  - persisted pick 继续包含 `document`、`preferences`、`selectedModuleId`，不包含历史栈和拖拽临时顺序。
- `apps/editor/src/config/resumeThemes.ts`（新增）
  - 定义 2 到 3 套主题，例如 `classic-blue`、`modern-sky`、`mono-compact`。
  - 每个主题包含 id、i18n label key、CSS 变量、默认排版建议。
- `apps/editor/src/composables/usePdfExport.ts`（新增）
  - 封装 `html2canvas` 和 `jsPDF`。
  - 负责导出状态、错误状态、质量参数映射、A4 尺寸换算、文件名生成。
- `apps/editor/src/composables/useResumeValidation.ts`（新增或按需）
  - 提供基础表单校验规则，例如姓名必填、邮箱格式、导出前预览非空。
  - 供组件测试覆盖“表单校验”场景。
- `apps/editor/src/components/ResumePreview.vue`
  - 将当前本地 `fontFamily`、`fontSize`、`lineHeight`、`accentColor` 上收为 store preferences。
  - 应用 `resumeThemes` 输出的 CSS 变量。
  - 给 `preview-paper` 增加稳定 ref，供 PDF 导出捕获。
  - 接入导出按钮、质量选择、主题选择，或拆出工具栏组件。
  - 保持现有预览模块拖拽和中间编辑区同步逻辑。
- `apps/editor/src/components/ResumePreviewToolbar.vue`（可选新增）
  - 从 `ResumePreview.vue` 拆出主题、字号、行距、导出质量、导出按钮、模板按钮。
  - 保持 toolbar 语义清晰，减少 `ResumePreview.vue` 复杂度。
- `apps/editor/src/components/HistoryControls.vue`（可选新增）
  - 展示撤销和重做按钮。
  - 按 `canUndo` / `canRedo` 禁用。
  - 推荐放在顶部工作区工具栏或预览工具栏。
- `apps/editor/src/components/ResumeWorkspace.vue`
  - 接入 `ResumeScoreRadar`，形成可见评分区域。
  - 如放在顶部 metrics 附近，需要保证桌面和移动端不溢出。
  - 可接入撤销/重做控件。
- `apps/editor/src/components/ResumeScoreRadar.vue`
  - 增加 `data-testid`。
  - 调整 resize 防抖或错误保护，降低开发环境 `ResizeObserver loop` 噪声风险。
  - 继续按需引入 ECharts 模块，避免全量包引入。
- `apps/editor/src/App.vue`
  - 复核 locale 文案，修复当前中文选项在源码中的编码可读性问题。
  - 保持编辑器浅色/深色模式与简历主题分离。
- `apps/editor/src/i18n/index.ts`
  - 新增主题、导出、质量、撤销、重做、评分雷达、校验错误相关文案。
  - 中文和英文都要补齐，避免可见 raw key。
- `apps/editor/src/styles.css`
  - 新增预览主题变量、导出按钮状态、评分区域、历史控件、移动端 toolbar 换行样式。
  - 调整 `preview-paper` 为 A4 比例或导出专用尺寸约束。
  - 确保主题变量作用域只在 `.preview-paper` 或其父容器内。
- `apps/editor/src/__tests__/resume-store.spec.ts`
  - 增加偏好持久化、主题切换、撤销/重做、redo 分支清空测试。
  - 覆盖历史栈不持久化的行为。
- `apps/editor/src/components/__tests__/...`（新增）
  - 使用 Vue Test Utils 增加组件测试。
  - 覆盖导出按钮触发、导出中禁用态、基础表单校验、主题选择控件。
- `tests/e2e/editor.spec.ts`
  - 增加主题切换可见变化、刷新恢复、导出按钮可点击、撤销/重做主流程。
  - 保留现有拖拽排序和预览同步测试。
- `apps/editor/src/vite-env.d.ts`
  - 如导出实现需要导入非标准资源或环境变量，再补充类型声明。
- `CODE_MAP.md`
  - 记录主题配置、PDF 导出 composable、历史栈、雷达图接入位置。
- `PROJECT_PROGRESS.md`
  - 更新本功能里程碑和验证结果。
- `README.md`
  - 说明 Yarn 安装后新增 PDF 依赖、运行和验证命令；如用户使用说明增加导出入口。

## 架构和数据流

### 主题数据流

1. `resumeThemes.ts` 定义所有可选主题。
2. `useResumeStore.preferences.resumeThemeId` 保存当前主题 id。
3. `ResumePreview` 根据 `resumeThemeId` 找到主题定义。
4. 主题定义输出 CSS 变量，例如 `--preview-accent`、`--preview-heading-bg`、`--preview-paper-bg`、`--preview-section-gap`。
5. `preview-paper` 使用 scoped style 绑定这些变量。
6. 主题切换调用 `store.setResumeTheme(themeId)`，记录历史并持久化。

建议主题：

- `classic-blue`：延续当前深蓝章节标签，适合作为默认主题。
- `modern-sky`：浅蓝强调、弱化深色块，和当前编辑器浅蓝风格协调。
- `mono-compact`：黑白紧凑布局，适合正式投递和打印。

### PDF 导出数据流

1. 用户在预览工具栏选择导出质量。
2. 用户点击导出按钮。
3. `usePdfExport.exportPreview(previewElement, options)` 检查元素、设置 loading、清空旧错误。
4. `html2canvas` 捕获 `preview-paper`。
5. `jsPDF` 创建 A4 纵向文档。
6. 将 canvas 转为图片并按 A4 宽度缩放。
7. 若内容超过一页，优先按页面高度切片分页，避免截断。
8. `pdf.save()` 使用简历姓名或默认文件名。
9. 成功或失败后恢复按钮状态，并通过 Naive UI message 展示本地化反馈。

质量映射建议：

```text
standard: html2canvas scale 1.5, JPEG quality 0.86
high: html2canvas scale 2.5, JPEG quality 0.94
```

### 撤销/重做数据流

1. store 内部维护 `pastSnapshots` 和 `futureSnapshots`。
2. 每次会修改 `document` 或 `preferences` 的 action 进入前调用 `recordHistory()`。
3. snapshot 包含 `document` 和需要参与撤销的 `preferences` 字段。
4. `undo()` 将当前状态推入 future，从 past 弹出并恢复。
5. `redo()` 将当前状态推入 past，从 future 弹出并恢复。
6. 新编辑发生时清空 future。
7. 历史栈设置上限，例如 50 或 80，避免快速输入导致内存持续增长。
8. 恢复历史时用 `isRestoringHistory` 防止递归记录。

### 评分雷达图数据流

1. `ResumeWorkspace` 读取 `store.document.score`。
2. `ResumeScoreRadar` 接收 score 并用 ECharts 渲染。
3. locale 或 dark mode 变化时重新设置 option。
4. 布局上将雷达图作为工作区评分信息的一部分，而不是覆盖简历预览纸张。

## 数据模型变化

### Store Preferences

建议把当前 preferences 从：

```ts
{
  darkMode: boolean
}
```

扩展为：

```ts
interface EditorPreferences {
  darkMode: boolean
  resumeThemeId: ResumeThemeId
  previewFontFamily: 'sans' | 'inter' | 'serif'
  previewFontSize: number
  previewLineHeight: number
  previewAccentColor: string
  exportQuality: 'standard' | 'high'
}
```

需要提供默认值和迁移/归一化函数，兼容旧 localStorage 中只有 `darkMode` 的数据。

### Theme Definition

```ts
interface ResumeThemeDefinition {
  id: ResumeThemeId
  labelKey: string
  cssVars: Record<string, string>
  defaults?: Partial<
    Pick<
      EditorPreferences,
      | 'previewFontFamily'
      | 'previewFontSize'
      | 'previewLineHeight'
      | 'previewAccentColor'
    >
  >
}
```

主题 id 建议作为编辑器本地类型，不放入 `packages/shared`，除非后续 portfolio 站点也要消费同一主题。

### History Snapshot

```ts
interface ResumeHistorySnapshot {
  document: ResumeDocument
  preferences: EditorPreferences
}
```

历史栈不进入 Pinia persisted pick。

### Export Options

```ts
interface PdfExportOptions {
  quality: 'standard' | 'high'
  fileName: string
  locale: ResumeLocale
}
```

## API 或接口变化

- 新增编辑器依赖：
  - `html2canvas`
  - `jspdf`
- `useResumeStore` 新增或调整接口：
  - `setResumeTheme(themeId)`
  - `setPreviewFontFamily(value)`
  - `setPreviewFontSize(value)`
  - `setPreviewLineHeight(value)`
  - `setPreviewAccentColor(value)`
  - `setExportQuality(value)`
  - `undo()`
  - `redo()`
  - `canUndo`
  - `canRedo`
  - `recordHistory()`（内部使用，除非测试需要）
- `usePdfExport` 对外接口：
  - `isExporting`
  - `exportError`
  - `exportPreview(element, options)`
- `ResumePreview` 增加稳定测试 id：
  - `resume-theme-select`
  - `preview-font-family-select`
  - `export-quality-select`
  - `export-pdf-button`
  - `preview-paper`
- 历史控件增加稳定测试 id：
  - `undo-button`
  - `redo-button`
- 雷达图增加稳定测试 id：
  - `resume-score-radar`
- 不需要后端 API 或 MSW handler 变化。

## 实施步骤

1. 补齐依赖。
   - 在 `apps/editor/package.json` 添加 `html2canvas` 和 `jspdf`。
   - 运行 `corepack yarn install` 更新 `yarn.lock`。

2. 新增主题配置。
   - 创建 `apps/editor/src/config/resumeThemes.ts`。
   - 定义 3 套主题和默认主题 id。
   - 给主题 label 使用 i18n key，而不是硬编码展示文本。

3. 扩展 store preferences。
   - 增加 `EditorPreferences` 类型和默认值。
   - 添加 preferences 归一化逻辑，兼容旧 persisted state。
   - 将 `ResumePreview` 内部字体、字号、行距和强调色迁移到 store。
   - 增加主题和导出质量 setter。

4. 实现历史栈。
   - 添加 snapshot 类型、past/future 栈和恢复保护。
   - 在 `updateModule`、`renameModule`、`addModule`、`removeModule`、`reorderModules`、`setLocale`、偏好 setter 等 action 中记录历史。
   - 恢复历史后重新校正模块顺序和 selected module。
   - 限制历史栈长度。

5. 调整预览工具栏。
   - 主题选择使用 `NSelect`。
   - 导出质量使用 `NSelect` 或分段按钮。
   - 导出按钮显示 loading/disabled。
   - 字体、字号、行距继续保留，但绑定 store preferences。
   - 移动端 toolbar 横向滚动或自动换行，避免溢出。

6. 应用主题 CSS 变量。
   - `previewStyle` 合并主题变量和用户排版设置。
   - 将目前硬编码的章节标题颜色、纸张底色、标题块样式替换为变量。
   - 保留当前默认视觉作为 `classic-blue`。

7. 实现 PDF 导出 composable。
   - 创建 `usePdfExport.ts`。
   - 处理空元素、导出中状态、异常捕获和本地化错误消息。
   - 导出时临时添加 export class，必要时关闭 hover/drag 阴影。
   - 处理 A4 宽度缩放和多页切片。
   - 测试环境中通过 mock `html2canvas` 和 `jsPDF` 验证触发链路。

8. 接入评分雷达图。
   - 在 `ResumeWorkspace` 中展示 `ResumeScoreRadar`。
   - 使用 `store.document.score` 作为模拟数据。
   - 调整 CSS，使雷达图在桌面和移动端都不会撑破布局。

9. 补齐国际化。
   - 增加 `editor.theme.*`、`editor.export.*`、`editor.history.*`、`editor.validation.*` 文案。
   - 修复当前 `App.vue` 中 locale option 的中文源码可读性。
   - 检查新增 UI 不出现 raw key。

10. 增加组件测试。
    - 使用 Vue Test Utils 测主题选择控件。
    - mock `usePdfExport` 或 mock `html2canvas` / `jsPDF`，测导出按钮触发和 loading 禁用态。
    - 测基础表单校验提示，例如空姓名或非法邮箱。
    - 保留 store 单元测试覆盖撤销/重做。

11. 增加 E2E 覆盖。
    - 切换主题后断言 `preview-paper` 的 data/theme 或 CSS 变量变化。
    - 刷新后断言主题恢复。
    - 编辑字段后撤销/重做，断言中间编辑区和右侧预览同步。
    - 点击导出按钮，mock 下载或仅断言按钮状态和无 console actionable error。

12. 更新文档。
    - 更新 `CODE_MAP.md`、`PROJECT_PROGRESS.md`、`README.md`。
    - 后续 `$spec-update-docs` 再写入最终验证结果。

## 风险

- `html2canvas` 遇到跨域头像图片可能污染 canvas，导致导出失败；需要设置安全占位或文档说明。
- 长简历导出如果不分页会截断，如果分页切片处理不当会出现文字断行或页面接缝。
- 撤销/重做若在每次输入事件都记录快照，会产生很多历史记录；需要栈上限，必要时后续做 debounce 或 blur 提交。
- Pinia persistedstate 对新增 preferences 字段的旧数据兼容需要显式默认值，否则旧本地草稿可能缺字段。
- 主题 CSS 变量如果作用域过宽，可能污染编辑器外壳或 Naive UI 控件。
- ECharts 的 ResizeObserver 在开发环境已有提示，接入可见雷达图后需要避免加剧该提示。
- jsdom 不支持真实 canvas/PDF，组件测试必须 mock 导出依赖。
- 中文文档和中文 i18n 需要保持 UTF-8，PowerShell 直接输出可能显示乱码，但文件本身应保持 UTF-8。

## 验证命令

依赖变更后先运行：

```bash
corepack yarn install
```

实现完成后运行：

```bash
corepack yarn lint
corepack yarn typecheck
corepack yarn test:unit
corepack yarn test:e2e
corepack yarn build
```

建议的聚焦检查：

```bash
corepack yarn workspace @airesumecraft/editor typecheck
corepack yarn workspace @airesumecraft/editor test:unit
corepack yarn dev:editor
```

浏览器烟测：

- 桌面 `1872x1009`：主题切换、导出按钮、撤销/重做、雷达图、预览模块拖拽同步。
- 移动 `390x844`：工具栏不横向溢出，主题和导出控件可操作，雷达图和预览纸张不遮挡。
- PDF 导出：标准质量和高质量都能生成文件，文件内容包含当前主题和当前简历内容。

## 需要更新的文档

- `CODE_MAP.md`：新增主题配置、PDF 导出 composable、历史栈和雷达图接入说明。
- `PROJECT_PROGRESS.md`：记录主题、导出、撤销/重做和雷达图里程碑。
- `README.md`：更新安装依赖后的运行命令、导出能力和验证命令。
- `specs/editor-theme-export-i18n/verify.md`：在验证阶段记录实际测试命令和结果。

## 需要确认

- 无阻塞确认项。计划默认首版 PDF 按 A4 纵向导出，并在内容超出一页时优先分页，而不是截断。
- 可选后续确认：是否需要同时支持键盘快捷键 `Ctrl+Z` / `Ctrl+Y` 或 `Cmd+Z` / `Cmd+Shift+Z`；本计划可先实现按钮级撤销/重做。
