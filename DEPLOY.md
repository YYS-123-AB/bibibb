# 汽车车型大全站 - 部署教程

## 项目简介

这是一个纯前端的汽车车型大全网站，使用原生 HTML + CSS + JavaScript 构建，无需后端服务器。包含 90+ 款车型数据，支持 4 维度筛选、搜索、排序、详情弹窗、收藏夹、明暗主题切换等功能。

---

## 本地开发

### 1. 环境要求

- Node.js >= 16.0.0
- npm >= 8.0.0

### 2. 安装依赖

```bash
npm install
```

### 3. 启动开发服务器

```bash
npm run dev
```

浏览器会自动打开 `http://localhost:5173`

### 4. 更新/获取车型数据

```bash
npm run fetch
```

该脚本会尝试从网络获取最新数据，失败时会自动生成示例数据。

### 5. 构建生产版本

```bash
npm run build
```

构建产物会生成在 `dist/` 目录下。

---

## 部署到 GitHub Pages（推荐）

### 方式一：自动部署（GitHub Actions）

项目已内置完整的 GitHub Actions 工作流，支持三种触发方式：

1. **Push 触发**：代码推送到 main/master 分支自动部署
2. **定时触发**：每天北京时间凌晨 3 点自动更新数据并部署
3. **手动触发**：在 Actions 页面手动运行工作流

#### 部署步骤：

1. **创建 GitHub 仓库**

   ```bash
   git init
   git add .
   git commit -m "feat: 初始化汽车车型大全站"
   git branch -M main
   git remote add origin https://github.com/你的用户名/你的仓库名.git
   git push -u origin main
   ```

2. **启用 GitHub Pages**

   - 进入仓库页面 → Settings → Pages
   - Source 选择 **GitHub Actions**

3. **触发首次部署**

   - 方式 A：再次推送代码触发
   - 方式 B：进入 Actions → 选择 "Deploy Car Encyclopedia" → 点击 "Run workflow"

4. **等待部署完成**

   工作流会依次执行：
   - Job `build`：安装依赖 → 获取数据 → 构建 → 上传产物
   - Job `deploy`：部署到 GitHub Pages
   - Job `commit-data`：提交更新后的数据到仓库

5. **访问网站**

   部署成功后，访问地址为：`https://你的用户名.github.io/你的仓库名/`

---

### 方式二：手动部署

1. **构建项目**

   ```bash
   npm run build
   ```

2. **部署到 gh-pages 分支**

   安装 `gh-pages` 工具：

   ```bash
   npm install -g gh-pages
   ```

   部署：

   ```bash
   gh-pages -d dist
   ```

3. **或使用 git 手动部署**

   ```bash
   cd dist
   git init
   git add .
   git commit -m "deploy"
   git branch -M gh-pages
   git remote add origin https://github.com/你的用户名/你的仓库名.git
   git push -f origin gh-pages
   ```

   然后在 Settings → Pages 中选择 `gh-pages` 分支作为源。

---

## 部署到 Vercel

1. **登录 Vercel**：https://vercel.com
2. **New Project** → 导入你的 GitHub 仓库
3. **配置构建命令**：
   - Framework Preset: Vite
   - Build Command: `npm run build`
   - Output Directory: `dist`
4. **Deploy** 等待完成即可

---

## 部署到 Netlify

1. **登录 Netlify**：https://netlify.com
2. **Add new site** → Import an existing project → 选择 GitHub
3. **选择仓库** → 配置构建：
   - Build command: `npm run build`
   - Publish directory: `dist`
4. **Deploy site** 完成部署

---

## 部署到静态文件服务器（Nginx / Apache）

### Nginx 配置示例

```nginx
server {
    listen 80;
    server_name your-domain.com;
    root /path/to/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location ~* \.(?:css|js|woff2?|ttf|eot|otf|ico|png|jpg|jpeg|gif|svg|webp)$ {
        expires 7d;
        add_header Cache-Control "public, immutable";
    }
}
```

### Apache .htaccess（可选）

在 `dist/` 目录下创建 `.htaccess`：

```apache
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  RewriteRule ^index\.html$ - [L]
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule . /index.html [L]
</IfModule>
```

---

## 功能说明

### 筛选维度

| 维度 | 选项 |
|------|------|
| 国别/品牌系 | 全部 / 德系 / 日系 / 美系 / 国产 / 英系 / 法系 / 韩系 / 意系 |
| 车辆级别 | 全部 / 微型车 / 小型车 / 紧凑型 / 中型车 / 中大型 / 大型车 / SUV / MPV / 跑车 / 皮卡 |
| 能源类型 | 全部 / 纯燃油 / 混动 / 插混 / 纯电 / 增程 / 氢燃料 |
| 价格区间 | 10万内 / 10-20万 / 20-35万 / 35-50万 / 50-80万 / 80万+ |

### 核心功能

- ✅ 搜索框支持：车型名 / 品牌 / 厂商 / 发动机型号 / 关键词（300ms 防抖）
- ✅ 排序方式：综合排序 / 价格升序 / 价格降序 / 评分最高 / 热度最高
- ✅ 明暗主题切换（localStorage 持久化 + 跟随系统）
- ✅ 响应式布局（1200px / 768px / 480px 三断点）
- ✅ 收藏夹（localStorage 持久化）
- ✅ 详情弹窗（×按钮 / 遮罩点击 / ESC键 三种关闭方式）
- ✅ 回到顶部按钮
- ✅ 空状态 / 加载状态 / 错误状态

---

## 目录结构

```
web22/
├── index.html              # 主页面
├── css/
│   └── style.css           # 样式文件（约1200行）
├── js/
│   └── app.js              # 核心逻辑脚本
├── data/
│   └── data.json           # 90+ 款车型数据
├── scripts/
│   └── fetch-data.js       # 数据获取脚本
├── .github/
│   └── workflows/
│       └── deploy.yml      # GitHub Actions 部署配置
├── .nojekyll               # 禁用 GitHub Pages Jekyll
├── .gitignore
├── package.json
├── vite.config.js
└── DEPLOY.md               # 本文档
```

---

## 常见问题

### Q: 图片加载不出来怎么办？

A: 项目使用 picsum.photos 作为占位图片，需要联网。离线使用时，可替换为本地图片。

### Q: 如何添加更多车型数据？

A: 编辑 `data/data.json`，按照现有格式添加新车型对象即可。

### Q: 收藏数据存在哪里？

A: 收藏数据存储在浏览器 localStorage 中，key 为 `car_favorites`，清除浏览器数据会丢失收藏。

### Q: 主题切换如何工作？

A: 默认跟随系统（`prefers-color-scheme`），用户手动切换后会保存到 localStorage（key: `car_theme`），下次优先使用用户选择。

### Q: 国内访问 GitHub Pages 慢怎么办？

A: 可考虑部署到 Vercel 或 Netlify，国内访问速度更快；或使用国内静态托管服务如 Gitee Pages、阿里云 OSS + CDN 等。

---

## License

MIT License
