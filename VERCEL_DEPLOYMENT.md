# Vercel 部署完整指南

## 项目状态

- ✅ **GitHub 仓库**: https://github.com/sikenali/msst
- ✅ **分支**: main
- ✅ **最新提交**: 已同步
- 🎯 **部署平台**: Vercel

## Vercel 项目配置

### 1. 访问 Vercel

打开 [vercel.com](https://vercel.com) 并登录 GitHub 账号。

### 2. 导入项目

1. 点击 **"Add New..."** → **"Project"**
2. 选择 GitHub 仓库 `sikenali/msst`
3. 点击 **"Import"**

### 3. 配置构建设置

在 **"Configure Project"** 页面：

```
Framework Preset: Vite
Root Directory: ./
Build Command: npm run build
Output Directory: dist
Install Command: npm install
```

### 4. 环境变量

点击 **"Environment Variables"**，添加以下变量：

| Name | Value | Environment |
|------|-------|-------------|
| `VITE_API_BASE_URL` | `/api/lottery` | ✅ Production |

### 5. 部署

点击 **"Deploy"** 开始部署。

## 项目结构

```
msst/
├── pages/api/           # Vercel Serverless 函数
│   └── lottery.ts      # 彩票历史数据 API
├── src/                # Vue 3 前端代码
├── vercel.json         # Vercel 配置文件
└── package.json        # 项目依赖
```

## API 端点

部署完成后，API 可通过以下方式访问：

```
# 双色球历史数据
https://your-project.vercel.app/api/lottery?type=ssq

# 大乐透历史数据
https://your-project.vercel.app/api/lottery?type=dlt

# 刷新缓存
https://your-project.vercel.app/api/lottery?type=refresh
```

## 自动部署

### 配置自动部署

一旦首次部署成功，Vercel 会自动监听 GitHub 仓库：

```
GitHub Push → Vercel 检测 → 自动构建 → 自动部署
```

### 推送流程

```bash
# 本地开发
git add -A
git commit -m "feat: 新功能"
git push origin main

# ⚡ Vercel 自动部署（无需手动操作）
```

### 部署分支

- **main 分支** → Production 部署（生产环境）
- **其他分支** → Preview 部署（预览环境）
- **Pull Requests** → 独立的预览链接

## 查看部署状态

### Vercel Dashboard

访问 [vercel.com/dashboard](https://vercel.com/dashboard) 查看：

- **Deployments** - 所有部署历史
- **Activity** - 部署活动日志
- **Analytics** - 访问统计（可选）

### 部署日志

1. 点击项目名称
2. 选择最新的 Deployment
3. 点击 **"View Logs"** 查看详细日志
4. 查看 **"Functions"** 标签了解 Serverless 函数状态

## 故障排查

### API 404 错误

**原因**：Serverless 函数未正确部署

**解决**：
1. 检查 `pages/api/lottery.ts` 是否存在
2. 查看 Vercel 部署日志中的 Functions 部分
3. 确认 `vercel.json` 配置正确

### 构建失败

**原因**：TypeScript 错误或依赖问题

**解决**：
1. 本地运行 `npm run build` 测试
2. 查看 Vercel 构建日志
3. 修复错误后重新推送

### CORS 错误

**解决**：
- 确认 API 已启用 CORS（已配置）
- 检查前端请求的 origin

## 自定义域名（可选）

### 配置步骤

1. Vercel Dashboard → Project → Settings → Domains
2. 添加自定义域名：`lottery.yourdomain.com`
3. 按照提示配置 DNS 记录

### DNS 配置

```
Type: CNAME
Name: lottery (或 @)
Value: cname.vercel-dns.com
```

## 性能优化

### 缓存策略

- **API 缓存**: 24 小时服务器缓存
- **浏览器缓存**: 1 小时 localStorage
- **CDN 缓存**: Vercel 全球 CDN 自动缓存静态资源

### Serverless 优化

- **冷启动**: 首次访问约 1-2 秒延迟
- **内存**: 1024 MB（已配置）
- **超时**: 10 秒（免费版上限）

## 监控和告警

### Vercel 内置监控

- **Deployments** - 部署成功率
- **Function Invocations** - 函数调用次数
- **Bandwidth** - 带宽使用

### 第三方监控（可选）

- **Sentry** - 错误追踪
- **Google Analytics** - 用户分析
- **Uptime Robot** - 在线状态监控

## 备份和恢复

### 代码备份

- GitHub 自动备份所有提交
- 本地保留完整代码

### 数据备份

- API 数据实时爬取，无需备份
- 用户数据存储在浏览器 localStorage

## 升级和维护

### 依赖升级

```bash
# 检查可升级的依赖
npm outdated

# 升级依赖
npm update

# 提交并推送
git add -A
git commit -m "chore: 升级依赖"
git push origin main
```

### Vercel 配置更新

修改 `vercel.json` 后推送，Vercel 自动重新部署。

## 成本估算

### 免费版额度

- **Deployments**: 无限
- **Bandwidth**: 100 GB/月
- **Serverless Function Invocations**: 100 GB-秒/月
- **Storage**: 1 GB

### 预计使用量

对于个人彩票项目：
- ✅ 免费版额度完全足够
- 💰 月费用：$0

## 联系支持

- **Vercel 文档**: [vercel.com/docs](https://vercel.com/docs)
- **项目 Issues**: [GitHub Issues](https://github.com/sikenali/msst/issues)
- **Vercel 社区**: [GitHub Discussions](https://github.com/vercel/vercel/discussions)

## 快速命令参考

```bash
# 安装 Vercel CLI（可选）
npm install -g vercel

# 本地测试部署
vercel dev

# 部署到预览环境
vercel

# 部署到生产环境
vercel --prod

# 查看部署日志
vercel logs
```

## 检查清单

部署前确认：

- [ ] GitHub 仓库已推送最新代码
- [ ] `pages/api/lottery.ts` 存在
- [ ] `vercel.json` 配置正确
- [ ] 环境变量已配置
- [ ] 依赖已安装

部署后测试：

- [ ] 前端页面可访问
- [ ] API 端点返回数据
- [ ] 历史数据功能正常
- [ ] 号码生成功能正常
- [ ] 移动端显示正常

## 总结

✅ **GitHub**: 代码托管和版本控制
✅ **Vercel**: 自动部署和全球 CDN
✅ **Serverless**: 无服务器 API，按需付费
✅ **免费**: 个人使用完全免费

现在前往 [vercel.com/new](https://vercel.com/new) 开始部署吧！
