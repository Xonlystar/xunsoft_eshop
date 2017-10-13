
//销售订单菜单
Vue.component('salebatch-saleorder-menu',{
	props:['list'],
	template:
		'<div class="row no-gutter">'+
	        '<div class="col-auto">'+
	          '<select-order-kind :data.sync="list" edit="saleBatch/saleOrder/editKind.ios.html"></select-order-kind>'+
	        '</div>'+
	        '<div v-on:click="scanKind" class="col-auto">'+
	          '<select-barcode :data.sync="list" order="21" edit="saleBatch/saleOrder/editKindPrice.ios.html"></select-barcode>'+
	        '</div>'+
	        '<div class="col-auto">'+
	          '<sort-money :data.sync="list" prop="saleMoney"></sort-money>'+
	        '</div>'+
	        '<div class="col-auto">'+
	          '<sort-amount :data.sync="list" prop="saleAmount"></sort-amount>'+
	        '</div>'+
	    '</div>'
});

//销售订单明细
Vue.component('salebatch-saleorder-detail',{
	props:['list','detail'],
	template:
		'<div>'+
			'<div>'+
		        '<div>'+
		          '<kind-img :kind-id="detail.kindId" :color-id="detail.colorId"></kind-img>'+
		        '</div>'+
		        '<div>'+
		          '<order-kind :kind="detail.kind"></order-kind>'+
		          '<div>'+
		            '<div class="row no-gutter">'+
		              '<div class="col-50">'+
		                '售价:{{detail.wholesalePrice|currency}}'+
		              '</div>'+
		              '<div class="col-50">'+
		                '折扣:{{detail.discountRate | discountRate}}'+
		              '</div>'+
		            '</div>'+
		            '<div class="row no-gutter">'+
		              '<div class="col-50">'+
		                '<div>'+
		                  '购量:{{detail.saleAmount}}{{detail.kind.unitName}}'+
		                '</div>'+
		              '</div>'+
		              '<div class="col-50">'+
		                '<div>'+
		                  '金额:{{detail.saleMoney |currency}}'+
		                '</div>'+
		              '</div>'+
		            '</div>'+
		          '</div>'+
		        '</div>'+
		    '</div>'+
		    '<div class="row">'+
	            '<div class="col-50">'+
	              '<edit-kind :data.sync="list" :kind="detail" edit="saleBatch/saleOrder/editKindPrice.ios.html"></edit-kind>'+
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

//出货单菜单
Vue.component('salebatch-deliverorder-menu',{
	props:['list'],
	template:
		'<div class="row no-gutter">'+
            '<div class="col-auto">'+
              '<select-order-kind :data.sync="list" edit="saleBatch/deliverOrder/editKind.ios.html"></select-order-kind>'+
            '</div>'+
            '<div v-on:click="scanKind" class="col-auto">'+
              '<select-barcode :data.sync="list" order="22" edit="saleBatch/deliverOrder/editKindPrice.ios.html"></select-barcode>'+
            '</div>'+
            '<div class="col-auto">'+
              '<sort-money :data.sync="list" prop="saleMoney"></sort-money>'+
            '</div>'+
            '<div  class="col-auto">'+
              '<sort-amount :data.sync="list" prop="saleAmount"></sort-amount>'+
            '</div>'+
        '</div>'
});

//出货单明细
Vue.component('salebatch-deliverorder-detail',{
	props:['list','detail'],
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
                    '售价:{{detail.wholesalePrice|currency}}'+
                  '</div>'+
                  '<div class="col-50">'+
                    '折扣:{{detail.discountRate | discountRate}}'+
                  '</div>'+
                '</div>'+
                '<div class="row no-gutter">'+
                  '<div class="col-50">'+
                    '购量:{{detail.deliverAmount}}{{detail.kind.unitName}}'+
                  '</div>'+
                  '<div class="col-50">'+
                    '金额:{{detail.deliverMoney |currency}}'+
                  '</div>'+
                '</div>'+
              '</div>'+
            '</div>'+
        '</div>'+      
        '<div class="row">'+
            '<div class="col-50">'+
              '<edit-kind :data.sync="list" :kind="detail" edit="saleBatch/deliverOrder/editKindPrice.ios.html"></edit-kind>'+
            '</div>'+
            '<div class="col-50">'+                
              '<delete-kind v-on:delete="delete(detail)" :data.sync="list" :kind="detail"></delete-kind>'+
            '</div>'+
        '</div>',
    methods:{
    	delete:function(kind){
    		this.$dispatch('delete',kind);
    	}
    }

});

//退货菜单
Vue.component('salebatch-return-menu',{
	props:['list'],
	template:
		'<div class="row no-gutter">'+
            '<div class="col-auto">'+
              '<select-order-kind :data.sync="list" edit="saleBatch/returnOrder/editKind.ios.html"></select-order-kind>'+
            '</div>'+
            '<div v-on:click="scanKind" class="col-auto">'+
              '<select-barcode :data.sync="list" order="23" edit="saleBatch/returnOrder/editKindPrice.ios.html"></select-barcode>'+
            '</div>'+
            '<div class="col-auto">'+
              '<sort-money :data.sync="list" prop="returnMoney"></sort-money>'+
            '</div>'+
            '<div class="col-auto">'+
              '<sort-amount :data.sync="list" prop="returnAmount"></sort-amount>'+
            '</div>'+
        '</div>'
});

//退货单明细
Vue.component('salebatch-return-detial',{
	props:['list','detail'],
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
                    '价格:{{detail.wholesalePrice|currency}}'+
                  '</div>'+
                  '<div class="col-50">'+
                    '折扣:{{detail.discountRate | discountRate}}'+
                  '</div>'+
                '</div>'+
                '<div class="row no-gutter">'+
                  '<div class="col-50">'+
                    '<div>'+
                      '数量:{{detail.returnAmount}}{{detail.kind.unitName}}'+
                    '</div>'+
                  '</div>'+
                  '<div class="col-50">'+
                    '<div>'+
                      '金额:{{detail.returnMoney |currency}}'+
                    '</div>'+
                  '</div>'+
                '</div>'+
              '</div>'+
            '</div>'+
          '</div>'+      
          '<div class="row">'+
            '<div class="col-50">'+
              '<edit-kind :data.sync="list" :kind="detail" edit="saleBatch/returnOrder/editKindPrice.ios.html"></edit-kind>'+
            '</div>'+
            '<div class="col-50">'+
              '<delete-kind v-on:delete="delete(detail)" :data.sync="list" :kind="detail"></delete-kind>'+
            '</div>'+
          '</div> '+
        '</div>',
    methods:{
    	delete:function(kind){
    		this.$dispatch('delete',kind);
    	}
    }
})