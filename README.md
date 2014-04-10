alt-editor
==========

A <b>wysiwyg</b> content editor base on html5 contenteditable &amp; js range object.
Make all inputs into HTML Element.


##Quick look

See the live demo [alt-editor](http://egofang.com/lab/alt-editor/)


##features


- Change Input Style: **alt** key  
- Reset  Input Style: **esc** key



##Usage
Include [rangy-core.js](http://rangy.googlecode.com/svn/trunk/currentrelease/rangy-core.js) [egofn.js](http://egofang.com/lib/client/egofn.js) And the **alteditor.js** in your code.
For instance, u want to transfer element<b>#zone</b> into an alt-editor.


```javascript
var editor = new alteditor(document.getElementById('zone'),{
    inline:	["strong","small","del"],		// tagName of elements avalible in editor
	spoor: "F",  							//placeholder when toggle tags
	save: function(){ console.log("save hasn't customed");return false; },
											//ctrl+s will trigger save function
	lineBreaker: function(){ return document.createElement('br'); }
											//node to insert when break line.
});
```



<h2>Broswer Support</h2>
Not test right now.
