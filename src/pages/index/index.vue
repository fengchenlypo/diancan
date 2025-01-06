<template>
  <view class="content">
    <!-- 顶部搜索栏 -->
    <view class="top">
      <view class="background"></view>
      <view class="foreground">
        <image class="touxian" src="../../static/touxian.png" />
        <text class="title">美食广场</text>
      </view>
    </view>

    <!-- 订单和分类导航容器 -->
    <view class="order-and-cate-container">
      <!-- 订单标题 -->
      <view class="order-title">
        <text class="order-text">美食广场</text>
        <image class="search-img" src="../../static/search.png" @click="goToSearchPage" />
      </view>

      <!-- 配送费和我的订单 -->
      <view class="order-info">
        <text class="delivery-fee">配送费 1.00元</text>
        <view class="my-order">
          <image class="order-icon" src="../../static/order.png" />
          <text class="my-order-text" @click="goToOrderlistPage">我的订单</text>
        </view>
      </view>

      <!-- 分类导航 -->
      <view class="cate-container">
        <!-- 左侧分类导航 -->
        <view class="cate-left">
          <view v-for="(category, index) in categories" :key="index"
            :class="['cate-item', { active: activeIndex === index }]" @click="selectCategory(index)">
            {{ category.name }}
          </view>
        </view>

        <!-- 右侧商品列表 -->
        <scroll-view class="cate-right" scroll-y>
          <view v-for="(item, idx) in filteredItems" :key="item.id" class="cate-content">
            <image :src="item.image" mode="aspectFill" class="item-image" lazy-load />
            <view class="item-info">
              <text class="item-title">{{ item.title }}</text>
              <view class="item-desc">
                <text>{{ item.desc }}</text>
                <text class="item-sales">月销量：{{ item.sales }}</text>
              </view>
              <view class="item-bottom">
                <view class="price-box">
                  <text class="price">¥{{ item.price }}</text>
                  <text class="original-price" v-if="item.original_price">¥{{ item.original_price }}</text>
                </view>
                <view class="stepper" :class="{ 'only-plus': !item.quantity }">
                  <button v-if="item.quantity > 0" class="minus" @click="decreaseQuantity(item)">-</button>
                  <input v-if="item.quantity > 0" type="number" :value="item.quantity"
                    @input="updateQuantity(item, $event)" min="1" />
                  <button class="plus" @click="increaseQuantity(item)">+</button>
                </view>
              </view>
            </view>
          </view>
        </scroll-view>
      </view>
    </view>

    <!-- 底部订单区域 -->
    <view class="bottom-order-container">
      <view class="order-info-bottom">
        <view class="order-icon-container">
          <image class="order-icon" src="../../static/cart.png" @click="toggleCartPopup" />
          <!-- 添加角标 -->
          <view v-if="totalSelectedItems > 0" class="badge">{{ totalSelectedItems }}</view>
        </view>
      </view>
      <view class="total-price-container">
        <text class="total-price">合计: ¥{{ totalPrice }}</text>
      </view>
      <button class="confirm-button" @click="confirmOrder">确认</button>
    </view>

    <!-- 购物车弹窗 -->
    <view v-if="cartPopupVisible" class="cart-popup">
      <view class="cart-popup-content">
        <view class="cart-header">
          <text class="cart-title">购物车</text>
          <button class="close-btn" @click="toggleCartPopup">×</button>
        </view>
        <view class="cart-items">
          <view v-for="(item, idx) in cartItems" :key="idx" class="cart-item">
            <image :src="item.image" class="cart-item-image" />
            <view class="cart-item-info">
              <text class="cart-item-title">{{ item.title }}</text>
              <text class="cart-item-price">¥{{ item.price }}</text>
              <view class="quantity-selector">
                <button @click="decreaseCartItemQuantity(item)">-</button>
                <input type="number" :value="item.quantity" @input="updateCartItemQuantity(item, $event)" min="1" />
                <button @click="increaseCartItemQuantity(item)">+</button>
              </view>
            </view>
          </view>
        </view>
        <view class="cart-footer">
          <text class="cart-total-price">总价: ¥{{ totalPrice }}</text>
          <button class="checkout-btn" @click="confirmOrder">结算</button>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      categories: [],
      activeIndex: 0,
      totalPrice: '0.00',
      selectedItems: {},
      cartPopupVisible: false
    };
  },
  methods: {
    // 获取菜品分类和列表
    async fetchCategories() {
      try {
        const result = await new Promise((resolve, reject) => {
          uni.request({
            url: 'http://localhost:3001/api/categories',
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
          this.categories = result.data.map(category => ({
            ...category,
            items: category.items.map(item => ({
              ...item,
              quantity: 0
            }))
          }));
          this.updateSelectedItems();
        } else {
          throw new Error(result.data.error || '获取数据失败');
        }
      } catch (error) {
        console.error('获取菜品列表失败:', error);
        uni.showToast({
          title: '获取菜品列表失败',
          icon: 'none'
        });
      }
    },

    // 提交订单
    async confirmOrder() {
      // 收集已选择的商品
      const selectedItems = [];
      this.categories.forEach(category => {
        category.items.forEach(item => {
          if (item.quantity > 0) {
            selectedItems.push({
              id: item.id,
              quantity: item.quantity,
              price: item.price
            });
          }
        });
      });

      if (selectedItems.length === 0) {
        uni.showToast({
          title: '请先选择商品',
          icon: 'none'
        });
        return;
      }

      try {
        const result = await new Promise((resolve, reject) => {
          uni.request({
            url: 'http://localhost:3001/api/orders',
            method: 'POST',
            data: {
              items: selectedItems,
              totalAmount: parseFloat(this.totalPrice)
            },
            success: (res) => {
              resolve(res);
            },
            fail: (err) => {
              reject(err);
            }
          });
        });

        if (result.statusCode === 200) {
          // 跳转到订单页面
          uni.navigateTo({
            url: '/pages/order/order',
            success: function (res) {
              // 传递订单数据
              res.eventChannel.emit('acceptDataFromOpenerPage', {
                orderId: result.data.orderId,
                orderNo: result.data.orderNo,
                items: selectedItems.map(item => {
                  const product = this.findProduct(item.id);
                  return {
                    ...item,
                    title: product.title,
                    desc: product.desc,
                    image: product.image
                  };
                }),
                totalAmount: this.totalPrice
              });
            }.bind(this)
          });

          // 清空购物车
          this.clearCart();
        } else {
          throw new Error(result.data.error || '下单失败');
        }
      } catch (error) {
        console.error('提交订单失败:', error);
        uni.showToast({
          title: error.message || '提交订单失败',
          icon: 'none'
        });
      }
    },

    // 根据商品ID查找商品信息
    findProduct(productId) {
      for (const category of this.categories) {
        const product = category.items.find(item => item.id === productId);
        if (product) {
          return product;
        }
      }
      return null;
    },

    // 其他方法保持不变
    selectCategory(index) {
      this.activeIndex = index;
    },

    goToSearchPage() {
      uni.navigateTo({
        url: '/pages/search/search'
      });
    },

    goToOrderlistPage() {
      uni.navigateTo({
        url: '/pages/orderList/orderList'
      });
    },

    increaseQuantity(item) {
      item.quantity++;
      this.updateTotalPrice();
      this.updateSelectedItems();
    },

    decreaseQuantity(item) {
      if (item.quantity > 0) {
        item.quantity--;
        this.updateTotalPrice();
        this.updateSelectedItems();
      }
    },

    updateQuantity(item, event) {
      const value = event.detail.value;
      if (value && value > 0) {
        item.quantity = parseInt(value, 10);
      } else {
        item.quantity = 0;
      }
      this.updateTotalPrice();
      this.updateSelectedItems();
    },

    updateTotalPrice() {
      let total = 0;
      this.categories.forEach(category => {
        category.items.forEach(item => {
          total += item.price * item.quantity;
        });
      });
      this.totalPrice = total.toFixed(2);
    },

    updateSelectedItems() {
      const newSelectedItems = {};
      this.categories.forEach(category => {
        const count = category.items.reduce((sum, item) => sum + item.quantity, 0);
        if (count > 0) {
          newSelectedItems[category.name] = count;
        }
      });
      this.selectedItems = newSelectedItems;
    },

    // 清空购物车
    clearCart() {
      this.categories.forEach(category => {
        category.items.forEach(item => {
          item.quantity = 0;
        });
      });
      this.updateTotalPrice();
      this.updateSelectedItems();
    },

    // 切换购物车弹窗显示状态
    toggleCartPopup() {
      this.cartPopupVisible = !this.cartPopupVisible;
    },

    // 增加购物车中商品数量
    increaseCartItemQuantity(item) {
      this.increaseQuantity(item);
    },

    // 减少购物车中商品数量
    decreaseCartItemQuantity(item) {
      this.decreaseQuantity(item);
    },

    // 更新购物车中商品数量
    updateCartItemQuantity(item, event) {
      this.updateQuantity(item, event);
    }
  },
  computed: {
    activeCategory() {
      return this.categories[this.activeIndex];
    },
    filteredItems() {
      return this.activeCategory?.items || [];
    },
    totalSelectedItems() {
      let total = 0;
      Object.values(this.selectedItems).forEach(count => total += count);
      return total;
    },
    cartItems() {
      const items = [];
      this.categories.forEach(category => {
        category.items.forEach(item => {
          if (item.quantity > 0) {
            items.push(item);
          }
        });
      });
      return items;
    }
  },
  onLoad() {
    this.fetchCategories();
  },
  onShow() {
    // 页面显示时更新选中状态和总价
    this.updateSelectedItems();
    this.updateTotalPrice();
  }
};
</script>

<style scoped>
/* 搜索图片 */
.search-img {
  width: 24px;
  height: 24px;
  cursor: pointer;
}

.content {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.top {
  width: 100%;
  height: 150px;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: flex-start;
  overflow: hidden;
}

.background {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-image: url("../../static/logo.png");
  background-size: cover;
  background-position: center;
  filter: blur(10px);
  z-index: 1;
}

.foreground {
  position: relative;
  display: flex;
  align-items: center;
  padding-left: 20px;
  z-index: 2;
}

.touxian {
  width: 80px;
  height: 80px;
  border-radius: 50%;
}

.title {
  font-size: 24px;
  font-weight: bold;
  color: white;
}

/* 订单和分类导航容器 */
.order-and-cate-container {
  position: relative;
  margin-top: -40px;
  z-index: 2;
}

.order-title {
  background-color: white;
  padding: 15px;
  border-radius: 15px 15px 0 0;
  margin-top: 10px;
  text-align: center;
  display: flex;
  justify-content: space-between;
}

.order-text {
  font-size: 18px;
  font-weight: bold;
}

/* 配送费和我的订单部分 */
.order-info {
  display: flex;
  justify-content: space-between;
  padding: 10px 20px;
  align-items: center;
}

.delivery-fee {
  font-size: 16px;
  color: #666;
}

.my-order {
  display: flex;
  align-items: center;
}

.order-icon {
  width: 40px;
  height: 40px;
  margin-right: 8px;
}

.my-order-text {
  font-size: 16px;
  color: #fc4353;
}

/* 分类导航 */
.cate-container {
  display: flex;
  flex: 1;
  padding-bottom: 70px;
  /* 为底部订单栏留出空间 */
}

.cate-left {
  width: 25%;
  border-right: 1px solid #ddd;
  padding: 10px;
  position: sticky;
  top: 0;
  background-color: white;
  z-index: 2;
  height: calc(100vh - 220px);
  /* 减去顶部和底部的高度 */
}

.cate-item {
  cursor: pointer;
  padding: 10px;
  transition: background-color 0.3s ease;
}

.cate-item.active {
  background-color: #fc4353;
  color: white;
}

.cate-right {
  width: 75%;
  padding: 10px;
  overflow-y: auto;
  height: calc(100vh - 220px);
  /* 减去顶部和底部的高度 */
}

/* 商品内容部分 */
.cate-content {
  display: flex;
  padding: 10px;
  background: #fff;
  margin-bottom: 10px;
  border-radius: 8px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);
}

.item-image {
  width: 80px;
  height: 80px;
  border-radius: 8px;
  margin-right: 12px;
  object-fit: cover;
}

.item-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  position: relative;
}

.item-title {
  font-size: 16px;
  font-weight: bold;
  color: #333;
  margin-bottom: 4px;
}

.item-desc {
  font-size: 12px;
  color: #666;
  margin-bottom: 4px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.item-sales {
  font-size: 12px;
  color: #999;
}

.item-bottom {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 8px;
}

.price-box {
  display: flex;
  align-items: baseline;
  gap: 5px;
}

.price {
  font-size: 16px;
  font-weight: bold;
  color: #fc4353;
}

.original-price {
  font-size: 14px;
  color: #999;
  text-decoration: line-through;
}

.stepper {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  margin-top: 8px;
}

.stepper.only-plus {
  background: transparent;
}

.stepper.only-plus .plus {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  line-height: 20px;
  text-align: center;
  background: #fc4353;
  color: #fff;
  font-size: 16px;
  font-weight: bold;
  padding: 0;
  border: none;
}

.stepper:not(.only-plus) {
  background: #f8f8f8;
  border-radius: 20px;
  padding: 2px;
  height: 24px;
}

.stepper:not(.only-plus) .minus,
.stepper:not(.only-plus) .plus {
  width: 20px;
  height: 20px;
  min-width: 20px;
  line-height: 20px;
  text-align: center;
  background: #fc4353;
  color: #fff;
  font-size: 16px;
  font-weight: bold;
  padding: 0;
  border: none;
}

.stepper:not(.only-plus) .minus {
  border-radius: 50%;
}

.stepper:not(.only-plus) .plus {
  border-radius: 50%;
}

.stepper:not(.only-plus) input {
  width: 28px;
  height: 20px;
  line-height: 20px;
  text-align: center;
  font-size: 14px;
  background: transparent;
  color: #333;
  margin: 0 2px;
  padding: 0;
  border: none;
}

/* 底部订单部分 */
.bottom-order-container {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 15px;
  background-color: white;
  border-top: 1px solid #ddd;
  display: flex;
  justify-content: space-between;
  align-items: center;
  z-index: 99;
}

.order-info-bottom {
  display: flex;
  align-items: center;
  position: relative;
}

.order-icon-container {
  position: relative;
}

.order-icon {
  width: 25px;
  height: 25px;
}

.badge {
  position: absolute;
  top: -5px;
  right: -5px;
  background-color: #fc4353;
  color: white;
  border-radius: 50%;
  width: 20px;
  height: 20px;
  font-size: 12px;
  display: flex;
  justify-content: center;
  align-items: center;
}

.total-price-container {
  flex: 1;
  text-align: left;
  margin-left: 5%;
}

.total-price {
  font-size: 18px;
  font-weight: bold;
  color: #fc4353;
}

.confirm-button {
  background-color: #fc4353;
  color: white;
  padding: 10px 20px;
  border: none;
  font-size: 16px;
  border-radius: 5px;
  cursor: pointer;
}

/* 购物车弹窗 */
.cart-popup {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.6);
  display: flex;
  justify-content: flex-end;
  flex-direction: column;
  z-index: 100;
}

.cart-popup-content {
  background-color: #ffffff;
  width: 100%;
  border-radius: 20px 20px 0 0;
  padding: 20px;
  position: relative;
}

.cart-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #f1f1f1;
  padding-bottom: 15px;
  margin-bottom: 15px;
}

.cart-title {
  font-size: 18px;
  font-weight: bold;
  color: #333;
}

.close-btn {
  font-size: 24px;
  background: none;
  border: none;
  color: #888;
  padding: 0;
  width: 30px;
  height: 30px;
  line-height: 30px;
}

.cart-items {
  max-height: 60vh;
  overflow-y: auto;
}

.cart-item {
  display: flex;
  padding: 12px 0;
  border-bottom: 1px solid #f5f5f5;
  align-items: center;
}

.cart-item-image {
  width: 50px;
  height: 50px;
  border-radius: 6px;
  margin-right: 10px;
  object-fit: cover;
}

.cart-item-info {
  flex: 1;
  display: flex;
  align-items: center;
}

.cart-item-title {
  flex: 1;
  font-size: 14px;
  color: #333;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  margin-right: 10px;
  max-width: 120px;
}

.cart-item-price {
  font-size: 14px;
  color: #fc4353;
  font-weight: bold;
  white-space: nowrap;
  margin: 0 15px;
  min-width: 45px;
  text-align: right;
}

.quantity-selector {
  display: flex;
  align-items: center;
  background: #f8f8f8;
  border-radius: 15px;
  padding: 2px;
  height: 24px;
  min-width: 80px;
}

.quantity-selector button {
  width: 20px;
  height: 20px;
  min-width: 20px;
  line-height: 20px;
  text-align: center;
  background: #fc4353;
  color: #fff;
  font-size: 14px;
  font-weight: bold;
  padding: 0;
  border: none;
  border-radius: 50%;
}

.quantity-selector input {
  width: 30px;
  height: 20px;
  line-height: 20px;
  text-align: center;
  font-size: 14px;
  background: transparent;
  color: #333;
  margin: 0 4px;
  padding: 0;
  border: none;
}

.cart-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 20px;
  padding-top: 15px;
  border-top: 1px solid #f1f1f1;
}

.cart-total-price {
  font-size: 16px;
  font-weight: bold;
  color: #fc4353;
}

.checkout-btn {
  background: #fc4353;
  color: white;
  padding: 6px 18px;
  border: none;
  border-radius: 20px;
  font-size: 14px;
}
</style>