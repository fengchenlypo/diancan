"use strict";
const common_vendor = require("../../common/vendor.js");
const common_assets = require("../../common/assets.js");
const _sfc_main = {
  data() {
    return {
      // 分类及商品数据，已添加限量秒杀、本店优惠、饮料、酒品分类
      categories: [
        {
          name: "限量秒杀",
          items: [
            { id: 101, title: "宫保鸡丁", desc: "经典川菜，香辣可口", price: 58, sales: 1200, image: "https://example.com/gongbaojiding.png" },
            { id: 102, title: "麻辣小龙虾", desc: "麻辣鲜香，小龙虾的经典吃法", price: 88, sales: 950, image: "https://example.com/malaxiaolongxia.png" }
          ]
        },
        {
          name: "本店优惠",
          items: [
            { id: 103, title: "烧鹅", desc: "外皮酥脆，肉质鲜嫩", price: 98, sales: 800, image: "https://example.com/shaoye.png" },
            { id: 104, title: "白切鸡", desc: "鸡肉鲜嫩，原汁原味", price: 68, sales: 1100, image: "https://example.com/baiqieji.png" }
          ]
        },
        {
          name: "荤菜",
          items: [
            { id: 105, title: "鱼香肉丝", desc: "酸甜可口，口感独特", price: 68, sales: 1100, image: "https://example.com/yuxiangrousi.png" }
          ]
        },
        {
          name: "素菜",
          items: [
            { id: 106, title: "剁椒鱼头", desc: "辣味十足，香味浓郁", price: 120, sales: 500, image: "https://example.com/duojiaoyutou.png" },
            { id: 107, title: "湘西外婆菜", desc: "口味独特，咸香适口", price: 38, sales: 950, image: "https://example.com/xiangxiwaipocai.png" }
          ]
        },
        {
          name: "饮料",
          items: [
            { id: 110, title: "可乐", desc: "经典碳酸饮料，刺激口感", price: 8, sales: 3e3, image: "https://example.com/cola.png" },
            { id: 111, title: "雪碧", desc: "清爽解渴，口感清凉", price: 8, sales: 2800, image: "https://example.com/xuebi.png" },
            { id: 112, title: "橙汁", desc: "新鲜榨取，营养丰富", price: 15, sales: 500, image: "https://example.com/orangejuice.png" },
            { id: 113, title: "苹果汁", desc: "清甜可口，健康饮品", price: 15, sales: 450, image: "https://example.com/applejuice.png" }
          ]
        },
        {
          name: "酒品",
          items: [
            { id: 114, title: "青岛啤酒", desc: "清爽的啤酒，适合夏天饮用", price: 25, sales: 800, image: "https://example.com/qingdaobeer.png" },
            { id: 115, title: "白酒", desc: "浓香型白酒，醇厚口感", price: 168, sales: 300, image: "https://example.com/baijiu.png" },
            { id: 116, title: "红酒", desc: "优雅红酒，醇香四溢", price: 258, sales: 200, image: "https://example.com/redwine.png" }
          ]
        }
      ],
      activeIndex: 0
    };
  },
  computed: {
    activeCategory() {
      return this.categories[this.activeIndex];
    },
    filteredItems() {
      var _a;
      return ((_a = this.activeCategory) == null ? void 0 : _a.items) || [];
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
    }
  },
  onLoad() {
    this.selectCategory(0);
  }
};
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return {
    a: common_assets._imports_0,
    b: common_assets._imports_0$1,
    c: common_vendor.o((...args) => $options.goToSearchPage && $options.goToSearchPage(...args)),
    d: common_assets._imports_2,
    e: common_vendor.f($data.categories, (category, index, i0) => {
      return {
        a: common_vendor.t(category.name),
        b: index,
        c: common_vendor.n({
          active: $data.activeIndex === index
        }),
        d: common_vendor.o(($event) => $options.selectCategory(index), index)
      };
    }),
    f: common_vendor.f($options.filteredItems, (item, idx, i0) => {
      return {
        a: item.image,
        b: common_vendor.t(item.title),
        c: common_vendor.t(item.desc),
        d: common_vendor.t(item.sales),
        e: common_vendor.t(item.price),
        f: item.id
      };
    })
  };
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-83a5a03c"]]);
wx.createPage(MiniProgramPage);
