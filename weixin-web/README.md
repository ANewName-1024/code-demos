# 网站模板 - 通用企业官网

一个配置驱动的企业官网模板，修改配置文件即可完成网站定制。

## 快速开始

### 1. 修改配置文件

编辑 `config.json` 即可定制网站所有内容：

```json
{
  "company": {
    "name": "您的公司名称",
    "nameEn": "Your Company Name",
    "phone": "联系电话",
    "email": "邮箱@domain.com",
    "address": "公司地址"
  },
  "products": [
    {
      "name": "产品名称",
      "image": "images/product1.jpg",
      "description": "产品描述",
      "features": ["特点1", "特点2"],
      "parameters": {"参数": "值"}
    }
  ]
}
```

### 2. 添加产品图片

将图片放入 `images/` 目录：
- 产品图片：`images/product1.jpg`, `images/product2.jpg` ...
- 背景图片：`images/bg-hero.jpg`, `images/about-bg.jpg`
- Logo：`images/logo.png`

### 3. 图片压缩

添加新图片后运行压缩脚本：
```bash
bash scripts/compress-images.sh
```

### 4. 部署

#### 本地预览
```bash
cd weixin-web
python3 -m http.server 8080
# 访问 http://localhost:8080
```

#### 服务器部署
```bash
# 克隆到服务器
git clone https://github.com/your-repo/website.git /var/www/yoursite

# 配置 Nginx
# 详见下方 Nginx 配置
```

## 配置说明

### 公司信息
| 字段 | 说明 |
|------|------|
| name | 公司中文名 |
| nameEn | 公司英文名 |
| phone | 联系电话 |
| email | 联系邮箱 |
| address | 公司地址 |

### 产品配置
```json
{
  "id": "唯一标识",
  "name": "产品名称",
  "nameEn": "产品英文名",
  "category": "产品分类",
  "description": "产品描述",
  "image": "产品主图路径",
  "features": ["特点列表"],
  "parameters": {"参数名": "参数值"}
}
```

### 联系方式表单
表单提交后会发送到配置的飞书群机器人。

## 文件结构

```
weixin-web/
├── index.html          # 主页面
├── config.json        # 配置文件（修改这里）
├── config-template.json # 配置模板
├── submit.php         # 表单提交处理
├── css/
│   └── style.css      # 样式
├── js/
│   └── main.js        # 脚本
├── images/            # 图片目录
│   ├── product1.jpg
│   ├── product2.jpg
│   └── ...
├── scripts/
│   └── compress-images.sh  # 图片压缩脚本
└── README.md
```

## 部署到服务器

### Nginx 配置示例
```nginx
server {
    listen 80;
    server_name yourdomain.com;
    root /var/www/yoursite;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location ~ \.php$ {
        fastcgi_pass unix:/var/run/php-fpm/www.sock;
        fastcgi_index index.php;
        include fastcgi_params;
    }
}
```

## 常见问题

### Q: 如何添加更多产品？
A: 在 `config.json` 的 `products` 数组中添加新对象

### Q: 如何修改网站配色？
A: 编辑 `css/style.css` 中的 `:root` 变量

### Q: 表单提交到哪？
A: 目前配置为飞书群机器人，需要在 `submit.php` 中设置 Webhook 地址

## License

MIT
