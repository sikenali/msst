# Vercel 自动部署快速指南

## ✅ 当前状态

- ✅ 代码已推送到 GitHub: `https://github.com/sikenali/msst`
- ✅ 最后一次提交：`b951d81 feat: 改造为 Vercel Serverless 架构`
- ✅ 已包含 Vercel 配置：`vercel.json`
- ✅ 已创建 Serverless API: `api/lottery.ts`

## 🚀 立即部署到 Vercel

### 步骤 1: 访问 Vercel

打开浏览器，访问：[**https://vercel.com/new**](https://vercel.com/new)

### 步骤 2: 登录

- 点击 **"Continue with GitHub"**
- 授权 Vercel 访问你的 GitHub 账号

### 步骤 3: 导入项目

1. 在 **"Import Git Repository"** 页面
2. 找到 `sikenali/msst` 项目
3. 点击 **"Import"**

### 步骤 4: 配置项目

在 **"Configure Project"** 页面：

```
Framework Preset: Vite
Build Command: npm run build
Output Directory: dist
Install Command: npm install
```

**根目录（Root Directory）**：留空（默认）

### 步骤 5: 添加环境变量

点击 **"Environment Variables"** → **"Add New"**

| Name | Value | Environment |
|------|-------|-------------|
| `VITE_API_BASE_URL` | `/api` | ✅ Production |

### 步骤 6: 部署

点击 **"Deploy"**

等待 2-5 分钟，部署完成后会显示：
- ✅ **Congratulations!**
- 🌐 访问地址：`https://msst-xxx.vercel.app`

## 🔄 自动部署机制

### 已配置自动部署

一旦部署成功，Vercel 会自动监听 GitHub 仓库：

```
GitHub Push → Vercel 检测到变更 → 自动构建 → 自动部署
```

### 推送流程

```bash
# 本地修改代码
git add -A
git commit -m "fix: 修复某个功能"
git push origin main

# ⬇️ 自动触发

Vercel 自动部署（无需手动操作）
```

### 部署通知

- Vercel 会在 GitHub PR/Commit 状态中显示部署状态
- 可以在 Vercel Dashboard 查看部署日志
- 部署失败会收到邮件通知（如果配置）

## 📱 查看部署状态

### Vercel Dashboard

访问：[https://vercel.com/dashboard](https://vercel.com/dashboard)

查看：
- **Deployments** - 所有部署历史
- **Analytics** - 访问统计（可选）
- **Settings** - 项目配置

### 部署日志

点击任意部署 → **"View Logs"** 查看详细构建日志

## 🔧 部署后配置

### 1. 自定义域名（可选）

在 Vercel 项目设置中：
- Settings → Domains
- 添加你的域名：`lottery.yourdomain.com`

### 2. 环境变量管理

- Settings → Environment Variables
- 可以添加更多变量
- 支持 Development/Preview/Production 不同环境

### 3. 自动预览

每次 Push 都会生成预览版本：
- Main 分支 → Production 部署
- 其他分支 → Preview 部署
- 每个 PR 都有独立的预览链接

## 🧪 测试部署

部署完成后，访问：

```
https://your-project.vercel.app
```

测试功能：
1. ✅ 切换双色球/大乐透
2. ✅ 打开五行七列图
3. ✅ 查看历史数据（最近 30 期）
4. ✅ 生成号码

### API 测试

```bash
# 双色球数据
curl https://your-project.vercel.app/api?type=ssq

# 大乐透数据
curl https://your-project.vercel.app/api?type=dlt

# 刷新缓存
curl https://your-project.vercel.app/api?type=refresh
```

## ⚠️ 常见问题

### 部署失败

**原因**：构建错误或依赖问题

**解决**：
1. 查看 Vercel 部署日志
2. 本地运行 `npm run build` 测试
3. 修复错误后重新推送

### API 返回 500

**原因**：Serverless 函数执行错误

**解决**：
1. Vercel Dashboard → Functions → 查看日志
2. 检查 500.com 是否可访问
3. 查看缓存数据

### 跨域错误

确认 CORS 配置正确，检查浏览器控制台错误信息。

## 📊 监控和优化

### 查看函数使用情况

- Vercel Dashboard → Functions
- 查看执行次数和延迟

### 优化建议

1. **缓存策略**：已实现 24 小时缓存
2. **超时设置**：10 秒（免费版上限）
3. **内存优化**：1024 MB

## 🎉 完成！

现在每次推送到 GitHub 都会自动部署到 Vercel！

```bash
# 日常工作流程
git add -A
git commit -m "feat: 新功能"
git push origin main

# ⚡ 自动部署，无需手动操作！
```

## 📞 需要帮助？

- Vercel 文档：[vercel.com/docs](https://vercel.com/docs)
- 项目 Issues: [GitHub Issues](https://github.com/sikenali/msst/issues)
