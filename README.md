# Resume Studio

一个部署在 GitHub Pages 上的 Markdown 简历编辑器。简历文本保存在私有仓库
`beep-bebop/resume-data`，网页凭令牌通过 GitHub Contents API 读取，再在浏览器中
生成、预览并下载 PDF；不需要本地服务。

## 在线使用

访问 [Resume Studio](https://beep-bebop.github.io/resume-editor/)。

- “简历库”页可切换、新建、复制、导入、下载和删除简历。
- “编辑”页提供模块编辑和 Markdown 源码两种方式；可添加、移动、删除模块，直接编辑列表、表格和柱状图数据。
- 修改会自动成为当前浏览器的草稿。点击“保存”才会更新仓库。
- “设置”页可选择自定义单页或固定尺寸多页。自定义单页支持宽度与固定/自动高度。
- PDF 预览与下载使用同一份文件，可放大、缩小。
- 排版设置包括三种快速样式、标题/正文字体、姓名/模块/经历/正文字重、字号、行距、列表标记大小与粗细、分割线颜色与粗细、照片开关和定时云端保存。
- “格式指南”列出 Markdown 语法对应的 PDF 元素。

### 在线保存权限

GitHub Pages 是静态站点，无法直接读写仓库文件。网页使用 GitHub Contents API
读写私有数据仓库 `beep-bebop/resume-data` 中的 `resumes/*.md`。请在 GitHub 创建
仅限该仓库、具有 **Contents: Read and write** 权限的细粒度个人访问令牌，然后将其
填入“设置 → 云端保存”。

未填写令牌时不会读取任何简历或照片，简历库保持为空；填入令牌后才会自动读取，
并可按间隔把未保存的简历同步到云端。令牌保存在本机浏览器（localStorage），
下次打开网页可直接读取；清除浏览器数据后需要重新填写。令牌不会写入仓库或 PDF。

主仓库 `beep-bebop/resume-editor` 保持公开以发布 Pages，但已不再包含任何简历文字、
联系方式或照片。注意早先的提交历史中仍保留过这些文件，如需彻底移除可重写历史。

### 文件格式

```md
# 姓名

## 个人基本信息
电话：123 ｜ 邮箱：name@example.com

## 工作经历
### 公司｜岗位｜时间
- **成果：**具体数据和结果
#### 项目名称
- 项目贡献
```

- `#` 是页首姓名；`## 个人基本信息` 的内容进入页首资料。
- 其他 `##` 是带分割线的模块标题；`###` 是经历标题；`####` 是项目标题。
- `-` 和 `*` 是条目；`**文字**` 加粗；反引号文字使用强调色。
- 管道表格会进入 PDF；图表用 `:::chart` 开始、`:::` 结束，内容逐行写
  `标签 | 非负数值`，显示为柱状图。
- Markdown 图片、链接和 HTML 尚未参与排版。页首照片可在设置页更换。
- 样式参数保存在 MD 底部的 `resume-studio` 注释中，可与文字一起跨设备同步。

## 本地开发

需要 Node.js 22.13 或更新版本。

```bash
npm ci
npm run dev
npm run build
npm test
```

静态构建产物在 `dist/`。推送 `main` 后，
`.github/workflows/pages.yml` 会自动构建并部署到 GitHub Pages。

PDF 中文字体使用 [Noto Sans SC](https://github.com/google/fonts/tree/main/ofl/notosanssc)
与 [Noto Serif SC](https://github.com/google/fonts/tree/main/ofl/notoserifsc)；
为保证 PDF 中的字重真实可调，站点使用 300/400/600/800 四档静态 TTF。
原始可变字体保存在 `scripts/source-fonts/`，可用 `scripts/font_instances.py` 重新生成。
许可证分别见 `public/fonts/OFL.txt` 与 `public/fonts/NotoSerifSC-OFL.txt`。

