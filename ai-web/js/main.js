// ===== NeuroNex AI - Main JavaScript =====

// AI Responses Database
const aiResponses = {
  '量子计算': `🔬 <strong>量子计算原理：</strong><br><br>
量子计算基于量子力学原理，使用量子比特（qubit）代替传统二进制比特。<br><br>
<strong>核心优势：</strong><br>
• 并行处理能力指数级提升<br>
• 解决传统计算机无法处理的复杂问题<br>
• 密码学、药物研发、金融建模等领域突破<br><br>
<strong>NeuroNex 量子增强技术：</strong><br>
我们的量子-经典混合算法将传统AI模型的训练速度提升 1000 倍。`,
  
  '深度学习': `🧠 <strong>深度学习解析：</strong><br><br>
深度学习是机器学习的一个分支，使用多层神经网络模拟人脑工作机制。<br><br>
<strong>核心组件：</strong><br>
• <strong>卷积神经网络 (CNN)</strong> - 图像识别<br>
• <strong>循环神经网络 (RNN)</strong> - 序列数据处理<br>
• <strong>Transformer</strong> - 自然语言处理<br><br>
<strong>我们的优势：</strong><br>
NeuroCore Engine 支持 1750 亿参数模型推理，效率提升 300%。`,
  
  '企业AI': `🏢 <strong>AI 如何改变企业运营：</strong><br><br>
<strong>智能自动化</strong><br>
• 客服响应时间减少 80%<br>
• 流程效率提升 10 倍<br><br>
<strong>数据洞察</strong><br>
• 自动发现隐藏业务机会<br>
• 预测性维护降低设备故障 60%<br><br>
<strong>决策支持</strong><br>
• AI 分析辅助管理层决策<br>
• 风险识别准确率达 95%`,
  
  '趋势': `🚀 <strong>AI 未来发展趋势：</strong><br><br>
<strong>1. 多模态 AI</strong><br>
理解图像、文字、语音的融合智能<br><br>
<strong>2. 边缘 AI</strong><br>
设备端本地推理，保护数据隐私<br><br>
<strong>3. 可解释 AI</strong><br>
理解 AI 决策过程，提高可信度<br><br>
<strong>4. AI Agent</strong><br>
自主完成复杂任务的自适应系统<br><br>
<strong>NeuroNex 布局：</strong><br>
我们正在开发下一代 NeuroNex 4.0，将率先实现以上所有技术突破。`
};

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  initLoader();
  initNeuralNetwork();
  initStats();
  initSmoothScroll();
  initMobileMenu();
  initTerminalInput();
});

// Loader
function initLoader() {
  setTimeout(() => {
    const loader = document.getElementById('loader');
    if (loader) loader.classList.add('hidden');
  }, 2000);
}

// Neural Network Background
function initNeuralNetwork() {
  const canvas = document.getElementById('neuralCanvas');
  if (!canvas) return;
  
  const ctx = canvas.getContext('2d');
  
  let width, height;
  let particles = [];
  
  function resize() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
  }
  
  resize();
  window.addEventListener('resize', resize);
  
  // Create particles
  for (let i = 0; i < 80; i++) {
    particles.push({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.5,
      vy: (Math.random() - 0.5) * 0.5,
      size: Math.random() * 2 + 1
    });
  }
  
  function draw() {
    ctx.fillStyle = 'rgba(10, 10, 15, 0.1)';
    ctx.fillRect(0, 0, width, height);
    
    // Draw particles
    particles.forEach((p, i) => {
      p.x += p.vx;
      p.y += p.vy;
      
      // Wrap around
      if (p.x < 0) p.x = width;
      if (p.x > width) p.x = 0;
      if (p.y < 0) p.y = height;
      if (p.y > height) p.y = 0;
      
      // Draw point
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fillStyle = '#00f0ff';
      ctx.fill();
      
      // Draw connections
      particles.forEach((p2, j) => {
        if (i === j) return;
        const dx = p.x - p2.x;
        const dy = p.y - p2.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        if (dist < 150) {
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(p2.x, p2.y);
          ctx.strokeStyle = `rgba(0, 240, 255, ${0.15 * (1 - dist / 150)})`;
          ctx.lineWidth = 0.5;
          ctx.stroke();
        }
      });
    });
    
    requestAnimationFrame(draw);
  }
  
  draw();
}

// Stats Counter Animation
function initStats() {
  const stats = document.querySelectorAll('.stat-number');
  
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animateValue(entry.target);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });
  
  stats.forEach(stat => observer.observe(stat));
}

function animateValue(element) {
  const target = parseFloat(element.dataset.target);
  const suffix = element.dataset.suffix || '';
  const isDecimal = target % 1 !== 0;
  const duration = 2000;
  const start = performance.now();
  
  function update(currentTime) {
    const elapsed = currentTime - start;
    const progress = Math.min(elapsed / duration, 1);
    const easeOut = 1 - Math.pow(1 - progress, 3);
    const current = target * easeOut;
    
    if (isDecimal) {
      element.textContent = current.toFixed(2) + suffix;
    } else {
      element.textContent = Math.floor(current) + suffix;
    }
    
    if (progress < 1) {
      requestAnimationFrame(update);
    }
  }
  
  requestAnimationFrame(update);
}

// Smooth Scroll
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      e.preventDefault();
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        // Close mobile menu
        document.getElementById('navMenu').classList.remove('active');
      }
    });
  });
}

// Mobile Menu
function initMobileMenu() {
  const toggle = document.getElementById('navToggle');
  const menu = document.getElementById('navMenu');
  
  if (toggle && menu) {
    toggle.addEventListener('click', () => {
      menu.classList.toggle('active');
    });
  }
}

// Terminal Input
function initTerminalInput() {
  const input = document.getElementById('aiInput');
  if (input) {
    input.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        const question = e.target.value.trim();
        if (question) {
          askAI(question);
        }
      }
    });
  }
}

// Ask AI Function
function askAI(question) {
  const terminal = document.getElementById('terminalOutput');
  const input = document.getElementById('aiInput');
  
  if (!terminal) return;
  
  // Add user question
  addToTerminal('> ' + question, 'user-msg');
  
  // Simulate AI thinking
  addToTerminal('◉ Analyzing...', 'thinking-msg');
  
  setTimeout(() => {
    // Remove thinking message
    const thinking = terminal.querySelector('.thinking-msg');
    if (thinking) thinking.remove();
    
    // Find matching response
    let response = aiResponses['趋势']; // Default
    for (const [key, value] of Object.entries(aiResponses)) {
      if (question.includes(key)) {
        response = value;
        break;
      }
    }
    
    addToTerminal(response, 'ai-msg');
  }, 1500);
  
  if (input) input.value = '';
}

function addToTerminal(text, className) {
  const terminal = document.getElementById('terminalOutput');
  if (!terminal) return;
  
  const p = document.createElement('p');
  p.className = className;
  p.innerHTML = text;
  terminal.appendChild(p);
  terminal.scrollTop = terminal.scrollHeight;
}

// Navbar scroll effect
window.addEventListener('scroll', () => {
  const navbar = document.querySelector('.navbar');
  if (!navbar) return;
  
  if (window.scrollY > 50) {
    navbar.style.background = 'rgba(10, 10, 15, 0.95)';
  } else {
    navbar.style.background = 'rgba(10, 10, 15, 0.8)';
  }
});
