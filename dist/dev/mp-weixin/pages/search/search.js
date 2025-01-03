"use strict";
const common_vendor = require("../../common/vendor.js");
const common_assets = require("../../common/assets.js");
const _sfc_main = {
  setup() {
    const query = common_vendor.ref("");
    const items = common_vendor.ref([
      { id: 101, title: "宫保鸡丁", desc: "经典川菜，香辣可口", price: 58, sales: 1200, image: "https://example.com/gongbaojiding.png" },
      { id: 102, title: "麻辣小龙虾", desc: "麻辣鲜香，小龙虾的经典吃法", price: 88, sales: 950, image: "https://example.com/malaxiaolongxia.png" },
      { id: 103, title: "烧鹅", desc: "外皮酥脆，肉质鲜嫩", price: 98, sales: 800, image: "https://example.com/shaoye.png" },
      { id: 104, title: "白切鸡", desc: "鸡肉鲜嫩，原汁原味", price: 68, sales: 1100, image: "https://example.com/baiqieji.png" },
      { id: 105, title: "鱼香肉丝", desc: "酸甜可口，口感独特", price: 68, sales: 1100, image: "https://example.com/yuxiangrousi.png" },
      { id: 106, title: "剁椒鱼头", desc: "辣味十足，香味浓郁", price: 120, sales: 500, image: "https://example.com/duojiaoyutou.png" },
      { id: 107, title: "湘西外婆菜", desc: "口味独特，咸香适口", price: 38, sales: 950, image: "https://example.com/xiangxiwaipocai.png" },
      { id: 108, title: "凉拌黄瓜", desc: "清爽可口，开胃小菜", price: 18, sales: 1600, image: "https://example.com/liangbanhuanggua.png" },
      { id: 109, title: "素翅", desc: "绿色健康，美味可口", price: 28, sales: 1200, image: "https://example.com/suchi.png" },
      { id: 110, title: "可乐", desc: "经典碳酸饮料，刺激口感", price: 8, sales: 3e3, image: "https://example.com/cola.png" },
      { id: 111, title: "雪碧", desc: "清爽解渴，口感清凉", price: 8, sales: 2800, image: "https://example.com/xuebi.png" },
      { id: 112, title: "橙汁", desc: "新鲜榨取，营养丰富", price: 15, sales: 500, image: "https://example.com/orangejuice.png" },
      { id: 113, title: "苹果汁", desc: "清甜可口，健康饮品", price: 15, sales: 450, image: "https://example.com/applejuice.png" },
      { id: 114, title: "青岛啤酒", desc: "清爽的啤酒，适合夏天饮用", price: 25, sales: 800, image: "https://example.com/qingdaobeer.png" },
      { id: 115, title: "白酒", desc: "浓香型白酒，醇厚口感", price: 168, sales: 300, image: "https://example.com/baijiu.png" },
      { id: 116, title: "红酒", desc: "优雅红酒，醇香四溢", price: 258, sales: 200, image: "https://example.com/redwine.png" }
    ]);
    const filteredItems = common_vendor.computed(() => {
      if (!query.value)
        return items.value;
      return items.value.filter((item) => item.title.includes(query.value));
    });
    const onSearch = () => {
    };
    return {
      query,
      filteredItems,
      onSearch
    };
  }
};
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return common_vendor.e({
    a: $setup.query,
    b: common_vendor.o(($event) => $setup.query = $event.detail.value),
    c: common_assets._imports_0$1,
    d: common_vendor.o((...args) => $setup.onSearch && $setup.onSearch(...args)),
    e: $setup.filteredItems.length > 0
  }, $setup.filteredItems.length > 0 ? {
    f: common_vendor.f($setup.filteredItems, (item, k0, i0) => {
      return {
        a: item.image,
        b: common_vendor.t(item.title),
        c: common_vendor.t(item.desc),
        d: common_vendor.t(item.price),
        e: common_vendor.t(item.sales),
        f: item.id
      };
    })
  } : {}, {
    g: $setup.filteredItems.length === 0
  }, $setup.filteredItems.length === 0 ? {} : {});
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-cdfa925e"]]);
wx.createPage(MiniProgramPage);
