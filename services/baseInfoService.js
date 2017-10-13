var baseInfoService = {

    //供应商列表
    suppliers: [],

    //客户信息
    customers: [],

    //店铺人员
    users: [],

    //账户信息
    accounts: [],

    //品牌
    brands: [],

    //颜色
    colors: [],

    //尺码组
    sizeGroups: [],

    //尺码
    sizes: [],

    //计量单位
    units: [],

    //单据状态
    orderStates: [],

    //支出类型
    expendType: [],

    //收入类型
    revenueType: [],

    //会员卡类型
    memberCardType: [],

    //零售收款类型
    checkout: [],

    //仓库
    storehouse: [],

    //店铺
    shop: [],

    //行政区划
    district: [],

    _loadSupplier: function() {
        xunSoft.ajax.getAsync('Purchase/Supplier/List', {}, function(responseData) {
            if (_.isArray(responseData.data)) {
                baseInfoService.suppliers = responseData.data;
            }
        });
    },    
    
    _loadCustomer: function() {
        xunSoft.ajax.getAsync('SaleBatch/Customer/List', {}, function(responseData) {
            if (_.isArray(responseData.data)) {
                baseInfoService.customers = responseData.data;
            }
        });
    },

    _loadUser: function() {
        xunSoft.ajax.getAsync('BaseInfo/User', {}, function(responseData) {
            if (_.isArray(responseData.data)) {
                baseInfoService.users = responseData.data;
            }
        });
    },

    _loadAccounts: function() {
        xunSoft.ajax.getAsync('BaseInfo/Account', {}, function(responseData) {
            if (_.isArray(responseData.data)) {
                baseInfoService.accounts = responseData.data;
            }
        });
    },

    _loadBrands: function() {
        //获取品牌
        xunSoft.ajax.getAsync('Kind/Brand/List', {}, function(responseData) {
            if (_.isArray(responseData.data)) {
                baseInfoService.brands = responseData.data;
            }
        });
    },

    _loadColors: function() {
        //获取颜色
        xunSoft.ajax.getAsync('Kind/Color/List', {}, function(responseData) {
            if (_.isArray(responseData.data)) {
                baseInfoService.colors = responseData.data;
            }
        });
    },

    _loadSizeGroup: function() {
        //获取尺码
        xunSoft.ajax.getAsync('Kind/Size/ListGroup', {}, function(responseData) {
            if (_.isArray(responseData.data)) {
                baseInfoService.sizeGroups = responseData.data;
            }
        });
    },

    _loadSizes: function() {
        //获取尺码
        xunSoft.ajax.getAsync('Kind/Size/List', {}, function(responseData) {
            if (_.isArray(responseData.data)) {
                baseInfoService.sizes = responseData.data;
            }
        });
    },

    _loadUnit: function() {
        //获取尺码
        xunSoft.ajax.getAsync('Kind/Unit/List', {}, function(responseData) {
            if (_.isArray(responseData.data)) {
                baseInfoService.units = responseData.data;
            }
        });
    },

    _loadOrderState: function() {
        baseInfoService.orderStates.push({ id: 'save', name: '未提交' });
        baseInfoService.orderStates.push({ id: 'submit', name: '已提交' });
        baseInfoService.orderStates.push({ id: 'audit', name: '已审核/已过账' });
    },

    //支出类型
    _loadExpendType: function() {
        //获取支出类型
        xunSoft.ajax.getAsync('Finance/ExpendType/List', {}, function(responseData) {
            if (_.isArray(responseData.data)) {
                baseInfoService.expendType = responseData.data;
            }
        });
    },

    //收入类型
    _loadRevenueType: function() {
        //获取收入类型
        xunSoft.ajax.getAsync('Finance/RevenueType/List', {}, function(responseData) {
            if (_.isArray(responseData.data)) {
                baseInfoService.revenueType = responseData.data;
            }
        });
    },

    //获取会员卡类型
    _loadMemberCardType: function() {
        //获取会员卡类型
        xunSoft.ajax.getAsync('BaseInfo/MemberCardType', {}, function(responseData) {
            if (_.isArray(responseData.data)) {
                baseInfoService.memberCardType = responseData.data;
            }
        });
    },

    //获取零售收款类型
    _loadCheckout: function() {
        //获取会员卡类型
        xunSoft.ajax.getAsync('BaseInfo/Checkout', {}, function(responseData) {
            if (_.isArray(responseData.data)) {
                baseInfoService.checkout = responseData.data;
            }
        });
    },

    //获取仓库
    _loadStorehouse: function() {
        //获取仓库
        xunSoft.ajax.getAsync('BaseInfo/Storehouse', {}, function(responseData) {
            if (_.isArray(responseData.data)) {
                baseInfoService.storehouse = responseData.data;
            }
        });
    },

    //获取店铺
    _loadShop: function() {
        //获取店铺
        xunSoft.ajax.getAsync('BaseInfo/Shop', {}, function(responseData) {
            if (_.isArray(responseData.data)) {
                baseInfoService.shop = responseData.data;

            }
        });
    },

    //获取行政区划
    _loadDistrict: function() {
        //获取行政区划
        xunSoft.ajax.getAsync('BaseInfo/District', {}, function(responseData) {
            if (_.isArray(responseData.data)) {
                baseInfoService.district = responseData.data;

            }
        });
    },
    //初始化
    init: function() {
        this._loadSupplier();
        this._loadCustomer();
        this._loadUser();
        this._loadAccounts();
        this._loadBrands();
        this._loadColors();
        this._loadSizeGroup();
        this._loadSizes();
        this._loadUnit();
        this._loadOrderState();
        this._loadExpendType();
        this._loadRevenueType();
        this._loadMemberCardType();
        this._loadCheckout();
        this._loadStorehouse();
        this._loadShop();
        this._loadDistrict();
    }
};