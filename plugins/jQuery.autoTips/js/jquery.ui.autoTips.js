//jQuery.ui.autoTips.js
;
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
            _this.tempVal=_this.val();
            (function (opts) {
                var tipsID, li_list;
                _this.keydown(function (event) {
                    var key = event.which;
                    tipsID = $('#' + opts.tipsID), li_list = tipsID.find('li');
                    if (key == 13) {//回车
                        if (tipsID.is(':visible')) {
                            _this.val(li_list.eq(getCurIndex(li_list, key, opts)).html());
                            tipsID.hide();
                            event.preventDefault();
                            return false;
                        }
                    } else if (key == 40 || key == 38) {//上下键输入38为上，40为下
                        if (tipsID.is(':visible')) {
                            var cur_item = li_list.eq(getCurIndex(li_list, key, opts));
                            cur_item.addClass('tips_hover').siblings().removeClass('tips_hover');
                            _this.val(cur_item.html());

                        }
                        event.preventDefault();
                    } else if (key != 13 && key != 40 && key != 38) {//获取数据
                        clearTimeout(_this.searching);
                        _this.searching = setTimeout(function () {
                            var txtVal = _this.val();
                            if (_this.tempVal=== txtVal || $.trim(txtVal) == "") {
                                tipsID.hide();
                                return false;
                            }
                            _this.tempVal== txtVal;
                            if (opts.type === 'email') {
                                var dataSource = $.isFunction(opts.dataSource) ? dataSource.call(this, opts) : opts.dataSource;
                                //根据输入重构提示内容列表
                                var _dataSource = [];
                                var prefix = txtVal.indexOf('@') != -1 ? txtVal.split('@')[0] : txtVal;
                                if (txtVal.indexOf('@') != -1) {
                                    var postfix = txtVal.split('@')[1];
                                    if (postfix != "") {
                                        for (var u = 0; u < dataSource.length; u++) {
                                            if (dataSource[u].indexOf(postfix) != -1) {
                                                _dataSource.push(dataSource[u]);
                                            }
                                        }
                                        _dataSource.unshift(dataSource[0], dataSource[1]);
                                    } else if (postfix == "") {
                                        _dataSource = dataSource;
                                    } else {
                                        _dataSource.unshift(dataSource[0], dataSource[1]);
                                    }
                                    _creatTipsElement(_dataSource, opts);
                                } else {
                                    _creatTipsElement(dataSource, opts);
                                }
                                //根据输入重构提示内容列表 END
                                li_list = tipsID.find('li');
                                li_list.each(function () {
                                    $(this).html(prefix + $(this).attr('data'));
                                }).eq(opts.defaultIndex).addClass('tips_hover').html(txtVal);
                            } else if ($.isFunction(opts.dataSource)) {
                                opts.dataSource.call(this, opts);
                            }//opts.type==='email' EMD
                        }, opts.delay);
                        if (opts.callback) {
                            opts.callback.call(this, opts);
                        }
                        tipsID.show();
                    }
                });
                //获取当前选中的提示项
                getCurIndex = function (li_list, keyCode, opts) {
                    var curIndex = li_list.index(tipsID.find('.tips_hover'));
                    if (keyCode == 40) {
                        curIndex += 1;
                    }
                    else if (keyCode == 38) {
                        curIndex -= 1;
                    }
                    if (curIndex >= li_list.length) {
                        curIndex = 0;
                    } else if (curIndex < 0) {
                        curIndex = li_list.length-1;
                    }
                    return curIndex;
                };
                //创建自动提示元素
                _creatTipsElement = function (dataSource, opts) {
                    $('#' + opts.tipsID).remove();
                    var width_style = "";
                    if (opts.autoWidth) {
                        width_style = 'style="width:' + _this.width() + 'px"';
                    }
                    tipsID = $('<div id="' + opts.tipsID + '" ' + width_style + ' ></div>'), list = [];
                    list.push('<ul>');
                    if (dataSource.length > 0) {
                        for (var i = 0; i < dataSource.length; i++) {
                            list.push('<li data="' + dataSource[i] + '">' + dataSource[i] + '</li>');
                        }
                    }
                    list.push('</ul>');
                    li_list = tipsID.append(list.join('')).find('li');
                    if (opts.type == 'email') {
                        li_list = tipsID.find('li:not(:first)');
                    } else if (opts.listCallback) {
                        $.each(opts.listCallback, function (name, fn) {
                            li_list.bind(name, function () {
                                fn.apply(this);
                            });
                        });
                    }
                    li_list.click(function () {
                        opts.inputObj.val($(this).html());
                        tipsID.hide();
                        if (opts.listClickCallback) {
                            opts.listClickCallback.call(this, opts);
                        }
                    }).hover(function () {
                            $(this).addClass('tips_hover');
                        }, function () {
                            $(this).removeClass('tips_hover');
                        });
                    $('body').append(tipsID);
                    tipsID.position({
                        my: "left top",
                        at: "left bottom",
                        of: opts.inputObj,
                        collision: "none"
                    }).hide();
                    if (opts.addClass) {
                        tipsID.addClass(opts.addClass);
                    }
                    tipsID.show();
                    opts.inputObj.blur(function () {
                        setTimeout(function () {
                            tipsID.hide();
                        }, 150);
                    });
                }; //_creatTipsElement END
                _updateTipsElement = function (dataSource, tipsID) {
                };//_updateTipsElement END
            })(opts);

        });
    }// autoTips END
    $.fn.autoTips.defaultOpts = {
        dataSource: [],
        listCallback: null,
        tipsID: 'tips',
        addClass: null,
        defaultIndex: 0,
        type: 'email',
        autoWidth: true,
        delay: 200
    };
})(jQuery);
//jQuery.ui.autoTips.js END