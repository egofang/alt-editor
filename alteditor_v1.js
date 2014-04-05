function alteditor(element,ini){
	//'use strict';
	return this.init(element,ini);
}



(function(){
	alteditor.prototype={
		

		ini:{
			para:'p',
			tags:["strong","small","del"],
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
			tab:function(){

			}
		},




		init: function(element,ini){
			this.element=element;
			egofn.updateJSON(this.ini,ini);
			this.ini.tags.push('a');

			if(!this.element.nodeType==1){console.log("not a HTMLElement , newalteditor failed!");return false;}
			else{ this.element.setAttribute("contenteditable","true");}
			this.bind();
			//this.bindImageUploader();
			return this;
		},






		range: function(){
			var egoRange;
			if (!window.getSelection) { //IE9以下浏览器
				return console.log('不兼容的js selection对象')
			}
			//node只考虑 element dom
            var egoRange = window.getSelection().getRangeAt(0);
            egoRange.startEle = egoRange.startContainer;
            egoRange.endEle = egoRange.endContainer;
            egoRange.atEnd = egoRange.startOffset==egoRange.startEle.textContent.length;
			egoRange.atStart = egoRange.startOffset==0;
            egoRange.inTag=egofn.AinB(egoRange.startContainer.tagName,this.ini.tags);
            egoRange.para = egoRange.startEle;

			//egoRange.crossTag=egoRange.startContainer!=egoRange.endContainer;

			while(!egoRange.startEle.tagName){
				egoRange.startEle=egoRange.startEle.parentNode;
			}
			while(!egoRange.endEle.tagName){
				egoRange.endEle=egoRange.endEle.parentNode;
			}
			console.log(egoRange.startEle);
			while( egoRange.para.tagName!=this.ini.para ){
				if(!egoRange.para.parentNode){ return '严重错误：range不在para中';}
				egoRange.para = egoRange.para.parentNode;
			}

			return egoRange;
		},







		on: function(tar,pos){
			var tarNode = arguments[0];
			var pos = arguments[1];
			if(!tarNode){
				tarNode = this.placeHolder();
				this.insert( tarNode );
				
				if( !this.range().isInLine ){
					var prevNode = tarNode.previousSibling;
					var nextNode = tarNode.nextSibling;
					if(prevNode && this.isTag(prevNode) ){
						this.element.removeChild(tarNode);
						tarNode = prevNode;
						pos = null;
						console.log('reset on prevNode');
					}else if(nextNode && this.isTag(nextNode) ){
						this.element.removeChild(tarNode);
						tarNode = nextNode;
						pos = true;
						console.log('reset on nextNode');
					}else{//前后都没有inline，只有新建了
						pos = 'all';
						console.log('reset on newNode');
					}
				}else{
					pos = 'all';
					console.log('reset on newNode');
				}
			}else{

			}

			var nr=rangy.createRange();
			nr.selectNode(tarNode);
			if(pos!="all"){nr.collapse(pos);}
			rangy.getSelection().setRanges([nr]);
			this.reRange();
			return tarNode;
		},










		insert: function(node,nobreakup){
			if(this.range().inTag){
				if( nobreakup ){
					this.range().insertNode(node);
				}else{
					this.range().insertBefore( node , this.breakup() );
				}
			}else{
				this.range().insertNode(node);
			}
		},






		//返回 sliced right element(in ini.tags)
		breakup: function(breakPara){

			var rEle;
			if(this.range().atStart){ rEle = this.range().startEle; }
			else if(this.range().atEnd){ rEle = this.range().endContainer.nextSibling; }
			else{	//range 在tag中间
				var lNode=this.range().startEle;
				var rNode=document.createElement(lNode.tagName);
					this.range().setEndAfter(lNode.lastChild);
				    rNode.textContent = this.range().toString();
				this.element.insertBefore(rNode,lNode.nextSibling);
				this.range().deleteContents();
				rEle = rNode;
			}
			
			if( breakPara ){//要换行新增 para
				var newPara = document.createElement(this.ini.para);
				this.element.insertBefore( newPara , this.range().para.nextSibling );
				newPara.appendChild(rEle);
				while( rEle.nextSibling ){
					newPara.appendChild(rEle.nextSibling);
					rEle = rEle.nextSibling ;
					this.range().para.removeChild(eEle.previousSibling);
				}
				this.range().para.removeChild(eEle);
			}
			return rEle;
		},






//------------------------------------------------------------------------------------------------------------------------------------





		bind: function(){
			var self=this;
			this.element.addEventListener("keydown",function(e){
				switch (egofn.keyCode(e)){
					//tab
					case 9:		egofn.banEvent(e);
								self.tab(e);
								break;
					//回车
					case 13:	egofn.banEvent(e);
								if(!self.range().collapsed){ break; }
								self.breakLine();
								break;
					//ctrl+s
					case 83:	if(e.ctrlKey || e.metaKey){  egofn.banEvent(e);self.ini.save(); }
								break;
					default:    if(!self.range().isInLine){ console.log('fuck');self.on(); }
				}
			});

			this.element.addEventListener("keyup",function(e){
				switch (egofn.keyCode(e)){
					//回删
					case 8:     if(!self.range().isInLine){ self.on() }
								else if(self.range().startContainer.textContent.length < 2){ egofn.banEvent(e);self.fixRetainStyle(e); }
								break;

					//alt切换样式
					case 18:
						egofn.banEvent(e);
						//if( self.range().toString().length>0 && self.range().toString()!=self.ini.spoor ){ self.link(); }
						if(self.range().collapsed){ self.toggleTag(); }
						break;
				  	//Esc
				  	case 27:
						egofn.banEvent(e);
						if( self.range().toString().length<1 || self.range().toString()==self.ini.spoor ){ self.changeTextTag(); }
						break;
					default: ;
				}
			},false);

		},





//------------------------------------------------------------------------------------------------------------------------------------





		toggleTag: function(tarTag){
			if(!tarTag){
				if( !this.range().inTag || parseInt(this.range().inTag)==(this.ini.tags.length-2) ){ tarTag = this.ini.tags[0] }
				else{
					tarTag = this.ini.tags[parseInt(this.range().inTag)+1];
				}
			}

			tarTag = tarTag ? tarTag : this.ini.tags[0];
			var oriText = this.range().collapsed ? this.ini.spoor : this.range().toString();
			var newNode=document.createElement(tarTag);
				newNode.textContent=oriText;
			this.range().deleteContents();
			this.insert(newNode);
			this.on(newNode,"all");
			//this.clearInvalidNodes(this.element,[newNode]);
			return newNode;
		},

























//------------------------------------------------------------------------------------------------------------------------------------

		isTag: function(node){
			return egofn.AinB(node.tagName,this.ini.tags);
		},

	}






})();