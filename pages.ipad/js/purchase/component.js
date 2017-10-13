Vue.component('order-plus',{
    template:
    	'<div class="content-block inset">'+
	        '<div class="content-block-inner">'+
	          '<div class="text-center">'+
	            '<i class="fa fa-cart-plus fa-5x"></i>'+
	          '</div>'+
	        '</div>'+
	    '</div>'
});


//采购订单菜单
Vue.component('purchase-purchase-menu',{
	props:['list'],
	template:
		'<div class="row no-gutter">'+
        '<div class="col-auto">'+
          '<select-order-kind :data.sync="list" edit="purchase/purchaseOrder/editKind.ios.html"></select-order-kind>'+
        '</div>'+
        '<div class="col-auto">'+
          '<select-barcode :data.sync="list" order="11" edit="purchase/purchaseOrder/editKindPrice.ios.html"></select-barcode>'+
        '</div>'+
        '<div v-on:click="sortMoneyKind" data-order="asc" class="col-auto">'+
          '<div class="text-center">'+
            '<i class="fa fa-jpy fa-3x"></i>'+
          '</div>'+
          '<div class="text-center">金额排序</div>'+
        '</div>'+
        '<div data-order="asc" class="col-auto">'+
          '<sort-amount :data.sync="list" prop="purchaseAmount"></sort-amount>'+
        '</div>'+
    '</div>',
    methods:{
    	//金额排序
  		sortMoneyKind:function(event){
  			if(this.list.length>1){
  				var order=$$(event.currentTarget).attr('data-order');
  				//检查排序方式
  				if(order=="asc"){
  					//asc 从小到大
  					this.list=_.sortBy(this.list,
  						function(item){ return (item.purchaseMoney-item.taxMoney); });
  					$$(event.currentTarget).attr('data-order',"desc");
  				}else{
  					//desc 从大到小
  					var orderBy=_.sortBy(this.list,function(item){ return (item.purchaseMoney-item.taxMoney); });
  					this.list=orderBy.reverse();
  					$$(event.currentTarget).attr('data-order',"asc");
  				}
  			}
  		}
    }
});

//采购订单货品明细
Vue.component('purchase-purchase-detail',{
	props: ['list','detail'],
	template:
		'<div>'+
      '<div>'+
        '<kind-img :kind-id="detail.kindId" :color-id="detail.colorId"></kind-img>'+
      '</div>'+
      '<div>'+
        '<order-kind :kind="detail.kind"></order-kind>'+
        '<div>'+
          '<div class="row no-gutter">'+
            '<div class="col-50">'+
              '购价:{{detail.purchasePrice|currency}}'+
            '</div>'+
            '<div class="col-50">'+
              '购量:{{detail.purchaseAmount}}{{detail.kind.unitName}}'+
            '</div>'+
          '</div>'+
          '<div class="row no-gutter">'+
            '<div class="col-50">'+
              '折扣:{{detail.discountRate | discountRate}}'+
            '</div>'+
            '<div class="col-50">'+
              '税额:{{detail.taxMoney|currency}}'+
            '</div>'+
          '</div>'+
          '<div class="row no-gutter">'+
            '<div class="col-100">'+
              '采购额:{{(detail.purchaseMoney-detail.taxMoney)|currency}}'+
            '</div>'+
          '</div>'+
        '</div>'+
      '</div>'+
      '<div class="row">'+
        '<div class="col-50">'+
          '<edit-kind :data.sync="list" :kind="detail" edit="purchase/purchaseOrder/editKindPrice.ios.html"></edit-kind>'+
        '</div>'+
        '<div class="col-50">'+
          '<delete-kind v-on:delete="delete(detail)" :data.sync="list" :kind="detail"></delete-kind>'+
        '</div>'+
      '</div>'+
    '</div>',
  methods:{
    delete:function(kind){  
     this.$dispatch('delete',kind);
    }
  }
});


//采购收货单菜单
Vue.component('purchase-receive-menu',{
  props:['list'],
  template:
    '<div class="row no-gutter">'+
      '<div class="col-auto">'+
        '<select-order-kind :data.sync="list" edit="purchase/receiveOrder/editKind.ios.html">'+
        '</select-order-kind>'+
      '</div>'+
      '<div v-on:click="scanKind" class="col-auto">'+
        '<select-barcode :data.sync="list" order="12" edit="purchase/receiveOrder/editKindPrice.ios.html"></select-barcode>'+
      '</div>'+
      '<div v-on:click="sortMoneyKind($event)" data-order="asc" class="col-auto">'+
        '<div class="text-center">'+
          '<i class="fa fa-jpy fa-3x"></i>'+
        '</div>'+
        '<div class="text-center">金额排序</div>'+
      '</div>'+
      '<div data-order="asc" class="col-auto">'+
        '<sort-amount :data.sync="list" prop="receiveAmount"></sort-amount>'+
      '</div>'+
      '<div v-on:click="import" class="col-auto">'+
        '<div class="text-center">'+
          '<i class="fa fa-share fa-3x"></i>'+
        '</div>'+
        '<div class="text-center">采购导入</div>'+
      '</div>'+
    '</div>',
  methods:{
    sortMoneyKind:function(event){
      if(this.list.length>1){
        var order=$$(event.currentTarget).attr('data-order');
        //检查排序方式
        if(order=="asc"){
          //asc 从小到大
          this.list=_.sortBy(this.list,
            function(item){ return (item.receiveMoney-item.taxMoney); });
          $$(event.currentTarget).attr('data-order',"desc");
        }else{
          //desc 从大到小
          var orderBy=_.sortBy(this.list,function(item){ return (item.receiveMoney-item.taxMoney); });
          this.list=orderBy.reverse();
          $$(event.currentTarget).attr('data-order',"asc");
        }
      }
    },
    import:function(){
      this.$dispatch('import');
    }
  }
});

//采购收货单明细
Vue.component('purchase-receive-detail',{
  props:['list','detail'],
  template:
     '<div>'+
        '<div>'+
          '<kind-img :kind-id="detail.kindId" :color-id="detail.colorId"></kind-img>'+
        '</div>'+
        '<div>'+
          '<order-kind :kind="detail.kind"></order-kind>'+
          '<div class="row no-gutter">'+
            '<div class="col-50">'+
              '收货价:{{detail.receivePrice|currency}}'+
            '</div>'+
            '<div class="col-50">'+
              '收货量:{{detail.receiveAmount}}{{detail.kind.unitName}}'+
            '</div>'+
          '</div>'+
          '<div class="row no-gutter">'+
            '<div class="col-50">'+
              '折扣:{{detail.discountRate | discountRate}}'+
            '</div>'+
            '<div class="col-50">'+
              '税额:{{detail.taxMoney|currency}}'+
            '</div>'+
          '</div>'+
          '<div class="row no-gutter">'+
            '<div class="col-100">'+
              '收货额:{{(detail.receiveMoney-detail.taxMoney)|currency}}'+
            '</div>'+
          '</div>'+
        '</div>'+
        '<div class="row">'+
          '<div class="col-50">'+
            '<edit-kind :data.sync="list" :kind="detail" edit="purchase/receiveOrder/editKindPrice.ios.html"></edit-kind>'+
          '</div>'+
          '<div class="col-50">'+
            '<delete-kind v-on:delete="delete(detail)" :data.sync="list" :kind="detail"></delete-kind>'+
          '</div>'+
        '</div>'+
      '</div>',
  methods:{
    delete:function(kind){
      this.$dispatch('delete',this.detail);
    }
  }
});


//采购退货单菜单
Vue.component('purchase-return-menu',{
  props:['list'],
  template:
    '<div class="row no-gutter">'+
      '<div class="col-auto">'+
        '<select-order-kind :data.sync="list" edit="purchase/returnOrder/editKind.ios.html"></select-order-kind>'+
      '</div>'+
      '<div v-on:click="scanKind" class="col-auto">'+
        '<select-barcode :data.sync="list" order="13" edit="purchase/returnOrder/editKindPrice.ios.html"></select-barcode>'+
      '</div>'+
      '<div v-on:click="sortMoneyKind($event)" data-order="asc" class="col-auto">'+
        '<div class="text-center">'+
          '<i class="fa fa-jpy fa-3x"></i>'+
        '</div>'+
        '<div class="text-center">金额排序</div>'+
      '</div>'+
      '<div data-order="asc" class="col-auto">'+
        '<sort-amount :data.sync="list" prop="returnAmount"></sort-amount>'+
      '</div>'+
      '<div v-on:click="import" class="col-auto">'+
        '<div class="text-center">'+
          '<i class="fa fa-share fa-3x"></i>'+
        '</div>'+
        '<div class="text-center">收货导入</div>'+
      '</div>'+
    '</div>',
  methods:{
      //金额排序
      sortMoneyKind:function(event){
        if(this.list.length>1){
          var order=$$(event.currentTarget).attr('data-order');
          //检查排序方式
          if(order=="asc"){
            //asc 从小到大
            this.list=_.sortBy(this.list,
              function(item){ return (item.returnMoney-item.taxMoney); });
            $$(event.currentTarget).attr('data-order',"desc");
          }else{
            //desc 从大到小
            var orderBy=_.sortBy(this.list,function(item){ return (item.returnMoney-item.taxMoney); });
            this.list=orderBy.reverse();
            $$(event.currentTarget).attr('data-order',"asc");
          }
        }
      },
      import:function(){
        this.$dispatch('import');
      }
  }
});

//采购退货单明细
Vue.component('purchase-return-detail',{
  props:['list','detail'],
  template:
    '<div>'+
      '<div>'+
        '<kind-img :kind-id="detail.kindId" :color-id="detail.colorId"></kind-img>'+
      '</div>'+
      '<div>'+
        '<order-kind :kind="detail.kind"></order-kind>'+
        '<div class="row no-gutter">'+
          '<div class="col-50">'+
            '退货价:{{detail.returnPrice|currency}}'+
          '</div>'+
          '<div class="col-50">'+
            '退货数:{{detail.returnAmount}}{{detail.kind.unitName}}'+
          '</div>'+
        '</div>'+
        '<div class="row no-gutter">'+
          '<div class="col-50">'+
            '折扣:{{detail.discountRate | discountRate}}'+
          '</div>'+
          '<div class="col-50">'+
            '税额:{{detail.taxMoney|currency}}'+
          '</div>'+
        '</div>'+
        '<div class="row no-gutter">'+
          '<div class="col-100">'+
            '退货额:{{(detail.returnMoney-detail.taxMoney)|currency}}'+
          '</div>'+
        '</div>'+
      '</div>'+
      '<div class="row">'+
        '<div class="col-50">'+
          '<edit-kind :data.sync="list" :kind="detail" edit="purchase/returnOrder/editKindPrice.ios.html"></edit-kind>'+
        '</div>'+
        '<div class="col-50">'+
          '<delete-kind v-on:delete="delete(detail)" :data.sync="list" :kind="detail"></delete-kind>'+
        '</div>'+
      '</div>'+
    '</div>',
  methods:{
    delete:function(kind){
      this.$dispatch('delete',kind)
    }
  }
})