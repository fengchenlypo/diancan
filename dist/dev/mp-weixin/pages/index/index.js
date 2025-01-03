"use strict";
const common_vendor = require("../../common/vendor.js");
const common_assets = require("../../common/assets.js");
const _sfc_main = {
  data() {
    return {
      // 分类及商品数据
      categories: [
        {
          name: "限量秒杀",
          items: [
            { id: 101, title: "宫保鸡丁", desc: "经典川菜，香辣可口", price: 58, sales: 1200, image: "https://example.com/gongbaojiding.png", quantity: 0 },
            { id: 102, title: "麻辣小龙虾", desc: "麻辣鲜香，小龙虾的经典吃法", price: 88, sales: 950, image: "https://example.com/malaxiaolongxia.png", quantity: 0 }
          ]
        },
        {
          name: "本店优惠",
          items: [
            { id: 103, title: "烧鹅", desc: "外皮酥脆，肉质鲜嫩", price: 98, sales: 800, image: "https://example.com/shaoye.png", quantity: 0 },
            { id: 104, title: "白切鸡", desc: "鸡肉鲜嫩，原汁原味", price: 68, sales: 1100, image: "https://example.com/baiqieji.png", quantity: 0 }
          ]
        },
        {
          name: "荤菜",
          items: [
            { id: 105, title: "鱼香肉丝", desc: "酸甜可口，口感独特", price: 68, sales: 1100, image: "https://example.com/yuxiangrousi.png", quantity: 0 }
          ]
        },
        {
          name: "素菜",
          items: [
            { id: 106, title: "剁椒鱼头", desc: "辣味十足，香味浓郁", price: 120, sales: 500, image: "https://example.com/duojiaoyutou.png", quantity: 0 },
            { id: 107, title: "湘西外婆菜", desc: "口味独特，咸香适口", price: 38, sales: 950, image: "https://example.com/xiangxiwaipocai.png", quantity: 0 }
          ]
        },
        {
          name: "饮料",
          items: [
            { id: 110, title: "可乐", desc: "经典碳酸饮料，刺激口感", price: 8, sales: 3e3, image: "https://example.com/cola.png", quantity: 0 },
            { id: 111, title: "雪碧", desc: "清爽解渴，口感清凉", price: 8, sales: 2800, image: "https://example.com/xuebi.png", quantity: 0 },
            { id: 112, title: "橙汁", desc: "新鲜榨取，营养丰富", price: 15, sales: 500, image: "https://example.com/orangejuice.png", quantity: 0 },
            { id: 113, title: "苹果汁", desc: "清甜可口，健康饮品", price: 15, sales: 450, image: "https://example.com/applejuice.png", quantity: 0 }
          ]
        },
        {
          name: "酒品",
          items: [
            { id: 114, title: "青岛啤酒", desc: "清爽的啤酒，适合夏天饮用", price: 25, sales: 800, image: "https://example.com/qingdaobeer.png", quantity: 0 },
            { id: 115, title: "白酒", desc: "浓香型白酒，醇厚口感", price: 168, sales: 300, image: "https://example.com/baijiu.png", quantity: 0 },
            { id: 116, title: "红酒", desc: "优雅红酒，醇香四溢", price: 258, sales: 200, image: "https://example.com/redwine.png", quantity: 0 }
          ]
        }
      ],
      activeIndex: 0,
      totalPrice: "0.00",
      // 初始化合计价格
      selectedItems: {}
      // 用于记录每个分类的已选商品数量
    };
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
    }
  },
  methods: {
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
      this.updateSelectedItems(item);
    },
    decreaseQuantity(item) {
      if (item.quantity > 0) {
        item.quantity--;
        this.updateTotalPrice();
        this.updateSelectedItems(item);
      }
    },
    updateQuantity(item, event) {
      const value = event.detail.value;
      if (value && value > 0) {
        item.quantity = parseInt(value, 10);
        this.updateTotalPrice();
        this.updateSelectedItems(item);
      } else {
        item.quantity = 1;
        this.updateTotalPrice();
        this.updateSelectedItems(item);
      }
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
    updateSelectedItems(item) {
      const category = this.categories.find((cat) => cat.items.includes(item));
      if (category) {
        this.selectedItems[category.name] = category.items.reduce((sum, currItem) => sum + currItem.quantity, 0);
      }
    },
    confirmOrder() {
      common_vendor.index.navigateTo({
        url: "/pages/order/order"
      });
    }
  },
  onLoad() {
    this.selectCategory(0);
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
      return common_vendor.e({
        a: common_vendor.t(category.name),
        b: $data.selectedItems[category.name]
      }, $data.selectedItems[category.name] ? {
        c: common_vendor.t($data.selectedItems[category.name])
      } : {}, {
        d: index,
        e: common_vendor.n({
          active: $data.activeIndex === index
        }),
        f: common_vendor.o(($event) => $options.selectCategory(index), index)
      });
    }),
    g: common_vendor.f($options.filteredItems, (item, idx, i0) => {
      return common_vendor.e({
        a: item.image,
        b: common_vendor.t(item.title),
        c: common_vendor.t(item.desc),
        d: common_vendor.t(item.sales),
        e: common_vendor.t(item.price),
        f: item.quantity > 0
      }, item.quantity > 0 ? {
        g: common_vendor.o(($event) => $options.decreaseQuantity(item), item.id)
      } : {}, {
        h: item.quantity > 0
      }, item.quantity > 0 ? {
        i: item.quantity,
        j: common_vendor.o(($event) => $options.updateQuantity(item, $event), item.id)
      } : {}, {
        k: common_vendor.o(($event) => $options.increaseQuantity(item), item.id),
        l: item.id
      });
    }),
    h: common_assets._imports_3,
    i: $options.totalSelectedItems > 0
  }, $options.totalSelectedItems > 0 ? {
    j: common_vendor.t($options.totalSelectedItems)
  } : {}, {
    k: common_vendor.t($data.totalPrice),
    l: common_vendor.o((...args) => $options.confirmOrder && $options.confirmOrder(...args))
  });
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-83a5a03c"]]);
wx.createPage(MiniProgramPage);
