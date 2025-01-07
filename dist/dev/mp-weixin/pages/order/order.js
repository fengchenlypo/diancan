"use strict";
const common_vendor = require("../../common/vendor.js");
const _sfc_main = {
  data() {
    return {
      array: ["店内就餐", "打包带走"],
      index: 0,
      items: ["外卖", "堂食", "自提"],
      current: 0,
      diandan: [],
      // 自提时间选择器数据
      dateRange: [
        ["今天", "明天", "后天"],
        ["10:00", "10:30", "11:00", "11:30", "12:00", "12:30", "13:00", "13:30", "14:00", "14:30", "15:00", "15:30", "16:00", "16:30", "17:00", "17:30", "18:00", "18:30", "19:00", "19:30", "20:00"]
      ],
      selectedDateTime: "",
      index1: [0, 0],
      address: "",
      phone: "",
      remark: "",
      deliveryType: "堂食",
      selectedItems: [],
      orderNo: "",
      orderId: null,
      totalAmount: "0.00",
      orderStatus: 0,
      statusText: "待支付",
      formValid: false,
      createTime: "",
      fromPage: ""
      // 添加来源页面标记
    };
  },
  // 添加页面配置
  onBackPress() {
    this.handleBack();
    return true;
  },
  methods: {
    // 添加返回处理方法
    handleBack() {
      if (this.fromPage === "orderList") {
        common_vendor.index.navigateBack({
          delta: 1
        });
      } else if (this.fromPage === "index") {
        common_vendor.index.switchTab({
          url: "/pages/index/index"
        });
      } else {
        common_vendor.index.navigateBack({
          delta: 1
        });
      }
    },
    // 验证手机号
    validatePhone() {
      const phoneReg = /^1[3-9]\d{9}$/;
      if (!this.phone) {
        common_vendor.index.showToast({
          title: "请输入手机号码",
          icon: "none"
        });
        return false;
      }
      if (!phoneReg.test(this.phone)) {
        common_vendor.index.showToast({
          title: "请输入正确的手机号码",
          icon: "none"
        });
        return false;
      }
      return true;
    },
    // 验证地址
    validateAddress() {
      if (!this.address) {
        common_vendor.index.showToast({
          title: "请输入收货地址",
          icon: "none"
        });
        return false;
      }
      if (this.address.length < 5) {
        common_vendor.index.showToast({
          title: "请输入详细的收货地址",
          icon: "none"
        });
        return false;
      }
      return true;
    },
    // 验证自提时间
    validatePickupTime() {
      if (!this.selectedDateTime) {
        common_vendor.index.showToast({
          title: "请选择自提时间",
          icon: "none"
        });
        return false;
      }
      return true;
    },
    // 验证表单
    validateForm() {
      if (this.current === 0) {
        if (!this.validatePhone())
          return false;
        if (!this.validateAddress())
          return false;
      } else if (this.current === 2) {
        if (!this.validatePhone())
          return false;
        if (!this.validatePickupTime())
          return false;
      }
      return true;
    },
    // 处理支付
    async handlePay() {
      if (!this.validateForm()) {
        return;
      }
      try {
        const orderInfo = {
          orderType: this.items[this.current],
          // 外卖/堂食/自提
          orderDetails: {},
          items: this.selectedItems.map((item) => ({
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
          status: 0,
          // 待支付
          remark: this.remark || "",
          create_time: (/* @__PURE__ */ new Date()).toISOString(),
          order_no: this.orderNo
        };
        if (this.current === 0) {
          orderInfo.orderDetails = {
            phone: this.phone,
            address: this.address,
            orderType: "外卖",
            deliveryStatus: "待配送"
          };
        } else if (this.current === 1) {
          orderInfo.orderDetails = {
            diningType: this.array[this.index],
            // 店内就餐/打包带走
            orderType: "堂食",
            tableStatus: "待就餐"
          };
        } else if (this.current === 2) {
          orderInfo.orderDetails = {
            phone: this.phone,
            pickupTime: this.selectedDateTime,
            orderType: "自提",
            pickupStatus: "待取餐"
          };
        }
        console.log("提交的订单数据:", orderInfo);
        const result = await new Promise((resolve, reject) => {
          common_vendor.index.request({
            url: `http://localhost:3001/api/orders/${this.orderId}/pay`,
            method: "POST",
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
          common_vendor.index.showToast({
            title: "支付成功",
            icon: "success"
          });
          setTimeout(() => {
            common_vendor.index.redirectTo({
              url: "/pages/orderList/orderList"
            });
          }, 1500);
        } else {
          throw new Error(result.data.error || "支付失败");
        }
      } catch (error) {
        console.error("支付失败:", error);
        common_vendor.index.showToast({
          title: error.message || "支付失败",
          icon: "none"
        });
      }
    },
    // 生成日期范围
    generateDateRange() {
      const dates = ["今天", "明天", "后天"];
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
        this.phone = "";
        this.address = "";
        this.selectedDateTime = "";
        this.index = 0;
      }
    },
    // 获取订单状态显示文本
    getStatusText(status) {
      const statusMap = {
        0: "待支付",
        1: "已支付",
        2: "已完成",
        3: "已取消"
      };
      return statusMap[status] || "未知状态";
    },
    // 获取订单详情
    async fetchOrderDetail() {
      try {
        const result = await new Promise((resolve, reject) => {
          common_vendor.index.request({
            url: `http://localhost:3001/api/orders/${this.orderId}`,
            method: "GET",
            success: (res) => {
              console.log("获取到的订单数据:", res.data);
              resolve(res);
            },
            fail: (err) => {
              reject(err);
            }
          });
        });
        if (result.statusCode === 200) {
          const orderData = result.data;
          console.log("原始订单数据:", orderData);
          this.selectedItems = orderData.items.map((item) => ({
            id: item.id,
            // order_items 表的 id
            product_id: item.product_id,
            // 商品ID
            order_id: item.order_id,
            // 订单ID
            title: item.title,
            price: Number(item.price).toFixed(2),
            quantity: item.quantity,
            image: item.image_url || item.image || `/static/products/${item.title}.jpg`,
            original_price: item.original_price ? Number(item.original_price).toFixed(2) : null,
            description: item.description,
            category_id: item.category_id,
            category_name: item.category_name,
            subtotal: Number(item.price * item.quantity).toFixed(2)
            // 小计金额
          }));
          this.totalAmount = orderData.total_amount ? Number(orderData.total_amount).toFixed(2) : "0.00";
          console.log("设置总金额:", this.totalAmount);
          this.orderNo = orderData.order_no;
          this.orderId = orderData.id;
          this.orderStatus = orderData.status;
          this.statusText = this.getStatusText(orderData.status);
          this.remark = orderData.remark || "";
          if (orderData.create_time) {
            try {
              const date = new Date(orderData.create_time);
              if (!isNaN(date.getTime())) {
                this.createTime = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")} ${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
                console.log("设置下单时间:", this.createTime);
              } else {
                console.error("无效的日期格式:", orderData.create_time);
              }
            } catch (error) {
              console.error("处理下单时间出错:", error);
            }
          }
          if (orderData.order_type) {
            const typeIndex = this.items.indexOf(orderData.order_type);
            if (typeIndex !== -1) {
              this.current = typeIndex;
              if (orderData.order_details) {
                const orderDetails = typeof orderData.order_details === "string" ? JSON.parse(orderData.order_details) : orderData.order_details;
                if (this.current === 0) {
                  this.phone = orderDetails.phone || "";
                  this.address = orderDetails.address || "";
                } else if (this.current === 1) {
                  const diningTypeIndex = this.array.indexOf(orderDetails.diningType);
                  if (diningTypeIndex !== -1) {
                    this.index = diningTypeIndex;
                  }
                } else if (this.current === 2) {
                  this.phone = orderDetails.phone || "";
                  this.selectedDateTime = orderDetails.pickupTime || "";
                }
              }
            }
          }
          console.log("处理后的订单数据:", {
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
        console.error("获取订单详情失败:", error);
        common_vendor.index.showToast({
          title: "获取订单详情失败",
          icon: "none"
        });
      }
    }
  },
  computed: {
    changdu() {
      return this.diandan.length;
    },
    qiuhe() {
      return this.diandan.reduce((sum, item) => sum + item.price * item.shuliang, 0);
    },
    totalItems() {
      return this.selectedItems.reduce((sum, item) => sum + item.quantity, 0);
    }
  },
  onLoad(options) {
    this.fromPage = options.from || "";
    console.log("页面来源:", this.fromPage);
    if (options.orderId) {
      this.orderId = options.orderId;
      this.fetchOrderDetail();
    } else {
      const eventChannel = this.getOpenerEventChannel();
      eventChannel.on("acceptDataFromOpenerPage", (data) => {
        console.log("接收到的数据:", data);
        this.selectedItems = data.items.map((item) => ({
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
        this.totalAmount = this.selectedItems.reduce((sum, item) => {
          return sum + Number(item.price) * item.quantity;
        }, 0).toFixed(2);
        console.log("处理后的数据:", {
          items: this.selectedItems,
          totalAmount: this.totalAmount
        });
        this.orderNo = data.orderNo || (/* @__PURE__ */ new Date()).getTime().toString();
        this.orderId = data.orderId;
        this.orderStatus = 0;
        this.statusText = "待支付";
        this.createTime = (/* @__PURE__ */ new Date()).toLocaleString();
      });
    }
  },
  onUnload() {
    const pages = getCurrentPages();
    const indexPage = pages[0];
    if (indexPage && indexPage.$vm) {
      indexPage.$vm.fetchCategories();
    }
  }
};
if (!Array) {
  const _easycom_uni_segmented_control2 = common_vendor.resolveComponent("uni-segmented-control");
  _easycom_uni_segmented_control2();
}
const _easycom_uni_segmented_control = () => "../../uni_modules/uni-segmented-control/components/uni-segmented-control/uni-segmented-control.js";
if (!Math) {
  _easycom_uni_segmented_control();
}
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return common_vendor.e({
    a: common_vendor.o($options.onClickItem),
    b: common_vendor.p({
      current: $data.current,
      values: $data.items,
      styleType: "button",
      activeColor: "#4cd964"
    }),
    c: $data.phone,
    d: common_vendor.o(($event) => $data.phone = $event.detail.value),
    e: $data.address,
    f: common_vendor.o(($event) => $data.address = $event.detail.value),
    g: $data.current === 0,
    h: common_vendor.t($data.array[$data.index]),
    i: $data.array,
    j: common_vendor.o((...args) => _ctx.bindChange && _ctx.bindChange(...args)),
    k: $data.current === 1,
    l: common_vendor.t($data.selectedDateTime || "请选择自提时间"),
    m: $data.dateRange,
    n: common_vendor.o((...args) => $options.onMultiChange && $options.onMultiChange(...args)),
    o: $data.phone,
    p: common_vendor.o(($event) => $data.phone = $event.detail.value),
    q: $data.current === 2,
    r: $data.orderNo
  }, $data.orderNo ? {
    s: common_vendor.t($data.orderNo),
    t: common_vendor.t($data.statusText)
  } : {}, {
    v: $data.createTime
  }, $data.createTime ? {
    w: common_vendor.t($data.createTime)
  } : {}, {
    x: common_vendor.t($options.totalItems),
    y: common_vendor.f($data.selectedItems, (item, index, i0) => {
      return common_vendor.e({
        a: `http://localhost:3001/${item.image}`,
        b: common_vendor.t(item.title),
        c: item.description
      }, item.description ? {
        d: common_vendor.t(item.description)
      } : {}, {
        e: common_vendor.t(item.quantity),
        f: item.original_price
      }, item.original_price ? {
        g: common_vendor.t(item.original_price)
      } : {}, {
        h: common_vendor.t(item.price),
        i: common_vendor.t(item.subtotal),
        j: index
      });
    }),
    z: $data.totalAmount
  }, $data.totalAmount ? {
    A: common_vendor.t($data.totalAmount)
  } : {}, {
    B: $data.remark,
    C: common_vendor.o(($event) => $data.remark = $event.detail.value),
    D: common_vendor.t($data.totalAmount),
    E: $data.orderStatus === 0
  }, $data.orderStatus === 0 ? {
    F: common_vendor.o((...args) => $options.handlePay && $options.handlePay(...args))
  } : $data.orderStatus === 1 ? {} : $data.orderStatus === 2 ? {} : {}, {
    G: $data.orderStatus === 1,
    H: $data.orderStatus === 2
  });
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-88bf5328"]]);
wx.createPage(MiniProgramPage);
