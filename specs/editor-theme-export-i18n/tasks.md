# 编辑器主题、导出与国际化任务清单

## 工作区与依赖准备

- [x] T001 运行 `git status --short`，确认当前工作区状态，避免覆盖无关改动。
- [x] T002 检查 `.gitignore` 是否覆盖 PDF 导出测试产物、Playwright trace、截图、coverage、editor `dist`、Nuxt `.output` 和临时文件。
- [x] T003 如验证或导出新增未忽略产物，更新 `.gitignore`。
- [x] T004 在 `apps/editor/package.json` 添加 `html2canvas` 依赖。
- [x] T005 在 `apps/editor/package.json` 添加 `jspdf` 依赖。
- [x] T006 运行 `corepack yarn install` 更新 `yarn.lock`。
- [x] T007 确认 `echarts` 已存在且无需重复安装。

## 主题配置

- [x] T008 新建 `apps/editor/src/config/resumeThemes.ts`。
- [x] T009 定义 `ResumeThemeId` 类型。
- [x] T010 定义 `ResumeThemeDefinition` 类型。
- [x] T011 定义默认主题 id `classic-blue`。
- [x] T012 实现 `classic-blue` 主题，保留当前深蓝章节标签视觉。
- [x] T013 实现 `modern-sky` 主题，使用浅蓝强调和更轻量的章节样式。
- [x] T014 实现 `mono-compact` 主题，使用黑白紧凑投递风格。
- [x] T015 为每个主题配置 i18n label key。
- [x] T016 为每个主题配置局部 CSS 变量，至少覆盖强调色、标题背景、标题文字、纸张背景、正文颜色和章节间距。
- [x] T017 导出主题列表、主题映射和获取主题的 helper。

## Store 偏好设置

- [x] T018 在 `apps/editor/src/stores/resume.ts` 中新增 `EditorPreferences` 类型。
- [x] T019 将 `preferences` 扩展为包含 `darkMode`、`resumeThemeId`、`previewFontFamily`、`previewFontSize`、`previewLineHeight`、`previewAccentColor`、`exportQuality`。
- [x] T020 新增 `defaultPreferences`。
- [x] T021 新增 preferences 归一化函数，兼容旧 localStorage 中只有 `darkMode` 的状态。
- [x] T022 在 `restoreDocument()` 或 store 初始化路径中应用 preferences 归一化。
- [x] T023 新增 `setResumeTheme(themeId)` action。
- [x] T024 新增 `setPreviewFontFamily(value)` action。
- [x] T025 新增 `setPreviewFontSize(value)` action。
- [x] T026 新增 `setPreviewLineHeight(value)` action。
- [x] T027 新增 `setPreviewAccentColor(value)` action。
- [x] T028 新增 `setExportQuality(value)` action。
- [x] T029 确保 Pinia persisted pick 继续包含 `document`、`preferences`、`selectedModuleId`。
- [x] T030 确保拖拽临时顺序和历史栈不进入 persisted state。

## 撤销与重做

- [x] T031 在 `apps/editor/src/stores/resume.ts` 中新增历史快照类型。
- [x] T032 新增 `pastSnapshots` 和 `futureSnapshots` session-only 历史栈。
- [x] T033 新增历史恢复保护标记，避免 undo/redo 期间重复记录历史。
- [x] T034 新增 `recordHistory()` 内部方法，记录 `document` 和参与撤销的 `preferences`。
- [x] T035 设置历史栈上限，例如 50 或 80。
- [x] T036 新增 `canUndo` computed。
- [x] T037 新增 `canRedo` computed。
- [x] T038 新增 `undo()` action。
- [x] T039 新增 `redo()` action。
- [x] T040 在 `updateModule()` 前记录历史。
- [x] T041 在 `renameModule()` 前记录历史。
- [x] T042 在 `addModule()`、`duplicateModule()`、`removeModule()`、`removeModulesByType()` 前记录历史。
- [x] T043 在 `reorderModules()` 前记录历史，并避免拖拽预览临时顺序产生无效历史。
- [x] T044 在 `setLocale()` 和 preferences setter 前记录历史。
- [x] T045 新编辑发生后清空 redo 分支。
- [x] T046 undo/redo 恢复后校正模块顺序和当前选中模块。

## PDF 导出

- [x] T047 新建 `apps/editor/src/composables/usePdfExport.ts`。
- [x] T048 定义 `PdfExportQuality` 和 `PdfExportOptions` 类型。
- [x] T049 实现标准质量配置：较低 scale 和 JPEG quality。
- [x] T050 实现高质量配置：较高 scale 和 JPEG quality。
- [x] T051 暴露 `isExporting` 状态。
- [x] T052 暴露 `exportError` 状态。
- [x] T053 实现 `exportPreview(element, options)`。
- [x] T054 在导出前处理空元素，返回本地化错误或失败状态。
- [x] T055 使用 `html2canvas` 捕获 `preview-paper`。
- [x] T056 使用 `jsPDF` 创建 A4 纵向 PDF。
- [x] T057 按 A4 页面宽度缩放 canvas 图片。
- [x] T058 实现内容超过一页时的分页切片。
- [x] T059 导出时临时添加 export class，关闭 hover、拖拽阴影和不必要的交互效果。
- [x] T060 导出完成或失败后清理临时 class。
- [x] T061 生成文件名，优先使用简历姓名，缺省使用本地化默认文件名。
- [x] T062 捕获跨域图片、canvas 和 PDF API 错误，并暴露可恢复错误状态。

## 预览工具栏与预览主题应用

- [x] T063 评估是否拆出 `ResumePreviewToolbar.vue`；如拆出，保持 `ResumePreview.vue` 只负责预览渲染。
- [x] T064 将 `ResumePreview.vue` 中本地 `fontFamily` 改为 store preference。
- [x] T065 将 `ResumePreview.vue` 中本地 `fontSize` 改为 store preference。
- [x] T066 将 `ResumePreview.vue` 中本地 `lineHeight` 改为 store preference。
- [x] T067 将 `ResumePreview.vue` 中本地 `accentColor` 改为 store preference。
- [x] T068 在预览工具栏添加主题选择控件，设置 `data-testid="resume-theme-select"`。
- [x] T069 在预览工具栏添加导出质量选择控件，设置 `data-testid="export-quality-select"`。
- [x] T070 在预览工具栏添加 PDF 导出按钮，设置 `data-testid="export-pdf-button"`。
- [x] T071 导出按钮在 `isExporting` 时显示 loading 或禁用态。
- [x] T072 为 `preview-paper` 添加 ref 和 `data-testid="preview-paper"`。
- [x] T073 为 `preview-paper` 添加当前主题 data attribute，便于 E2E 断言。
- [x] T074 合并主题 CSS 变量和用户排版设置生成 `previewStyle`。
- [x] T075 确保预览模块拖拽排序和中间编辑区同步逻辑不回退。
- [x] T076 确保主题切换不会重置当前模块顺序、内容或展开状态。

## 历史控件

- [x] T077 新建 `apps/editor/src/components/HistoryControls.vue` 或在现有 toolbar 中实现等价控件。
- [x] T078 添加撤销按钮，设置 `data-testid="undo-button"`。
- [x] T079 添加重做按钮，设置 `data-testid="redo-button"`。
- [x] T080 撤销按钮按 `canUndo` 禁用。
- [x] T081 重做按钮按 `canRedo` 禁用。
- [x] T082 将历史控件接入 `ResumeWorkspace.vue` 或预览工具栏。
- [x] T083 保证历史控件在移动端可触达且不挤压主要标题。

## 评分雷达图

- [x] T084 在 `ResumeWorkspace.vue` 接入 `ResumeScoreRadar`。
- [x] T085 将 `store.document.score` 作为雷达图数据源。
- [x] T086 为雷达图容器添加 `data-testid="resume-score-radar"`。
- [x] T087 调整 `ResumeScoreRadar.vue` 的 resize 处理，避免明显加剧 `ResizeObserver loop` 开发提示。
- [x] T088 调整雷达图在桌面三列布局中的位置和尺寸。
- [x] T089 调整雷达图在移动端布局中的位置和尺寸，避免横向溢出。

## 表单校验

- [x] T090 新建或扩展 `apps/editor/src/composables/useResumeValidation.ts`。
- [x] T091 增加姓名必填校验。
- [x] T092 增加邮箱格式校验。
- [x] T093 增加导出前预览非空校验。
- [x] T094 在相关编辑表单或导出流程展示本地化校验提示。
- [x] T095 确保校验提示不阻断已有本地草稿恢复。

## 国际化

- [x] T096 在 `apps/editor/src/i18n/index.ts` 添加主题相关中文文案。
- [x] T097 在 `apps/editor/src/i18n/index.ts` 添加主题相关英文文案。
- [x] T098 添加 PDF 导出、导出质量、导出中、导出成功、导出失败中文文案。
- [x] T099 添加 PDF 导出、导出质量、导出中、导出成功、导出失败英文文案。
- [x] T100 添加撤销、重做、不可撤销、不可重做中文文案。
- [x] T101 添加撤销、重做、不可撤销、不可重做英文文案。
- [x] T102 添加评分雷达图相关中文和英文文案。
- [x] T103 添加表单校验相关中文和英文文案。
- [x] T104 修复 `App.vue` 中语言选择项中文源码可读性问题。
- [x] T105 检查新增 UI 不出现 raw i18n key。

## 样式与响应式

- [x] T106 在 `apps/editor/src/styles.css` 中新增主题变量使用规则。
- [x] T107 将预览章节标题硬编码颜色迁移为 CSS 变量。
- [x] T108 将预览纸张背景、正文色、分割线和水印颜色迁移为 CSS 变量。
- [x] T109 增加 `.preview-paper.is-exporting` 或等价导出专用样式。
- [x] T110 增加导出控件和历史控件样式。
- [x] T111 增加评分雷达图容器样式。
- [x] T112 调整预览工具栏在桌面宽度下的对齐和换行。
- [x] T113 调整预览工具栏在移动端宽度下的换行或横向滚动。
- [x] T114 确保主题、导出、历史和雷达图控件不导致横向溢出。
- [x] T115 确保主题样式只作用于预览区，不污染 Naive UI 控件和编辑器外壳。

## Store 单元测试

- [x] T116 在 `apps/editor/src/__tests__/resume-store.spec.ts` 增加默认 preferences 测试。
- [x] T117 增加旧 preferences 归一化测试。
- [x] T118 增加主题切换会更新并持久化 preferences 的测试。
- [x] T119 增加预览字号、行距、字体、强调色 setter 测试。
- [x] T120 增加导出质量 setter 测试。
- [x] T121 增加内容编辑 undo/redo 测试。
- [x] T122 增加模块排序 undo/redo 测试。
- [x] T123 增加模块删除 undo 恢复测试。
- [x] T124 增加主题切换 undo/redo 测试。
- [x] T125 增加 undo 后新编辑会清空 redo 分支的测试。
- [x] T126 增加历史栈不进入 persisted state 的测试。

## 组件测试

- [x] T127 新增 `apps/editor/src/components/__tests__/ResumePreview.spec.ts` 或等价组件测试文件。
- [x] T128 mock `html2canvas`。
- [x] T129 mock `jspdf`。
- [x] T130 测试主题选择控件会调用 store 主题 setter。
- [x] T131 测试导出质量选择控件会调用 store 导出质量 setter。
- [x] T132 测试点击 PDF 导出按钮会触发导出流程。
- [x] T133 测试导出中按钮显示 loading 或 disabled。
- [x] T134 测试导出失败时展示错误状态或错误消息。
- [x] T135 新增表单校验组件测试，覆盖姓名必填。
- [x] T136 新增表单校验组件测试，覆盖邮箱格式。
- [x] T137 新增拖拽相关组件或集成测试，覆盖预览 body module reorder setter。

## E2E 测试

- [x] T138 更新 `tests/e2e/editor.spec.ts`，覆盖主题选择后 `preview-paper` 主题属性变化。
- [x] T139 添加刷新后主题选择恢复的 E2E 断言。
- [x] T140 添加字号或行距设置刷新恢复的 E2E 断言。
- [x] T141 添加编辑字段后点击撤销，断言中间编辑区和右侧预览同步恢复。
- [x] T142 添加撤销后点击重做，断言中间编辑区和右侧预览同步恢复。
- [x] T143 添加撤销后新编辑清空重做按钮状态的 E2E 断言。
- [x] T144 添加导出质量选择和 PDF 导出按钮可点击的 E2E 断言。
- [x] T145 添加雷达图可见且不溢出的 E2E 断言。
- [x] T146 保留并更新现有中间拖拽排序实时同步右侧预览的 E2E。
- [x] T147 保留并更新现有右侧预览拖拽排序同步中间编辑区的 E2E。
- [x] T148 捕获并评估浏览器 console actionable errors。

## 文档与项目跟踪

- [x] T149 更新 `CODE_MAP.md`，记录主题配置、PDF 导出 composable、历史栈和雷达图接入位置。
- [x] T150 更新 `PROJECT_PROGRESS.md`，记录本功能里程碑、状态、验证结果和已知风险。
- [x] T151 更新 `README.md`，说明 PDF 导出、主题切换、撤销/重做和本地运行验证命令。
- [x] T152 在后续 verify 阶段创建或更新 `specs/editor-theme-export-i18n/verify.md`。
- [x] T153 确认 spec 相关文档均使用中文正文。

## 验证

- [x] T154 运行 `corepack yarn lint` 并修复所有 lint 问题。
- [x] T155 运行 `corepack yarn typecheck` 并修复所有类型错误。
- [x] T156 运行 `corepack yarn test:unit` 并修复所有单元或组件测试失败。
- [x] T157 运行 `corepack yarn test:e2e` 并修复所有 E2E 失败。
- [x] T158 运行 `corepack yarn build` 并修复所有构建失败。
- [x] T159 启动 `corepack yarn dev:editor` 做桌面浏览器烟测。
- [x] T160 在 `1872x1009` 左右桌面视口检查主题、导出、撤销/重做、雷达图和拖拽同步。
- [x] T161 在 `390x844` 左右移动视口检查无横向溢出、控件可达、雷达图不遮挡。
- [x] T162 手动验证标准质量 PDF 能生成且包含当前主题。
- [x] T163 手动验证高质量 PDF 能生成且包含当前主题。
- [x] T164 手动验证长内容导出不会直接截断第一页内容。
- [x] T165 检查浏览器控制台，仅保留已知非阻塞开发提示。
- [x] T166 运行 `git diff --check`。

## 收尾

- [x] T167 复查 `git status --short`，确认没有意外生成物。
- [x] T168 复查实现范围是否与 `spec.md` 和 `plan.md` 对齐。
- [x] T169 汇总实际改动、验证结果、已知警告和未完成事项。
