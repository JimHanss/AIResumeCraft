# 编辑器布局与评分信息精简任务清单

## 准备与工作区检查

- [x] T001 运行 `git status --short`，确认当前未提交改动范围，避免覆盖无关变更。
- [x] T002 复查 `specs/editor-layout-metrics-cleanup/spec.md`，确认验收标准仍然聚焦布局和评分信息精简。
- [x] T003 复查 `specs/editor-layout-metrics-cleanup/plan.md`，确认实现不改变评分算法、数据模型或草稿持久化。
- [x] T004 检查 `.gitignore` 是否已覆盖本次可能产生的 Playwright 报告、截图、构建输出和临时日志。
- [x] T005 如本次验证产生新的安全非项目产物，更新 `.gitignore`。

## Header 评分

- [x] T006 在 `apps/editor/src/App.vue` 引入 `calculateOverallScore`。
- [x] T007 在 `apps/editor/src/App.vue` 新增 `overallScore` computed，读取 `store.document` 计算总分。
- [x] T008 将 header 右侧控件包裹为明确的 header actions 容器。
- [x] T009 在语言选择和深色模式按钮之前渲染 header 评分块。
- [x] T010 给 header 评分块添加 `data-testid="header-score"`。
- [x] T011 Header 评分块使用本地化评分标签，优先复用 `editor.metrics.score`。
- [x] T012 Header 评分缺失或异常时显示安全默认值，不展示 `NaN`、`undefined` 或 raw key。
- [x] T013 确认品牌、语言切换和深色模式按钮行为不因 header 评分改动回退。

## 工作区顶部精简

- [x] T014 在 `apps/editor/src/components/ResumeWorkspace.vue` 移除 `NText` 导入。
- [x] T015 在 `ResumeWorkspace.vue` 移除 `NSpace` 导入。
- [x] T016 在 `ResumeWorkspace.vue` 移除 `NTag` 导入。
- [x] T017 在 `ResumeWorkspace.vue` 移除旧顶部 `overallScore` computed，并改用左侧 `sidebarScore` computed。
- [x] T018 从工作区顶部移除 `editor.toolbar.eyebrow` 对应的“简历搭建”展示。
- [x] T019 从工作区顶部移除 `editor.toolbar.title` 对应的“编辑工作台”展示。
- [x] T020 从工作区顶部移除模块数量 metric。
- [x] T021 从工作区顶部移除评分 metric。
- [x] T022 从工作区顶部移除“本地草稿”可见标签。
- [x] T023 保留 `HistoryControls`，并将其放入轻量工作区操作区。
- [x] T024 确认中间 `ResumeCanvas` 面板标题“简历编辑”仍然可见。

## 左侧雷达评分

- [x] T025 在 `ResumeWorkspace.vue` 左侧栏 `MaterialPanel` 下方新增评分容器。
- [x] T026 给左侧评分容器添加稳定测试 id，例如 `data-testid="left-score-panel"`。
- [x] T027 在左侧评分容器中显示 `editor.scoreRadar.title`。
- [x] T028 在左侧评分容器中显示当前总分。
- [x] T029 将 `ResumeScoreRadar` 移动到左侧评分容器内。
- [x] T030 保持 `ResumeScoreRadar` 的 `score` prop 继续传入 `store.document.score`。
- [x] T031 保持 `ResumeScoreRadar` 的 `data-testid="resume-score-radar"` 不变。
- [x] T032 确认雷达评分不进入右侧 `preview-paper`，PDF 导出捕获范围不变。

## 国际化与可见文案

- [x] T033 检查 `apps/editor/src/i18n/index.ts` 是否已有可复用的中英文评分文案。
- [x] T034 如新增 header 专用评分文案，同时补齐 `zh-CN` 和 `en-US`。
- [x] T035 确认 UI 不再引用 `editor.localDraft`。
- [x] T036 确认 UI 不再引用 `editor.metrics.modules`。
- [x] T037 确认 UI 不再引用 `editor.toolbar.eyebrow` 和 `editor.toolbar.title`。
- [x] T038 保留或清理未使用 i18n key 时，确保不影响已有测试和文档说明。

## 样式与响应式

- [x] T039 在 `apps/editor/src/styles.css` 新增 header actions 布局样式。
- [x] T040 新增 `.header-score` 或等价样式，使 header 评分紧凑、清晰、符合浅蓝主题。
- [x] T041 调整深色模式下 header 评分的边框、背景和文字对比度。
- [x] T042 精简 `.workspace-toolbar`，降低移除标题和 metric 后的垂直占位。
- [x] T043 调整 `.workspace-column-left` 为纵向布局，稳定排列模块选择和雷达评分。
- [x] T044 新增 `.sidebar-score-card` 或等价样式，避免卡片嵌套卡片。
- [x] T045 调整左侧雷达图高度，使桌面端不会遮挡模块列表和“添加模块”按钮。
- [x] T046 调整移动端断点，确保 header 换行后内容不被 fixed header 遮挡。
- [x] T047 调整移动端左侧评分容器，确保无 body 横向溢出。
- [x] T048 删除或重命名旧顶部 metric 相关死样式：`.toolbar-metrics`、`.metric-pill`、`.score-card`、`.score-card-copy`。
- [x] T049 复查 1320px 断点布局，确保左侧雷达、主编辑区和预览区排列合理。
- [x] T050 复查 900px 断点布局，确保评分和雷达图仍可访问。

## E2E 测试

- [x] T051 更新 `tests/e2e/editor.spec.ts` 的加载页测试，断言 `header-score` 可见。
- [x] T052 在加载页测试中断言 header 评分包含当前分数。
- [x] T053 在加载页测试中断言“简历搭建”不可见。
- [x] T054 在加载页测试中断言“编辑工作台”不可见。
- [x] T055 在加载页测试中断言“本地草稿”不可见。
- [x] T056 在加载页测试中断言旧模块数量 metric 不存在。
- [x] T057 在加载页测试中断言 `resume-score-radar` 位于 `left-score-panel` 内。
- [x] T058 保留并更新 sticky header 测试，确认滚动后 header 评分仍可见。
- [x] T059 保留并更新移动端响应式测试，确认 `390x844` 下无横向溢出。
- [x] T060 保留主题切换、导出、撤销/重做、模块拖拽和预览同步测试。

## 聚焦验证

- [x] T061 运行 `corepack yarn workspace @airesumecraft/editor typecheck`。
- [x] T062 运行 `corepack yarn test:e2e -- tests/e2e/editor.spec.ts`。
- [x] T063 如聚焦验证失败，修复对应类型、布局或断言问题。
- [x] T064 启动 `corepack yarn dev:editor` 做桌面浏览器烟测。
- [x] T065 在桌面视口 `1872x1009` 检查 header 评分、左侧雷达、旧元素移除和三栏布局。
- [x] T066 在移动视口 `390x844` 检查 header 不遮挡内容、雷达可访问、无横向溢出。
- [x] T067 滚动页面，检查 header 评分保持可见。
- [x] T068 触发 PDF 导出，确认导出区域仍只包含右侧简历预览。

## 全量验证

- [x] T069 运行 `corepack yarn lint`。
- [x] T070 运行 `corepack yarn typecheck`。
- [x] T071 运行 `corepack yarn test:unit`。
- [x] T072 运行 `corepack yarn test:e2e`。
- [x] T073 运行 `corepack yarn build`。
- [x] T074 运行 `git diff --check`。
- [x] T075 记录验证过程中的非阻塞 warning。

## 文档与收尾

- [x] T076 更新 `CODE_MAP.md`，记录 header 评分和左侧雷达评分布局职责。
- [x] T077 更新 `PROJECT_PROGRESS.md`，记录本功能完成状态、验证结果和已知风险。
- [x] T078 检查 `README.md` 是否提到旧顶部模块数量、本地草稿或评分位置；如有则更新。
- [x] T079 在 verify 阶段创建或更新 `specs/editor-layout-metrics-cleanup/verify.md`。
- [x] T080 复查 `.gitignore`，确认没有把源码、测试、规格、文档或锁文件误忽略。
- [x] T081 运行 `git status --short`，确认没有意外生成物进入未跟踪列表。
- [x] T082 汇总实际变更、验证结果、已知风险和后续建议。
