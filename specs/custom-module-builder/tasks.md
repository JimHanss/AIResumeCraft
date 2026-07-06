# 自定义模块构建器任务清单

## 准备与文档校正

- [x] T001 运行 `git status --short`，确认当前工作区改动范围，避免覆盖无关变更。
- [x] T002 复查 `specs/custom-module-builder/spec.md`，确认本功能目标和验收标准。
- [x] T003 复查 `specs/custom-module-builder/plan.md`，确认“不做富文本”和“响应式网格配置”是最终实现约束。
- [x] T004 更新 `specs/custom-module-builder/spec.md`，移除富文本相关目标、范围、验收标准和边界情况。
- [x] T005 在 `specs/custom-module-builder/spec.md` 标记响应式网格配置为已确认决策。
- [x] T006 检查 `.gitignore` 是否覆盖 Playwright 报告、截图、coverage、dist、Nuxt `.output` 和临时日志。
- [x] T007 如本功能验证产生新的临时产物，更新 `.gitignore`。

## Shared 数据模型

- [x] T008 在 `packages/shared/src/resume.ts` 将 `custom` 加入 `resumeModuleTypeSchema`。
- [x] T009 在 `resume.ts` 新增 `customFieldTypeSchema`，包含 `text`、`textarea`、`list`。
- [x] T010 在 `resume.ts` 新增 `customFieldSpanSchema`，限定为 `12`、`6`、`4`。
- [x] T011 在 `resume.ts` 新增自定义列表项 schema。
- [x] T012 在 `resume.ts` 新增自定义字段基础 schema。
- [x] T013 在 `resume.ts` 新增单行输入字段 schema。
- [x] T014 在 `resume.ts` 新增多行输入字段 schema。
- [x] T015 在 `resume.ts` 新增列表字段 schema。
- [x] T016 在 `resume.ts` 新增 `customResumeModuleSchema`。
- [x] T017 将 `customResumeModuleSchema` 加入 `resumeModuleSchema` discriminated union。
- [x] T018 导出 `CustomFieldSpan`、`CustomFieldType`、`CustomListItem`、`CustomResumeField` 和 `CustomResumeModule` 类型。
- [x] T019 确认 `ResumeModuleFor<'custom'>` 可以正确推导自定义模块类型。

## Shared 工具函数与迁移

- [x] T020 在 `packages/shared/src/utils.ts` 新增 `createCustomListItem(text?)`。
- [x] T021 在 `utils.ts` 新增 `createCustomField(type, overrides?)`。
- [x] T022 在 `utils.ts` 新增默认自定义模块创建逻辑。
- [x] T023 扩展 `createResumeModule('custom')`，返回可用的默认自定义模块。
- [x] T024 扩展 `cloneResumeModule()`，克隆自定义模块时重建模块 id。
- [x] T025 扩展 `cloneResumeModule()`，克隆自定义模块时重建字段 id。
- [x] T026 扩展 `cloneResumeModule()`，克隆自定义模块时重建列表项 id。
- [x] T027 新增自定义字段迁移函数，补齐缺失 `id`、`label`、`span`、`order`。
- [x] T028 自定义单行字段迁移时补齐 `value` 和 `placeholder`。
- [x] T029 自定义多行字段迁移时补齐 `value`、`placeholder` 和 `minRows`。
- [x] T030 自定义列表字段迁移时补齐 `items` 和列表项 id。
- [x] T031 扩展 `migrateResumeModule()`，支持 `module.type === 'custom'`。
- [x] T032 确保 `safeResumeDocument()` 遇到旧 localStorage 自定义模块数据不会整体回退到 demo 简历。
- [x] T033 更新 `packages/shared/src/utils.spec.ts`，覆盖自定义模块创建。
- [x] T034 更新 `utils.spec.ts`，覆盖自定义字段默认值。
- [x] T035 更新 `utils.spec.ts`，覆盖自定义模块克隆和嵌套 id 重建。
- [x] T036 更新 `utils.spec.ts`，覆盖旧自定义模块数据迁移。

## Store 数据流

- [x] T037 在 `apps/editor/src/stores/resume.ts` 引入自定义模块相关类型和创建工具。
- [x] T038 新增 `addCustomModule(input, afterId?)` action。
- [x] T039 `addCustomModule()` 保存前校验模块名非空。
- [x] T040 `addCustomModule()` 保存前归一化字段顺序和 order。
- [x] T041 `addCustomModule()` 记录 history 快照。
- [x] T042 `addCustomModule()` 插入模块后调用统一 `reorderModules()` 逻辑。
- [x] T043 `addCustomModule()` 插入模块后设置 `selectedModuleId`。
- [x] T044 新增 `replaceCustomModuleSchema(id, content)` 或等价 action，用于二次编辑自定义模块结构。
- [x] T045 二次编辑结构时保留未删除字段的已有值。
- [x] T046 二次编辑结构时删除字段后依赖撤销/重做恢复。
- [x] T047 确保多个 `custom` 模块可以共存，不受 `activeModuleTypes` 唯一 type 逻辑影响。
- [x] T048 确保自定义模块删除、排序、重命名继续复用现有 store 行为。
- [x] T049 更新 `apps/editor/src/__tests__/resume-store.spec.ts`，覆盖 `addCustomModule()`。
- [x] T050 更新 store 单测，覆盖自定义模块内容更新。
- [x] T051 更新 store 单测，覆盖自定义模块结构二次编辑。
- [x] T052 更新 store 单测，覆盖自定义模块撤销/重做。
- [x] T053 更新 store 单测，覆盖多个自定义模块共存和按 id 删除。

## 构建器弹窗

- [x] T054 新建 `apps/editor/src/components/CustomModuleBuilderDialog.vue`。
- [x] T055 使用 Naive UI `NModal` 和 `NCard` 搭建非全屏弹窗。
- [x] T056 弹窗桌面端设置合理最大宽度，移动端不产生横向溢出。
- [x] T057 弹窗支持填写模块名。
- [x] T058 弹窗支持模块名必填校验和本地化错误提示。
- [x] T059 弹窗支持添加单行输入字段。
- [x] T060 弹窗支持添加多行输入字段。
- [x] T061 弹窗支持添加列表字段。
- [x] T062 字段配置支持编辑字段标题。
- [x] T063 字段配置支持编辑占位提示。
- [x] T064 字段配置支持选择响应式宽度：整行、半行、三分之一行。
- [x] T065 多行输入和列表字段支持配置显示高度或最小行数。
- [x] T066 字段配置支持删除字段。
- [x] T067 字段配置支持拖拽排序字段。
- [x] T068 列表字段支持设置初始列表项。
- [x] T069 弹窗保存时生成符合 shared schema 的自定义模块 payload。
- [x] T070 弹窗取消时不修改 store。
- [x] T071 弹窗关闭后清理 draft，避免下次打开残留上次输入。

## 左侧添加入口

- [x] T072 在 `MaterialPanel.vue` 引入 `CustomModuleBuilderDialog.vue`。
- [x] T073 将左侧底部“添加模块”按钮改为打开自定义模块构建器弹窗。
- [x] T074 保存弹窗时调用 `store.addCustomModule()`。
- [x] T075 保存成功后关闭弹窗。
- [x] T076 保留现有 `material-*` test id。
- [x] T077 保留现有预设模块拖拽 clone 行为。
- [x] T078 保留现有预设模块开关行为。
- [x] T079 确认点击添加模块不会再自动添加第一个未启用预设模块。

## 中间编辑区自定义模块

- [x] T080 新建 `apps/editor/src/components/modules/CustomModule.vue`。
- [x] T081 `CustomModule.vue` 按字段 order 渲染响应式编辑网格。
- [x] T082 单行字段使用语义化 label 和 `NInput`。
- [x] T083 多行字段使用语义化 label 和 `NInput type="textarea"`。
- [x] T084 列表字段支持渲染列表项编辑输入。
- [x] T085 列表字段支持添加列表项。
- [x] T086 列表字段支持删除列表项。
- [x] T087 列表字段支持拖拽排序列表项。
- [x] T088 字段内容编辑通过 `emit('update')` 写回 `store.updateModule()`。
- [x] T089 提供“编辑结构”入口，打开构建器弹窗编辑当前自定义模块结构。
- [x] T090 结构编辑保存后更新当前模块，不新建重复模块。
- [x] T091 自定义模块空字段时显示轻量空状态，不让编辑区看起来损坏。
- [x] T092 更新 `moduleRegistry.ts`，注册 `custom: CustomModule`。
- [x] T093 确认 `UnsupportedModule` 仍作为未知类型兜底。

## 右侧预览

- [x] T094 在 `ResumePreview.vue` 引入 `CustomResumeModule` 类型。
- [x] T095 新增 `isCustomModule()` 类型守卫。
- [x] T096 新增自定义模块预览分支。
- [x] T097 预览按字段 order 渲染自定义字段。
- [x] T098 预览按 `span` 设置响应式网格宽度。
- [x] T099 单行和多行字段为空时不渲染多余空白。
- [x] T100 列表字段为空时隐藏列表或显示简洁占位。
- [x] T101 列表字段预览使用语义化 `ul` / `li`。
- [x] T102 自定义模块预览继续作为整个 `preview-section` 参与右侧拖拽排序。
- [x] T103 确认自定义模块排序会同步中间编辑区。
- [x] T104 确认中间编辑区排序会同步右侧预览。
- [x] T105 更新 `ResumePreview.spec.ts`，覆盖自定义模块预览渲染。
- [x] T106 更新 `ResumePreview.spec.ts`，覆盖空字段和空列表处理。

## 国际化

- [x] T107 在 `apps/editor/src/i18n/index.ts` 新增 `modules.custom.title` 中文文案。
- [x] T108 在 `i18n/index.ts` 新增 `modules.custom.description` 中文文案。
- [x] T109 在 `i18n/index.ts` 新增 `modules.custom.badge` 中文文案。
- [x] T110 在 `i18n/index.ts` 新增 `modules.custom.*` 英文文案。
- [x] T111 新增 `editor.customModule.dialogTitle` 中英文文案。
- [x] T112 新增字段类型名称中英文文案。
- [x] T113 新增字段宽度选项中英文文案。
- [x] T114 新增添加字段、删除字段、编辑结构、添加列表项、删除列表项中英文文案。
- [x] T115 新增模块名必填、字段标题占位等校验提示中英文文案。
- [x] T116 检查新增 UI 不出现 raw i18n key。

## 样式与响应式

- [x] T117 在 `apps/editor/src/styles.css` 新增自定义模块弹窗样式。
- [x] T118 弹窗内容区支持内部滚动，底部操作按钮保持可访问。
- [x] T119 新增字段配置行样式，确保按钮、输入框和选择器不挤压。
- [x] T120 新增自定义字段编辑网格样式，支持 12 栅格 span。
- [x] T121 新增自定义预览网格样式，独立于编辑区网格。
- [x] T122 移动端将所有自定义字段降级为单列。
- [x] T123 确保弹窗、编辑区和预览区在 `390x844` 视口无横向溢出。
- [x] T124 确保深色模式下弹窗和自定义字段可读。
- [x] T125 确保不同简历主题下自定义模块预览不破坏章节标题样式。

## E2E 测试

- [x] T126 更新 `tests/e2e/editor.spec.ts`，覆盖点击“添加模块”打开自定义模块弹窗。
- [x] T127 E2E 覆盖模块名为空时不能保存。
- [x] T128 E2E 覆盖创建含单行字段的自定义模块。
- [x] T129 E2E 覆盖创建含多行字段的自定义模块。
- [x] T130 E2E 覆盖创建含列表字段的自定义模块。
- [x] T131 E2E 覆盖字段宽度配置保存后影响预览布局。
- [x] T132 E2E 覆盖自定义模块保存后默认展开并选中。
- [x] T133 E2E 覆盖编辑自定义字段内容后右侧预览实时同步。
- [x] T134 E2E 覆盖列表项添加、编辑、删除。
- [x] T135 E2E 覆盖自定义模块参与中间编辑区拖拽排序。
- [x] T136 E2E 覆盖自定义模块参与右侧预览拖拽排序。
- [x] T137 E2E 覆盖刷新后恢复自定义模块结构、内容和顺序。
- [x] T138 E2E 覆盖自定义模块删除一次点击生效。
- [x] T139 E2E 覆盖自定义模块撤销/重做。
- [x] T140 E2E 覆盖移动端无横向溢出。
- [x] T141 E2E 捕获并断言无 actionable console errors。

## 验证

- [ ] T142 运行 `corepack yarn workspace @airesumecraft/shared test:unit`。
- [ ] T143 运行 `corepack yarn workspace @airesumecraft/editor test:unit`。
- [x] T144 运行 `corepack yarn test:unit`。
- [x] T145 运行 `corepack yarn lint`。
- [x] T146 运行 `corepack yarn typecheck`。
- [x] T147 运行 `corepack yarn test:e2e tests/e2e/editor.spec.ts`。
- [x] T148 运行 `corepack yarn test:e2e`。
- [x] T149 运行 `corepack yarn build`。
- [x] T150 运行 `git diff --check`。
- [x] T151 启动 `corepack yarn dev:editor` 做桌面浏览器烟测。
- [x] T152 在桌面视口 `1872x1009` 检查弹窗、字段配置、三列布局和预览同步。
- [x] T153 在移动视口 `390x844` 检查弹窗、字段网格和预览无横向溢出。
- [x] T154 手动验证刷新恢复 localStorage 自定义模块数据。
- [x] T155 手动验证 PDF 导出包含自定义模块内容。
- [x] T156 记录验证过程中的非阻塞 warning。

## 文档与收尾

- [x] T157 更新 `CODE_MAP.md`，记录自定义模块 schema、store action、构建器弹窗、编辑组件和预览渲染位置。
- [x] T158 更新 `PROJECT_PROGRESS.md`，记录自定义模块构建器状态、验证结果和已知风险。
- [x] T159 更新 `README.md`，说明自定义模块创建能力和本地运行验证命令。
- [x] T160 在 verify 阶段创建或更新 `specs/custom-module-builder/verify.md`。
- [x] T161 复查 `.gitignore`，确认没有误忽略源码、测试、规格、文档或锁文件。
- [x] T162 运行 `git status --short`，确认没有意外生成物。
- [x] T163 汇总实际变更、验证结果、已知风险和后续建议。
