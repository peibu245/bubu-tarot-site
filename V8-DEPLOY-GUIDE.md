# 不不tarot V8 · FinalShell 更新步骤

> 适用于已经成功运行 V7 audited 的服务器。

1. 把 `bubu-tarot-vps-v8-contact-center.tar.gz` 上传到 `/root/`。

2. 验证文件存在：

```bash
ls -lh /root/bubu-tarot-vps-v8-contact-center.tar.gz
```

3. 给当前网站做整站备份：

```bash
tar -C /root -czf "/root/bubu-tarot-site-before-v8-$(date +%Y%m%d_%H%M%S).tar.gz" bubu-tarot-site
```

4. 确认 `.env` 和数据目录还在：

```bash
test -f /root/bubu-tarot-site/vps/.env && echo ".env：OK"
test -d /root/bubu-tarot-site/vps/data && echo "data：OK"
grep '^PUBLIC_ORIGIN=' /root/bubu-tarot-site/vps/.env
```

5. 覆盖新版代码（不要删除旧目录）：

```bash
tar -xzf /root/bubu-tarot-vps-v8-contact-center.tar.gz -C /root/bubu-tarot-site
```

6. 正式更新：

```bash
cd /root/bubu-tarot-site
chmod +x vps/update-existing-server.sh
./vps/update-existing-server.sh
```

看到 `Update complete.` 后再继续。

7. 检查容器：

```bash
docker compose -f /root/bubu-tarot-site/vps/docker-compose.yml ps
docker logs --tail=100 bubu-tarot
```

8. 浏览器验收：

- 打开 `/booking`，完成预约须知确认。
- 确认微信、闲鱼、QQ、小红书、抖音 5 个入口出现。
- 每个入口都测试“复制账号”。
- 闲鱼、小红书测试“打开平台”。
- 五个平台分别测试“显示二维码”。
- 手机端至少测试一次“保存二维码”。
- 后台上传一张测试二维码（可以不保存发布），确认预览正常。

如 Docker build 或 healthcheck 出错，不要删除 `/root/bubu-tarot-site` 或 `vps/data`；保留终端错误并交给 ChatGPT 排查。
