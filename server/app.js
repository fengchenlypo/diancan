const mysql = require('mysql2');
const http = require('http');
const fs = require('fs');
const path = require('path');
const formidable = require('formidable');

// 创建上传目录
const uploadDir = path.join(__dirname, 'image');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

// 创建数据库连接
const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '123456',
  database: 'diancan_db'
});

// 连接到数据库
connection.connect(err => {
  if (err) {
    console.error('数据库连接失败:', err);
    return;
  }
  console.log('成功连接到数据库');
});

// MIME类型映射
const mimeTypes = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'text/javascript',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.gif': 'image/gif'
};

// 创建HTTP服务器
const server = http.createServer((req, res) => {
  // 设置CORS头
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, DELETE, PUT');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  // 处理OPTIONS请求
  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  // 处理后台管理页面请求
  if (req.url === '/admin' || req.url === '/admin.html') {
    fs.readFile(path.join(__dirname, 'admin.html'), (err, content) => {
      if (err) {
        res.writeHead(500);
        res.end('Error loading admin page');
        return;
      }
      res.writeHead(200, { 'Content-Type': 'text/html' });
      res.end(content);
    });
    return;
  }

  // 处理API路由
  if (req.url === '/api/categories' && req.method === 'GET') {
    // 获取分类和商品列表
    connection.query(
      `SELECT 
        c.id as category_id, 
        c.name as category_name,
        p.id as product_id,
        p.title,
        p.description,
        p.price,
        p.original_price,
        p.sales,
        p.image_url
       FROM categories c 
       LEFT JOIN products p ON c.id = p.category_id 
       ORDER BY c.sort_order, p.sort_order`,
      (error, results) => {
        if (error) {
          res.writeHead(500, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: '获取数据失败' }));
          return;
        }

        // 处理查询结果，组织成前端需要的格式
        const categories = [];
        const categoryMap = new Map();

        results.forEach(row => {
          if (!categoryMap.has(row.category_id)) {
            categoryMap.set(row.category_id, {
              id: row.category_id,
              name: row.category_name,
              items: []
            });
            categories.push(categoryMap.get(row.category_id));
          }

          if (row.product_id) { // 确保产品存在
            categoryMap.get(row.category_id).items.push({
              id: row.product_id,
              title: row.title,
              desc: row.description,
              price: row.price,
              original_price: row.original_price,
              sales: row.sales,
              image: row.image_url,
              quantity: 0
            });
          }
        });

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(categories));
      }
    );
  } else if (req.url === '/api/admin/categories' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });

    req.on('end', () => {
      const { name } = JSON.parse(body);
      connection.query(
        'INSERT INTO categories (name) VALUES (?)',
        [name],
        (error, result) => {
          if (error) {
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: '创建分类失败' }));
            return;
          }
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ id: result.insertId, name }));
        }
      );
    });
  } else if (req.url.match(/^\/api\/admin\/categories\/\d+$/) && req.method === 'PUT') {
    const id = req.url.split('/').pop();
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });

    req.on('end', () => {
      const { name } = JSON.parse(body);
      connection.query(
        'UPDATE categories SET name = ? WHERE id = ?',
        [name, id],
        (error) => {
          if (error) {
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: '更新分类失败' }));
            return;
          }
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ success: true }));
        }
      );
    });
  } else if (req.url.match(/^\/api\/admin\/categories\/\d+$/) && req.method === 'DELETE') {
    const id = req.url.split('/').pop();
    // 先检查分类下是否有商品
    connection.query(
      'SELECT COUNT(*) as count FROM products WHERE category_id = ?',
      [id],
      (error, results) => {
        if (error) {
          res.writeHead(500, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: '删除分类失败' }));
          return;
        }

        if (results[0].count > 0) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: '该分类下还有商品，无法删除' }));
          return;
        }

        // 如果没有商品，则删除分类
        connection.query(
          'DELETE FROM categories WHERE id = ?',
          [id],
          (error) => {
            if (error) {
              res.writeHead(500, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({ error: '删除分类失败' }));
              return;
            }
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: true }));
          }
        );
      }
    );
  } else if (req.url === '/api/admin/products' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });

    req.on('end', () => {
      const product = JSON.parse(body);
      connection.query(
        'INSERT INTO products (title, category_id, price, original_price, description, image_url) VALUES (?, ?, ?, ?, ?, ?)',
        [product.title, product.categoryId, product.price, product.original_price, product.desc, product.image],
        (error, result) => {
          if (error) {
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: '创建商品失败' }));
            return;
          }
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ id: result.insertId, ...product }));
        }
      );
    });
  } else if (req.url.match(/^\/api\/admin\/products\/\d+$/) && req.method === 'PUT') {
    const id = req.url.split('/').pop();
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });

    req.on('end', () => {
      const product = JSON.parse(body);
      connection.query(
        'UPDATE products SET title = ?, category_id = ?, price = ?, original_price = ?, description = ?, image_url = ? WHERE id = ?',
        [product.title, product.categoryId, product.price, product.original_price, product.desc, product.image, id],
        (error) => {
          if (error) {
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: '更新商品失败' }));
            return;
          }
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ success: true }));
        }
      );
    });
  } else if (req.url.match(/^\/api\/admin\/products\/\d+$/) && req.method === 'DELETE') {
    const id = req.url.split('/').pop();
    connection.query(
      'DELETE FROM products WHERE id = ?',
      [id],
      (error) => {
        if (error) {
          res.writeHead(500, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: '删除商品失败' }));
          return;
        }
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true }));
      }
    );
  } else if (req.url === '/api/admin/orders' && req.method === 'GET') {
    const query = `
      SELECT 
        o.id, 
        o.order_no, 
        o.total_amount,
        o.status,
        o.create_time,
        o.order_type,
        o.order_details,
        o.remark,
        oi.product_id,
        oi.product_title,
        oi.quantity,
        oi.price
      FROM orders o
      LEFT JOIN order_items oi ON o.id = oi.order_id
      ORDER BY o.create_time DESC
    `;

    connection.query(query, (error, results) => {
      if (error) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: '获取订单列表失败' }));
        return;
      }

      const orders = new Map();
      results.forEach(row => {
        if (!orders.has(row.id)) {
          // 解析订单详情
          let orderDetails = {};
          let orderType = '未知';
          try {
            if (row.order_details) {
              orderDetails = typeof row.order_details === 'string' 
                ? JSON.parse(row.order_details) 
                : row.order_details;
            }
            switch(row.order_type) {
              case 'takeout':
                orderType = '外卖';
                break;
              case 'dine_in':
                orderType = '堂食';
                break;
              case 'pickup':
                orderType = '自提';
                break;
            }
          } catch (e) {
            console.error('解析订单详情失败:', e);
          }

          // 格式化创建时间
          const createTime = new Date(row.create_time).toLocaleString('zh-CN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
          });

          orders.set(row.id, {
            id: row.id,
            orderNo: row.order_no,
            totalAmount: row.total_amount,
            status: row.status === 2 ? '已完成' : '待处理',
            createTime: createTime,
            orderType: orderType,
            orderDetails: orderDetails,
            remark: row.remark || '',
            items: []
          });
        }

        if (row.product_id) {
          orders.get(row.id).items.push({
            productId: row.product_id,
            title: row.product_title,
            quantity: row.quantity,
            price: row.price,
            subtotal: (row.price * row.quantity).toFixed(2)
          });
        }
      });

      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(Array.from(orders.values())));
    });
  } else if (req.url.match(/^\/api\/admin\/orders\/\d+\/complete$/) && req.method === 'PUT') {
    const id = req.url.split('/')[4];
    connection.query(
      'UPDATE orders SET status = 2 WHERE id = ?',
      [id],
      (error) => {
        if (error) {
          res.writeHead(500, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: '更新订单状态失败' }));
          return;
        }
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true }));
      }
    );
  } else if (req.url.match(/^\/api\/admin\/orders\/\d+$/) && req.method === 'DELETE') {
    const id = req.url.split('/').pop();
    // 先删除订单项
    connection.query('DELETE FROM order_items WHERE order_id = ?', [id], (error) => {
      if (error) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: '删除订单失败' }));
        return;
      }
      // 再删除订单
      connection.query('DELETE FROM orders WHERE id = ?', [id], (error) => {
        if (error) {
          res.writeHead(500, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: '删除订单失败' }));
          return;
        }
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true }));
      });
    });
  } else if (req.url.match(/^\/api\/orders\/\d+$/) && req.method === 'DELETE') {
    // 获取订单ID
    const orderId = req.url.split('/').pop();
    
    // 先删除订单项
    connection.query(
      'DELETE FROM order_items WHERE order_id = ?',
      [orderId],
      (error) => {
        if (error) {
          res.writeHead(500, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: '删除订单失败' }));
          return;
        }
        
        // 再删除订单
        connection.query(
          'DELETE FROM orders WHERE id = ?',
          [orderId],
          (error) => {
            if (error) {
              res.writeHead(500, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({ error: '删除订单失败' }));
              return;
            }
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ 
              success: true,
              message: '删除成功'
            }));
          }
        );
      }
    );
  } else if (req.url.match(/^\/api\/orders\/\d+\/pay$/) && req.method === 'POST') {
    // 处理订单支付
    const orderId = req.url.split('/')[3];
    let body = '';
    
    req.on('data', chunk => {
      body += chunk.toString();
    });

    req.on('end', () => {
      try {
        const { orderType, orderDetails } = JSON.parse(body);
        
        // 更新订单状态和订单类型信息
        connection.query(
          'UPDATE orders SET status = 1, order_type = ?, order_details = ? WHERE id = ?',
          [orderType, JSON.stringify(orderDetails), orderId],
          (error) => {
            if (error) {
              console.error('支付订单失败:', error);
              res.writeHead(500, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({ error: '支付失败' }));
              return;
            }
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: true }));
          }
        );
      } catch (error) {
        console.error('处理支付请求失败:', error);
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: '无效的请求数据' }));
      }
    });
  } else if (req.url.match(/^\/api\/orders\/\d+$/) && req.method === 'GET') {
    // 获取订单详情
    const orderId = req.url.split('/')[3];
    
    // 获取订单基本信息
    connection.query(
      `SELECT o.*, o.order_type as orderType, o.order_details as orderDetails
       FROM orders o
       WHERE o.id = ?`,
      [orderId],
      (error, orders) => {
        if (error) {
          console.error('获取订单详情失败:', error);
          res.writeHead(500, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: '获取订单详情失败' }));
          return;
        }

        if (!orders || orders.length === 0) {
          res.writeHead(404, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: '订单不存在' }));
          return;
        }

        const order = orders[0];

        // 获取订单商品
        connection.query(
          `SELECT oi.*, p.title, p.image_url as image
           FROM order_items oi
           LEFT JOIN products p ON oi.product_id = p.id
           WHERE oi.order_id = ?`,
          [orderId],
          (error, items) => {
            if (error) {
              console.error('获取订单商品失败:', error);
              res.writeHead(500, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({ error: '获取订单详情失败' }));
              return;
            }

            // 解析订单详情
            if (order.orderDetails) {
              try {
                order.orderDetails = JSON.parse(order.orderDetails);
              } catch (e) {
                console.error('解析订单详情失败:', e);
                order.orderDetails = {};
              }
            }

            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({
              ...order,
              items
            }));
          }
        );
      }
    );
  } else if (req.url === '/api/orders' && req.method === 'GET') {
    // 获取订单基本信息和商品详情
    connection.query(`
      SELECT 
        o.id,
        o.order_no,
        o.total_amount,
        o.status,
        o.create_time,
        o.order_type,
        o.order_details,
        o.remark,
        oi.id as item_id,
        oi.product_id,
        oi.quantity,
        oi.price,
        p.title,
        p.image_url,
        p.original_price,
        p.description,
        c.id as category_id,
        c.name as category_name
      FROM orders o
      LEFT JOIN order_items oi ON o.id = oi.order_id
      LEFT JOIN products p ON oi.product_id = p.id
      LEFT JOIN categories c ON p.category_id = c.id
      ORDER BY o.create_time DESC
    `, (error, results) => {
      if (error) {
        console.error('获取订单列表失败:', error);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: '获取订单列表失败' }));
        return;
      }

      // 处理查询结果，组织成前端需要的格式
      const orders = new Map();
      results.forEach(row => {
        if (!orders.has(row.id)) {
          orders.set(row.id, {
            id: row.id,
            orderNo: row.order_no,
            totalAmount: row.total_amount,
            status: row.status,
            statusText: getStatusText(row.status),
            createTime: row.create_time,
            orderType: row.order_type,
            orderDetails: row.order_details ? JSON.parse(row.order_details) : {},
            remark: row.remark,
            items: []
          });
        }

        if (row.item_id) {
          orders.get(row.id).items.push({
            id: row.item_id,
            productId: row.product_id,
            title: row.title,
            price: row.price,
            quantity: row.quantity,
            image: row.image_url,
            originalPrice: row.original_price,
            description: row.description,
            categoryId: row.category_id,
            categoryName: row.category_name
          });
        }
      });

      console.log('订单列表数据:', Array.from(orders.values()));
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(Array.from(orders.values())));
    });
    return;
  } else if (req.url === '/api/orders' && req.method === 'POST') {
    // 处理订单创建请求
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });

    req.on('end', () => {
      try {
        const orderData = JSON.parse(body);
        
        // 生成订单编号
        const orderNo = 'OD' + Date.now();
        
        // 创建订单记录
        connection.query(
          'INSERT INTO orders (order_no, total_amount, status) VALUES (?, ?, ?)',
          [orderNo, orderData.totalAmount, 0],
          (error, result) => {
            if (error) {
              console.error('创建订单失败:', error);
              res.writeHead(500, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({ error: '创建订单失败' }));
              return;
            }

            const orderId = result.insertId;
            let completedItems = 0;
            const totalItems = orderData.items.length;

            // 创建订单项记录
            orderData.items.forEach(item => {
              connection.query(
                'INSERT INTO order_items (order_id, product_id, product_title, quantity, price) VALUES (?, ?, ?, ?, ?)',
                [orderId, item.id, item.title, item.quantity, item.price],
                (error) => {
                  completedItems++;
                  
                  if (error) {
                    console.error('创建订单项失败:', error);
                    return;
                  }

                  // 更新商品销量
                  connection.query(
                    'UPDATE products SET sales = sales + ? WHERE id = ?',
                    [item.quantity, item.id]
                  );

                  // 所有订单项都创建完成
                  if (completedItems === totalItems) {
                    res.writeHead(200, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({
                      success: true,
                      orderId,
                      orderNo
                    }));
                  }
                }
              );
            });
          }
        );
      } catch (error) {
        console.error('处理订单数据失败:', error);
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: '无效的订单数据' }));
      }
    });
  } else if (req.url === '/api/upload' && req.method === 'POST') {
    const form = new formidable.IncomingForm({
      uploadDir: uploadDir,
      keepExtensions: true,
      maxFileSize: 5 * 1024 * 1024 // 限制5MB
    });

    console.log('开始处理文件上传...');
    console.log('上传目录:', uploadDir);

    // 确保上传目录存在
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    form.parse(req, (err, fields, files) => {
      if (err) {
        console.error('文件上传错误:', err);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: '文件上传失败', details: err.message }));
        return;
      }

      console.log('接收到的文件:', files);
      
      // 获取上传的文件对象
      const fileArray = files.file;
      if (!fileArray || !fileArray[0]) {
        console.error('没有文件被上传');
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: '没有文件被上传' }));
        return;
      }

      try {
        const file = fileArray[0];
        console.log('完整的文件对象:', file);
        
        // 获取文件信息
        const newFileName = `${Date.now()}${path.extname(file.originalFilename || '') || '.png'}`;
        const newPath = path.join(uploadDir, newFileName);
        
        console.log('文件信息:', {
          原始名称: file.originalFilename || '未知',
          临时路径: file.filepath,
          新路径: newPath,
          文件大小: file.size,
          文件类型: file.mimetype
        });

        // 移动文件到目标目录
        fs.copyFileSync(file.filepath, newPath);
        fs.unlinkSync(file.filepath); // 删除临时文件

        // 生成文件URL
        const fileUrl = `/image/${newFileName}`;
        console.log('生成的文件URL:', fileUrl);

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ url: fileUrl }));
      } catch (error) {
        console.error('处理上传文件时发生错误:', error);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: '处理文件失败', details: error.message }));
      }
    });
  } else if (req.url.startsWith('/uploads/') && req.method === 'GET') {
    // 处理图片访问请求
    const imagePath = path.join(__dirname, req.url);
    const extname = path.extname(imagePath);
    const contentType = mimeTypes[extname] || 'application/octet-stream';

    fs.readFile(imagePath, (err, content) => {
      if (err) {
        if (err.code === 'ENOENT') {
          res.writeHead(404);
          res.end('Image not found');
        } else {
          res.writeHead(500);
          res.end('Server error');
        }
        return;
      }

      res.writeHead(200, { 'Content-Type': contentType });
      res.end(content);
    });
  } else if (req.url.startsWith('/api/search') && req.method === 'GET') {
    try {
      // 获取搜索关键词
      const urlParts = req.url.split('?');
      const searchParams = new URLSearchParams(urlParts[1] || '');
      const keyword = searchParams.get('keyword');
      console.log('搜索关键词:', keyword);

      if (!keyword) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: '请输入搜索关键词' }));
        return;
      }

      // 搜索商品
      const query = `
        SELECT 
          p.id,
          p.title,
          p.description,
          p.price,
          p.original_price,
          p.sales,
          p.image_url,
          c.id as category_id,
          c.name as category_name
        FROM products p
        LEFT JOIN categories c ON p.category_id = c.id
        WHERE p.title LIKE ? OR p.description LIKE ?
        ORDER BY p.sales DESC
      `;

      const searchKeyword = `%${keyword}%`;
      console.log('SQL查询:', query);
      console.log('查询参数:', [searchKeyword, searchKeyword]);

      connection.query(
        query,
        [searchKeyword, searchKeyword],
        (error, results) => {
          if (error) {
            console.error('数据库查询错误:', error);
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: '搜索失败', details: error.message }));
            return;
          }

          console.log('查询结果数量:', results.length);

          // 处理搜索结果
          const searchResults = results.map(item => ({
            id: item.id,
            title: item.title,
            desc: item.description,
            price: item.price,
            original_price: item.original_price,
            sales: item.sales,
            image: item.image_url,
            category: item.category_name,
            categoryId: item.category_id,
            quantity: 0
          }));

          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify(searchResults));
        }
      );
    } catch (error) {
      console.error('搜索接口异常:', error);
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: '搜索失败', details: error.message }));
    }
  } else if (req.url.match(/^\/api\/orders\/\d+\/receive$/) && req.method === 'POST') {
    // 处理订单接收
    const orderId = req.url.split('/')[3];
    
    // 更新订单状态为已完成(status=2)
    connection.query(
      'UPDATE orders SET status = 2 WHERE id = ?',
      [orderId],
      (error) => {
        if (error) {
          console.error('接收订单失败:', error);
          res.writeHead(500, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: '接收订单失败' }));
          return;
        }
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ 
          success: true,
          message: '订单已接收'
        }));
      }
    );
  } else {
    // 处理静态文件请求
    const filePath = path.join(__dirname, req.url);
    const extname = path.extname(filePath);
    const contentType = mimeTypes[extname] || 'application/octet-stream';

    fs.readFile(filePath, (err, content) => {
      if (err) {
        if (err.code === 'ENOENT') {
          res.writeHead(404);
          res.end('File not found');
        } else {
          res.writeHead(500);
          res.end('Server error');
        }
        return;
      }

      res.writeHead(200, { 'Content-Type': contentType });
      res.end(content);
    });
  }
});

// 启动服务器
const PORT = 3001;
server.listen(PORT, () => {
  console.log(`后台管理系统在 http://localhost:${PORT}/admin 运行`);
}); 

// 添加状态文本转换函数
function getStatusText(status) {
  switch (status) {
    case 0:
      return '待支付';
    case 1:
      return '已支付';
    case 2:
      return '已完成';
    case 3:
      return '已取消';
    default:
      return '未知状态';
  }
} 