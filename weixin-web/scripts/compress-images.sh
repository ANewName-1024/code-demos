#!/bin/bash
# 图片自动压缩脚本
# 运行方式: ./compress-images.sh

echo "🖼️ 开始压缩图片..."

# 检查是否安装 ImageMagick
if ! command -v mogrify &> /dev/null; then
    echo "❌ 请先安装 ImageMagick: dnf install -y ImageMagick"
    exit 1
fi

# 备份原图
mkdir -p images/original
cp images/*.jpg images/*.png images/original/ 2>/dev/null

# 压缩 JPG
mogrify -resize 1200x800 -quality 80 -strip images/*.jpg 2>/dev/null

# 压缩 PNG
mogrify -resize 1200x800 -quality 80 -strip images/*.png 2>/dev/null

# 显示结果
echo "✅ 压缩完成!"
echo "📊 图片大小:"
ls -lh images/
