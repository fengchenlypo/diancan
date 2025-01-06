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
      deliveryType: "外卖",
      selectedItems: [],
      orderNo: "",
      orderId: null,
      totalAmount: "0.00",
      orderStatus: 0,
      statusText: "待支付",
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
      return this.selectedDateTime !== "";
    },
    // 验证表单
    validateForm() {
      if (this.current === 0) {
        if (!this.validatePhone()) {
          common_vendor.index.showToast({
            title: "请输入正确的手机号码",
            icon: "none"
          });
          return false;
        }
        if (!this.validateAddress()) {
          common_vendor.index.showToast({
            title: "请输入详细的收货地址",
            icon: "none"
          });
          return false;
        }
      } else if (this.current === 1)
        ;
      else if (this.current === 2) {
        if (!this.validatePhone()) {
          common_vendor.index.showToast({
            title: "请输入正确的手机号码",
            icon: "none"
          });
          return false;
        }
        if (!this.validatePickupTime()) {
          common_vendor.index.showToast({
            title: "请选择自提时间",
            icon: "none"
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
        const orderData = {
          items: this.selectedItems.map((item) => ({
            id: item.id,
            quantity: item.quantity,
            price: item.price
          })),
          totalAmount: this.totalAmount,
          deliveryType: this.items[this.current],
          address: this.current === 0 ? this.address : null,
          phone: this.current === 0 || this.current === 2 ? this.phone : null,
          diningMode: this.current === 1 ? this.array[this.index] : null,
          pickupTime: this.current === 2 ? this.selectedDateTime : null,
          remark: this.remark || null
        };
        const result = await new Promise((resolve, reject) => {
          common_vendor.index.request({
            url: "http://localhost:3001/api/orders/" + this.orderId + "/pay",
            method: "POST",
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
          common_vendor.index.showToast({
            title: "支付成功",
            icon: "success"
          });
          this.orderStatus = 1;
          this.statusText = "已支付";
          setTimeout(() => {
            common_vendor.index.redirectTo({
              url: "/pages/orderList/orderList"
            });
          }, 1500);
        } else {
          throw new Error(result.data.error || "支付失败");
        }
      } catch (error) {
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
    if (options.orderId) {
      this.orderId = options.orderId;
      this.fetchOrderDetail();
    } else {
      const eventChannel = this.getOpenerEventChannel();
      eventChannel.on("acceptDataFromOpenerPage", (data) => {
        this.selectedItems = data.items;
        this.totalAmount = data.totalAmount;
        this.orderNo = data.orderNo;
        this.orderId = data.orderId;
        this.orderStatus = 0;
        this.statusText = "待支付";
      });
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
    v: common_vendor.t($options.totalItems),
    w: common_vendor.f($data.selectedItems, (item, index, i0) => {
      return {
        a: item.image,
        b: common_vendor.t(item.title),
        c: common_vendor.t(item.quantity),
        d: common_vendor.t(item.price),
        e: index
      };
    }),
    x: common_vendor.t($data.totalAmount),
    y: $data.remark,
    z: common_vendor.o(($event) => $data.remark = $event.detail.value),
    A: common_vendor.t($data.totalAmount),
    B: $data.orderStatus === 0
  }, $data.orderStatus === 0 ? {
    C: common_vendor.o((...args) => $options.handlePayment && $options.handlePayment(...args))
  } : $data.orderStatus === 1 ? {} : $data.orderStatus === 2 ? {} : {}, {
    D: $data.orderStatus === 1,
    E: $data.orderStatus === 2
  });
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-88bf5328"]]);
wx.createPage(MiniProgramPage);
