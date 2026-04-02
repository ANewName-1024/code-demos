# Permissions Plugin

> OpenClaw 权限控制系统

## 概述

提供四种权限模式，支持精细化的命令控制。

## 权限模式

| 模式 | 说明 | 行为 |
|------|------|------|
| `auto` | AI 自动决策 | 根据内置安全规则自动判断 |
| `ask` | 询问用户 | 需要用户确认才执行 |
| `deny` | 默认拒绝 | 所有命令默认拒绝 |
| `allow` | 默认允许 | 所有命令默认允许 |

## 配置

```yaml
plugins:
  allow:
    - permissions

permissions:
  mode: auto
  rules:
    - pattern: "ls *"
      action: allow
    - pattern: "cat *"
      action: allow
    - pattern: "rm -rf *"
      action: deny
```

## 规则语法

- `*` - 匹配任意字符
- `?` - 匹配单个字符

示例：
```yaml
rules:
  # 只读命令允许
  - pattern: "ls *"
    action: allow
  - pattern: "cat *"
    action: allow
  
  # 危险命令拒绝
  - pattern: "rm -rf *"
    action: deny
  - pattern: "dd *"
    action: deny
  
  # 特定路径保护
  - pattern: "/etc/*"
    action: deny
```

## Agent 集成

```typescript
import { PermissionManager, PermissionMode } from '@openclaw/permissions';

const pm = new PermissionManager();

// 设置模式
pm.setDefaultMode(PermissionMode.AUTO);

// 检查权限
const result = await pm.checkPermission('Bash', { command: 'ls -la' }, context);

if (result.result === 'allowed') {
  // 执行命令
} else if (result.result === 'denied') {
  console.log('拒绝:', result.reason);
} else {
  // 询问用户
}
```

## 安全特性

### 内置黑名单
- `rm -rf` - 递归删除
- `dd` - 磁盘操作
- `mkfs` - 格式化
- `:(){ :|:& };:` - Fork bomb
- `curl.*|sh` - 管道执行

### 内置白名单
- `ls`, `cat`, `pwd`
- `git status`, `git log`, `git diff`
- `grep`, `find`, `head`, `tail`
