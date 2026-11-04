# Zhlin Photography

Zhlin 的个人摄影、写作与旅行网站。使用 Next.js App Router、TypeScript 和 Tailwind CSS，部署于 [www.zhlin.space](https://www.zhlin.space/)。

## 开始开发

需要 Node.js 24.x（见 `.nvmrc`）和 npm。

```bash
npm ci
npm run dev
```

开发服务器默认位于 [http://localhost:3000](http://localhost:3000)。Windows 也可以双击 `scripts/dev/start.bat`；依赖未安装时会先执行 `npm ci`。

## 项目结构

```text
src/
├── app/                       # 页面路由及页面专属组件
├── components/                # 摄影展、站点导航与通用弹层
├── lib/                       # 内容读取、校验、共享逻辑与服务端接口
└── styles/                    # 共享视觉变量
content/
├── writing/                   # 写作 Markdown 正文与元数据
├── photography/               # 摄影展顺序、系列及图片清单
├── travel/                    # 目的地、卡片与图片说明
├── hobby/                     # 保留的爱好资料；公开状态由 visibility.mjs 控制
└── site/                      # 首页、导航、个人资料与联系页文案
assets-source/photography/     # 版本管理中的生成输入，不作为公共资源提供
public/assets/                # 页面实际使用的图片
config/                       # ESLint、TypeScript、Tailwind、Playwright 配置
scripts/
├── checks/                    # 内容、资源、构建路由与部署校验
├── writing/                   # 写作添加、准备、发布与 Markdown 工具
├── images/                    # 图片生成、压缩与完整性校验
├── photography/               # 摄影选片同步
├── hobby/                     # 爱好月度资料同步
├── maintenance/               # 安全清理工具
├── dev/                       # 本地启动工具
└── migrations/                # 历史导入工具，非日常更新入口
tests/
├── unit/                      # 单元测试
└── e2e/                       # 浏览器测试及其截图基线
docs/                         # 设计约定、内容维护和资源工作流
workspace/                    # 选片、导入来源与本地备份
.cache/                       # 隐藏的测试报告、截图与 TypeScript 缓存
```

日常修改主要在 `content/`（文字与照片记录）和 `src/`（网页代码）。测试报告位于 `.cache/playwright/report/`，失败诊断位于 `.cache/playwright/results/`，TypeScript 缓存位于 `.cache/typescript/`，不会再堆积在根目录。

`workspace/` 用于本地选片、导入记录和历史资料，不是运行时内容来源。`.next/`、`.cache/` 和 `.generated/writing.json` 是生成结果。原始照片、导入来源记录及写作备份与可重建缓存分开保存。

根目录仅保留固定入口：`AGENTS.md`、`package.json`、`package-lock.json`、`next.config.js`、`next-env.d.ts` 和 `vercel.json`。工具配置集中在 `config/`，PostCSS 设置合并在 `package.json`；本指南位于 `docs/README.md`，Claude 指令位于 `.claude/CLAUDE.md`。`src/tsconfig.json` 为编辑器提供源码配置入口，VS Code 的 ESLint 路径由 `.vscode/settings.json` 指定。`next-env.d.ts` 由 Next.js 生成，`node_modules/` 是安装的依赖。

## 日常命令

| 命令 | 用途 |
|---|---|
| `npm run dev` | 启动开发服务器 |
| `npm run build` / `npm run start` | 构建 / 预览生产版本 |
| `npm run verify` | lint、类型、内容、资源、单元测试和生产构建 |
| `npm run test:e2e` | 开发态浏览器回归测试 |
| `npm run test:e2e:production` | 生产态交互、布局、无障碍和性能测试 |
| `npm run check:build-routes` | 检查公开路由的构建方式 |
| `npm run clean` | 清理可重建缓存和测试输出，保留源文件及导入记录 |

提交前运行 `npm run verify` 和与修改相关的浏览器测试。更改图片后还应检查实际页面，尤其是照片细节、颜色、横竖图比例和 Writing 图组。

## 更新内容

- **写作**：在 `content/writing/` 维护 Markdown。添加与发布入口为 `npm run writing:add` 和 `npm run writing:publish`；参数与元数据规则见 [写作说明](../content/writing/README.md)。保留现有 `slug`，以保持文章网址稳定。
- **摄影**：版本管理中的生成输入放在 `assets-source/photography/<series>/`。在 `content/photography/photos/` 更新记录后执行 `npm run assets:write && npm run check:assets`。Bangkok 展览的顺序与图片记录位于 `content/photography/exhibitions/bangkok.json`。
- **旅行、首页、爱好**：修改对应的 `content/` 文件，随后执行 `npm run check:content`。操作说明见 [内容维护](content)。

完整图片策略见 [资源工作流](assets-workflow.md)。日常内容更新不需要运行 `scripts/migrations/` 中的历史导入工具。

## 设计与维护

- [设计约定](design.md)：保留 Photography 和 Writing 的简洁展示，以及现有旅行与导航交互。
- [项目维护](maintenance.md)：源文件、缓存、部署边界与历史工具。
- [资源工作流](assets-workflow.md)：图片尺寸、格式、生成与校验。

## 联系表单

复制 `.env.example` 到本地环境文件，并按需配置：

```text
NEXT_PUBLIC_SITE_URL
CONTACT_WEBHOOK_URL
RESEND_API_KEY
CONTACT_FROM_EMAIL
CONTACT_TO_EMAIL
UPSTASH_REDIS_REST_URL
UPSTASH_REDIS_REST_TOKEN
CONTACT_RATE_LIMIT_SECRET
CONTACT_ALLOWED_ORIGINS
```

投递顺序为 webhook 优先、Resend 备用；主渠道成功后不会重复投递。生产环境需要 Upstash REST 凭据和足够强的 `CONTACT_RATE_LIMIT_SECRET`。这些服务端变量不能添加 `NEXT_PUBLIC_` 前缀。

## 部署与版本核对

CI 使用 Node.js 24，执行静态校验、单元测试、生产构建与生产态 E2E。Vercel 的 `build:deploy` 同样执行校验，因此部署输入保留图片生成源和检查脚本；这些文件不在 `public/` 内，不提供公共下载。

`.vercelignore` 排除本地工作区、缓存、预览图片及其他无需上传的文件。它不会排除构建校验依赖的 `content/`、`assets-source/`、`scripts/` 或测试源代码。

部署后通过 `/api/version` 或以下命令核对版本：

```bash
DEPLOYMENT_URL=https://www.zhlin.space EXPECTED_GIT_SHA=<commit> npm run check:deployment
```

正式环境的 `NEXT_PUBLIC_SITE_URL` 必须是有效的 HTTPS URL。依赖版本以 `package.json` 和 `package-lock.json` 为准；当前主版本为 Next.js 16、React 19、TypeScript 5 和 Tailwind CSS 3。

## 许可证

MIT License
