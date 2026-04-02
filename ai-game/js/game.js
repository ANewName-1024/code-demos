// ===== 星际传奇 - 游戏逻辑 =====

// 游戏状态
const gameState = {
  started: false,
  player: {
    name: "星际旅者",
    hp: 100,
    maxHp: 100,
    energy: 100,
    maxEnergy: 100,
    exp: 0,
    level: 1,
    inventory: [],
    achievements: []
  },
  currentScene: "start",
  visitedLocations: new Set()
};

// 游戏场景数据
const scenes = {
  start: {
    text: [
      { type: "narrator", content: "2157年，地球。人类文明已经延伸至整个太阳系。" },
      { type: "narrator", content: "你是一名星际探险家，刚刚收到了一个神秘的任务——探索传说中的【赛博空间】。" },
      { type: "narrator", content: "那是一个游离于现实之外的数字世界，据说隐藏着人类文明的终极秘密。" },
      { type: "dialogue", content: "神秘人：\"年轻人，你准备好了吗？进入赛博空间，你将面对无数挑战...但也可能获得无上的力量。\"" }
    ],
    choices: [
      { text: "接受任务 - \"我准备好了\"", target: "accept_mission" },
      { text: "询问详情 - \"请告诉我更多\"", target: "ask_details" },
      { text: "拒绝任务 - \"我需要考虑\"", target: "reject_mission" }
    ]
  },
  
  accept_mission: {
    text: [
      { type: "system", content: "> 任务已接受" },
      { type: "dialogue", content: "神秘人：\"很好！这是进入赛博空间的钥匙...\"" },
      { type: "narrator", content: "他递给你一个闪烁着蓝色光芒的装置。" },
      { type: "item-get", content: "> 获得物品: 神经链接器" }
    ],
    action: () => {
      addItem("神经链接器");
      gameState.player.energy = 120;
      updateStats();
      addLog("你获得了神经链接器，能量+20！", "action");
      unlockAchievement("勇敢的第一步");
    },
    choices: [
      { text: "戴上装置，进入赛博空间", target: "cyber_space" }
    ]
  },
  
  ask_details: {
    text: [
      { type: "dialogue", content: "神秘人：\"赛博空间...是远古文明的遗迹。\"" },
      { type: "dialogue", content: "神秘人：\"那里充满了数字生命体、陷阱...以及宝藏。\"" },
      { type: "system", content: "> 提示：在赛博空间，你需要收集能量、躲避危险、寻找线索" }
    ],
    choices: [
      { text: "接受任务", target: "accept_mission" },
      { text: "还是算了", target: "reject_mission" }
    ]
  },
  
  reject_mission: {
    text: [
      { type: "dialogue", content: "神秘人：\"可惜...这个世界的命运，也许就掌握在敢于冒险的人手中。\"" },
      { type: "narrator", content: "神秘人转身离去，消失在人群中..." },
      { type: "system", content: "> 任务失败 - 游戏结束" }
    ],
    choices: [
      { text: "重新开始", target: "start" }
    ]
  },
  
  cyber_space: {
    text: [
      { type: "narrator", content: "你戴上了神经链接器，一道蓝光闪过，你的意识被传送到了赛博空间。" },
      { type: "narrator", content: "你发现自己身处一个由数据和代码构成的世界，四周漂浮着发光的数字方块。" },
      { type: "system", content: "> 欢迎来到赛博空间！输入指令探索这个世界" }
    ],
    choices: [
      { text: "探索周围", target: "explore_nearby" },
      { text: "检查背包", target: "check_inventory" },
      { text: "查看状态", target: "check_status" }
    ]
  },
  
  explore_nearby: {
    text: [
      { type: "narrator", content: "你发现前方有一个发光的蓝色数据块，里面似乎存储着什么..." },
      { type: "narrator", content: "突然，一个红色的警告标志出现了！" },
      { type: "danger", content: "警告：检测到数据病毒！防御系统启动！" }
    ],
    choices: [
      { text: "尝试获取数据块", target: "get_data" },
      { text: "快速躲避", target: "dodge_attack" },
      { text: "使用能量护盾", target: "use_shield" }
    ]
  },
  
  get_data: {
    text: [
      { type: "narrator", content: "你冲向数据块，手指触碰到的那一刻，大量信息涌入脑海..." },
      { type: "system", content: "> 获得重要线索：赛博空间的真相" },
      { type: "narrator", content: "但防御系统的攻击也击中了你！" },
      { type: "danger", content: "> 生命值 -30" }
    ],
    action: () => {
      gameState.player.hp = Math.max(0, gameState.player.hp - 30);
      gameState.player.exp += 50;
      updateStats();
      addLog("你受到了攻击！HP-30", "danger");
      checkLevelUp();
    },
    choices: [
      { text: "继续前进", target: "continue_exploring" }
    ]
  },
  
  dodge_attack: {
    text: [
      { type: "narrator", content: "你快速侧身，堪堪躲过了攻击！" },
      { type: "narrator", content: "数据块你已经到手了，虽然不完整但足够了。" },
      { type: "system", content: "> 获得数据碎片 +20 EXP" }
    ],
    action: () => {
      gameState.player.exp += 20;
      addItem("数据碎片");
      updateStats();
      addLog("获得数据碎片！", "action");
      checkLevelUp();
    },
    choices: [
      { text: "继续探索", target: "continue_exploring" }
    ]
  },
  
  use_shield: {
    text: [
      { type: "narrator", content: "你激活了能量护盾，蓝色光芒包裹全身！" },
      { type: "narrator", content: "攻击被护盾挡住，你安然无恙。" },
      { type: "narrator", content: "你趁机获取了完整的数据！+" },
      { type: "system", content: "> 获得完整数据 +50 EXP" }
    ],
    action: () => {
      gameState.player.energy -= 20;
      gameState.player.exp += 50;
      updateStats();
      addLog("护盾挡住了攻击！能量-20", "warning");
      checkLevelUp();
    },
    choices: [
      { text: "继续深入", target: "continue_exploring" }
    ]
  },
  
  check_inventory: {
    text: () => {
      const items = gameState.player.inventory;
      if (items.length === 0) {
        return [{ type: "system", content: "> 背包是空的" }];
      }
      return [
        { type: "system", content: "> 背包物品：" },
        ...items.map(item => ({ type: "item-get", content: "• " + item }))
      ];
    },
    choices: [
      { text: "继续探索", target: "cyber_space" }
    ]
  },
  
  check_status: {
    text: [
      { type: "system", content: "> 角色状态" },
      { type: "narrator", content: `姓名: ${gameState.player.name}` },
      { type: "narrator", content: `等级: ${gameState.player.level}` },
      { type: "narrator", content: `生命值: ${gameState.player.hp}/${gameState.player.maxHp}` },
      { type: "narrator", content: `能量值: ${gameState.player.energy}/${gameState.player.maxEnergy}` },
      { type: "narrator", content: `经验值: ${gameState.player.exp}` }
    ],
    choices: [
      { text: "返回", target: "cyber_space" }
    ]
  },
  
  continue_exploring: {
    text: [
      { type: "narrator", content: "你深入赛博空间核心区域..." },
      { type: "narrator", content: "突然，一个巨大的数字生命体出现在你面前！" },
      { type: "dialogue", content: "数字守卫：\"闯入者...你的意识将被格式化！\"" }
    ],
    choices: [
      { text: "战斗 - 全力攻击", target: "battle_attack" },
      { text: "谈判 - 尝试沟通", target: "battle_talk" },
      { text: "逃跑 - 撤离", target: "battle_run" }
    ]
  },
  
  battle_attack: {
    text: () => {
      const damage = Math.floor(Math.random() * 20) + 10;
      const exp = 100;
      gameState.player.hp = Math.max(0, gameState.player.hp - damage);
      gameState.player.exp += exp;
      updateStats();
      checkLevelUp();
      
      if (gameState.player.hp <= 0) {
        return [
          { type: "danger", content: "> 你被击败了..." },
          { type: "system", content: "> 游戏结束" }
        ];
      }
      
      return [
        { type: "narrator", content: `你发动了猛烈攻击！` },
        { type: "narrator", content: `数字守卫受到重创，但也给了你一下！` },
        { type: "danger", content: `> 你受到 ${damage} 点伤害` },
        { type: "system", content: "> 战斗胜利！获得 100 经验值" },
        { type: "item-get", content: "> 获得: 赛博核心" }
      ];
    },
    action: () => {
      addItem("赛博核心");
      addLog("击败守卫！获得赛博核心", "action");
      unlockAchievement("击败守卫");
    },
    choices: [
      { text: "前往核心区域", target: "core_area" }
    ]
  },
  
  battle_talk: {
    text: [
      { type: "dialogue", content: "你尝试与数字守卫沟通..." },
      { type: "dialogue", content: "守卫：\"你...不是敌人？\"" },
      { type: "narrator", content: "守卫的敌意降低了。" },
      { type: "system", content: "> 守卫愿意与你和平相处" },
      { type: "item-get", content: "> 获得: 守护者的友谊" }
    ],
    action: () => {
      addItem("守护者的友谊");
      gameState.player.energy = Math.min(gameState.player.maxEnergy, gameState.player.energy + 30);
      updateStats();
      addLog("和平解决！能量+30", "action");
      unlockAchievement("和平使者");
    },
    choices: [
      { text: "继续深入", target: "core_area" }
    ]
  },
  
  battle_run: {
    text: [
      { type: "narrator", content: "你转身就跑！" },
      { type: "narrator", content: "守卫发射了一道能量束..." },
      { type: "danger", content: "> 你被打中了！-15 HP" }
    ],
    action: () => {
      gameState.player.hp = Math.max(0, gameState.player.hp - 15);
      updateStats();
      addLog("逃跑失败！HP-15", "danger");
    },
    choices: [
      { text: "继续逃跑", target: "run_success" }
    ]
  },
  
  run_success: {
    text: [
      { type: "narrator", content: "虽然受伤，但你成功逃离了！" },
      { type: "system", content: "> 探索进度保存" }
    ],
    choices: [
      { text: "调整后再次挑战", target: "cyber_space" }
    ]
  },
  
  core_area: {
    text: [
      { type: "narrator", content: "你终于到达了赛博空间的核心！" },
      { type: "narrator", content: "那里悬浮着一个巨大的金色立方体——传说中的【文明之源】！" },
      { type: "dialogue", content: "系统提示：\"检测到终极文明遗产...是否融合？\"" }
    ],
    choices: [
      { text: "融合 - 成为新的人类领袖", target: "ending_good" },
      { text: "不融合 - 将其带走研究", target: "ending_neutral" },
      { text: "摧毁 - 结束这一切", target: "ending_bad" }
    ]
  },
  
  ending_good: {
    text: [
      { type: "narrator", content: "你融入了文明之源..." },
      { type: "narrator", content: "你的意识与整个赛博空间连接，成为了新的人类守护者！" },
      { type: "system", content: "═══════════════════════════" },
      { type: "system", content: "★ 结局解锁：人类守护者 ★" },
      { type: "system", content: "═══════════════════════════" },
      { type: "narrator", content: "你获得了无上的智慧与力量，将带领人类走向更美好的未来。" }
    ],
    action: () => {
      unlockAchievement("人类守护者");
    },
    choices: [
      { text: "重新开始", target: "start" }
    ]
  },
  
  ending_neutral: {
    text: [
      { type: "narrator", content: "你带走了文明之源..." },
      { type: "narrator", content: "但它太大了，无法完全带走。" },
      { type: "system", content: "═══════════════════════════" },
      { type: "system", content: "★ 结局解锁：文明的钥匙 ★" },
      { type: "system", content: "═══════════════════════════" },
      { type: "narrator", content: "你获得了部分科技，但文明的命运仍然未知..."
    ],
    action: () => {
      unlockAchievement("文明的钥匙");
    },
    choices: [
      { text: "重新开始", target: "start" }
    ]
  },
  
  ending_bad: {
    text: [
      { type: "narrator", content: "你摧毁了文明之源..." },
      { type: "narrator", content: "赛博空间开始崩塌！" },
      { type: "danger", content: "> 警告：系统崩溃！" },
      { type: "system", content: "═══════════════════════════" },
      { type: "system", content: "★ 结局解锁：终结者 ★" },
      { type: "system", content: "═══════════════════════════" },
      { type: "narrator", content: "你成为了传说中毁灭文明的罪人...还是英雄？"
    ],
    action: () => {
      unlockAchievement("终结者");
    },
    choices: [
      { text: "重新开始", target: "start" }
    ]
  }
};

// 成就列表
const achievements = {
  "勇敢的第一步": "接受神秘任务",
  "和平使者": "通过对话化解冲突",
  "击败守卫": "战胜数字守卫",
  "人类守护者": "达成完美结局",
  "文明的钥匙": "达成中立结局",
  "终结者": "达成毁灭结局"
};

// 添加物品
function addItem(item) {
  if (!gameState.player.inventory.includes(item)) {
    gameState.player.inventory.push(item);
    updateInventory();
  }
}

// 更新背包显示
function updateInventory() {
  const list = document.getElementById('inventoryList');
  if (gameState.player.inventory.length === 0) {
    list.innerHTML = '<li class="empty">背包为空</li>';
  } else {
    list.innerHTML = gameState.player.inventory.map(item => `<li>${item}</li>`).join('');
  }
}

// 解锁成就
function unlockAchievement(name) {
  if (!gameState.player.achievements.includes(name)) {
    gameState.player.achievements.push(name);
    updateAchievements();
    showMessage(`🎉 成就解锁: ${name}`, "system");
  }
}

// 更新成就显示
function updateAchievements() {
  const list = document.getElementById('achievementsList');
  const allAchievements = Object.keys(achievements);
  list.innerHTML = allAchievements.map(a => {
    if (gameState.player.achievements.includes(a)) {
      return `<li>${a}</li>`;
    }
    return `<li class="locked">???</li>`;
  }).join('');
}

// 检查升级
function checkLevelUp() {
  const expNeeded = gameState.player.level * 100;
  if (gameState.player.exp >= expNeeded) {
    gameState.player.level++;
    gameState.player.maxHp += 10;
    gameState.player.hp = gameState.player.maxHp;
    gameState.player.maxEnergy += 10;
    gameState.player.energy = gameState.player.maxEnergy;
    showMessage(`🎊 升级了！当前等级 ${gameState.player.level}`, "system");
    updateStats();
  }
}

// 更新状态栏
function updateStats() {
  const player = gameState.player;
  document.getElementById('hpBar').style.width = (player.hp / player.maxHp * 100) + '%';
  document.getElementById('hpValue').textContent = `${player.hp}/${player.maxHp}`;
  
  document.getElementById('energyBar').style.width = (player.energy / player.maxEnergy * 100) + '%';
  document.getElementById('energyValue').textContent = `${player.energy}/${player.maxEnergy}`;
  
  const expNeeded = player.level * 100;
  document.getElementById('expBar').style.width = (player.exp / expNeeded * 100) + '%';
  document.getElementById('expValue').textContent = `${player.exp}/${expNeeded}`;
}

// 添加日志
function addLog(message, type = "action") {
  const log = document.getElementById('actionLog');
  const entry = document.createElement('p');
  entry.className = `log-entry ${type}`;
  entry.textContent = '> ' + message;
  log.appendChild(entry);
  log.scrollTop = log.scrollHeight;
}

// 显示消息
function showMessage(text, type = "narrator") {
  const display = document.getElementById('storyDisplay');
  const p = document.createElement('p');
  p.className = type;
  p.innerHTML = text;
  display.appendChild(p);
  display.scrollTop = display.scrollHeight;
}

// 显示场景
function showScene(sceneId) {
  const scene = scenes[sceneId];
  if (!scene) return;
  
  gameState.currentScene = sceneId;
  gameState.visitedLocations.add(sceneId);
  
  const display = document.getElementById('storyDisplay');
  display.innerHTML = '';
  
  // 显示文本
  const textArray = typeof scene.text === 'function' ? scene.text() : scene.text;
  textArray.forEach(item => {
    const p = document.createElement('p');
    p.className = item.type;
    p.innerHTML = item.content;
    display.appendChild(p);
  });
  
  // 执行场景动作
  if (scene.action) {
    scene.action();
  }
  
  // 检查游戏结束
  if (gameState.player.hp <= 0) {
    showGameOver();
    return;
  }
  
  // 显示选项
  if (scene.choices) {
    const choiceHint = document.createElement('div');
    choiceHint.className = 'choice-hint';
    choiceHint.innerHTML = '<p>请选择：</p>';
    display.appendChild(choiceHint);
    
    const modal = document.getElementById('choiceModal');
    const buttonsContainer = document.getElementById('choiceButtons');
    buttonsContainer.innerHTML = '';
    
    scene.choices.forEach((choice, index) => {
      const btn = document.createElement('button');
      btn.className = 'choice-btn';
      btn.innerHTML = `<span class="key">[${index + 1}]</span>${choice.text}`;
      btn.onclick = () => {
        modal.classList.remove('active');
        showScene(choice.target);
      };
      buttonsContainer.appendChild(btn);
    });
    
    // 立即显示弹窗
    modal.classList.add('active');
  }
  
  display.scrollTop = display.scrollHeight;
}

// 显示游戏结束
function showGameOver() {
  const display = document.getElementById('storyDisplay');
  display.innerHTML = `
    <p class="danger" style="text-align: center; font-size: 1.5rem;">GAME OVER</p>
    <p style="text-align: center; margin-top: 20px;">你的意识永远留在了赛博空间...</p>
  `;
  
  const modal = document.getElementById('choiceModal');
  const buttonsContainer = document.getElementById('choiceButtons');
  buttonsContainer.innerHTML = `
    <button class="choice-btn" onclick="location.reload()">
      <span class="key">[1]</span>重新开始
    </button>
  `;
  modal.classList.add("active");
}

// 初始化
document.addEventListener('DOMContentLoaded', () => {
  initMatrix();
  updateStats();
  updateInventory();
  updateAchievements();
  
  // 开始屏幕
  const startScreen = document.getElementById('startScreen');
  document.addEventListener('keydown', (e) => {
    if (!gameState.started && e.key === 'Enter') {
      gameState.started = true;
      startScreen.classList.add('hidden');
      showScene('start');
    }
  });
  
  // 命令输入
  const input = document.getElementById('commandInput');
  const submitBtn = document.getElementById('submitBtn');
  
  function handleCommand() {
    const cmd = input.value.trim().toLowerCase();
    if (!cmd) return;
    
    addLog(cmd, 'action');
    
    // 解析命令
    if (cmd === '帮助' || cmd === 'help') {
      showMessage('可用指令: 帮助, 状态, 物品, 探索, 开始', 'system');
    } else if (cmd === '状态' || cmd === 'status') {
      showScene('check_status');
    } else if (cmd === '物品' || cmd === 'inventory') {
      showScene('check_inventory');
    } else if (cmd === '探索' || cmd === 'explore') {
      showScene('explore_nearby');
    } else if (cmd === '开始' || cmd === 'start') {
      showScene('start');
    } else {
      showMessage('未知指令。输入"帮助"查看可用指令。', 'system');
    }
    
    input.value = '';
  }
  
  submitBtn.onclick = handleCommand;
  input.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') handleCommand();
  });
  
  // 更新时间
  setInterval(() => {
    const now = new Date();
    document.getElementById('gameTime').textContent = 
      now.toTimeString().split(' ')[0];
  }, 1000);
  
  // 更新位置显示
  document.getElementById('locationName').textContent = '赛博空间·外围';
});

// Matrix 雨效果
function initMatrix() {
  const canvas = document.getElementById('matrixCanvas');
  if (!canvas) return;
  
  const ctx = canvas.getContext('2d');
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%^&*()';
  const fontSize = 14;
  const columns = canvas.width / fontSize;
  const drops = [];
  
  for (let i = 0; i < columns; i++) {
    drops[i] = 1;
  }
  
  function draw() {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#00ff41';
    ctx.font = fontSize + 'px monospace';
    
    for (let i = 0; i < drops.length; i++) {
      const char = chars[Math.floor(Math.random() * chars.length)];
      ctx.fillText(char, i * fontSize, drops[i] * fontSize);
      
      if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
        drops[i] = 0;
      }
      drops[i]++;
    }
  }
  
  setInterval(draw, 33);
}
