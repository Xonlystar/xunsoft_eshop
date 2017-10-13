//进货--统计分析
eShop.onPageInit('_warehouse_report_index', function(page) {
	var pageDiv = $$(page.container);

	var vm = new Vue({
		el: page.container,
		data: {
			request: {
				query: {
					tenantId: xunSoft.user.tenantId(),
					shopId: xunSoft.user.shopId(),
				}
			}
		},
		methods: {
			init: function() {
				reportService.get.getWarehouseByKindClassId(vm.request, {}, function(responseData) {
					vm.dealReportResult(responseData, 'kindClassName', "库存汇总", "#getWarehouseByKindClassId");
				});
				reportService.get.getWarehouseByBrand(vm.request, {}, function(responseData) {
					vm.dealReportResult(responseData, 'brandName', "库存汇总", "#getWarehouseByBrand");
				});
			},
			dealReportResult: function(responseData, xIndex, tip, id) {
				if(_.isArray(responseData.data)) {
					if(responseData.data.length > 0 && responseData.data.length <= 5) {
						var data = [];
						_.each(responseData.data, function(item) {
							data.push({ name: item[xIndex], value: item['totalCount'], count: item['payMoney'] });
						});
						xunSoft.paint.paintPie(pageDiv, tip, id, data,true);
						return;
					}
					if(responseData.data.length > 5 && responseData.data.length <= 10) {
						var dataX = _.map(responseData.data, function(item) { return item[xIndex] });
						var dataY_count = _.map(responseData.data, function(item) { return item['totalCount'] });
						var dataY_money = _.map(responseData.data, function(item) { return item['payMoney'] });
						xunSoft.paint.paintBar(pageDiv, tip, id, dataX, dataY_count, dataY_money,true);
						return;
					}
					if(responseData.data.length > 10) {
						var dataX = _.map(responseData.data, function(item) { return item[xIndex] });
						var dataY_count = _.map(responseData.data, function(item) { return item['totalCount'] });
						var dataY_money = _.map(responseData.data, function(item) { return item['payMoney'] });
						xunSoft.paint.paintLine(pageDiv, tip, id, dataX, dataY_count, dataY_money,true);
						return;
					}
				} else {
					xunSoft.helper.showMessage("服务器返回数据不是数组");
				}
			},
			select: function(url) {
				if(url) {
					mainView.router.load({
						url: url
					});
				}
			}
		}
	});
	vm.init();

});