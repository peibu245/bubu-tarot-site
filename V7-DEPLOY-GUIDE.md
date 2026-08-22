# 不不tarot V7 审核版部署指南

适用场景：服务器上现有项目目录为 `/root/bubu-tarot-site`，使用 FinalShell 上传本审核版压缩包进行覆盖更新。

## 重要原则

- 不删除 `/root/bubu-tarot-site/vps/.env`。
- 不删除 `/root/bubu-tarot-site/vps/data/`。
- 不运行 `docker system prune`。
- 如果构建失败，先停止操作并保留终端报错；不要为了“重装”而删除数据目录。

## 1. 上传文件

在 FinalShell 文件面板中，把 `bubu-tarot-vps-v7-audited-20260819.tar.gz` 拖到服务器 `/root/` 目录。

## 2. 部署前检查与整站代码备份

```bash
cd /root
ls -lh /root/bubu-tarot-vps-v7-audited-20260819.tar.gz
ls -ld /root/bubu-tarot-site
test -f /root/bubu-tarot-site/vps/.env && echo ".env 存在：OK"
test -d /root/bubu-tarot-site/vps/data && echo "数据目录存在：OK"
tar -C /root -czf "/root/bubu-tarot-site-before-v7-$(date +%Y%m%d_%H%M%S).tar.gz" bubu-tarot-site
```

最后一条会生成一份部署前的整个项目备份。完成后再继续。

## 3. 解压审核版覆盖代码

```bash
mkdir -p /root/bubu-tarot-site
tar -xzf /root/bubu-tarot-vps-v7-audited-20260819.tar.gz -C /root/bubu-tarot-site
```

该发布包不包含 `vps/.env`，也不包含 `vps/data/`，因此正常覆盖不会替换现有密码、session secret、网站内容和留言数据。

## 4. 更新前再确认关键配置仍在

```bash
test -f /root/bubu-tarot-site/vps/.env && echo ".env 仍在：OK"
test -d /root/bubu-tarot-site/vps/data && echo "数据目录仍在：OK"
grep '^PUBLIC_ORIGIN=' /root/bubu-tarot-site/vps/.env
```

不要直接 `cat vps/.env`，避免把管理员密码和 session secret 显示在屏幕上。

## 5. 正式构建并启动

```bash
cd /root/bubu-tarot-site
chmod +x vps/update-existing-server.sh
./vps/update-existing-server.sh
```

更新脚本会先备份当前 `site-content.json`，检查 `.env` 的关键配置，再执行 Docker build、启动新容器并等待 healthcheck。

如果脚本显示 `Update complete.`，继续下一步。

## 6. 部署后服务器检查

```bash
docker compose -f /root/bubu-tarot-site/vps/docker-compose.yml ps
curl -I http://127.0.0.1:3001/
docker logs --tail=120 bubu-tarot
```

正常情况下容器状态应为 running/healthy，本机 3001 应返回 HTTP 响应。

## 7. 浏览器人工验收

依次检查：

- `https://bubu-tarot.com/`
- `https://bubu-tarot.com/dream`
- `https://bubu-tarot.com/reality`
- `https://bubu-tarot.com/booking`
- `https://bubu-tarot.com/notes`
- `https://bubu-tarot.com/policies`
- 后台：`https://bubu-tarot.com/studio-85810eea57bc0ee6`

后台重点验收：实时预览显示“已连接”；改一个无关紧要的标点观察右侧草稿；保存一次后历史版本新增；恢复上一版；打开联系须知弹窗确认弹窗文字也能实时映射；在模块编辑器拖动一个测试模块；小科普随机点击多张牌确认 78 张牌扇正常。

## 发生错误时

### A. `docker compose ... build` 失败

不要删除任何文件或数据。因为脚本还没有执行到 `up -d`，通常旧容器仍在运行。把终端最后约 100 行错误发给 ChatGPT 分析。

### B. 新容器显示 unhealthy

执行：

```bash
docker logs --tail=200 bubu-tarot
```

把输出发给 ChatGPT。不要运行 `docker system prune`，不要删除 `vps/data` 或 `.env`。

### C. 需要恢复部署前代码

先不要自行覆盖数据。找到 `/root/bubu-tarot-site-before-v7-时间戳.tar.gz` 这份整站备份，并把当前报错发给 ChatGPT，根据实际状态决定只恢复代码还是同时处理内容文件。
