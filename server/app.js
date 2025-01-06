const mysql = require('mysql2');
const http = require('http');

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

// 创建HTTP服务器
const server = http.createServer((req, res) => {
  // 设置CORS头
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  // 处理OPTIONS请求
  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  // 处理API路由
  if (req.url === '/api/categories' && req.method === 'GET') {
    // 获取分类和商品列表
    connection.query(
      'SELECT c.*, p.* FROM categories c LEFT JOIN products p ON c.id = p.category_id ORDER BY c.sort_order, p.sort_order',
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
              name: row.name,
              items: []
            });
            categories.push(categoryMap.get(row.category_id));
          }

          if (row.id) { // 确保产品存在
            categoryMap.get(row.category_id).items.push({
              id: row.id,
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
  } else if (req.url === '/api/orders' && req.method === 'GET') {
    // 获取订单列表
    const query = `
      SELECT 
        o.id, 
        o.order_no, 
        o.table_no,
        o.total_amount,
        o.status,
        o.remark,
        o.create_time,
        oi.product_id,
        oi.product_title,
        oi.quantity,
        oi.price,
        p.image_url,
        p.description
      FROM orders o
      LEFT JOIN order_items oi ON o.id = oi.order_id
      LEFT JOIN products p ON oi.product_id = p.id
      ORDER BY o.create_time DESC
    `;

    connection.query(query, (error, results) => {
      if (error) {
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
            tableNo: row.table_no,
            totalAmount: row.total_amount,
            status: row.status,
            statusText: ['待支付', '已支付', '已完成', '已取消'][row.status],
            remark: row.remark,
            createTime: row.create_time,
            items: []
          });
        }

        if (row.product_id) {
          orders.get(row.id).items.push({
            productId: row.product_id,
            title: row.product_title,
            quantity: row.quantity,
            price: row.price,
            image: row.image_url,
            desc: row.description
          });
        }
      });

      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(Array.from(orders.values())));
    });
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
              // 先获取商品信息
              connection.query(
                'SELECT title, description, image_url FROM products WHERE id = ?',
                [item.id],
                (error, results) => {
                  if (error || results.length === 0) {
                    console.error('获取商品信息失败:', error);
                    completedItems++;
                    return;
                  }

                  const product = results[0];
                  // 插入订单项
                  connection.query(
                    'INSERT INTO order_items (order_id, product_id, product_title, quantity, price) VALUES (?, ?, ?, ?, ?)',
                    [orderId, item.id, product.title, item.quantity, item.price],
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
                          orderId,
                          orderNo
                        }));
                      }
                    }
                  );
                }
              );
            });
          }
        );
      } catch (error) {
        console.error('解析订单数据失败:', error);
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: '无效的订单数据' }));
      }
    });
  } else if (req.url.match(/^\/api\/orders\/\d+\/pay$/) && req.method === 'POST') {
    // 处理支付请求
    const orderId = req.url.split('/')[3];
    connection.query(
      'UPDATE orders SET status = 1 WHERE id = ?',
      [orderId],
      (error, result) => {
        if (error) {
          res.writeHead(500, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: '支付失败' }));
          return;
        }

        if (result.affectedRows === 0) {
          res.writeHead(404, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: '订单不存在' }));
          return;
        }

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ message: '支付成功' }));
      }
    );
  } else if (req.url.match(/^\/api\/orders\/\d+\/receive$/) && req.method === 'POST') {
    // 处理确认收货请求
    const orderId = req.url.split('/')[3];
    connection.query(
      'UPDATE orders SET status = 2 WHERE id = ?',
      [orderId],
      (error, result) => {
        if (error) {
          res.writeHead(500, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: '确认收货失败' }));
          return;
        }

        if (result.affectedRows === 0) {
          res.writeHead(404, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: '订单不存在' }));
          return;
        }

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ message: '确认收货成功' }));
      }
    );
  } else if (req.url.match(/^\/api\/orders\/\d+$/) && req.method === 'DELETE') {
    // 处理删除订单请求
    const orderId = req.url.split('/')[3];
    connection.query(
      'DELETE FROM order_items WHERE order_id = ?',
      [orderId],
      (error) => {
        if (error) {
          res.writeHead(500, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: '删除订单失败' }));
          return;
        }

        connection.query(
          'DELETE FROM orders WHERE id = ?',
          [orderId],
          (error, result) => {
            if (error) {
              res.writeHead(500, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({ error: '删除订单失败' }));
              return;
            }

            if (result.affectedRows === 0) {
              res.writeHead(404, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({ error: '订单不存在' }));
              return;
            }

            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ message: '删除订单成功' }));
          }
        );
      }
    );
  } else if (req.url.match(/^\/api\/orders\/\d+$/) && req.method === 'GET') {
    // 获取单个订单详情
    const orderId = req.url.split('/')[3];
    const query = `
      SELECT 
        o.id, 
        o.order_no, 
        o.table_no,
        o.total_amount,
        o.status,
        o.remark,
        o.create_time,
        oi.product_id,
        oi.product_title,
        oi.quantity,
        oi.price,
        p.image_url,
        p.description
      FROM orders o
      LEFT JOIN order_items oi ON o.id = oi.order_id
      LEFT JOIN products p ON oi.product_id = p.id
      WHERE o.id = ?
    `;

    connection.query(query, [orderId], (error, results) => {
      if (error) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: '获取订单详情失败' }));
        return;
      }

      if (results.length === 0) {
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: '订单不存在' }));
        return;
      }

      // 处理查询结果，组织成前端需要的格式
      const order = {
        id: results[0].id,
        orderNo: results[0].order_no,
        tableNo: results[0].table_no,
        totalAmount: results[0].total_amount,
        status: results[0].status,
        statusText: ['待支付', '已支付', '已完成', '已取消'][results[0].status],
        remark: results[0].remark,
        createTime: results[0].create_time,
        items: results.map(row => ({
          productId: row.product_id,
          title: row.product_title,
          quantity: row.quantity,
          price: row.price,
          image: row.image_url,
          desc: row.description
        }))
      };

      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(order));
    });
  } else if (req.url.startsWith('/api/search') && req.method === 'GET') {
    // 解析查询参数
    const urlParts = new URL(req.url, `http://${req.headers.host}`);
    const keyword = urlParts.searchParams.get('keyword');

    if (!keyword) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: '请提供搜索关键词' }));
      return;
    }

    // 构建搜索查询
    const searchQuery = `
      SELECT 
        p.*,
        c.name as category_name
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE 
        p.title LIKE ? OR 
        p.description LIKE ? OR
        c.name LIKE ?
      ORDER BY p.sales DESC
    `;

    const searchKeyword = `%${keyword}%`;
    
    connection.query(
      searchQuery,
      [searchKeyword, searchKeyword, searchKeyword],
      (error, results) => {
        if (error) {
          res.writeHead(500, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: '搜索失败' }));
          return;
        }

        // 处理搜索结果
        const searchResults = results.map(item => ({
          id: item.id,
          title: item.title,
          description: item.description,
          price: item.price,
          original_price: item.original_price,
          sales: item.sales,
          image_url: item.image_url,
          category_name: item.category_name
        }));

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(searchResults));
      }
    );
  } else {
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: '接口不存在' }));
  }
});

// 启动服务器
const PORT = 3001;
server.listen(PORT, () => {
  console.log(`服务器运行在 http://localhost:${PORT}`);
}); 