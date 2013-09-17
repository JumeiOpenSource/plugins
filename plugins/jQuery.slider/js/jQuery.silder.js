
(function($){
	$.fn.Slide=function(options){
		var opts = $.extend({},$.fn.Slide.deflunt,options);
		var index=0;
		var target=$("." + opts.claNav, $(this));//分页List父对象,如1,2,3,4的切换LIST的父对象
		var clickNext = $("." + opts.claNav + " .next", $(this));//点击下一个按钮
		var clickPrev = $("." + opts.claNav + " .prev", $(this));//点击上一个按钮
		var ContentBox = $("." + opts.claCon , $(this));//滚动的对象
		var ContentBoxNum=ContentBox.children().size();//滚动对象的子元素个数
		var slideH=ContentBox.children().first().height();//滚动对象的子元素个数高度，相当于滚动的高度
		var slideW=ContentBox.children().first().width();//滚动对象的子元素宽度，相当于滚动的宽度
		opts.slideTitle=$("." + opts.slideTitle, $(this));//幻灯片标题对象
		opts.imgList=ContentBox.children().find('img');//获取幻灯片的图片集合
		var autoPlay;
		var slideWH;
		if(opts.createPage==true && opts.effect!='scroolLoop' && opts.effect!='scroolTxt'){
			var pagestr='<i class="on">1</i>';
			for(var i=2;i<=ContentBoxNum;i++){
			  pagestr+="<i>"+i+"</i>";
		    }
			target.append(pagestr);
		}
		var targetLi = target.children();//分页对象的list
		if(opts.effect=="scroolY"||opts.effect=="scroolTxt"){
			slideWH=slideH;
		}else if(opts.effect=="scroolX"||opts.effect=="scroolLoop"){
			ContentBox.css("width",ContentBoxNum*slideW);
			slideWH=slideW;
		}else if(opts.effect=="fade"){
			ContentBox.children().first().css("z-index","1").siblings().css({'z-index':'0','opacity':'0'});
			opts.slideTitle.html(opts.imgList.eq(0).attr('alt'));
		}
		
		return this.each(function() {
			var $this=$(this);
			//滚动函数
			var doPlay=function(){
				if(opts.effect==='scroolLoop'){clickNext.click();return ;}
				$.fn.Slide.effect[opts.effect](ContentBox, targetLi, index, slideWH, opts);
				index++;
				if (index*opts.steps >= ContentBoxNum) {
					index = 0;
				}
			};
			clickNext.click(function(event){
				if(opts.autoPlay){
					clearInterval(autoPlay);
				}
				if(opts.loop){
					index=1;
					$.fn.Slide.effectLoop.scroolLeft(ContentBox, targetLi, index, slideWH, opts,function(){
						for(var i=0;i<opts.steps;i++){
		                    ContentBox.find("li:first",$this).appendTo(ContentBox);
		                }
		                ContentBox.css({"left":"0"});
					});
				}else{
					if ((index+1)*opts.steps < ContentBoxNum) {
							index++;
							clickPrev.removeClass('preend');
							$.fn.Slide.effectLoop.scroolLeft(ContentBox, targetLi, index, slideWH, opts,function(){
								if((index+1)*opts.steps >= ContentBoxNum){
									clickNext.addClass('nextend');
								}
							});
					}
					else{
						
					}
				}
				event.preventDefault();
				if(opts.autoPlay){
					autoPlay = setInterval(doPlay, opts.timer);
				}
			});
			clickPrev.click(function(event){
				if(opts.autoPlay){
					clearInterval(autoPlay);
				}
				if(opts.loop){
					index=1;
					for(var i=0;i<opts.steps;i++){
		                ContentBox.find("li:last").prependTo(ContentBox);
		            }
		          	ContentBox.css({"left":-index*opts.steps*slideW});
					$.fn.Slide.effectLoop.scroolRight(ContentBox, targetLi, index, slideWH, opts);
				}else{
					index--;
					if (index< 0) {
						index = 0;
					}else{
						clickNext.removeClass('nextend');
						$.fn.Slide.effectLoop.scroolLeft(ContentBox, targetLi, index, slideWH, opts,function(){
							if(index==0){
								clickPrev.addClass('preend');
							}	
						});
					}
				}
				event.preventDefault();
				if(opts.autoPlay){
					autoPlay = setInterval(doPlay, opts.timer);
				}
			});
			//自动播放
			if (opts.autoPlay) {
				autoPlay = setInterval(doPlay, opts.timer);
				ContentBox.hover(function(){
					if(autoPlay){
						clearInterval(autoPlay);
					}
				},function(){
					if(autoPlay){
						clearInterval(autoPlay);
					}
					autoPlay=setInterval(doPlay, opts.timer);
				});
			}
			
			//目标事件
			if(opts.effect!='scroolLoop'){
				targetLi.hover(function(){
					if(autoPlay){
						clearInterval(autoPlay);
					}
					index=targetLi.index(this);
					setTimeout(function(){$.fn.Slide.effect[opts.effect](ContentBox, targetLi, index, slideWH, opts);},200);
					
				},function(){
					if(autoPlay){
						clearInterval(autoPlay);
					}
					autoPlay = setInterval(doPlay, opts.timer);
				});
			}
    	});
	};
	$.fn.Slide.deflunt={
		effect : "scroolY",
		autoPlay:true,
		speed : "normal",
		timer : 1000,
		defIndex : 0,
		claNav:"JQ-slide-nav",
		claCon:"JQ-slide-content",
		steps:1,
		createPage:true,
		loop:true,
		slideTitle:'slideTitle'//幻灯标题对象
	};
	$.fn.Slide.effectLoop={
		scroolLeft:function(contentObj,navObj,i,slideW,opts,callback){
			contentObj.animate({"left":-i*opts.steps*slideW},opts.speed,callback);
			if (navObj) {
				navObj.eq(i).addClass("on").siblings().removeClass("on");
			}
		},
		
		scroolRight:function(contentObj,navObj,i,slideW,opts,callback){
			contentObj.stop().animate({"left":0},opts.speed,callback);
			
		}
	}
	$.fn.Slide.effect={
		fade:function(contentObj,navObj,i,slideW,opts){
			opts.slideTitle.html(opts.imgList.eq(i).attr('alt'));
			contentObj.children().eq(i).stop().animate({opacity:1},opts.speed).css({"z-index": "1"}).siblings().animate({opacity: 0},opts.speed).css({"z-index":"0"});
			navObj.eq(i).addClass("on").siblings().removeClass("on");
		},
		scroolTxt:function(contentObj,undefined,i,slideH,opts){
			//alert(i*opts.steps*slideH);
			contentObj.animate({"margin-top":-opts.steps*slideH},opts.speed,function(){
                for( var j=0;j<opts.steps;j++){
                	contentObj.find("li:first").appendTo(contentObj);
                }
                contentObj.css({"margin-top":"0"});
            });
		},
		scroolX:function(contentObj,navObj,i,slideW,opts,callback){
			contentObj.stop().animate({"left":-i*opts.steps*slideW},opts.speed,callback);
			if (navObj) {
				navObj.eq(i).addClass("on").siblings().removeClass("on");
			}
		},
		scroolY:function(contentObj,navObj,i,slideH,opts){
			contentObj.stop().animate({"top":-i*opts.steps*slideH},opts.speed);
			if (navObj) {
				navObj.eq(i).addClass("on").siblings().removeClass("on");
			}
		},
		fadeIn:function(opt){
		  opt=$.fn.extend({pageobj:$(this).find('>p'),timer:3500,auto:true},opt || {});
		  var _this=$(this),size=$("li",_this).length,pagestr='<i class="on">1</i>',pageobj=$(opt.pageobj),autoPlay =null,n = 0,t=null;
		  $('li',_this).eq(0).show().siblings().hide();
		  for(var i=2;i<=size;i++){
			  pagestr+="<i>"+i+"</i>";
		  }
		  pageobj.append(pagestr).children('i').click(function(){
			  clearInterval(t);
			  var i = $(this).text() - 1;
			  n = i;
			  if (i >= size) return;
			  $('li',_this).eq(i).fadeIn(800).siblings().fadeOut(500);
			  $(this).addClass('on').siblings().removeClass('on');
			  t = setInterval(autoPlay, opt.timer);
		  });
		  if(opt.auto){
			  autoPlay=function() {
				  //alert(1);
				  n = n >= (size - 1) ? 0: ++n;
				  $("i",_this).eq(n).trigger('click');
				  
			  }
			  t = setInterval(autoPlay, opt.timer);
			  $(_this).hover(function() {
				  clearInterval(t);
			  },
			  function() {
				  t = setInterval(autoPlay, opt.timer);
			  })
		  }
	  }// fadeIn END
};

})(jQuery);