# 不不tarot V8 联系方式中心 · 审核记录

日期：2026-08-20

## 本轮重点

本轮在 V7 audited 基础上新增联系方式中心，不改动价格、政策正文、页面模块、留言板和管理员密码机制。

## 已验证

### 1. V7 → V8 数据迁移
使用 contentVersion 9 的 V7 模拟数据执行真实迁移：

- contentVersion 正常升级到 10。
- 自定义首页标题保留。
- 自定义价格项目保留。
- V7 默认空白微信/闲鱼渠道升级为当前账号。
- 自动加入 QQ、小红书、抖音。
- 旧自定义联系链接保留。
- V7 默认配置说明不会作为访客文案残留。

随后执行“保存 → 生成历史版本 → 回滚”，恢复成功。

### 2. 二维码图片
默认图片均存在于 `public/contact/`。

- 微信：保留可机器识别的二维码与白边。
- 闲鱼：去掉会变化的宝贝/粉丝统计，只保留二维码与扫码说明区域。
- QQ / 抖音 / 小红书：属于平台专用码，保留原分享卡结构并仅做尺寸/压缩处理，避免过度裁切造成平台 App 无法识别。

### 3. 后台二维码上传
实测 VPS 上传处理逻辑：

- 正确 Origin + JPEG：201，文件成功写入数据目录。
- 错误 Origin：403。
- 仅接受 JPEG / PNG / WEBP。
- 单文件上限 6MB。
- 文件使用随机 UUID 命名。

### 4. 公开二维码读取
实测公开读取 API：

- 合法文件名返回 200 与正确 MIME。
- `../../etc/passwd` 路径穿越请求返回 404。

### 5. 源码/部署结构

- 50 个 TS/TSX 文件执行 TypeScript 语法转译：0 个错误。
- 模拟 Docker overlay 后 35 个运行源码文件：0 个语法错误。
- 模拟 Docker overlay 后：0 个缺失的相对 import。
- Dockerfile 所有 COPY 源文件均存在。
- 所有 VPS shell 脚本通过 `bash -n`。
- 296 个后台文案字段：296 个唯一 key，0 重复，0 缺失默认值。
- 部署包不包含真实 `.env`、管理员密码、session secret、`site-content.json` 或 `guestbook.json`。

## 环境限制

当前执行环境访问 npm registry 超时，因此无法在这里再次完成 Next.js 16 的正式 production build。该构建会在用户 VPS 执行 `./vps/update-existing-server.sh` 时由 Dockerfile 的 `next build --webpack` 真正执行；构建失败时脚本不会报告 `Update complete.`。

这与 V7 audited 的最终上线流程相同：先整站备份，再 Docker build，再 healthcheck。
