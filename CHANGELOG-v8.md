# 不不tarot V8 — 联系方式中心

## 主要变化

- 预约须知确认后，联系方式改成「平台按钮列表 → 独立弹窗」结构。
- 默认接入 5 个渠道：微信、闲鱼、QQ、小红书、抖音。
- 微信与闲鱼放在“推荐联系 / 交易”分组；QQ、小红书、抖音放在“其他可以找到我的地方”。
- 联系弹窗支持复制账号、打开外部平台、显示二维码、保存二维码。
- 手机端二维码支持下载；若浏览器不直接写入相册，二维码图片仍可长按保存。
- 五张现有二维码素材已随部署包放入 `public/contact/`。
- 闲鱼素材只保留扫码区域与扫码说明，避免把会变化的宝贝/粉丝数字写死在网页里。

## 后台

“联系方式”升级为“联系方式中心”，每个渠道可编辑：

- 渠道类型
- 显示分组
- 显示名称
- 小标签（如“推荐”“平台交易”）
- 账号 / 用户名
- 外部链接
- 渠道说明
- 二维码图片
- 显示 / 隐藏
- 上移 / 下移排序

支持直接上传 JPG / PNG / WEBP 二维码图片，最大 6MB。上传文件保存到 VPS 的 `/data/contact-images/`，不会因为以后覆盖网站代码而丢失。

## V7 → V8 自动迁移

首次启动 V8 时，旧内容版本会升级到 contentVersion 10：

- 保留原价格、活动、页面文案、政策、模块与历史数据。
- 将 V7 默认的空白微信/闲鱼渠道补成当前联系方式。
- 自动加入 QQ、小红书、抖音渠道。
- 保留非默认的旧自定义联系渠道。
- 旧版“微信咨询 / 闲鱼咨询 / 交易”默认标签会升级为更简洁的“微信 / 闲鱼”。

当前默认联系方式：

- 微信：`buubuu0831`
- 闲鱼：`不不tarot`
- QQ：`3249076027`
- 小红书：`2991986185`
- 抖音：`bubu_tarot`

当前外部链接：

- 闲鱼：`https://m.tb.cn/h.8jRReeK?tk=hlpdTcSJ5JH`
- 小红书：`https://xhslink.cn/m/AkJhpS5AgOQ`

## 安全

- 二维码上传接口只允许后台管理员访问。
- VPS 写接口继续执行管理员会话验证与同源 Origin 检查。
- 上传仅允许 JPEG / PNG / WEBP，最大 6MB。
- 公开图片读取接口限制文件名格式，并阻止路径穿越。
- 用户上传二维码保存在 `/data` 数据卷，不放进公开代码目录。

## 已执行检查

- 50 个 TS/TSX 文件语法转译：0 个诊断错误。
- 所有 VPS shell 脚本 `bash -n` 通过。
- Dockerfile COPY 来源完整性检查通过。
- 296 个后台文案字段唯一且均有默认值。
- V7 默认数据 → V8 迁移实测通过，旧标题与价格保留。
- 保存 → 历史版本 → 回滚实测通过。
- 二维码公开读取接口实测通过，并验证路径穿越返回 404。
- 管理员二维码上传逻辑实测通过；错误 Origin 返回 403。

最终的 Next.js production build 仍会在 VPS 更新脚本的 Docker build 阶段再次执行。

## V8.1 mobile contact modal polish
- Mobile only: contact detail modal reduced to about two-thirds viewport height and narrower width; desktop layout unchanged.
- Mobile QR preview is more compact while downloads still use the original full-resolution QR asset.
- Browser/system back gesture now unwinds contact UI: QR preview -> contact modal -> page, instead of leaving the page immediately.
- Close button remains comfortably inside the mobile safe area.
