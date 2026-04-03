# 飞书通道能力详解

> OpenClaw 飞书机器人完整能力介绍

---

## 1. 快速开始

### 配置

```yaml
channels:
  feishu:
    enabled: true
    connectionMode: "websocket"  # 无公网域名时使用 WebSocket
    accounts:
      main:
        appId: "cli_xxx"
        appSecret: "xxx"
```

### 连接模式

| 模式 | 说明 | 适用场景 |
|------|------|----------|
| `websocket` | 长连接，无需公网域名 | 本地部署/内网 |
| `webhook` | 需要公网域名 | 有公网 IP/VPS |

---

## 2. 支持的消息类型

### 接收消息

- ✅ 文本消息
- ✅ 富文本 (post)
- ✅ 图片
- ✅ 文件
- ✅ 音频
- ✅ 视频
- ✅ 表情包

### 发送消息

- ✅ 文本
- ✅ 图片
- ✅ 文件
- ✅ 音频
- ✅ 视频
- ✅ 交互卡片 (Interactive Cards)
- ✅ 富文本

---

## 3. 可用的工具 (Tools)

OpenClaw 提供以下飞书 API 工具：

### 3.1 文档操作 (feishu_doc)

```typescript
// 可用操作
feishu_doc.read        // 读取文档
feishu_doc.write       // 写入文档
feishu_doc.append      // 追加内容
feishu_doc.insert      // 插入内容
feishu_doc.create      // 创建文档
feishu_doc.list_blocks // 列出文档块
feishu_doc.get_block   // 获取文档块
feishu_doc.update_block // 更新文档块
feishu_doc.delete_block // 删除文档块
feishu_doc.create_table // 创建表格
feishu_doc.write_table_cells // 写表格单元格
feishu_doc.create_table_with_values // 创建带值的表格
feishu_doc.insert_table_row // 插入表格行
feishu_doc.insert_table_column // 插入表格列
feishu_doc.delete_table_rows // 删除表格行
feishu_doc.delete_table_columns // 删除表格列
feishu_doc.merge_table_cells // 合并表格单元格
feishu_doc.upload_image // 上传图片
feishu_doc.upload_file  // 上传文件
feishu_doc.color_text  // 彩色文本
```

### 3.2 云盘操作 (feishu_drive)

```typescript
// 可用操作
feishu_drive.list         // 列出文件
feishu_drive.info         // 文件信息
feishu_drive.create_folder // 创建文件夹
feishu_drive.move         // 移动文件
feishu_drive.delete       // 删除文件
feishu_drive.list_comments     // 列出评论
feishu_drive.list_comment_replies // 列出评论回复
feishu_drive.add_comment      // 添加评论
feishu_drive.reply_comment    // 回复评论
```

### 3.3 知识库操作 (feishu_wiki)

```typescript
// 可用操作
feishu_wiki.spaces   // 列出知识库空间
feishu_wiki.nodes    // 列出知识库节点
feishu_wiki.get      // 获取知识库内容
feishu_wiki.search  // 搜索知识库
feishu_wiki.create  // 创建知识库节点
feishu_wiki.move    // 移动知识库节点
feishu_wiki.rename  // 重命名知识库节点
```

### 3.4 表格操作 (feishu_bitable)

```typescript
// 可用操作
feishu_bitable_get_meta      // 解析 Bitable URL
feishu_bitable_list_fields   // 列出字段
feishu_bitable_list_records  // 列出记录
feishu_bitable_get_record    // 获取单条记录
feishu_bitable_create_record // 创建记录
feishu_bitable_update_record // 更新记录
feishu_bitable_create_field  // 创建字段
feishu_bitable_create_app    // 创建 Bitable 应用
```

### 3.5 聊天操作 (feishu_chat)

```typescript
// 可用操作
feishu_chat.members     // 列出成员
feishu_chat.info        // 聊天信息
feishu_chat.member_info // 成员信息
```

---

## 4. 运行时动作 (Runtime Actions)

飞书支持以下运行时动作：

| Action | 说明 |
|--------|------|
| `send` | 发送消息 |
| `read` | 读取消息 |
| `edit` | 编辑消息 |
| `thread-reply` | 线程回复 |
| `pin` | 置顶消息 |
| `list-pins` | 列出置顶 |
| `unpin` | 取消置顶 |
| `member-info` | 成员信息 |
| `channel-info` | 频道信息 |
| `channel-list` | 频道列表 |
| `react` | 添加反应 |
| `reactions` | 查看反应 |

---

## 5. 访问控制

### 5.1 私信 (DM)

| 模式 | 说明 |
|------|------|
| `pairing` | 默认，需配对码授权 |
| `allowlist` | 仅白名单用户 |
| `open` | 开放所有用户 |
| `disabled` | 禁用私信 |

```yaml
channels:
  feishu:
    dmPolicy: "pairing"
    allowFrom:  # 白名单
      - "ou_xxx"
```

### 5.2 群聊

```yaml
channels:
  feishu:
    groupPolicy: "allowlist"  # open/allowlist/disabled
    groupAllowFrom:           # 允许的群 ID
      - "oc_xxx"
    requireMention: true     # 是否需要 @机器人
```

---

## 6. 高级配置

### 6.1 多账户

```yaml
channels:
  feishu:
    defaultAccount: "main"
    accounts:
      main:
        appId: "cli_xxx"
        appSecret: "xxx"
      backup:
        appId: "cli_yyy"
        appSecret: "yyy"
        enabled: false
```

### 6.2 流式输出

```yaml
channels:
  feishu:
    streaming: true        # 启用流式卡片输出
    blockStreaming: true   # 启用块级流式输出
```

### 6.3 ACP 持久会话

```yaml
agents:
  list:
    - id: "codex"
      runtime:
        type: "acp"
        acp:
          agent: "codex"
          backend: "acpx"
          mode: "persistent"

bindings:
  - type: "acp"
    agentId: "codex"
    match:
      channel: "feishu"
      peer: { kind: "direct", id: "ou_xxx" }
```

---

## 7. 常用命令

| 命令 | 说明 |
|------|------|
| `/status` | 显示机器人状态 |
| `/reset` | 重置会话 |
| `/model` | 显示/切换模型 |
| `/acp spawn` | 启动 ACP 会话 |

---

## 8. 故障排查

### 机器人不响应

1. 检查群聊是否已添加机器人
2. 检查是否 @了机器人
3. 检查 `groupPolicy` 配置
4. 查看日志：`openclaw logs --follow`

### 机器人接收不到消息

1. 确保应用已发布并通过审核
2. 确保事件订阅包含 `im.message.receive_v1`
3. 确保开启长连接
4. 确保应用权限完整
5. 确保 Gateway 正在运行

---

## 9. API 工具使用示例

### 9.1 创建飞书文档

```typescript
feishu_doc.create({
  action: "create",
  obj_type: "docx",
  title: "我的文档",
  folder_token: "xxx"  // 可选
})
```

### 9.2 写入云盘文件

```typescript
feishu_drive.create_folder({
  action: "create_folder",
  folder_token: "根目录",
  name: "新文件夹"
})
```

### 9.3 操作 Bitable

```typescript
// 获取表格元数据
feishu_bitable_get_meta({
  url: "/base/xxx?table=yyy"
})

// 列出记录
feishu_bitable_list_records({
  app_token: "xxx",
  table_id: "yyy"
})
```
