(function ($) {

    /**
     * 简单下拉筛选框
     * @param options
     * @returns {*}
     */
    $.fn.simpleCombox = function (options) {
        var settings= $.extend({
            searchMinLength:3, //触发最小搜索的字符
            url:null,//数据查询地址
            displayProperty:null,//显示属性
            action:null //回调处理函数
        },options)

        if(!settings.action || typeof settings.action != 'function'){
            throw "action 回调函数必须被设置为一个function"
        }
        if(!settings.url || typeof settings.url != "string")
            throw "url 必须是一个有效的字符串"
        if(!settings.displayProperty || typeof settings.displayProperty != "string")
            throw "显示属性displayProperty必须是一个有效的字符串"
        var me =$(this)
        me.parent().append('<div class="dropdown"></div>')
        var dropdownDiv = me.parent().find('div.dropdown:last')
        var nme=me.clone()
        dropdownDiv.append(nme)
        me.remove()
        var ul=$('<ul class="dropdown-menu" role="menu"></ul>').insertAfter(nme)

        /**
         * 确认动作
         */
        function okay(){
            if(ul.find('li.active').length > 0 ){
                var datastr=ul.find('li.active').attr('data')
                var data = eval("("+datastr+")")
                settings.action(data)
                dropdownDiv.removeClass("open")
            }
        }

        /**
         * 方向键上动作
         */
        function up(){
            if(!dropdownDiv.hasClass('open') && ul.find('li').length > 0)
                dropdownDiv.addClass("open")
            if(ul.find('li.active').length == 0){
                ul.find('li:last').addClass('active')
            }
            else{
                var previousSelected=ul.find("li.active")
                previousSelected.removeClass('active').prev().addClass('active')
            }
        }

        /**
         * 方向键下动作
         */
        function down(){
            if(!dropdownDiv.hasClass('open') && ul.find('li').length > 0)
                dropdownDiv.addClass("open")
            if(ul.find('li.active').length == 0){
                ul.find('li:first').addClass('active')
            }
            else{
                var previousSelected=ul.find('li.active')
                previousSelected.removeClass("active").next().addClass('active')
            }
        }

        /**
         * 关闭筛选框
         */
        function close() {
            if(dropdownDiv.hasClass('open'))
                dropdownDiv.removeClass("open")
        }

        //对文本框绑定按键事件
        nme.keyup(function (evt) {
            //方向键上
            if(evt.keyCode == 38){
                up()
            }
            //方向键下
            if(evt.keyCode == 40) {
                down()
            }
            //回车键
            if(evt.keyCode == 13){
                okay()
            }
            //退出键
            if(evt.keyCode == 27) {
                close()
            }
        })

        //筛选列表点击
        ul.click(function (evt) {
            $(evt.target).parents('ul[role="menu"]').find('li.active').removeClass('active')
            $(evt.target).parent('li').addClass("active")
            okay()
        })

        //延迟计时器
        var timeCounter;
        //处理函数
        var process = function () {
            var me = $(this)
            if(me.val() && me.val().length >= settings.searchMinLength) {
                clearTimeout(timeCounter)
                timeCounter = setTimeout(function () {
                    $.post(settings.url,{q:me.val()}, function (json) {
                        if(json && json.resultcode && json.data && json.data.length>0){
                            dropdownDiv.find('ul[role="menu"]').empty()
                            $.each(json.data, function () {
                                var item = this
                                var dataStr = "{";
                                for(var r in item) {
                                    var valuestr= function (v) {
                                        if(typeof v == "string")
                                            return "\""+v+"\""
                                        else
                                            return v
                                    }(item[r]);

                                    dataStr += "\""+r+"\":"+valuestr+","
                                }
                                dataStr = dataStr.length > 1 ? dataStr.substring(0,dataStr.length-1) : dataStr
                                dataStr += "}"

                                dropdownDiv.find('ul[role="menu"]').append('' +
                                    '<li data=\''+dataStr+'\'><a href="#">'+item.name+'</a></li>')
                            })

                            dropdownDiv.addClass("open")
                        }

                    },'json')
                },500)
            }
            else{
                dropdownDiv.removeClass("open")
            }
        }
        if($.on && typeof $.on == "function")
            $('body').on("propertychange input","#"+nme.attr("id"), process)
        else{
            nme.get(0).onpropertychange = process
            nme.get(0).oninput=process
        }
        return nme
    }

    $.fn.deliveryPersonSelector = function (options) {
        options.url = "combox.json"
        return $(this).simpleCombox(options)
    }
})(jQuery)