function JSONtoString(object) {
	var results = [];
	for (var property in object){
		var value = object[property];
		if (value)results.push(property.toString() + ": " + value);}
		return "{" + results.join(", ") + "}";
}

var editor;
var currFilePath; // 현재 열린 파일의 path
$(document).ready(function(){
	$("#console").hide();
	var code = $(".codemirror-textarea")[0]; 
	 editor = CodeMirror.fromTextArea(code,{lineNumbers : true,   onChange: function(){editor.save();}, theme: "panda-syntax"}); 
	var $runBtn = $("#run");
	var $saveBtn = $("#save");
	var $userName = $(".username").val(); 
	$runBtn.click(function(){ var $code = editor.getValue();
	$.ajax({ type:"POST",
			url:"/runCode",
			data: {"code": $code,"path" : currFilePath},
			success: function(data){
				if(data.isErrorExist){
					$("#console").empty(); 
					$("#console").append(JSONtoString(data.err));
					$("#console").appendTo("#usersCode"); 
					$("#console").show(); console.log(data.err);
				} else if(!data.isErrorExist){
					$("#console").empty(); 
					console.log(data.results);
					data.results.forEach(function(item){
						$("#console").append(item+"<br>");
					});
					$("#console").appendTo("#usersCode");
					$("#console").show(); }
				else{ // c or c++ or python 파일이 아니면 
					$("#console").empty(); 
					$("#console").append("c,c++,python 파일이 아닙니다. ");
					$("#console").appendTo("#usersCode");
					$("#console").show(); 
				}
			},
			error: function(xhr,status, error){
				alert(error);
			}
		});
	});
	$saveBtn.click(function(){ var $code = editor.getValue();
		$.ajax({ type:"POST",
			url:"/saveCode",
			data: {"code": $code,"path" : currFilePath},
			success: function(){
				/*
				$("#console").empty(); 
				$("#console").append("저장되었습니다."); 
				$("#console").appendTo("#usersCode");
				$("#console").show();
				*/
			},
			error: function(xhr,status, error){alert(error);}});
	});


}); 
	

$(function(){
	
	var $chat = $('#chat');
	var $fileM = $('#fileM');
	var $chat_html = $('.chat');
	var $fileM_html = $('.fileM');
	var $userName = $(".username").val(); 
	var $userEmail = $(".useremail").val();
	
	var isFileMButtonClicked = false;
	var isChatButtonClicked = false;
	
	
	
	$chat.click(function (){ // todo: File Manager버튼 눌리면 none
		
		
		isChatButtonClicked = true;
		if(isFileMButtonClicked){ //파일 매니저 버튼 눌러있었으면

			if($('.chat.page').length){ //chat page라는 selector가 존재하면
				 $fileM_html.hide();
				 $chat_html.show();
			}
			else{

					$.get("chat.ejs", function (data) {
					$chat_html.append(data);
				});	
			}	
		}
		else{ 
			if($('.chat.page').length){ //chat page라는 selector가 존재하면
					
				}
			else{
					$fileM_html.hide();
					$.get("chat.ejs", function (data) {
					$chat_html.append(data);
				});	
			}	
		}
		isFileMButtonClicked = false;
		
		
	});
	
	$fileM.click(function(){
		isFileMButtonClicked = true;
		console.log("눌림");
		$chat_html.hide();
		$fileM_html.show();
		
		
		
		isChatButtonClicked = false;
	});
	
	var socket = io();
	
	
	url = '/project_json_uploads/'+$userEmail+'.json';
	$('#jstree_demo_div').jstree({ 'core' :{
		'data' : {
			"url" : url,
			"dataType" : "json"
			
		},
		}
		
	});
	
	$('#jstree_demo_div').on("dblclick.jstree",function(e){
		var instance = $.jstree.reference(this),
		node = instance.get_node(e.target);
		
		if(node.icon === "jstree-file"){ // file이라면
			$.ajax({ type:"POST",
			url:"/showCode",
			data: {"path" : node.id},
			success: function(data){
				currFilePath = node.id;
				editor.getDoc().setValue(''); // code 담겨있는 textarea를 먼저 비워줌.
				
				editor.getDoc().setValue(data.code);
				
			},
			error: function(xhr,status, error){alert(error);}});
		}
	});
	/*
	$('#jstree_demo_div').on("select_node.jstree",function(e,data){
		console.log("node_id: "+data.node.id);
	});
	*/
	
		/*
		$('#jstree_demo_div').on("changed.jstree",function(e,data){
		var sel = data.selected[0];
			console.log("double clicked: "+sel);
	});
	*/
});