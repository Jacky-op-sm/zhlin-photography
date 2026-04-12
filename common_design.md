# Common Design Library

这个文件记录当前项目里已经验证过、可复用的视觉与交互设计。  
后续你可以直接用“设计名称 + 参数”来调用。

## 1) `HoverScaleShell`（悬浮轻微放大）
- 用途: 卡片、缩略图、矩阵块 hover 时的轻微放大。
- 现有实现:
  - `src/app/globals.css` 中的 `--image-hover-expand-px`（当前 `0.9px`）
  - `travel-card-hover-shell` / `home-like-hover-shell` / `travel-nav-thumbnail-shell`
- 核心行为:
  - `transform-origin: center center`
  - `transition: transform 280ms ease`
  - `hover -> scale(calc((100% + var(--image-hover-expand-px)) / 100%))`
- 推荐复用:
  - 外层包一层 `travel-card-hover-shell`，把放大作用在容器，而不是图片本身。

## 2) `EdgePeekSlider`（边缘部分截断滑块）
- 用途: 水平滑块，支持左右“露出一部分”卡片（peek）+ 点击 next/prev 滑动。
- 当前组件:
  - `src/app/travel/[slug]/SpotSlider.tsx`
- 关键参数（可直接调）:
  - `VISIBLE_CARDS`: 同屏主卡数量（当前 `3`）
  - `CARD_WIDTH_PX`: 卡片固定宽度（当前 `370.5`，固定值）
  - `CARD_GAP_PX`: 卡片间距（当前 `19.2`）
  - `MARGIN_PX`: 与标题左边对齐的固定左边距（当前 `260`）
  - `SIDE_PEEK_PX`: 非初始状态边缘露出宽度（当前 `56`）
  - `SLIDE_FINE_TUNE_PX`: 滑动微调（当前 `0`）
  - `CARD_HEIGHT_REM`: 卡片高度（当前 `28`）
- 滑动步长:
  - `stepPx = CARD_WIDTH_PX + CARD_GAP_PX + SLIDE_FINE_TUNE_PX`
- 视窗策略:
  - 使用全屏裁切窗口: `w-screen`
  - `overflow-x-hidden overflow-y-visible`（左右截断、上下不截断）

## 3) `ViewerNavIcons`（next / previous 图标与按钮）
- 用途: 统一 next/previous/close 按钮语言，复用到放大页和滑块。
- 现有 CSS:
  - `src/app/globals.css`
  - `.photo-viewer-nav`
  - `.photo-viewer-chevron`, `.photo-viewer-chevron--left`, `.photo-viewer-chevron--right`
  - `.photo-viewer-close`, `.photo-viewer-close-icon`
- 视觉参数:
  - 按钮底色: `rgba(236,236,240,1)`
  - 图标色: `rgba(104,104,108,1)`
  - 圆形按钮 + `scale(1.02)` hover
  - 箭头由两根短线伪元素组成（更统一）
- 推荐复用:
  - 任何轮播、弹层、图片查看器优先复用这套类，不再单独画箭头。

## 4) `SiteGrayCanvas`（统一浅灰背景画布）
- 用途: 模块化内容区域统一底色，保证与首页/旅行页视觉一致。
- 标准值:
  - `rgba(245,245,247,1)`（等价于 `--site-bg`）
- 相关变量:
  - `src/app/globals.css` 中 `--site-bg`, `--site-bg-soft`, `--site-surface`

## 5) `TravelFilledCardTemplate`（旅行滑块已填充卡片模板）
- 用途: 旅行滑块中的单卡内容模板（小标题 / 大标题 / 正文 / 底图）。
- 当前实现位置:
  - `src/app/travel/[slug]/SpotSlider.tsx` 的 `CardContent()`（由 `CARD_ITEMS` 数据驱动）
- 结构顺序:
  1. 小标题（eyebrow）
  2. 大标题（主叙述）
  3. 正文段落（1段）
  4. 底部配图（圆角图）
- 当前字号与节奏:
  - 小标题: `text-[0.95rem]`
  - 大标题: `text-[1.5rem]`，默认 `leading-[1.1]`；若渲染为两行及以上自动切到 `leading-[1.43]`
  - 正文: `text-[0.95rem]`, `leading-[1.5]`
  - 大标题到正文间距: `mt-[1.36rem]`
  - 图片区: `rounded-[1.35rem]`，容器使用 `mt-auto` 保持下端对齐
  - 图片高度策略:
    - 默认: `h-[12.8rem]`（有富余空间时优先让图片更高）
    - 长正文或多行标题: `h-[11.2rem]`（避免文字拥挤）
- 外层容器规则（关键）:
  - 卡片容器固定高度: `height: ${CARD_HEIGHT_REM}rem`
  - 外层卡片与内容容器都使用 `overflow-hidden`，保证内容多少不会撑高卡片
- 复用建议:
  - 新卡片只追加 `CARD_ITEMS` 数据，不再单独写新组件
  - 保持 `CardContent()` 内部 class 不变，避免卡片之间节奏漂移
  - 若要微调间距，优先调整 `CardContent()` 中正文 `mt-[1.36rem]`，不要改卡片外层高度

## 调用方式（约定）
- 你可以这样下指令:
  - “这个模块用 `HoverScaleShell`，放大量改为 1.1px”
  - “这里改成 `EdgePeekSlider`，`CARD_WIDTH_PX=380`，`SIDE_PEEK_PX=48`”
  - “按钮改成 `ViewerNavIcons` 同款”

## 后续建议新增
- `CardContentTemplate`（卡片内文案层级模板: eyebrow/title/body/cta）
- `SectionHeaderTemplate`（标题、右侧操作链接、说明文案的统一结构）
- `MotionPreset`（进入动画、hover动画、切页动画统一参数）
