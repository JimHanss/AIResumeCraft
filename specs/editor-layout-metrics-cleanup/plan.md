# 编辑器布局与评分信息精简技术计划

## 范围决策

- 本计划只覆盖技术方案和落地步骤，不修改产品代码。
- 保持现有 Vue 3、Pinia、Naive UI、vue-i18n、ECharts 和三栏编辑器结构。
- 不改变评分算法、评分数据结构、雷达图维度或 localStorage 持久化能力。
- 移除的是可见状态信息，不移除草稿保存、恢复、撤销/重做、PDF 导出或模块排序能力。
- Header 中的评分使用现有总分计算逻辑，雷达图继续使用 `store.document.score`。
- 雷达图移动到左侧栏中 `MaterialPanel` 下方，由 `ResumeWorkspace` 负责布局，不把评分逻辑塞进物料面板本身。
- 规格、计划、任务、验证和后续文档继续使用中文正文。

## 受影响文件和模块

- `apps/editor/src/App.vue`
  - 在全局吸顶 header 中增加当前评分显示。
  - 复用现有 `useResumeStore()`，并引入或复用 `calculateOverallScore()` 计算总分。
  - 给 header 评分添加稳定测试 id，例如 `data-testid="header-score"`。
  - 保持品牌、语言选择和深色模式按钮可用。
- `apps/editor/src/components/ResumeWorkspace.vue`
  - 移除工作区左上标题块：`editor.toolbar.eyebrow` 和 `editor.toolbar.title`。
  - 移除工作区顶部模块数量、评分 metric pill 和本地草稿标签。
  - 将 `ResumeScoreRadar` 从顶部工具栏区域移动到左侧栏 `MaterialPanel` 下方。
  - 保留 `HistoryControls`，作为轻量工作区操作区或独立 actions row，避免撤销/重做回退。
  - 删除不再需要的 `NSpace`、`NTag`、`NText` 和 `calculateOverallScore` 导入。
- `apps/editor/src/components/MaterialPanel.vue`
  - 原则上不改物料面板职责；如布局需要，不在该组件内部放雷达图。
  - 保持 `material-*` test id、拖拽 clone 和模块开关行为不变。
- `apps/editor/src/components/ResumeScoreRadar.vue`
  - 保持 ECharts 渲染和 `data-testid="resume-score-radar"` 不变。
  - 如左侧栏尺寸导致图表过窄，优先通过 CSS 控制容器尺寸，不改图表数据结构。
- `apps/editor/src/i18n/index.ts`
  - 复用 `editor.metrics.score` 作为 header 评分标签，或新增更明确的 `app.score` 文案。
  - 移除或保留未使用的 `editor.metrics.modules`、`editor.localDraft`、`editor.toolbar.*` 需按最终实现决定；若保留，不能在 UI 中继续展示。
  - 确保中英文评分和雷达图文案完整，不出现 raw key。
- `apps/editor/src/styles.css`
  - 新增或调整 header 评分样式，例如 `.header-score`。
  - 删除或改造旧顶部指标样式：`.toolbar-metrics`、`.metric-pill`、`.score-card`、`.score-card-copy`。
  - 为左侧雷达卡片增加样式，例如 `.left-score-card` 或 `.sidebar-score-card`。
  - 调整 `.workspace-toolbar`，让没有标题和 metric 后的顶部空间更紧凑。
  - 调整 `.workspace-column-left` 为纵向布局，使模块选择和雷达卡片之间有稳定间距。
  - 保持 `@media (max-width: 1320px)` 和 `@media (max-width: 900px)` 下无横向溢出。
- `tests/e2e/editor.spec.ts`
  - 更新加载页断言：header 评分可见，工作区标题、本地草稿和模块数量 metric 不可见。
  - 更新雷达图位置断言：`resume-score-radar` 位于左侧栏或左侧评分卡内。
  - 保留 sticky header、移动端无横向溢出、撤销/重做、主题、导出、拖拽同步等现有断言。
- `CODE_MAP.md`
  - 实现后更新 `App.vue`、`ResumeWorkspace.vue` 和雷达图布局说明。
- `PROJECT_PROGRESS.md`
  - 实现并验证后记录本次布局精简里程碑。
- `specs/editor-layout-metrics-cleanup/tasks.md`
  - 下一步按本计划拆分任务。
- `specs/editor-layout-metrics-cleanup/verify.md`
  - 验证阶段记录命令、浏览器烟测和风险。

## 架构和数据流

### Header 评分数据流

1. `App.vue` 使用 `useResumeStore()` 获取当前简历文档。
2. `App.vue` 通过 `calculateOverallScore(store.document)` 计算安全总分。
3. Header 渲染一个紧凑评分块，包含本地化标签和分数。
4. Header 继续 fixed/sticky 在页面顶部，因此滚动时评分保持可见。
5. 当简历评分数据变化时，computed 自动更新 header 评分。

建议结构：

```text
app-header
  brand-lockup
  header-actions
    header-score
    locale-select
    dark-mode-button
```

### 左侧雷达图数据流

1. `ResumeWorkspace.vue` 继续在 `onMounted()` 调用 `store.loadInitialResume()`。
2. 左侧栏先渲染 `MaterialPanel`。
3. `MaterialPanel` 下方渲染评分卡片，显示 `editor.scoreRadar.title`、总分和 `ResumeScoreRadar`。
4. `ResumeScoreRadar` 继续接收 `store.document.score`，不改变图表内部逻辑。
5. 左侧栏在桌面端 sticky，在移动端自然流式排列，雷达图不进入 PDF 导出区域。

建议结构：

```text
workspace-grid
  workspace-column-left
    MaterialPanel
    sidebar-score-card
      score-overview
      ResumeScoreRadar
  workspace-column-main
    ResumeCanvas
  workspace-column-right
    ResumePreview
```

### 工作区顶部精简

1. 删除展示“简历搭建 / 编辑工作台”的标题块。
2. 删除模块数量 metric、本地草稿 tag 和顶部雷达卡片。
3. 保留撤销/重做控件，但不再和评分卡片混排。
4. 中间 `ResumeCanvas` 内部标题继续显示“简历编辑”，确保主编辑区域仍有明确标题。

## 数据模型变化

- 不新增数据模型。
- 不修改 `ResumeDocument`、`ResumeScore`、`EditorPreferences` 或 persisted state。
- 不修改 localStorage 草稿保存和恢复逻辑。
- 不修改 `packages/shared` 中的评分 schema 或工具函数。

## API 或接口变化

- 不新增后端 API。
- 不新增依赖。
- 前端组件接口变化：
  - `App.vue` 新增 header score 的 DOM/test 接口：`data-testid="header-score"`。
  - `ResumeWorkspace.vue` 可新增左侧评分卡 DOM/test 接口：`data-testid="left-score-panel"`。
  - `resume-score-radar` test id 保持不变。
- i18n 接口：
  - 优先复用 `editor.metrics.score`。
  - 如新增 `app.score`，需要同时补齐 `zh-CN` 和 `en-US`。

## 实施步骤

1. 更新 `App.vue`。
   - 引入 `calculateOverallScore`。
   - 新增 `overallScore` computed。
   - 在 header 操作区中添加评分块，放在语言选择和深色模式按钮之前。
   - 给评分块添加 `data-testid="header-score"` 和可访问标签。

2. 精简 `ResumeWorkspace.vue` 顶部。
   - 移除标题块、`toolbar-eyebrow` 和 `h1`。
   - 移除模块数量 metric、评分 metric 和 `NTag` 本地草稿。
   - 将 `HistoryControls` 保留在轻量 actions 容器中。
   - 将 `ResumeScoreRadar` 移动到左侧栏 `MaterialPanel` 下方。
   - 移除不再使用的导入和 computed。

3. 调整样式。
   - 新增 `.header-actions` 或等价 wrapper，避免 header 在桌面和移动端拥挤。
   - 新增 `.header-score`，让评分紧凑、可读、和浅蓝主题一致。
   - 将 `.workspace-toolbar` 改为紧凑 action row，或在只有历史控件时降低垂直占位。
   - 将 `.workspace-column-left` 改为 grid/flex column，增加 `gap`。
   - 新增 `.sidebar-score-card`，使用 8px 或更小圆角，避免卡片嵌套卡片。
   - 调整 `.score-radar` 在左侧栏中的高度，桌面端建议 150 到 180px，移动端可保持 150px 左右。
   - 清理旧 `.toolbar-metrics`、`.metric-pill`、`.score-card` 相关死样式，或重命名为新的左侧评分样式。
   - 复查 1320px 和 900px 断点，确保 header actions 换行后 `.app-shell` padding-top 仍正确。

4. 更新 i18n。
   - 如果 header 直接复用 `editor.metrics.score`，不需要新增文案。
   - 若新增 header 专用文案，补齐中文和英文。
   - 移除 UI 中对 `editor.localDraft`、`editor.metrics.modules`、`editor.toolbar.eyebrow`、`editor.toolbar.title` 的引用。

5. 更新 E2E 测试。
   - `loads the editor workspace` 断言 `header-score` 可见并包含当前分数。
   - 断言页面不显示“简历搭建”“编辑工作台”“本地草稿”。
   - 断言旧 `.toolbar-metrics` 或 `.metric-pill` 不存在。
   - 断言 `resume-score-radar` 位于 `.workspace-column-left` 或 `left-score-panel` 内。
   - 保留 `resume-score-radar` 桌面和移动端可见断言。
   - 保留 body 无横向溢出断言。

6. 回归检查。
   - 确认中间 `ResumeCanvas` 标题“简历编辑”仍可见。
   - 确认主题切换、PDF 导出、撤销/重做、模块拖拽和预览同步流程没有变更。
   - 确认 PDF 导出仍只捕获 `preview-paper`。

7. 更新文档。
   - 实现后在 `CODE_MAP.md` 记录 header 评分和左侧雷达图职责。
   - 实现并验证后在 `PROJECT_PROGRESS.md` 记录完成状态和验证结果。
   - 在 `$spec-verify` 阶段写入 `verify.md`。

## 风险

- Header 空间变紧：评分、语言选择和深色按钮在窄屏可能换行，需要同步调整 `.app-shell` 顶部 padding。
- ECharts 在左侧窄栏内渲染可能标签拥挤，需要通过容器高度、雷达半径或 CSS 宽度控制，但不应改评分维度。
- 删除工作区标题后，页面可能缺少主语义标题；需要保留 `main` 和中间面板标题“简历编辑”，必要时用隐藏 heading 保持可访问性。
- 文案删除不彻底可能导致“本地草稿”或旧标题仍在测试/页面中出现。
- 旧样式不清理会留下无用 CSS，后续维护时容易误判布局来源。
- 移动端 header 高度变化会影响 fixed header 下方内容起始位置。

## 验证命令

实现完成后运行：

```bash
corepack yarn lint
corepack yarn typecheck
corepack yarn test:unit
corepack yarn test:e2e
corepack yarn build
git diff --check
```

建议聚焦命令：

```bash
corepack yarn workspace @airesumecraft/editor typecheck
corepack yarn test:e2e -- tests/e2e/editor.spec.ts
```

浏览器烟测：

- 桌面视口 `1872x1009`：header 评分可见、旧模块数量/本地草稿/工作台标题不可见、雷达图位于左侧模块选择下方。
- 移动视口 `390x844`：header 不遮挡内容，评分和雷达图可访问，无 body 横向溢出。
- 滚动页面：header 评分仍保持可见。
- PDF 导出：导出内容仍只包含右侧 `preview-paper`。

## 需要更新的文档

- `CODE_MAP.md`：更新 `App.vue`、`ResumeWorkspace.vue`、`ResumeScoreRadar.vue` 的布局职责描述。
- `PROJECT_PROGRESS.md`：新增本次布局与评分信息精简的完成状态、验证结果和风险。
- `README.md`：如果 README 有截图或功能说明提到顶部模块数量、本地草稿或评分位置，需要同步更新；若没有相关描述则无需改动。
- `specs/editor-layout-metrics-cleanup/verify.md`：验证阶段记录实际命令和浏览器烟测结果。

## 需要确认

- 无阻塞确认项。默认保留撤销/重做控件，并只移除用户明确指出的模块数量、本地草稿、工作区标题和顶部雷达位置。
