"use strict";
const common_vendor = require("../../common/vendor.js");
const common_assets = require("../../common/assets.js");
const _sfc_main = {
  data() {
    return {
      categories: [],
      activeIndex: 0,
      totalPrice: "0.00",
      selectedItems: {},
      cartPopupVisible: false
    };
  },
  methods: {
    // 获取菜品分类和列表
    async fetchCategories() {
      try {
        const res = await new Promise((resolve, reject) => {
          common_vendor.index.request({
            url: "http://localhost:3001/api/categories",
            method: "GET",
            success: (res2) => {
              resolve(res2);
            },
            fail: (err) => {
              reject(err);
            }
          });
        });
        if (res.statusCode === 200) {
          this.categories = res.data.map((category) => ({
            ...category,
            items: category.items.map((item) => ({
              ...item,
              quantity: 0
            }))
          }));
          this.updateTotalPrice();
        }
      } catch (error) {
        console.error("获取分类数据失败:", error);
        common_vendor.index.showToast({
          title: "获取数据失败",
          icon: "none"
        });
      }
    },
    // 确认订单
    async confirmOrder() {
      const cartItems = this.cartItems;
      if (cartItems.length === 0) {
        common_vendor.index.showToast({
          title: "请选择商品",
          icon: "none"
        });
        return;
      }
      try {
        const orderData = {
          items: cartItems.map((item) => ({
            id: item.id,
            title: item.title,
            price: item.price,
            quantity: item.quantity
          })),
          totalAmount: Number(this.totalPrice)
        };
        console.log("提交的订单数据:", orderData);
        const response = await common_vendor.index.request({
          url: "http://localhost:3001/api/orders",
          method: "POST",
          data: orderData
        });
        console.log("创建订单响应:", response);
        if (response.data.success) {
          this.clearCart();
          this.cartPopupVisible = false;
          common_vendor.index.navigateTo({
            url: `/pages/order/order?orderId=${response.data.orderId}`
          });
        } else {
          common_vendor.index.showToast({
            title: response.data.error || "创建订单失败",
            icon: "none"
          });
        }
      } catch (error) {
        console.error("创建订单失败:", error);
        common_vendor.index.showToast({
          title: "创建订单失败",
          icon: "none"
        });
      }
    },
    // 根据商品ID查找商品信息
    findProduct(productId) {
      for (const category of this.categories) {
        const product = category.items.find((item) => item.id === productId);
        if (product) {
          return product;
        }
      }
      return null;
    },
    // 其他方法保持不变
    selectCategory(index) {
      this.activeIndex = index;
    },
    goToSearchPage() {
      common_vendor.index.navigateTo({
        url: "/pages/search/search"
      });
    },
    goToOrderlistPage() {
      common_vendor.index.navigateTo({
        url: "/pages/orderList/orderList"
      });
    },
    increaseQuantity(item) {
      item.quantity++;
      this.updateTotalPrice();
      this.updateSelectedItems();
    },
    decreaseQuantity(item) {
      if (item.quantity > 0) {
        item.quantity--;
        this.updateTotalPrice();
        this.updateSelectedItems();
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
      this.updateSelectedItems();
    },
    updateTotalPrice() {
      let total = 0;
      this.categories.forEach((category) => {
        category.items.forEach((item) => {
          total += item.price * item.quantity;
        });
      });
      this.totalPrice = total.toFixed(2);
    },
    updateSelectedItems() {
      const newSelectedItems = {};
      this.categories.forEach((category) => {
        const count = category.items.reduce((sum, item) => sum + item.quantity, 0);
        if (count > 0) {
          newSelectedItems[category.name] = count;
        }
      });
      this.selectedItems = newSelectedItems;
    },
    // 清空购物车
    clearCart() {
      this.categories.forEach((category) => {
        category.items.forEach((item) => {
          item.quantity = 0;
        });
      });
      this.updateTotalPrice();
      this.updateSelectedItems();
    },
    // 切换购物车弹窗显示状态
    toggleCartPopup() {
      this.cartPopupVisible = !this.cartPopupVisible;
    },
    // 增加购物车中商品数量
    increaseCartItemQuantity(item) {
      this.increaseQuantity(item);
    },
    // 减少购物车中商品数量
    decreaseCartItemQuantity(item) {
      this.decreaseQuantity(item);
    },
    // 更新购物车中商品数量
    updateCartItemQuantity(item, event) {
      this.updateQuantity(item, event);
    }
  },
  computed: {
    activeCategory() {
      return this.categories[this.activeIndex];
    },
    filteredItems() {
      var _a;
      return ((_a = this.activeCategory) == null ? void 0 : _a.items) || [];
    },
    totalSelectedItems() {
      let total = 0;
      Object.values(this.selectedItems).forEach((count) => total += count);
      return total;
    },
    cartItems() {
      const items = [];
      this.categories.forEach((category) => {
        category.items.forEach((item) => {
          if (item.quantity > 0) {
            items.push(item);
          }
        });
      });
      return items;
    }
  },
  onLoad() {
    this.fetchCategories();
  },
  onShow() {
    this.updateSelectedItems();
    this.updateTotalPrice();
  }
};
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return common_vendor.e({
    a: common_assets._imports_0,
    b: common_assets._imports_0$1,
    c: common_vendor.o((...args) => $options.goToSearchPage && $options.goToSearchPage(...args)),
    d: common_assets._imports_2,
    e: common_vendor.o((...args) => $options.goToOrderlistPage && $options.goToOrderlistPage(...args)),
    f: common_vendor.f($data.categories, (category, index, i0) => {
      return {
        a: common_vendor.t(category.name),
        b: index,
        c: common_vendor.n({
          active: $data.activeIndex === index
        }),
        d: common_vendor.o(($event) => $options.selectCategory(index), index)
      };
    }),
    g: common_vendor.f($options.filteredItems, (item, idx, i0) => {
      return common_vendor.e({
        a: item.image,
        b: common_vendor.t(item.title),
        c: common_vendor.t(item.desc),
        d: common_vendor.t(item.sales),
        e: common_vendor.t(item.price),
        f: item.original_price
      }, item.original_price ? {
        g: common_vendor.t(item.original_price)
      } : {}, {
        h: item.quantity > 0
      }, item.quantity > 0 ? {
        i: common_vendor.o(($event) => $options.decreaseQuantity(item), item.id)
      } : {}, {
        j: item.quantity > 0
      }, item.quantity > 0 ? {
        k: item.quantity,
        l: common_vendor.o(($event) => $options.updateQuantity(item, $event), item.id)
      } : {}, {
        m: common_vendor.o(($event) => $options.increaseQuantity(item), item.id),
        n: !item.quantity ? 1 : "",
        o: item.id
      });
    }),
    h: common_assets._imports_3,
    i: common_vendor.o((...args) => $options.toggleCartPopup && $options.toggleCartPopup(...args)),
    j: $options.totalSelectedItems > 0
  }, $options.totalSelectedItems > 0 ? {
    k: common_vendor.t($options.totalSelectedItems)
  } : {}, {
    l: common_vendor.t($data.totalPrice),
    m: common_vendor.o((...args) => $options.confirmOrder && $options.confirmOrder(...args)),
    n: $data.cartPopupVisible
  }, $data.cartPopupVisible ? {
    o: common_vendor.o((...args) => $options.toggleCartPopup && $options.toggleCartPopup(...args)),
    p: common_vendor.f($options.cartItems, (item, idx, i0) => {
      return {
        a: item.image,
        b: common_vendor.t(item.title),
        c: common_vendor.t(item.price),
        d: common_vendor.o(($event) => $options.decreaseCartItemQuantity(item), idx),
        e: item.quantity,
        f: common_vendor.o(($event) => $options.updateCartItemQuantity(item, $event), idx),
        g: common_vendor.o(($event) => $options.increaseCartItemQuantity(item), idx),
        h: idx
      };
    }),
    q: common_vendor.t($data.totalPrice),
    r: common_vendor.o((...args) => $options.confirmOrder && $options.confirmOrder(...args))
  } : {});
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-83a5a03c"]]);
wx.createPage(MiniProgramPage);
