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

开发环境默认启用内置 Mock API。临时管理员账号：`admin`，密码：`123456`。

单独启动 Mock 服务：

```bash
pnpm dev:mock
```

## 构建与检查

```bash
pnpm build
pnpm check:type
pnpm lint
```

## 目录

- `apps/web-antd`：StoneLab 管理端应用
- `apps/backend-mock`：服务端完成前使用的认证 Mock
- `packages`：Vben 共享 UI、状态、权限和工具包
- `internal`、`scripts`：构建与工程工具

业务接口统一使用 `/api` 前缀。服务端接入后关闭 `VITE_NITRO_MOCK`，并由部署环境提供真实 API 地址。
