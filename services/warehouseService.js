var warehouseService = {

	get: {
		//库存模块首页统计信息
		getMobileWarehouse:function(request, response, success, error){
			xunSoft.ajax.get('Report/WarehouseReport/GetMobileWarehouse', request, function(responseData) {
				if(_.isArray(responseData.data) && responseData.data.length > 0) {
					response.mobileWarehouse=responseData.data;
				}
				if(_.isFunction(success)) {
					success(responseData);
				}
			}, function() {
				if(_.isFunction(error)) {
					error();
				}
			});
		},
		// 当月库存流动情况
		getWarehouseStockMove: function(request, response, success, error) {
			xunSoft.ajax.get('Report/WarehouseReport/GetWarehouseStockMove', request, function(responseData) {
				if(_.isArray(responseData.data) && responseData.data.length > 0) {
					response.data = responseData.data;
				}
				if(_.isFunction(success)) {
					success(responseData);
				}
			}, function() {
				if(_.isFunction(error)) {
					error();
				}
			});
		},
		//获取店铺库存列表
		getShopWarehouseList: function(request, response, success, error) {
			xunSoft.ajax.get('Stock/Shop/List', request, function(responseData) {
				//检查数据
				if(_.isArray(responseData.data) && responseData.data.length > 0) {
					//是否存在下一页
					if(request.pageIndex) {
						request.pageIndex++;
					}
					//总数量
					response.total = responseData.total;

					//将数据存入本地
					_.each(responseData.data, function(item) {

						//转换单据信息
						var shopwarehouseOrder = _.pick(item, 'warehouseId', 'color', 'size', 'qty',
							'kind');

						response.data.push(shopwarehouseOrder);
					});
				}
				if(_.isFunction(success)) {
					success(responseData);
				}
			}, function() {
				if(_.isFunction(error)) {
					error();
				}
			})
		},
		//店铺库存详情
		getShopWarehouseDetail: function(request, response, success, error) {
			xunSoft.ajax.get('Stock/Shop/Detail', request, function(responseData) {
				if(_.isObject(responseData.data) && _.isObject(response.data)) {
					response.data = responseData.data;
				}
				if(_.isFunction(success)) {
					success(responseData);
				}
			}, function() {
				if(_.isFunction(error)) {
					error();
				}
			});

		},
		//获取当前店铺货品库存
		getShopWarehouseSum: function(request, response, success, error) {
			xunSoft.ajax.get('Stock/Shop/Sum', request, function(responseData) {
				//检查数据
				if(_.isArray(responseData.data) && responseData.data.length > 0) {
					response.data.push(profitLossOrder);
				}
				if(_.isFunction(success)) {
					success(responseData);
				}
			}, function() {
				if(_.isFunction(error)) {
					error();
				}
			});
		},
		//获取盘点单列表
		getCheckStockOrderList: function(request, response, success, error) {
			xunSoft.ajax.get('Warehouse/CheckStockOrder/List', request, function(responseData) {
				//检查数据
				if(_.isArray(responseData.data) && responseData.data.length > 0 && _.isArray(response.data)) {
					//是否存在下一页
					if(request.pageIndex) {
						request.pageIndex++;
					}
					//总数量
					response.total = responseData.total;

					//将数据存入本地
					_.each(responseData.data, function(item) {

						//转换单据信息
						var checkStockOrder = _.pick(item, 'checkStockOrderId', 'checkStockLevelId', 'detailSummary', 'sponsorId', 
							'sponsorName', 'createTime', 'creatorName', 'creatorId', 'warehouseName', 'warehouseId', 'checkStockDate', 'checkStockOrderNo');

						checkStockOrder.flag = 'L';
						if(item.submitTime) {
							checkStockOrder.flag = 'T';
						}
						if(item.auditTime) {
							checkStockOrder.flag = 'S';
						}

						response.data.push(checkStockOrder);
					});
				}
				if(_.isFunction(success)) {
					success(responseData);
				}
			}, function() {
				if(_.isFunction(error)) {
					error();
				}
			})
		},
		//获取盘点单列表详情
		getCheckStockOrderDetail: function(request, response, success, error) {
			xunSoft.ajax.get('Warehouse/CheckStockOrder/Detail', request, function(responseData) {
				if(_.isObject(responseData.data) && _.isObject(response.data)) {
					response.data = responseData.data;
				}
				if(_.isFunction(success)) {
					success(responseData);
				}
			}, function() {
				if(_.isFunction(error)) {
					error();
				}
			});

		},
		//获取损益单列表
	getProfitLossList: function(request, response, success, error) {
			xunSoft.ajax.get('Warehouse/ProfitLossOrder/List', request, function(responseData) {
				//检查数据
				if(_.isArray(responseData.data) && responseData.data.length > 0  && _.isArray(response.data)) {
					//是否存在下一页
					if(request.pageIndex) {
						request.pageIndex++;
					}
					//总数量
					response.total = responseData.total;

					//将数据存入本地
					_.each(responseData.data, function(item) {

						//转换单据信息
						var profitLossOrder = _.pick(item, 'warehouseId', 'profitLossOrderId', 'warehouseName', 'auditorId', 'creatorId',
							'creatorName', 'createTime', 'profitLossOrderNo',
							'sponsorId', 'detailSummary', 'profitLossDate');

						profitLossOrder.flag = 'L';
						if(item.submitTime) {
							profitLossOrder.flag = 'T';
						}
						if(item.auditTime) {
							profitLossOrder.flag = 'S';
						}

						response.data.push(profitLossOrder);
					});

				}
				if(_.isFunction(success)) {
					success(responseData);
				}
			}, function() {
				if(_.isFunction(error)) {
					error();
				}
			});
		},
		//益损单详情
		getProfitLossOrderDetail: function(request, response, success, error) {
			xunSoft.ajax.get('Warehouse/ProfitLossOrder/Detail', request, function(responseData) {
				if(_.isObject(responseData.data) && _.isObject(response.data)) {
					response.data = responseData.data;
				}
				if(_.isFunction(success)) {
					success(responseData);
				}
			}, function() {
				if(_.isFunction(error)) {
					error();
				}
			});

		},
		//调拨单列表
		getTransferOrderList:function(request, response, success, error){
			xunSoft.ajax.get('Warehouse/TransferOrder/List', request, function(responseData) {
				//检查数据
				if(_.isArray(responseData.data) && responseData.data.length > 0&& _.isArray(response.data)) {
					//是否存在下一页
					if(request.pageIndex) {
						request.pageIndex++;
					}
					//总数量
					response.total = responseData.total;

					//将数据存入本地
					_.each(responseData.data, function(item) {
						//转换单据信息
						response.data.push(item);
					});
				}
				if(_.isFunction(success)) {
					success(responseData);
				}
			}, function() {
				if(_.isFunction(error)) {
					error();
				}
			})
		},
		//调拨单详情
		getShopTransferDetail:function(request, response, success, error){
			xunSoft.ajax.get('Warehouse/TransferOrder/Detail', request, function(responseData) {
				if(_.isObject(responseData.data) && _.isObject(response.data)) {
					response.data = responseData.data;
				}
				if(_.isFunction(success)) {
					success(responseData);
				}
			}, function() {
				if(_.isFunction(error)) {
					error();
				}
			});
		}
	},
	post: {
		//添加益损单
		postProfitLossOrder: function(request, response, success, error) {
			xunSoft.ajax.post('Warehouse/ProfitLossOrder/Add', request, success, error);
		},
		//添加库存盘点单
		postCheckStockOrder: function(request, response, success, error) {
			xunSoft.ajax.post('Warehouse/CheckStockOrder/Add', request, success, error);
		},
		//添加调拨单
		postShopTransfer: function(request, response, success, error) {
			xunSoft.ajax.post('Warehouse/TransferOrder/Add', request, success, error);
		}
	},
	put: {
		//修改益损订单
		putProfitLossOrder: function(request, response, success, error) {
			xunSoft.ajax.put('Warehouse/ProfitLossOrder/Update', request, success, error);
		},
		//修改益损订单状态
		putProfitLossOrderState: function(request, response, success, error) {
			xunSoft.ajax.put('Warehouse/ProfitLossOrder/UpdateState', request, success, error);
		},
		//修改库存订单
		putCheckStockOrder: function(request, response, success, error) {
			xunSoft.ajax.put('Warehouse/CheckStockOrder/Update', request, success, error);
		},
		//修改库存订单状态
		putCheckStockOrderState: function(request, response, success, error) {
			xunSoft.ajax.put('Warehouse/CheckStockOrder/UpdateState', request, success, error);
		},
		//修改调拨单
		putShopTransfer: function(request, response, success, error) {
			xunSoft.ajax.put('Warehouse/TransferOrder/Update', request, success, error);
		},
		//修改调拨单状态
		putShopTransferState: function(request, response, success, error) {
			xunSoft.ajax.put('Warehouse/TransferOrder/UpdateState', request, success, error);
		},


	},
	delete: {
		//删除益损单
		deleteProfitLossOrder: function(request, response, success, error) {
			xunSoft.ajax.delete('Warehouse/ProfitLossOrder/Delete', request, function(responseData) {
				if(_.isObject(responseData.data)) {

				}
				if(_.isFunction(success)) {
					success(responseData);
				}
			}, function() {
				if(_.isFunction(error)) {
					error();
				}
			});
		},
		//删除库存盘点单
		deleteCheckStockOrder: function(request, response, success, error) {
			xunSoft.ajax.delete('Warehouse/CheckStockOrder/Delete', request, function(responseData) {
				if(_.isObject(responseData.data)) {

				}
				if(_.isFunction(success)) {
					success(responseData);
				}
			}, function() {
				if(_.isFunction(error)) {
					error();
				}
			});
		},
		//删除库存调拨单
		deleteShopTransfer: function(request, response, success, error) {
			xunSoft.ajax.delete('Warehouse/TransferOrder/Delete', request, function(responseData) {
				if(_.isObject(responseData.data)) {

				}
				if(_.isFunction(success)) {
					success(responseData);
				}
			}, function() {
				if(_.isFunction(error)) {
					error();
				}
			});
		}
	}
};