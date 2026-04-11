# Zhlin Photography | 个人摄影作品集

一个基于 Next.js 14 + TypeScript + Tailwind CSS 构建的现代摄影作品集网站，采用全屏沉浸式照片展示风格。

## 功能特点

- **Next.js 14 App Router** - 使用最新的 App Router 架构
- **TypeScript** - 类型安全的开发体验
- **Tailwind CSS** - 响应式设计，自定义颜色主题，支持深色/浅色模式
- **Framer Motion** - 流畅的页面动画效果
- **图片优化** - 支持外部图片域名（Vercel 部署优化）
- **全屏照片查看器** - 沉浸式照片浏览体验，支持键盘导航和手势操作
- **响应式网格布局** - 移动端 2 列，平板 3 列，桌面 4-5 列

## 快速开始

### 方法一：使用启动脚本（推荐）

双击运行 `start.bat` 即可自动安装依赖并启动开发服务器。

### 方法二：命令行启动

```bash
# 进入项目目录
cd zhlin-photography

# 安装依赖
npm install

# 启动开发服务器
npm run dev
```

打开 [http://localhost:3000](http://localhost:3000) 查看网站。

## 照片分类

网站包含以下三个摄影分类：

| 分类 | 路径 | 说明 |
|------|------|------|
| Street（街拍） | `/photography/street` | 街头摄影作品 |
| Pets（宠物） | `/photography/pets` | 宠物摄影作品 |
| Project（项目） | `/photography/project` | 专题摄影项目 |

## 添加照片

### 1. 准备照片文件

将照片文件放入 `public/assets/photos/` 目录下对应的分类文件夹：

```
public/assets/photos/
├── street/      # 街头摄影
├── pets/        # 宠物摄影
└── project/     # 项目作品
```

建议同时准备缩略图（文件名以 `-thumb` 结尾），以提升页面加载速度。

### 2. 更新照片数据

编辑 `data/photos.json` 文件，添加照片元数据：

```json
{
  "street": [
    {
      "id": "my-photo-1",
      "title": "照片标题",
      "description": "照片描述",
      "filename": "/assets/photos/street/my-photo-1.jpg",
      "thumbnail": "/assets/photos/street/my-photo-1-thumb.jpg",
      "width": 1920,
      "height": 1280,
      "takenAt": "2024-03",
      "location": "杭州",
      "tags": ["tag1", "tag2"]
    }
  ]
}
```

### 3. 更新页面中的 Mock 数据

编辑分类页面（如 `src/app/photography/street/page.tsx`），将 mock 数据替换为实际的照片数据。

## 项目结构

```
zhlin-photography/
├── public/
│   └── assets/
│       ├── photos/
│       │   ├── street/      # 街头摄影
│       │   ├── pets/        # 宠物摄影
│       │   └── project/     # 项目作品
│       └── profile/          # 个人资料图片
├── data/
│   ├── photos.json           # 照片数据
│   └── site-content.json     # 网站内容数据
├── src/
│   ├── app/
│   │   ├── photography/      # 摄影模块
│   │   │   ├── page.tsx      # 摄影主页
│   │   │   ├── street/       # 街拍分类
│   │   │   ├── pets/         # 宠物分类
│   │   │   └── project/      # 项目分类
│   │   ├── globals.css       # 全局样式
│   │   ├── layout.tsx        # 根布局
│   │   └── page.tsx          # 首页
│   ├── components/
│   │   ├── layout/           # 布局组件
│   │   ├── photography/      # 摄影组件
│   │   └── ui/               # UI 组件
│   └── lib/
│       ├── types/            # 类型定义
│       └── data/             # 数据层
├── next.config.js            # Next.js 配置
├── tailwind.config.ts        # Tailwind 配置
└── package.json
```

## 自定义配置

### 添加外部图片域名

编辑 `next.config.js` 中的 `remotePatterns`：

```javascript
images: {
  remotePatterns: [
    {
      protocol: 'https',
      hostname: 'your-domain.com',
    },
  ],
},
```

### 自定义颜色主题

编辑 `tailwind.config.ts` 中的 `theme.extend.colors`：

```typescript
colors: {
  primary: {
    50: "#fdf4ff",
    // ... 自定义颜色
  },
},
```

### 深色模式

网站支持深色/浅色模式切换，主题配置位于：

- `tailwind.config.ts` - `darkMode: 'class'`
- `src/components/ui/ThemeToggle.tsx` - 切换逻辑
- `src/app/globals.css` - CSS 变量定义

## 可用脚本

| 命令 | 描述 |
|------|------|
| `npm run dev` | 启动开发服务器 |
| `npm run build` | 构建生产版本 |
| `npm run start` | 启动生产服务器 |
| `npm run lint` | 运行 ESLint 检查 |

## 部署到 Vercel

项目已配置好 Vercel 部署所需的图片域名：

- `images.unsplash.com`
- `**.vercel.app`
- `picsum.photos`

如需添加其他域名，请修改 `next.config.js`。

## 技术栈

- **框架**: Next.js 14.2.3
- **语言**: TypeScript 5.4
- **样式**: Tailwind CSS 3.4
- **动画**: Framer Motion 11
- **字体**: Inter (Google Fonts)

## 许可证

MIT License
