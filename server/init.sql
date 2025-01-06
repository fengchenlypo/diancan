-- 创建数据库
CREATE DATABASE IF NOT EXISTS diancan_db DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE diancan_db;

-- 创建分类表
CREATE TABLE IF NOT EXISTS categories (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(50) NOT NULL COMMENT '分类名称',
  sort_order INT DEFAULT 0 COMMENT '排序顺序',
  status TINYINT DEFAULT 1 COMMENT '状态：1-启用，0-禁用',
  create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间'
);

-- 创建商品表
CREATE TABLE IF NOT EXISTS products (
  id INT PRIMARY KEY AUTO_INCREMENT,
  category_id INT NOT NULL COMMENT '分类ID',
  title VARCHAR(100) NOT NULL COMMENT '商品名称',
  description TEXT COMMENT '商品描述',
  price DECIMAL(10,2) NOT NULL COMMENT '商品价格',
  original_price DECIMAL(10,2) COMMENT '原价',
  sales INT DEFAULT 0 COMMENT '销量',
  stock INT DEFAULT 999 COMMENT '库存',
  image_url VARCHAR(255) COMMENT '商品图片',
  status TINYINT DEFAULT 1 COMMENT '状态：1-上架，0-下架',
  is_recommend TINYINT DEFAULT 0 COMMENT '是否推荐：1-是，0-否',
  sort_order INT DEFAULT 0 COMMENT '排序顺序',
  create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  FOREIGN KEY (category_id) REFERENCES categories(id)
);

-- 创建订单表
CREATE TABLE IF NOT EXISTS orders (
  id INT PRIMARY KEY AUTO_INCREMENT,
  order_no VARCHAR(50) NOT NULL COMMENT '订单编号',
  table_no VARCHAR(20) COMMENT '桌号',
  total_amount DECIMAL(10,2) NOT NULL COMMENT '订单总金额',
  status TINYINT DEFAULT 0 COMMENT '订单状态：0-待支付，1-已支付，2-已完成，3-已取消',
  remark TEXT COMMENT '备注',
  create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间'
);

-- 创建订单详情表
CREATE TABLE IF NOT EXISTS order_items (
  id INT PRIMARY KEY AUTO_INCREMENT,
  order_id INT NOT NULL COMMENT '订单ID',
  product_id INT NOT NULL COMMENT '商品ID',
  product_title VARCHAR(100) NOT NULL COMMENT '商品名称',
  quantity INT NOT NULL COMMENT '数量',
  price DECIMAL(10,2) NOT NULL COMMENT '单价',
  create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  FOREIGN KEY (order_id) REFERENCES orders(id),
  FOREIGN KEY (product_id) REFERENCES products(id)
);

-- 插入分类数据
INSERT INTO categories (name, sort_order) VALUES 
('限量秒杀', 1),
('本店优惠', 2),
('荤菜', 3),
('素菜', 4),
('饮料', 5),
('酒品', 6);

-- 插入商品数据
INSERT INTO products (category_id, title, description, price, original_price, sales, stock, image_url, is_recommend, sort_order) VALUES
-- 限量秒杀
(1, '宫保鸡丁', '经典川菜，香辣可口', 58.00, 68.00, 1200, 100, '../../static/kelei.png', 1, 1),
(1, '麻辣小龙虾', '麻辣鲜香，小龙虾的经典吃法', 88.00, 108.00, 950, 50, '../../static/kelei.png', 1, 2),
-- 本店优惠
(2, '烧鹅', '外皮酥脆，肉质鲜嫩', 98.00, 128.00, 800, 30, '../../static/kelei.png', 1, 1),
(2, '白切鸡', '鸡肉鲜嫩，原汁原味', 68.00, 88.00, 1100, 40, '../../static/kelei.png', 1, 2),
-- 荤菜
(3, '鱼香肉丝', '酸甜可口，口感独特', 68.00, 78.00, 1100, 200, '../../static/kelei.png', 0, 1),
-- 素菜
(4, '剁椒鱼头', '辣味十足，香味浓郁', 120.00, 138.00, 500, 20, '../../static/kelei.png', 0, 1),
(4, '湘西外婆菜', '口味独特，咸香适口', 38.00, 48.00, 950, 300, '../../static/kelei.png', 0, 2),
-- 饮料
(5, '可乐', '经典碳酸饮料，刺激口感', 8.00, 10.00, 3000, 500, '../../static/kelei.png', 0, 1),
(5, '雪碧', '清爽解渴，口感清凉', 8.00, 10.00, 2800, 500, '../../static/kelei.png', 0, 2),
(5, '橙汁', '新鲜榨取，营养丰富', 15.00, 18.00, 500, 100, '../../static/kelei.png', 0, 3),
(5, '苹果汁', '清甜可口，健康饮品', 15.00, 18.00, 450, 100, '../../static/kelei.png', 0, 4),
-- 酒品
(6, '青岛啤酒', '清爽的啤酒，适合夏天饮用', 25.00, 28.00, 800, 200, '../../static/kelei.png', 0, 1),
(6, '白酒', '浓香型白酒，醇厚口感', 168.00, 188.00, 300, 50, '../../static/kelei.png', 0, 2),
(6, '红酒', '优雅红酒，醇香四溢', 258.00, 298.00, 200, 30, '../../static/kelei.png', 0, 3);