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
	$(".consoleDiv").hide();
	
	var code = $(".codemirror-textarea")[0]; 
	 editor = CodeMirror.fromTextArea(code,{lineNumbers : true,   onChange: function(){editor.save();}, theme: "panda-syntax"}); 
	var $runBtn = $("#run");
	var $interActiveModeChecked = $("#interActiveModeOn");
	var $saveBtn = $("#save");
	var $userName = $(".username").val();  
	var isInterActiveModeChecked = false;
	var term = new Terminal({cursorBlink : true});
	term.open(document.getElementById('terminal'));
	
	
	$('#terminal').hide();
	 var socket = io();
	
	socket.on('connect',function(){
		term.write('\r\n*** Connected to backend***\r\n');
		
		term.on('data',function(data){
			socket.emit('data',data);
		});
		
		socket.on('data',function(data){
			term.write(data);
		});
		socket.on('disconnect',function(){
            term.write('\r\n*** Disconnected from backend***\r\n');					
		});
	});
	
	$interActiveModeChecked.change(function(){
		if(this.checked){			
			isInterActiveModeChecked = true;
			$('.inputConsoleDiv').hide();
			$(".consoleDiv").hide();
			$('#terminal').show();
			
		}
		else{
			isInterActiveModeChecked = false;
			$('#terminal').hide();
			$('.inputConsoleDiv').show();
		}
	});
	console.log(typeof isInterActiveModeChecked);
	console.log(isInterActiveModeChecked);
	
	$runBtn.click(function(){ var $code = editor.getValue();
		
	/* <!-- 시도 : code에 주석을 다 filtering out 시키고 cin, scanf, input 이라는 코드가 있으면 input이 있다고 가정해서 하려고 했지만 여러가지 예외처리 해줄게 많아 코드가 길어져서 좋지 않은 방법인듯.
	var isInput = false;
	var input ;
	var codeWithoutComment = $code.replace(/(?:\/\*(?:[\s\S]*?)\*\/)|(?:[\s;]+\/\/(?:.*)$)/gm, '');	

		if(codeWithoutComment.match(/cin/)||codeWithoutComment.match(/scanf/)||codeWithoutComment.match(/input/)){ //입력을 받는 코드라면


		isInput = true;
		$('#console').hide();
		$("#inputConsole").appendTo("#usersCode");
		$("#inputConsole").show();
		$runBtn.click(function(){
			input = $("#inputConsole").val();
			console.log(input);
		});
	}
	else{ // 입력을 받는 코드가 아니라면 
		isInput = false;
		$.ajax({ type:"POST",
			url:"/runCode",
			data: {"code": $code,"path" : currFilePath,"isInput" : isInput, "input" : input},
			success: function(data){
				$("#inputConsole").hide();
				if(data.isErrorExist !== undefined){ // c or c++ or python 파일이라면
				if(data.isErrorExist){
					$("#console").empty(); 
					if(data.isPythonCode){ // python 코드라면
						$("#console").append(JSONtoString(data.err));	
					}
					else{ // c or c++코드라면
						$("#console").append(data.err);
					}
					$("#console").appendTo("#usersCode"); 
					$("#console").show(); console.log(data.err);
				} else if(!data.isErrorExist){ // 에러가 존재하지 않으면
					$("#console").empty(); 
					console.log(data.results);
					data.results.forEach(function(item){						
						$("#console").append(item+"<br>");
					});
					$("#console").appendTo("#usersCode");
					$("#console").show(); }
				}
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
	}
*/
		if(isInterActiveModeChecked){ //interActive mode check한 경우
			console.log("Interactive 모드");
			/* 먼저 save 한다. */
			$.ajax({ type:"POST",
				url:"/saveCode",
				data: {"code": $code,"path" : currFilePath},
				success: function(){
					var fileName = currFilePath.substring(currFilePath.lastIndexOf("/")+1,currFilePath.length);
					var fileFormat = fileName.substring(fileName.lastIndexOf(".")+1,fileName.length);
					if(fileFormat === "c"){

						term.send('rm a.out\n');
						term.send('gcc '+currFilePath+"\n");
						term.send('./a.out'+"\n");

					}
					else if(fileFormat === "cpp"){
						term.send('rm a.out\n');
						term.send('g++ '+currFilePath+"\n");
						term.send('./a.out'+"\n");
					}
					else if(fileFormat === "py"){
						term.send('python '+currFilePath+"\n");

					}
					else{
						term.write('It is not c or c++ or python code\n');
					}

				},
				error: function(xhr,status, error){alert(error);}});
			
			
			
		}
		else{ //InterActive mode가 아닌경우
			var isInput = false;
			var input = $("#inputConsole").val();
			if(input!==""){
				isInput = true;
			}					


			$.ajax({ type:"POST",
				url:"/runCode",
				data: {"code": $code,"path" : currFilePath,"isInput" : isInput, "input" : input},
				success: function(data){
					$('#terminal').hide();
					if(data.isErrorExist !== undefined){ // c or c++ or python 파일이라면
					if(data.isErrorExist){
						$("#console").empty(); 
						console.log(data.isPythonCode);
						console.log(typeof data.isPythonCode);
						if(data.isPythonCode){ // python 코드라면
							console.log("들어옴");
							console.log(data.err);
							$('#console').append(data.err);
						}
						else{ // c or c++코드라면
							$("#console").append(data.err);
						}
						$(".consoleDiv").appendTo("#usersCode"); 
						$(".consoleDiv").show(); console.log(data.err);
					} else if(!data.isErrorExist){ // 에러가 존재하지 않으면
						$("#console").empty(); 
						console.log(data.results);
						data.results.forEach(function(item){						
							$("#console").append(item+"<br>");
						});
						$(".consoleDiv").appendTo("#usersCode");
						$(".consoleDiv").show(); }
					}
					else{ // c or c++ or python 파일이 아니면 
						$("#console").empty(); 
						$("#console").append("c,c++,python 파일이 아닙니다. ");
						$(".consoleDiv").appendTo("#usersCode");
						$(".consoleDiv").show(); 
					}
				},
				error: function(xhr,status, error){
					alert(error);
				}
			});
		}

	});
	
	
							
	$saveBtn.click(function(){ var $code = editor.getValue();
		$.ajax({ type:"POST",
			url:"/saveCode",
			data: {"code": $code,"path" : currFilePath},
			success: function(){
				console.log("save success");
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
					$fileM_html.hide();
					$chat_html.show();
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
	
	
	
	
	
	url = '/project_json_uploads/'+$userEmail+'.json';
	$('#jstree_demo_div').jstree({ 'core' :{
		'data' : {
			"url" : url,
			"dataType" : "json"
			
		},
		}
		
	});
	/*
	$('#jstree_demo_div').on("dblclick.jstree",function(e){ 
		console.log($.jstree); //채팅으로 옮겼다가 파일 매니저로 오면 $.jstree가 undefined로 된다. 왜그런진 모르겠다
		
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
	*/
	
	$('#jstree_demo_div').on("select_node.jstree",function(e,data){
		var node = data.node;
		
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
		$('#jstree_demo_div').on("changed.jstree",function(e,data){
		var sel = data.selected[0];
			console.log("double clicked: "+sel);
	});
	*/
});