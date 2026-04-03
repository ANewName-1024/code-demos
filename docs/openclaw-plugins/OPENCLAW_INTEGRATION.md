# OpenClaw 插件系统

> 完整集成的插件和能力

## 已集成模块

### 1. claude-code-tools (工具系统)

提供 6 个核心工具：

| 工具 | 功能 |
|------|------|
| Bash | Shell 命令执行 |
| Read | 文件读取 |
| Write | 文件写入 |
| Edit | 文件编辑 |
| Glob | 文件匹配 |
| Grep | 文本搜索 |

### 2. permissions (权限系统)

支持四种权限模式：

- **auto**: AI 自动决策
- **ask**: 询问用户
- **deny**: 默认拒绝
- **allow**: 默认允许

### 3. mcp (MCP 协议)

MCP 服务器连接管理，支持 STDIO/SSE/HTTP 三种连接方式。

### 4. state (状态管理)

参考 Claude Code AppState 设计：

```typescript
interface AppState {
  messages: Message[];
  toolPermissionContext: ToolPermissionContext;
  mcpServers: Record<string, MCPServerConfig>;
  tasks: Task[];
  settings: AppSettings;
}
```

### 5. commands (命令系统)

命令注册和执行系统：

```typescript
// 注册命令
registry.register({
  name: 'git:status',
  description: 'Show git status',
  execute: async (input, context) => {
    return { type: 'text', content: '...' };
  }
});

// 执行命令
const result = await executor.execute('git:status', {}, context);
```

### 6. coordinator (任务协调)

任务协调器，支持并行/串行执行：

```typescript
const coordinator = new TaskCoordinator();

// 创建任务
coordinator.create({
  name: 'build',
  priority: 'high',
  input: { project: 'my-app' }
});

// 并行执行
await coordinator.executeParallel(taskIds, executor);
```

## 配置

```yaml
plugins:
  allow:
    - claude-code-tools
    - mcp
    - permissions
    - state
    - commands
    - coordinator

tools:
  enabled:
    - Bash
    - Read
    - Write
    - Edit
    - Glob
    - Grep

permissions:
  mode: auto
  rules:
    - pattern: "ls *"
      action: allow
    - pattern: "rm -rf *"
      action: deny
```

## 使用示例

### 状态管理

```typescript
import { AppStateStore } from '@openclaw/state';

const store = new AppStateStore();

// 订阅状态变更
store.subscribe((state) => {
  console.log('State changed:', state);
});

// 设置状态
store.setState({ messages: [...state.messages, newMessage] });
```

### 命令执行

```typescript
import { CommandExecutor, globalCommandRegistry } from '@openclaw/commands';

const executor = new CommandExecutor(globalCommandRegistry);

const result = await executor.execute('git:status', {}, {
  cwd: '/workspace',
  userId: 'user1',
  sessionId: 'sess1'
});
```

### 任务协调

```typescript
import { TaskCoordinator } from '@openclaw/coordinator';

const coordinator = new TaskCoordinator(3); // 最多3个并发

const taskId = coordinator.create({
  name: 'deploy',
  priority: 'high',
  input: { env: 'prod' }
});

const result = await coordinator.execute(taskId, async (task) => {
  // 执行部署
  return { success: true, data: { url: 'https://...' } };
});
```
