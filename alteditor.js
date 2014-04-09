// JavaScript Document
/*
*@import rangy-core.js
*@import egofn.js
*/
//egofn.descendantNodes_OF(rootNode[,nodeType])
egofn.descendantNodes_OF = function(rootNode){
	//if(rootNode.nodeType!=1){return false;}else 
	//if(!rootNode.childNodes){return null}
	var re=[],type=arguments[1]?arguments[1]:[1,2,3];
	function roll(c){
		for (i=0;i<c.childNodes.length;i++){
			if(egofn.AinB(c.childNodes[i].nodeType,type)){ re.push(c.childNodes[i]); }
			if(c.childNodes[i].childNodes.length>1){ roll(c.childNodes[i]) }; //??? infinit loops if length>0
		}
	}
	roll(rootNode);
	return re;
}


/*
bugs:
ctrl+v 粘贴竟然带格式！！(span)
换行 breakup inline rnode只有 一个字符时，再回删会先删除这个
*/



/*
*风险
*canvas.toDataUrl  仅chrome能实现输出 'image/jpeg' ?
*/

/********
***操作指南
***Alt 逐个切换字体
***选中文字 + Alt 添加链接
***CTRL + s 触发 save()
***Esc 切换到默认字体
*********/



function alteditor(element,options){
	//'use strict';
	return this.init(element,options);
}



(function(){
	//'use strict';

	alteditor.prototype={
		options:{
			inline:["strong","small","del"],
			spoor:"F",
			uploader:null,
			maxImgWidth:540,
			maxImgHeight:540,
			save:function(){	//ctrl+s will trigger save function
				console.log("save hasn't customed");return false;
			},
			lineBreaker:function(){
				return document.createElement('br');
			},
		},

		//空 inline Tag 占位符
		placeHolder: function(){
			var nb=document.createElement(this.options.inline[0]);
			nb.appendChild( this.Range.createContextualFragment("&zwnj;") );
			return nb;
		},

		init: function(element,options){
			this.element=element;
			egofn.updateJSON(this.options,options);
			this.options.inline.push('a');

			if(!this.element.nodeType==1){console.log("not a HTMLElement , newalteditor failed!");return false;}
			else{ this.element.setAttribute("contenteditable","true");}
			this.bindKeyAct();
			//this.bindImageUploader();
			//pasteWrapper
			
			this.pasteWrapper = document.createElement('input');
			this.pasteWrapper.setAttribute('type','text');
			this.pasteWrapper.style.width= 0 ;
			this.element.parentNode.insertBefore(this.pasteWrapper,this.element);

			return this;
		},



		range: function(){
			if (!window.getSelection) { 
				//IE9以下浏览器
				return console.log('不兼容的js selection对象')
			}
			return window.getSelection().getRangeAt(0);
		},


		//is a inline tag node
		isTag: function(node){
			return egofn.AinB(node.tagName,this.options.inline)
		},



		//获取当前指针位置
		coord: function(){
			var buttonHeight = 50,
	        boundary = this.range().getBoundingClientRect();
	        return {x:window.pageXOffset+boundary.left,	//相对文档
	        		y:window.pageYOffset+boundary.top,
	        		left:boundary.left,	//相对窗口
	        		top:boundary.top
	        	};
		},

































/*****************************************************************  Base functions  ***************************************************************************/
		//重定位光标
		reRange: function(){
			this.coord();
			this.Range=rangy.getSelection().getRangeAt(0).cloneRange();
			//rangy: this.Range.startContainer;
			while(!this.Range.startContainer.tagName){
				this.Range.startContainer=this.Range.startContainer.parentNode;
			}
			while(!this.Range.endContainer.tagName){
				this.Range.endContainer=this.Range.endContainer.parentNode;
			}
			this.Range.isInLine=egofn.AinB(this.Range.startContainer.tagName,this.options.inline);

			this.Range.crossTag=this.Range.startContainer!=this.Range.endContainer;
			this.Range.atEnd = this.Range.endOffset==this.Range.startContainer.textContent.length;
			this.Range.atStart = this.Range.startOffset==0;
		},



		//在光标处插入node
		//如果是<a>直接插入
		insert: function(node){
			if( this.Range.isInLine ){
				if( node.tagName ){
					var beforeN = this.Range.atEnd ? this.Range.endContainer.nextSibling : (
							this.Range.atStart ? this.Range.startContainer :
							this.breakup()
							);
					this.element.insertBefore( node , beforeN );
				}else{
					this.range().insertNode(node);
				}
			}else if( egofn.AinB(node.tagName,this.options.inline) ){
				this.range().insertNode(node);
			}
			this.reRange();
		},



		//分裂标签 , 返回 rNode(分裂出去新生成的)
		breakup: function(){
			if(this.Range.atStart){
				return this.Range.startContainer;
			}else if(this.Range.atEnd){
				return this.Range.endContainer.nextSibling;
			}
			var lNode=this.Range.startContainer;
			var rNode=document.createElement(lNode.tagName);
				this.Range.setEndAfter(lNode.lastChild);
			    rNode.textContent = this.Range.toString();
			this.element.insertBefore(rNode,lNode.nextSibling);
			this.Range.deleteContents();
			this.reRange();
			return rNode;
		},



		//on(obj node[,method])   method: true to start, 'all' to selectAll, else to end ,或者start 偏移量
		on: function(tarNode,pos){
			if(!tarNode){
				//try to on closest node
				var ph = this.placeHolder();	//需要在range处插入node，再通过相邻node获取。
				this.insert(ph);
				var prevNode = ph.previousSibling;
				var nextNode = ph.nextSibling;
				//console.log( this.Range.startContainer );
				//console.log(prevNode+'/'+nextNode);
				this.element.removeChild(ph);
				if( prevNode){
					this.on(prevNode);
				}else if( nextNode ){
					this.on(nextNode,true);
				}
				return 'auto on';
			}

			var nr=rangy.createRange();
			if( typeof pos == 'number' ){ //精确偏移
				console.log(pos)
				console.log(tarNode.textContent)
				nr.setStart(tarNode.firstChild ? tarNode.firstChild : tarNode, pos);
				nr.collapse(true);
			}
			else{
				nr.selectNode(tarNode);
				if(pos!="all"){nr.collapse(pos);}
			}

			rangy.getSelection().setRanges([nr]);
			this.reRange();
			return tarNode;
		},














































/*****************************************************************  Act functions  ***************************************************************************/
		bindKeyAct: function(){
			console.log('bindKeyAct');
			var self=this;
			this.element.addEventListener("keydown",function(e){
				self.reRange();
				//console.log(egofn.keyCode(e))
				switch (egofn.keyCode(e)){
					//回删
					case 8:     if(self.Range.startContainer.textContent.length < 2){ 
									self.clearTag(e);
								}
								if(!self.Range.isInLine){ self.on(); }
								break;
					//tab
					case 9:		egofn.banEvent(e);
								self.tab(e);
								break;
					//回车
					case 13:	egofn.banEvent(e);
								if(!self.Range.collapsed || self.Range.isInLine==self.options.inline.length-1){ break; }
								self.breakLine();
								break;
					//ctrl+s
					case 83:	if(e.ctrlKey || e.metaKey){  egofn.banEvent(e);self.options.save(); }
								break;

					default:    console.log(self.Range.isInLine)
								if(!self.Range.isInLine){
									self.clear();
									newNode = self.placeHolder();
									self.insert( newNode );
									self.on(newNode,'all');
								}
				}
			});

			this.element.addEventListener("keyup",function(e){
				self.reRange();
				switch (egofn.keyCode(e)){
					//Alt
					case 18:  	"value", egofn.banEvent(e);
								if( !self.Range.collapsed && self.Range.toString()!=self.options.spoor ){ self.link(); }
								else{ self.toggleTextTag(); } //else
								break;
				  	//Esc
				  	case 27: 	egofn.banEvent(e);
								if( self.Range.toString().length<1 || self.Range.toString()==self.options.spoor ){ self.changeTextTag(); }
								break;
					//default: ;
				}
			},false);


			//复制粘贴
			this.element.addEventListener(Sys.ie?"beforepaste":"paste",function(e){
				//egofn.banEvent(e);
				oriRange = self.range().cloneRange;
				self.pasteWrapper.focus();

				window.setTimeout(function(){
					//console.log(self.pasteWrapper.value);
					var pasteText = document.createTextNode(self.pasteWrapper.value);
					var node = self.Range.startContainer;
					var offset = self.Range.startOffset;
					self.on(node,offset);
					self.insert(pasteText);
					self.on(pasteText);
					self.clear();
				},0);
			});


			//鼠标动作
			this.element.addEventListener('mouseup',function(e){
				self.reRange();
				if( !self.Range.collapsed ){ console.log( self.coord() );}
			});
		},




		link: function(){
			if(this.Range.crossTag){ return console.log("can't add link to crossTag!");}
			var href = window.prompt("Add link to text:");
			if(!href){ return false;}

			var aTag = this.changeTextTag('a');
			aTag.setAttribute("href",href);
			aTag.setAttribute("target",'_blank');
		},

		tab: function(ee){
			var tab=this.Range.createContextualFragment("&nbsp;&nbsp;&nbsp;&nbsp;");
			var n=tab.lastChild;
			this.insert(tab);
			this.on(n);
		},



		//换行
		breakLine: function(e){
			if(this.Range.isInLine){ var nextNode = this.breakup(); }
			var br = this.options.lineBreaker()
			this.element.insertBefore( br , nextNode );

			if(!nextNode){
				var nextNode = this.placeHolder();
				this.element.insertBefore(nextNode,br.nextSibling);
			}
			this.on(nextNode,true);
		},
		
		

		//支持选中文本时更改Tag
		changeTextTag: function(tarTag){
			tarTag = tarTag ? tarTag : this.options.inline[0];
			var oriText = this.Range.collapsed ? this.options.spoor : this.Range.toString();
			var newNode=document.createElement(tarTag);
				newNode.textContent=oriText;
			this.Range.deleteContents();
			this.reRange();
			this.insert(newNode);
			this.on(newNode,"all");
			this.clear();
			return newNode;
		},



		toggleTextTag: function(){
			var tarTag;
			if( !this.Range.isInLine || parseInt(this.Range.isInLine)==(this.options.inline.length-2) ){ tarTag = this.options.inline[0] }
			else{
				tarTag = this.options.inline[parseInt(this.Range.isInLine)+1];
			}
			this.changeTextTag(tarTag);
		},



		clear: function(aN){
			console.log('clear')
			var nodes=egofn.descendantNodes_OF(this.element);
			for (i=0;i<nodes.length;i++){
				if(nodes[i].tagName){
					nodes[i].normalize();
					if(nodes[i].textContent.length<1 && nodes[i].tagName!=this.options.lineBreaker().tagName){
						nodes[i].parentNode.removeChild(nodes[i]);
					}
				}else{
					console.log(nodes[i]);
					nodes[i].parentNode.removeChild(nodes[i]);
				}
			}
			this.reRange();
		},

		
		//hack chrome下回删完整tag后样式残留问题，需程序删除node，并on。
		//及换行后删除
		clearTag: function(e){
			if(!this.Range.isInLine || this.Range.atStart){return false;}
			egofn.banEvent(e);
			console.log('clearTag');
			var currNode = this.Range.startContainer
			var prevNode = this.Range.startContainer.previousSibling;
			console.log(currNode.tagName)
			//if(prevNode && prevNode.tagName.toLowerCase()=='br' ){
				//this.on(prevNode.previousSibling);
				//this.element.removeChild(prevNode);
			//}
			this.element.removeChild(currNode);
			//this.on(prevNode);
			this.clear();
			this.reRange();
		},




















		/*
		bindImageUploader: function(){
			//添加图片(HTML5 DATA:URL)
			if(this.options.uploader){
				this.options.uploader.addEventListener('change',function(){
					//HTML5预览照片
					if(!this.options.uploader.files || !this.options.uploader.files[0]){console.log("this.options.uploader: no file choosen！");return;}
					
					var  _fN=this.options.uploader.files.length;
					for (_fn in this.options.uploader.files){  canvasIMG(this.options.uploader.files[_fn]);  }
					
					function canvasIMG(_fl){
						var _reader = new FileReader();
						_reader.readAsDataURL(_fl);
						_reader.onload = function (e) {	
							var _nIMG=new Image();
							_nIMG.src=e.target.result;
							_nIMG.onload=function(){
								var _w=_nIMG.width,_h=_nIMG.height;
								if(_w>this.options.maxImgWidth || _h>this.options.maxImgHeight){  if(_w>=_h){_h=_h*this.options.maxImgWidth /_w;_w=this.options.maxImgWidth }else{_w=_w*this.options.maxImgHeight/_h;_h=this.options.maxImgHeight}  }
								//借用canvas压缩图片
								var cv=document.createElement('canvas');
								cv.setAttribute('width',_w);
								cv.setAttribute('height',_h);
								//cv.setAttribute('class','picCanvas lasted');
								document.getElementById('picPool').appendChild(cv);	
								var _context=cv.getContext("2d");
								_context.drawImage(_nIMG,0,0,_w,_h);
								
								var img=document.createElement('img');
								img.src=cv.toDataURL('image/jpeg',0.9);
								reRange();
								this.addNodeAtCaret(img);
							}			
						}
					}	
				});
			}
			return this;
		},
		*/
	}
})();