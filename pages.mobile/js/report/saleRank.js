//销售排行页面
eShop.onPageInit('report_saleRank_index', function(page) {

    var pageDiv = $$(page.container);

    // Vue视图模型
    var vm = new Vue({
        el: page.container,
        data: {
            request: {
                startTime: xunSoft.helper.formatDate(new Date()),
                endTime: xunSoft.helper.formatDate(new Date())
            },
            response: {
                data: []
            }
        },
        methods: {
            init: function() {
                this.load();
                eShop.calendar({
                    input: pageDiv.find("#startTime"),
                    // minDate: new Date()
                });
                eShop.calendar({
                    input: pageDiv.find("#endTime"),
                    //maxDate: new Date()
                });
            },
            load: function() {
                var request = { query: { TenantId: xunSoft.user.tenantId(), ShopId: xunSoft.user.shopId() } };
                request.query.startTime = vm.request.startTime;
                request.query.endTime = vm.request.endTime;
                console.log("起始时间：" + this.request.startTime + "  结束时间：" + this.request.endTime);
                reportService.get.getSaleRank(request, {}, function(responseData) {
                    vm.response.data = responseData.data;
                });
            },
        }
    })
    vm.init();
})