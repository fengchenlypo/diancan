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
            <!-- 显示该分类选中的商品数量 -->
            <view v-if="selectedItems[category.name]" class="badge">{{ selectedItems[category.name] }}</view>
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
              <text class="item-price">¥{{ item.price }}</text>

              <!-- 数量选择器 -->
              <view class="quantity-selector">
                <button v-if="item.quantity > 0" @click="decreaseQuantity(item)">-</button>
                <input v-if="item.quantity > 0" type="number" :value="item.quantity"
                  @input="updateQuantity(item, $event)" min="1" />
                <button @click="increaseQuantity(item)">+</button>
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
          <image class="order-icon" src="../../static/cart.png" />
          <!-- 添加角标 -->
          <view v-if="totalSelectedItems > 0" class="badge">{{ totalSelectedItems }}</view>
        </view>
      </view>
      <view class="total-price-container">
        <text class="total-price">合计: ¥{{ totalPrice }}</text>
      </view>
      <button class="confirm-button" @click="confirmOrder">确认</button>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      // 分类及商品数据
      categories: [
        {
          name: '限量秒杀',
          items: [
            { id: 101, title: '宫保鸡丁', desc: '经典川菜，香辣可口', price: 58, sales: 1200, image: 'https://example.com/gongbaojiding.png', quantity: 0 },
            { id: 102, title: '麻辣小龙虾', desc: '麻辣鲜香，小龙虾的经典吃法', price: 88, sales: 950, image: 'https://example.com/malaxiaolongxia.png', quantity: 0 },
          ],
        },
        {
          name: '本店优惠',
          items: [
            { id: 103, title: '烧鹅', desc: '外皮酥脆，肉质鲜嫩', price: 98, sales: 800, image: 'https://example.com/shaoye.png', quantity: 0 },
            { id: 104, title: '白切鸡', desc: '鸡肉鲜嫩，原汁原味', price: 68, sales: 1100, image: 'https://example.com/baiqieji.png', quantity: 0 },
          ],
        },
        {
          name: '荤菜',
          items: [
            { id: 105, title: '鱼香肉丝', desc: '酸甜可口，口感独特', price: 68, sales: 1100, image: 'https://example.com/yuxiangrousi.png', quantity: 0 },
          ],
        },
        {
          name: '素菜',
          items: [
            { id: 106, title: '剁椒鱼头', desc: '辣味十足，香味浓郁', price: 120, sales: 500, image: 'https://example.com/duojiaoyutou.png', quantity: 0 },
            { id: 107, title: '湘西外婆菜', desc: '口味独特，咸香适口', price: 38, sales: 950, image: 'https://example.com/xiangxiwaipocai.png', quantity: 0 },
          ],
        },
        {
          name: '饮料',
          items: [
            { id: 110, title: '可乐', desc: '经典碳酸饮料，刺激口感', price: 8, sales: 3000, image: 'https://example.com/cola.png', quantity: 0 },
            { id: 111, title: '雪碧', desc: '清爽解渴，口感清凉', price: 8, sales: 2800, image: 'https://example.com/xuebi.png', quantity: 0 },
            { id: 112, title: '橙汁', desc: '新鲜榨取，营养丰富', price: 15, sales: 500, image: 'https://example.com/orangejuice.png', quantity: 0 },
            { id: 113, title: '苹果汁', desc: '清甜可口，健康饮品', price: 15, sales: 450, image: 'https://example.com/applejuice.png', quantity: 0 },
          ],
        },
        {
          name: '酒品',
          items: [
            { id: 114, title: '青岛啤酒', desc: '清爽的啤酒，适合夏天饮用', price: 25, sales: 800, image: 'https://example.com/qingdaobeer.png', quantity: 0 },
            { id: 115, title: '白酒', desc: '浓香型白酒，醇厚口感', price: 168, sales: 300, image: 'https://example.com/baijiu.png', quantity: 0 },
            { id: 116, title: '红酒', desc: '优雅红酒，醇香四溢', price: 258, sales: 200, image: 'https://example.com/redwine.png', quantity: 0 },
          ],
        },
      ],
      activeIndex: 0,
      totalPrice: '0.00', // 初始化合计价格
      selectedItems: {}, // 用于记录每个分类的已选商品数量
    };
  },
  computed: {
    activeCategory() {
      return this.categories[this.activeIndex];
    },
    filteredItems() {
      return this.activeCategory?.items || [];
    },
    totalSelectedItems() {
      // 计算所有已选择商品的总数量
      let total = 0;
      Object.values(this.selectedItems).forEach(count => total += count);
      return total;
    }
  },
  methods: {
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
      this.updateTotalPrice(); // 更新合计价格
      this.updateSelectedItems(item); // 更新已选商品数量
    },
    decreaseQuantity(item) {
      if (item.quantity > 0) {
        item.quantity--;
        this.updateTotalPrice(); // 更新合计价格
        this.updateSelectedItems(item); // 更新已选商品数量
      }
    },
    updateQuantity(item, event) {
      const value = event.detail.value;
      if (value && value > 0) {
        item.quantity = parseInt(value, 10);
        this.updateTotalPrice(); // 更新合计价格
        this.updateSelectedItems(item); // 更新已选商品数量
      } else {
        item.quantity = 1;
        this.updateTotalPrice(); // 更新合计价格
        this.updateSelectedItems(item); // 更新已选商品数量
      }
    },
    updateTotalPrice() {
      let total = 0;
      this.categories.forEach(category => {
        category.items.forEach(item => {
          total += item.price * item.quantity;
        });
      });
      this.totalPrice = total.toFixed(2); // 更新总价
    },
    updateSelectedItems(item) {
      // 更新某个分类下已选择的商品数量
      const category = this.categories.find(cat => cat.items.includes(item));
      if (category) {
        this.selectedItems[category.name] = category.items.reduce((sum, currItem) => sum + currItem.quantity, 0);
      }
    },
    confirmOrder() {
      uni.navigateTo({
        url: '/pages/order/order'
      });
    }
  },
  onLoad() {
    this.selectCategory(0);
    this.updateTotalPrice(); // 初始化时计算总价
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

/* 其他样式不变 */
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
}

.cate-left {
  width: 25%;
  border-right: 1px solid #ddd;
  padding: 10px;
  position: sticky;
  top: 0;
  background-color: white;
  z-index: 2;
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
}

/* 商品内容部分 */
.cate-content {
  display: flex;
  padding: 10px;
  background-color: white;
  border-bottom: 1px solid #ddd;
}

.item-image {
  width: 80px;
  height: 80px;
  object-fit: cover;
}

.item-info {
  margin-left: 10px;
  flex: 1;
}

.item-title {
  font-size: 16px;
  font-weight: bold;
}

.item-desc {
  font-size: 14px;
  color: #888;
}

.item-price {
  font-size: 16px;
  font-weight: bold;
  color: #fc4353;
}

/* 数量选择器 */
.quantity-selector {
  display: flex;
  align-items: center;
  gap: 10px;
  /* 添加按钮和输入框的间距 */
}

.quantity-selector button {
  width: 40px;
  height: 40px;
  background-color: #fc4353;
  color: white;
  border: none;
  font-size: 18px;
  border-radius: 5px;
  /* 添加圆角 */
  display: flex;
  justify-content: center;
  align-items: center;
}

.quantity-selector input {
  width: 50px;
  text-align: center;
  font-size: 16px;
  border: 1px solid #ddd;
  padding: 5px;
  border-radius: 5px;
  /* 圆角 */
  height: 40px;
  /* 保持与按钮一致的高度 */
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
</style>