<template>
  <view class="main-container">
    <!-- 顶部选项卡 + 内容切换区域 -->
    <view class="tab-content-section">
      <!-- 顶部选项卡 -->
      <view class="tab-section">
        <uni-segmented-control :current="current" :values="items" @clickItem="onClickItem" styleType="button"
          activeColor="#4cd964" class="segmented-control"></uni-segmented-control>
      </view>

      <!-- 内容切换区域 -->
      <view class="content-section">
        <!-- 外卖 -->
        <view v-show="current === 0" class="section">
          <view class="input-container">
            <input class="input" type="text" placeholder="添加收货地址" />
          </view>
        </view>

        <!-- 堂食 -->
        <view v-show="current === 1" class="section">
          <view class="input-container">
            <picker mode="selector" :range="array" @change="bindChange">
              <view class="picker">就餐方式：{{ array[index] }}</view>
            </picker>
            
          </view>
        </view>

        <!-- 自提 -->
        <view v-show="current === 2" class="section address-group">
          <view class="address-container">
            <text class="address-title">商家地址：</text>
            <text class="address">乌山街道电子街64-2号知食分子</text>
          </view>
          <view class="divider"></view>
          <view class="picker-container">
            <picker mode="multiSelector" :range="dateRange" @change="onMultiChange">
              <view class="picker">请选择时间：{{ selectedDateTime }}</view>
            </picker>
          </view>
          <view class="divider"></view>
          <view class="input-container">
            <text class="label">联系方式：</text>
            <input class="input" type="text" placeholder="请填写联系电话" />
          </view>
        </view>
      </view>
    </view>

    <!-- 订单摘要 -->
    <view class="order-summary">
      <text class="h2">一共 {{ changdu }} 件商品</text>
      <view v-for="(item, index) in diandan" :key="index" class="order-item">
        <image :src="item.URL" class="order-item-img" />
        <view class="order-item-info">
          <text class="order-item-name">{{ item.name }}</text>
          <text class="order-item-quantity">x{{ item.shuliang }}</text>
        </view>
        <text class="order-item-price">¥{{ item.price }}</text>
      </view>

      <view class="total">
        <text>合计：¥{{ qiuhe }}</text>
      </view>

      <view class="beizhu">
        <text>备注</text>
        <input type="text" placeholder="可填可不填" class="remark-input" />
      </view>
    </view>

    <!-- 底部操作栏 -->
    <view class="bottom-bar">
      <text class="h2">合计：¥{{ qiuhe }}</text>
      <button class="submit-button" @click="navigateToTarget">提交订单</button>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      array: ['店内就餐', '打包带走'],
      index: 0,
      items: ['外卖', '堂食', '自提'],
      current: 0,
      diandan: [
        { id: 1, URL: '../../static/kelei.png', name: '年糕', shuliang: 2, price: 100 },
        { id: 2, URL: '../../static/kelei.png', name: '鸡翅', shuliang: 2, price: 100 },
        { id: 3, URL: '../../static/kelei.png', name: '火锅', shuliang: 2, price: 100 }
      ],
      dateRange: [['今天', '01月03日', '01月04日'], ['10:00', '10:30', '11:00']],
      selectedDateTime: '',
      index1: [0, 0]
    };
  },
  methods: {
    onClickItem(e) {
      if (this.current !== e.currentIndex) {
        this.current = e.currentIndex;
      }
    },
    bindChange(e) {
      this.index = e.detail.value;
    },
    onMultiChange(e) {
      this.index1 = e.detail.value;
      this.selectedDateTime = `${this.dateRange[0][this.index1[0]]} ${this.dateRange[1][this.index1[1]]}`;
    },
    navigateToTarget() {
      uni.navigateTo({
        url: '/pages/index/new_file'
      });
    }
  },
  computed: {
    changdu() {
      return this.diandan.length;
    },
    qiuhe() {
      return this.diandan.reduce((sum, diandan) => sum + diandan.price, 0);
    }
  }
};
</script>

<style scoped>
.main-container {
  background-color: #f9f9f9;
  display: flex;
  flex-direction: column;
  height: 100%;
  margin-top: 10%;
  padding-bottom: 70px;
  /* 给底部操作栏留出空间 */
}

.tab-content-section {
  background-color: #fff;
  padding: 20px 0;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  flex: 1;
  overflow-y: auto;
}

.tab-section {
  margin-bottom: 20px;
}

.segmented-control {
  margin-bottom: 10px;
}

.content-section {
  padding: 10px 20px;
}

.section {
  margin-bottom: 20px;
}

.address-group {
  background-color: #fff;
  padding: 15px;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.address-container,
.picker-container,
.input-container {
  padding: 10px 0;
}

.divider {
  height: 1px;
  background-color: #ddd;
  margin: 10px 0;
}

.picker {
  font-size: 16px;
  color: #333;
  padding: 10px;
  background-color: #f9f9f9;
  border-radius: 8px;
  border: 1px solid #ddd;
  display: inline-block;
  width: 100%;
}

.input {
  width: 100%;
  height: auto;
  padding: 12px;
  border-radius: 8px;
  border: 1px solid #ddd;
  background-color: #f9f9f9;
  font-size: 16px;
  margin-top: 8px;
  box-sizing: border-box;
}

.order-summary {
  background-color: #fff;
  padding: 20px;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  margin-bottom: 20px;
  flex: 1;
  /* 让订单摘要区域占据剩余空间 */
}

.order-item {
  display: flex;
  align-items: center;
  margin: 10px 0;
}

.order-item-img {
  width: 60px;
  height: 60px;
  border-radius: 10px;
  margin-right: 10px;
}

.order-item-info {
  flex: 1;
}

.total {
  text-align: right;
  font-size: 18px;
  margin-top: 15px;
}

.bottom-bar {
  display: flex;
  align-items: center;
  background-color: #fff;
  padding: 10px 15px;
  border-top: 1px solid #eee;
  justify-content: space-between;
  position: fixed;
  bottom: 0;
  width: 100%;
  box-shadow: 0 -2px 5px rgba(0, 0, 0, 0.1);
}

.submit-button {
  margin-left: auto;
  padding: 10px 30px;
  background-color: #4cd964;
  color: white;
  border-radius: 20px;
  font-size: 16px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}
</style>
