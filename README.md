alt-editor
==========

A <b>wysiwyg</b> content editor base on html5 contenteditable &amp; js range object.
Make all inputs into HTML Element.


<h2>features</h2>
<pre>
<b>Change Input Style</b>:	alt/option key
<b>Reset Input Style</b>: 	Esc key
</pre>





<h2>Usage</h2>

Include
<a href='http://rangy.googlecode.com/svn/trunk/currentrelease/rangy-core.js'>rangy-core.js</a>
<a href='http://egofang.com/lib/client/egofn.js'>egofn.js</a>
And the <b>alteditor.js</b> 
in your code.


For instance, u want to transfer element<b>#zone</b> into an alt-editor.
<pre>
<code>
  var editor = new alteditor(document.getElementById('zone'),{
      	//here is all the options for normal use
     	inline:["strong","small","del"],  // tagName of elements avalible in editor
	spoor:"F",  //placeholder when toggle tags
	save:function(){	//ctrl+s will trigger save function
		console.log("save hasn't customed");return false;
	},
	lineBreaker:function(){ //node to insert when break line
		return document.createElement('br');
	},
	// uploader:null,  under coding
	// maxImgWidth:540,
	// maxImgHeight:540,
  });
</code>
</pre>



<h2>Broswer Support</h2>
Not test right now.
