-- 创建数据库（如果不存在）
CREATE DATABASE IF NOT EXISTS `babel box` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- 使用数据库
USE `babel box`;

-- 创建分类表
CREATE TABLE IF NOT EXISTS categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY unique_category_name (name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 创建八股文表
CREATE TABLE IF NOT EXISTS bible_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    category VARCHAR(255) NOT NULL,
    example TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_category (category),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 创建示例数据
INSERT INTO categories (name) VALUES 
('技术'),
('生活'),
('工作'),
('学习')
ON DUPLICATE KEY UPDATE name = name;

-- 创建示例八股文数据
INSERT INTO bible_items (title, content, category, example) VALUES 
('Hello World', '这是第一个八股文示例', '技术', 'print("Hello World")'),
('如何高效学习', '制定计划，坚持不懈', '学习', '每天学习2小时'),
('工作效率提升', '番茄工作法，专注工作', '工作', '25分钟专注+5分钟休息'),
('健康生活方式', '早睡早起，适量运动', '生活', '每天步行10000步')
ON DUPLICATE KEY UPDATE title = VALUES(title);