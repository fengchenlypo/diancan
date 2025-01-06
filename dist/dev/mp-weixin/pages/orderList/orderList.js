"use strict";
const common_vendor = require("../../common/vendor.js");
const _sfc_main = {
  data() {
    return {
      orders: []
    };
  },
  methods: {
    // 获取订单列表
    async fetchOrders() {
      try {
        console.log("开始获取订单列表");
        const response = await common_vendor.index.request({
          url: "http://localhost:3001/api/orders",
          method: "GET"
        });
        console.log("获取订单列表响应:", response);
        if (response.statusCode === 200) {
          this.orders = response.data.map((order) => {
            console.log("处理订单数据:", order);
            let orderDetails = {};
            try {
              if (order.orderDetails) {
                orderDetails = typeof order.orderDetails === "string" ? JSON.parse(order.orderDetails) : order.orderDetails;
              }
            } catch (e) {
              console.error("解析订单详情失败:", e);
            }
            console.log("解析后的订单详情:", orderDetails);
            return {
              id: order.id,
              orderNo: order.orderNo,
              status: this.getStatusText(order.status),
              statusClass: this.getStatusClass(order.status),
              items: order.items.map((item) => ({
                title: item.title,
                price: item.price,
                quantity: item.quantity,
                image: item.image
              })),
              totalAmount: order.totalAmount,
              deliveryType: order.orderType,
              orderType: order.orderType,
              address: orderDetails.address || "",
              phone: orderDetails.phone || "",
              diningMode: orderDetails.diningType || "",
              pickupTime: orderDetails.pickupTime || "",
              orderDetails,
              remark: order.remark || "",
              createTime: order.createTime
            };
          });
        } else {
          throw new Error(response.data.error || "获取订单列表失败");
        }
      } catch (error) {
        console.error("获取订单列表失败:", error);
        common_vendor.index.showToast({
          title: "获取订单列表失败",
          icon: "none"
        });
      }
    },
    // 格式化时间
    formatTime(timestamp) {
      if (!timestamp)
        return "";
      const date = new Date(timestamp);
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");
      const hour = String(date.getHours()).padStart(2, "0");
      const minute = String(date.getMinutes()).padStart(2, "0");
      return `${year}-${month}-${day} ${hour}:${minute}`;
    },
    // 获取状态文本
    getStatusText(status) {
      const statusMap = {
        0: "待支付",
        1: "已支付",
        2: "已完成",
        3: "已取消"
      };
      return statusMap[status] || "未知状态";
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
    // 处理支付
    async handlePay(order) {
      try {
        const orderDetails = order.orderDetails || {};
        if (!order.orderType) {
          common_vendor.index.showToast({
            title: "订单类型错误",
            icon: "none"
          });
          this.navigateToOrderPage(order);
          return;
        }
        switch (order.orderType) {
          case "takeout":
            if (!orderDetails.phone || !orderDetails.address) {
              common_vendor.index.showToast({
                title: "请填写手机号和配送地址",
                icon: "none"
              });
              this.navigateToOrderPage(order);
              return;
            }
            break;
          case "pickup":
            if (!orderDetails.phone || !orderDetails.pickupTime) {
              common_vendor.index.showToast({
                title: "请填写手机号和取餐时间",
                icon: "none"
              });
              this.navigateToOrderPage(order);
              return;
            }
            break;
          case "dine-in":
            if (!orderDetails.tableNumber) {
              common_vendor.index.showToast({
                title: "请选择桌号",
                icon: "none"
              });
              this.navigateToOrderPage(order);
              return;
            }
            break;
          default:
            common_vendor.index.showToast({
              title: "订单类型错误",
              icon: "none"
            });
            return;
        }
        if (!order.totalAmount || order.totalAmount <= 0) {
          common_vendor.index.showToast({
            title: "订单金额错误",
            icon: "none"
          });
          return;
        }
        const response = await common_vendor.index.request({
          url: `http://localhost:3001/api/orders/${order.id}/pay`,
          method: "POST",
          data: {
            orderType: order.orderType,
            orderDetails
          }
        });
        if (response.statusCode === 200) {
          common_vendor.index.showToast({
            title: "支付成功",
            icon: "success"
          });
          this.fetchOrders();
        } else {
          throw new Error(response.data.error || "支付失败");
        }
      } catch (error) {
        console.error("支付失败:", error);
        common_vendor.index.showToast({
          title: error.message || "支付失败",
          icon: "none"
        });
      }
    },
    // 跳转到订单页面
    navigateToOrderPage(order) {
      try {
        const orderData = {
          id: order.id,
          orderNo: order.orderNo,
          status: order.status,
          type: order.orderType,
          orderDetails: order.orderDetails || {},
          items: order.items || [],
          totalAmount: order.totalAmount || 0,
          remark: order.remark || "",
          address: order.address || "",
          phone: order.phone || "",
          pickupTime: order.pickupTime || "",
          diningMode: order.diningMode || "",
          createTime: order.createTime
        };
        console.log("准备传递的订单数据:", orderData);
        common_vendor.index.setStorageSync("currentOrderData", orderData);
        common_vendor.index.navigateTo({
          url: `/pages/order/order?orderId=${order.id}&orderType=${order.orderType}&from=list`,
          success: () => {
            console.log("跳转成功");
          },
          fail: (err) => {
            console.error("跳转失败:", err);
            common_vendor.index.showToast({
              title: "跳转失败",
              icon: "none"
            });
          }
        });
      } catch (error) {
        console.error("跳转失败:", error);
        common_vendor.index.showToast({
          title: "跳转失败",
          icon: "none"
        });
      }
    },
    // 处理确认收货
    async handleReceive(order) {
      try {
        const response = await common_vendor.index.request({
          url: `http://localhost:3001/api/orders/${order.id}/receive`,
          method: "POST"
        });
        if (response.statusCode === 200) {
          common_vendor.index.showToast({
            title: "确认收货成功",
            icon: "success"
          });
          this.fetchOrders();
        } else {
          throw new Error("确认收货失败");
        }
      } catch (error) {
        console.error("确认收货失败:", error);
        common_vendor.index.showToast({
          title: "确认收货失败",
          icon: "none"
        });
      }
    },
    // 处理删除
    async handleDelete(order) {
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
        const response = await common_vendor.index.request({
          url: `http://localhost:3001/api/orders/${order.id}`,
          method: "DELETE"
        });
        if (response.statusCode === 200) {
          common_vendor.index.showToast({
            title: "删除成功",
            icon: "success"
          });
          this.fetchOrders();
        } else {
          throw new Error("删除失败");
        }
      } catch (error) {
        if (error.message !== "用户取消") {
          console.error("删除失败:", error);
          common_vendor.index.showToast({
            title: "删除失败",
            icon: "none"
          });
        }
      }
    }
  },
  onShow() {
    this.fetchOrders();
  }
};
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return {
    a: common_vendor.f($data.orders, (order, index, i0) => {
      return common_vendor.e({
        a: common_vendor.t(order.orderNo),
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
        p: common_vendor.t($options.formatTime(order.createTime)),
        q: common_vendor.t(order.totalAmount),
        r: common_vendor.o(($event) => $options.handleDelete(order), index),
        s: order.status === "待支付"
      }, order.status === "待支付" ? {
        t: common_vendor.o(($event) => $options.handlePay(order), index)
      } : {}, {
        v: order.status === "已支付"
      }, order.status === "已支付" ? {
        w: common_vendor.o(($event) => $options.handleReceive(order), index)
      } : {}, {
        x: index
      });
    })
  };
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-e9b6fd63"]]);
wx.createPage(MiniProgramPage);
