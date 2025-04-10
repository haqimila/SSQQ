// 创建一个临时的双色球图标
const canvas = document.createElement('canvas');
const ctx = canvas.getContext('2d');

function createIcon(size) {
  canvas.width = size;
  canvas.height = size;
  
  // 绘制红色圆
  ctx.beginPath();
  ctx.arc(size/2, size/2, size/2.2, 0, Math.PI * 2);
  ctx.fillStyle = '#e74c3c';
  ctx.fill();
  
  // 绘制文字
  ctx.fillStyle = 'white';
  ctx.font = `${size/2}px Arial`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('双', size/2, size/2);
  
  return canvas.toDataURL();
}

// 生成不同尺寸的图标
const sizes = [16, 48, 128];
sizes.forEach(size => {
  const link = document.createElement('a');
  link.download = `icon${size}.png`;
  link.href = createIcon(size);
  link.click();
}); 