//货品明细
eShop.onPageInit('kind_kindDetail',function(page){

	var pageDiv=$$(page.container);

	var vm=new Vue({
		el:page.container,
		data:{
			request:{
				id:0
			},
			response:{
				data:{}
			},
			imgSwipper:null
		},
		methods:{
			init:function(){

				vm.request.id=page.query.kindId;
							   
				this.load();

				vm.imgSwipper=new eShop.swiper(pageDiv.find('.swiper-container'),{
					pagination:'.swiper-pagination'
				});
			
			},
			//弹出pop框
		showPop: function() {
				var buttons = [{
						text: '相机',
						onClick: function() {
							xunSoft.device.photo.takePhoto(function(imgUrl) {
								vm.request.userLogo = imgUrl;
							});
						}
					},
					{
						text: '相册',
						onClick: function() {
							xunSoft.device.photo.getPhoto(function(imgUrl) {
								vm.request.userLogo = imgUrl;
							});
						}
					},
					{
						text: '取消',
						color: 'red'
					},
				];
				eShop.actions("#userLogo", buttons);
			},
			load:function(){
				kindService.get.getKindDetail(vm.request,vm.response,function(responseData){
					//筛选有图片的信息
 					var pictureGroupList=_.filter(responseData.data.pictureGroupList,function(data){
				 	  return data.resourceIds != null;		
				 	});
					_.each(pictureGroupList,function(item){
	   					var request={
	   						resourceId:item.resourceIds
	   					};	

	   					//获取对应的图片资源
	   					kindService.get.getKindPictures(request,null,function(responseData){
	   						if(_.isArray(responseData.data) && responseData.data.length>0){
	   							_.each(responseData.data,function(item){
	   								var fileUrl=xunSoft.ajax.serviceBase()+'Kind/Kind/Picture?fileName='+item.tempFileName;
	   								var imgDiv='<div class="swiper-slide text-center"> <img src="'+fileUrl+'" /> </div>';
	   								vm.imgSwipper.appendSlide(imgDiv);
	   							});
	   						}
	   					});
					 })
				});
			}
		}
	
	});

	vm.init();
    
});

//货品录入
eShop.onPageInit('kind_add',function(page){

	var pageDiv=$$(page.container);

	var vm=new Vue({
		el:page.container,
		data:{
			request:{
				brandId:'',
				kindClassId:'',
				kindNo:'',
				kindName:'',
				sizeGroupId:'',
				unitId:'',

				color:[],
				size:[]
			},
			response:{
				brands:baseInfoService.brands,
				kindClasses:[],
				colors:baseInfoService.colors,
				sizeGroups:baseInfoService.sizeGroups,
				sizes:[],
				units:baseInfoService.units
			}
		},
		watch:{
			'request.sizeGroupId':function(val,oldVal){
				if(val!=oldVal && val>0){
					vm.response.sizes=_.filter(baseInfoService.sizes,function(item){ return item.sizeGroupId==val; });
				}
			},
			'request.brandId':function(val,oldVal){
				if(val!=oldVal && val>0){
					//获取分类
					kindService.get.getKindClass({brandId:val},{},function(responseData){
						vm.response.kindClasses=responseData.data;
					});
				}
			}
		},
		methods:{
			init:function(){

			},
			//保存货品
			save:function(){
				if(!vm.request.kindNo){
					xunSoft.helper.showMessage("商品货号不能为空!");
					return ;
				}
				if(!vm.request.kindName){
					xunSoft.helper.showMessage("货号名称不能为空!");
					return ;
				}
				if(!vm.request.brandId){
					xunSoft.helper.showMessage("货号品牌不能为空!");
					return ;
				}
				if(!vm.request.kindClassId){
					xunSoft.helper.showMessage("货号分类不能为空!");
					return ;
				}
				if(!vm.request.unitId){
					xunSoft.helper.showMessage("货号单位不能为空!");
					return ;
				}
				if(!vm.request.sizeGroupId){
					xunSoft.helper.showMessage("货品尺码组不能为空!");
					return ;
				}	
				if(!vm.request.size || vm.request.size.length<=0){
					xunSoft.helper.showMessage("货号尺码不能为空!");
					return ;
				}
				if(!vm.request.color || vm.request.color.length<=0){
					xunSoft.helper.showMessage("货号颜色不能为空!");
					return ;
				}
				var request={
					data:vm.request 
				};		
				request.data.colorList=_.map(vm.request.colorId,function(item){ return { colorId:item } });
				request.data.sizeList=_.map(vm.request,function(item){ return { sizeId:item.sizeId } });

				console.log(request);
				//return;

				//保存货品
				kindService.post.postKind(request,{},function(responseData){

					if(page.query.editPage){
						mainView.router.load({
							url:page.query.editPage,
							query:{
								detailList:page.query.detailList,
								kindId:responseData.data.kindId
							}
						});
					}else if(_.isArray(page.query.detailList)) {
						page.query.detailList.push(kind);
						mainView.router.back();
					}else{
						mainView.router.back();
					}	
				});
			}
		}
	});

	vm.init();
});


//货品选择
eShop.onPageInit('kind_selectKind',function(page){
	var pageDiv=$$(page.container);

	var vm=new Vue({
		el:page.container,
		data:{
			request:{
				query:{
					brandId:'',
					kincClassId:'',
					kindName:''
				},
				pageIndex:1,
				pageSize:xunSoft.user.pageSize()
			},
			response:{
				total:0,
				data:[]
			}
		},
		methods:{
			init:function(){

				this.load();

				pageDiv.find('.pull-to-refresh-content').on('refresh',function(){
					eShop.pullToRefreshDone();
	  				vm.refresh();
				})

			},
			//加载下一页
			load:function(){
				kindService.get.getKindList(vm.request,vm.response);
			},
			//重新加载
			refresh:function(){
				this.request.pageIndex=1;
				this.response.total=0;
				this.response.data=[];
				this.load();
			},
			//选择商品
			select:function(kind){
				if(page.query.editPage){
					mainView.router.load({
						url:page.query.editPage,
						query:{
							detailList:page.query.detailList,
							kindId:kind.kindId
						}
					});
				}else if(_.isArray(page.query.detailList)) {
					page.query.detailList.push(kind);
					mainView.router.back();
				}
			},
			//设置查询参数
			query:function(){
				mainView.router.load({
					url:'kind/selectKindFilter.ios.html',
					query:{
						para:vm.request.query,
						callback:vm.refresh
					}
				});
			},
			//添加
			add:function(){
				mainView.router.load({
					url:'kind/add.ios.html',
					query:page.query,
					ignoreCache:true
				});
			}
		}
	});

	vm.init();
});


//货品选择过滤
eShop.onPageInit('kind_selectKindFilter',function(page){

	var pageDiv=$$(page.container);

	var vm=new Vue({
		el:page.container,
		data:{
			request:{
				brandId:0,
				kindClassId:0
			},
			response:{
				brands:baseInfoService.brands,
				kindClass:[]
			}
		},
		watch:{
			'request.brandId':function(value,oldVal){
				console.log(value);
				if(value!=oldVal && (value!=0 || value!='')){
					kindService.get.getKindClass({brandId:value},{},function(responseData){
						if(_.isArray(responseData.data)){
							vm.response.kindClass=responseData.data;
						}
					});
				}
			}
		},
		methods:{
			init:function(){
				if(page.query && page.query.para){
					vm.request.brandId=page.query.para.brandId;
				}
				if(page.query && page.query.para){
					vm.request.kincClassId=page.query.para.kincClassId;
				}
			},
			//保存
			save:function(){
				if(page.query && page.query.para){
					page.query.para.brandId=vm.request.brandId;
				}
				if(page.query && page.query.para){
					page.query.para.kincClassId=vm.request.kincClassId;
				}
				mainView.router.back();
				if(_.isFunction(page.query.callback)){
					page.query.callback();
				}
			}
		}
	});

	vm.init();

});

