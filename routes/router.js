var express = require('express');
var router = express.Router();
var User = require('../models/user');
var path = require('path');
var ejs = require('ejs');
var fs = require('fs');
var PythonShell = require('python-shell');
var compiler = require('compilex');
var toString = require('stream-to-string');
// GET route for reading data
router.get('/', function (req, res, next) {
	console.log(req.session);
	
	if(req.session.userId!==undefined)// if logined, then redirect to main.
		{
			return res.redirect('/main');
		}
  return res.sendFile(path.join(__dirname + '/templateLogReg/index.html'));
});


//POST route for updating data
router.post('/', function (req, res, next) {
	
	
  // confirm that user typed same password twice
  if (req.body.password !== req.body.passwordConf) {
    var err = new Error('Passwords do not match.');
    err.status = 400;
    res.send("passwords dont match");
    return next(err);
  }

  if (req.body.email &&
    req.body.username &&
    req.body.password &&
    req.body.passwordConf) {

    var userData = {
      email: req.body.email,
      username: req.body.username,
      password: req.body.password,
      passwordConf: req.body.passwordConf,
    };

    User.create(userData, function (error, user) {
      if (error) {
        return next(error);
      } else {
        req.session.userId = user._id;
        return res.redirect('/main');
      }
    });

  } else if (req.body.logemail && req.body.logpassword) {
    User.authenticate(req.body.logemail, req.body.logpassword, function (error, user) {
      if (error || !user) {
        var err = new Error('Wrong email or password.');
        err.status = 401;
        return next(err);
      } else {
        req.session.userId = user._id;
		req.session.cookie.maxAge = 1000 * 60 * 60 * 24; // session 유지 시간 configuration: 1일
        return res.redirect('/main');
      }
    });
  } else {
    var err = new Error('All fields required.');
    err.status = 400;
    return next(err);
  }
});

// GET route after registering
router.get('/main', function (req, res, next) {
	
	console.log(req.session);
	var userId = req.session.userId;
  User.findById(req.session.userId)
    .exec(function (error, user) {
      if (error) {
        return next(error);
      } else {
        if (user === null) {
          var err = new Error('Not authorized! Go back!');
          err.status = 400;
          return next(err);
        } else {
          return res.render(path.join(__dirname ,'../templateLogReg/' ,'main.ejs'),{userid: user._id,useremail: user.email, username: user.username });



        }
      }
    });
});

//GET route for chatting
router.get('/chat',function (req,res,next){
	var userId = req.session.userId;
  User.findById(req.session.userId)
    .exec(function (error, user) {
      if (error) {
        return next(error);
      } else {
        if (user === null) {
          var err = new Error('Not authorized! Go back!');
          err.status = 400;
          return next(err);
        } else {
          return res.render(path.join(__dirname ,'../templateLogReg/' ,'chat.ejs'),{userid: user._id,useremail: user.email, username: user.username });



        }
      }
    });
});





// GET for logout logout
router.get('/logout', function (req, res, next) {
  if (req.session) {
    // delete session object
    req.session.destroy(function (err) {
      if (err) {
        return next(err);
      } else {
        return res.redirect('/');
      }
    });
  }
});

// POST for and Run code.
router.post('/runCode', function (req,res,next){
	var code = req.body.code;
	//var userName = req.body.userName;
	var path = req.body.path;
	
	var isInput = req.body.isInput; //input이 있는가?
	isInput = (isInput == 'true');
	var input = req.body.input; // input
	console.log(path);
	
	var writeStream = fs.createWriteStream(path);
	writeStream.write(code);
	writeStream.end();
	
	var upper_path = path.substring(0,path.lastIndexOf("/")+1);
	var fileName = path.substring(path.lastIndexOf("/")+1,path.length);
	if(fileName.match(/.py/)){ // python 파일이라면 
		
		var options ;
		if(isInput){ // input이 있을 경우
			
			var options = {stats: true};
			compiler.init(options);
			var envData = { OS: "linux"};
			var readStream = fs.createReadStream(path);
			var isErrorExist = false;
			toString(readStream,function(err,msg){
				var to =setTimeout(function(){
					res.send({ isErrorExist : true, err: "Timeout - some common reasons for Timeout. Your Program may have an endless loop. Please check the program and try again or contact joonhyun.jeong@goorm.io"});
				}, 7000); // 7초 뒤에는 오류라고 console에 찍어줌.
				compiler.compilePythonWithInput(envData, msg, input, function(data){
					if(data.error !== undefined)// compile 에러 존재할 시
					{
						isErrorExist = true;
											
					}	
					clearTimeout(to); // timeout 해제
					console.log(data.error,data.output);
					res.send({isErrorExist: isErrorExist, results: [data.output], err: data.error , isPythonCode: true});	
				});	
			});
			
		}
		else{ // input이 없을 경우
			/*
			options = {

			  encoding : 'utf-8',
			  scriptPath: upper_path
			  //mode: 'text',
			  //pythonOptions: ['-u']

			};
			var to =setTimeout(function(){
					res.send({ isErrorExist : true, err: "Timeout - some common reasons for Timeout. Your Program may have an endless loop. Please check the program and try again or contact joonhyun.jeong@goorm.io"});
				}, 7000); // 7초 뒤에는 오류라고 console에 찍어줌.
			PythonShell.run(fileName, options, function (err, results) {
				var isErrorExist = false;
				if (err) isErrorExist = true;
				// results is an array consisting of messages collected during execution
				clearTimeout(to);
				res.send({isErrorExist: isErrorExist,results: results, err: err, isPythonCode: true});
			});
			*/
			var options = {stats: true};
			compiler.init(options);
			var envData = { OS: "linux"};
			var readStream = fs.createReadStream(path);
			var isErrorExist = false;
			toString(readStream,function(err,msg){
				var to =setTimeout(function(){
					res.send({ isErrorExist : true, err: "Timeout - some common reasons for Timeout. Your Program may have an endless loop. Please check the program and try again or contact joonhyun.jeong@goorm.io"});
				}, 7000); // 7초 뒤에는 오류라고 console에 찍어줌.
				compiler.compilePython(envData, msg, function(data){
					if(data.error !== undefined)// compile 에러 존재할 시
					{
						isErrorExist = true;
											
					}	
					clearTimeout(to); // timeout 해제
					console.log(data.error,data.output);
					res.send({isErrorExist: isErrorExist, results: [data.output], err: data.error ,isPythonCode: true});	
				});	
			});
		}
		
	}
	else if(fileName.match(/.cpp/)){ // cpp 파일이라면
		var options = {stats : true}; // prints status on console.
		compiler.init(options);
		var envData = { OS : "linux", cmd: "gpp"};
		var readStream = fs.createReadStream(path);
		var isErrorExist = false;
		toString(readStream,function(err,msg){
			console.log(isInput);
			if(isInput === true){ //input이 있을 경우
				console.log('input잇음');
				var to =setTimeout(function(){
					res.send({ isErrorExist : true, err: "Timeout - some common reasons for Timeout. Your Program may have an endless loop. Please check the program and try again or contact joonhyun.jeong@goorm.io"});
				}, 7000); // 7초 뒤에는 오류라고 console에 찍어줌.
				compiler.compileCPPWithInput(envData, msg, input, function(data){
					if(data.error !== undefined)// compile 에러 존재할 시
					{
						isErrorExist = true;
											
					}	
					clearTimeout(to); // timeout 해제
					console.log(data.error,data.output);
					res.send({isErrorExist: isErrorExist, results: [data.output], err: data.error });	
				});
			}
			else{
				
				console.log("input없음");
				var to = setTimeout(function(){
					res.send({ isErrorExist : true, err: "Timeout - some common reasons for Timeout. Your Program may have an endless loop. Please check the program and try again or contact joonhyun.jeong@goorm.io"});
				}, 7000); // 7초 뒤에는 오류라고 console에 찍어줌.
				
				compiler.compileCPP(envData, msg, function (data){
					
					if(data.error !== undefined)// compile 에러 존재할 시
					{
						isErrorExist = true;
					}							
					console.log(data.error);
					clearTimeout(to); //timeout 해제
					res.send({isErrorExist: isErrorExist, results: [data.output], err: data.error });

				});	
			}
		});
		
	}
	else if(fileName.match(/.c/)){ // c 파일 이라면 
		var options = {stats : true}; 
		compiler.init(options);
		var envData = { OS : "linux", cmd: "gcc"};
		var readStream = fs.createReadStream(path);
		var isErrorExist = false;
		toString(readStream,function(err,msg){
			console.log(typeof isErrorExist);
			console.log(typeof isInput);
			if(isInput === true){ //input이 있는 경우
				console.log("input 잇음");
				var to = setTimeout(function(){
					res.send({ isErrorExist : true, err: "Timeout - some common reasons for Timeout. Your Program may have an endless loop. Please check the program and try again or contact joonhyun.jeong@goorm.io"});
				}, 7000); // 7초 뒤에는 오류라고 console에 찍어줌.
				compiler.compileCPPWithInput(envData, msg, input, function(data){
					if(data.error !== undefined)// compile 에러 존재할 시
					{
						isErrorExist = true;
					}
					console.log(data.error);
					clearTimeout(to);
					res.send({isErrorExist: isErrorExist, results: [data.output], err: data.error });
				});
			}
			else{ //input이 없는 경우
				console.log("input없음");
				var to = setTimeout(function(){
					res.send({ isErrorExist : true, err: "Timeout - some common reasons for Timeout. Your Program may have an endless loop. Please check the program and try again or contact joonhyun.jeong@goorm.io"});
				}, 7000); // 7초 뒤에는 오류라고 console에 찍어줌.
				compiler.compileCPP(envData, msg, function (data){
					if(data.error !== undefined)// compile 에러 존재할 시
					{
						isErrorExist = true;
					}
					console.log(data.error);
					clearTimeout(to);
					res.send({isErrorExist: isErrorExist, results: [data.output], err: data.error });

				});	
			}
		});
	
		
	}
	else{ // c, c++,python파일이 아니면 
		console.log("java");
		
		res.send({});
	}
	

	
});

// POST for file save
router.post('/saveCode',function(req,res,next){
	var code = req.body.code;
	var path = req.body.path;
	var writeStream = fs.createWriteStream(path);
	writeStream.write(code);
	writeStream.end();
});

//POST for show code 
router.post('/showCode',function(req,res,next){
	var path = req.body.path;
	readStream = fs.createReadStream(path);
	toString(readStream,function(err,msg){
				res.send({code : msg});
	});
	
});

module.exports = router;