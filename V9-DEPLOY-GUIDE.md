# V9 FinalShell 更新指南

> 如果 V8.1 尚未部署，可以直接从目前线上版本升级到 V9；V9 已经包含 V8 联系方式中心和 V8.1 手机端修复。

## 1. 上传

把 `bubu-tarot-vps-v9-draw-table.tar.gz` 拖到服务器 `/root/`。

确认：

```bash
ls -lh /root/bubu-tarot-vps-v9-draw-table.tar.gz
```

## 2. 校验 SHA-256

```bash
sha256sum /root/bubu-tarot-vps-v9-draw-table.tar.gz
```

请和交付消息中给出的 SHA-256 完全核对后再继续。

## 3. 整站备份

```bash
tar -C /root -czf "/root/bubu-tarot-site-before-v9-$(date +%Y%m%d_%H%M%S).tar.gz" bubu-tarot-site
```

确认：

```bash
ls -lh /root/bubu-tarot-site-before-v9-*.tar.gz
```

## 4. 确认运行配置和数据仍在

```bash
test -f /root/bubu-tarot-site/vps/.env && echo "1. .env 存在：OK"
test -d /root/bubu-tarot-site/vps/data && echo "2. 数据目录存在：OK"
grep '^PUBLIC_ORIGIN=' /root/bubu-tarot-site/vps/.env
```

正常应包含：

```text
1. .env 存在：OK
2. 数据目录存在：OK
PUBLIC_ORIGIN=https://bubu-tarot.com
```

## 5. 覆盖源码

不要删除旧目录。直接解压覆盖：

```bash
tar -xzf /root/bubu-tarot-vps-v9-draw-table.tar.gz -C /root/bubu-tarot-site
```

覆盖后检查：

```bash
cd /root/bubu-tarot-site && test -f vps/.env && test -d vps/data && test -f scripts/fetch-public-card-assets.py && test -f vps/update-existing-server.sh && echo "覆盖后检查：OK"
```

## 6. 正式更新

```bash
cd /root/bubu-tarot-site
chmod +x vps/update-existing-server.sh scripts/fetch-public-card-assets.py
./vps/update-existing-server.sh
```

第一次部署 V9 时会先下载公版卡牌图像，因此可能比之前更新多花一些时间。下载阶段失败时，脚本会在 Docker build 前停止，线上旧容器不会被重启。

成功结尾应看到：

```text
Card assets ready: RWS 78/78; Lenormand sheet ready.
Update complete.
Public site: https://bubu-tarot.com
```

## 7. 服务器收尾检查

```bash
docker compose -f /root/bubu-tarot-site/vps/docker-compose.yml ps
docker logs --tail=120 bubu-tarot
```

容器应显示 `(healthy)`，日志不应连续报错。

## 8. 浏览器验收

重点检查：

1. `/notes` 页面显示「抽一张看看」。
2. 韦特–史密斯入口为 78 张，并能翻出真实历史牌面。
3. 雷诺曼入口为 36 张，并能翻出对应历史图像。
4. 知识牌堆翻牌后文字直接显示在牌面内。
5. 点击「洗牌」可以看到收牌 → 散洗 → 聚合 → 重新摊开。
6. 洗牌后再次点击相同物理位置，实际抽到的卡牌映射已经重新随机。
7. 手机端牌桌不需要在抽牌后向下寻找另一个结果区。
8. 联系方式手机弹窗仍保持 V8.1 的紧凑尺寸和返回手势行为。
9. 后台文案工作台中能看到新的「抽一张」文案字段。

如果更新脚本出现 `ERROR`、`failed`、`unhealthy`、`npm ERR!`，或最终没有 `Update complete.`，停止后续操作并保留终端输出。
