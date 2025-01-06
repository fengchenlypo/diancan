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

      <view class="order-time" v-if="createTime">
        <text class="time-text">下单时间：{{ createTime }}</text>
      </view>

      <text class="h2">一共 {{ totalItems }} 件商品</text>
      <view v-for="(item, index) in selectedItems" :key="index" class="order-item">
        <image :src="item.image" class="order-item-img" mode="aspectFill" />
        <view class="order-item-info">
          <text class="order-item-name">{{ item.title }}</text>
          <text class="order-item-desc" v-if="item.description">{{ item.description }}</text>
          <view class="order-item-price-row">
            <text class="order-item-quantity">x{{ item.quantity }}</text>
            <view class="price-info">
              <text class="original-price" v-if="item.original_price">¥{{ item.original_price }}</text>
              <text class="current-price">¥{{ item.price }}</text>
            </view>
          </view>
          <text class="subtotal">小计：¥{{ item.subtotal }}</text>
        </view>
      </view>

      <view class="total" v-if="totalAmount">
        <text>合计：¥{{ totalAmount }}</text>
      </view>

      <view class="beizhu">
        <text>备注</text>
        <input type="text" placeholder="可填可不填" class="remark-input" v-model="remark" />
      </view>
    </view>

    <!-- 底部操作栏 -->
    <view class="bottom-bar">
      <text class="total-amount">合计：¥{{ totalAmount }}</text>
      <button v-if="orderStatus === 0" class="submit-button" @click="handlePay">立即支付</button>
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
      deliveryType: '堂食',
      selectedItems: [],
      orderNo: '',
      orderId: null,
      totalAmount: '0.00',
      orderStatus: 0,
      statusText: '待支付',
      formValid: false,
      createTime: '',
      fromPage: '' // 添加来源页面标记
    };
  },
  // 添加页面配置
  onBackPress() {
    this.handleBack();
    return true; // 返回 true 表示自己处理返回逻辑
  },
  methods: {
    // 添加返回处理方法
    handleBack() {
      if (this.fromPage === 'orderList') {
        uni.navigateBack({
          delta: 1
        });
      } else if (this.fromPage === 'index') {
        uni.switchTab({
          url: '/pages/index/index'
        });
      } else {
        uni.navigateBack({
          delta: 1
        });
      }
    },
    // 验证手机号
    validatePhone() {
      const phoneReg = /^1[3-9]\d{9}$/;
      if (!this.phone) {
        uni.showToast({
          title: '请输入手机号码',
          icon: 'none'
        });
        return false;
      }
      if (!phoneReg.test(this.phone)) {
        uni.showToast({
          title: '请输入正确的手机号码',
          icon: 'none'
        });
        return false;
      }
      return true;
    },

    // 验证地址
    validateAddress() {
      if (!this.address) {
        uni.showToast({
          title: '请输入收货地址',
          icon: 'none'
        });
        return false;
      }
      if (this.address.length < 5) {
        uni.showToast({
          title: '请输入详细的收货地址',
          icon: 'none'
        });
        return false;
      }
      return true;
    },

    // 验证自提时间
    validatePickupTime() {
      if (!this.selectedDateTime) {
        uni.showToast({
          title: '请选择自提时间',
          icon: 'none'
        });
        return false;
      }
      return true;
    },

    // 验证表单
    validateForm() {
      if (this.current === 0) { // 外卖
        if (!this.validatePhone()) return false;
        if (!this.validateAddress()) return false;
      } else if (this.current === 2) { // 自提
        if (!this.validatePhone()) return false;
        if (!this.validatePickupTime()) return false;
      }
      return true;
    },

    // 处理支付
    async handlePay() {
      // 先进行表单验证
      if (!this.validateForm()) {
        return;
      }

      try {
        // 准备订单信息
        const orderInfo = {
          orderType: this.items[this.current], // 外卖/堂食/自提
          orderDetails: {},
          items: this.selectedItems.map(item => ({
            id: item.id,
            product_id: item.product_id,
            order_id: this.orderId,
            title: item.title,
            price: Number(item.price),
            original_price: item.original_price ? Number(item.original_price) : null,
            quantity: item.quantity,
            image_url: item.image,
            description: item.description,
            category_id: item.category_id,
            category_name: item.category_name,
            subtotal: Number(item.price * item.quantity)
          })),
          total_amount: Number(this.totalAmount),
          status: 0, // 待支付
          remark: this.remark || '',
          create_time: new Date().toISOString(),
          order_no: this.orderNo
        };

        // 根据不同的订单类型保存不同的信息
        if (this.current === 0) { // 外卖
          orderInfo.orderDetails = {
            phone: this.phone,
            address: this.address,
            orderType: '外卖',
            deliveryStatus: '待配送'
          };
        } else if (this.current === 1) { // 堂食
          orderInfo.orderDetails = {
            diningType: this.array[this.index], // 店内就餐/打包带走
            orderType: '堂食',
            tableStatus: '待就餐'
          };
        } else if (this.current === 2) { // 自提
          orderInfo.orderDetails = {
            phone: this.phone,
            pickupTime: this.selectedDateTime,
            orderType: '自提',
            pickupStatus: '待取餐'
          };
        }

        console.log('提交的订单数据:', orderInfo);

        const result = await new Promise((resolve, reject) => {
          uni.request({
            url: `http://localhost:3001/api/orders/${this.orderId}/pay`,
            method: 'POST',
            data: orderInfo,
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

          // 支付成功后跳转到订单列表页面
          setTimeout(() => {
            uni.redirectTo({
              url: '/pages/orderList/orderList'
            });
          }, 1500);
        } else {
          throw new Error(result.data.error || '支付失败');
        }
      } catch (error) {
        console.error('支付失败:', error);
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
    },

    // 获取订单状态显示文本
    getStatusText(status) {
      const statusMap = {
        0: '待支付',
        1: '已支付',
        2: '已完成',
        3: '已取消'
      };
      return statusMap[status] || '未知状态';
    },

    // 获取订单详情
    async fetchOrderDetail() {
      try {
        const result = await new Promise((resolve, reject) => {
          uni.request({
            url: `http://localhost:3001/api/orders/${this.orderId}`,
            method: 'GET',
            success: (res) => {
              console.log('获取到的订单数据:', res.data);
              resolve(res);
            },
            fail: (err) => {
              reject(err);
            }
          });
        });

        if (result.statusCode === 200) {
          const orderData = result.data;
          console.log('原始订单数据:', orderData);

          // 处理订单商品数据
          this.selectedItems = orderData.items.map(item => ({
            id: item.id, // order_items 表的 id
            product_id: item.product_id, // 商品ID
            order_id: item.order_id, // 订单ID
            title: item.title,
            price: Number(item.price).toFixed(2),
            quantity: item.quantity,
            image: item.image_url || item.image || `/static/products/${item.title}.jpg`,
            original_price: item.original_price ? Number(item.original_price).toFixed(2) : null,
            description: item.description,
            category_id: item.category_id,
            category_name: item.category_name,
            subtotal: Number(item.price * item.quantity).toFixed(2) // 小计金额
          }));

          // 处理订单总金额
          this.totalAmount = orderData.total_amount ? Number(orderData.total_amount).toFixed(2) : '0.00';
          console.log('设置总金额:', this.totalAmount);

          // 处理订单编号和ID
          this.orderNo = orderData.order_no;
          this.orderId = orderData.id;

          // 处理订单状态
          this.orderStatus = orderData.status;
          this.statusText = this.getStatusText(orderData.status);

          // 处理备注信息
          this.remark = orderData.remark || '';

          // 处理下单时间
          if (orderData.create_time) {
            try {
              const date = new Date(orderData.create_time);
              if (!isNaN(date.getTime())) {
                this.createTime = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
                console.log('设置下单时间:', this.createTime);
              } else {
                console.error('无效的日期格式:', orderData.create_time);
              }
            } catch (error) {
              console.error('处理下单时间出错:', error);
            }
          }

          // 设置订单类型和相关信息
          if (orderData.order_type) {
            const typeIndex = this.items.indexOf(orderData.order_type);
            if (typeIndex !== -1) {
              this.current = typeIndex;

              // 根据订单类型设置相关信息
              if (orderData.order_details) {
                const orderDetails = typeof orderData.order_details === 'string'
                  ? JSON.parse(orderData.order_details)
                  : orderData.order_details;

                if (this.current === 0) { // 外卖
                  this.phone = orderDetails.phone || '';
                  this.address = orderDetails.address || '';
                } else if (this.current === 1) { // 堂食
                  const diningTypeIndex = this.array.indexOf(orderDetails.diningType);
                  if (diningTypeIndex !== -1) {
                    this.index = diningTypeIndex;
                  }
                } else if (this.current === 2) { // 自提
                  this.phone = orderDetails.phone || '';
                  this.selectedDateTime = orderDetails.pickupTime || '';
                }
              }
            }
          }

          // 打印调试信息
          console.log('处理后的订单数据:', {
            id: this.orderId,
            orderNo: this.orderNo,
            items: this.selectedItems,
            totalAmount: this.totalAmount,
            status: this.orderStatus,
            statusText: this.statusText,
            createTime: this.createTime,
            orderType: orderData.order_type,
            orderDetails: orderData.order_details,
            remark: this.remark
          });
        }
      } catch (error) {
        console.error('获取订单详情失败:', error);
        uni.showToast({
          title: '获取订单详情失败',
          icon: 'none'
        });
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
    // 记录来源页面
    this.fromPage = options.from || '';
    console.log('页面来源:', this.fromPage);

    // 如果是从订单列表页面进入，直接获取订单详情
    if (options.orderId) {
      this.orderId = options.orderId;
      this.fetchOrderDetail();
    } else {
      // 从上一页传递的数据中获取选中的商品
      const eventChannel = this.getOpenerEventChannel();
      eventChannel.on('acceptDataFromOpenerPage', (data) => {
        console.log('接收到的数据:', data);

        // 处理商品数据
        this.selectedItems = data.items.map(item => ({
          id: item.id,
          product_id: item.id,
          title: item.title,
          price: Number(item.price).toFixed(2),
          quantity: item.quantity,
          image: item.image,
          original_price: item.original_price ? Number(item.original_price).toFixed(2) : null,
          description: item.description,
          category_id: item.category_id,
          category_name: item.category_name,
          subtotal: Number(item.price * item.quantity).toFixed(2)
        }));

        // 计算总金额
        this.totalAmount = this.selectedItems.reduce((sum, item) => {
          return sum + Number(item.price) * item.quantity;
        }, 0).toFixed(2);

        console.log('处理后的数据:', {
          items: this.selectedItems,
          totalAmount: this.totalAmount
        });

        // 设置订单基本信息
        this.orderNo = data.orderNo || new Date().getTime().toString();
        this.orderId = data.orderId;
        this.orderStatus = 0;
        this.statusText = '待支付';
        this.createTime = new Date().toLocaleString();
      });
    }
  },
  onUnload() {
    // 返回时更新首页数据
    const pages = getCurrentPages();
    const indexPage = pages[0];
    if (indexPage && indexPage.$vm) {
      indexPage.$vm.fetchCategories();
    }
  }
};
</script>

<style scoped>
.main-container {
  background-color: #f9f9f9;
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  margin-top: 10%;
  padding-bottom: 100px;
  /* 增加底部内边距，防止内容被底部操作栏遮挡 */
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
  margin: 15px 0;
  padding: 10px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.order-item-img {
  width: 80px;
  height: 80px;
  border-radius: 8px;
  object-fit: cover;
  margin-right: 15px;
  background-color: #f5f5f5;
}

.order-item-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.order-item-name {
  font-size: 16px;
  color: #333;
  margin-bottom: 5px;
}

.order-item-desc {
  font-size: 14px;
  color: #666;
  margin-bottom: 5px;
}

.order-item-quantity {
  font-size: 14px;
  color: #666;
}

.order-item-price {
  font-size: 16px;
  color: #ff6b6b;
  font-weight: bold;
}

.order-item-price-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 5px;
}

.price-info {
  display: flex;
  align-items: center;
}

.original-price {
  font-size: 14px;
  color: #666;
  margin-right: 5px;
}

.current-price {
  font-size: 14px;
  color: #ff6b6b;
  font-weight: bold;
}

.subtotal {
  font-size: 14px;
  color: #666;
}

.total {
  text-align: right;
  font-size: 18px;
  font-weight: bold;
  color: #ff6b6b;
  margin: 20px 0;
  padding: 15px;
  border-top: 1px solid #eee;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.total-amount {
  font-size: 18px;
  font-weight: bold;
  color: #ff6b6b;
}

.bottom-bar {
  display: flex;
  align-items: center;
  background-color: #ffffff;
  padding: 10px 15px;
  border-top: 1px solid #eee;
  justify-content: space-between;
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  width: 100%;
  box-sizing: border-box;
  box-shadow: 0 -2px 5px rgba(0, 0, 0, 0.1);
  z-index: 999;
}

.submit-button {
  margin-left: auto;
  padding: 10px 30px;
  background-color: #4cd964;
  color: white;
  border-radius: 20px;
  font-size: 16px;
  border: none;
  box-shadow: 0 4px 8px rgba(76, 217, 100, 0.2);
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

.order-time {
  padding: 12px 0;
  border-bottom: 1px solid #eee;
  margin-bottom: 15px;
  background-color: #f8f8f8;
  border-radius: 8px;
  padding-left: 10px;
}

.time-text {
  font-size: 14px;
  color: #666;
  display: block;
}
</style>
