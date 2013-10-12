/*!
 * jquery.scrollLoading.js
 * 图片/非图片滚动加载、懒加载，图片地址异常处理
 * 二次调用会直接加载图片和触发回调
 * by zhangxinxu  http://www.zhangxinxu.com
 * 2010-11-19 v1.0
 * 2012-01-13 v1.1 偏移值计算修改 position → offset
 * 2012-09-25 v1.2 增加滚动容器参数, 回调参数
 * 2013-05-10	对象或图片按需动态加载，为图片提供error时回调接口
 * @param {Object} options
 * options.attr 
 * options.container {Object} 滚动条所在容器Element或jQuery对象或选择器，默认window
 * options.callback Element滚入视界时的回调，回调中this为Element
 * options.error 图片地址错误时回调，回调中this为Image
 * @return {Object} jQuery对象
 */
"use strict";
(function($) {
	//寄存错误的URL
	var urlErrs = {};

	//获取元素所在页面位置
	var getOffset = function(o){
		o = o.closest(":visible");
		if(o.length){
			return $.extend(o.offset(), {h: o.height()});
		}
	};

	//参数默认值声明
	var defaults = {
		attr: "data-url",
		container: $(window),
		callback: $.noop,
		error: function(){
			//onImgError为整站全局声明的图片异常处理
			onImgError(this);
		}
	};

	$.fn.scrollLoading = function(options) {
		var params = $.extend({}, defaults, options || {});
		params.cache = [];

		//触发回调函数
		var callback = function(call) {
			if ($.isFunction(params.callback)) {
				params.callback.call(call.get(0));
			}
		};

		//触发图片URL错误回调并记录URL
		var callerror = function(img, url) {
			if ($.isFunction(params.error)) {
				params.error.call(img.get(0));
			}
			if(url){
				urlErrs[url] = true;
			}
		};
	
		//检查图片url正确与否
		var waitImg = function(img, url){
			if(!url){
				url = img.attr("src");
				if(img.get(0).complete){
					var newimg = new Image();
					newimg.src = url;
					if(!newimg.width){
						callerror(img, url);
					}
					return;
				}
			}
			$(new Image()).error(function(){
				callerror(img, url);
			}).attr("src", url);
		};
		
		//动态显示数据
		var load = function(cache) {
			//查找视界位置
			var contHeight = params.container.height();
			if ($(window).get(0) === window) {
				contop = $(window).scrollTop();
			} else {
				contop = params.container.offset().top;
			}

			
			//检查元素是否在视界内
			$.each(cache, function(i, data) {
				var o = data.obj, tag = data.tag, url, post, posb, offset;
				if (o) {
					url = o.attr(params["attr"]);
					if(urlErrs[url]){
						callerror(o);
					} else if(offset = getOffset(o)){
						post = offset.top - contop, posb = post + offset.h;
						if ((post >= 0 && post < contHeight) || (posb > 0 && posb <= contHeight)) {
							//在浏览器窗口内
							data.obj = null;
							if (tag === "img") {
								if (url) {
									//图片，改变src
									o.attr("src", url);
									waitImg(o, url);
								} else if(o.attr("src")){
									waitImg(o);
								}
							}else{
								if (url) {
									o.load(url, {}, function() {
										callback(o);
									});
									return;
								}
							}
							// 触发回调
							callback(o);
						}
					}
				}
			});
		};
		
		var loading = function(){
			load(params.cache);
		};

		this.each(function() {
			var node = this.nodeName.toLowerCase();
			var me = $(this);
			
			//重组
			var data = {
				obj: me,
				tag: node
			};
			var loadFn = me.data("scrollLoading");
			if(loadFn){
				loadFn([data]);
			} else {
				me.data("scrollLoading", load);
				params.cache.push(data);
			}
		});

		//事件触发
		//加载完毕即执行
		if(params.cache.length){
			$(loading);
			//滚动执行
			params.container.bind("scroll resize", loading);
		}
		return this;
	};
})(jQuery);
