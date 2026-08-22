# 不不tarot V10 上线前审核记录

审核目标：在保留现有网站内容、后台配置、联系方式与政策数据的前提下，上线 V10 抽牌视觉重构、Tips、牌面小知识和牌阵小册。

## 已完成检查

### TypeScript / TSX 语法

- 全工作树 54 个 `.ts/.tsx` 文件执行 TypeScript `transpileModule` 语法检查。
- 结果：0 个语法诊断。
- 按 VPS Docker overlay 后的实际构建文件再次检查：49 个 TS/TSX，0 个语法诊断。

### CMS 文案字段

- 后台页面文案 schema：328 个字段。
- 唯一字段：328。
- 缺失默认值：0。

### 教育内容完整性

- CardFact：136 条，ID 全部唯一。
- 覆盖 Waite–Smith：78/78 张。
- 覆盖 Lenormand：36/36 张。
- SpreadGuide：6 个。
- 默认 Tips：10 条；V10 新 Tips 的迁移采用“缺失才补”的策略。

### 无放回抽取逻辑

已模拟完整轮次：

- Waite–Smith：抽 78 次 → 78 个唯一结果。
- Lenormand：抽 36 次 → 36 个唯一结果。
- 主动洗牌会创建新隐藏牌序并将 cursor 归零。
- 点击可见牌扇位置会选择对应的剩余牌位，再与当前 cursor 交换，因此不是“所有位置只取下一张”。
- Tips 和单牌多条细节也使用 shuffle-bag 逻辑，并验证 localStorage 中保存的 ID 不重复。

### B. Dondorf Lenormand 图像

- 包内独立 JPEG：36 张。
- 逐张 Pillow 解码验证通过。
- 所有图片尺寸一致：318 × 518。
- 1–36 编号映射已人工检查。
- 原始来源：British Museum 1896,0501.308；Commons 为公版机械扫描。

### Waite–Smith 图像

- 前端元数据：78 张。
- Commons 远程文件名清单：78 个唯一文件名。
- 当前本地审核环境无法稳定解析 Wikimedia DNS，因此最终 V10 压缩包不宣称内置 78 张 RWS 图片。
- VPS 更新器会保留服务器已下载成功的图片并只补缺失项。
- 新下载器：User-Agent、3.6s 成功请求间隔、随机 jitter、429 Retry-After / 退避、最多 7 次、临时文件 + 原子替换、JPEG magic byte / 最小体积验证。
- 资源准备失败发生在 `docker compose build` 之前，旧容器不会被替换。

### Docker / import

- Dockerfile 引用的 overlay 文件全部存在。
- 按 Dockerfile 规则模拟 overlay 后，Next 构建范围内相对 import 缺失：0。
- `app/vps-auth.ts` 由 VPS overlay 正常提供。
- 非 Next 生产链的旧 Vite 配置对 `.openai/hosting.json` 的引用不属于 VPS Next 构建入口，不作为生产 import 缺失。

### Shell / Python

- 所有 `.sh`：`bash -n` 通过。
- `scripts/fetch-public-card-assets.py`：`py_compile` 通过。

### 数据与敏感文件

最终工作树检查：

- 无真实 `.env`。
- 无 `site-content.json` 用户数据。
- 无 `.download` 临时文件。
- 无 `node_modules`、`.next`、`__pycache__`、`.pyc` 打包依赖/缓存。
- `.dockerignore` 明确排除 `vps/data` 与 `vps/.env`。

### 数据迁移 / 历史版本

已在开发审核中验证：

- V9/V11 风格旧内容升级到 V10/V12 时，自定义首页标题、抽牌页标题、价格与联系方式保留。
- `cardFacts` 与 `spreadGuides` 缺失时补入默认数据。
- V10 Tips 仅按 ID 补缺，不覆盖已经存在的同 ID 用户内容。
- VPS 保存会产生历史备份；恢复旧版本前当前版本仍会先保存备份。

## 当前环境限制

本地尝试模拟 VPS 的正式 Next.js 构建时，npm 依赖安装受当前执行环境网络 / 缓存限制影响，未能完成完整 `next build --webpack`。

因此仍保留 VPS 上的最终编译闸门：

1. 备份 `site-content.json`；
2. 验证 `.env`；
3. 准备并完整校验 78 + 36 张卡图；
4. `docker compose build`，其中正式执行 `next build --webpack`；
5. 只有 build 成功才 `up -d`；
6. 等待容器 healthcheck 为 `healthy`；
7. 最终必须打印 `Update complete.`。

任何软件都不能合理承诺“绝对没有任何 bug”。本报告代表 V10 在当前可执行条件下已完成多层静态、数据、资源、迁移和部署流程审核，VPS production build 与上线后的真实浏览器验收仍是最后两道检查。
