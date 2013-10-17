//jQuery.ui.position.js
(function ($) {
    $.ui = $.ui || {};

    var horizontalPositions = /left|center|right/,
        horizontalDefault = "center",
        verticalPositions = /top|center|bottom/,
        verticalDefault = "center",
        _position = $.fn.position,
        _offset = $.fn.offset;

    $.fn.position = function (options) {
        if (!options || !options.of) {
            return _position.apply(this, arguments);
        }

        // make a copy, we don't want to modify arguments
        options = $.extend({}, options);

        var target = $(options.of),
            collision = ( options.collision || "flip" ).split(" "),
            offset = options.offset ? options.offset.split(" ") : [ 0, 0 ],
            targetWidth,
            targetHeight,
            basePosition;

        if (options.of.nodeType === 9) {
            targetWidth = target.width();
            targetHeight = target.height();
            basePosition = { top:0, left:0 };
        } else if (options.of.scrollTo && options.of.document) {
            targetWidth = target.width();
            targetHeight = target.height();
            basePosition = { top:target.scrollTop(), left:target.scrollLeft() };
        } else if (options.of.preventDefault) {
            // force left top to allow flipping
            options.at = "left top";
            targetWidth = targetHeight = 0;
            basePosition = { top:options.of.pageY, left:options.of.pageX };
        } else {
            targetWidth = target.outerWidth();
            targetHeight = target.outerHeight();
            basePosition = target.offset();
        }

        // force my and at to have valid horizontal and veritcal positions
        // if a value is missing or invalid, it will be converted to center
        $.each([ "my", "at" ], function () {
            var pos = ( options[this] || "" ).split(" ");
            if (pos.length === 1) {
                pos = horizontalPositions.test(pos[0]) ?
                    pos.concat([verticalDefault]) :
                    verticalPositions.test(pos[0]) ?
                        [ horizontalDefault ].concat(pos) :
                        [ horizontalDefault, verticalDefault ];
            }
            pos[ 0 ] = horizontalPositions.test(pos[0]) ? pos[ 0 ] : horizontalDefault;
            pos[ 1 ] = verticalPositions.test(pos[1]) ? pos[ 1 ] : verticalDefault;
            options[ this ] = pos;
        });

        // normalize collision option
        if (collision.length === 1) {
            collision[ 1 ] = collision[ 0 ];
        }

        // normalize offset option
        offset[ 0 ] = parseInt(offset[0], 10) || 0;
        if (offset.length === 1) {
            offset[ 1 ] = offset[ 0 ];
        }
        offset[ 1 ] = parseInt(offset[1], 10) || 0;

        if (options.at[0] === "right") {
            basePosition.left += targetWidth;
        } else if (options.at[0] === horizontalDefault) {
            basePosition.left += targetWidth / 2;
        }

        if (options.at[1] === "bottom") {
            basePosition.top += targetHeight;
        } else if (options.at[1] === verticalDefault) {
            basePosition.top += targetHeight / 2;
        }

        basePosition.left += offset[ 0 ];
        basePosition.top += offset[ 1 ];

        return this.each(function () {
            var elem = $(this),
                elemWidth = elem.outerWidth(),
                elemHeight = elem.outerHeight(),
                position = $.extend({}, basePosition);

            if (options.my[0] === "right") {
                position.left -= elemWidth;
            } else if (options.my[0] === horizontalDefault) {
                position.left -= elemWidth / 2;
            }

            if (options.my[1] === "bottom") {
                position.top -= elemHeight;
            } else if (options.my[1] === verticalDefault) {
                position.top -= elemHeight / 2;
            }

            // prevent fractions (see #5280)
            position.left = parseInt(position.left);
            position.top = parseInt(position.top);

            $.each([ "left", "top" ], function (i, dir) {
                if ($.ui.position[ collision[i] ]) {
                    $.ui.position[ collision[i] ][ dir ](position, {
                        targetWidth:targetWidth,
                        targetHeight:targetHeight,
                        elemWidth:elemWidth,
                        elemHeight:elemHeight,
                        offset:offset,
                        my:options.my,
                        at:options.at
                    });
                }
            });

            if ($.fn.bgiframe) {
                elem.bgiframe();
            }
            elem.offset($.extend(position, { using:options.using }));
        });
    };

    $.ui.position = {
        fit:{
            left:function (position, data) {
                var win = $(window),
                    over = position.left + data.elemWidth - win.width() - win.scrollLeft();
                position.left = over > 0 ? position.left - over : Math.max(0, position.left);
            },
            top:function (position, data) {
                var win = $(window),
                    over = position.top + data.elemHeight - win.height() - win.scrollTop();
                position.top = over > 0 ? position.top - over : Math.max(0, position.top);
            }
        },

        flip:{
            left:function (position, data) {
                if (data.at[0] === "center") {
                    return;
                }
                var win = $(window),
                    over = position.left + data.elemWidth - win.width() - win.scrollLeft(),
                    myOffset = data.my[ 0 ] === "left" ?
                        -data.elemWidth :
                        data.my[ 0 ] === "right" ?
                            data.elemWidth :
                            0,
                    offset = -2 * data.offset[ 0 ];
                position.left += position.left < 0 ?
                    myOffset + data.targetWidth + offset :
                    over > 0 ?
                        myOffset - data.targetWidth + offset :
                        0;
            },
            top:function (position, data) {
                if (data.at[1] === "center") {
                    return;
                }
                var win = $(window),
                    over = position.top + data.elemHeight - win.height() - win.scrollTop(),
                    myOffset = data.my[ 1 ] === "top" ?
                        -data.elemHeight :
                        data.my[ 1 ] === "bottom" ?
                            data.elemHeight :
                            0,
                    atOffset = data.at[ 1 ] === "top" ?
                        data.targetHeight :
                        -data.targetHeight,
                    offset = -2 * data.offset[ 1 ];
                position.top += position.top < 0 ?
                    myOffset + data.targetHeight + offset :
                    over > 0 ?
                        myOffset + atOffset + offset :
                        0;
            }
        }
    };

// offset setter from jQuery 1.4
    if (!$.offset.setOffset) {
        $.offset.setOffset = function (elem, options) {
            // set position first, in-case top/left are set even on static elem
            if (/static/.test($.curCSS(elem, "position"))) {
                elem.style.position = "relative";
            }
            var curElem = $(elem),
                curOffset = curElem.offset(),
                curTop = parseInt($.curCSS(elem, "top", true), 10) || 0,
                curLeft = parseInt($.curCSS(elem, "left", true), 10) || 0,
                props = {
                    top:(options.top - curOffset.top) + curTop,
                    left:(options.left - curOffset.left) + curLeft
                };

            if ('using' in options) {
                options.using.call(elem, props);
            } else {
                curElem.css(props);
            }
        };

        $.fn.offset = function (options) {
            var elem = this[ 0 ];
            if (!elem || !elem.ownerDocument) {
                return null;
            }
            if (options) {
                return this.each(function () {
                    $.offset.setOffset(this, options);
                });
            }
            return _offset.call(this);
        };
    }

}(jQuery));
//jQuery.ui.position.js END

//$.fn.placeholder 为低端浏览器提供input的placeholder功能
(function ($) {
	$.fn.placeholder = "placeholder" in $("<input>")[0] ?  function(color){
		return this;
	} : function(className){
		className = className || "placeholder";
		return this.each(function() {
			var textbox = $(this);
			textbox.focus(function(e) {
				if(this.value == textbox.attr("placeholder")){
					this.value = '';
					$(this).removeClass(className);
				}
			}).blur(function(e) {
				if(!this.value){
					this.value=textbox.attr("placeholder");
					$(this).addClass(className);
				}
			}).triggerHandler("blur");
		});
	}
}(jQuery));

//$.fn.placeholder 为低端浏览器提供input的placeholder功能
//为口碑头部搜索添加placeholder功能
if(!("placeholder" in $("#kb_head_search")[0])){
    $("#kb_head_search").placeholder();
}

//jQuery.ui.autoTips.js
(function ($) {
    //autoComplate 自动完成功能JS
    $.fn.autoTips = function (opts) {
        opts = $.extend({}, $.fn.autoTips.defaultOpts, opts || {});
        $(this).each(function () {
            var _this = $(this);
            opts.inputObj = _this;
            if (_this.attr('defaultIndex')) {
                opts.defaultIndex = _this.attr('defaultIndex');
            }
            (function (opts) {
                _this.keyup(function (event) {
                    var key = event.which, txtVal = _this.val(), tipsID = $('#' + opts.tipsID), li_list = $('#' + opts.tipsID).find('li');
                    if (key == 13) {//回车
                        if (tipsID.is(':visible')) {
                            _this.val(li_list.eq(getCurIndex(li_list, key, opts)).html());
                            tipsID.hide();
                            return false;
                            //$('#password').focus();
                        }
                    } else if (key == 40 || key == 38) {//上下键输入38为上，40为下
                        if (tipsID.is(':visible')) {
                            var cur_item = li_list.eq(getCurIndex(li_list, key, opts));
                            cur_item.addClass('tips_hover').siblings().removeClass('tips_hover');
                            _this.val(cur_item.html());
                        }
                    } else if (key != 13 && key != 40 && key != 38) {
                        if ($.trim(txtVal) == "") {
                            tipsID.hide();
                            return false;
                        }
                        if (opts.callback) {
                            opts.callback.call(this, opts);
                        }
                        tipsID.show();
                    }

                });
                //获取当前选中的提示项
                getCurIndex = function (li_list, keyCode, opts) {
                    var curIndex = li_list.index($('#' + opts.tipsID).find('.tips_hover'));
                    if (keyCode == 40) {
                        curIndex += 1;
                    }
                    else if (keyCode == 38) {
                        curIndex -= 1;
                    }
                    if (curIndex >= li_list.length) {
                        curIndex = 0;
                    } else if (curIndex < 0) {
                        curIndex = li_list.length;
                    }
                    return curIndex;
                };
                //创建自动提示元素
                _creatTipsElement = function (dataSource, opts) {
                    $('#' + opts.tipsID).remove();
                    var TipsObj = $('<div id="' + opts.tipsID + '" ></div>'), list = [];
                    list.push('<ul>');
                    if (dataSource.length > 0) {
                        for (var i = 0; i < dataSource.length; i++) {
                            list.push('<li data="' + dataSource[i] + '">' + dataSource[i] + '</li>');
                        }
                    }
                    list.push('</ul>');
                    var liList = TipsObj.append(list.join('')).find('li');
                    if (opts.type == 'email') {
                        liList = TipsObj.find('li:not(:first)');
                    } else if (opts.listCallback) {
                        $.each(opts.listCallback, function (name, fn) {
                            liList.bind(name, function () {
                                fn.apply(this);
                            });
                        });
                    }
                    liList.click(function () {
                        opts.inputObj.val($(this).html());
                        TipsObj.hide();
                        if (opts.listClickCallback) {
                            opts.listClickCallback.call(this, opts);
                        }
                    }).hover(function () {
                            $(this).addClass('tips_hover');
                        }, function () {
                            $(this).removeClass('tips_hover');
                        });
                    $('body').append(TipsObj);
                    TipsObj.position({
                        my:"left top",
                        at:"left bottom",
                        of:opts.inputObj,
                        collision:"none"
                    }).hide();
                    if (opts.addClass) {
                        TipsObj.addClass(opts.addClass);
                    }
                    $('#' + opts.tipsID).show();
                    opts.inputObj.blur(function () {
                        setTimeout(function () {
                            $('#' + opts.tipsID).hide();
                        }, 150);
                    });
                }; //_creatTipsElement END
                _updateTipsElement = function (dataSource, tipsID) {
                };//_updateTipsElement END
            })(opts);

        });
    }// autoTips END
    $.fn.autoTips.defaultOpts = {dataSource:[], listCallback:null, tipsID:'tips', addClass:null, defaultIndex:0, type:'email'};
})(jQuery);
//jQuery.ui.autoTips.js END


(function ($) {
    var contentArray;
    //弹出层提示
    $.dialogUi = {
        defaultOpts:{
            width:385,
            height:'auto',
            callback:null,
            title:'',
            closeFun:'',
            style:'',
            content:null,
            dialogID:null,
            mask:false,
            cancelFun:'',
            cssid:'dialogcss',
            dialogOpacity:'0.8',
            buttons:{
                '确认':{
                    btnClass:'sure_btn',
                    fn:function () {
                        jQuery.boxClose();
                        return false;
                    }
                },
                '取消':{
                    btnClass:'cancel_btn',
                    fn:function () {
                        jQuery.boxClose();
                        return false
                    }
                }
            }
        },
        showDialog:function (opts) {
            defaultOpts = $.extend(this.defaultOpts, opts || {});
            //this.addClass(opts);
            return this.addHTML(opts);
        },
        _creatButton:function () {
            if (defaultOpts.buttons) {
                var _btnWrap = $('<div class="dialogbtn_wrap"></div>');
                $.each(defaultOpts.buttons, function (name, fn) {
                    fn.btnClass = fn.btnClass || 'sure_btn';
                    $('<a class="' + fn.btnClass + '" href="javascript:;" ><span>' + name + '</span></a>').click(function () {
                        fn.fn.apply(this);
                    }).appendTo(_btnWrap);
                });
                return _btnWrap.find('a').length > 0 ? _btnWrap : '';
            }
            return "";
        },
        addTemplate:function () {//添加固定的外层模版
            var dialogStr = '<div class="dialog_wrap">'
            dialogStr += '<div class="dialog"><h3 class="dialog_tit">' + defaultOpts.title + '</h3>';
            dialogStr += '<a class="dialog_close" onclick="$.boxClose();return false" href="javascript:;"></a>';
            dialogStr += '<div class="dialog_content" >';
            dialogStr += '<div class="cover_list" id="global_dialog_content">';
            dialogStr += '</div>';
            dialogStr += '</div>';
            dialogStr += '</div>';
            dialogStr += '</div>';
            return $(dialogStr);
        },
        contentArray:null,
        addHTML:function (opts) {
            var temp = this.addTemplate(), dialogID = defaultOpts.dialogID, content = defaultOpts.content;
            if (dialogID) {
                if (contentArray) {
                    if (!contentArray[dialogID]) {
                        contentArray[dialogID] = $(dialogID).html();
                        $(dialogID).remove();
                    }
                } else {
                    contentArray = [];
                    contentArray[dialogID] = $(dialogID).html();
                    $(dialogID).remove();
                }
                temp.find('#global_dialog_content').append(contentArray[dialogID]).append(this._creatButton());
            } else if (content) {
                temp.find('#global_dialog_content').append(content).append(this._creatButton());
            }
            temp.width(defaultOpts.width).height(defaultOpts.height);
            $.dialogBackGround = defaultOpts.dialogBackGround, $.dialogOpacity = defaultOpts.dialogOpacity, $.boxShow(temp, defaultOpts.mask);
            if(defaultOpts.callback){
                defaultOpts.callback.apply(this,defaultOpts);
            }
			return temp;
        }
    };
    //未登录提示
    $.loginTips = function () {
        $.dialogUi.showDialog({
            'title':'提示信息：',
            content:'<div style="text-align: center; padding-bottom: 20px; font-size: 14px;">您还未登录，请<a href="http://www.jumei.com/i/account/login/" target="_blank">登录</a>或<a href="http://www.jumei.com/i/account/signup/" target="_blank">注册</a>！</div>',
            mask:false,
            buttons:null
        });
    };
    //搜索自动提示
    $.fn.searchTips = function (opts) {
        var defaultOpts = {tipsID:'searchTips', addClass:'searchTips'};
        var options = $.extend({}, defaultOpts, opts || {});
        if ($(this).length > 0) {
            var _thisform = $(this).parent('form');
            if (_thisform.length == 0) {
                _thisform = $(this).parent().parent('form');
            }
            $(this).autoTips({tipsID:options.tipsID, addClass:options.addClass, type:'ajax', callback:function (opts) {
                $.ajax({dataType:'jsonp', url:'http://search.jumei.com/ajax_get_assoc_word?container=top_search_pop_div&n=' + Math.random() + '&callback=?&search=' + $(this).val(), jsonpCallback:'searchCallback',
                    success:function (data) {
                        var dataList = [], index = 0;
                        for (var item in data) {
                            dataList[index] = [item];
                            index++;
                        }
                        if (dataList.length == 0) return false;
                        _creatTipsElement(dataList, opts);
                        // $('#searchTips').show();
                    }
                });
            }, listClickCallback:function () {
                _thisform.submit();
            }
            });
        }
    }
    if ($('#search_txt').length == 1) {
        $('#search_txt').searchTips();
    }
    //关注AJAX操作
    $.fn.attention = function () {
        //按钮上添加oper=set/unset(是否已经关注) fid(用户ID)
        this.bind('click',
            function bindAttention() {
                var _this = $(this), oper = _this.attr('oper') || 'set', state = parseInt(_this.attr('state'));
                _this.unbind('click', bindAttention);
                var url = '/follow?_ajax_=Attention&fid=' + _this.attr('fid') + '&a=' + oper;
                $.ajax({
                    dataType:'json',
                    type:'GET',
                    url:url,
                    success:function (data) {
                        if (data.error == 0) {
                            if (oper == 'unset') {
                                _this.removeClass('cancelBtn').addClass('addBtn').attr('oper', 'set').prev('.mutualBtn').remove();
                            } else if (oper == 'set') {
                                if (state == 1) {
                                    _this.removeClass('addBtn').addClass('cancelBtn').attr('oper', 'unset').prev('.mutualBtn').remove();
                                } else if (state == 2) {
                                    _this.removeClass('addBtn').removeClass('cancelBtn').attr('oper', 'unset').html('取消关注').before('<a  class="mutualBtn"></a>');
                                } else if (state == 0) {
                                    _this.removeClass('addBtn').removeClass('cancelBtn').attr('oper', 'unset').html('取消关注').before('<a  class="mutualBtn"></a>');
                                }
                            }
                        } else if (data.error == -1) {
                            $.loginTips();
                            _this.bind('click', bindAttention);
                            return false;
                        } else {
                            $.tipCommon(data.msg, 'error', 1500);
                            _this.bind('click', bindAttention);
                            return false;
                        }
                        _this.bind('click', bindAttention);
                        return false;
                    },
                    error:function () {
                        _this.bind('click', bindAttention);
                        $.tipCommon('网络错误', 'error', 1500);
                    }
                });
            });
    };

    var lastUid, uidList = [], elCache = $("<div></div>");

    $.fn.layerTips = function (opts) {
        defaultOpts = {
            dataArgument:'uid',
            minWidth:304,
            minHeight:170,
            url:'/user/daren/?_ajax_=info'
        }
        var opts = $.extend(defaultOpts, opts || {});
        var info_Tips = $('.layer_wrap');
        if (info_Tips.length == 0) {
            $('<div class="layer_wrap" style="position:absolute;display:none;z-index:9999"></div>').appendTo('body');
            info_Tips = $('.layer_wrap');
        }
        var layerTimeout = null;
        $(this).each(function () {
            var _this = $(this), layerstr = '';
            $(this).hover(function () {
                clearTimeout(layerTimeout);
                info_Tips.hide();
                layerTimeout = setTimeout(function () {
                    var fid = _this.attr(opts.dataArgument);
                    if (!fid) {
                        return false;
                    }
                    showTips();
                }, 300);
                //显示提示浮动
                function showTips() {
                    var fid = _this.attr(opts.dataArgument);
                    if (lastUid && uidList[lastUid]) {
                        uidList[lastUid].appendTo(elCache);
                        info_Tips.html('');
                    } else {
                        info_Tips.html('');
                    }
                    lastUid = fid;
                    if (uidList[fid]) {
                        uidList[fid].appendTo(info_Tips);
                        setOffSet();
                    } else {
                        info_Tips.html('<div class="attention_layer"><div class="attention_wrap"><img src="/images/loading.gif" style="float:left;" alt="" /><em style="float:left;padding-top:10px">正在加载，请稍侯....</em></div><i class="layer_arrow "></i></div>');
                        setOffSet();
                        $.ajax({
                            url:opts.url,
                            dataType:'json',
                            data:opts.dataArgument + '=' + fid,
                            type:'GET',
                            cache:false,
                            success:function (data) {
                                layerstr = '';
                                if (data.error == 0) {
                                    layerstr += "	<div class='attention_layer'>";
                                    layerstr += "			<div class='attention_wrap'>";
                                    layerstr += "				<a href='" + data.url + "' class='layer_img'><img src='" + data.avatar_small + "' alt='' /></a>";
                                    layerstr += "				<div class='attention_info'>";
                                    var medals_str = "";
                                    if (data.medals.length > 0) {
                                        for (var u = 0; u < data.medals.length; u++) {
                                            if (data.medals[u].icon_url != '') {
                                                medals_str += "<img title='" + data.medals[u].name + "' class='vip_icon' src='" + data.medals[u].icon_url + "'>";
                                            }
                                        }
                                    }
                                    layerstr += "					<div class='attention_ico'><a href='" + data.url + "' class='aid'>" + data.nickname + "</a>" + "<div class='vip_icon_wrap'>" + medals_str + "</div></div>";

                                    layerstr += "					<p><span class='gray_f1'>";
                                    layerstr += "						" + data.birthday;
                                    layerstr += "					</span>";
                                    layerstr += "						" + data.skin_hair_type;
                                    layerstr += "					</p>";
                                    layerstr += "				</div>";
                                    layerstr += "			</div>";
                                    if (data.show_attention) {
                                        layerstr += "			<div class='addBtn_wrap'>";
                                        layerstr += "				<a href='javascript:;'  class='attention_btn " + (data.frends == "Y" ? "cancelBtn" : "addBtn") + "' fid='" + $.trim(fid) + "' state='1' oper='" + (data.frends == "Y" ? "unset" : "set") + "'>立即关注</a>";
                                        layerstr += "			</div>";
                                    }
                                    layerstr += "			<i class='layer_arrow'></i>";
                                    layerstr += "		</div>";
                                    layerstr += "";
                                    uidList[fid] = $($.trim(layerstr));
                                    info_Tips.html('');
                                    uidList[fid].appendTo(info_Tips);
                                    info_Tips.hide();
                                    setOffSet();
                                    uidList[fid].find(".attention_btn").attention();
                                } else {
                                    $.tipCommon(data.msg, 'error', 1500);
                                }
                            },
                            error:function () {
                                info_Tips.html('加载失败，请刷新重试');
                            }
                        });
                        // end ajax
                    } // end else
                }

                //showTips END
                //设置位置
                function setOffSet() {
                    var info_Tips_w = info_Tips.width(), info_Tips_h = info_Tips.height(), l = false, r = false, t = false, b = false, arrow = 'layer_arrow_l', scrollTop = $(window).scrollTop(), scrollLeft = $(window).scrollLeft(), _offset = _this.offset(), offsetTop = _offset.top - scrollTop, offsetLeft = _offset.left - scrollLeft;

                    if (offsetLeft + 26 > info_Tips_w && offsetLeft + 26 > opts.minWidth) {
                        offsetLeft = offsetLeft - info_Tips_w + 26 + _this.width() / 2;
                        l = true;
                    } else {
                        offsetLeft = offsetLeft + _this.width() - 26;
                        r = true;
                    }
                    if (offsetTop + 15 > info_Tips_h && offsetTop + 15 > opts.minHeight) {
                        offsetTop = offsetTop - info_Tips_h - 15;
                        t = true;
                    } else {
                        offsetTop = offsetTop + _this.height() + 15;
                        b = true;
                    }
                    if (l === true && b === true) {
                        arrow = 'layer_arrow_bl';
                    } else if (r === true && t === true) {
                        arrow = 'layer_arrow_r';
                    } else if (r === true && b === true) {
                        arrow = 'layer_arrow_br';
                    }
                    $('.layer_arrow').attr('class', 'layer_arrow ' + arrow);
                    info_Tips.css({
                        'left':offsetLeft + scrollLeft,
                        'top':offsetTop + scrollTop,
                        'display':'block'
                    });
                }

            }, function () {
                clearTimeout(layerTimeout);
                layerTimeout = setTimeout(function () {
                    info_Tips.hide();
                }, 300);
            });
        });
        // end hover
        info_Tips.hover(function () {
            clearTimeout(layerTimeout);
            info_Tips.show();
        }, function () {
            info_Tips.hide();
        });
    }
    // end extend
})(jQuery);

(function ($) {
    $.extend({
        //提示信息插件 state:error warn success
        tipCommon:function (tipstr, state, time) {
            var stylestr = '';
            if (document.body.style.maxHeight == undefined) {
                stylestr = 'style="position:absolute;top:' + Math.ceil($(window).scrollTop() + $(window).height() * 0.45) + 'px"';
            }
            if ($('#tips_mod').length > 0) {
                $('#tips_mod').find('em').attr('class', 'tips_' + state).html(tipstr);
            } else {
                $('body').append('<div id="tips_mod" ' + stylestr + '><strong><i>&nbsp;</i><em class="tips_' + state + '">' + tipstr + '</em><i class="tips_rs">&nbsp;</i></strong></div>');
                $('#tips_mod').animate({
                    'margin-top':'0',
                    'opacity':'1'
                }, 500);
            }
            setTimeout("$('#tips_mod').fadeOut(500,function(){$(this).remove();})", time);
        },
        //获取喜欢数
        getLikeNum:function (objList) {
            if (!tid) {
                $(objList).html(0);
                return false;
            }
            $.ajax({
                url:siteurl + '/api/fav/list_' + tid + '_1_1_0.json?callback=?',
                type:'GET',
                dataType:'jsonp',
                success:function (data) {
                    var num = data.data.row_count ? data.data.row_count : 0;
                    //$('.my_like').html('<i></i>喜欢（' + num + '）');
                    $(objList).html(num);
                },
                error:function () {
                    $.tipCommon('获取喜欢列表失败', 'error', 1500);
                }
            });
        },
        //获取喜欢的状态和产品被喜欢总数,productId为产品ID，UID为用户ID，当UID为空时，只返回产品被喜欢总数，否则将返回产品被喜欢总数和当前产品被该用户的状态
        favInfo:function (productIdList, callback) {
            if (!productIdList) {
                return;
            }
            var url = siteurl + '/api/fav/info_' + productIdList + '_0.json';
            if (uid) {
                url = siteurl + '/api/fav/info_' + productIdList + '_' + uid + '.json';
            }
            $.ajax({
                url:url,
                type:'GET',
                dataType:'jsonp',
                success:function (data) {
                    $.getLikeJsonp = true;
                    callback.call(this, data);
                }, error:function () {
                    $.tipCommon('获取喜欢数据失败', 'error', 1500);
                }
            });
            return false;
        }
    });
    //获取喜欢数据和状态，需要在绑定元素上设置pid=“产品ID”,用于处于用户喜欢的状态，包括已喜欢和未喜欢
    $.fn.likeBtn = function () {
        //获取喜欢数据和状态
        var _this = $(this), btnList = [], pidList = _this.map(function () {
            var btnObj = btnList[$(this).attr('pid')];
            if (btnObj) {
                btnList[$(this).attr('pid')][btnObj.length] = $(this);
            } else {
                btnList[$(this).attr('pid')] = [];
                btnList[$(this).attr('pid')][0] = $(this);
            }
            // btnList[$(this).attr('pid')] = $(this);
            return $(this).attr('pid');
        }).get().join(",");
        var curBtn = null;

        function likeNumFormat(btn, num) {
            btn.attr('title', num);
            if (num && num.toString().length > 5) {
                num = num.toString().substring(0, 2) + 'w+';
                btn.css({'font-size':'11px'});
            } else if (num && num.toString().length > 4) {
                num = num.toString().substring(0, 1) + 'w+';
            }
            return num;
        }

        $.favInfo(pidList, function (data) {
            for (likeItem in data.data) {
                var u = 0;
                curBtn = btnList[likeItem];
                if (curBtn) {
                    var btnLen = curBtn.length;
                    for (u; u < btnLen; u++) {
                        curBtn[u].html(likeNumFormat(curBtn[u], Math.ceil(data.data[likeItem].fav_number)));
                        if (data.data[likeItem].is_fav === true) {
                            curBtn[u].addClass('liked_btn');
                        }
                    }
                }

            }
        });
        var likeOper = function () {
            if (!uid) {
                $.loginTips();
                return false;
            }
            var _this = $(this), pid = _this.attr('pid'), like_num = _this.attr('title');
            _this.attr('disabled', true).unbind('click', likeOper);
            if (!pid) {
                $.tipCommon('产品ID不存在', 'error', 1500);
                return false;
            }
            var likeTimeout = setTimeout(
                function () {
                    _this.html('<img src="/images/loading.gif" style="width: 18px;height:18px; margin-top: 1px; margin-left: 4px;" />');
                }, 300);

            var url = siteurl + '/api/fav/add_' + pid + '_' + uid + '.json', iscancel = false;
            if (_this.hasClass('liked_btn')) {
                url = siteurl + '/api/fav/del_' + pid + '_' + uid + '.json';
                iscancel = true;
            }
            $.ajax({
                url:url,
                type:'GET',
                dataType:'jsonp',
                success:function (data) {
                    clearTimeout(likeTimeout);
                    _this.bind('click', likeOper);
                    _this.removeAttr('disabled');
                    if (data.is_ok == "yes") {
                        if (iscancel) {
                            _this.removeClass('liked_btn');
                            _this.html(likeNumFormat(_this, Math.ceil(like_num) - 1));
                        } else {
                            _this.addClass('liked_btn');
                            _this.html(likeNumFormat(_this, Math.ceil(like_num) + 1));
                        }
                    } else {
                        $.tipCommon(data.msg, 'warn', 1500);
                    }
                },
                error:function () {
                    _this.bind('click', likeOper);
                    _this.removeAttr('disabled');
                    $.tipCommon('喜欢操作失败', 'error', 1500);
                }
            });
            return false;
        }
        //喜欢按钮上需要设置pid参数，值为该产品ID，如pid="15"
        $(this).bind('click', likeOper);
    };
    $.fn.usefulBtn = function (callback) {
        var userfulOper = function () {
            var _this = $(this), rid = _this.attr('rid'), userinfo = _this.attr('userinfo'), usefulnum = _this.html();
            if (!rid) {
                $.tipCommon('口碑报告ID不存在', 'error', 1500);
                return false;
            }
            _this.attr('disabled', true);
            _this.unbind('click', userfulOper);
            var usefulTimeout = setTimeout(function () {
                _this.html('<img src="/images/loading.gif" style="width: 18px;height:18px; margin-top: 1px; margin-left: 4px;" />');
            }, 200);

            var url = '/review?_ajax_=useful';
            $.ajax({
                dataType:'json',
                type:'POST',
                data:{
                    'report_id':rid,
                    'userinfo':userinfo
                },
                url:url,
                success:function (data) {
                    clearTimeout(usefulTimeout);
                    if (data.error == 0) {
                        _this.html(Number(usefulnum) + 1);
                        if (callback) {
                            callback.call(_this, data);
                        }
                    } else if (data.error == -1) {
                        $.loginTips();
                    } else if (data.error !== 0) {
                        _this.html(usefulnum);
                        $.tipCommon(data.msg, 'success', 1500);
                    }
                    _this.bind('click', userfulOper);
                    _this.removeAttr('disabled');
                    return false;
                },
                error:function () {
                    _this.bind('click', userfulOper);
                    _this.removeAttr('disabled');
                    $.tipCommon('网络错误！', 'error', 1500);
                }
            });
            return false;
        }
        //有用按钮上需要设置rid属性，该值为口碑报告ID
        this.bind('click', userfulOper);

    };
    //当页面中存在喜欢和关注时初始化其方法
    var like_num = $('.like_num,.like_btn'), attention_btn = $('.addBtn,.cancelBtn'), like_btn = $('.like_btn');
    //获取喜欢的统计
    if (like_num.length > 0) {
        $.getLikeNum(like_num);
    }
    //初始化关注
    if (attention_btn.length > 0) {
        attention_btn.attention();
    }

    if (like_btn.length > 0) {
        like_btn.likeBtn();
    }

	$(function(){
		//加入收藏
		$("a[rel='sidebar']").click(function(e) {
			if(!window.sidebar){
				try{
					external.addFavorite(this.href, this.title);
				}catch(e){
					$.tipCommon("加入收藏失败，请按Ctrl+D进行添加", 'warn', 4500);
				}
				return false;
			}
		}); 

		//回到顶部
		if (window.notShowBackToTop) {
			$('.back_to_top').remove();
		} else {
			$(".back_to_top .to_top_btn").click(function(e) {
				$("html, body").animate({
					scrollTop: 0
				}, "slow");
				return false;
			});
		}
	});

	//回到顶部与登录引导的显示隐藏
	$(window).scroll(function(e) {
		$(".back_to_top, .login_guide_pos").toggle($(window).scrollTop() > 1000);
	});

    $.fn.scrollSpy = function (options) {
        //defaults options
        var defaults = {
            min:0,
            mode:'vertical',
            max:0,
            container:window,
            onEnter:function () {
            },
            onLeave:function () {
            },
            onTick:function () {
            }
        };
        $.fn.scrollSpy.flag = true;
        var opts = $.extend({}, defaults, options);
        return this.each(function () {
            var $this = $(this);
            var container = $(opts.container).eq(0);
            $this.enters = $this.leaves = 0;
            $this.max = opts.max;
            if ($this.max == 0) {
                var x = container.scrollLeft();
                var y = container.scrollTop();
                this.max = opts.mode == 'vertical' ? y : x;
            }
            /* make it happen */
            $this.inside = false;
            /*            container.bind({
             enter:opts.onEnter,
             leave:opts.onLeave,
             tick:opts.onTick
             });*/
            container.bind('scroll', function () {
                var position = {
                    x:container.scrollLeft(),
                    y:container.scrollTop()
                };
                var xy = opts.mode == 'vertical' ? position.y : position.x;
                if (xy >= opts.min && xy <= $this.max) {
                    /* trigger Enter event if necessary */
                    if (!$this.inside) {
                        /* record as inside */
                        $this.inside = true;
                        $this.enters++;
                        /* fire enter event */
                        /*$this.trigger('enter',[position,$this.enters]);*/
                        if (opts.onEnter)
                            opts.onEnter(position, $this.enters);
                    }
                    /* trigger the "tick", always */
                    //$this.trigger('tick',[position,$this.inside,$this.enters,$this.leaves]);
                    if (opts.onTick)
                        opts.onTick(position, $this.inside, $this.enters, $this.leaves);
                }
                else {
                    /* trigger leave */
                    if ($this.inside) {
                        $this.inside = false;
                        $this.leaves++;
                        //$this.trigger('leave',[position,$this.leaves]);
                        if (opts.onLeave)
                            opts.onLeave(position, $this.leaves);
                    }
                }

            });
        });
    };
    //添加refer追踪
    window.referLnk = function (lnkList, parm) {
        lnkList.click(function () {
            _gaq.push(['_trackEvent', 'koubei', 'clicked', parm]);
        });
    }

    //JS截取字符串
    window.splitStr = function (txt, length) {
        if (txt === undefined || txt === null || !length) {
            return '';
        }
        var charLen = 0,splitAtLength = 0,isNeedSplit;
        for (var i = 0; i < txt.length; i++) {
            var c = txt.charCodeAt(i);//转换成字节
            if ((c >= 0x0001 && c <= 0x007e) || (0xff60 <= c && c <= 0xff9f)) {//单字节加1
                charLen++;
            } else {
                charLen += 2;
            }
            if (charLen <= length) {
                splitAtLength++;
            }else if(charLen>length+3){
                isNeedSplit = true;
                break;
            }
        }
        return isNeedSplit ? (txt.substring(0, splitAtLength) + "...") : txt;
    };
    //JS截取字符串 END
    //品牌图标经过遮罩JS
    $.fn.brandsHover = function () {
        return this.each(function () {
            $(this).hover(function () {
                var _this = $(this);
                var layerEl = _this.find('> div');
                if (!layerEl.length) {
                    var _tit = _this.find('img').attr('title') || '';
                    layerEl = $("<div class='rp_hf_brand_mark_wrap'><div class='mark_el'></div><div title='" + _tit + "'>" + splitStr(_tit, 16) + "</div></div>");
                    layerEl.prependTo(_this);
                }
                layerEl.show();
            }, function () {
                $(this).find("> div").hide();
            });
        });

    }
    //品牌图标经过遮罩JS END
    /*登录注册引导*/
    $(function () {
        if (!uid && !window.notShowLoginGuide) {
            var loginGuideHtml = $('<div class="login_guide_pos"><div class="main"><div class="lg_l">近' + koubei_number + '篇产品口碑帮你找到最合适的美妆！<br>近' + product_number + '件美妆产品伴你一年四季扮靓里程！</div><div class="lg_c"><a href="' + siteurl + 'i/account/signup?from=koubei" class="lg_big_btn">注册</a><a href="' + siteurl + 'i/account/login?from=koubei" class="lg_big_btn">登录</a></div><div class="lg_r"><div>或用以下账号登陆：</div><div><a class="qq" href="' + siteurl + 'i/extconnect/?site_name=cb_qq&amp;redirect=http%3A%2F%2Fchanglnew.koubei.jumeicd.com%2F"><span>QQ</span></a><a href="' + siteurl + 'i/extconnect/?site_name=sina_weibo&amp;redirect=http%3A%2F%2Fchanglnew.koubei.jumeicd.com%2F" class="sina"><span>新浪微博</span></a><a href="' + siteurl + 'i/extconnect/?site_name=renren&amp;redirect=http%3A%2F%2Fchanglnew.koubei.jumeicd.com%2F" class="renren"><span>人人网</span></a></div></div><a href="#" class="lg_close_btn"></a></div></div>');
            loginGuideHtml.appendTo($("body")).find(".lg_close_btn").click(function () {
                loginGuideHtml.remove();
				return false;
            });
        }
    });
})(jQuery);