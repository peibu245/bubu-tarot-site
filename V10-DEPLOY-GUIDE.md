# 不不tarot V10 · FinalShell 更新说明

> 请使用 V10 最终包，不需要先把失败的 V9/V9.1 完整部署成功。V10 已包含后续代码修复。

## 一、上传

把最终压缩包拖到 FinalShell：

```text
/root/
```

上传完成后先确认文件存在并校验 SHA-256（最终哈希以交付消息为准）：

```bash
ls -lh /root/bubu-tarot-vps-v10-draw-lens.tar.gz
sha256sum /root/bubu-tarot-vps-v10-draw-lens.tar.gz
```

哈希不一致时不要解压。

## 二、备份当前站点

```bash
tar -C /root -czf "/root/bubu-tarot-site-before-v10-$(date +%Y%m%d_%H%M%S).tar.gz" bubu-tarot-site
ls -lh /root/bubu-tarot-site-before-v10-*.tar.gz
```

## 三、确认配置和持久数据

```bash
test -f /root/bubu-tarot-site/vps/.env && echo "1. .env 存在：OK"
test -d /root/bubu-tarot-site/vps/data && echo "2. 数据目录存在：OK"
grep '^PUBLIC_ORIGIN=' /root/bubu-tarot-site/vps/.env
```

不要使用 `cat vps/.env`，避免把管理员密码 / session secret 显示在终端截图里。

## 四、覆盖 V10 源码

不要先删除旧项目目录。直接覆盖：

```bash
tar -xzf /root/bubu-tarot-vps-v10-draw-lens.tar.gz -C /root/bubu-tarot-site
```

检查：

```bash
cd /root/bubu-tarot-site && test -f vps/.env && test -d vps/data && test -f vps/update-existing-server.sh && echo "覆盖后检查：OK"
```

## 五、正式更新

```bash
cd /root/bubu-tarot-site
chmod +x vps/update-existing-server.sh
./vps/update-existing-server.sh
```

### 卡图准备阶段

V10 已直接带入 B. Dondorf 36 张雷诺曼图。

Waite–Smith 会：

- 复用服务器之前已经下载成功的 JPEG；
- 只补缺失图片；
- 每次成功请求主动间隔约 3.6 秒；
- 遇到 429 会自动等待、退避并重试。

如果看到：

```text
Wikimedia rate limit (429). Waiting ... before retry ...
```

不要手动打断，说明退避机制正在工作。

如果最终卡图仍获取失败，脚本会在 Docker build 之前停止，并明确显示：

```text
The current website has not been rebuilt or restarted.
```

这时线上旧容器仍保持不动。

## 六、什么才叫成功

只有最后出现：

```text
Update complete.
Public site: https://bubu-tarot.com
```

才视为完成。

随后检查：

```bash
docker compose -f /root/bubu-tarot-site/vps/docker-compose.yml ps
docker logs --tail=100 bubu-tarot
```

容器应为 `healthy`，日志不应连续刷错误。

## 七、浏览器验收重点

### 抽一张

打开：

```text
https://bubu-tarot.com/notes
```

检查：

1. Tips 横幅能“换一个”，连续点击不应很快重复；
2. 韦特牌扇弧度明显，两端自然裁切，不再把 78 张硬挤满；
3. 抽牌后：图片在上、牌名在下，牌面没有中文覆盖；
4. “你知道吗？”默认被深色 / 模糊层遮挡，点击后揭开；
5. 同一轮继续抽牌不会重复；
6. 点“洗牌”后能收拢、顺时针洗散、重新摊开；
7. 雷诺曼切换后是 B. Dondorf 36 张独立牌面；
8. 手机端不要求看见 78 张全牌，而是近距离扇面窗口；
9. 牌阵小册可切换 6 个牌阵，点击牌位能查看说明。

### 后台

打开：

```text
https://bubu-tarot.com/studio-85810eea57bc0ee6
```

检查新区域：

- `09 / TIPS`：新增 / 删除 / 隐藏 / 编辑；
- `10 / CARD DETAILS`：按牌搜索，新增 / 删除“你知道吗？”；
- `11 / SPREAD NOTES`：新增 / 删除 / 编辑牌阵。

## 八、出错时不要做什么

不要运行：

```text
docker system prune
rm -rf /root/bubu-tarot-site
rm -rf /root/bubu-tarot-site/vps/data
```

如果没有出现 `Update complete.`，把失败位置往上约 50–100 行终端输出发给 ChatGPT，再针对真实错误处理。
