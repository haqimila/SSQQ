# 双色球分析助手

一个帮助分析双色球历史数据的Chrome扩展程序，提供多种数据分析功能。

## 安装说明

### 方法一：开发者模式安装

1. 下载源代码
   - 将所有文件下载到本地一个文件夹中
   - 确保文件结构如下：
   ```
   双色球分析助手/
   ├── manifest.json
   ├── popup.html
   ├── popup.js
   ├── xlsx.full.min.js
   └── images/
       ├── icon16.png
       ├── icon48.png
       └── icon128.png
   ```

2. 安装扩展
   - 打开Chrome浏览器
   - 在地址栏输入：`chrome://extensions/`
   - 打开右上角的"开发者模式"
   - 点击"加载已解压的扩展程序"
   - 选择包含所有文件的文件夹

### 方法二：直接安装（待发布到Chrome商店）
- 访问Chrome网上应用店
- 搜索"双色球分析助手"
- 点击"添加到Chrome"即可

## 使用说明

### 基本功能

1. **获取数据**
   - 点击扩展图标打开面板
   - 点击"获取最新数据"按钮
   - 自动获取最近300期双色球开奖数据

2. **连号分析**
   - 点击"分析数据"按钮
   - 显示连号出现的概率和详细信息
   - 可查看最近10期的连号详情

3. **导出Excel**
   - 点击"导出Excel"按钮
   - 自动下载包含完整分析数据的Excel文件

### 高级分析功能

1. **热门号码分析**
   - 点击"热门号码分析"按钮
   - 显示出现次数最多的10个红球
   - 显示出现次数最少的5个蓝球

2. **遗漏分析**
   - 点击"遗漏分析"按钮
   - 显示最近未出现的号码
   - 按遗漏期数从大到小排序

3. **奇偶比例分析**
   - 点击"奇偶比例分析"按钮
   - 显示最近10期的奇偶比例
   - 统计所有奇偶比例的出现次数

## 数据说明

- 数据来源：中国福利彩票官网
- 数据范围：最近300期开奖记录
- 更新频率：每次手动获取最新数据
- 数据存储：本地Chrome存储，关闭浏览器不会丢失

## 注意事项

1. 首次使用需要先点击"获取最新数据"
2. 所有分析功能都需要先有数据才能使用
3. 导出的Excel文件默认保存在下载目录
4. 建议定期更新数据以确保分析准确性

## 隐私说明

- 本扩展仅获取公开的彩票数据
- 所有数据分析在本地完成
- 不会收集任何用户个人信息
- 不会向任何服务器发送分析数据

## 技术支持

如有问题或建议，请通过以下方式联系：
- 提交Issue
- 发送邮件到：[您的邮箱]

## 免责声明

本扩展程序仅供参考学习使用，不构成购彩建议，请理性购彩。

## 更新日志

### v1.0.0 (2024-03-xx)
- 首次发布
- 实现基本数据获取和分析功能
- 支持Excel导出
- 添加热门号码分析
- 添加遗漏分析
- 添加奇偶比例分析 