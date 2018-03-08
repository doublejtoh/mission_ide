var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var session = require('express-session');
var MongoStore = require('connect-mongo')(session);
var server = require('http').createServer(app);
var io = require('socket.io')(server);
var port = process.env.PORT;
mongoose.connect('mongodb://localhost/testForAuth'); //connect to MongoDB
var db = mongoose.connection;
var Chat = require('./models/chat');
var fs = require('fs');
var SSHClient = require('ssh2').Client;

app.set('socketio',io);
//handle mongo error
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function () {
  // we're connected!
});

//use sessions for tracking logins
app.use(session({
  
	secret: 'work hard',
	resave: true,
	saveUninitialized: false,  
	store: new MongoStore({
		mongooseConnection: db
  	})
}));

// parse incoming requests
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// include routes
var routes = require('./routes/router');
app.use('/', routes);

// upload URL router
var upload = require('./routes/upload');
app.use('/upload',upload);

// serve static files from template
app.use(express.static(__dirname + '/templateLogReg')); // 이걸 routing 설정 위에 해버리면 라우팅 파일의 router.get('/')에 진입하지 않고 해당 정적파일중에서 찾아버린다.

// catch 404 and forward to error handler
app.use(function (req, res, next) {
	var err = new Error('File Not Found');
	err.status = 404;
	next(err);
});

// error handler
// define as the last app.use callback
app.use(function (err, req, res, next) {
	res.status(err.status || 500);
	res.send(err.message);
});

// socket 
var numUsers = 0;
var socket_ids = [];
io.on('connection', function(socket){
	var addedUser = false;
	socket.on('new message',function(data){
		chat = {
			username: socket.username,
			message: data
		};
		socket.broadcast.emit('new message',chat);
		saveMessageOnDB(chat);
		console.log("현재 소켓 list: ", socket_ids);
	});

	socket.on('new whisper',function(data){
		/*
		chat = {
			
		};
		*/
		to_socket_id = socket_ids[data.to];
		from_socket_id = socket_ids[data.username];
		console.log("현재 소켓 list : ",socket_ids);
		console.log("To socket_id: ",to_socket_id,"From _socket_id:",from_socket_id);
		if(to_socket_id !== undefined){ // 보내는 사람 id가 존재하면					
			if(to_socket_id == from_socket_id){ //보내는 사람 id와 받는 사람 id가 같으면
				io.to(from_socket_id).emit('whisper to myself',data);
			}
			else{
				io.to(to_socket_id).emit('new whisper',data);
				saveMessageOnDB(data);
			}
		}
		else{ //보내는 사람 id가 존재하지 않으면
			console.log("보내는 사람 socket id가 없는데, data는 이거임 .",data);
			io.to(from_socket_id).emit('no such user',data);
		}
	});
	
	socket.on('add user',function(username){
		if(addedUser) return;
		console.log(username);
		console.log(socket_ids);
		socket.username = username;
		++numUsers;		
		socket_ids[socket.username] = socket.id; //socket_ids에 추가
		addedUser = true;
		
		socket.emit('login',{
			numUsers: numUsers
		});
		
		socket.broadcast.emit('user joined',{
			username: socket.username,
			numUsers: numUsers
		});
	});
	
	socket.on('typing',function(){
		socket.broadcast.emit('typing',{
			username: socket.username
		});
	});

	socket.on('stop typing',function(){			
		socket.broadcast.emit('stop typing',{
			username: socket.username
		});
	});
	
	socket.on('disconnect',function(){
		if(addedUser){
			--numUsers;
			socket.broadcast.emit('user left',{
				username: socket.username,
				numUsers: numUsers
			});
			delete socket_ids[socket.username];
		}		
	});	
	
	socket.on('chats query',function(username){	
		// load past messages 
		Chat.find({ $or : [{to : {$ne : null}},{to : username },{username: {$ne :null}}]},{_id: false,username: true, message: true,to : true})
			.sort({date: 1})
			.exec(function(err,results){ // to : {$ne : null}은 귓속말 전체를 가져오는 것, to: username은 나에게 온 귓속말을 가져오는 것 , username : {$ne: null}은 모든 채팅을 가져오는 것.
				if(err) return handleError(err);
				socket.emit('chat query result',results); 
			});
	});
	var conn = new SSHClient();
	conn.on('ready', function() {
		socket.emit('data', '\r\n*** SSH CONNECTION ESTABLISHED ***\r\n');
		conn.shell(function(err, stream) {
			if (err)
				return socket.emit('data', '\r\n*** SSH SHELL ERROR: ' + err.message + ' ***\r\n');
			socket.on('data', function(data) {
				stream.write(data);
			});
			stream.on('data', function(d) {
				socket.emit('data', d.toString('binary'));
			}).on('close', function() {
				conn.end();
			});
		});
	}).on('close', function() {
		socket.emit('data', '\r\n*** SSH CONNECTION CLOSED ***\r\n');
	}).on('error', function(err) {
		socket.emit('data', '\r\n*** SSH CONNECTION ERROR: ' + err.message + ' ***\r\n');
	}).connect({
		host: '13.124.195.10',
		port: 55953,
		username: 'root',
		password: 'E[2DX?CGZoN]96_2XZCdI',
		readyTimeout: 99999
	});	
	
	
	
});

// functions
function saveMessageOnDB(data){// save chat on DB
	Chat.create(data, function (error, chat) {
		if (error) {
			return next(error);
		} 
    });
}
	
// listen on port 3000
server.listen(port
		 ||3000, function () {
  console.log('https://doublejtoh.run.goorm.io에서 돌고 있습니당.');
});