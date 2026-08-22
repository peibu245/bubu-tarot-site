# 不不tarot V9 审核记录

审核目标：在不破坏现有 V7/V8 数据、后台配置与联系方式功能的前提下，上线新的多牌堆抽牌页面。

## 已完成检查

### TypeScript / TSX

- 全项目 51 个 `.ts/.tsx` 文件执行 TypeScript `transpileModule` 语法检查。
- 结果：0 个语法诊断。

### CMS 文案字段

- `defaultPageText`：321 个字段。
- 后台 `page-copy-schema`：321 个字段。
- 重复字段：0。
- 默认值缺失：0。
- 后台遗漏：0。

### Docker overlay

- Dockerfile 所引用的 VPS overlay 文件全部存在。
- 按 Dockerfile 规则模拟覆盖后，对构建范围 `app/`、`components/`、`lib/` 检查相对 import。
- 结果：36 个构建范围 TS/TSX 文件，0 个缺失相对 import。

### Shell / Python

- `vps/update-existing-server.sh`：`bash -n` 通过。
- `vps/setup-server.sh`：`bash -n` 通过。
- `scripts/fetch-public-card-assets.py`：`py_compile` 通过。

### 卡牌元数据

- Waite–Smith：78 张元数据、78 个唯一图像路径。
- Lenormand：36 张元数据。
- 下载脚本：78 个唯一 Waite–Smith 远程文件名。
- 下载脚本生成的本地文件名与前端 78 个 Waite–Smith 路径逐一匹配。

### 公版图源核对

- Waite–Smith：采用 Wikimedia Commons `Rider-Waite-Smith tarot deck (TaionWC)` 的 Pam-A 同套扫描；该分类包含 78/78 文件。
- 单张 Waite–Smith 文件页明确标记 Public Domain。
- Lenormand：采用 1799 年 Johann Kaspar Hechtel `Das Spiel der Hofnung (The Game of Hope)` 36 张；Commons 文件页明确标记 Public Domain，来源为 British Museum。
- 本版未启用托特实际牌面；马赛等待完整、统一、来源明确的历史套图。

### 图片下载策略

- Waite–Smith 使用 500px Commons 缩略图；足以覆盖当前最大实际显示尺寸并显著减少加载体积。
- Game of Hope 使用 960px 6×6 历史整图，前端通过 sprite crop 显示单张。
- 下载文件会检查文件大小以及 JPEG/PNG magic bytes，并使用临时文件 + 原子替换。
- 获取图像发生错误时，更新脚本在 Docker build 和 restart 之前退出，因此旧站保持运行。

### 更新脚本模拟

使用临时站点目录、假的 Docker 命令和假的资源准备命令模拟真实 `update-existing-server.sh`：

- 正常路径：旧 `site-content.json` 先备份 → 资源准备 → Docker build → up → healthcheck → `Update complete.`。
- 资源准备失败路径：脚本返回非 0，并在 `docker compose build` 之前停止；未调用 build / up。

### 数据兼容

已验证旧版本数据清洗/迁移逻辑：

- 自定义页面标题、价格、联系方式等旧数据保留。
- 旧默认“小科普”文案才迁移为新默认“抽一张”。
- 原有知识卡继续作为知识牌堆内容使用。

## 当前环境限制

本地审核环境缺少完整 npm 依赖缓存，其中 `zod-validation-error` 无离线缓存，因此无法在本地完成一次完整的 `next build --webpack`。

真实 VPS 更新流程仍会执行：

1. 备份 `site-content.json`；
2. 检查 `.env`；
3. 获取并校验历史公版卡牌资源；
4. `docker compose build`，其中执行正式 `next build --webpack`；
5. 只有 build 成功才 `up -d`；
6. 等待容器 healthcheck 变为 `healthy`。

因此 production build 仍由服务器承担最终编译闸门。
