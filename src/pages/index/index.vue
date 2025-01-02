<template>
  <view class="content">
    <!-- 顶部区域 -->
    <view class="top">
      <view class="background"></view>
      <view class="foreground">
        <image class="touxian" src="../../static/touxian.png" />
        <text class="title">知食分子</text>
      </view>
    </view>

    <!-- 订单和分类导航部分 -->
    <view class="order-and-cate-container">
      <!-- 订单标题 -->
      <view class="order-title">
        <text class="order-text">订单列表</text>
        <!-- 搜索图片 -->
        <image class="search-img" src="../../static/search.png" @click="goToSearchPage" />
      </view>

      <!-- 配送费和我的订单 -->
      <view class="order-info">
        <text class="delivery-fee">配送费 1.00元</text>
        <view class="my-order">
          <image class="order-icon" src="../../static/order.png" />
          <text class="my-order-text">我的订单</text>
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
              <text class="item-price">¥{{ item.price }}</text>
            </view>
          </view>
        </scroll-view>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      // 分类及商品数据，已添加限量秒杀、本店优惠、饮料、酒品分类
      categories: [
        {
          name: '限量秒杀',
          items: [
            { id: 101, title: '宫保鸡丁', desc: '经典川菜，香辣可口', price: 58, sales: 1200, image: 'https://example.com/gongbaojiding.png' },
            { id: 102, title: '麻辣小龙虾', desc: '麻辣鲜香，小龙虾的经典吃法', price: 88, sales: 950, image: 'https://example.com/malaxiaolongxia.png' },
          ],
        },
        {
          name: '本店优惠',
          items: [
            { id: 103, title: '烧鹅', desc: '外皮酥脆，肉质鲜嫩', price: 98, sales: 800, image: 'https://example.com/shaoye.png' },
            { id: 104, title: '白切鸡', desc: '鸡肉鲜嫩，原汁原味', price: 68, sales: 1100, image: 'https://example.com/baiqieji.png' },
          ],
        },
        {
          name: '川菜',
          items: [
            { id: 105, title: '鱼香肉丝', desc: '酸甜可口，口感独特', price: 68, sales: 1100, image: 'https://example.com/yuxiangrousi.png' },
          ],
        },
        {
          name: '湘菜',
          items: [
            { id: 106, title: '剁椒鱼头', desc: '辣味十足，香味浓郁', price: 120, sales: 500, image: 'https://example.com/duojiaoyutou.png' },
            { id: 107, title: '湘西外婆菜', desc: '口味独特，咸香适口', price: 38, sales: 950, image: 'https://example.com/xiangxiwaipocai.png' },
          ],
        },
        {
          name: '素食',
          items: [
            { id: 108, title: '凉拌黄瓜', desc: '清爽可口，开胃小菜', price: 18, sales: 1600, image: 'https://example.com/liangbanhuanggua.png' },
            { id: 109, title: '素翅', desc: '绿色健康，美味可口', price: 28, sales: 1200, image: 'https://example.com/suchi.png' },
          ],
        },
        {
          name: '饮料',
          items: [
            { id: 110, title: '可乐', desc: '经典碳酸饮料，刺激口感', price: 8, sales: 3000, image: 'https://example.com/cola.png' },
            { id: 111, title: '雪碧', desc: '清爽解渴，口感清凉', price: 8, sales: 2800, image: 'https://example.com/xuebi.png' },
            { id: 112, title: '橙汁', desc: '新鲜榨取，营养丰富', price: 15, sales: 500, image: 'https://example.com/orangejuice.png' },
            { id: 113, title: '苹果汁', desc: '清甜可口，健康饮品', price: 15, sales: 450, image: 'https://example.com/applejuice.png' },
          ],
        },
        {
          name: '酒品',
          items: [
            { id: 114, title: '青岛啤酒', desc: '清爽的啤酒，适合夏天饮用', price: 25, sales: 800, image: 'https://example.com/qingdaobeer.png' },
            { id: 115, title: '白酒', desc: '浓香型白酒，醇厚口感', price: 168, sales: 300, image: 'https://example.com/baijiu.png' },
            { id: 116, title: '红酒', desc: '优雅红酒，醇香四溢', price: 258, sales: 200, image: 'https://example.com/redwine.png' },
          ],
        },
      ],
      activeIndex: 0,
    };
  },
  computed: {
    activeCategory() {
      return this.categories[this.activeIndex];
    },
    filteredItems() {
      return this.activeCategory?.items || [];
    },
  },
  methods: {
    selectCategory(index) {
      this.activeIndex = index;
    },
    goToSearchPage() {
      uni.navigateTo({
        url: '/pages/search/search' // 跳转到搜索页面
      });
    }
  },
  onLoad() {
    this.selectCategory(0);
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
  background-color: #fc4353;
  padding: 15px;
  border-radius: 15px 15px 0 0;
  margin-top: 10px;
  text-align: center;
  display: flex;
  justify-content: space-between;
}

.order-text {
  font-size: 18px;
  color: white;
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
  width: 20px;
  height: 20px;
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
  width: 30%;
  border-right: 1px solid #ddd;
  padding: 10px;
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
  flex: 1;
  padding: 10px;
  overflow-y: auto;
}

.cate-content {
  display: flex;
  margin-bottom: 15px;
}

.item-image {
  width: 100px;
  height: 100px;
  margin-right: 10px;
}

.item-info {
  flex: 1;
}

.item-title {
  font-size: 16px;
  font-weight: bold;
}

.item-desc {
  color: #666;
  display: flex;
  flex-direction: column;
}

.item-sales {
  color: #999;
}

.item-price {
  font-size: 18px;
  color: #fc4353;
  font-weight: bold;
  margin-top: 10px;
}
</style>
