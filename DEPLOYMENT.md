# 部署指南

## 方案一：部署到 Render（推荐）

### 步骤 1: 准备代码

确保后端代码在 `server/` 目录中，已包含：
- ✅ `server.js` - 主服务器文件
- ✅ `package.json` - 依赖配置
- ✅ `.gitignore` - Git 忽略文件

### 步骤 2: 推送到 GitHub

代码已推送到 GitHub 仓库 `sikenali/msst`

### 步骤 3: 在 Render 创建服务

1. 访问 [render.com](https://render.com)
2. 注册/登录账号
3. 点击 "New +" → "Web Service"
4. 连接 GitHub 仓库，选择 `sikenali/msst`
5. 配置服务：
   - **Name**: `msst-lottery-api`（自定义）
   - **Root Directory**: `server`
   - **Runtime**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `node server.js`
   - **Environment Variables**: 
     - `NODE_ENV`: `production`
   - **Free Plan**: 选择 Free 套餐

6. 点击 "Create Web Service"

### 步骤 4: 获取服务器地址

部署完成后，Render 会提供类似这样的 URL：
```
https://msst-lottery-api.onrender.com
```

### 步骤 5: 更新前端配置

1. 在本地创建或修改 `.env.production`：
   ```env
   VITE_API_BASE_URL=https://msst-lottery-api.onrender.com/api
   ```

2. 重新构建前端：
   ```bash
   npm run build
   ```

3. 部署前端到 Vercel/Netlify：
   ```bash
   # 如果使用 Vercel
   vercel --prod
   
   # 或者部署到 Netlify
   netlify deploy --prod
   ```

### 步骤 6: 测试

访问前端部署地址，测试历史数据功能是否正常。

---

## 方案二：部署到 Railway

### 步骤

1. 访问 [railway.app](https://railway.app)
2. 登录 GitHub
3. 点击 "New Project" → "Deploy from GitHub repo"
4. 选择 `sikenali/msst` 仓库
5. 设置 Root Directory 为 `server`
6. Railway 会自动部署

---

## 方案三：部署到 Vercel（需要改造）

Vercel 主要支持 Serverless 函数，需要将 `server.js` 改造为 API Routes 格式。

---

## 注意事项

1. **首次访问延迟**：Render 免费套餐在 15 分钟无访问后会休眠，首次访问需要 30-60 秒唤醒
2. **爬虫限制**：500.com 可能会限制频繁爬取，建议增加缓存时间
3. **CORS 配置**：服务器已启用 CORS，支持跨域请求
4. **端口配置**：服务器使用 `process.env.PORT`，云平台会自动分配端口

---

## 验证部署

部署完成后，在浏览器中访问：
- `https://your-app.onrender.com/api/ssq` - 双色球历史数据
- `https://your-app.onrender.com/api/dlt` - 大乐透历史数据

应该返回 JSON 数据。
