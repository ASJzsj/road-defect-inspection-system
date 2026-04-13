# 道路病害无人机巡检管理系统 v1.0.0

基于 React + TypeScript + Vite 构建的道路病害无人机巡检管理平台，集成 AI 视觉识别模型（YOLOv8/v11/v26），实现病害检测、数据管理和报告生成全流程闭环。

## 功能模块

| 模块 | 说明 |
|------|------|
| 数据看板 | 工程总览、病害统计图表、AI 实时数据联动 |
| 病害管理 | 病害列表 CRUD、AI/手动来源筛选、数据同步 |
| 影像导入 | 无人机影像上传、预览、一键发送至 AI 识别 |
| AI 识别检测 | YOLOv8/v11/v26 检测与分割模型、自定义模型配置、Mock/在线双模式 |
| 检测报告 | AI 结果一键导入、多页 PDF 导出、打印优化 |

## 技术栈

- **前端框架**: React 19 + TypeScript
- **构建工具**: Vite 7
- **UI 组件**: Tailwind CSS 3.4 + shadcn/ui
- **路由**: React Router DOM v7
- **图表**: Recharts
- **图标**: Lucide React
- **AI 模型**: YOLOv8 / YOLOv11 / YOLOv26（支持 Detect / Seg）

## 快速开始

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 构建生产版本
npm run build

# 预览构建结果
npm run preview
```

## 部署到 GitHub Pages

### 方式一：GitHub Actions 自动部署（推荐）

1. 在 GitHub 创建仓库，如 `road-defect-inspection-system`
2. 修改 `package.json` 中的 `homepage` 字段：
   ```json
   "homepage": "https://yourusername.github.io/road-defect-inspection-system"
   ```
3. 将代码推送到 `main` 分支
4. 在仓库 Settings > Pages 中，Source 选择 **GitHub Actions**
5. 推送后自动触发部署，几分钟后即可访问

### 方式二：手动部署

```bash
# 安装 gh-pages
npm install gh-pages --save-dev

# 构建并部署
npm run deploy
```

## 项目配置

部署前需根据实际仓库名修改以下位置：

| 文件 | 配置项 | 说明 |
|------|--------|------|
| `package.json` | `homepage` | GitHub Pages 访问地址 |
| `.github/workflows/deploy.yml` | `VITE_BASE` | 自动读取仓库名 |
| `vite.config.ts` | `base` | 构建资源基础路径（CI 自动注入） |

## 登录账号

| 角色 | 账号 | 密码 |
|------|------|------|
| 管理员 | admin | admin123 |
| 巡检员 | inspector | 123456 |

## License

MIT
