"use strict";
const common_vendor = require("../../common/vendor.js");
const _sfc_main = {
  data() {
    return {
      orders: []
    };
  },
  methods: {
    async fetchOrders() {
      try {
        const result = await new Promise((resolve, reject) => {
          common_vendor.index.request({
            url: "http://localhost:3001/api/orders",
            method: "GET",
            success: (res) => {
              resolve(res);
            },
            fail: (err) => {
              reject(err);
            }
          });
        });
        if (result.statusCode === 200) {
          this.orders = result.data.map((order) => ({
            id: order.id,
            status: this.getOrderStatus(order.status),
            statusClass: this.getStatusClass(order.status),
            items: order.items.map((item) => ({
              title: item.title,
              price: item.price,
              quantity: item.quantity,
              image: item.image
            })),
            totalPrice: order.totalAmount,
            deliveryType: order.deliveryType,
            address: order.address,
            phone: order.phone,
            diningMode: order.diningMode,
            pickupTime: order.pickupTime,
            remark: order.remark,
            createdAt: new Date(order.createTime).toLocaleString()
          }));
        } else {
          throw new Error(result.data.error || "获取订单列表失败");
        }
      } catch (error) {
        console.error("获取订单列表失败:", error);
        common_vendor.index.showToast({
          title: "获取订单列表失败",
          icon: "none"
        });
      }
    },
    // 获取订单状态显示文本
    getOrderStatus(status) {
      const statusMap = {
        0: "待支付",
        1: "已支付",
        2: "已完成",
        3: "已取消"
      };
      return statusMap[status] || status;
    },
    // 获取状态对应的样式类
    getStatusClass(status) {
      const classMap = {
        0: "pending",
        1: "paid",
        2: "completed",
        3: "cancelled"
      };
      return classMap[status] || "default";
    },
    goBack() {
      common_vendor.index.navigateBack();
    },
    async payOrder(orderId) {
      try {
        const result = await new Promise((resolve, reject) => {
          common_vendor.index.request({
            url: "http://localhost:3001/api/orders/" + orderId + "/pay",
            method: "POST",
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
          this.fetchOrders();
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
    confirmReceipt(orderId) {
      console.log("确认收货订单:", orderId);
    },
    // 确认收货
    async handleConfirmReceive(order) {
      try {
        const result = await new Promise((resolve, reject) => {
          common_vendor.index.request({
            url: "http://localhost:3001/api/orders/" + order.id + "/receive",
            method: "POST",
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
            title: "确认收货成功",
            icon: "success"
          });
          this.fetchOrders();
        } else {
          throw new Error(result.data.error || "确认收货失败");
        }
      } catch (error) {
        common_vendor.index.showToast({
          title: error.message || "确认收货失败",
          icon: "none"
        });
      }
    },
    // 删除订单
    async handleDeleteOrder(order) {
      try {
        await new Promise((resolve, reject) => {
          common_vendor.index.showModal({
            title: "确认删除",
            content: "确定要删除这个订单吗？",
            success: (res) => {
              if (res.confirm) {
                resolve();
              } else {
                reject(new Error("用户取消"));
              }
            }
          });
        });
        const result = await new Promise((resolve, reject) => {
          common_vendor.index.request({
            url: "http://localhost:3001/api/orders/" + order.id,
            method: "DELETE",
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
            title: "删除成功",
            icon: "success"
          });
          this.fetchOrders();
        } else {
          throw new Error(result.data.error || "删除失败");
        }
      } catch (error) {
        if (error.message !== "用户取消") {
          common_vendor.index.showToast({
            title: error.message || "删除失败",
            icon: "none"
          });
        }
      }
    },
    // 获取订单总数量
    getTotalQuantity(order) {
      return order.items.reduce((sum, item) => sum + item.quantity, 0);
    }
  },
  onLoad() {
    this.fetchOrders();
  }
};
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return {
    a: common_vendor.f($data.orders, (order, index, i0) => {
      return common_vendor.e({
        a: common_vendor.t(order.id),
        b: common_vendor.t(order.status),
        c: common_vendor.n(order.statusClass),
        d: common_vendor.t(order.deliveryType),
        e: order.address
      }, order.address ? {
        f: common_vendor.t(order.address)
      } : {}, {
        g: order.diningMode
      }, order.diningMode ? {
        h: common_vendor.t(order.diningMode)
      } : {}, {
        i: order.pickupTime
      }, order.pickupTime ? {
        j: common_vendor.t(order.pickupTime)
      } : {}, {
        k: order.phone
      }, order.phone ? {
        l: common_vendor.t(order.phone)
      } : {}, {
        m: common_vendor.f(order.items, (item, idx, i1) => {
          return {
            a: item.image,
            b: common_vendor.t(item.title),
            c: common_vendor.t(item.price),
            d: common_vendor.t(item.quantity),
            e: idx
          };
        }),
        n: order.remark
      }, order.remark ? {
        o: common_vendor.t(order.remark)
      } : {}, {
        p: common_vendor.t(order.createdAt),
        q: common_vendor.t(order.totalPrice),
        r: common_vendor.o(($event) => $options.handleDeleteOrder(order), index),
        s: order.status === "待支付"
      }, order.status === "待支付" ? {
        t: common_vendor.o(($event) => $options.payOrder(order.id), index)
      } : {}, {
        v: order.status === "已支付"
      }, order.status === "已支付" ? {
        w: common_vendor.o(($event) => $options.handleConfirmReceive(order), index)
      } : {}, {
        x: index
      });
    })
  };
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-e9b6fd63"]]);
wx.createPage(MiniProgramPage);
