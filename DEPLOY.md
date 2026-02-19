# 部署指南

## 快速部署到 Vercel

### 1. 安装 Vercel CLI

```bash
npm install -g vercel
```

### 2. 登录

```bash
vercel login
```

### 3. 部署

在项目目录下运行：

```bash
cd /root/.openclaw/workspace/crypto-tools-vercel
vercel
```

首次部署会询问：
- Set up and deploy? **Y**
- Which scope? 选择你的账号
- Link to existing project? **N**
- What's your project's name? **crypto-tools-vercel**
- In which directory is your code located? **./**

### 4. 生产部署

```bash
vercel --prod
```

## 通过 GitHub 部署

1. 创建 GitHub 仓库
2. 推送代码：
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/你的用户名/crypto-tools-vercel.git
   git push -u origin main
   ```

3. 访问 https://vercel.com
4. 点击 "Import Project"
5. 选择你的 GitHub 仓库
6. Vercel 会自动检测配置并部署

## 环境变量配置（可选）

在 Vercel 项目设置中添加：

- `JWT_SECRET`: 自定义 JWT 密钥（提高安全性）

## 测试部署

部署完成后，访问 Vercel 提供的 URL：
- 登录页面：`https://your-project.vercel.app/login.html`
- 使用卡密：`DEMO2024`, `TEST2024`, 或 `PROD2024`

## 故障排查

### 部署失败

检查 Vercel 构建日志，确保：
- `api/` 目录下的所有 `.js` 文件存在
- `package.json` 包含所有依赖

### API 超时

BSC 查询可能需要较长时间，Vercel Serverless Functions 有 10 秒限制。如果超时：
- 减少查询页数（修改 `api/holders.js` 中的 `maxPages`）
- 或升级到 Vercel Pro 获得更长执行时间

### CORS 错误

确保 API 函数中包含 CORS 头部（已配置）。
