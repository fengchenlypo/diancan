<template>
  <view class="order-page">
    <!-- 顶部导航栏 -->
    <view class="top-bar">
      <image class="back-icon" src="../../static/back.png" @click="goBack" />
      <text class="page-title">我的订单</text>
    </view>

    <!-- 订单列表 -->
    <view class="order-list">
      <view v-for="(order, index) in orders" :key="index" class="order-item">
        <!-- 订单头部 -->
        <view class="order-header">
          <text class="order-id">订单号: {{ order.id }}</text>
          <text class="order-status" :class="order.statusClass">{{ order.status }}</text>
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

        <!-- 订单总价和操作按钮 -->
        <view class="order-footer">
          <text class="total-price">总价: ¥{{ order.totalPrice }}</text>
          <view class="order-actions">
            <button v-if="order.status === '待支付'" class="pay-button" @click="payOrder(order.id)">立即支付</button>
            <button v-if="order.status === '待收货'" class="confirm-button" @click="confirmReceipt(order.id)">确认收货</button>
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
      orders: [
        {
          id: '1234567890',
          status: '待支付',
          statusClass: 'pending',
          items: [
            { title: '宫保鸡丁', price: 58, quantity: 1, image: 'https://example.com/gongbaojiding.png' },
            { title: '麻辣小龙虾', price: 88, quantity: 2, image: 'https://example.com/malaxiaolongxia.png' },
          ],
          totalPrice: 234,
        },
        {
          id: '0987654321',
          status: '待收货',
          statusClass: 'shipped',
          items: [
            { title: '烧鹅', price: 98, quantity: 1, image: 'https://example.com/shaoye.png' },
            { title: '白切鸡', price: 68, quantity: 1, image: 'https://example.com/baiqieji.png' },
          ],
          totalPrice: 166,
        },
      ],
    };
  },
  methods: {
    goBack() {
      uni.navigateBack();
    },
    payOrder(orderId) {
      console.log('支付订单:', orderId);
      // 处理支付逻辑
    },
    confirmReceipt(orderId) {
      console.log('确认收货订单:', orderId);
      // 处理确认收货逻辑
    },
  },
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
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.total-price {
  font-size: 16px;
  font-weight: bold;
  color: #fc4353;
}

.order-actions {
  display: flex;
  gap: 10px;
}

.pay-button,
.confirm-button {
  padding: 8px 15px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-size: 14px;
}

.pay-button {
  background-color: #fc4353;
  color: white;
}

.confirm-button {
  background-color: #4caf50;
  color: white;
}
</style>
