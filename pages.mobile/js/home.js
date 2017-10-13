//页面初始化
eShop.onPageInit('data-home', function(page) {
    var pageDiv = $$(page.container);
    var vm = new Vue({
        el: page.container,
        data: {
            curr: 0,
            mySwiper: {},
            request: {
                startTime: xunSoft.helper.formatDate(new Date()),
                endTime: xunSoft.helper.formatDate(new Date())
            },
            response: {
                mobilePurchase: {},
                mobileSaleBatch: {},
                mobileWarehouse: {},
                report: {
                    Arrears_money: 0,
                    gross: 0,
                    name: '本日',
                    receipt_money: 0,
                    return_money: 0,
                    sale_count: 0,
                    sale_money: 0,
                },
            },
        },
        methods: {
            init: function() {
                vm.initEvent();
                vm.load(0);
                vm.paint();
            },
            jump: function(url) {
                eShop.params.swipePanelOnlyClose = true;
                xunSoft.event.callback = vm.load;
                mainView.router.load({
                    url: url,
                    query: {
                        callback: vm.load
                    }
                });
            },
            initEvent: function() {
                $$('#salBatch').on('show', function() { //销售
                    vm.load(0);
                });
                $$('#purchase').on('show', function() { //进货
                    vm.load(1);
                });
                $$('#warehouse').on('show', function() { //店铺
                    vm.load(2);
                });
                $$('#cloudReport').on('show', function() { //报表
                    vm.load(3);
                });
            },
            load: function(n) {
                this.curr = n == undefined ? this.curr : n;
                if (vm.mySwiper.slideTo) { vm.mySwiper.slideTo(0); }
                var request = { query: { TenantId: xunSoft.user.tenantId(), ShopId: xunSoft.user.shopId() } };
                switch (this.curr) {
                    case 0: //销售
                        saleService.get.getMobileSaleBatch(request, vm.response);
                        break;
                    case 1: //进货
                        purchaseService.get.getMobilePurchase(request, vm.response);
                        break;
                    case 2: //店铺
                        warehouseService.get.getMobileWarehouse(request, vm.response);
                        break;
                    case 3: //报表
                        // console.log("起始时间：" + this.request.startTime + "  结束时间：" + this.request.endTime);
                        request.query.startTime = vm.request.startTime;
                        request.query.endTime = vm.request.endTime;
                        reportService.get.getCloudReport(request, {}, function(responseData) {
                            _.each(responseData.data, function(value, key) {
                                vm.response.report[value.name] = value.value;
                            });
                        });
                        break;
                }
            },
            paint: function() {
                this.$nextTick(function() {
                    var val = setInterval(function() {
                        if ($$("#homeReport .swiper-wrapper .swiper-slide").length == vm.response.mobileSaleBatch.length) {
                            vm.mySwiper = eShop.swiper('#homeReport .swiper-self', {
                                pagination: '#homeReport .swiper-pagination',
                                spaceBetween: 50,
                                nextButton: '#homeReport .swiper-button-next',
                                prevButton: '#homeReport .swiper-button-prev',
                            });
                            clearInterval(val);
                        }
                    }, 500);
                })
            },
            loadReport: function(n, e) { //tab切换事件
                var e = e || window.event;
                var dom = $$(e.target);
                dom.addClass("active");
                dom.siblings().removeClass("active");
                switch (n) {
                    case 0: //日
                        vm.response.report.name = "本日";
                        vm.request.startTime = xunSoft.helper.formatDate(new Date());
                        vm.request.endTime = xunSoft.helper.formatDate(new Date())
                        break;
                    case 1: //周
                        vm.response.report.name = "本周";
                        vm.request.startTime = xunSoft.helper.getFormatDate(0).startTime;
                        vm.request.endTime = xunSoft.helper.getFormatDate(0).endTime;
                        break;
                    case 2: //月
                        vm.response.report.name = "本月";
                        vm.request.startTime = xunSoft.helper.getFormatDate(1).startTime;
                        vm.request.endTime = xunSoft.helper.getFormatDate(1).endTime;
                        break;
                    case 3: //季
                        vm.response.report.name = "本季";
                        vm.request.startTime = xunSoft.helper.getFormatDate(2).startTime;
                        vm.request.endTime = xunSoft.helper.getFormatDate(2).endTime;
                        break;
                    case 4: //年
                        vm.response.report.name = "本年";
                        vm.request.startTime = xunSoft.helper.getFormatDate(3).startTime;
                        vm.request.endTime = xunSoft.helper.getFormatDate(3).endTime;
                        break;
                }
                this.load(3);
            }
        }
    });
    vm.init();
});