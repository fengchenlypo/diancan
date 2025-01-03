"use strict";
const common_vendor = require("../../common/vendor.js");
const common_assets = require("../../common/assets.js");
const _sfc_main = {
  data() {
    return {
      orders: [
        {
          id: "1234567890",
          status: "待支付",
          statusClass: "pending",
          items: [
            { title: "宫保鸡丁", price: 58, quantity: 1, image: "https://example.com/gongbaojiding.png" },
            { title: "麻辣小龙虾", price: 88, quantity: 2, image: "https://example.com/malaxiaolongxia.png" }
          ],
          totalPrice: 234
        },
        {
          id: "0987654321",
          status: "待收货",
          statusClass: "shipped",
          items: [
            { title: "烧鹅", price: 98, quantity: 1, image: "https://example.com/shaoye.png" },
            { title: "白切鸡", price: 68, quantity: 1, image: "https://example.com/baiqieji.png" }
          ],
          totalPrice: 166
        }
      ]
    };
  },
  methods: {
    goBack() {
      common_vendor.index.navigateBack();
    },
    payOrder(orderId) {
      console.log("支付订单:", orderId);
    },
    confirmReceipt(orderId) {
      console.log("确认收货订单:", orderId);
    }
  }
};
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return {
    a: common_assets._imports_0$2,
    b: common_vendor.o((...args) => $options.goBack && $options.goBack(...args)),
    c: common_vendor.f($data.orders, (order, index, i0) => {
      return common_vendor.e({
        a: common_vendor.t(order.id),
        b: common_vendor.t(order.status),
        c: common_vendor.n(order.statusClass),
        d: common_vendor.f(order.items, (item, idx, i1) => {
          return {
            a: item.image,
            b: common_vendor.t(item.title),
            c: common_vendor.t(item.price),
            d: common_vendor.t(item.quantity),
            e: idx
          };
        }),
        e: common_vendor.t(order.totalPrice),
        f: order.status === "待支付"
      }, order.status === "待支付" ? {
        g: common_vendor.o(($event) => $options.payOrder(order.id), index)
      } : {}, {
        h: order.status === "待收货"
      }, order.status === "待收货" ? {
        i: common_vendor.o(($event) => $options.confirmReceipt(order.id), index)
      } : {}, {
        j: index
      });
    })
  };
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-e9b6fd63"]]);
wx.createPage(MiniProgramPage);
