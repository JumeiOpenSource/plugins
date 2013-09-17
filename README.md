## 聚美前端插件库

> 此插件库建立于2013年9月16日，用于积累和分享聚美前端团队的工作和研究成果。

## 使用须知

* 操作规范：每个插件采用专人负责制度，正常情况下只有此负责人可以负责修改此插件。
* 插件规范：每个插件有独立文件夹，里面含有插件源码（默认仅依赖jquery），以及demo。
* 命名和代码规范：采用聚美的前端开发规范。
* 每个人尽量使用自己的git账号，然后向此账号提交pull request，由管理员merge到主版本上。

## 插件目录介绍

    global ————为DEMO模版页面，公共的CSS,JS的目录，与插件本身无关
                base.css  ———— DEOM详情页的公共CSS
                demos.css ———— DEOM列表页的公共CSS
                
    demos ———— DEMO目录，里面以独立文件夹形式存在目录,每个插件所需CSS,JS,IMAGES，皆以文件夹形式存放于各自文件夹中
          
          index.html ———— 组件集合列表页，页面中存放所有插件的集合导航
          
          demoTemplate.html ———— DEMO详情页模版，所有DEOM页需按照模版要求制作。使用时，请将此页面复制到相应文件夹
                                 中修改即可。
               
               示例：
               
               jQuery.silder ———— 基于jQuery的幻灯组件
                     index.html ———— DEOM详情页
                            css ————  对应所需CSS
                            js ————  对应所需JAVASCRIPT
                        images ————对应所需images
                  

