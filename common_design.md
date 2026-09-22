# Common Design Library

这份文档只记录当前正在使用的视觉与交互契约。

## Hover scale

`globals.css` 中的 `--image-hover-expand-px` 统一控制首页、旅行卡片和摄影图片的轻微放大。复用现有 `travel-card-hover-shell`、`home-like-hover-shell` 或 `photo-gallery-hover`，不要另造动画参数。

## Modal

`src/components/ui/Modal.tsx` 是移动导航、照片查看器和旅行详情的通用无障碍外层，负责焦点圈、Escape、背景 inert 与焦点恢复。

## Travel card slider

`src/app/travel/[slug]/TravelCardSlider.tsx` 统一处理 Spot/Food 滑块的边缘露出、拖动、按钮翻页和详情弹层。`SpotSlider.tsx` 与 `FoodSlider.tsx` 只提供可视变体参数。

## Viewer controls

Photo viewer 和旅行弹层继续复用 `photo-viewer-nav`、`photo-viewer-chevron` 与 `photo-viewer-close` 这套按钮语言。

## Canvas and tokens

通用色彩在 `src/styles/tokens.css`；主画布为 `rgba(245,245,247,1)`。页面专属参数在 `globals.css` 对应区块管理，避免创建第二套全局主题。
