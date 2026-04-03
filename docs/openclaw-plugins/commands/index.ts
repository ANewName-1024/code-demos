/**
 * Commands System for OpenClaw
 * 参考 Claude Code 命令系统设计
 */

import { z } from 'zod';

// ============ 命令类型 ============

export interface Command {
  name: string;
  description: string;
  usage: string;
  inputSchema: z.ZodType<any>;
  execute(input: any, context: CommandContext): Promise<CommandResult>;
}

export interface CommandContext {
  cwd: string;
  userId: string;
  sessionId: string;
}

export interface CommandResult {
  content: string;
  type: 'text' | 'error' | 'json';
  metadata?: Record<string, any>;
}

// ============ 命令注册表 ============

export class CommandRegistry {
  private commands: Map<string, Command> = new Map();

  register(command: Command): void {
    if (this.commands.has(command.name)) {
      console.warn(`Command ${command.name} already registered, overwriting`);
    }
    this.commands.set(command.name, command);
  }

  unregister(name: string): void {
    this.commands.delete(name);
  }

  get(name: string): Command | undefined {
    return this.commands.get(name);
  }

  getAll(): Command[] {
    return Array.from(this.commands.values());
  }

  getNames(): string[] {
    return Array.from(this.commands.keys());
  }

  has(name: string): boolean {
    return this.commands.has(name);
  }
}

// ============ 命令执行器 ============

export class CommandExecutor {
  private registry: CommandRegistry;

  constructor(registry: CommandRegistry) {
    this.registry = registry;
  }

  async execute(name: string, input: any, context: CommandContext): Promise<CommandResult> {
    const command = this.registry.get(name);
    
    if (!command) {
      return {
        type: 'error',
        content: `Command not found: ${name}`,
      };
    }

    try {
      // 验证输入
      const parsed = command.inputSchema.parse(input);
      
      // 执行命令
      return await command.execute(parsed, context);
    } catch (error: any) {
      return {
        type: 'error',
        content: error.message,
      };
    }
  }

  async executeMany(
    commands: Array<{ name: string; input: any }>,
    context: CommandContext
  ): Promise<CommandResult[]> {
    return Promise.all(
      commands.map(({ name, input }) => this.execute(name, input, context))
    );
  }
}

// ============ 常用命令 ============

// Git 命令
export const gitStatusCommand: Command = {
  name: 'git:status',
  description: 'Show git status',
  usage: 'git:status',
  inputSchema: z.object({}),
  async execute(_, context) {
    const { exec } = await import('child_process');
    const { promisify } = await import('util');
    const execAsync = promisify(exec);
    
    try {
      const { stdout } = await execAsync('git status --short', { cwd: context.cwd });
      return { type: 'text', content: stdout || 'No changes' };
    } catch (error: any) {
      return { type: 'error', content: error.message };
    }
  },
};

export const gitLogCommand: Command = {
  name: 'git:log',
  description: 'Show recent commits',
  usage: 'git:log [limit]',
  inputSchema: z.object({
    limit: z.number().default(10),
  }),
  async execute({ limit }, context) {
    const { exec } = await import('child_process');
    const { promisify } = await import('util');
    const execAsync = promisify(exec);
    
    try {
      const { stdout } = await execAsync(`git log --oneline -n ${limit}`, { cwd: context.cwd });
      return { type: 'text', content: stdout };
    } catch (error: any) {
      return { type: 'error', content: error.message };
    }
  },
};

// 文件操作命令
export const listFilesCommand: Command = {
  name: 'ls',
  description: 'List files in directory',
  usage: 'ls [path]',
  inputSchema: z.object({
    path: z.string().default('.'),
    all: z.boolean().default(false),
  }),
  async execute({ path, all }, context) {
    const { readdir } = await import('fs/promises');
    const { join } = await import('path');
    
    try {
      const files = await readdir(join(context.cwd, path), { withFileTypes: true });
      const output = files
        .filter(f => all || !f.name.startsWith('.'))
        .map(f => `${f.isDirectory() ? 'd' : '-'}${f.name}`)
        .join('\n');
      return { type: 'text', content: output };
    } catch (error: any) {
      return { type: 'error', content: error.message };
    }
  },
};

// ============ 默认命令集 ============

export function getDefaultCommands(): Command[] {
  return [
    gitStatusCommand,
    gitLogCommand,
    listFilesCommand,
  ];
}

// ============ 全局实例 ============

export const globalCommandRegistry = new CommandRegistry();

// 注册默认命令
for (const cmd of getDefaultCommands()) {
  globalCommandRegistry.register(cmd);
}
