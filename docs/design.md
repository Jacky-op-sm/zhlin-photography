# Design contracts

记录现有页面的视觉与交互约定。整理文件和压缩资源时，保留布局、文字、颜色、照片比例及操作方式。

## Photography

`src/components/photography/PhotographyExhibition.tsx` 与同目录 CSS Module 管理摄影展。页面以白色画布、单张居中照片和 Index / Thumbs 控件为主；照片使用 `object-fit: contain`，不得裁切。

作品切换保留一秒幕布动画。前后两张照片在幕布遮盖时交接，不能同时露出；快速切换和浏览器返回也应保持正确。图片请求尺寸由 `exhibition-images.ts` 与实际显示区域匹配，不能通过改变布局来减少下载量。

## Writing

`src/app/writing/` 保留文章目录、正文排版和图组交互。`writing.css` 与 `writing-image-stack.css` 管理专属样式；Markdown 正文、文章顺序、网址及图注属于内容，不在结构整理中改写。

## Shared canvas and tokens

通用色彩位于 `src/styles/tokens.css`；站点主画布为 `rgba(245,245,247,1)`。Photography 和 Writing 的专属样式由各自文件管理，避免引入第二套全局主题或让全局样式覆盖专属页面。

## Hover scale

`globals.css` 中的 `--image-hover-expand-px` 控制首页和旅行卡片的轻微放大。复用现有 `travel-card-hover-shell`、`home-like-hover-shell`，保持原有动画参数。

## Modal

`src/components/ui/Modal.tsx` 是导航和内容弹层的通用无障碍外层，负责焦点约束、Escape、背景 inert 与焦点恢复。

## Travel card slider

`src/app/travel/[slug]/TravelCardSlider.tsx` 统一处理 Spot / Food 滑块的边缘露出、拖动、按钮翻页和详情弹层。`SpotSlider.tsx` 与 `FoodSlider.tsx` 提供可视变体参数。

旅行弹层继续使用 `photo-viewer-nav`、`photo-viewer-chevron` 与 `photo-viewer-close` 按钮样式。删除旧摄影组件时，不得连带移除仍被旅行页使用的公共样式。
