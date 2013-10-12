(function($){
	var msie = (function(w,d){return ("XMLHttpRequest" in w ? d.querySelector ? d.documentMode : 7 : 6)})(this,this.document),
		minWidth = msie < 7 ? "width" : "minWidth",
		selectQueue;

	function create(className, nodeName){
		return $("<" + ( nodeName || "div" ) + "/>").addClass(className);
	}

	if( msie < 8 ) {
		function fixie(selectui, select){
			if(selectui.find(".select_menu_ui").length){
				return;
			}
			selectui.bind("selectstart", function(e){
				e.stopImmediatePropagation();
				return false;
			}).click(function(e) {
				var menu = selectui.find(".select_menu_ui");
				if( menu.position().left < 0 ) {
					showMenu(selectui, menu, select);
				} else {
					hideMenu(selectui, menu);
				}
				selectui.addClass("select_focus_ui");
			});
			$(select).focus(function(){
				selectui.addClass("select_focus_ui");
			}).blur(function(e) {
				hideAll();
			});

			createMenu(selectui, select);

		}

		//建立下拉菜单
		function createMenu(selectui, select){
			return createOpts(create("select_menu_ui"), select).appendTo(selectui).hover(function(){
				$(this).width(this.clientWidth);
			},function(){
				$(this).width("");
			});
		}

		//建立下拉菜单中的选项
		function createOpts(menu, select){
			menu.html("");
			$.each(select.options, function(i){
				var option = this;
				create("option_ui").html(option.innerHTML + "&nbsp;").click(function(e) {
					if(option.disabled){
						return false
					} else {
						select.selectedIndex = i;
						$(select).trigger("change");
					}
				}).bind("mouseenter", function(e) {
					option.disabled || $(this).addClass("option_hover_ui").siblings().removeClass("option_hover_ui");
				}).css({
					color: option.disabled ? "gray" : ""
				}).appendTo(menu);
			});
			menu.children().eq(select.selectedIndex).addClass("option_hover_ui");
			return menu.css("left", "-99999em");
		}

		//除not外，关闭所有select
		function hideAll(not){
			var tag = $(".select_ui");
			if(not){
				tag = tag.not(not);
			}
			tag.each(function(i) {
				var selectui = $(this);
				selectui.removeClass("select_focus_ui");
				hideMenu(selectui);
			});
		}

		//关闭指定的select下拉菜单
		function hideMenu(selectui, menu){
			selectui.css({zIndex: ""});
			( menu || selectui.find(".select_menu_ui") ).css("left", "-99999em");
		}

		//显示下拉菜单
		function showMenu(selectui, menu, select){
			hideAll(selectui);
			createOpts(menu, select);
			selectui.css({zIndex: 0xffff});
			menu.css({left: 0});
		}

		//页面点击除select_ui外任意位置，关闭下拉菜单
		$(document).click(function(e){
			hideAll($(e.target).closest(".select_ui"));
		});

	}

	function modifyText(select){
		//select方式变化时，写入当先选择项文本
		var index = select.selectedIndex,
			text = index < 0 ? "" : select.options[index].innerHTML,
			textdiv = $(select).prev(".select_text_ui");
		if(!textdiv.length){
			textdiv = create("select_text_ui").insertBefore(select);
		}
		text = text || "&nbsp;"
		if(textdiv.html() != text ){
			textdiv.html(text);
		}
		//计算select宽度
		var length = 0;
		$.each(select.options, function(){
			var text = this.label || this.innerText || this.textContent || this.innerHTML,
				width = text.match(/[u0000-u00FF]/g);
			width = text.length - (width ? width.length / 2 : 0) + 0.5;
			length = Math.max(width, length);
		});
		length += "em";

		if( msie < 7 && document.readyState == "complete" ){
			textdiv.css( minWidth, "" );
			if(textdiv.css( minWidth) != "auto" ){
				return;
			}
		}
		if (textdiv.css( minWidth ) != length) {
			textdiv.css( minWidth, length );
		}
	}

	//不支持propertychange事件的浏览器(除IE6、7、8、9外)中使用定时器来刷select文字
	function startInterval(select){
		if(selectQueue){
			selectQueue.push(select);
		} else {
			selectQueue = [select];
			(function(){
				$.each(selectQueue, function(){
					//解决bug，火狐下selectIndex会随菜单项滑动而变化
					if(!(window.netscape && document.activeElement == this)){
						modifyText(this);
					}
				});
				setTimeout(arguments.callee, 200);
			})();
		}
	}

	$.fn.selectui = function(){
		return this.each(function(){

			var modifyTextTimer,
				select = $(this),
				selectui = select.closest(".select_ui");

			//给select标签加包裹
			if(!selectui.length){
				selectui = create("select_ui", "span");
				selectui.insertAfter(select).append(create("select_arrow")).append(select);
			}

			//监听可能改变select选中项的事件
			select.bind("change propertychange DOMAttrModified DOMNodeInserted DOMNodeRemoved keypress", function(e){
				//利用定时器过滤多次事件触发，短时间内只运行最后一次
				clearTimeout(modifyTextTimer);
				var select = this;
				modifyTextTimer = setTimeout(function(){
					modifyText(select);
				}, e.type == "propertychange" ? 200 : 10);
			}).each(function(){
				modifyText(this);
			});
			if( msie < 8 ) {
				//IE6、7中模拟select，并非原生
				fixie(selectui, this);
			} else {
				//其他浏览器添加焦点态样式即可
				select.focus(function(e){
					selectui.addClass("select_focus_ui");
				}).blur(function(e) {
					selectui.removeClass("select_focus_ui");
				});
			}
			
			//解决初始化样式后，其他js又修改select选项
			if( "onpropertychange" in select[0] ){
				//IE6、7、8、9下延迟触发一次propertychange，避免初始化后其他js为select单纯增加Option但未去修改selectIndex，从而未触发propertychange事件
				select.triggerHandler("propertychange");
			} else {
				//高端浏览器性能有富余，每隔200毫秒检查一次
				startInterval(select[0]);
			}
		});
	};

})(jQuery);
