# Claude Code Tools 插件

> Claude Code 核心工具能力集成到 OpenClaw

## 概述

本插件提供 Claude Code 的核心工具能力，包含 6 个基础工具：
- **Bash** - Shell 命令执行
- **Read** - 文件读取
- **Write** - 文件写入
- **Edit** - 文件编辑
- **Glob** - 文件匹配
- **Grep** - 文本搜索

## 快速开始

### 1. 启用插件

在 `config.yaml` 中添加：

```yaml
plugins:
  allow:
    - claude-code-tools

tools:
  enabled:
    - Bash
    - Read
    - Write
    - Edit
    - Glob
    - Grep
```

### 2. 权限配置

```yaml
permissions:
  mode: auto  # 自动执行，无需询问
  rules:
    - pattern: "ls *"
      action: allow
    - pattern: "cat *"
      action: allow
    - pattern: "rm -rf *"
      action: deny
```

## 工具详细说明

### Bash

执行 Shell 命令

**输入参数：**
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| command | string | 是 | 要执行的命令 |
| directory | string | 否 | 工作目录 |
| timeout_ms | number | 否 | 超时时间(毫秒)，默认 30000 |
| run_in_background | boolean | 否 | 后台运行 |

**示例：**
```
Bash: ls -la /workspace
Bash: pwd
Bash: npm install
```

**安全检查：**
- 自动拦截危险命令：`rm -rf /`、`dd`、`mkfs`、fork bomb
- 超时自动终止

---

### Read

读取文件内容

**输入参数：**
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| file_path | string | 是 | 文件路径 |
| offset | number | 否 | 起始行号 |
| limit | number | 否 | 读取行数 |
| show_line_numbers | boolean | 否 | 显示行号 |

**示例：**
```
Read: /workspace/README.md
Read: /workspace/src/index.ts limit=50
Read: /workspace/config.json offset=100 limit=20 show_line_numbers=true
```

---

### Write

写入文件内容

**输入参数：**
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| file_path | string | 是 | 文件路径 |
| content | string | 是 | 内容 |
| append | boolean | 否 | 是否追加，默认 false |

**示例：**
```
Write: /workspace/test.txt content="Hello World"
Write: /workspace/log.txt content="new line" append=true
```

---

### Edit

编辑文件内容

**输入参数：**
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| file_path | string | 是 | 文件路径 |
| old_string | string | 是 | 要替换的内容 |
| new_string | string | 是 | 替换后的内容 |
| partial | boolean | 否 | 允许部分匹配 |

**示例：**
```
Edit: /workspace/index.ts old_string="old value" new_string="new value"
```

---

### Glob

文件匹配

**输入参数：**
| 参数 |类型 | 必填 | 说明 |
|------|------|------|------|
| pattern | string | 是 | Glob 模式 |
| path | string | 否 | 搜索路径 |
| ignore | string[] | 否 | 忽略模式 |

**示例：**
```
Glob: **/*.ts
Glob: *.json path=/workspace
Glob: src/**/*.js ignore=["*.test.js"]
```

---

### Grep

文本搜索

**输入参数：**
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| pattern | string | 是 | 搜索模式 |
| path | string | 否 | 搜索路径 |
| include | string | 否 | 包含的文件类型 |
| exclude | string | 否 | 排除的文件类型 |
| context | number | 否 | 上下文行数 |

**示例：**
```
Grep: function
Grep: "TODO" include="*.ts"
Grep: import path=/workspace exclude="*.test.ts"
```

---

## Agent 集成

### 1. 在 Agent 中使用工具

```typescript
import { BashTool, FileReadTool, FileWriteTool } from '@openclaw/claude-code-tools';

// 创建工具实例
const bashTool = new BashTool();
const readTool = new FileReadTool();
const writeTool = new FileWriteTool();

// 在 Agent 中调用
async function handleAgentRequest(input: string) {
  if (input.startsWith('执行命令:')) {
    const command = input.replace('执行命令:', '').trim();
    return await bashTool.execute({ command }, context);
  }
  
  if (input.startsWith('读取文件:')) {
    const filePath = input.replace('读取文件:', '').trim();
    return await readTool.execute({ file_path: filePath }, context);
  }
}
```

### 2. 注册到 Agent 系统

```typescript
// 在 agent 配置中注册工具
const agentConfig = {
  tools: [
    { name: 'Bash', handler: bashTool, enabled: true },
    { name: 'Read', handler: readTool, enabled: true },
    { name: 'Write', handler: writeTool, enabled: true },
    { name: 'Edit', handler: editTool, enabled: true },
    { name: 'Glob', handler: globTool, enabled: true },
    { name: 'Grep', handler: grepTool, enabled: true },
  ]
};
```

### 3. 权限控制

```typescript
// 自定义权限检查
class CustomBashTool extends BashTool {
  async checkPermissions(input: BashInput, context: ToolContext): Promise<PermissionResult> {
    // 检查用户权限
    if (context.userId === 'admin') {
      return { result: 'allowed' };
    }
    
    // 检查命令模式
    const dangerousPatterns = [/^rm\s+-rf/, /^dd\s+/];
    for (const pattern of dangerousPatterns) {
      if (pattern.test(input.command)) {
        return { result: 'denied', reason: '危险命令已被禁止' };
      }
    }
    
    return { result: 'allowed' };
  }
}
```

---

## 测试

运行测试用例：

```bash
cd /root/.openclaw/extensions/claude-code-tools
npm install
npx tsx test.ts
```

测试覆盖：
- ✅ Bash 命令执行
- ✅ 安全检查 (危险命令拦截)
- ✅ 文件读写编辑
- ✅ Glob 模式匹配
- ✅ Grep 文本搜索
