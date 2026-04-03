/**
 * State Management for OpenClaw
 * 参考 Claude Code AppState 设计
 */

import { EventEmitter } from 'events';
import type { PermissionMode, PermissionRule } from '../permissions/src/permissions.js';

// ============ 状态类型 ============

export interface AppState {
  // 对话状态
  messages: Message[];
  conversationHistory: Message[];
  
  // 工具状态
  toolPermissionContext: ToolPermissionContext;
  isToolInProgress: boolean;
  
  // MCP 状态
  mcpServers: Record<string, MCPServerConfig>;
  
  // 任务状态
  tasks: Task[];
  activeTask: Task | null;
  
  // 设置
  settings: AppSettings;
}

export interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: number;
  tools?: ToolUse[];
}

export interface ToolUse {
  id: string;
  name: string;
  input: Record<string, any>;
  result?: string;
}

export interface Task {
  id: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  result?: any;
  error?: string;
}

export interface AppSettings {
  model: string;
  temperature: number;
  maxTokens: number;
  permissions: PermissionSettings;
}

export interface PermissionSettings {
  mode: PermissionMode;
  rules: PermissionRule[];
}

export interface MCPServerConfig {
  name: string;
  type: 'stdio' | 'sse' | 'http';
  command?: string;
  args?: string[];
  url?: string;
}

export interface ToolPermissionContext {
  permissionMode: PermissionMode;
  pendingPermission?: {
    tool: string;
    input: any;
    expiresAt: number;
  };
  rules: PermissionRule[];
}

// ============ 状态存储 ============

export class AppStateStore extends EventEmitter {
  private state: AppState;
  private listeners: Set<(state: AppState) => void> = new Set();

  constructor(initialState?: Partial<AppState>) {
    super();
    this.state = this.getDefaultState();
    if (initialState) {
      this.state = { ...this.state, ...initialState };
    }
  }

  private getDefaultState(): AppState {
    return {
      messages: [],
      conversationHistory: [],
      toolPermissionContext: {
        permissionMode: 'auto',
        rules: [],
      },
      isToolInProgress: false,
      mcpServers: {},
      tasks: [],
      activeTask: null,
      settings: {
        model: 'claude-sonnet-4-20250514',
        temperature: 1,
        maxTokens: 8192,
        permissions: {
          mode: 'auto',
          rules: [],
        },
      },
    };
  }

  getState(): AppState {
    return { ...this.state };
  }

  setState(partial: Partial<AppState>): void {
    const oldState = { ...this.state };
    this.state = { ...this.state, ...partial };
    this.emit('change', this.state, oldState);
    this.notifyListeners();
  }

  subscribe(listener: (state: AppState) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notifyListeners(): void {
    for (const listener of this.listeners) {
      listener(this.state);
    }
  }

  // 便捷方法
  addMessage(message: Message): void {
    this.setState({
      messages: [...this.state.messages, message],
      conversationHistory: [...this.state.conversationHistory, message],
    });
  }

  setToolInProgress(inProgress: boolean): void {
    this.setState({ isToolInProgress: inProgress });
  }

  setPermissionMode(mode: PermissionMode): void {
    this.setState({
      toolPermissionContext: {
        ...this.state.toolPermissionContext,
        permissionMode: mode,
      },
    });
  }

  addMCPServer(name: string, config: MCPServerConfig): void {
    this.setState({
      mcpServers: {
        ...this.state.mcpServers,
        [name]: config,
      },
    });
  }

  removeMCPServer(name: string): void {
    const servers = { ...this.state.mcpServers };
    delete servers[name];
    this.setState({ mcpServers: servers });
  }
}

// ============ 默认状态 ============

export function getDefaultAppState(): AppState {
  return {
    messages: [],
    conversationHistory: [],
    toolPermissionContext: {
      permissionMode: 'auto',
      rules: [],
    },
    isToolInProgress: false,
    mcpServers: {},
    tasks: [],
    activeTask: null,
    settings: {
      model: 'claude-sonnet-4-20250514',
      temperature: 1,
      maxTokens: 8192,
      permissions: {
        mode: 'auto',
        rules: [],
      },
    },
  };
}

export { AppStateStore as store };
export type { AppState, Message, Task, AppSettings, MCPServerConfig, ToolPermissionContext };
