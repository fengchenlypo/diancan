<template>
  <view class="container">
    <view class="top-bar">
      <view class="search-bar">
        <input class="search-input" type="text" v-model="query" placeholder="请输入搜索内容" @confirm="onSearch" />
        <image class="search-icon" src="../../static/search.png" @click="onSearch" />
      </view>
    </view>

    <!-- 搜索结果列表 -->
    <view v-if="filteredItems.length > 0" class="items-list">
      <view v-for="item in filteredItems" :key="item.id" class="item">
        <view class="item-image-container">
          <image class="item-image" :src="item.image" mode="aspectFill" />
        </view>
        <view class="item-info">
          <text class="item-title">{{ item.title }}</text>
          <text class="item-category">{{ item.category }}</text>
          <text class="item-desc">{{ item.desc }}</text>
          <view class="item-bottom">
            <view class="price-sales">
              <text class="item-price">￥{{ item.price }}</text>
              <text class="original-price" v-if="item.original_price">￥{{ item.original_price }}</text>
              <text class="item-sales">销量：{{ item.sales }}</text>
            </view>
            <view class="stepper" :class="{ 'only-plus': !item.quantity }">
              <button v-if="item.quantity > 0" class="minus" @click="decreaseQuantity(item)">-</button>
              <input v-if="item.quantity > 0" type="number" :value="item.quantity" @input="updateQuantity(item, $event)"
                min="1" />
              <button class="plus" @click="increaseQuantity(item)">+</button>
            </view>
          </view>
        </view>
      </view>
    </view>

    <!-- 无搜索结果时显示 -->
    <view v-if="filteredItems.length === 0" class="no-results">
      <text>没有找到相关商品</text>
    </view>
  </view>
</template>

<script>
import { ref, computed } from "vue";

export default {
  data() {
    return {
      query: '',
      filteredItems: []
    };
  },
  methods: {
    async onSearch() {
      if (!this.query.trim()) {
        uni.showToast({
          title: '请输入搜索关键词',
          icon: 'none'
        });
        return;
      }

      try {
        const res = await new Promise((resolve, reject) => {
          uni.request({
            url: `http://localhost:3001/api/search?keyword=${encodeURIComponent(this.query)}`,
            method: 'GET',
            success: (res) => {
              resolve(res);
            },
            fail: (err) => {
              reject(err);
            }
          });
        });

        if (res.statusCode === 200) {
          // 获取首页的商品数量状态
          const pages = getCurrentPages();
          // 首页通常是第一个页面
          const indexPage = pages[0];

          this.filteredItems = res.data.map(item => {
            // 如果在首页找到相同ID的商品，使用其数量
            let quantity = 0;
            if (indexPage && indexPage.$vm && indexPage.$vm.categories) {
              const categories = indexPage.$vm.categories;
              for (const category of categories) {
                const existingItem = category.items.find(i => i.id === item.id);
                if (existingItem) {
                  quantity = existingItem.quantity;
                  break;
                }
              }
            }

            return {
              id: item.id,
              title: item.title,
              desc: item.description,
              price: item.price,
              original_price: item.original_price,
              sales: item.sales,
              image: item.image_url,
              category: item.category_name,
              quantity: quantity
            };
          });

          if (this.filteredItems.length === 0) {
            uni.showToast({
              title: '没有找到相关商品',
              icon: 'none'
            });
          }
        } else {
          throw new Error(res.data.error || '搜索失败');
        }
      } catch (error) {
        console.error('搜索失败:', error);
        uni.showToast({
          title: '搜索失败',
          icon: 'none'
        });
      }
    },

    // 减少数量
    minus(item) {
      if (item.quantity > 0) {
        item.quantity--;
        this.updateCart();
      }
    },

    // 增加数量
    plus(item) {
      if (!item.quantity) {
        item.quantity = 0;
      }
      item.quantity++;
      this.updateCart();
    },

    // 更新购物车
    updateCart() {
      const cartItems = this.filteredItems
        .filter(item => item.quantity > 0)
        .map(item => ({
          id: item.id,
          title: item.title,
          price: item.price,
          image: item.image,
          quantity: item.quantity
        }));

      uni.setStorageSync('cartItems', JSON.stringify(cartItems));
    },

    // 返回首页
    goBack() {
      uni.navigateBack();
    },

    increaseQuantity(item) {
      item.quantity++;
      this.updateTotalPrice();
      this.syncWithIndexPage(item);
    },

    decreaseQuantity(item) {
      if (item.quantity > 0) {
        item.quantity--;
        this.updateTotalPrice();
        this.syncWithIndexPage(item);
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
      this.syncWithIndexPage(item);
    },

    // 同步数量到首页
    syncWithIndexPage(item) {
      const pages = getCurrentPages();
      // 首页通常是第一个页面
      const indexPage = pages[0];

      if (indexPage && indexPage.$vm && indexPage.$vm.categories) {
        const categories = indexPage.$vm.categories;
        for (const category of categories) {
          const existingItem = category.items.find(i => i.id === item.id);
          if (existingItem) {
            existingItem.quantity = item.quantity;
            // 更新首页的总价
            indexPage.$vm.updateTotalPrice();
            // 更新首页的选中商品状态
            indexPage.$vm.updateSelectedItems();
            break;
          }
        }
      }
    },

    updateTotalPrice() {
      let total = 0;
      this.filteredItems.forEach(item => {
        total += item.price * item.quantity;
      });
      this.totalPrice = total.toFixed(2);
    }
  },
  // 页面加载时自动聚焦搜索框
  onShow() {
    setTimeout(() => {
      uni.createSelectorQuery()
        .select('.search-input')
        .boundingClientRect(rect => {
          if (rect) {
            uni.pageScrollTo({
              scrollTop: rect.top,
              duration: 0
            });
          }
        })
        .exec();
    }, 350);
  }
};
</script>

<style scoped>
.container {
  padding: 10px;
  background: #f5f5f5;
  min-height: 100vh;
}

.top-bar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 100;
  background-color: #fff;
  padding: 10px;
  display: flex;
  align-items: center;
}

.search-bar {
  flex: 1;
  display: flex;
  align-items: center;
  background: #f8f8f8;
  border-radius: 20px;
  padding: 6px 12px;
}

.search-input {
  flex: 1;
  border: none;
  background: transparent;
  font-size: 14px;
  padding: 4px;
}

.search-icon {
  width: 18px;
  height: 18px;
  padding: 4px;
}

.items-list {
  margin-top: 60px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.item {
  background: #fff;
  border-radius: 8px;
  overflow: hidden;
  display: flex;
  padding: 12px;
}

.item-image-container {
  width: 80px;
  height: 80px;
  margin-right: 12px;
  border-radius: 6px;
  overflow: hidden;
}

.item-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.item-info {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.item-title {
  font-size: 14px;
  font-weight: bold;
  color: #333;
  margin-bottom: 4px;
}

.item-category {
  font-size: 12px;
  color: #666;
  margin-bottom: 4px;
}

.item-desc {
  font-size: 12px;
  color: #888;
  margin-bottom: 8px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.item-bottom {
  margin-top: auto;
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
}

.price-sales {
  display: flex;
  flex-direction: column;
}

.item-price {
  font-size: 16px;
  font-weight: bold;
  color: #fc4353;
}

.original-price {
  font-size: 12px;
  color: #999;
  text-decoration: line-through;
  margin-left: 4px;
}

.item-sales {
  font-size: 12px;
  color: #999;
  margin-top: 2px;
}

.stepper {
  display: flex;
  align-items: center;
  background: #f8f8f8;
  border-radius: 15px;
  padding: 2px;
  height: 24px;
  min-width: 80px;
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
  font-size: 14px;
  font-weight: bold;
  padding: 0;
  border: none;
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
  font-size: 14px;
  font-weight: bold;
  padding: 0;
  border: none;
  border-radius: 50%;
}

.stepper:not(.only-plus) input {
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

.no-results {
  margin-top: 100px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #999;
  font-size: 14px;
}
</style>
