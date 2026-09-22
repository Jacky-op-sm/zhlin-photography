# Zhlin Photography

Zhlin 的个人摄影、旅行与兴趣网站。项目使用 Next.js App Router、TypeScript、Tailwind CSS，并部署于 [www.zhlin.space](https://www.zhlin.space/)。

## 环境要求

- Node.js 24.x（见 `.nvmrc` 和 `package.json#engines`）
- npm

```bash
npm ci
npm run dev
```

开发站点默认位于 [http://localhost:3000](http://localhost:3000)。

## 常用命令

| 命令 | 用途 |
|---|---|
| `npm run dev` | 启动开发服务器 |
| `npm run build` | 创建生产构建 |
| `npm run start` | 启动生产服务器 |
| `npm run lint` | 运行 ESLint，warning 也视为失败 |
| `npm run typecheck` | 运行 TypeScript 严格检查 |
| `npm run check:content` | 校验内容、导航和路由引用 |
| `npm run check:assets` | 校验资源预算、图片 manifest 与元数据 |
| `npm run verify` | 运行静态门禁和生产构建 |
| `npm run test:unit` | 运行联系接口相关单元测试 |
| `npm run test:e2e` | 运行开发态 Playwright 测试 |
| `npm run test:e2e:production` | 运行生产态交互、无障碍和运行时预算测试 |
| `npm run check:build-routes` | 验证公开路由的构建方式并记录构建时间 |

提交前至少运行：

```bash
npm run verify
npm run test:unit
npm run test:e2e
npm run test:e2e:production
```

## 内容结构

```text
content/
├── photography/
│   ├── photos/              # 街拍、宠物和项目照片数据
│   ├── series.json          # 摄影系列元数据
│   └── image-manifest.json  # 自动生成的图片清单
├── hobby/                  # 爱好页内容
├── site/
│   ├── navigation.json      # Header、Footer 和 sitemap 的共享来源
│   ├── homepage.json        # 首页内容
│   ├── profile.json         # 个人信息
│   └── contact.json         # 联系页文案
└── travel/                  # 旅行内容
```

页面路由、文案和图片引用由内容检查脚本共同校验。不要在 Header、Footer 或 sitemap 中重复维护导航数组。
历史迁移输入与已停用长文保存在 `workspace/archive/`，不参与运行或校验。

## 添加摄影照片

1. 将原图放入 `public/assets/photos/<series>/`。
2. 在 `content/photography/photos/<series>.json` 中增加照片数据，并将 `source` 指向原图。
3. 先预览生成报告，再写入衍生图片：

```bash
npm run assets:report
npm run assets:write
npm run check:assets
```

Sharp 流水线会跨平台生成：

- 长边 640 px 的 WebP 缩略图；
- 长边不超过 2400 px 的 WebP 大图；
- 包含尺寸、哈希和引用关系的 manifest。

生成文件位于 `public/assets/generated/photos/`。流水线不会覆盖原图，并会移除生成图片中的 EXIF/GPS 元数据。不要直接编辑生成文件。

## 联系表单配置

复制 `.env.example` 到本地环境文件，并按需设置：

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

投递顺序为 webhook 优先、Resend 备用；主渠道成功后不会重复投递。生产环境必须配置 Upstash REST 凭据和足够强的 `CONTACT_RATE_LIMIT_SECRET`，否则公开表单会安全地拒绝提交。不要把这些服务端变量暴露为 `NEXT_PUBLIC_*`。

## 部署与版本核对

CI 使用 Node.js 24，依次执行 lint、类型检查、内容/资源校验、单元测试、生产构建和生产态 E2E。

构建会从 `VERCEL_GIT_COMMIT_SHA`、`GITHUB_SHA` 或 `NEXT_PUBLIC_BUILD_SHA` 读取版本标识。部署后可以通过 `/api/version` 或以下命令核对实际 revision：

```bash
DEPLOYMENT_URL=https://www.zhlin.space EXPECTED_GIT_SHA=<commit> npm run check:deployment
```

正式环境的 `NEXT_PUBLIC_SITE_URL` 必须是合法的 HTTPS URL。

## 主要技术栈

- Next.js 16.2.11
- React 19
- TypeScript 5.9
- Tailwind CSS 3.4
- Sharp
- Playwright + axe-core
- Zod
- Upstash Redis / Resend（联系表单）

## 许可证

MIT License
