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
            <text class="label">联系电话：</text>
            <input class="input" type="text" placeholder="请输入手机号码" v-model="phone" />
          </view>
          <view class="input-container">
            <text class="label">收货地址：</text>
            <input class="input" type="text" placeholder="请输入详细地址" v-model="address" />
          </view>
        </view>

        <!-- 堂食 -->
        <view v-show="current === 1" class="section">
          <view class="input-container">
            <text class="label">就餐方式：</text>
            <picker mode="selector" :range="array" @change="bindChange" class="picker-box">
              <view class="picker">{{ array[index] }}</view>
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
            <text class="label">自提时间：</text>
            <picker mode="multiSelector" :range="dateRange" @change="onMultiChange" class="picker-box">
              <view class="picker">{{ selectedDateTime || '请选择自提时间' }}</view>
            </picker>
          </view>
          <view class="divider"></view>
          <view class="input-container">
            <text class="label">联系电话：</text>
            <input class="input" type="text" placeholder="请输入手机号码" v-model="phone" />
          </view>
        </view>
      </view>
    </view>

    <!-- 订单摘要 -->
    <view class="order-summary">
      <view class="order-header" v-if="orderNo">
        <text class="order-no">订单号：{{ orderNo }}</text>
        <text class="order-status">{{ statusText }}</text>
      </view>

      <text class="h2">一共 {{ totalItems }} 件商品</text>
      <view v-for="(item, index) in selectedItems" :key="index" class="order-item">
        <image :src="item.image" class="order-item-img" />
        <view class="order-item-info">
          <text class="order-item-name">{{ item.title }}</text>
          <text class="order-item-quantity">x{{ item.quantity }}</text>
        </view>
        <text class="order-item-price">¥{{ item.price }}</text>
      </view>

      <view class="total">
        <text>合计：¥{{ totalAmount }}</text>
      </view>

      <view class="beizhu">
        <text>备注</text>
        <input type="text" placeholder="可填可不填" class="remark-input" v-model="remark" />
      </view>
    </view>

    <!-- 底部操作栏 -->
    <view class="bottom-bar">
      <text class="h2">合计：¥{{ totalAmount }}</text>
      <button v-if="orderStatus === 0" class="submit-button" @click="handlePayment">立即支付</button>
      <button v-else-if="orderStatus === 1" class="submit-button completed">已支付</button>
      <button v-else-if="orderStatus === 2" class="submit-button completed">已完成</button>
      <button v-else class="submit-button cancelled">已取消</button>
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
      diandan: [],
      // 自提时间选择器数据
      dateRange: [
        ['今天', '明天', '后天'],
        ['10:00', '10:30', '11:00', '11:30', '12:00', '12:30', '13:00', '13:30', '14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00', '17:30', '18:00', '18:30', '19:00', '19:30', '20:00']
      ],
      selectedDateTime: '',
      index1: [0, 0],
      address: '',
      phone: '',
      remark: '',
      deliveryType: '外卖',
      selectedItems: [],
      orderNo: '',
      orderId: null,
      totalAmount: '0.00',
      orderStatus: 0,
      statusText: '待支付',
      formValid: false
    };
  },
  methods: {
    // 验证手机号
    validatePhone() {
      const phoneReg = /^1[3-9]\d{9}$/;
      return phoneReg.test(this.phone);
    },

    // 验证地址
    validateAddress() {
      return this.address.length >= 5;
    },

    // 验证自提时间
    validatePickupTime() {
      return this.selectedDateTime !== '';
    },

    // 验证表单
    validateForm() {
      if (this.current === 0) { // 外卖
        if (!this.validatePhone()) {
          uni.showToast({
            title: '请输入正确的手机号码',
            icon: 'none'
          });
          return false;
        }
        if (!this.validateAddress()) {
          uni.showToast({
            title: '请输入详细的收货地址',
            icon: 'none'
          });
          return false;
        }
      } else if (this.current === 1) { // 堂食
        // 堂食只需要选择就餐方式，已经有默认值，无需验证
      } else if (this.current === 2) { // 自提
        if (!this.validatePhone()) {
          uni.showToast({
            title: '请输入正确的手机号码',
            icon: 'none'
          });
          return false;
        }
        if (!this.validatePickupTime()) {
          uni.showToast({
            title: '请选择自提时间',
            icon: 'none'
          });
          return false;
        }
      }
      return true;
    },

    // 处理支付前的验证
    async handlePayment() {
      if (!this.validateForm()) {
        return;
      }

      try {
        // 准备订单数据
        const orderData = {
          items: this.selectedItems.map(item => ({
            id: item.id,
            quantity: item.quantity,
            price: item.price
          })),
          totalAmount: this.totalAmount,
          deliveryType: this.items[this.current],
          address: this.current === 0 ? this.address : null,
          phone: (this.current === 0 || this.current === 2) ? this.phone : null,
          diningMode: this.current === 1 ? this.array[this.index] : null,
          pickupTime: this.current === 2 ? this.selectedDateTime : null,
          remark: this.remark || null
        };

        const result = await new Promise((resolve, reject) => {
          uni.request({
            url: 'http://localhost:3001/api/orders/' + this.orderId + '/pay',
            method: 'POST',
            data: orderData,
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

          // 更新订单状态
          this.orderStatus = 1;
          this.statusText = '已支付';

          // 延迟跳转到订单列表页
          setTimeout(() => {
            uni.redirectTo({
              url: '/pages/orderList/orderList'
            });
          }, 1500);
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

    // 生成日期范围
    generateDateRange() {
      const dates = ['今天', '明天', '后天'];
      const times = [];
      for (let hour = 10; hour <= 20; hour++) {
        times.push(`${hour}:00`);
        times.push(`${hour}:30`);
      }
      this.dateRange = [dates, times];
    },

    onMultiChange(e) {
      this.index1 = e.detail.value;
      const date = this.dateRange[0][this.index1[0]];
      const time = this.dateRange[1][this.index1[1]];
      this.selectedDateTime = `${date} ${time}`;
    },

    // 切换配送方式时重置表单
    onClickItem(e) {
      if (this.current !== e.currentIndex) {
        this.current = e.currentIndex;
        this.deliveryType = this.items[e.currentIndex];
        // 重置表单数据
        this.phone = '';
        this.address = '';
        this.selectedDateTime = '';
        this.index = 0;
      }
    }
  },
  computed: {
    changdu() {
      return this.diandan.length;
    },
    qiuhe() {
      return this.diandan.reduce((sum, item) => sum + (item.price * item.shuliang), 0);
    },
    totalItems() {
      return this.selectedItems.reduce((sum, item) => sum + item.quantity, 0);
    }
  },
  onLoad(options) {
    // 如果是从订单列表页面进入，直接获取订单详情
    if (options.orderId) {
      this.orderId = options.orderId;
      this.fetchOrderDetail();
    } else {
      // 从上一页传递的数据中获取选中的商品
      const eventChannel = this.getOpenerEventChannel();
      eventChannel.on('acceptDataFromOpenerPage', (data) => {
        this.selectedItems = data.items;
        this.totalAmount = data.totalAmount;
        this.orderNo = data.orderNo;
        this.orderId = data.orderId;
        // 新建订单默认状态为待支付
        this.orderStatus = 0;
        this.statusText = '待支付';
      });
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

.order-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 0;
  border-bottom: 1px solid #eee;
  margin-bottom: 15px;
}

.order-no {
  font-size: 14px;
  color: #666;
}

.order-status {
  font-size: 14px;
  font-weight: bold;
  color: #fc4353;
}

.submit-button.completed {
  background-color: #4caf50;
}

.submit-button.cancelled {
  background-color: #9e9e9e;
}
</style>
