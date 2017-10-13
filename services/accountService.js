var accountService = {

    get: {
        //获取用户的信息
        getInfo: function(request, response, success, fail) {
            xunSoft.ajax.get('Shop/User/Info', request, function(responseData) {
                if (responseData && response) {
                    response.data = responseData.data;
                    response.data.userLogo = xunSoft.ajax.serviceBase() + "Shop/User/Logo/" + responseData.data.tenantId + "/" + responseData.data.userId;
                }

                if (_.isFunction(success)) {
                    success(responseData);
                }

            }, fail);
        }
    },
    post: {
        //登录
        postLogin: function(request, response, success, fail) {
            //登录
            xunSoft.ajax.post('Shop/User/Login', request, function(responseData) {

                xunSoft.user.tenantId(responseData.data.tenantId); //店铺ID
                xunSoft.user.userId(responseData.data.userId); //用户ID
                xunSoft.user.employeeName(responseData.data.employeeName); //名称
                xunSoft.user.shopId(responseData.data.shopId); //店铺ID
                xunSoft.user.shopName(responseData.data.shopName); //店铺名称
                xunSoft.user.companyName(request.data.companyName);
                xunSoft.user.userName(request.data.userName);
                xunSoft.user.userPassword(request.data.userPassword);
                xunSoft.user.token(responseData.data.password);
                //获取基本信息
                baseInfoService.init();

                if (_.isFunction(success)) {
                    success(responseData);
                }

            }, fail);
        },
        postLoginByPhone: function(request, response, success, fail) {
            //登录
            xunSoft.ajax.post('Shop/User/MobleLogin', request, function(responseData) {

                xunSoft.user.tenantId(responseData.data.tenantId); //店铺ID
                xunSoft.user.userId(responseData.data.userId); //用户ID
                xunSoft.user.employeeName(responseData.data.employeeName); //名称
                xunSoft.user.shopId(responseData.data.shopId); //店铺ID
                xunSoft.user.shopName(responseData.data.shopName); //店铺名称
                xunSoft.user.companyName(request.data.companyName);
                xunSoft.user.userName(request.data.userName);
                xunSoft.user.userPassword(request.data.userPassword);
                xunSoft.user.token(responseData.data.password);
                //获取基本信息
                baseInfoService.init();

                if (_.isFunction(success)) {
                    success(responseData);
                }

            }, fail);
        },
    },
    put: {
        //修改密码
        putPassword: function(request, response, success, fail) {
            xunSoft.ajax.put("Shop/User/UpdatePassword", request, function(responseData) {
                //修改密码成功
                if (_.isFunction(success)) {
                    success(responseData);
                }
            }, function() {
                if (_.isFunction(fail)) {
                    fail();
                }
            });
        }
    }


};