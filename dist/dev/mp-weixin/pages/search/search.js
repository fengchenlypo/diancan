"use strict";
const common_vendor = require("../../common/vendor.js");
const common_assets = require("../../common/assets.js");
const _sfc_main = {
  data() {
    return {
      query: "",
      filteredItems: []
    };
  },
  methods: {
    async onSearch() {
      if (!this.query.trim()) {
        common_vendor.index.showToast({
          title: "请输入搜索关键词",
          icon: "none"
        });
        return;
      }
      try {
        const res = await new Promise((resolve, reject) => {
          common_vendor.index.request({
            url: `http://localhost:3001/api/search?keyword=${encodeURIComponent(this.query)}`,
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
          console.log("搜索结果原始数据:", JSON.stringify(res.data, null, 2));
          const pages = getCurrentPages();
          const indexPage = pages[0];
          this.filteredItems = res.data.map((item) => {
            console.log("处理单个商品原始数据:", JSON.stringify(item, null, 2));
            let quantity = 0;
            if (indexPage && indexPage.$vm && indexPage.$vm.categories) {
              const categories = indexPage.$vm.categories;
              for (const category of categories) {
                const existingItem = category.items.find((i) => i.id === item.id);
                if (existingItem) {
                  quantity = existingItem.quantity;
                  break;
                }
              }
            }
            const imageUrl = item.image || item.image_url || "http://localhost:3001/uploads/logo.png";
            console.log("使用图片路径:", imageUrl);
            const processedItem = {
              id: item.id,
              title: item.title,
              desc: item.description || "",
              price: item.price || 0,
              original_price: item.original_price || 0,
              sales: item.sales || 0,
              image: imageUrl,
              category: item.category_name || "未分类",
              quantity
            };
            console.log("处理后的商品数据:", JSON.stringify(processedItem, null, 2));
            return processedItem;
          });
          if (this.filteredItems.length === 0) {
            common_vendor.index.showToast({
              title: "没有找到相关商品",
              icon: "none"
            });
          }
        } else {
          throw new Error(res.data.error || "搜索失败");
        }
      } catch (error) {
        console.error("搜索失败:", error);
        common_vendor.index.showToast({
          title: "搜索失败",
          icon: "none"
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
      const cartItems = this.filteredItems.filter((item) => item.quantity > 0).map((item) => ({
        id: item.id,
        title: item.title,
        price: item.price,
        image: item.image,
        quantity: item.quantity
      }));
      common_vendor.index.setStorageSync("cartItems", JSON.stringify(cartItems));
    },
    // 返回首页
    goBack() {
      common_vendor.index.navigateBack();
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
      const indexPage = pages[0];
      if (indexPage && indexPage.$vm && indexPage.$vm.categories) {
        const categories = indexPage.$vm.categories;
        for (const category of categories) {
          const existingItem = category.items.find((i) => i.id === item.id);
          if (existingItem) {
            existingItem.quantity = item.quantity;
            indexPage.$vm.updateTotalPrice();
            indexPage.$vm.updateSelectedItems();
            break;
          }
        }
      }
    },
    updateTotalPrice() {
      let total = 0;
      this.filteredItems.forEach((item) => {
        total += item.price * item.quantity;
      });
      this.totalPrice = total.toFixed(2);
    },
    // 处理图片加载错误
    handleImageError(item) {
      console.log("图片加载失败:", item.image);
      item.image = "http://localhost:3001/uploads/logo.png";
    }
  },
  // 页面加载时自动聚焦搜索框
  onShow() {
    setTimeout(() => {
      common_vendor.index.createSelectorQuery().select(".search-input").boundingClientRect((rect) => {
        if (rect) {
          common_vendor.index.pageScrollTo({
            scrollTop: rect.top,
            duration: 0
          });
        }
      }).exec();
    }, 350);
  }
};
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return common_vendor.e({
    a: common_vendor.o((...args) => $options.onSearch && $options.onSearch(...args)),
    b: $data.query,
    c: common_vendor.o(($event) => $data.query = $event.detail.value),
    d: common_assets._imports_0$1,
    e: common_vendor.o((...args) => $options.onSearch && $options.onSearch(...args)),
    f: $data.filteredItems.length > 0
  }, $data.filteredItems.length > 0 ? {
    g: common_vendor.f($data.filteredItems, (item, k0, i0) => {
      return common_vendor.e({
        a: item.image,
        b: common_vendor.o(($event) => $options.handleImageError(item), item.id),
        c: common_vendor.t(item.title),
        d: common_vendor.t(item.category),
        e: common_vendor.t(item.desc),
        f: common_vendor.t(item.price),
        g: item.original_price
      }, item.original_price ? {
        h: common_vendor.t(item.original_price)
      } : {}, {
        i: common_vendor.t(item.sales),
        j: item.quantity > 0
      }, item.quantity > 0 ? {
        k: common_vendor.o(($event) => $options.decreaseQuantity(item), item.id)
      } : {}, {
        l: item.quantity > 0
      }, item.quantity > 0 ? {
        m: item.quantity,
        n: common_vendor.o(($event) => $options.updateQuantity(item, $event), item.id)
      } : {}, {
        o: common_vendor.o(($event) => $options.increaseQuantity(item), item.id),
        p: !item.quantity ? 1 : "",
        q: item.id
      });
    })
  } : {}, {
    h: $data.filteredItems.length === 0
  }, $data.filteredItems.length === 0 ? {} : {});
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-cdfa925e"]]);
wx.createPage(MiniProgramPage);
