<template>
  <view class="order-page">
    <!-- 订单列表 -->
    <view class="order-list">
      <view v-for="(order, index) in orders" :key="index" class="order-item">
        <!-- 订单头部 -->
        <view class="order-header">
          <text class="order-id">订单号: {{ order.orderNo }}</text>
          <text class="order-status" :class="order.statusClass">{{ order.status }}</text>
        </view>

        <!-- 配送信息 -->
        <view class="delivery-info">
          <text class="delivery-type">{{ order.deliveryType }}</text>
          <text v-if="order.address" class="address">配送地址: {{ order.address }}</text>
          <text v-if="order.diningMode" class="dining-mode">就餐方式: {{ order.diningMode }}</text>
          <text v-if="order.pickupTime" class="pickup-time">取餐时间: {{ order.pickupTime }}</text>
          <text v-if="order.phone" class="phone">联系电话: {{ order.phone }}</text>
        </view>

        <!-- 商品信息 -->
        <view class="order-details">
          <view v-for="(item, idx) in order.items" :key="idx" class="order-product">
            <image :src="item.image" class="product-image" mode="aspectFill" />
            <view class="product-info">
              <text class="product-title">{{ item.title }}</text>
              <text class="product-price">¥{{ item.price }}</text>
              <text class="product-quantity">×{{ item.quantity }}</text>
            </view>
          </view>
        </view>

        <!-- 备注信息 -->
        <view v-if="order.remark" class="remark">
          <text class="remark-label">备注：</text>
          <text class="remark-content">{{ order.remark }}</text>
        </view>

        <!-- 订单总价和操作按钮 -->
        <view class="order-footer">
          <view class="order-info">
            <view class="order-time">
              <text>下单时间: {{ formatTime(order.createTime) }}</text>
            </view>
            <text class="total-price">总价: ¥{{ order.totalAmount }}</text>
          </view>
          <view class="order-actions">
            <button class="delete-button" @click="handleDelete(order)">删除订单</button>
            <button v-if="order.status === '待支付'" class="pay-button" @click="handlePay(order)">立即支付</button>
            <button v-if="order.status === '已支付'" class="confirm-button" @click="handleReceive(order)">确认收货</button>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      orders: []
    };
  },
  methods: {
    // 获取订单列表
    async fetchOrders() {
      try {
        console.log('开始获取订单列表');
        const response = await uni.request({
          url: 'http://localhost:3001/api/orders',
          method: 'GET'
        });

        console.log('获取订单列表响应:', response);

        if (response.statusCode === 200) {
          // 转换订单数据格式以匹配UI显示
          this.orders = response.data.map(order => {
            console.log('处理订单数据:', order);

            // 解析订单详情
            let orderDetails = {};
            try {
              if (order.orderDetails) {
                orderDetails = typeof order.orderDetails === 'string'
                  ? JSON.parse(order.orderDetails)
                  : order.orderDetails;
              }
            } catch (e) {
              console.error('解析订单详情失败:', e);
            }

            console.log('解析后的订单详情:', orderDetails);

            return {
              id: order.id,
              orderNo: order.orderNo,
              status: this.getStatusText(order.status),
              statusClass: this.getStatusClass(order.status),
              items: order.items.map(item => ({
                title: item.title,
                price: item.price,
                quantity: item.quantity,
                image: item.image
              })),
              totalAmount: order.totalAmount,
              deliveryType: order.orderType,
              orderType: order.orderType,
              address: orderDetails.address || '',
              phone: orderDetails.phone || '',
              diningMode: orderDetails.diningType || '',
              pickupTime: orderDetails.pickupTime || '',
              orderDetails: orderDetails,
              remark: order.remark || '',
              createTime: order.createTime
            };
          });
        } else {
          throw new Error(response.data.error || '获取订单列表失败');
        }
      } catch (error) {
        console.error('获取订单列表失败:', error);
        uni.showToast({
          title: '获取订单列表失败',
          icon: 'none'
        });
      }
    },

    // 格式化时间
    formatTime(timestamp) {
      if (!timestamp) return '';
      const date = new Date(timestamp);
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const hour = String(date.getHours()).padStart(2, '0');
      const minute = String(date.getMinutes()).padStart(2, '0');
      return `${year}-${month}-${day} ${hour}:${minute}`;
    },

    // 获取状态文本
    getStatusText(status) {
      const statusMap = {
        0: '待支付',
        1: '已支付',
        2: '已完成',
        3: '已取消'
      };
      return statusMap[status] || '未知状态';
    },

    // 获取状态对应的样式类
    getStatusClass(status) {
      const classMap = {
        0: 'pending',
        1: 'paid',
        2: 'completed',
        3: 'cancelled'
      };
      return classMap[status] || 'default';
    },

    // 处理支付
    async handlePay(order) {
      try {
        // 检查订单信息是否完整
        const orderDetails = order.orderDetails || {};

        // 检查订单类型
        if (!order.orderType) {
          uni.showToast({
            title: '订单类型错误',
            icon: 'none'
          });
          this.navigateToOrderPage(order);
          return;
        }

        // 根据订单类型检查必填信息
        switch (order.orderType) {
          case 'takeout':
            // 外卖订单：检查手机号和地址
            if (!orderDetails.phone || !orderDetails.address) {
              uni.showToast({
                title: '请填写手机号和配送地址',
                icon: 'none'
              });
              this.navigateToOrderPage(order);
              return;
            }
            break;

          case 'pickup':
            // 自取订单：检查手机号和取餐时间
            if (!orderDetails.phone || !orderDetails.pickupTime) {
              uni.showToast({
                title: '请填写手机号和取餐时间',
                icon: 'none'
              });
              this.navigateToOrderPage(order);
              return;
            }
            break;

          case 'dine-in':
            // 堂食订单：检查桌号
            if (!orderDetails.tableNumber) {
              uni.showToast({
                title: '请选择桌号',
                icon: 'none'
              });
              this.navigateToOrderPage(order);
              return;
            }
            break;

          default:
            uni.showToast({
              title: '订单类型错误',
              icon: 'none'
            });
            return;
        }

        // 检查订单金额
        if (!order.totalAmount || order.totalAmount <= 0) {
          uni.showToast({
            title: '订单金额错误',
            icon: 'none'
          });
          return;
        }

        // 发起支付请求
        const response = await uni.request({
          url: `http://localhost:3001/api/orders/${order.id}/pay`,
          method: 'POST',
          data: {
            orderType: order.orderType,
            orderDetails: orderDetails
          }
        });

        if (response.statusCode === 200) {
          uni.showToast({
            title: '支付成功',
            icon: 'success'
          });
          this.fetchOrders(); // 刷新订单列表
        } else {
          throw new Error(response.data.error || '支付失败');
        }
      } catch (error) {
        console.error('支付失败:', error);
        uni.showToast({
          title: error.message || '支付失败',
          icon: 'none'
        });
      }
    },

    // 跳转到订单页面
    navigateToOrderPage(order) {
      try {
        // 准备订单数据
        const orderData = {
          id: order.id,
          orderNo: order.orderNo,
          status: order.status,
          type: order.orderType,
          orderDetails: order.orderDetails || {},
          items: order.items || [],
          totalAmount: order.totalAmount || 0,
          remark: order.remark || '',
          address: order.address || '',
          phone: order.phone || '',
          pickupTime: order.pickupTime || '',
          diningMode: order.diningMode || '',
          createTime: order.createTime
        };

        console.log('准备传递的订单数据:', orderData);

        // 将数据存储到本地
        uni.setStorageSync('currentOrderData', orderData);

        // 使用 navigateTo 跳转到订单页面，使用orderId作为参数名
        uni.navigateTo({
          url: `/pages/order/order?orderId=${order.id}&orderType=${order.orderType}&from=list`,
          success: () => {
            console.log('跳转成功');
          },
          fail: (err) => {
            console.error('跳转失败:', err);
            uni.showToast({
              title: '跳转失败',
              icon: 'none'
            });
          }
        });
      } catch (error) {
        console.error('跳转失败:', error);
        uni.showToast({
          title: '跳转失败',
          icon: 'none'
        });
      }
    },

    // 处理确认收货
    async handleReceive(order) {
      try {
        const response = await uni.request({
          url: `http://localhost:3001/api/orders/${order.id}/receive`,
          method: 'POST'
        });

        if (response.statusCode === 200) {
          uni.showToast({
            title: '确认收货成功',
            icon: 'success'
          });
          this.fetchOrders(); // 刷新订单列表
        } else {
          throw new Error('确认收货失败');
        }
      } catch (error) {
        console.error('确认收货失败:', error);
        uni.showToast({
          title: '确认收货失败',
          icon: 'none'
        });
      }
    },

    // 处理删除
    async handleDelete(order) {
      try {
        // 先弹窗确认
        await new Promise((resolve, reject) => {
          uni.showModal({
            title: '确认删除',
            content: '确定要删除这个订单吗？',
            success: (res) => {
              if (res.confirm) {
                resolve();
              } else {
                reject(new Error('用户取消'));
              }
            }
          });
        });

        const response = await uni.request({
          url: `http://localhost:3001/api/orders/${order.id}`,
          method: 'DELETE'
        });

        if (response.statusCode === 200) {
          uni.showToast({
            title: '删除成功',
            icon: 'success'
          });
          this.fetchOrders(); // 刷新订单列表
        } else {
          throw new Error('删除失败');
        }
      } catch (error) {
        if (error.message !== '用户取消') {
          console.error('删除失败:', error);
          uni.showToast({
            title: '删除失败',
            icon: 'none'
          });
        }
      }
    }
  },
  onShow() {
    this.fetchOrders();
  }
};
</script>

<style scoped>
/* 保持原有样式 */
.order-page {
  padding: 10px;
  background: #f5f5f5;
  min-height: 100vh;
}

.order-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.order-item {
  background: #fff;
  border-radius: 8px;
  padding: 15px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.order-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.order-id {
  font-size: 14px;
  color: #666;
}

.order-status {
  font-size: 14px;
  font-weight: bold;
}

.order-status.pending {
  color: #fc4353;
}

.order-status.paid {
  color: #2196f3;
}

.order-status.completed {
  color: #4caf50;
}

.order-status.cancelled {
  color: #9e9e9e;
}

.delivery-info {
  background: #f8f9fa;
  padding: 10px;
  border-radius: 4px;
  margin-bottom: 10px;
}

.delivery-info text {
  display: block;
  font-size: 12px;
  color: #666;
  margin: 2px 0;
}

.order-details {
  margin: 10px 0;
}

.order-product {
  display: flex;
  align-items: center;
  padding: 10px 0;
  border-bottom: 1px solid #f0f0f0;
}

.product-image {
  width: 60px;
  height: 60px;
  border-radius: 4px;
  margin-right: 10px;
}

.product-info {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.product-title {
  font-size: 14px;
  color: #333;
  margin-bottom: 4px;
}

.product-price {
  font-size: 14px;
  color: #fc4353;
}

.product-quantity {
  font-size: 12px;
  color: #999;
}

.remark {
  margin: 10px 0;
  font-size: 12px;
  color: #666;
}

.order-footer {
  margin-top: 10px;
  border-top: 1px solid #f0f0f0;
  padding-top: 10px;
}

.order-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.order-time {
  font-size: 12px;
  color: #999;
}

.total-price {
  font-size: 16px;
  font-weight: bold;
  color: #fc4353;
}

.order-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

.pay-button,
.confirm-button,
.delete-button {
  font-size: 12px;
  padding: 4px 12px;
  border-radius: 15px;
  margin: 0;
}

.pay-button {
  color: #fff;
  background: #fc4353;
  border: 1px solid #fc4353;
}

.confirm-button {
  color: #fff;
  background: #67c23a;
  border: 1px solid #67c23a;
}

.delete-button {
  color: #666;
  border: 1px solid #ddd;
  background: #fff;
}
</style>
