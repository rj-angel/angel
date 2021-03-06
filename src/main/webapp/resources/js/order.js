/**
 * 订单管理
 */
var centerJS = (function () {
    var url;
    return {
        //添加订单
        newOrder: function () {
            $('#dlg').dialog('open').dialog('setTitle', '新增订单');
            $('#fm').form('clear');
            //$('#fm input[name="productCode"]').attr('readonly',false);
            url = '../orderController/addOrder.json';
        },
        //编辑订单
        editOrder: function () {
            var rows = $('#dg').datagrid('getSelections');
            if (rows.length > 1) {
                $.messager.show({
                    title: '提示',
                    msg: "更新时只能选中一条记录!"
                });
                return;
            }
            var row = rows[0];
            if (row) {

                $('#dlg').dialog('open').dialog('setTitle', '修改订单');
                $('#fm').form('load', row);
                //重新设置pv_total 与 bv_total
                //设置PV和BV的隐藏域的值
                var pv = row['pv_unit'];
                var bv = row['bv_unit'];
                var saleNumber = row['saleNumber'];
                $('#pv').val(pv);
                $('#bv').val(bv);
                //$('#pv_totalDiv').val(pv *saleNumber);
                //$('#bv_totalDiv').val(bv *saleNumber);
                //$('#fm input[name="productCode"]').attr('readonly',true).css('color','red');
                url = '../orderController/updateOrder.json';
            }
        },
        //删除订单
        destroyOrder: function () {
            var rows = $('#dg').datagrid('getSelections');
            if (rows.length > 0) {
                var codes = [];
                for (var i in rows) {
                    codes.push(rows[i].orderCode);
                }
                $.messager.confirm('提示', '您确定要删除当前选中的产品吗?', function (r) {
                    if (r) {
                        var url =  '../orderController/destroyOrder.json';
                        CommonAjax.get(url,{codes: codes},'POST',function(result){
                            if (result.message) {
                                $.messager.show({
                                    title: '提示',
                                    msg: result.message
                                });
                            } else {
                                $.messager.show({
                                    title: '提示',
                                    msg: "删除成功!"
                                });
                                //刷新列表
                                $('#dg').datagrid('reload');
                            }
                        });
                    }
                });
            }
        },
        saveOrder: function () {
            $('#fm').form('submit', {
                url: url,
                onSubmit: function () {
                    return $(this).form('validate');
                },
                success: function (re) {
                    var result = $.parseJSON(re);
                    if (result.message) {
                        $.messager.show({
                            title: '提示',
                            msg: result.message
                        });
                    } else {
                        $('#dlg').dialog('close');
                        $('#dg').datagrid('reload');
                        $.messager.show({
                            title: '提示',
                            msg: "保存成功!"
                        });
                    }
                }
            });
        },
        //表单查询
        formQuery: function () {
            var formData = $('#north_form').serializeObject();
            $('#dg').datagrid('load', formData);
        },
        //合计
        onChangeSum: function () {
            var num = $('#saleNumber').val();
            var price = $('#productPrice').val();
            ////var pv = $('#pv').val();
            ////var bv = $('#bv').val();
            $('#sumPrice').val(num *price);
            ////$('#pv_totalDiv').val(num *pv);
            ////$('#bv_totalDiv').val(num *bv);
        },
        //月销售额汇总
        getSumMon: function () {
            $.get("../orderController/getSumMon.json", function (result) {
                $.messager.alert("月销售额汇总", "汇总金额为：" + result, "info");
            });
        }
    }
})();

/**
 * 初始化
 */
$(function () {
    $('#dg').datagrid({
        url: "../orderController/pageOrderList.json",
        title: "订单列表",
        toolbar: "#toolbar",
        pagination: "true",
        rownumbers: "true",
        fitColumns: "true",
        fit: "true",
        sortName: 'saleTime',
        sortOrder: 'desc',
       // multiSort: true,
        pageSize: 20,
        view: noRecordGridview,
        emptyMsg: '未查询到该订单',
        columns: [
            [
                {field: 'ck', checkbox: true},
                {field: 'orderCode', title: '订单编号', width: 100},
                {field: 'purchaserCode', title: '会员编号', width: 50, sortable: true, order: 'desc',sortable:true},
                {field: 'purchaserName', title: '会员姓名', width: 50},
                {field: 'shopCode', title: '商店编号', width: 50,sortable:true},
                {field: 'shopName', title: '商店名称', width: 50},
                {field: 'productCode', title: '产品编号', width: 50,sortable:true},
                {field: 'productName', title: '产品名称', width: 50},
                {field: 'productPrice', title: '产品价格', width: 50,sortable:true},
                {field: 'pv', title: 'PV', width: 50,sortable:true},
                {field: 'bv', title: 'BV', width: 50,sortable:true},
                {field: 'saleNumber', title: '购买数量', width: 50,sortable:true},
                {field: 'sumPrice', title: '购买总额', width: 50},
                {field: 'bv_unit',title:'隐藏字段BV',hidden:true},
                {field: 'pv_unit',title:'隐藏字段PV',hidden:true},
                {field: 'saleTime', title: '购买时间', width: 100,sortable:true,
                    formatter: function (value, row, index) {
                        var unixTimestamp = new Date(value);
                        return unixTimestamp.toLocaleString();
                    }}
            ]
        ],
        onBeforeLoad: function (param) {
            //列表查询前将表单值作为参数传递到后台方法
            var formData = $('#north_form').serializeObject();
            $.extend(param, formData);
        }
    });

    //合计
    $("#saleNumber,#productPrice").keyup(function () {
        centerJS.onChangeSum();
    });

    //查询
    $('#querybtn').click(function (e) {
        e.preventDefault();
        centerJS.formQuery();
    });

    //月销售额汇总
    $('#sumbtn').click(function (e) {
        e.preventDefault();
        centerJS.getSumMon();
    });

});