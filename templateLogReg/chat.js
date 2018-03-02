$(function(){
	var FADE_TIME = 150; // ms
	var TYPING_TIMER_LENGTH = 400; // ms
	var COLORS = [
		'#e21400', '#91580f', '#f8a700', '#f78b00',
		'#58dc00', '#287b00', '#a8f07a', '#4ae8c4',
		'#3b88eb', '#3824aa', '#a700ff', '#d300e7'				
	];
	
	
	 
	// Initialize variables
	var $window = $(window);
	var $usernameInput = $('.usernameInput'); // input for username
	var $messages = $('.messages'); // Messages area
	var $inputMessage = $('.inputMessage'); // Input message input box
	var $loginPage = $('.login.page');// Login page
	var $chatPage = $('.chat.page'); // chatroom page
	
	var $userid = $('.userid');
	var $useremail = $('.useremail');
	var $username = $('.username');
	var username ;
	var connected = false;
	var typing = false;
	var lastTypingTime;
	var $currentInput = $usernameInput.focus();
	
	var socket_ids = [];


	//var mongoose = require('mongoose');// for db connection
	/*
	var db = mongoose.connection;
	db.on('error',console.error);
	db.once('open',function(){
		console.log("Connected to mongod server");
	});
	
	mongoose.connect('mongodb://localhost/mongodb_tutorial');
	
	var Chat = require('./models/chat');
	*/
	
	var socket = io();
	
	
	
	function checkLogin(){ // check if the user already logged in.
		
	}
	
	function addMessageElement(el, options){
		var $el = $(el);
		
		if( !options){
			options ={};
		}
		
		if(typeof options.fade === 'undefined'){
			options.fade = true;
		}
		
		if(typeof options.prepend === 'undefined'){
			options.prepend = false;
		}
		
		if( options.fade){
			$el.hide().fadeIn(FADE_TIME);
		}
		if(options.prepend){
			$messages.prepend($el); // 맨 위의 메시지로 추가
		}else{
			$messages.append($el); // 맨 마지막 메시지로 추가
		}
		$messages[0].scrollTop = $messages[0].scrollHeight;
	}
	
	function log (message, options){
		var $el = $('<li>').addClass('log').text(message);
		addMessageElement($el, options);
		
	}
	
	function addParticipantsMessage (data){
		var message = '';
		if(data.numUsers === 1){
			message += "1명이 대화방에 있습니다.";
		}else{
			message += data.numUsers +"명이 대화방에 있습니다.";
		}
		log(message);
	}
	
	function cleanInput(input){
		
		return $('<div/>').text(input).html();
	}
	
	function setUsername(){
		username = cleanInput($username.val().trim()); // trim은 선행 및 후행 공백과 줄 종결자 문자가 제거된 원본 문자열반환
		
		console.log(username);
		if(username){
			//$loginPage.fadeOut();
			//$chatPage.show();
			//$loginPage.off('click'); // off('click')는 해당 element의 on('click') 를 억제시킨다.
			$currentInput = $inputMessage.focus();
			
			socket.emit('add user',username);
			socket.emit('chats query',username); // chat query to server.
		}

		
	}
	
	function getTypingMessages(data){
		return $('.typing.message').filter(function (i){
			return $(this).data('username') === data.username;
		});
		
	}
	
	function getUsernameColor(username){
		var hash = 7;
		for (var i =0; i< username.length; i++){
			hash = username.charCodeAt(i) + (hash <<5) - hash; // hash << 5 == hash * 32
		}
		
		var index = Math.abs(hash % COLORS.length);
		return COLORS[index];
	}
	
	function addChatMessage(data,options){
		var $typingMessages = getTypingMessages(data);
		options = options || {};
		if($typingMessages.length !== 0){
			options.fade = false; // fade in했던 옵션을 없애준다.
			$typingMessages.remove(); // typingMessage를 지움. 채팅이 하나 올라갔으니깐.
			
		}
		
		var $usernameDiv = $('<span class="username"/>')
		.text(data.username)
		.css('color',getUsernameColor(data.username));
		var $messageBodyDiv = $('<span class="messageBody">')
		.text(data.message);
		
		var typingClass = data.typing ? 'typing' : '';
		var $messageDiv = $('<li class="message"/>')
		.data('username',data.username)
		.addClass(typingClass)
		.append($usernameDiv,$messageBodyDiv);
		
		addMessageElement($messageDiv,options);
		
	}
	
	function addChatTyping (data){
		data.typing = true;
		data.message = '가 입력중입니다...';
		addChatMessage(data);
		
	}
	
	function removeChatTyping(data){
		getTypingMessages(data).fadeOut(function(){
			$(this).remove();
		});
		
	}
	
	function updateTyping(){
		if(connected){
			if (!typing){
				typing = true;
				socket.emit('typing');
				
			}
			lastTypingTime = (new Date()).getTime();
			
			setTimeout(function(){
				var typingTimer = (new Date()).getTime();
				var timeDiff = typingTimer - lastTypingTime;
				if( timeDiff >= TYPING_TIMER_LENGTH && typing){
					socket.emit('stop typing');
					typing = false;
				}
			},TYPING_TIMER_LENGTH); //TYPING_TIMER_LENGTH ms초 만큼 흐른 뒤에 익명함수를 실행하겠다.
				
			
		}
		
	}
	
	function addFromWhisperMessage(data,options){ //귓속말 보내는 사람 입장.
		
		var $typingMessages = getTypingMessages(data);
		options = options || {};
		if($typingMessages.length !== 0){
			options.fade = false; // fade in했던 옵션을 없애준다.
			$typingMessages.remove(); // typingMessage를 지움. 채팅이 하나 올라갔으니깐.
			
		}
		
		var $usernameDiv = $('<span class="username"/>')
		.text(data.to+"에게 귓속말 발신")
		.css('color',getUsernameColor(data.to));
		var $messageBodyDiv = $('<span class="messageBody">')
		.text(data.message);
		
		var typingClass = data.typing ? 'typing' : '';
		var $messageDiv = $('<li class="message"/>')
		.data('username',data.to)
		.css('color', '#F5A9F2')
		.addClass(typingClass)
		.append($usernameDiv,$messageBodyDiv);
		
		addMessageElement($messageDiv,options);
	}
	
	
	function addToWhisperMessage(data,options){ //귓속말 받는 사람 입장
		
		
		var $typingMessages = getTypingMessages(data);
		options = options || {};
		if($typingMessages.length !== 0){
			options.fade = false; // fade in했던 옵션을 없애준다.
			$typingMessages.remove(); // typingMessage를 지움. 채팅이 하나 올라갔으니깐.
			
		}
		
		var $usernameDiv = $('<span class="username"/>')
		.text(data.username+"으로부터 귓속말 수신")
		.css('color',getUsernameColor(data.username));
		var $messageBodyDiv = $('<span class="messageBody">')
		.text(data.message);
		
		var typingClass = data.typing ? 'typing' : '';
		var $messageDiv = $('<li class="message"/>')
		.data('username',data.username)
		.css('color', '#F5A9F2')
		.addClass(typingClass)
		.append($usernameDiv,$messageBodyDiv);
		
		addMessageElement($messageDiv,options);
	}
	function sendMessage(){
		var message = $inputMessage.val();			
		var start = message.indexOf("@");
		if(start !== 0) // 귓속말이 아닐경우
		{

			message = cleanInput(message);
			if(message && connected){
				$inputMessage.val('');

				addChatMessage({

					username: username,
					message: message
				});
				socket.emit('new message', message);
			}


		}
		else{
			//cleanInput해줘야하는지 확인해야함.
			var isWS = message.search(/\s/); // 공백 문자 첫 인덱스
			var toWho = message.substring(start+1,isWS); //누구에게 보낼 것인지?
			message = message.substring(isWS+1,message.length); //메시지 내용
			if(isWS == -1) // "@정준현" 이런식으로 입력했을 경우
			{
				
				toWho = message.substring(start+1,message.length);
				message = "";
			}
			
			packet =
				{

					username: username, //보내는 사람
					to: toWho, //받는 사람
					message: message
				};
			
			if(message && connected){
				$inputMessage.val('');

				addFromWhisperMessage(packet);
				socket.emit('new whisper', packet);
				
				
			}

			
		}
		
	}

	
	//keyboard evenets
	
	$window.keydown(function (event){
		if(!(event.ctrlKey || event.metaKey || event.altKey)){
			$currentInput.focus();
		}
		
		if(event.which == 13){ // enter키를 client가 눌렀을 때
			if(username){
				sendMessage();
				socket.emit('stop typing');
				typing = false;
			}else{
				setUsername();
			}
		}
		
	});
	
	

	
	$inputMessage.on('input',function(){
		updateTyping();
	});
	
	$loginPage.click(function (){
		$currentInput.focus();
		
	});
	
	$inputMessage.click(function(){
		$inputMessage.focus();
	});
	
	//Socket Events
	
	
	socket.on('connect',function(){
		setUsername();
	});
	
	socket.on('login',function(data){
		connected = true;
		var message = "JOON TALK에 오신걸 환영합니다.";
		log(message, {
			prepend: true
		});
		addParticipantsMessage(data);
		
		//loadMessages();
	});
	
	socket.on('chat query result',function(data){
		
		if(data === null){
			return ;
		}
		data.forEach(function(chat){
			
			
			if(chat.username === username){ //내가 보낸 채팅일 경우
				if(chat.to !== null){ //귓속말 발신일 경우								
					addFromWhisperMessage(chat);
				}	
				else{// 일반 채팅일 경우
					
					addChatMessage(chat);
				}
			}
			
			else{ //다른 사람이 보낸 채팅일 경우
				if(chat.to === username)// 귓속말 수신일 경우
				{
					addToWhisperMessage(chat);
					
				}
				else// 일반 채팅일 경우
				{
					
					addChatMessage(chat);
				}
				
				
					
				
				
			}
			
			});
	});
	socket.on('new message',function(data){
		
		addChatMessage(data);
	});
	
	socket.on('new whisper',function(data){
		addToWhisperMessage(data);
	});
	
	socket.on('user joined',function(data){
		log(data.username + '님이 대화방에 들어왔습니다.');
		addParticipantsMessage(data);
	});
	
	socket.on('user left', function(data){
		log(data.username + '님이 대화방에서 나갔습니다.');
		addParticipantsMessage(data);
		removeChatTyping(data);
	});
	
	socket.on('typing', function(data){
		addChatTyping(data);
	});
	
	socket.on('stop typing',function (data){
		removeChatTyping(data);
	});
	
	socket.on('disconnect',function(){
		log('you have been disconnected');
	});
	
	socket.on('reconnect',function(){
		log('you have been reconnected');
		
		if(username){
			socket.emit('add user',username);
		}
		
	});
	
	socket.on('no such user',function(data){ //받는 사람이 대화방에 없으면	
					
					data.message = "귓속말을 보내려는 상대가 현재 대화방에 없습니다.";
					addFromWhisperMessage(data);		
	});
	
	socket.on('whisper to myself',function(data){
					data.message = "나에게 귓속말을 보낼 수 없습니다.";
					addFromWhisperMessage(data);
	});
	
	socket.on('reconnect_error',function(){
		log('attemp to reconnect has failed');
	});
	
});