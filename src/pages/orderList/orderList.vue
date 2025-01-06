<template>
  <view class="order-page">
    <!-- 订单列表 -->
    <view class="order-list">
      <view v-for="(order, index) in orders" :key="index" class="order-item">
        <!-- 订单头部 -->
        <view class="order-header">
          <text class="order-id">订单号: {{ order.id }}</text>
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
            <image :src="item.image" class="product-image" />
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
              <text>下单时间: {{ order.createdAt }}</text>
            </view>
            <text class="total-price">总价: ¥{{ order.totalPrice }}</text>
          </view>
          <view class="order-actions">
            <button class="delete-button" @click="handleDeleteOrder(order)">删除订单</button>
            <button v-if="order.status === '待支付'" class="pay-button" @click="payOrder(order.id)">立即支付</button>
            <button v-if="order.status === '已支付'" class="confirm-button"
              @click="handleConfirmReceive(order)">确认收货</button>
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
    async fetchOrders() {
      try {
        const result = await new Promise((resolve, reject) => {
          uni.request({
            url: 'http://localhost:3001/api/orders',
            method: 'GET',
            success: (res) => {
              resolve(res);
            },
            fail: (err) => {
              reject(err);
            }
          });
        });

        if (result.statusCode === 200) {
          // 转换订单数据格式以匹配UI显示
          this.orders = result.data.map(order => ({
            id: order.id,
            status: this.getOrderStatus(order.status),
            statusClass: this.getStatusClass(order.status),
            items: order.items.map(item => ({
              title: item.title,
              price: item.price,
              quantity: item.quantity,
              image: item.image
            })),
            totalPrice: order.totalAmount,
            deliveryType: order.deliveryType,
            address: order.address,
            phone: order.phone,
            diningMode: order.diningMode,
            pickupTime: order.pickupTime,
            remark: order.remark,
            createdAt: new Date(order.createTime).toLocaleString()
          }));
        } else {
          throw new Error(result.data.error || '获取订单列表失败');
        }
      } catch (error) {
        console.error('获取订单列表失败:', error);
        uni.showToast({
          title: '获取订单列表失败',
          icon: 'none'
        });
      }
    },

    // 获取订单状态显示文本
    getOrderStatus(status) {
      const statusMap = {
        0: '待支付',
        1: '已支付',
        2: '已完成',
        3: '已取消'
      };
      return statusMap[status] || status;
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

    goBack() {
      uni.navigateBack();
    },

    async payOrder(orderId) {
      try {
        const result = await new Promise((resolve, reject) => {
          uni.request({
            url: 'http://localhost:3001/api/orders/' + orderId + '/pay',
            method: 'POST',
            success: (res) => {
              resolve(res);
            },
            fail: (err) => {
              reject(err);
            }
          });
        });

        if (result.statusCode === 200) {
          uni.showToast({
            title: '支付成功',
            icon: 'success'
          });
          // 刷新订单列表
          this.fetchOrders();
        } else {
          throw new Error(result.data.error || '支付失败');
        }
      } catch (error) {
        uni.showToast({
          title: error.message || '支付失败',
          icon: 'none'
        });
      }
    },

    confirmReceipt(orderId) {
      console.log('确认收货订单:', orderId);
      // 处理确认收货逻辑
    },

    // 确认收货
    async handleConfirmReceive(order) {
      try {
        const result = await new Promise((resolve, reject) => {
          uni.request({
            url: 'http://localhost:3001/api/orders/' + order.id + '/receive',
            method: 'POST',
            success: (res) => {
              resolve(res);
            },
            fail: (err) => {
              reject(err);
            }
          });
        });

        if (result.statusCode === 200) {
          uni.showToast({
            title: '确认收货成功',
            icon: 'success'
          });
          this.fetchOrders(); // 刷新订单列表
        } else {
          throw new Error(result.data.error || '确认收货失败');
        }
      } catch (error) {
        uni.showToast({
          title: error.message || '确认收货失败',
          icon: 'none'
        });
      }
    },

    // 删除订单
    async handleDeleteOrder(order) {
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

        const result = await new Promise((resolve, reject) => {
          uni.request({
            url: 'http://localhost:3001/api/orders/' + order.id,
            method: 'DELETE',
            success: (res) => {
              resolve(res);
            },
            fail: (err) => {
              reject(err);
            }
          });
        });

        if (result.statusCode === 200) {
          uni.showToast({
            title: '删除成功',
            icon: 'success'
          });
          this.fetchOrders(); // 刷新订单列表
        } else {
          throw new Error(result.data.error || '删除失败');
        }
      } catch (error) {
        if (error.message !== '用户取消') {
          uni.showToast({
            title: error.message || '删除失败',
            icon: 'none'
          });
        }
      }
    },

    // 获取订单总数量
    getTotalQuantity(order) {
      return order.items.reduce((sum, item) => sum + item.quantity, 0);
    }
  },
  onLoad() {
    this.fetchOrders();
  }
};
</script>

<style scoped>
/* 顶部导航栏 */
.top-bar {
  display: flex;
  align-items: center;
  padding: 10px;
  background-color: #fc4353;
  color: white;
  margin-top: 10%;
}

.back-icon {
  width: 24px;
  height: 24px;
  cursor: pointer;
}

.page-title {
  font-size: 18px;
  font-weight: bold;
  margin-left: 10px;
}

/* 订单列表 */
.order-list {
  padding: 20px;
}

.order-item {
  background-color: white;
  margin-bottom: 15px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.order-header {
  display: flex;
  justify-content: space-between;
  padding: 15px;
  border-bottom: 1px solid #ddd;
}

.order-id {
  font-size: 16px;
  color: #333;
}

.order-status {
  font-size: 16px;
  font-weight: bold;
}

.order-status.pending {
  color: #fc4353;
}

.order-status.shipped {
  color: #4caf50;
}

/* 商品信息 */
.order-details {
  padding: 10px;
}

.order-product {
  display: flex;
  padding: 10px 0;
  border-bottom: 1px solid #ddd;
}

.product-image {
  width: 60px;
  height: 60px;
  object-fit: cover;
}

.product-info {
  margin-left: 10px;
  flex: 1;
}

.product-title {
  font-size: 16px;
  font-weight: bold;
}

.product-price,
.product-quantity {
  font-size: 14px;
  color: #888;
}

/* 订单底部 */
.order-footer {
  padding: 15px;
  border-top: 1px solid #eee;
}

.order-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
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
  margin-top: 10px;
}

.pay-button,
.confirm-button,
.delete-button {
  min-width: 100px;
  padding: 8px 15px;
  border-radius: 5px;
  cursor: pointer;
  font-size: 14px;
  text-align: center;
}

.pay-button {
  background-color: #fc4353;
  color: white;
  border: none;
}

.confirm-button {
  background-color: #4caf50;
  color: white;
  border: none;
}

.delete-button {
  border: 1px solid #ff4444;
  background-color: white;
  color: #ff4444;
}

.delete-button:hover {
  background-color: #ff4444;
  color: white;
}

/* 添加新的样式 */
.delivery-info {
  padding: 10px 15px;
  background-color: #f8f9fa;
  font-size: 14px;
  color: #666;
}

.delivery-info>text {
  display: block;
  margin: 5px 0;
}

.delivery-type {
  font-weight: bold;
  color: #333;
}

.remark {
  padding: 10px 15px;
  border-top: 1px solid #eee;
}

.remark-label {
  color: #666;
  font-size: 14px;
}

.remark-content {
  color: #333;
  font-size: 14px;
  margin-left: 5px;
}

.order-time {
  font-size: 12px;
  color: #999;
  margin-bottom: 5px;
}

/* 状态样式 */
.order-status.paid {
  color: #2196f3;
}

.order-status.preparing {
  color: #ff9800;
}

.order-status.delivering {
  color: #9c27b0;
}

.order-status.completed {
  color: #4caf50;
}

.order-status.cancelled {
  color: #9e9e9e;
}

.delete-button {
  padding: 8px 15px;
  border: 1px solid #ff4444;
  border-radius: 5px;
  cursor: pointer;
  font-size: 14px;
  background-color: white;
  color: #ff4444;
}

.delete-button:hover {
  background-color: #ff4444;
  color: white;
}
</style>
