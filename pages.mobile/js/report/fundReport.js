//付款单列表回调
eShop.onPageInit('report_fundReport_index', function(page) {

    var pageDiv = $$(page.container);

    // Vue视图模型
    var vm = new Vue({
        el: page.container,
        data: {
            request: {
                startTime: xunSoft.helper.formatDate(new Date()),
                endTime: xunSoft.helper.formatDate(new Date()),
            },
            response: {
                name: '本日',
                receiptmoney: 0,
                paymoney: 0,
                moneyData: []
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
            load: function(n) {
                switch (n) {
                    case 0: //日
                        vm.response.name = '本日';
                        break;
                    case 1: //周
                        vm.response.name = '本周';
                        break;
                    case 2: //月
                        vm.response.name = '本月';
                        break;
                    case 3: //季
                        vm.response.name = '本季';
                        break;
                    case 4: //年
                        vm.response.name = '本年';
                        break;
                }
                var request = { query: { TenantId: xunSoft.user.tenantId(), ShopId: xunSoft.user.shopId() } };
                request.query.startTime = vm.request.startTime;
                request.query.endTime = vm.request.endTime;
                reportService.get.getFundReport(request, {}, function(responseData) {
                    _.extend(vm.response, responseData.data[0]);
                    xunSoft.paint.paintPie(pageDiv, '资金账户', "#cloud_fundReport", responseData.data[0].moneyData, true);
                });
                console.log("起始时间：" + this.request.startTime + "  结束时间：" + this.request.endTime);
            },
        }
    });
    vm.init();
})