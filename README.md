# Babel Box Backend

Tower of Babel Box 后端API服务，提供八股文管理系统的数据存储和业务逻辑处理。

## 项目简介

Babel Box Backend 是一个基于 Node.js 和 Express 的RESTful API服务，为前端应用提供八股文数据的增删改查功能。支持MySQL数据库存储，并提供完整的错误处理和日志记录。

## 技术栈

- **运行环境**: Node.js
- **Web框架**: Express 5.1.0
- **数据库**: MySQL (通过 Sequelize ORM)
- **ORM**: Sequelize 6.37.7
- **其他依赖**:
  - cors: 跨域资源共享
  - morgan: HTTP请求日志
  - dotenv: 环境变量管理

## 项目结构

```
backend/
├── src/                    # 源代码
│   ├── config/            # 配置文件
│   │   ├── db.js          # 数据库配置
│   │   └── seedData.js    # 种子数据
│   ├── controllers/       # 控制器
│   │   ├── bibleItemController.js  # 八股文控制器
│   │   └── categoryController.js   # 分类控制器
│   ├── models/            # 数据模型
│   │   ├── BibleItem.js   # 八股文模型(MongoDB)
│   │   ├── BibleItemModel.js  # 八股文模型(MySQL)
│   │   ├── Category.js    # 分类模型(MongoDB)
│   │   └── CategoryModel.js     # 分类模型(MySQL)
│   ├── routes/            # 路由定义
│   │   ├── bibleItemRoutes.js    # 八股文路由
│   │   └── categoryRoutes.js     # 分类路由
│   ├── app.js             # Express应用配置
│   └── server.js          # 服务器启动文件
├── .env                   # 环境变量
├── .gitignore             # Git忽略文件
├── package.json           # 项目依赖
└── README.md              # 项目说明
```

## 功能特性

- **八股文管理**: 提供八股文的增删改查API
- **分类管理**: 支持分类的创建和管理
- **搜索过滤**: 支持按标题、内容和分类搜索
- **错误处理**: 完善的错误处理机制
- **日志记录**: 开发环境下的请求日志
- **数据库支持**: 支持MySQL数据库存储

## 安装与运行

### 环境要求

- Node.js 16.0 或更高版本
- MySQL 5.7 或更高版本
- npm 或 yarn 包管理器

### 安装步骤

1. 克隆项目到本地
```bash
git clone https://gitee.com/tranquilwalker/babel-box-backend.git
cd babel-box-backend
```

2. 安装依赖
```bash
npm install
```

3. 配置环境变量

创建 `.env` 文件并配置以下变量：
```env
PORT=3000
MYSQL_HOST=localhost
MYSQL_PORT=3306
MYSQL_DATABASE=babel box
MYSQL_USER=walker
MYSQL_PASSWORD=123456
NODE_ENV=development
```

4. 启动服务器
```bash
# 生产环境
npm start

# 开发环境 (使用nodemon自动重启)
npm run dev
```

5. 初始化数据库 (可选)
```bash
npm run seed
```

## API接口文档

### 八股文接口

#### 获取所有八股文
```http
GET /api/bible-items/all
```

#### 搜索八股文
```http
GET /api/bible-items?search=关键词&category=分类
```

#### 获取单个八股文
```http
GET /api/bible-items/:id
```

#### 创建八股文
```http
POST /api/bible-items
Content-Type: application/json

{
  "title": "标题",
  "content": "内容",
  "category": "分类",
  "example": "示例"
}
```

#### 更新八股文
```http
PUT /api/bible-items/:id
Content-Type: application/json

{
  "title": "更新后的标题",
  "content": "更新后的内容",
  "category": "更新后的分类",
  "example": "更新后的示例"
}
```

#### 删除八股文
```http
DELETE /api/bible-items/:id
```

### 分类接口

#### 获取所有分类
```http
GET /api/categories
```

## 数据库设计

### 八股文表 (bible_items)

| 字段名 | 类型 | 说明 |
|--------|------|------|
| id | INT | 主键，自增 |
| title | VARCHAR(255) | 标题 |
| content | TEXT | 内容 |
| category | VARCHAR(255) | 分类 |
| example | TEXT | 示例 |
| created_at | DATETIME | 创建时间 |
| updated_at | DATETIME | 更新时间 |

### 分类表 (categories)

| 字段名 | 类型 | 说明 |
|--------|------|------|
| id | INT | 主键，自增 |
| name | VARCHAR(255) | 分类名称 |
| created_at | DATETIME | 创建时间 |
| updated_at | DATETIME | 更新时间 |

## 开发指南

### 添加新的API端点

1. 在 `src/models` 中定义数据模型
2. 在 `src/controllers` 中实现控制器逻辑
3. 在 `src/routes` 中定义路由
4. 在 `src/app.js` 中挂载路由

### 数据库迁移

使用 Sequelize 的自动同步功能：
```javascript
// 在 src/config/db.js 中
await sequelize.sync({ alter: true });
```

### 错误处理

应用包含全局错误处理中间件，会捕获所有未处理的错误并返回适当的HTTP状态码和错误信息。

## 部署指南

### 使用 PM2 部署

1. 安装 PM2
```bash
npm install -g pm2
```

2. 启动应用
```bash
pm2 start src/server.js --name "babel-box-backend"
```

3. 查看状态
```bash
pm2 status
```

### 使用 Docker 部署

1. 创建 Dockerfile
```dockerfile
FROM node:16-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 3000
CMD ["npm", "start"]
```

2. 构建镜像
```bash
docker build -t babel-box-backend .
```

3. 运行容器
```bash
docker run -p 3000:3000 babel-box-backend
```

## 测试

目前项目尚未包含测试用例，但建议添加以下测试：

- 单元测试：测试控制器和模型
- 集成测试：测试API端点
- 性能测试：测试负载能力

## 贡献指南

1. Fork 本仓库
2. 创建您的特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交您的更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 打开一个Pull Request

## 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情

## 联系方式

如有问题或建议，请通过以下方式联系：

- 提交Issue: [Gitee Issues](https://gitee.com/tranquilwalker/babel-box-backend/issues)
- 邮箱: tranquilwalker@example.com

## 更新日志

### v1.0.0 (2024-01-01)
- 初始版本发布
- 实现基本的八股文CRUD API
- 添加分类管理功能
- 实现搜索和过滤功能