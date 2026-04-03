# 任务协调 (Coordinator) 模块详解

> OpenClaw 任务协调系统，用于管理多任务并行/串行执行

---

## 1. 概述

TaskCoordinator 提供任务创建、执行、取消、监控功能，支持：
- 并行执行
- 串行队列执行
- 任务依赖管理
- 优先级调度

---

## 2. 核心类型

### 2.1 任务定义

```typescript
interface Task {
  id: string;              // 唯一 ID
  name: string;            // 任务名称
  description?: string;    // 描述
  status: TaskStatus;      // 状态
  priority: TaskPriority;  // 优先级
  input: any;              // 输入数据
  result?: any;            // 执行结果
  error?: string;          // 错误信息
  createdAt: number;       // 创建时间
  updatedAt: number;       // 更新时间
  dependencies: string[];  // 依赖任务 ID
}

type TaskStatus = 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';
type TaskPriority = 'low' | 'normal' | 'high' | 'urgent';
```

### 2.2 执行结果

```typescript
interface TaskResult {
  success: boolean;
  data?: any;
  error?: string;
  duration: number;  // 执行耗时 (ms)
}
```

---

## 3. 基本使用

### 3.1 创建协调器

```typescript
import { TaskCoordinator } from '@openclaw/coordinator';

// 默认最多 3 个并发任务
const coordinator = new TaskCoordinator();

// 或指定并发数
const coordinator = new TaskCoordinator(5);
```

### 3.2 创建任务

```typescript
const task = coordinator.create({
  name: 'build-project',
  description: '构建项目',
  priority: 'high',
  input: { project: 'my-app' },
  dependencies: []  // 依赖的任务 ID
});
```

### 3.3 执行任务

```typescript
const result = await coordinator.execute(task.id, async (task) => {
  // 执行逻辑
  const output = await buildProject(task.input.project);
  
  return {
    success: true,
    data: { output }
  };
});
```

---

## 4. 执行模式

### 4.1 单任务执行

```typescript
const taskId = coordinator.create({
  name: 'deploy',
  input: { env: 'prod' }
});

const result = await coordinator.execute(taskId, async (task) => {
  return await deploy(task.input);
});
```

### 4.2 并行执行

```typescript
// 创建多个任务
const taskIds = [
  coordinator.create({ name: 'task1', priority: 'normal', input: {} }).id,
  coordinator.create({ name: 'task2', priority: 'high', input: {} }).id,
  coordinator.create({ name: 'task3', priority: 'low', input: {} }).id,
];

// 并行执行（按优先级排序）
const results = await coordinator.executeParallel(taskIds, async (task) => {
  return await processTask(task);
});
```

### 4.3 串行队列执行

```typescript
// 创建任务队列
coordinator.create({ name: 'step1', priority: 'normal', input: {} });
coordinator.create({ name: 'step2', priority: 'normal', input: {} });
coordinator.create({ name: 'step3', priority: 'normal', input: {} });

// 按顺序执行
const results = await coordinator.executeQueue(async (task) => {
  return await runStep(task);
});
```

---

## 5. 任务管理

### 5.1 取消任务

```typescript
const cancelled = coordinator.cancel(taskId);
if (cancelled) {
  console.log('任务已取消');
}
```

### 5.2 查询任务

```typescript
// 获取单个任务
const task = coordinator.getTask(taskId);

// 获取所有任务
const allTasks = coordinator.getAllTasks();

// 获取待执行任务
const pendingTasks = coordinator.getPendingTasks();

// 获取运行中的任务
const runningTasks = coordinator.getRunningTasks();
```

### 5.3 统计信息

```typescript
const stats = coordinator.getStats();
console.log(stats);
// {
//   total: 10,
//   pending: 5,
//   running: 2,
//   completed: 2,
//   failed: 1,
//   cancelled: 0
// }
```

---

## 6. 事件监听

```typescript
const coordinator = new TaskCoordinator();

// 任务创建
coordinator.on('task:created', (task) => {
  console.log(`任务创建: ${task.name}`);
});

// 任务开始
coordinator.on('task:started', (task) => {
  console.log(`任务开始: ${task.name}`);
});

// 任务完成
coordinator.on('task:completed', (task) => {
  console.log(`任务完成: ${task.name}, 结果:`, task.result);
});

// 任务失败
coordinator.on('task:failed', (task) => {
  console.log(`任务失败: ${task.name}, 错误: ${task.error}`);
});

// 任务取消
coordinator.on('task:cancelled', (task) => {
  console.log(`任务取消: ${task.name}`);
});
```

---

## 7. 依赖管理

### 7.1 任务依赖

```typescript
// 创建依赖链
const task1 = coordinator.create({ name: 'install', input: {} });
const task2 = coordinator.create({ 
  name: 'build', 
  dependencies: [task1.id]  // 依赖 task1
});
const task3 = coordinator.create({ 
  name: 'deploy', 
  dependencies: [task2.id]  // 依赖 task2
});

// 执行时会自动检查依赖
// 如果依赖未完成，会抛出错误
```

### 7.2 完整示例

```typescript
async function deployPipeline() {
  const coordinator = new TaskCoordinator(3);
  
  // 创建部署流水线
  const install = coordinator.create({
    name: 'npm-install',
    priority: 'high',
    input: { project: 'app' }
  });
  
  const build = coordinator.create({
    name: 'npm-build',
    priority: 'high',
    input: { project: 'app' },
    dependencies: [install.id]
  });
  
  const test = coordinator.create({
    name: 'run-tests',
    priority: 'high',
    input: { project: 'app' },
    dependencies: [build.id]
  });
  
  const deploy = coordinator.create({
    name: 'deploy-prod',
    priority: 'urgent',
    input: { env: 'prod' },
    dependencies: [test.id]
  });
  
  // 执行队列
  const results = await coordinator.executeQueue(async (task) => {
    switch (task.name) {
      case 'npm-install':
        return await runCommand('npm install');
      case 'npm-build':
        return await runCommand('npm run build');
      case 'run-tests':
        return await runCommand('npm test');
      case 'deploy-prod':
        return await deployToProd(task.input.env);
    }
  });
  
  return results;
}
```

---

## 8. 与状态管理集成

```typescript
import { AppStateStore } from '@openclaw/state';
import { TaskCoordinator } from '@openclaw/coordinator';

// 创建状态存储
const store = new AppStateStore();

// 创建协调器
const coordinator = new TaskCoordinator();

// 监听任务变更并同步到状态
coordinator.on('task:created', (task) => {
  const state = store.getState();
  store.setState({
    tasks: [...state.tasks, task]
  });
});

coordinator.on('task:completed', (task) => {
  const state = store.getState();
  const tasks = state.tasks.map(t => 
    t.id === task.id ? task : t
  );
  store.setState({ tasks });
});
```

---

## 9. 错误处理

```typescript
try {
  const result = await coordinator.execute(taskId, async (task) => {
    // 可能失败的操作
    if (Math.random() > 0.9) {
      throw new Error('Random failure');
    }
    return { success: true, data: { output: 'done' } };
  });
  
  console.log('执行结果:', result);
} catch (error) {
  console.error('执行出错:', error.message);
}

// 检查任务状态
const task = coordinator.getTask(taskId);
console.log('任务状态:', task.status);
console.log('错误信息:', task.error);
```

---

## 10. 配置选项

| 选项 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| maxConcurrent | number | 3 | 最大并发任务数 |

---

## 11. 最佳实践

### 11.1 批量任务处理

```typescript
async function processBatch(items: any[]) {
  const coordinator = new TaskCoordinator(5); // 5 个并发
  
  const tasks = items.map((item, index) => 
    coordinator.create({
      name: `process-${index}`,
      priority: 'normal',
      input: item
    })
  );
  
  const results = await coordinator.executeParallel(
    tasks.map(t => t.id),
    async (task) => await processItem(task.input)
  );
  
  return results;
}
```

### 11.2 进度跟踪

```typescript
const coordinator = new TaskCoordinator();

coordinator.on('task:completed', () => {
  const stats = coordinator.getStats();
  console.log(`进度: ${stats.completed}/${stats.total}`);
});

coordinator.on('task:failed', () => {
  const stats = coordinator.getStats();
  console.log(`失败: ${stats.failed}/${stats.total}`);
});
```
