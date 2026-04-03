/**
 * Task Coordinator for OpenClaw
 * 参考 Claude Code Coordinator 设计
 */

import { EventEmitter } from 'events';

// ============ 任务类型 ============

export interface Task {
  id: string;
  name: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  input: any;
  result?: any;
  error?: string;
  createdAt: number;
  updatedAt: number;
  dependencies: string[];
}

export type TaskStatus = 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';
export type TaskPriority = 'low' | 'normal' | 'high' | 'urgent';

export interface TaskResult {
  success: boolean;
  data?: any;
  error?: string;
  duration: number;
}

// ============ 任务协调器 ============

export class TaskCoordinator extends EventEmitter {
  private tasks: Map<string, Task> = new Map();
  private runningTasks: Set<string> = new Set();
  private taskQueue: string[] = [];
  private maxConcurrent: number = 3;

  constructor(maxConcurrent?: number) {
    super();
    if (maxConcurrent) {
      this.maxConcurrent = maxConcurrent;
    }
  }

  // 创建任务
  create(task: Omit<Task, 'id' | 'status' | 'createdAt' | 'updatedAt'>): Task {
    const newTask: Task = {
      ...task,
      id: this.generateId(),
      status: 'pending',
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    
    this.tasks.set(newTask.id, newTask);
    this.taskQueue.push(newTask.id);
    this.emit('task:created', newTask);
    
    return newTask;
  }

  // 执行任务
  async execute(
    taskId: string,
    executor: (task: Task) => Promise<TaskResult>
  ): Promise<TaskResult> {
    const task = this.tasks.get(taskId);
    if (!task) {
      throw new Error(`Task not found: ${taskId}`);
    }

    // 检查依赖
    for (const depId of task.dependencies) {
      const depTask = this.tasks.get(depId);
      if (depTask && depTask.status !== 'completed') {
        throw new Error(`Dependency not met: ${depId}`);
      }
    }

    // 更新状态
    task.status = 'running';
    task.updatedAt = Date.now();
    this.runningTasks.add(taskId);
    this.emit('task:started', task);

    const startTime = Date.now();
    
    try {
      const result = await executor(task);
      
      task.status = result.success ? 'completed' : 'failed';
      task.result = result.data;
      task.error = result.error;
      task.updatedAt = Date.now();
      
      this.runningTasks.delete(taskId);
      this.emit('task:completed', task);
      
      return {
        ...result,
        duration: Date.now() - startTime,
      };
    } catch (error: any) {
      task.status = 'failed';
      task.error = error.message;
      task.updatedAt = Date.now();
      
      this.runningTasks.delete(taskId);
      this.emit('task:failed', task);
      
      return {
        success: false,
        error: error.message,
        duration: Date.now() - startTime,
      };
    }
  }

  // 并行执行多个任务
  async executeParallel(
    taskIds: string[],
    executor: (task: Task) => Promise<TaskResult>
  ): Promise<TaskResult[]> {
    // 按优先级排序
    const sortedTasks = taskIds
      .map(id => this.tasks.get(id))
      .filter(Boolean)
      .sort((a, b) => {
        const priorityOrder = { urgent: 0, high: 1, normal: 2, low: 3 };
        return priorityOrder[a!.priority] - priorityOrder[b!.priority];
      });

    // 并发执行
    const promises = sortedTasks.map(task => 
      this.execute(task.id, executor)
    );
    
    return Promise.all(promises);
  }

  // 串行执行队列
  async executeQueue(
    executor: (task: Task) => Promise<TaskResult>
  ): Promise<TaskResult[]> {
    const results: TaskResult[] = [];
    
    while (this.taskQueue.length > 0) {
      const taskId = this.taskQueue.shift()!;
      const task = this.tasks.get(taskId);
      
      if (task && task.status === 'pending') {
        const result = await this.execute(taskId, executor);
        results.push(result);
      }
    }
    
    return results;
  }

  // 取消任务
  cancel(taskId: string): boolean {
    const task = this.tasks.get(taskId);
    if (!task || task.status === 'completed' || task.status === 'failed') {
      return false;
    }

    task.status = 'cancelled';
    task.updatedAt = Date.now();
    this.runningTasks.delete(taskId);
    this.taskQueue = this.taskQueue.filter(id => id !== taskId);
    this.emit('task:cancelled', task);
    
    return true;
  }

  // 获取任务
  getTask(taskId: string): Task | undefined {
    return this.tasks.get(taskId);
  }

  // 获取所有任务
  getAllTasks(): Task[] {
    return Array.from(this.tasks.values());
  }

  // 获取待执行任务
  getPendingTasks(): Task[] {
    return Array.from(this.tasks.values()).filter(t => t.status === 'pending');
  }

  // 获取运行中的任务
  getRunningTasks(): Task[] {
    return Array.from(this.runningTasks).map(id => this.tasks.get(id)).filter(Boolean) as Task[];
  }

  // 统计
  getStats(): TaskStats {
    const tasks = Array.from(this.tasks.values());
    return {
      total: tasks.length,
      pending: tasks.filter(t => t.status === 'pending').length,
      running: tasks.filter(t => t.status === 'running').length,
      completed: tasks.filter(t => t.status === 'completed').length,
      failed: tasks.filter(t => t.status === 'failed').length,
      cancelled: tasks.filter(t => t.status === 'cancelled').length,
    };
  }

  private generateId(): string {
    return `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

export interface TaskStats {
  total: number;
  pending: number;
  running: number;
  completed: number;
  failed: number;
  cancelled: number;
}
