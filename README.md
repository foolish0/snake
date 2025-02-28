# 贪吃蛇游戏 (Snake Game)

一个功能丰富的现代贪吃蛇游戏，包含多种游戏模式、皮肤系统、商店系统和特效系统。

## 功能特点

### 核心游戏功能
- 三种难度模式（简单、普通、困难）
- 实时分数统计和最高分记录
- 游戏暂停/继续
- 碰撞检测（边界和自身）
- 流畅的移动控制

### 进阶功能
- 皮肤系统（4种不同风格的蛇皮肤）
- 商店系统（使用金币购买皮肤）
- 每日奖励系统
- 音效和背景音乐
- 特效系统（得分、吃食物、游戏开始等）

### 界面系统
- 主菜单界面
- 商店界面
- 设置界面
- 游戏结束界面
- 暂停界面

## 操作指南

### 主菜单
- `1/2/3`: 选择难度（简单/普通/困难）
- `S`: 进入商店
- `O`: 进入设置

### 游戏控制
- `方向键` 或 `WASD`: 控制蛇的移动
- `P`: 暂停/继续游戏
- `R`: 游戏结束时重新开始

### 商店界面
- `1/2/3`: 购买对应的皮肤
- `U`: 切换已拥有的皮肤
- `R`: 领取每日奖励
- `B`: 返回主菜单

### 设置界面
- `V`: 开启/关闭音效
- `M`: 开启/关闭音乐
- `S`: 切换皮肤
- `B`: 返回主菜单

## 安装和部署

### 环境要求
- Node.js >= 14.0.0
- npm >= 6.0.0

### 安装步骤

1. 克隆仓库

```bash
git clone https://github.com/yourusername/snake-game.git
cd snake-game
```

2. 安装依赖
```bash
npm install
```

3. 生成游戏资源
```bash
npm run generate-assets
```

4. 启动开发服务器
```bash
npm run dev
```

5. 构建生产版本
```bash
npm run build
```

### 目录结构
```
project-root/
├── public/                # 静态资源
│   ├── audio/            # 音效文件
│   └── assets/
│       └── textures/    # 皮肤纹理
├── src/                  # 源代码
│   ├── config/          # 游戏配置
│   ├── core/            # 核心逻辑
│   └── systems/         # 功能系统
└── scripts/             # 构建脚本
```

## 本地开发

1. 启动开发服务器：
```bash
npm run dev
```

2. 在浏览器中访问：
```
http://localhost:5173
```

## 构建和部署

1. 构建生产版本：
```bash
npm run build
```

2. 部署 `dist` 目录下的文件到你的服务器

## 数据存储

游戏数据使用 localStorage 存储，包括：
- 最高分
- 金币数量
- 已购买的皮肤
- 当前使用的皮肤
- 音效和音乐设置
- 每日奖励领取时间

## 贡献指南

1. Fork 本仓库
2. 创建你的特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交你的改动 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 打开一个 Pull Request

## 许可证

本项目基于 MIT 许可证开源 - 查看 [LICENSE](LICENSE) 文件了解更多详情