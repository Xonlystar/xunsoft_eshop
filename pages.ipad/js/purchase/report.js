//进货--统计分析
eShop.onPageInit('report_index', function(page) {
	var pageDiv = $$(page.container);

	var vm = new Vue({
		el: page.container,
		data: {
			request: {
				query: {
					tenantId: xunSoft.user.tenantId(),
					shopId: xunSoft.user.shopId(),
					startTime: "",
					endTime: "",
				}
			}
		},
		methods: {
			init: function() {
				vm.load(1);
			},
			getSefDate:function(){
				console.log("获取自定义数据",vm.request.query);
			},
			load: function(n) {
				var dom=pageDiv.find(`.tab-link:nth-child(${n+1})`);
					dom.addClass("active");
					dom.siblings().removeClass("active");

				if(n!=3){
				_.extend(vm.request.query, xunSoft.helper.getFormatDate(n));	
				}
				
				//vm.request.query.startTime=xunSoft.helper.formatDate(new Date().setYear(2016));

				reportService.get.getPurchaseDefaultReport(vm.request, {}, function(responseData) {
					var temp = [];
					_.each(responseData.data, function(item) {
						temp[item.name] = item.value;
					});
					var t = '';
					switch(n) {
						case 0:
							{
								t = "本周";
								break;
							}
						case 1:
							{
								t = "本月";
								break;
							}
						case 2:
							{
								t = "本季";
								break;
							}
					}

					var data = [
						{ "name": t+"订单", "value": temp['purchaseMoney'], "count": temp['purchaseCount'] },
						{
							"name": t+"收货",
							"value": temp['receiveMoney'],
							"count": temp['receiveCount']
						},
						{
							"name": t+"退货",
							"value": temp['returnMoney'],
							"count": temp['returnCount']
						},
						{ "name": t+"付款金额", "value": temp['payMoney'] },
					];
					xunSoft.paint.paintPie(pageDiv, "采购汇总", "#purchase_report", data);
				});
				reportService.get.getPurchaseReceiveOrderByKind(vm.request, {}, function(responseData) {
					vm.dealReportResult(responseData, 'kindName', "入库汇总", "#purchase_receiveOrderByKind");
				});
				reportService.get.getPurchaseReceiveOrderBySupplier(vm.request, {}, function(responseData) {
					vm.dealReportResult(responseData, 'supplierName', "入库汇总", "#purchase_receiveOrderBySupplier");
				});
				reportService.get.getPurchaseReturnOrderByKind(vm.request, {}, function(responseData) {
					vm.dealReportResult(responseData, 'kindName', "退货汇总", "#purchase_returnOrderByKind");
				});
				reportService.get.getPurchaseReturnOrderBySupplier(vm.request, {}, function(responseData) {
					vm.dealReportResult(responseData, 'supplierName', "退货汇总", "#purchase_returnOrderBySupplier");
				});
				reportService.get.getPurchasePayMoneyBySupplier(vm.request, {}, function(responseData) {
					vm.dealReportResult(responseData, 'supplierName', "付款汇总", "#purchase_payMoneyBySupplier");
				});
				reportService.get.getPurchasePayMoneyByCostType(vm.request, {}, function(responseData) {
					vm.dealReportResult(responseData, 'expendItemName', "付款汇总", "#purchase_payMoneyByCostType");
				});
			},
			dealReportResult: function(responseData, xIndex, tip, id) {
				if(_.isArray(responseData.data)) {
					if(responseData.data.length > 0 && responseData.data.length <= 5) {
						var data = [];
						_.each(responseData.data, function(item) {
							data.push({ name: item[xIndex], value: item['payMoney'], count: item['totalCount'] });
						});
						xunSoft.paint.paintPie(pageDiv, tip, id, data);
						return;
					}
					if(responseData.data.length > 5 && responseData.data.length <= 10) {
						var dataX = _.map(responseData.data, function(item) { return item[xIndex] });
						var dataY = _.map(responseData.data, function(item) { return item['payMoney'] });
						var tooltip = _.map(responseData.data, function(item) { return item['totalCount'] });
						xunSoft.paint.paintBar(pageDiv, tip, id, dataX, dataY, tooltip);
						return;
					}
					if(responseData.data.length > 10) {
						var dataX = _.map(responseData.data, function(item) { return item[xIndex] });
						var dataY = _.map(responseData.data, function(item) { return item['payMoney'] });
						var tooltip = _.map(responseData.data, function(item) { return item['totalCount'] });
						xunSoft.paint.paintLine(pageDiv, tip, id, dataX, dataY, tooltip);
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