# 自定义模块构建器验证报告

## 结论

验证状态：通过。

本轮验证确认 `custom-module-builder` 已按规格完成：左侧添加入口打开自定义模块构建器弹窗；用户可以配置模块名、单行输入、多行输入、列表字段、字段宽度和顺序；保存后中间编辑区与右侧预览区共享同一份数据流，并支持编辑、排序、删除、刷新恢复、撤销/重做和 PDF 导出。

## 验收标准结果

| 验收项                                                   | 结果 | 证据                                                                                    |
| -------------------------------------------------------- | ---- | --------------------------------------------------------------------------------------- |
| 点击“添加模块”后出现自定义模块编辑弹窗                   | 通过 | E2E 覆盖 `module-add` 打开 `custom-module-title-input`。                                |
| 弹窗不是全屏宽度，桌面有最大宽度，移动端无横向溢出       | 通过 | 桌面和 `390x844` 烟测通过，移动端校验弹窗宽度不超过视口。                               |
| 模块名为空不能保存，并显示本地化校验提示                 | 通过 | E2E 覆盖空标题保存失败和错误提示。                                                      |
| 可以输入模块名并保存为新的自定义模块                     | 通过 | E2E 和浏览器烟测均创建自定义模块成功。                                                  |
| 可以新增单行输入框并配置标题、占位提示、宽度和高度       | 通过 | 构建器支持 text 字段、标题/占位/宽度配置，E2E 覆盖保存和预览 span。                     |
| 可以新增多行输入框并配置标题、占位提示、宽度和高度       | 通过 | 构建器支持 textarea 字段和最小行数配置，E2E 覆盖创建和内容同步。                        |
| 可以新增列表区并添加、删除、编辑、排序列表项             | 通过 | `CustomModule.vue` 和构建器均支持列表项维护，E2E 覆盖列表项添加、编辑、删除。           |
| 可以调整字段顺序和基础宽度分布，保存后中间和预览一致     | 通过 | 字段使用 `order` 归一化和 CSS grid span；组件测试和 E2E 覆盖预览布局。                  |
| 自定义模块保存后显示在中间编辑区并默认展开               | 通过 | E2E 覆盖保存后 `resume-module[data-module-type="custom"]` 可见且 body 展开。            |
| 自定义模块保存后显示在右侧预览区，并跟随模块排序变化     | 通过 | E2E 覆盖自定义模块存在时中间/预览排序后两侧顺序同步。                                   |
| 修改自定义模块内容时，右侧预览区实时同步                 | 通过 | E2E 覆盖 text、textarea、list 内容写入后预览同步。                                      |
| 删除自定义模块后左侧状态、中间和预览同步更新             | 通过 | E2E 覆盖自定义模块一次点击删除后中间和预览均消失。                                      |
| 刷新后自定义模块结构、内容、标题、字段顺序和模块排序恢复 | 通过 | E2E 和浏览器烟测覆盖 localStorage 刷新恢复。                                            |
| 自定义模块参与撤销/重做，不破坏现有历史栈                | 通过 | store 单测覆盖自定义模块撤销/重做；E2E 覆盖自定义字段内容撤销/重做。                    |
| 中文和英文界面下新增 UI 不出现 raw i18n key              | 通过 | i18n 已补齐 `modules.custom` 和 `editor.customModule.*`；E2E 覆盖新增 UI 主要入口。     |
| 浅色、深色和当前简历主题下保持可读                       | 通过 | 样式包含浅色/深色变量，烟测和 E2E 覆盖预览主题与响应式布局。                            |
| 桌面和移动端无明显横向溢出                               | 通过 | 浏览器烟测检查桌面 `1872x1009` 和移动 `390x844` 的 body/document 宽度。                 |
| `lint`、`typecheck`、`test:unit` 和相关 E2E 通过         | 通过 | 项目级命令全部通过；两个 workspace 直跑单测命令仍有工具链入口问题，见“无法完成的检查”。 |

## 命令结果

| 命令                                                      | 结果           | 输出摘要                                                                                                   |
| --------------------------------------------------------- | -------------- | ---------------------------------------------------------------------------------------------------------- |
| `corepack yarn workspace @airesumecraft/shared test:unit` | 未通过，非阻塞 | 直接 workspace 脚本解析不到 `vitest`：`command not found: vitest`。项目级 `test:unit` 已覆盖 shared 测试。 |
| `corepack yarn workspace @airesumecraft/editor test:unit` | 未通过，非阻塞 | 直接 workspace 脚本解析不到 `vitest`：`command not found: vitest`。项目级 `test:unit` 已覆盖 editor 测试。 |
| `corepack yarn lint`                                      | 通过           | 仅有既有 ESLint 工具链警告：CommonJS 加载 ESM 插件为 experimental。                                        |
| `corepack yarn typecheck`                                 | 通过           | Nuxt Tailwind 初始化信息后正常结束。                                                                       |
| `corepack yarn test:unit`                                 | 通过           | editor 3 个测试文件、32 个测试通过；shared 1 个测试文件、13 个测试通过。                                   |
| `corepack yarn test:e2e tests/e2e/editor.spec.ts`         | 通过           | Chromium 10 个测试通过。                                                                                   |
| `corepack yarn test:e2e`                                  | 通过           | Chromium 10 个测试通过。                                                                                   |
| `corepack yarn build`                                     | 通过           | editor Vite build、portfolio Nuxt/Nitro build 均完成。                                                     |
| `git diff --check`                                        | 通过           | 仅提示 `yarn.lock` 下次触碰时会从 CRLF 规范化为 LF。                                                       |

## 手动与浏览器烟测

- 启动命令：`corepack yarn dev:editor --host 127.0.0.1 --port 5173`。
- 实际端口：`http://127.0.0.1:5175/`，因为 5173 和 5174 已被占用。
- 桌面视口 `1872x1009`：
  - 三列顶部对齐通过。
  - 自定义模块弹窗创建通过。
  - 自定义 text、textarea、list 内容写入后右侧预览同步通过。
  - 刷新后自定义模块标题和内容恢复通过。
  - PDF 下载成功，文件名为 `Lin Yinuo-简历.pdf`，下载文件非空。
  - 无 actionable console errors。
- 移动视口 `390x844`：
  - 初始页面无横向溢出。
  - 弹窗宽度不超过视口。
  - 保存自定义模块后无横向溢出。
  - 无 actionable console errors。
- 关闭 dev server 时 Vite client 输出 `ResizeObserver loop completed with undelivered notifications`，与现有 ResizeObserver 噪声一致，未在浏览器烟测中作为 actionable error 记录。

## 变更文件

核心实现：

- `packages/shared/src/resume.ts`
- `packages/shared/src/utils.ts`
- `apps/editor/src/stores/resume.ts`
- `apps/editor/src/components/CustomModuleBuilderDialog.vue`
- `apps/editor/src/components/modules/CustomModule.vue`
- `apps/editor/src/components/modules/moduleRegistry.ts`
- `apps/editor/src/components/MaterialPanel.vue`
- `apps/editor/src/components/ResumeCanvas.vue`
- `apps/editor/src/components/ResumePreview.vue`
- `apps/editor/src/i18n/index.ts`
- `apps/editor/src/styles.css`

测试：

- `packages/shared/src/utils.spec.ts`
- `apps/editor/src/__tests__/resume-store.spec.ts`
- `apps/editor/src/components/__tests__/ResumePreview.spec.ts`
- `tests/e2e/editor.spec.ts`

文档与工程文件：

- `.gitignore`
- `README.md`
- `CODE_MAP.md`
- `PROJECT_PROGRESS.md`
- `specs/custom-module-builder/spec.md`
- `specs/custom-module-builder/plan.md`
- `specs/custom-module-builder/tasks.md`
- `specs/custom-module-builder/verify.md`
- `yarn.lock`

## 已知风险

- 两个 workspace 直跑单测命令当前解析不到 `vitest`，建议后续统一 workspace 测试脚本入口，或在对应 workspace 声明所需测试依赖。
- editor build 仍有大 chunk 警告，主要来自当前前端依赖体积；后续可以按 ECharts、PDF、编辑器重组件做动态拆包。
- Nuxt/Nitro build 仍有 external dependency 和 Node deprecation warning，属于当前依赖链警告，不阻塞本功能。
- `yarn.lock` 存在 CRLF 到 LF 的 Git 规范化提示，非功能阻塞。
- 自定义模块字段结构进入历史快照后，连续输入会增加快照体积；当前沿用现有 history 上限，暂未发现验证问题。

## 后续任务

- 保留 `T142` 和 `T143` 未勾选，作为 workspace 测试脚本入口问题跟进。
- 若后续继续扩展字段类型，仍保持“不引入富文本”的当前约束，避免首版复杂度扩大。
- 已完成 `$spec-update-docs custom-module-builder` 文档同步；下一步审查并提交本轮变更。
