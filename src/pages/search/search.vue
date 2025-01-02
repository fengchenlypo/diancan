<template>
  <view class="container">
    <!-- 搜索框 -->
    <view class="search-bar">
      <input class="search-input" type="text" v-model="query" placeholder="请输入搜索内容" />
      <image class="search-icon" src="../../static/search.png" @click="onSearch" />
    </view>

    <!-- 仅渲染搜索到的商品 -->
    <view v-if="filteredItems.length > 0" class="items-list">
      <view v-for="item in filteredItems" :key="item.id" class="item">
        <view class="item-image-container">
          <image class="item-image" :src="item.image" mode="aspectFill" />
        </view>
        <view class="item-info">
          <text class="item-title">{{ item.title }}</text>
          <text class="item-desc">{{ item.desc }}</text>
          <view class="item-price-sales">
            <text class="item-price">￥{{ item.price }}</text>
            <text class="item-sales">销量：{{ item.sales }}</text>
          </view>
        </view>
      </view>
    </view>

    <!-- 如果没有找到相关商品 -->
    <view v-if="filteredItems.length === 0" class="no-results">
      <text>没有找到相关结果</text>
    </view>
  </view>
</template>

<script>
import { ref, computed } from "vue";

export default {
  setup() {
    const query = ref("");
    const items = ref([
      { id: 101, title: '宫保鸡丁', desc: '经典川菜，香辣可口', price: 58, sales: 1200, image: 'https://example.com/gongbaojiding.png' },
      { id: 102, title: '麻辣小龙虾', desc: '麻辣鲜香，小龙虾的经典吃法', price: 88, sales: 950, image: 'https://example.com/malaxiaolongxia.png' },
      { id: 103, title: '烧鹅', desc: '外皮酥脆，肉质鲜嫩', price: 98, sales: 800, image: 'https://example.com/shaoye.png' },
      { id: 104, title: '白切鸡', desc: '鸡肉鲜嫩，原汁原味', price: 68, sales: 1100, image: 'https://example.com/baiqieji.png' },
      { id: 105, title: '鱼香肉丝', desc: '酸甜可口，口感独特', price: 68, sales: 1100, image: 'https://example.com/yuxiangrousi.png' },
      { id: 106, title: '剁椒鱼头', desc: '辣味十足，香味浓郁', price: 120, sales: 500, image: 'https://example.com/duojiaoyutou.png' },
      { id: 107, title: '湘西外婆菜', desc: '口味独特，咸香适口', price: 38, sales: 950, image: 'https://example.com/xiangxiwaipocai.png' },
      { id: 108, title: '凉拌黄瓜', desc: '清爽可口，开胃小菜', price: 18, sales: 1600, image: 'https://example.com/liangbanhuanggua.png' },
      { id: 109, title: '素翅', desc: '绿色健康，美味可口', price: 28, sales: 1200, image: 'https://example.com/suchi.png' },
      { id: 110, title: '可乐', desc: '经典碳酸饮料，刺激口感', price: 8, sales: 3000, image: 'https://example.com/cola.png' },
      { id: 111, title: '雪碧', desc: '清爽解渴，口感清凉', price: 8, sales: 2800, image: 'https://example.com/xuebi.png' },
      { id: 112, title: '橙汁', desc: '新鲜榨取，营养丰富', price: 15, sales: 500, image: 'https://example.com/orangejuice.png' },
      { id: 113, title: '苹果汁', desc: '清甜可口，健康饮品', price: 15, sales: 450, image: 'https://example.com/applejuice.png' },
      { id: 114, title: '青岛啤酒', desc: '清爽的啤酒，适合夏天饮用', price: 25, sales: 800, image: 'https://example.com/qingdaobeer.png' },
      { id: 115, title: '白酒', desc: '浓香型白酒，醇厚口感', price: 168, sales: 300, image: 'https://example.com/baijiu.png' },
      { id: 116, title: '红酒', desc: '优雅红酒，醇香四溢', price: 258, sales: 200, image: 'https://example.com/redwine.png' },
    ]);

    const filteredItems = computed(() => {
      if (!query.value) return items.value;
      return items.value.filter((item) => item.title.includes(query.value));
    });

    const onSearch = () => {
      // Search functionality already handled by v-model
    };

    return {
      query,
      filteredItems,
      onSearch,
    };
  },
};
</script>

<style scoped>
.container {
  padding: 20px;
  padding-top: 20%;
  background: linear-gradient(to bottom, #f8f9fa, #e2e6ea);
  /* 背景渐变 */
  border-radius: 15px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

.search-bar {
  display: flex;
  align-items: center;
  margin-bottom: 20px;
  position: relative;
  background: #fff;
  padding: 10px;
  border-radius: 30px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.search-input {
  flex: 1;
  padding: 12px;
  border: none;
  border-radius: 30px;
  font-size: 16px;
  background: #f8f9fa;
  transition: all 0.3s ease;
}

.search-input:focus {
  outline: none;
  background: #fff;
}

.search-icon {
  position: absolute;
  right: 15px;
  top: 50%;
  transform: translateY(-50%);
  width: 20px;
  height: 20px;
  cursor: pointer;
}

.items-list {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
}

.item {
  width: 48%;
  position: relative;
  margin-bottom: 20px;
  border-radius: 10px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  background-color: #fff;
  overflow: hidden;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.item:hover {
  transform: translateY(-5px);
  box-shadow: 0 5px 20px rgba(0, 0, 0, 0.2);
}

.item-image-container {
  width: 100%;
  padding-top: 133%;
  position: relative;
}

.item-image {
  width: 100%;
  height: 100%;
  position: absolute;
  top: 0;
  left: 0;
  object-fit: cover;
}

.item-info {
  padding: 15px;
}

.item-title {
  font-weight: bold;
  font-size: 18px;
  color: #333;
  margin-bottom: 8px;
}

.item-desc {
  color: #777;
  font-size: 14px;
  margin-top: 5px;
}

.item-price-sales {
  display: flex;
  justify-content: space-between;
  margin-top: 10px;
}

.item-price {
  color: #fc4353;
  font-size: 16px;
  font-weight: bold;
}

.item-sales {
  color: #888;
  font-size: 14px;
}

.no-results {
  margin-top: 20px;
  color: #999;
  text-align: center;
  font-size: 16px;
}
</style>
