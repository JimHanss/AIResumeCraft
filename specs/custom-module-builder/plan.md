# 自定义模块构建器技术计划

## 已确认决策

- 本功能不实现富文本编辑区。
- 字段位置分布采用响应式网格配置，不做任意像素级绝对定位。
- 自定义模块首版字段类型收敛为：单行输入、多行输入、列表区。
- `spec.md` 已同步移除富文本相关范围、验收标准和边界情况。

## 受影响文件与模块

- `packages/shared/src/resume.ts`
  - 扩展 `resumeModuleTypeSchema`，加入 `custom`。
  - 新增自定义模块、字段、列表项的 Zod schema 和导出类型。
- `packages/shared/src/utils.ts`
  - 新增自定义模块、字段、列表项创建工具。
  - 扩展 `createResumeModule()`、`cloneResumeModule()` 和持久化迁移逻辑。
- `packages/shared/src/fixtures.ts`
  - 可选：不必默认加入自定义模块；如测试需要可补充稳定示例。
- `packages/shared/src/utils.spec.ts`
  - 覆盖自定义模块创建、schema 安全恢复、迁移、克隆 id 重建和排序。
- `apps/editor/src/stores/resume.ts`
  - 新增 `addCustomModule()` 或等价 action。
  - 保持现有 `addModule(type)` 用于预设模块，避免破坏左侧拖拽和开关。
  - 确保自定义模块参与历史栈、持久化、选中、删除和排序。
- `apps/editor/src/components/MaterialPanel.vue`
  - 将底部“添加模块”按钮改为打开自定义模块构建器弹窗。
  - 保留现有左侧预设模块列表、拖拽 clone、开关行为和 test id。
- `apps/editor/src/components/CustomModuleBuilderDialog.vue`
  - 新增弹窗组件，负责模块名、字段配置、字段排序、字段初始内容和保存校验。
- `apps/editor/src/components/modules/CustomModule.vue`
  - 新增中间编辑区自定义模块渲染组件。
  - 支持字段内容编辑、列表项维护，以及打开结构编辑弹窗。
- `apps/editor/src/components/modules/moduleRegistry.ts`
  - 注册 `custom` 模块组件。
- `apps/editor/src/components/ResumePreview.vue`
  - 增加自定义模块预览分支。
  - 按响应式网格配置渲染字段，不影响已有预览拖拽排序。
- `apps/editor/src/components/forms/FieldControl.vue`
  - 尽量复用；如需要为动态字段增加说明或紧凑布局，局部增强。
- `apps/editor/src/components/forms/FieldGrid.vue`
  - 可能需要支持 CSS 变量或 class，用于自定义字段响应式 span。
- `apps/editor/src/i18n/index.ts`
  - 新增 `modules.custom` 和 `editor.customModule.*` 文案。
- `apps/editor/src/styles.css`
  - 新增构建器弹窗、字段配置行、响应式网格、列表区和预览自定义字段样式。
- `apps/editor/src/__tests__/resume-store.spec.ts`
  - 覆盖自定义模块 store action、更新、撤销/重做和删除。
- `apps/editor/src/components/__tests__/ResumePreview.spec.ts`
  - 覆盖自定义模块预览渲染和空内容处理。
- `tests/e2e/editor.spec.ts`
  - 覆盖添加弹窗、校验、字段配置、保存、编辑、预览同步、刷新恢复和删除。

## 架构与数据流

1. 用户点击左侧底部“添加模块”。
2. `MaterialPanel.vue` 打开 `CustomModuleBuilderDialog.vue`，创建本地 draft。
3. 用户在弹窗中设置模块名，并添加字段：
   - 单行输入。
   - 多行输入。
   - 列表区。
4. 弹窗中的字段配置以 draft 数组维护，支持字段排序和响应式宽度选择。
5. 用户点击保存后，弹窗将 draft 归一化为 `CustomResumeModule` 输入，调用 `store.addCustomModule(payload)`。
6. Store 记录历史快照，将自定义模块插入 `document.modules`，标准化 order，设置 `selectedModuleId`。
7. `ResumeCanvas.vue` 通过 `moduleRegistry` 渲染 `CustomModule.vue`。
8. `CustomModule.vue` 通过现有 `store.updateModule(id, patch)` 更新字段值、列表项和字段配置。
9. `ResumePreview.vue` 从 `store.previewOrderedModules` 获取同一份模块数据，按 `custom.content.fields` 渲染预览。
10. 中间编辑区、右侧预览区、预览拖拽和中间拖拽继续共享 `store.reorderModules()`，保证两侧排序同步。
11. Pinia persisted state 保存 `document`，刷新后通过 `safeResumeDocument()` 和迁移逻辑恢复自定义模块。

## 数据模型变化

### 模块类型

`ResumeModuleType` 增加：

```ts
'custom'
```

### 自定义模块

建议模型：

```ts
type CustomFieldSpan = 12 | 6 | 4
type CustomFieldType = 'text' | 'textarea' | 'list'

interface CustomListItem {
  id: string
  text: string
}

interface CustomFieldBase {
  id: string
  type: CustomFieldType
  label: string
  placeholder?: string
  span: CustomFieldSpan
  minRows?: number
  order: number
}

interface CustomTextField extends CustomFieldBase {
  type: 'text'
  value: string
}

interface CustomTextareaField extends CustomFieldBase {
  type: 'textarea'
  value: string
}

interface CustomListField extends CustomFieldBase {
  type: 'list'
  items: CustomListItem[]
}

interface CustomResumeModule {
  id: string
  type: 'custom'
  title: string
  order: number
  content: {
    fields: Array<CustomTextField | CustomTextareaField | CustomListField>
  }
}
```

设计约束：

- `title` 即模块名，不新增重复的 `moduleName` 字段。
- `span` 使用 12 栅格语义：`12` 为整行，`6` 为半行，`4` 为三分之一行。
- 窄屏下所有 span 自动降级为单列展示。
- `minRows` 只对多行输入和列表区生效。
- 字段排序由数组顺序和 `order` 共同表达，保存和迁移时统一归一化。

## API 或接口变化

### Shared 工具函数

新增或扩展：

- `createCustomField(type, overrides?)`
- `createCustomListItem(text?)`
- `createCustomResumeModule(input?)`
- `createResumeModule('custom')`
- `cloneResumeModule(customModule)` 需要重建模块 id、字段 id、列表项 id。
- `safeResumeDocument()` 迁移旧数据时需要补齐 custom 字段默认值。

### Store action

新增：

- `addCustomModule(input, afterId?)`
  - 校验模块名。
  - 校验字段数组。
  - 记录历史。
  - 插入模块并选中。
  - 返回新模块或 `undefined`。

可选新增：

- `replaceCustomModuleSchema(id, content)`
  - 用于重新打开构建器编辑已有自定义模块结构。
  - 保留相同字段 id 时保留已有值。
  - 删除字段时让撤销/重做负责恢复。

现有接口保持：

- `addModule(type)` 继续服务预设模块。
- `updateModule(id, patch)` 继续作为内容更新入口。
- `renameModule(id, title)` 继续作为模块标题修改入口。
- `reorderModules(modules)` 继续作为中间和预览排序唯一写入口。

### 组件事件

`CustomModuleBuilderDialog.vue`：

- Props:
  - `show: boolean`
  - `initialModule?: CustomResumeModule`
- Emits:
  - `update:show`
  - `save`
  - `cancel`

`CustomModule.vue`：

- Props:
  - `module: CustomResumeModule`
- Emits:
  - `update`

## 实施步骤

1. 更新 shared schema 和类型。
   - 给 `resumeModuleTypeSchema` 加入 `custom`。
   - 新增 custom field discriminated union。
   - 将 `customResumeModuleSchema` 加入 `resumeModuleSchema`。

2. 更新 shared 创建、克隆和迁移工具。
   - 支持创建默认自定义模块。
   - 支持创建字段和列表项。
   - 迁移时补齐缺失 `span`、`order`、`value`、`items`。
   - 克隆时重建所有嵌套 id。

3. 更新 store。
   - 新增 `addCustomModule()`。
   - 如需要支持结构二次编辑，新增 `replaceCustomModuleSchema()`。
   - 确保 custom 模块加入、更新、删除、排序都进入 history。
   - 确保 `activeModuleTypes` 不把 custom 当作唯一开关模块导致左侧预设状态异常。

4. 新增构建器弹窗。
   - 使用 Naive UI `NModal`、`NCard`、`NForm`、`NInput`、`NSelect`、`NButton`。
   - 桌面最大宽度控制在合理范围，例如 720 到 860px。
   - 内部字段列表支持添加、删除、排序。
   - 字段类型支持单行、多行、列表。
   - 宽度选项支持整行、半行、三分之一行。
   - 保存前校验模块名和字段配置。

5. 接入 MaterialPanel。
   - 底部“添加模块”按钮打开构建器弹窗。
   - 保存成功后调用 `store.addCustomModule()`。
   - 保持 `material-*` test id、预设模块拖拽和开关行为。

6. 新增中间编辑组件。
   - `CustomModule.vue` 按 `fields` 渲染编辑表单。
   - 单行字段使用 `NInput`。
   - 多行字段使用 `NInput type="textarea"`。
   - 列表字段支持添加、删除、编辑、排序列表项。
   - 提供“编辑结构”入口，复用构建器弹窗编辑已有 custom 模块。

7. 注册模块组件。
   - `moduleRegistry.ts` 添加 `custom: CustomModule`。
   - `UnsupportedModule` 保持兜底。

8. 更新右侧预览。
   - 增加 `isCustomModule()` 类型守卫。
   - 增加自定义模块渲染分支。
   - 使用 CSS grid 渲染字段，按 span 控制宽度。
   - 空字段不渲染多余分隔符，列表为空时隐藏列表项。

9. 更新 i18n。
   - 新增模块名、字段类型、宽度选项、添加字段、删除字段、添加列表项、删除列表项、编辑结构、校验提示。
   - 中英双语都补齐，不出现 raw key。

10. 更新样式。
    - 弹窗非全屏宽度。
    - 字段配置区可滚动，操作区保持易访问。
    - 自定义字段网格在桌面端按 span 分列，移动端单列。
    - 右侧预览自定义字段不破坏 A4 纸张样式和导出捕获。

11. 增加测试。
    - Shared 单测覆盖 schema、创建、克隆、迁移。
    - Store 单测覆盖添加、更新、撤销/重做、删除。
    - 预览组件测试覆盖 text、textarea、list 渲染和空值。
    - E2E 覆盖完整创建、自定义字段编辑、预览同步、刷新恢复和删除。

## 风险

- 现有 `resumeModuleTypeSchema` 未包含 `custom`，但 `resumeSectionTypeSchema` 包含 `custom`；实现时必须避免只改一处导致类型和 schema 不一致。
- `safeResumeDocument()` 解析失败会回退到 demo 简历；custom schema 或迁移不完整可能导致用户已有本地草稿被整体回退。
- 弹窗字段拖拽和页面模块拖拽都基于 SortableJS，事件范围需要隔离，避免拖字段时误触发模块拖拽。
- 自定义模块字段结构会增大历史快照体积，连续输入可能让 history 增长较快；首版可沿用现有历史机制，但需要关注性能。
- 列表区排序和字段排序都需要稳定 id，否则刷新、撤销/重做和 E2E 会不稳定。
- 预览网格如果直接复用编辑区宽度，可能导致 A4 预览在窄宽或 PDF 导出时出现溢出，需要单独的 preview CSS。
- `activeModuleTypes` 当前按 type 判断，多个 `custom` 模块共存时不能用同一种“开关唯一模块”逻辑控制。
- 后续如继续扩展字段类型，仍需保持“不引入富文本”的当前约束，避免扩大首版复杂度。

## 验证命令

- `corepack yarn lint`
- `corepack yarn typecheck`
- `corepack yarn test:unit`
- `corepack yarn test:e2e tests/e2e/editor.spec.ts`
- `corepack yarn build`

## 文档更新要求

- `specs/custom-module-builder/spec.md` 已移除富文本相关范围、验收标准和边界情况，并标记响应式网格为已确认决策。
- `tasks.md` 使用中文编写，并已排除富文本相关任务。
- 如实现新增可见交互，需要更新项目 README 或编辑器运行说明中的功能摘要。
- 如实现影响数据结构，需要在对应 spec 文档中记录 custom module schema 和本地持久化迁移策略。

## 需要确认

- 无阻塞确认项；本轮用户已确认“不做富文本”和“接受响应式网格配置”。
