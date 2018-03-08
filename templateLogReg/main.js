$(function(){
	
	var $chat = $('#chat');
	var $fileM = $('#fileM');
	var $chat_html = $('.chat');
	var $fileM_html = $('.fileM');
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
			//chat page라는 selector가 존재하면
			if($('.chat.page').length){
					
			}
			else{	
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
		isFileMButtonClicked = true;
		if(isChatButtonClicked){ //챗 버튼 눌러있었으면
			if($('.upload').length){ //upload라는 selector가 존재하면
				 $chat_html.hide();
				 $fileM_html.show();
			}
			else{
				$.get("fileM.ejs", function (data) {
					$fileM_html.append(data);
				});	
			}	
		}
		else{
			if($('.upload').length){ //upload라는 selector가 존재하면
					
			}
			else{
				$.get("fileM.ejs", function (data) {
					$fileM_html.append(data);
				});	
			}	
		}
		isChatButtonClicked = false;
	});
	
	
});