"use strict";
const common_vendor = require("../../common/vendor.js");
const _sfc_main = {
  data() {
    return {
      array: ["店内就餐", "打包带走"],
      index: 0,
      items: ["外卖", "堂食", "自提"],
      current: 0,
      diandan: [
        { id: 1, URL: "../../static/kelei.png", name: "年糕", shuliang: 2, price: 100 },
        { id: 2, URL: "../../static/kelei.png", name: "鸡翅", shuliang: 2, price: 100 },
        { id: 3, URL: "../../static/kelei.png", name: "火锅", shuliang: 2, price: 100 }
      ],
      dateRange: [["今天", "01月03日", "01月04日"], ["10:00", "10:30", "11:00"]],
      selectedDateTime: "",
      index1: [0, 0]
    };
  },
  methods: {
    onClickItem(e) {
      if (this.current !== e.currentIndex) {
        this.current = e.currentIndex;
      }
    },
    bindChange(e) {
      this.index = e.detail.value;
    },
    onMultiChange(e) {
      this.index1 = e.detail.value;
      this.selectedDateTime = `${this.dateRange[0][this.index1[0]]} ${this.dateRange[1][this.index1[1]]}`;
    },
    navigateToTarget() {
      common_vendor.index.navigateTo({
        url: "/pages/index/new_file"
      });
    }
  },
  computed: {
    changdu() {
      return this.diandan.length;
    },
    qiuhe() {
      return this.diandan.reduce((sum, diandan) => sum + diandan.price, 0);
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
  return {
    a: common_vendor.o($options.onClickItem),
    b: common_vendor.p({
      current: $data.current,
      values: $data.items,
      styleType: "button",
      activeColor: "#4cd964"
    }),
    c: $data.current === 0,
    d: common_vendor.t($data.array[$data.index]),
    e: $data.array,
    f: common_vendor.o((...args) => $options.bindChange && $options.bindChange(...args)),
    g: $data.current === 1,
    h: common_vendor.t($data.selectedDateTime),
    i: $data.dateRange,
    j: common_vendor.o((...args) => $options.onMultiChange && $options.onMultiChange(...args)),
    k: $data.current === 2,
    l: common_vendor.t($options.changdu),
    m: common_vendor.f($data.diandan, (item, index, i0) => {
      return {
        a: item.URL,
        b: common_vendor.t(item.name),
        c: common_vendor.t(item.shuliang),
        d: common_vendor.t(item.price),
        e: index
      };
    }),
    n: common_vendor.t($options.qiuhe),
    o: common_vendor.t($options.qiuhe),
    p: common_vendor.o((...args) => $options.navigateToTarget && $options.navigateToTarget(...args))
  };
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-88bf5328"]]);
wx.createPage(MiniProgramPage);
