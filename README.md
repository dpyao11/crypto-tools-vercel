# Crypto Tools Platform - Vercel 部署版

✅ **项目改造完成！**

简化版加密工具平台，适配 Vercel Serverless 架构。

## 🎯 完成的任务

- ✅ 克隆项目到 `/root/.openclaw/workspace/crypto-tools-vercel`
- ✅ 移除 PostgreSQL 数据库依赖
- ✅ 卡密硬编码：`DEMO2024`, `TEST2024`, `PROD2024`
- ✅ 改为 Vercel Serverless Functions 架构
- ✅ 保留卡密登录功能（Session 存 localStorage）
- ✅ 保留 BSC 持币地址查询功能
- ✅ 创建 Vercel 部署配置
- ✅ 本地测试通过（运行在 http://localhost:3000）

## 🔑 有效卡密

```
DEMO2024
TEST2024
PROD2024
```

## 🚀 本地开发

### 安装依赖

```bash
cd /root/.openclaw/workspace/crypto-tools-vercel
npm install
```

### 启动开发服务器

```bash
npm run dev
# 或
npm start
```

访问 http://localhost:3000

## 📦 Vercel 部署

### 方式一：通过 Vercel CLI（推荐）

1. 安装 Vercel CLI：
```bash
npm install -g vercel
```

2. 登录 Vercel：
```bash
vercel login
```

3. 部署项目：
```bash
cd /root/.openclaw/workspace/crypto-tools-vercel
vercel
```

4. 生产部署：
```bash
vercel --prod
```

### 方式二：通过 GitHub

1. 将代码推送到 GitHub 仓库
2. 在 Vercel 控制台（https://vercel.com）导入项目
3. Vercel 会自动检测 `vercel.json` 配置并部署

## 🔧 环境变量（可选）

在 Vercel 项目设置中配置：

- `JWT_SECRET`: JWT 签名密钥（默认：`vercel-crypto-tools-secret-2024`）

## 📁 项目结构

```
crypto-tools-vercel/
├── api/                    # Vercel Serverless Functions
│   ├── auth/
│   │   ├── login.js       # 卡密登录
│   │   ├── verify.js      # Token 验证
│   │   └── logout.js      # 登出
│   └── holders.js         # BSC 持有人查询
├── public/                # 静态文件
│   ├── index.html         # 工具列表
│   ├── login.html         # 登录页
│   └── bsc-analyzer.html  # BSC 分析工具
├── server.js              # 本地开发服务器
├── vercel.json            # Vercel 配置
├── package.json
└── README.md
```

## 🔌 API 端点

### 认证

- `POST /api/auth/login` - 卡密登录
  ```json
  {
    "cardKey": "DEMO2024"
  }
  ```
  响应：
  ```json
  {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
  ```

- `POST /api/auth/verify` - 验证 Token
  ```
  Headers: Authorization: Bearer <token>
  ```

- `POST /api/auth/logout` - 登出

### BSC 工具

- `POST /api/holders` - 获取代币持有人
  ```json
  {
    "tokenAddress": "0x..."
  }
  ```
  响应：
  ```json
  {
    "success": true,
    "holders": [
      {
        "TokenHolderAddress": "0x...",
        "TokenHolderQuantity": "1000000"
      }
    ]
  }
  ```

## 🛠️ 技术栈

- **后端**: Node.js + Express (本地) / Vercel Serverless Functions (生产)
- **前端**: HTML + Tailwind CSS + Vanilla JS
- **认证**: JWT (存储在 localStorage)
- **爬虫**: Axios + BSCScan HTML 解析
- **部署**: Vercel

## 📊 与原版差异

| 功能 | 原版 | Vercel 版 |
|------|------|-----------|
| 数据库 | ✅ PostgreSQL | ❌ 移除 |
| 卡密管理 | ✅ 动态生成 | ❌ 硬编码 |
| 管理后台 | ✅ 完整后台 | ❌ 移除 |
| 设备限制 | ✅ 3 个设备 | ❌ 无限制 |
| Session 管理 | ✅ 数据库 | ✅ localStorage |
| BSC 查询 | ✅ | ✅ |
| 架构 | Express 单体 | Serverless Functions |

## ⚠️ 注意事项

- 卡密硬编码在 `api/auth/login.js` 中，修改需重新部署
- 无设备数量限制（原版限制 3 个设备）
- Token 有效期 30 天
- BSC 查询可能较慢（需爬取多页数据），请耐心等待
- Vercel Serverless Functions 有 10 秒执行时间限制，大量持有人可能超时

## 🧪 测试结果

✅ 本地服务器启动成功（http://localhost:3000）
✅ 登录 API 测试通过（DEMO2024 有效）
✅ 无效卡密正确拒绝
✅ 所有依赖安装完成

## 📝 部署步骤总结

1. **本地测试**（已完成）
   ```bash
   cd /root/.openclaw/workspace/crypto-tools-vercel
   npm install
   npm start
   ```

2. **部署到 Vercel**
   ```bash
   vercel login
   vercel --prod
   ```

3. **访问部署的应用**
   - Vercel 会提供一个 URL，如：`https://crypto-tools-vercel.vercel.app`

## 📄 License

MIT

---

**项目位置**: `/root/.openclaw/workspace/crypto-tools-vercel`
**本地测试**: http://localhost:3000
**状态**: ✅ 就绪，可直接部署到 Vercel
