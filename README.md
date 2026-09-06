# StoneLab Admin

StoneLab 商品、内容、库存与订单运营管理后台，基于 Vue 3、TypeScript、Vben Admin 和 Ant Design Vue。

## 环境要求

- Node.js 22.18+ 或 24.12+（推荐 24 LTS）
- pnpm 11+

## 本地开发

```bash
pnpm install
pnpm dev
```

先启动本地服务端：

```bash
cd ../stonelab-server
npm run dev
```

再启动管理后台。开发服务器会将 `/api` 原样代理到 `http://localhost:3100`。本地管理员账号：`admin`，密码：`123456`。

## 构建与检查

```bash
pnpm build
pnpm check:type
pnpm lint
```

## 目录

- `apps/web-antd`：StoneLab 管理端应用
- `packages`：Vben 共享 UI、状态、权限和工具包
- `internal`、`scripts`：构建与工程工具

业务接口统一使用 `/api` 前缀。开发环境连接本地 `stonelab-server`，生产环境由部署环境提供真实 API 地址。
