//单据状态
Vue.component('order-flag', {
	props: ['flag'],
	template: ' <img v-if="flag==\'L\'" src="../img/flag1.png" style="width:64px;height:64px" /> ' +
		' <img v-if="flag==\'T\'" src="../img/flag2.png" style="width:64px;height:64px" /> ' +
		' <img v-if="flag==\'S\'" src="../img/flag3.png" style="width:64px;height:64px" /> '
});


//加载更多数据
Vue.component('load-more', {
	props: ['total', 'data'],
	template: '<div class="text-center" style="padding-bottom:8px"><a v-show="total>0" v-on:click="loadMore" href="#">加载更多....</a></div>',
	methods: {
		loadMore: function() {

			if (_.isArray(this.data)) {
				if (this.data.length == this.total) {
					xunSoft.helper.showMessage('已经没有更多数据可以加载了....');
				} else {
					this.$dispatch('load');
				}
			} else {
				this.$dispatch('load');
			}
		}
	}
});


//货品图片
Vue.component('kind-img', {
	props: ['kindId', 'colorId'],
	template: '<img class="img-kind" src="../img/kind.gif" v-on:load="load" />',
	watch: {
		'kindId': function(val, oldVal) {
			var img = $$(this.$el);
			if (img.attr('src').indexOf('img/kind.gif') > 0) {
				var colorid = this.colorId ? this.colorId : 0;
				if (this.kindId) {
					img.attr('src', xunSoft.ajax.serviceBase() + "Kind/Kind/Picture/" + this.kindId + "/" + xunSoft.user.tenantId() + "/" + colorid);
				}
			}
		}
	},
	methods: {
		load: function(event) {
			if ($$(event.currentTarget).attr('src').indexOf('img/kind.gif') > 0) {
				var colorid = this.colorId ? this.colorId : 0;
				if (this.kindId) {
					$$(event.currentTarget).attr('src', xunSoft.ajax.serviceBase() + "Kind/Kind/Picture/" + this.kindId + "/" + xunSoft.user.tenantId() + "/" + colorid);
				}
			}
		}
	}
});

//货品信息
Vue.component('kind-info', {
	props: ['kind'],
	template: '<div class="item-media">' +
		'<kind-img :kind-id="kind.kindId"></kind-img>' +
		'</div>' +
		'<div class="item-inner">' +
		'<div class="item-title-row">' +
		'<div class="item-title">{{kind.kindName}}</div>' +
		'<div class="item-after">{{kind.priceList | kindPrice "sale-price" | currency}}/{{kind.unitName}}</div>' +
		'</div>' +
		'<div class="item-text"> ' +
		'<div class="row"> ' +
		'<div class="col-33"><div>品牌:{{kind.brandName}}</div></div>' +
		'<div class="col-33"><div>货号:{{kind.kindNo}}</div></div>' +
		'<div class="col-33"><div>分类:{{kind.kindClassName}}</div></div>' +
		'</div>' +
		'<div class="row"> ' +
		'<div class="col-33"><div>尺码组:{{kind.sizeGroupName}}</div></div> ' +
		'<div class="col-33"><div>重量:{{kind.weight}}Kg</div></div> ' +
		'<div class="col-33"><div>季节:{{kind.seasonName}}</div></div>' +
		'</div>' +
		'</div>' +
		'</div>',
});


//尺码选择器
Vue.component('select-size', {
	props: ['data', 'source', 'max', 'sizeGroupId', 'kindId'],
	template: '<div>' +
		'<div v-on:click="select($event,item)" data-id="{{item.sizeId}}" v-for="item in source" class="chip">' +
		'<div class="chip-media"><i style="color:#fff" class="fa fa-pencil"></i></div>' +
		'<div class="chip-label">{{item.sizeText }}</div>' +
		'</div>' +
		'<div v-on:click="add" class="chip">' +
		'<div class="chip-media bg-white"><i class="fa fa-plus"></i></div>' +
		'<div class="chip-label">新尺码</div>' +
		'</div>' +
		'</div>',
	watch: {
		'data': function(val, oldVal) {
			var chapWrapDiv = $$(this.$el);
			//最大数量
			var maxItem = parseInt(this.max) || 1;
			if (maxItem > 1 && _.isArray(val) && val.length == 0) {
				chapWrapDiv.find('.chip.bg-green').removeClass('bg-green');
			}
			if (maxItem > 1 && _.isArray(val) && val.length > 0) {
				_.each(val, function(item) {
					if (!chapWrapDiv.find('.chip[data-id="' + item + '"]').hasClass('bg-green')) {
						chapWrapDiv.find('.chip[data-id="' + item + '"]').addClass('bg-green');
					}
				});
			}
			if (maxItem == 1) {
				if (!chapWrapDiv.find('.chip[data-id="' + this.data + '"]').hasClass('bg-green')) {
					chapWrapDiv.find('.chip[data-id="' + this.data + '"]').addClass('bg-green');
				}
			}
		}
	},
	methods: {
		select: function(event, size) {
			//Div 元素
			var chipDiv = $$(event.currentTarget);
			//最大数量
			var maxItem = parseInt(this.max) || 1;

			//检查选中的状态
			if (chipDiv.hasClass('bg-green')) {
				chipDiv.removeClass('bg-green');

				if (maxItem == 1) {
					this.data = 0;
				} else {
					this.data.$remove(size.sizeId);
				}
			} else {

				if (maxItem == 1) {
					chipDiv.parent().find('.chip.bg-green').removeClass('bg-green');
					this.data = size.sizeId;
				} else {
					this.data.push(size.sizeId);
				}

				chipDiv.addClass('bg-green');
			}
		},
		add: function() {
			if (this.sizeGroupId > 0 || this.kindId > 0) {

				var component = this;

				eShop.prompt('新尺码名称', '新尺码', function(result) {
					if (!_.isEmpty(result)) {
						var request = {
							data: {
								sizeGroupId: component.sizeGroupId,
								sizeText: result
							}
						};
						var kindId = parseInt(component.kindId) || 0;
						if (kindId == 0) {
							//保存尺码
							kindService.post.postSize(request, {}, function(responseData) {
								baseInfoService.sizes.push(responseData.data);
								component.source.push(responseData.data);
							});
						} else {
							request.data.kindId = kindId;
							//保存货品尺码
							kindService.post.postKindSize(request, {}, function(responseData) {
								component.source.push(responseData.data);
							});
						}
					}
				});
			}
		}
	}
});

//颜色选择器
Vue.component('select-color', {
	props: ['data', 'source', 'max', 'kindId'],
	template: '<div>' +
		'<div v-on:click="select($event,item)" data-id="{{item.colorId}}" v-for="item in source" class="chip">' +
		'<div class="chip-media"><i style="color:#fff" class="fa fa-paint-brush"></i></div>' +
		'<div class="chip-label">{{item.colorName }}</div>' +
		'</div>' +
		'<div v-on:click="add" class="chip">' +
		'<div class="chip-media bg-white"><i class="fa fa-plus"></i></div>' +
		'<div class="chip-label">新颜色</div>' +
		'</div>' +
		'</div>',
	watch: {
		'data': function(val, oldVal) {
			var chapWrapDiv = $$(this.$el);
			//最大数量
			var maxItem = parseInt(this.max) || 1;
			if (maxItem > 1 && _.isArray(val) && val.length == 0) {
				chapWrapDiv.find('.chip.bg-green').removeClass('bg-green');
			}
			if (maxItem > 1 && _.isArray(val) && val.length > 0) {
				_.each(val, function(item) {
					if (!chapWrapDiv.find('.chip[data-id="' + item + '"]').hasClass('bg-green')) {
						chapWrapDiv.find('.chip[data-id="' + item + '"]').addClass('bg-green');
					}
				});
			}
			if (maxItem == 1) {
				if (!chapWrapDiv.find('.chip[data-id="' + this.data + '"]').hasClass('bg-green')) {
					chapWrapDiv.find('.chip[data-id="' + this.data + '"]').addClass('bg-green');
				}
			}

		}
	},
	methods: {
		select: function(event, color) {
			//Div 元素
			var chipDiv = $$(event.currentTarget);
			//最大数量
			var maxItem = parseInt(this.max) || 1;

			//检查选中的状态
			if (chipDiv.hasClass('bg-green')) {
				chipDiv.removeClass('bg-green');

				if (maxItem == 1) {
					this.data = 0;
				} else {
					this.data.$remove(color.colorId);
				}
			} else {

				if (maxItem == 1) {
					chipDiv.parent().find('.chip.bg-green').removeClass('bg-green');
					this.data = color.colorId;
				} else {
					this.data.push(color.colorId);
				}

				chipDiv.addClass('bg-green');
			}
		},
		add: function() {

			var component = this;

			var kindid = parseInt(this.kindId) || 0;

			eShop.prompt('新颜色名称', '新颜色', function(result) {
				if (!_.isEmpty(result)) {
					var request = {
						data: {
							colorName: result
						}
					};

					if (kindid == 0) {
						//保存颜色
						kindService.post.postColor(request, {}, function(responseData) {
							baseInfoService.colors.push(responseData.data);
						});
					} else {

						request.data.kindId = kindid;
						//保存货品颜色
						kindService.post.postKindColor(request, {}, function(responseData) {
							component.source.push(responseData.data);
						});
					}
				}
			});
		}
	}

});

//品牌选择器
Vue.component('select-brand', {
	props: ['data', 'source', 'max'],
	template: '<div>' +
		'<div v-on:click="select($event,item)" data-id="{{item.brandId}}" v-for="item in source" class="chip item">' +
		'<div class="chip-media"><i style="color:#fff" class="fa fa-apple"></i></div>' +
		'<div class="chip-label">{{item.brandName }}</div>' +
		'</div>' +
		'<div v-on:click="add" class="chip">' +
		'<div class="chip-media bg-white"><i class="fa fa-plus"></i></div>' +
		'<div class="chip-label">新品牌</div>' +
		'</div>' +
		'<div v-on:click="switch($event)" data-type="expend" class="chip">' +
		'<div class="chip-media bg-white"><i class="fa fa-exchange"></i></div>' +
		'<div class="chip-label switch-label">确认</div>' +
		'</div>' +
		'</div>',
	watch: {
		'data': function(val, oldVal) {
			var chapWrapDiv = $$(this.$el);
			//最大数量
			var maxItem = parseInt(this.max) || 1;
			if (maxItem > 1 && _.isArray(val) && val.length == 0) {
				chapWrapDiv.find('.chip.bg-green').removeClass('bg-green');
			}
			if (maxItem > 1 && _.isArray(val) && val.length > 0) {
				_.each(val, function(item) {
					if (!chapWrapDiv.find('.chip[data-id="' + item + '"]').hasClass('bg-green')) {
						chapWrapDiv.find('.chip[data-id="' + item + '"]').addClass('bg-green');
					}
				});
			}
			if (maxItem == 1) {
				if (!chapWrapDiv.find('.chip[data-id="' + this.data + '"]').hasClass('bg-green')) {
					chapWrapDiv.find('.chip[data-id="' + this.data + '"]').addClass('bg-green');
				}
			}
		}
	},
	methods: {
		select: function(event, brand) {
			//Div 元素
			var chipDiv = $$(event.currentTarget);
			//最大数量
			var maxItem = parseInt(this.max) || 1;

			//检查选中的状态
			if (chipDiv.hasClass('bg-green')) {
				chipDiv.removeClass('bg-green');

				if (maxItem == 1) {
					this.data = 0;
				} else {
					this.data.$remove(brand.brandId);
				}
			} else {

				if (maxItem == 1) {
					chipDiv.parent().find('.chip.bg-green').removeClass('bg-green');
					this.data = brand.brandId;
				} else {
					this.data.push(brand.brandId);
				}

				chipDiv.addClass('bg-green');
			}

		},
		add: function() {
			eShop.prompt('新品牌名称', '新品牌', function(result) {
				if (!_.isEmpty(result)) {
					var request = {
						data: {
							brandName: result
						}
					};
					kindService.post.postBrand(request, {}, function(responseData) {
						baseInfoService.brands.push(responseData.data);
					});
				}
			});
		},
		//切换显示
		switch: function(event) {
			//Div 元素
			var chipDiv = $$(event.currentTarget);
			var dataType = chipDiv.attr('data-type');
			if (dataType == "expend") {
				chipDiv.attr('data-type', 'shrink')

				chipDiv.parent().find('.chip.item:not(.bg-green)').css('display', 'none');
				chipDiv.find('.switch-label').text('更多');
			} else {
				chipDiv.attr('data-type', 'expend');

				chipDiv.parent().find('.chip.item:not(.bg-green)').css('display', 'inline-flex');
				chipDiv.find('.switch-label').text('确认');
			}
		}
	}
});

//货品分类选择器
Vue.component('select-kind-class', {
	props: ['data', 'source', 'max', 'brandId'],
	template: '<div>' +
		'<div v-on:click="select($event,item)" data-id="{{item.kindClassId}}" v-for="item in source" class="chip">' +
		'<div class="chip-media bg-green">C</div>' +
		'<div class="chip-label">{{item.kindClassName }}</div>' +
		'</div>' +
		'<div v-on:click="add" class="chip">' +
		'<div class="chip-media bg-white"><i class="fa fa-plus"></i></div>' +
		'<div class="chip-label">新分类</div>' +
		'</div>' +
		'</div>',
	watch: {
		'data': function(val, oldVal) {
			var chapWrapDiv = $$(this.$el);
			//最大数量
			var maxItem = parseInt(this.max) || 1;
			if (maxItem > 1 && _.isArray(val) && val.length == 0) {
				chapWrapDiv.find('.chip.bg-green').removeClass('bg-green');
			}
			if (maxItem > 1 && _.isArray(val) && val.length > 0) {
				_.each(val, function(item) {
					if (!chapWrapDiv.find('.chip[data-id="' + item + '"]').hasClass('bg-green')) {
						chapWrapDiv.find('.chip[data-id="' + item + '"]').addClass('bg-green');
					}
				});
			}
			if (maxItem == 1) {
				if (!chapWrapDiv.find('.chip[data-id="' + this.data + '"]').hasClass('bg-green')) {
					chapWrapDiv.find('.chip[data-id="' + this.data + '"]').addClass('bg-green');
				}
			}
		}
	},
	methods: {
		select: function(event, kindClass) {
			//Div 元素
			var chipDiv = $$(event.currentTarget);
			//最大数量
			var maxItem = parseInt(this.max) || 1;

			//检查选中的状态
			if (chipDiv.hasClass('bg-green')) {
				chipDiv.removeClass('bg-green');

				if (maxItem == 1) {
					this.data = 0;
				} else {
					this.data.$remove(kindClass.kindClassId);
				}
			} else {

				if (maxItem == 1) {
					chipDiv.parent().find('.chip.bg-green').removeClass('bg-green');
					this.data = kindClass.kindClassId;
				} else {
					this.data.push(kindClass.kindClassId);
				}

				chipDiv.addClass('bg-green');
			}

		},
		add: function() {
			if (this.brandId) {
				var component = this;
				eShop.prompt('新货品名称', '新分类', function(result) {
					if (!_.isEmpty(result)) {
						var request = {
							data: {
								brandId: component.brandId,
								kindClassName: result
							}
						};
						kindService.post.postKindClass(request, {}, function(responseData) {
							component.source.push(responseData.data);
						});
					}
				});
			}
		}
	}
});

//货品计量单位选择器
Vue.component('select-unit', {
	props: ['data', 'source', 'max'],
	template: '<div>' +
		'<div v-on:click="select($event,item)" data-id="{{item.unitId}}" v-for="item in source" class="chip">' +
		'<div class="chip-media"><i style="color:#fff" class="fa fa-tint"></i></div>' +
		'<div class="chip-label">{{item.unitName }}</div>' +
		'</div>' +
		'<div v-on:click="add" class="chip">' +
		'<div class="chip-media bg-white"><i class="fa fa-plus"></i></div>' +
		'<div class="chip-label">新单位</div>' +
		'</div>' +
		'</div>',
	watch: {
		'data': function(val, oldVal) {
			var chapWrapDiv = $$(this.$el);
			//最大数量
			var maxItem = parseInt(this.max) || 1;
			if (maxItem > 1 && _.isArray(val) && val.length == 0) {
				chapWrapDiv.find('.chip.bg-green').removeClass('bg-green');
			}
			if (maxItem > 1 && _.isArray(val) && val.length > 0) {
				_.each(val, function(item) {
					if (!chapWrapDiv.find('.chip[data-id="' + item + '"]').hasClass('bg-green')) {
						chapWrapDiv.find('.chip[data-id="' + item + '"]').addClass('bg-green');
					}
				});
			}
			if (maxItem == 1) {
				if (!chapWrapDiv.find('.chip[data-id="' + this.data + '"]').hasClass('bg-green')) {
					chapWrapDiv.find('.chip[data-id="' + this.data + '"]').addClass('bg-green');
				}
			}
		}
	},
	methods: {
		select: function(event, unit) {
			//Div 元素
			var chipDiv = $$(event.currentTarget);
			//最大数量
			var maxItem = parseInt(this.max) || 1;

			//检查选中的状态
			if (chipDiv.hasClass('bg-green')) {
				chipDiv.removeClass('bg-green');

				if (maxItem == 1) {
					this.data = 0;
				} else {
					this.data.$remove(unit.unitId);
				}
			} else {

				if (maxItem == 1) {
					chipDiv.parent().find('.chip.bg-green').removeClass('bg-green');
					this.data = unit.unitId;
				} else {
					this.data.push(unit.unitId);
				}

				chipDiv.addClass('bg-green');
			}

		},
		add: function() {
			eShop.prompt('新货品计量单位', '新单位', function(result) {
				if (!_.isEmpty(result)) {
					var request = {
						data: {
							unitName: result
						}
					};
					kindService.post.postUnit(request, {}, function(responseData) {
						baseInfoService.units.push(responseData.data);
					});
				}
			});
		}
	}

});

//货品尺码组选择器
Vue.component('select-size-group', {
	props: ['data', 'source', 'max'],
	template: '<div>' +
		'<div v-on:click="select($event,item)" data-id="{{item.sizeGroupId}}" v-for="item in source" class="chip">' +
		'<div class="chip-media"><i style="color:#fff" class="fa fa-window-restore"></i></div>' +
		'<div class="chip-label">{{item.sizeGroupName }}</div>' +
		'</div>' +
		'<div v-on:click="add" class="chip">' +
		'<div class="chip-media bg-white"><i class="fa fa-plus"></i></div>' +
		'<div class="chip-label">新尺码组</div>' +
		'</div>' +
		'</div>',
	watch: {
		'data': function(val, oldVal) {
			var chapWrapDiv = $$(this.$el);
			//最大数量
			var maxItem = parseInt(this.max) || 1;
			if (maxItem > 1 && _.isArray(val) && val.length == 0) {
				chapWrapDiv.find('.chip.bg-green').removeClass('bg-green');
			}
			if (maxItem > 1 && _.isArray(val) && val.length > 0) {
				_.each(val, function(item) {
					if (!chapWrapDiv.find('.chip[data-id="' + item + '"]').hasClass('bg-green')) {
						chapWrapDiv.find('.chip[data-id="' + item + '"]').addClass('bg-green');
					}
				});
			}
			if (maxItem == 1) {
				if (!chapWrapDiv.find('.chip[data-id="' + this.data + '"]').hasClass('bg-green')) {
					chapWrapDiv.find('.chip[data-id="' + this.data + '"]').addClass('bg-green');
				}
			}
		}
	},
	methods: {
		select: function(event, sizeGroup) {
			//Div 元素
			var chipDiv = $$(event.currentTarget);
			//最大数量
			var maxItem = parseInt(this.max) || 1;

			//检查选中的状态
			if (chipDiv.hasClass('bg-green')) {
				chipDiv.removeClass('bg-green');

				if (maxItem == 1) {
					this.data = 0;
				} else {
					this.data.$remove(sizeGroup.sizeGroupId);
				}
			} else {

				if (maxItem == 1) {
					chipDiv.parent().find('.chip.bg-green').removeClass('bg-green');
					this.data = sizeGroup.sizeGroupId;
				} else {
					this.data.push(sizeGroup.sizeGroupId);
				}

				chipDiv.addClass('bg-green');
			}

		},
		add: function() {
			eShop.prompt('新货品尺码组', '新尺码组', function(result) {
				if (!_.isEmpty(result)) {
					var request = {
						data: {
							sizeGroupName: result
						}
					};
					kindService.post.postSizeGroup(request, {}, function(responseData) {
						baseInfoService.sizeGroups.push(responseData.data);
					});
				}
			});
		}
	}
});

//供应商选择器
Vue.component('select-supplier', {
	props: ['data', 'source', 'max','editStatus'],
	template: '<div>' +
		'<div v-if='+'editStatus==="true"'+' v-on:click="select($event,item)" data-id="{{item.companyId}}" v-for="item in source" class="chip item">' +
		'<div class="chip-media"><i style="color:#fff" class="fa fa-qq"></i></div>' +
		'<div class="chip-label">{{item.companyName }}</div>' +
		'</div>' +
		'<div v-if='+'editStatus==="false"'+' v-on:click="select($event,item)" data-id="{{item.companyId}}" v-for="item in source" class="chip item">' +
		'<div class="chip-media"><i style="color:#fff" class="fa fa-qq"></i></div>' +
		'<div class="chip-label">{{item.companyName }}</div>' +
		'</div>' +
		'<div v-on:click="add" class="chip">' +
		'<div class="chip-media bg-white"><i class="fa fa-plus"></i></div>' +
		'<div class="chip-label">新供应商</div>' +
		'</div>' +
		'<div v-on:click="switch($event)" data-type="expend" class="chip">' +
		'<div class="chip-media bg-white"><i class="fa fa-exchange"></i></div>' +
		'<div class="chip-label switch-label">确认</div>' +
		'</div>' +
		'</div>',
	watch: {
		'data': function(val, oldVal) {
			var chapWrapDiv = $$(this.$el);
			if(this.editStatus==='false'){
				if (!chapWrapDiv.find('.chip[data-id="' + this.data + '"]').hasClass('bg-green')) {
					chapWrapDiv.find('.chip[data-id="' + this.data + '"]').addClass('bg-green');
				}
				return ;
			}

			//最大数量
			var maxItem = parseInt(this.max) || 1;
			if (maxItem > 1 && _.isArray(val) && val.length == 0) {
				chapWrapDiv.find('.chip.bg-green').removeClass('bg-green');
			}
			if (maxItem > 1 && _.isArray(val) && val.length > 0) {
				_.each(val, function(item) {
					if (!chapWrapDiv.find('.chip[data-id="' + item + '"]').hasClass('bg-green')) {
						chapWrapDiv.find('.chip[data-id="' + item + '"]').addClass('bg-green');
					}
				});
			}
			if (maxItem == 1) {
				if (this.data != '') {
					if (!chapWrapDiv.find('.chip[data-id="' + this.data + '"]').hasClass('bg-green')) {
						chapWrapDiv.find('.chip[data-id="' + this.data + '"]').addClass('bg-green');
					}
				} else {
					chapWrapDiv.find('.chip.bg-green').removeClass('bg-green');
				}
			}
		}
	},
	methods: {
		select: function(event, supplier) {
			if(this.editStatus==='false'){
				xunSoft.helper.showMessage("供应商不可修改");
				return;
			}

			//Div 元素
			var chipDiv = $$(event.currentTarget);
			//最大数量
			var maxItem = parseInt(this.max) || 1;

			//检查选中的状态
			if (chipDiv.hasClass('bg-green')) {
				chipDiv.removeClass('bg-green');

				if (maxItem == 1) {
					this.data = 0;
				} else {
					this.data.$remove(supplier.companyId);
				}
			} else {

				if (maxItem == 1) {
					chipDiv.parent().find('.chip.bg-green').removeClass('bg-green');
					this.data = supplier.companyId;
				} else {
					this.data.push(supplier.companyId);
				}

				chipDiv.addClass('bg-green');
			}

		},
		add: function() {
			eShop.prompt('新供应商名称', '新供应商', function(result) {
				if (!_.isEmpty(result)) {
					var request = {
						data: {
							companyName: result
						}
					};
					purchaseService.post.postSupplier(request, {}, function(responseData) {
						baseInfoService.suppliers.push(responseData.data);
					});
				}
			});
		},
		//切换显示
		switch: function(event) {
			//Div 元素
			var chipDiv = $$(event.currentTarget);
			var dataType = chipDiv.attr('data-type');
			if (dataType == "expend") {
				chipDiv.attr('data-type', 'shrink')

				chipDiv.parent().find('.chip.item:not(.bg-green)').css('display', 'none');
				chipDiv.find('.switch-label').text('更多');
			} else {
				chipDiv.attr('data-type', 'expend');

				chipDiv.parent().find('.chip.item:not(.bg-green)').css('display', 'inline-flex');
				chipDiv.find('.switch-label').text('确认');
			}
		}
	}
});

//客户选择器
Vue.component('select-customer', {
	props: ['data', 'source', 'max','editStatus'],
	template: '<div>' +
		'<div v-if='+'editStatus==="true"'+' v-on:click="select($event,item)" data-id="{{item.companyId}}" v-for="item in source" class="chip item">' +
		'<div class="chip-media"><i style="color:#fff" class="fa fa-qq"></i></div>' +
		'<div class="chip-label">{{item.companyName }}</div>' +
		'</div>' +
		'<div v-if='+'editStatus==="false"'+' v-on:click="select($event,item)" data-id="{{item.companyId}}" v-for="item in source" class="chip item">' +
		'<div class="chip-media"><i style="color:#fff" class="fa fa-qq"></i></div>' +
		'<div class="chip-label">{{item.companyName }}</div>' +
		'</div>' +
		'<div v-on:click="add" class="chip">' +
		'<div class="chip-media bg-white"><i class="fa fa-plus"></i></div>' +
		'<div class="chip-label">新客户</div>' +
		'</div>' +
		'<div v-on:click="switch($event)" data-type="expend" class="chip">' +
		'<div class="chip-media bg-white"><i class="fa fa-exchange"></i></div>' +
		'<div class="chip-label switch-label">确认</div>' +
		'</div>' +
		'</div>',
	watch: {
		'data': function(val, oldVal) {

			var chapWrapDiv = $$(this.$el);
			if(this.editStatus==='false'){
				if (!chapWrapDiv.find('.chip[data-id="' + this.data + '"]').hasClass('bg-green')) {
					chapWrapDiv.find('.chip[data-id="' + this.data + '"]').addClass('bg-green');
				}
				return ;
			}

			//最大数量
			var maxItem = parseInt(this.max) || 1;
			if (maxItem > 1 && _.isArray(val) && val.length == 0) {
				chapWrapDiv.find('.chip.bg-green').removeClass('bg-green');
			}
			if (maxItem > 1 && _.isArray(val) && val.length > 0) {
				_.each(val, function(item) {
					if (!chapWrapDiv.find('.chip[data-id="' + item + '"]').hasClass('bg-green')) {
						chapWrapDiv.find('.chip[data-id="' + item + '"]').addClass('bg-green');
					}
				});
			}
			if (maxItem == 1) {
				if (this.data != '') {
					if (!chapWrapDiv.find('.chip[data-id="' + this.data + '"]').hasClass('bg-green')) {
						chapWrapDiv.find('.chip[data-id="' + this.data + '"]').addClass('bg-green');
					}
				} else {
					chapWrapDiv.find('.chip.bg-green').removeClass('bg-green');
				}
			}
		}
	},
	methods: {
		select: function(event, supplier) {
			if(this.editStatus==='false'){
				xunSoft.helper.showMessage("客户不可修改");
				return;
			}
			//Div 元素
			var chipDiv = $$(event.currentTarget);
			//最大数量
			var maxItem = parseInt(this.max) || 1;

			//检查选中的状态
			if (chipDiv.hasClass('bg-green')) {
				chipDiv.removeClass('bg-green');

				if (maxItem == 1) {
					this.data = 0;
				} else {
					this.data.$remove(supplier.companyId);
				}
			} else {

				if (maxItem == 1) {
					chipDiv.parent().find('.chip.bg-green').removeClass('bg-green');
					this.data = supplier.companyId;
				} else {
					this.data.push(supplier.companyId);
				}

				chipDiv.addClass('bg-green');
			}

		},
		add: function() {
			eShop.prompt('新客户名称', '新客户', function(result) {
				if (!_.isEmpty(result)) {
					var request = {
						data: {
							companyName: result
						}
					};
					saleService.post.postCustomer(request, {}, function(responseData) {
						baseInfoService.customers.push(responseData.data);
					});
				}
			});
		},
		//切换显示
		switch: function(event) {
			//Div 元素
			var chipDiv = $$(event.currentTarget);
			var dataType = chipDiv.attr('data-type');
			if (dataType == "expend") {
				chipDiv.attr('data-type', 'shrink')

				chipDiv.parent().find('.chip.item:not(.bg-green)').css('display', 'none');
				chipDiv.find('.switch-label').text('更多');
			} else {
				chipDiv.attr('data-type', 'expend');

				chipDiv.parent().find('.chip.item:not(.bg-green)').css('display', 'inline-flex');
				chipDiv.find('.switch-label').text('确认');
			}
		}
	}
});

//用户选择器
Vue.component('select-user', {
	props: ['data', 'source', 'max'],
	template: '<div>' +
		'<div v-on:click="select($event,item)" data-id="{{item.userId}}" v-for="item in source" class="chip item">' +
		'<div class="chip-media"><i style="color:#fff" class="fa fa-user"></i></div>' +
		'<div class="chip-label">{{item.employeeName }}</div>' +
		'</div>' +
		'<div v-on:click="switch($event)" data-type="expend" class="chip">' +
		'<div class="chip-media bg-white"><i class="fa fa-exchange"></i></div>' +
		'<div class="chip-label switch-label">确认</div>' +
		'</div>' +
		'</div>',
	watch: {
		'data': function(val, oldVal) {
			var chapWrapDiv = $$(this.$el);
			//最大数量
			var maxItem = parseInt(this.max) || 1;
			//是否有值
			if (maxItem > 1 && _.isArray(val) && val.length == 0) {
				chapWrapDiv.find('.chip.bg-green').removeClass('bg-green');
			}
			if (maxItem > 1 && _.isArray(val) && val.length > 0) {
				_.each(val, function(item) {
					if (!chapWrapDiv.find('.chip[data-id="' + item + '"]').hasClass('bg-green')) {
						chapWrapDiv.find('.chip[data-id="' + item + '"]').addClass('bg-green');
					}
				});
			}
			if (maxItem == 1) {
				if (this.data != '') {
					if (!chapWrapDiv.find('.chip[data-id="' + this.data + '"]').hasClass('bg-green')) {
						chapWrapDiv.find('.chip[data-id="' + this.data + '"]').addClass('bg-green');
					}
				} else {
					chapWrapDiv.find('.chip.bg-green').removeClass('bg-green');
				}
			}
		}
	},
	methods: {
		select: function(event, user) {
			//Div 元素
			var chipDiv = $$(event.currentTarget);
			//最大数量
			var maxItem = parseInt(this.max) || 1;

			//检查选中的状态
			if (chipDiv.hasClass('bg-green')) {
				chipDiv.removeClass('bg-green');

				if (maxItem == 1) {
					this.data = 0;
				} else {
					this.data.$remove(user.userId);
				}
			} else {

				if (maxItem == 1) {
					chipDiv.parent().find('.chip.bg-green').removeClass('bg-green');
					this.data = user.userId;
				} else {
					this.data.push(user.userId);
				}

				chipDiv.addClass('bg-green');
			}
		},
		//切换显示
		switch: function(event) {
			//Div 元素
			var chipDiv = $$(event.currentTarget);
			var dataType = chipDiv.attr('data-type');
			if (dataType == "expend") {
				chipDiv.attr('data-type', 'shrink')

				chipDiv.parent().find('.chip.item:not(.bg-green)').css('display', 'none');
				chipDiv.find('.switch-label').text('更多');
			} else {
				chipDiv.attr('data-type', 'expend');

				chipDiv.parent().find('.chip.item:not(.bg-green)').css('display', 'inline-flex');
				chipDiv.find('.switch-label').text('确认');
			}
		}
	}
});

//账户选择器
Vue.component('select-account', {
	props: ['data', 'source', 'max'],
	template: '<div>' +
		'<div v-on:click="select($event,item)" data-id="{{item.accountId}}" v-for="item in source" class="chip item">' +
		'<div class="chip-media"><i style="color:#fff" class="fa fa-address-book-o"></i></div>' +
		'<div class="chip-label">{{item.accountName}}</div>' +
		'</div>' +
		'<div v-on:click="switch($event)" data-type="expend" class="chip">' +
		'<div class="chip-media bg-white"><i class="fa fa-exchange"></i></div>' +
		'<div class="chip-label switch-label">确认</div>' +
		'</div>' +
		'</div>',
	watch: {
		'data': function(val, oldVal) {
			var chapWrapDiv = $$(this.$el);
			//最大数量
			var maxItem = parseInt(this.max) || 1;
			if (maxItem > 1 && _.isArray(val) && val.length == 0) {
				chapWrapDiv.find('.chip.bg-green').removeClass('bg-green');
			}
			if (maxItem > 1 && _.isArray(val) && val.length > 0) {
				_.each(val, function(item) {
					if (!chapWrapDiv.find('.chip[data-id="' + item + '"]').hasClass('bg-green')) {
						chapWrapDiv.find('.chip[data-id="' + item + '"]').addClass('bg-green');
					}
				});
			}
			if (maxItem == 1) {
				if (this.data != '') {
					if (!chapWrapDiv.find('.chip[data-id="' + this.data + '"]').hasClass('bg-green')) {
						chapWrapDiv.find('.chip[data-id="' + this.data + '"]').addClass('bg-green');
					}
				} else {
					chapWrapDiv.find('.chip.bg-green').removeClass('bg-green');
				}
			}
		}
	},
	methods: {
		select: function(event, account) {
			//Div 元素
			var chipDiv = $$(event.currentTarget);
			//最大数量
			var maxItem = parseInt(this.max) || 1;

			//检查选中的状态
			if (chipDiv.hasClass('bg-green')) {
				chipDiv.removeClass('bg-green');

				if (maxItem == 1) {
					this.data = 0;
				} else {
					this.data.$remove(account.accountId);
				}
			} else {
				if (maxItem == 1) {
					chipDiv.parent().find('.chip.bg-green').removeClass('bg-green');
					this.data = account.accountId;
				} else {
					this.data.push(account.accountId);
				}
				chipDiv.addClass('bg-green');
			}
		},
		//切换显示
		switch: function(event) {
			//Div 元素
			var chipDiv = $$(event.currentTarget);
			var dataType = chipDiv.attr('data-type');
			if (dataType == "expend") {
				chipDiv.attr('data-type', 'shrink')

				chipDiv.parent().find('.chip.item:not(.bg-green)').css('display', 'none');
				chipDiv.find('.switch-label').text('更多');
			} else {
				chipDiv.attr('data-type', 'expend');

				chipDiv.parent().find('.chip.item:not(.bg-green)').css('display', 'inline-flex');
				chipDiv.find('.switch-label').text('确认');
			}
		}
	}
});

//单据状态
Vue.component('select-order-state', {
	props: ['data', 'source', 'max'],
	template: '<div>' +
		'<div v-on:click="select($event,item)" data-id="{{item.id}}" v-for="item in source" class="chip">' +
		'<div class="chip-media"><i style="color:#fff" class="fa fa-cloud"></i></div>' +
		'<div class="chip-label">{{item.name}}</div>' +
		'</div>' +
		'</div>',
	watch: {
		'data': function(val, oldVal) {
			var chapWrapDiv = $$(this.$el);
			//最大数量
			var maxItem = parseInt(this.max) || 1;
			if (maxItem > 1 && _.isArray(val) && val.length == 0) {
				chapWrapDiv.find('.chip.bg-green').removeClass('bg-green');
			}
			if (maxItem > 1 && _.isArray(val) && val.length > 0) {
				_.each(val, function(item) {
					if (!chapWrapDiv.find('.chip[data-id="' + item + '"]').hasClass('bg-green')) {
						chapWrapDiv.find('.chip[data-id="' + item + '"]').addClass('bg-green');
					}
				});
			}
			if (maxItem == 1) {
				if (this.data != '') {
					if (!chapWrapDiv.find('.chip[data-id="' + this.data + '"]').hasClass('bg-green')) {
						chapWrapDiv.find('.chip[data-id="' + this.data + '"]').addClass('bg-green');
					}
				} else {
					chapWrapDiv.find('.chip.bg-green').removeClass('bg-green');
				}
			}
		}
	},
	methods: {
		select: function(event, state) {
			//Div 元素
			var chipDiv = $$(event.currentTarget);
			//最大数量
			var maxItem = parseInt(this.max) || 1;

			//检查选中的状态
			if (chipDiv.hasClass('bg-green')) {
				chipDiv.removeClass('bg-green');

				if (maxItem == 1) {
					this.data = 0;
				} else {
					this.data.$remove(state.id);
				}
			} else {

				if (maxItem == 1) {
					chipDiv.parent().find('.chip.bg-green').removeClass('bg-green');
					this.data = state.id;
				} else {
					this.data.push(state.id);
				}

				chipDiv.addClass('bg-green');
			}
		},
	}
});

// 选择票据类型
Vue.component('select-source-type', {
	props: ['data', 'source', 'max'],
	template: '<div>' +
		'<div v-on:click="select($event,item)" data-id="{{item.sourceTypeId}}" v-for="item in source" class="chip">' +
		'<div class="chip-media"><i style="color:#fff" class="fa fa-cloud"></i></div>' +
		'<div class="chip-label">{{item.sourceTypeName}}</div>' +
		'</div>' +
		'</div>',
	watch: {
		'data': function(val, oldVal) {
			var chapWrapDiv = $$(this.$el);

			//最大数量
			var maxItem = parseInt(this.max) || 1;
			if (maxItem > 1 && _.isArray(val) && val.length == 0) {
				chapWrapDiv.find('.chip.bg-green').removeClass('bg-green');
			}
			if (maxItem > 1 && _.isArray(val) && val.length > 0) {
				_.each(val, function(item) {
					if (!chapWrapDiv.find('.chip[data-id="' + item + '"]').hasClass('bg-green')) {
						chapWrapDiv.find('.chip[data-id="' + item + '"]').addClass('bg-green');
					}
				});
			}
			if (maxItem == 1) {
				if (this.data != '') {
					if (!chapWrapDiv.find('.chip[data-id="' + this.data + '"]').hasClass('bg-green')) {
						chapWrapDiv.find('.chip[data-id="' + this.data + '"]').addClass('bg-green');
					}
				} else {
					chapWrapDiv.find('.chip.bg-green').removeClass('bg-green');
				}
			}
		}
	},
	methods: {
		select: function(event, sourceType) {
			var chipDiv = $$(event.currentTarget);
			var maxItem = parseInt(this.max) || 1;

			//检查选中的状态
			if (chipDiv.hasClass('bg-green')) {
				chipDiv.removeClass('bg-green');

				if (maxItem == 1) {
					this.data = 0;
				} else {
					this.data.$remove(sourceType.sourceTypeId);
				}
			} else {
				if (maxItem == 1) {
					chipDiv.parent().find('.chip.bg-green').removeClass('bg-green');
					this.data = sourceType.sourceTypeId;
				} else {
					this.data.push(sourceType.sourceTypeId);
				}

				chipDiv.addClass('bg-green');
			}
		}
	}
});

//支出类型
Vue.component('select-expend', {
	props: ['data', 'source', 'max'],
	template: '<div>' +
		'<div v-on:click="select($event,item)" data-id="{{item.expendItemId}}" v-for="item in source" class="chip item">' +
		'<div class="chip-media"><i style="color:#fff" class="fa fa-expand"></i></div>' +
		'<div class="chip-label">{{item.expendItemName}}</div>' +
		'</div>' +
		'<div v-on:click="add" class="chip">' +
		'<div class="chip-media bg-white"><i class="fa fa-plus"></i></div>' +
		'<div class="chip-label">新支出</div>' +
		'</div>' +
		'<div v-on:click="switch($event)" data-type="expend" class="chip">' +
		'<div class="chip-media bg-white"><i class="fa fa-exchange"></i></div>' +
		'<div class="chip-label switch-label">确认</div>' +
		'</div>' +
		'</div>',
	watch: {
		'data': function(val, oldVal) {
			var chapWrapDiv = $$(this.$el);
			//最大数量
			var maxItem = parseInt(this.max) || 1;
			if (maxItem > 1 && _.isArray(val) && val.length == 0) {
				chapWrapDiv.find('.chip.bg-green').removeClass('bg-green');
			}
			if (maxItem > 1 && _.isArray(val) && val.length > 0) {
				_.each(val, function(item) {
					if (!chapWrapDiv.find('.chip[data-id="' + item + '"]').hasClass('bg-green')) {
						chapWrapDiv.find('.chip[data-id="' + item + '"]').addClass('bg-green');
					}
				});
			}
			if (maxItem == 1) {
				if (this.data != '') {
					if (!chapWrapDiv.find('.chip[data-id="' + this.data + '"]').hasClass('bg-green')) {
						chapWrapDiv.find('.chip[data-id="' + this.data + '"]').addClass('bg-green');
					}
				} else {
					chapWrapDiv.find('.chip.bg-green').removeClass('bg-green');
				}
			}
		}
	},
	methods: {
		select: function(event, expend) {
			//Div 元素
			var chipDiv = $$(event.currentTarget);
			//最大数量
			var maxItem = parseInt(this.max) || 1;

			//检查选中的状态
			if (chipDiv.hasClass('bg-green')) {
				chipDiv.removeClass('bg-green');

				if (maxItem == 1) {
					this.data = 0;
				} else {
					this.data.$remove(expend.expendItemId);
				}
			} else {

				if (maxItem == 1) {
					chipDiv.parent().find('.chip.bg-green').removeClass('bg-green');
					this.data = expend.expendItemId;
				} else {
					this.data.push(expend.expendItemId);
				}

				chipDiv.addClass('bg-green');
			}
		},
		add: function() {
			var component = this;
			eShop.prompt('新的支出类型名称', '新支出', function(result) {
				if (!_.isEmpty(result)) {
					var request = {
						data: {
							expendItemName: result
						}
					};
					financeService.post.addExpendType(request, {}, function(responseData) {
						component.source.push(responseData.data);
						baseInfoService.expendType.push(responseData.data);
					});
				}
			});
		},
		//切换显示
		switch: function(event) {
			//Div 元素
			var chipDiv = $$(event.currentTarget);
			var dataType = chipDiv.attr('data-type');
			if (dataType == "expend") {
				chipDiv.attr('data-type', 'shrink')

				chipDiv.parent().find('.chip.item:not(.bg-green)').css('display', 'none');
				chipDiv.find('.switch-label').text('更多');
			} else {
				chipDiv.attr('data-type', 'expend');

				chipDiv.parent().find('.chip.item:not(.bg-green)').css('display', 'inline-flex');
				chipDiv.find('.switch-label').text('确认');
			}
		}
	}
});


//收入类型
Vue.component('select-revenue', {
	props: ['data', 'source', 'max'],
	template: '<div>' +
		'<div v-on:click="select($event,item)" data-id="{{item.revenueItemId}}" v-for="item in source" class="chip item">' +
		'<div class="chip-media"><i style="color:#fff" class="fa fa-compress"></i></div>' +
		'<div class="chip-label">{{item.revenueItemName}}</div>' +
		'</div>' +
		'<div v-on:click="add" class="chip">' +
		'<div class="chip-media bg-white"><i class="fa fa-plus"></i></div>' +
		'<div class="chip-label">新收入</div>' +
		'</div>' +
		'<div v-on:click="switch($event)" data-type="expend" class="chip">' +
		'<div class="chip-media bg-white"><i class="fa fa-exchange"></i></div>' +
		'<div class="chip-label switch-label">确认</div>' +
		'</div>' +
		'</div>',
	watch: {
		'data': function(val, oldVal) {
			var chapWrapDiv = $$(this.$el);
			//最大数量
			var maxItem = parseInt(this.max) || 1;
			if (maxItem > 1 && _.isArray(val) && val.length == 0) {
				chapWrapDiv.find('.chip.bg-green').removeClass('bg-green');
			}
			if (maxItem > 1 && _.isArray(val) && val.length > 0) {
				_.each(val, function(item) {
					if (!chapWrapDiv.find('.chip[data-id="' + item + '"]').hasClass('bg-green')) {
						chapWrapDiv.find('.chip[data-id="' + item + '"]').addClass('bg-green');
					}
				});
			}
			if (maxItem == 1) {
				if (this.data != '') {
					if (!chapWrapDiv.find('.chip[data-id="' + this.data + '"]').hasClass('bg-green')) {
						chapWrapDiv.find('.chip[data-id="' + this.data + '"]').addClass('bg-green');
					}
				} else {
					chapWrapDiv.find('.chip.bg-green').removeClass('bg-green');
				}
			}
		}
	},
	methods: {
		select: function(event, expend) {
			//Div 元素
			var chipDiv = $$(event.currentTarget);
			//最大数量
			var maxItem = parseInt(this.max) || 1;

			//检查选中的状态
			if (chipDiv.hasClass('bg-green')) {
				chipDiv.removeClass('bg-green');

				if (maxItem == 1) {
					this.data = 0;
				} else {
					this.data.$remove(expend.revenueItemId);
				}
			} else {

				if (maxItem == 1) {
					chipDiv.parent().find('.chip.bg-green').removeClass('bg-green');
					this.data = expend.revenueItemId;
				} else {
					this.data.push(expend.revenueItemId);
				}

				chipDiv.addClass('bg-green');
			}
		},
		add: function() {
			var component = this;
			eShop.prompt('新的收入类型名称', '新收入', function(result) {
				if (!_.isEmpty(result)) {
					var request = {
						data: {
							revenueItemName: result
						}
					};
					financeService.post.addRevenueType(request, {}, function(responseData) {
						component.source.push(responseData.data);
						baseInfoService.revenueType.push(responseData.data);
					});
				}
			});
		},
		//切换显示
		switch: function(event) {
			//Div 元素
			var chipDiv = $$(event.currentTarget);
			var dataType = chipDiv.attr('data-type');
			if (dataType == "expend") {
				chipDiv.attr('data-type', 'shrink')

				chipDiv.parent().find('.chip.item:not(.bg-green)').css('display', 'none');
				chipDiv.find('.switch-label').text('更多');
			} else {
				chipDiv.attr('data-type', 'expend');

				chipDiv.parent().find('.chip.item:not(.bg-green)').css('display', 'inline-flex');
				chipDiv.find('.switch-label').text('确认');
			}
		}
	}
});

//选择货品
Vue.component('select-order-kind', {
	props: ['data', 'edit'],
	template: '<div v-on:click="select">' +
		'<div class="text-center">' +
		'<i class="fa fa-shopping-cart fa-3x"></i>' +
		'</div>' +
		'<div class="text-center">选择货品</div>' +
		'</div>',
	methods: {
		select: function() {
			mainView.router.load({
				url: 'kind/selectKind.ios.html',
				query: {
					detailList: this.data,
					editPage: this.edit
				}
			});
		}
	}
});

//金额排序
Vue.component('sort-money', {
	props: ['data', 'prop'],
	template: '<div v-on:click="sort($event)">' +
		'<div class="text-center">' +
		'<i class="fa fa-jpy fa-3x"></i>' +
		'</div>' +
		'<div class="text-center">金额排序</div>' +
		'</div>',
	methods: {
		sort: function(event) {
			var component = this;
			if (_.isArray(component.data) && component.data.length > 1) {
				var order = $$(event.currentTarget).attr('data-order');
				//检查排序方式
				if (order == "asc") {
					//asc 从小到大
					component.data = _.sortBy(component.data,
						function(item) {
							return item[component.prop] || 0;
						});
					$$(event.currentTarget).attr('data-order', "desc");
				} else {
					//desc 从大到小
					var orderBy = _.sortBy(component.data, function(item) {
						return item[component.prop] || 0;
					});
					component.data = orderBy.reverse();
					$$(event.currentTarget).attr('data-order', "asc");
				}
			}
			this.$dispatch('sort');
		}
	}
});


//数量排序
Vue.component('sort-amount', {
	props: ['data', 'prop'],
	template: '<div v-on:click="sort($event)">' +
		'<div class="text-center">' +
		'<i class="fa fa-shopping-basket fa-3x"></i>' +
		'</div>' +
		'<div class="text-center">数量排序</div>' +
		'</div>',
	methods: {
		sort: function(event) {
			var component = this;
			if (_.isArray(component.data) && component.data.length > 1) {
				var order = $$(event.currentTarget).attr('data-order');
				//检查排序方式
				if (order == "asc") {
					//asc 从小到大
					component.data = _.sortBy(component.data,
						function(item) {
							return item[component.prop] || 0;
						});
					$$(event.currentTarget).attr('data-order', "desc");
				} else {
					//desc 从大到小
					var orderBy = _.sortBy(component.data, function(item) {
						return item[component.prop] || 0;
					});
					component.data = orderBy.reverse();
					$$(event.currentTarget).attr('data-order', "asc");
				}
			}
			this.$dispatch('sort');
		}
	}
});


Vue.component('edit-kind', {
	props: ['data', 'kind', 'edit'],
	template: '<div>' +
		'<div v-on:click="update" class="text-center">' +
		'<i class="fa fa-edit fa-2x"></i>' +
		'</div>' +
		'</div>',
	methods: {
		update: function() {
			if (_.isArray(this.data)) {
				if (this.edit) {
					mainView.router.load({
						url: this.edit,
						query: {
							kind: this.kind
						}
					});
				}
			}
			this.$dispatch('update');
		}
	}
});

//货品删除
Vue.component('delete-kind', {
	props: ['data', 'kind'],
	template: '<div>' +
		'<div v-on:click="delete" class="text-center">' +
		'<i class="fa fa-trash fa-2x"></i>' +
		'</div>' +
		'</div>',
	methods: {
		delete: function() {
			var component=this;
			eShop.confirm("确定删除么?",function(){
				if (_.isArray(component.data)) {
					component.data.$remove(component.kind);
				}
				component.$dispatch('delete');
			});
	 	}
	}
});

//选择性别
Vue.component('select-sex', {
	props: ['data'],
	template: '<div>' +
		'<div v-on:click="select($event)" data-id="1" class="chip item">' +
		'<div class="chip-media"><i style="color:#fff" class="fa fa-user"></i></div>' +
		'<div class="chip-label">男</div>' +
		'</div>' +
		'<div v-on:click="select($event)" data-id="0" class="chip item">' +
		'<div class="chip-media"><i style="color:#fff" class="fa fa-user"></i></div>' +
		'<div class="chip-label">女</div>' +
		'</div>' +
		'<div v-on:click="select($event)" data-id="2" class="chip item">' +
		'<div class="chip-media"><i style="color:#fff" class="fa fa-user"></i></div>' +
		'<div class="chip-label">其他</div>' +
		'</div>' +
		'<div v-on:click="switch($event)" data-type="expend" class="chip">' +
		'<div class="chip-media bg-white"><i class="fa fa-exchange"></i></div>' +
		'<div class="chip-label switch-label">确认</div>' +
		'</div>' +
		'</div>',
	watch: {
		'data': function(val, oldVal) {
			var chapWrapDiv = $$(this.$el);
			if (this.data != '') {
				if (!chapWrapDiv.find('.chip[data-id="' + this.data + '"]').hasClass('bg-green')) {
					chapWrapDiv.find('.chip[data-id="' + this.data + '"]').addClass('bg-green');
				}
			} else {
				chapWrapDiv.find('.chip.bg-green').removeClass('bg-green');
			}
		}
	},
	methods: {
		select: function(event) {
			//Div 元素
			var chipDiv = $$(event.currentTarget);

			//检查选中的状态
			if (chipDiv.hasClass('bg-green')) {
				chipDiv.removeClass('bg-green');
				this.data = -1;
			} else {
				chipDiv.parent().find('.chip.bg-green').removeClass('bg-green');
				this.data = chipDiv.data("id");
				chipDiv.addClass('bg-green');
			}
		},
		//切换显示
		switch: function(event) {
			//Div 元素
			var chipDiv = $$(event.currentTarget);
			var dataType = chipDiv.attr('data-type');
			if (dataType == "expend") {
				chipDiv.attr('data-type', 'shrink')
				chipDiv.parent().find('.chip.item:not(.bg-green)').css('display', 'none');
				chipDiv.find('.switch-label').text('更多');
			} else {
				chipDiv.attr('data-type', 'expend');
				chipDiv.parent().find('.chip.item:not(.bg-green)').css('display', 'inline-flex');
				chipDiv.find('.switch-label').text('确认');
			}
		}
	}
});

//选择会员卡类型
Vue.component('select-membercardtype', {
	props: ['data', 'source', 'max'],
	template: '<div>' +
		'<div v-on:click="select($event,item)" data-id="{{item.memberCardTypeId}}" v-for="item in source" class="chip item">' +
		'<div class="chip-media"><i style="color:#fff" class="fa fa-qq"></i></div>' +
		'<div class="chip-label">{{item.memberCardTypeName }}</div>' +
		'</div>' +
		'<div v-on:click="switch($event)" data-type="expend" class="chip">' +
		'<div class="chip-media bg-white"><i class="fa fa-exchange"></i></div>' +
		'<div class="chip-label switch-label">确认</div>' +
		'</div>' +
		'</div>',
	watch: {
		'data': function(val, oldVal) {

			var chapWrapDiv = $$(this.$el);

			//最大数量
			var maxItem = parseInt(this.max) || 1;
			if (maxItem > 1 && _.isArray(val) && val.length == 0) {
				chapWrapDiv.find('.chip.bg-green').removeClass('bg-green');
			}
			if (maxItem > 1 && _.isArray(val) && val.length > 0) {
				_.each(val, function(item) {
					if (!chapWrapDiv.find('.chip[data-id="' + item + '"]').hasClass('bg-green')) {
						chapWrapDiv.find('.chip[data-id="' + item + '"]').addClass('bg-green');
					}
				});
			}
			if (maxItem == 1) {
				if (this.data != '') {
					if (!chapWrapDiv.find('.chip[data-id="' + this.data + '"]').hasClass('bg-green')) {
						chapWrapDiv.find('.chip[data-id="' + this.data + '"]').addClass('bg-green');
					}
				} else {
					chapWrapDiv.find('.chip.bg-green').removeClass('bg-green');
				}
			}
		}
	},
	methods: {
		select: function(event, supplier) {
			//Div 元素
			var chipDiv = $$(event.currentTarget);
			//最大数量
			var maxItem = parseInt(this.max) || 1;

			//检查选中的状态
			if (chipDiv.hasClass('bg-green')) {
				chipDiv.removeClass('bg-green');

				if (maxItem == 1) {
					this.data = 0;
				} else {
					this.data.$remove(supplier.memberCardTypeId);
				}
			} else {

				if (maxItem == 1) {
					chipDiv.parent().find('.chip.bg-green').removeClass('bg-green');
					this.data = supplier.memberCardTypeId;
				} else {
					this.data.push(supplier.memberCardTypeId);
				}

				chipDiv.addClass('bg-green');
			}

		},
		//切换显示
		switch: function(event) {
			//Div 元素
			var chipDiv = $$(event.currentTarget);
			var dataType = chipDiv.attr('data-type');
			if (dataType == "expend") {
				chipDiv.attr('data-type', 'shrink')

				chipDiv.parent().find('.chip.item:not(.bg-green)').css('display', 'none');
				chipDiv.find('.switch-label').text('更多');
			} else {
				chipDiv.attr('data-type', 'expend');

				chipDiv.parent().find('.chip.item:not(.bg-green)').css('display', 'inline-flex');
				chipDiv.find('.switch-label').text('确认');
			}
		}
	}
});

//扫描条码组件
Vue.component('select-barcode',{
	props:['data','order','edit'],
	template:'<div>'+
				'<div v-on:click="scan" class="text-center">'+
					'<i class="fa fa-barcode fa-3x"></i>'+
				'</div>'+
				'<div class="text-center">扫描条码</div>'+
			'</div>',
	methods:{
		scan:function(){
			var component=this;
			xunSoft.device.barcode.scan(function(barcode){
				//var barcode="A001000185";
				//console.log('扫描到条码：'+barcode);

				var request={
					barCode:barcode
				};
				//通过条码获取数据
				kindService.get.getKindByBar(request,null,function(responseData){
					var kindInfo=kindService.utility.parseKind(responseData.data);
					
					//采购订单
					if(component.order=="11"){
						kindInfo.purchasePrice=0;
						kindInfo.purchaseAmount=0;
						kindInfo.purchaseMoney=0;
						kindInfo.discountRate=100;
						kindInfo.taxRate=0;
						kindInfo.taxMoney=0;
						kindInfo.deliverDate='',
						kindInfo.description='';
					}
					//采购收获
					if(component.order=="12"){
						kindInfo.receivePrice=0;
						kindInfo.receiveAmount=0;
						kindInfo.receiveMoney=0;
						kindInfo.discountRate=100;
						kindInfo.taxRate=0;
						kindInfo.taxMoney=0;
						kindInfo.description='';
					}
					//采购退货
					if(component.order=="13"){
						kindInfo.returnPrice=0;
						kindInfo.returnAmount=0;
						kindInfo.returnMoney=0;
						kindInfo.discountRate=100;
						kindInfo.taxRate=0;
						kindInfo.taxMoney=0;
						kindInfo.deliverDate='';
						kindInfo.description='';
					}
					//销售订单
					if(component.order=="21"){
						kindInfo.wholesalePrice=0;
						kindInfo.saleAmount=0;
						kindInfo.saleMoney=0;
						kindInfo.discountRate=100;
						kindInfo.deliverDate='';
						kindInfo.description="";
					}
					//销售出库
					if(component.order=="22"){
						kindInfo.deliverAmount=0;
						kindInfo.wholesalePrice=0;
						kindInfo.discountRate=100;
						kindInfo.deliverMoney=0;
					}
					//客户退货
					if(component.order=="23"){
						kindInfo.returnAmount=0;
						kindInfo.wholesalePrice=0;
						kindInfo.discountRate=100;
						kindInfo.returnMoney=0;
						kindInfo.description='';
					}
					//零售
					if(component.order=="24"){
						kindInfo.retailPrice=0;
						kindInfo.saleAmount=0;
						kindInfo.discountRate=100;
						kindInfo.saleMoney=0;
						kindInfo.gratisAmount=0;
						kindInfo.giftsNum=0;
						kindInfo.actualMoney=0;
						kindInfo.performanceMoney=0;
						kindInfo.cashMoney=0;
						kindInfo.cashTicket=0;
						kindInfo.score=0;
						kindInfo.inventory=0;
						kindInfo.description='';
					}

					//损益单
					if(component.order=="31"){
						kindInfo.profitLossAmount=0;
						kindInfo.profitLossMoney=0;
						kindInfo.retailPrice=0;
						kindInfo.inventory=0;
					}
					//库存盘点单
					if(component.order=="32"){
						kindInfo.checkAmount=0;
						kindInfo.profitLossAmount=0;
						kindInfo.retailPrice=0;
						kindInfo.accountAmount=0;
						kindInfo.inventory=0;
					}

					if(_.isArray(component.data)){
						//是否存在
						var exsitKind = _.find(component.data,function(item){ return item.barNo==barcode; });
						if(exsitKind){

						}else{
							component.data.push(kindInfo);
						}
					}
					component.$dispatch('scan',kindInfo);
					if(component.edit){
						mainView.router.load({
							url:component.edit,
							query:{
								kind:kindInfo
							}
						});
					}
				})

			});
		}
	}
});
//自定义时间
Vue.component('self-define-date', {
	props: ['data'],
	template: '<a class="tab-link button" v-on:click="show($event)">自定义时间</a>',
	methods: {
		show:function(event){
			//a 元素
			var chipDiv = $$(event.currentTarget);
			var element=this;
			chipDiv.addClass("active");
			chipDiv.siblings().removeClass("active");
			eShop.modal({
				title: '自定义时间',
				afterText: '<div class="input-field"><input id="startTime" type="date" placeholder="开始时间" class="modal-text-input"/></div><div class="input-field"><input id="endTime" type="date" placeholder="截止时间"  class="modal-text-input"></div> <script>eShop.calendar({input: $$("#startTime"),maxDate: new Date()});eShop.calendar({input: $$("#endTime"),maxDate: new Date()});</script>',
				buttons: [{
					text: '取消',
					close: true,
				}, {
					text: '确定',
					close: true,
				}],
				onClick: function(modal, index) {
					//确认单据
					if(index == 1) {
						element.data.startTime = $$(modal).find("#startTime").val() || "";
						element.data.endTime = $$(modal).find("#endTime").val() || "";
						if(!element.data.startTime || !element.data.endTime){
							xunSoft.helper.showMessage("时间选取错误....");
							return ;
						}
						element.$dispatch('update');
					}
				}
			});
		}
	}
});