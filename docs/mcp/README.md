# MCP Plugin

> MCP (Model Context Protocol) 协议支持

## 概述

提供 MCP 服务器连接和管理能力，支持调用外部 AI 工具。

## 功能

- 添加/移除 MCP 服务器
- 列出已连接的服务器和可用工具
- 调用 MCP 工具
- SSE/STDIO/HTTP 连接方式

## 配置

```yaml
plugins:
  allow:
    - mcp

mcp:
  enabled: true
  servers: []
```

## 使用方法

### 添加 MCP 服务器

```
mcp add <name> <type> [options]
```

示例：
```
# STDIO 模式
mcp add filesystem stdio --command "npx" --args ["-y", "@modelcontextprotocol/server-filesystem", "/workspace"]

# SSE 模式  
mcp add my-server sse --url "http://localhost:3000/mcp"
```

### 列出服务器

```
mcp list
```

### 调用工具

```typescript
const mcp = new McpPlugin();
await mcp.callMcpTool('server-name', 'tool-name', { arg1: 'value' });
```

## Agent 集成

```typescript
import { McpPlugin } from '@openclaw/mcp';

const mcp = new McpPlugin();

// 在 Agent 中调用 MCP 工具
async function handleMcpRequest(server: string, tool: string, args: any) {
  return await mcp.callMcpTool(server, tool, args);
}
```
