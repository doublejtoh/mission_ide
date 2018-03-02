var express = require('express');

var router = express.Router();

var multiparty = require('multiparty');

var fs = require('fs');

var User = require('../models/user');

 var path =require('path');

 var ejs = require('ejs');

var unzip = require('unzip');

var streamRes = require('stream-res');


/* GET home page. */
router.get('/',function(req, res,next){
	return res.render(path.join(__dirname ,'../templateLogReg/' ,'fileM.ejs'));
});


router.post('/', function(req, res, next) {

	var temp_filename ;
	var temp_filesize; 
	var userId ;
	var userEmail;
	var userName;

      var form = new multiparty.Form({
		  
		  uploadDir: 'temp/'
	  });

     

      // get field name & value

      form.on('field',function(name,value){

           console.log('normal field / name = '+name+' , value = '+value);

      });

     

      // file upload handling

      form.on('part',function(part){

           var filename;

           var size;

           if (part.filename) {

                 filename = part.filename;

                 size = part.byteCount;

           }else{

                 part.resume();

          

           }    

 

           console.log("Write Streaming file :"+filename);

           var writeStream = fs.createWriteStream('/tmp2/'+filename);

           writeStream.filename = filename;

		  temp_filename = filename;
		  temp_filesize = size;
		  console.log(temp_filename);
           part.pipe(writeStream);

 

           part.on('data',function(chunk){

			   	
                 console.log(filename+' read '+chunk.length + 'bytes');

           });

          

           part.on('end',function(){
			   	
                 console.log(filename+' Part read complete');
			   
			   	
                 writeStream.end();

           });

      });

 

      // all uploads are completed

      form.on('close',function(){
		  	console.log(temp_filename);
		  
	// username, id, email 찾기위해 db에서 조회
	
	console.log(req.session);
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
          
		 // 비동기로 DB 조회하기 때문에 callback으로 res.write 부분 해줘야함. 이렇게 안하면 오류남.
		  userId = user._id;
		  userEmail = user.email;
		userName = user.username;
		
	console.log(userId,userEmail,userName);
	
		   var readStream = fs.createReadStream('/tmp2/'+temp_filename); //원래 코드
		   	//fs.createReadStream('/tmp2/'+temp_filename).pipe(unzip.Extract({ path: '/user_storage'}));
		  
		    res.writeHead(200, "OK", {'Content-Type': 'text/html'});

		    res.write('<html><head> <meta charset="UTF-8"><script src="https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.29.0/codemirror.js"></script><link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.29.0/codemirror.css"><script src="https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.29.0/mode/javascript/javascript.js"></script><script src="https://code.jquery.com/jquery-1.10.2.min.js"></script><title>Code Mirror</title></head><body>');
		  res.write('<link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/4.0.0/css/bootstrap.min.css" integrity="sha384-Gn5384xqQ1aoWXA+058RXPxPg6fy4IWvTNh0E263XmFcJlSAwiGgFAW/dAiS6JXm" crossorigin="anonymous"><script src="https://cdnjs.cloudflare.com/ajax/libs/popper.js/1.12.9/umd/popper.min.js" integrity="sha384-ApNbgh9B+Y1QKtv3Rn7W3mgPxhU9K/ScQsAP7hUibX39j7fakFPskvXusvfa0b4Q" crossorigin="anonymous"></script><script src="https://maxcdn.bootstrapcdn.com/bootstrap/4.0.0/js/bootstrap.min.js" integrity="sha384-JZR6Spejh4U02d8jOt6vLEHfe/JQGiRRSQQxSfFWpi1MquVdAyjUar5+76PVCmYl" crossorigin="anonymous"></script>');
		  	
		res.write('<script src="/minipy.js"></script>');	   res.write('<script>function JSONtoString(object) {var results = [];for (var property in object) {var value = object[property];if (value)results.push(property.toString() + ": " + value);}return "{" + results.join(", ") + "}";}$(document).ready(function(){ $("#console").hide(); var code = $(".codemirror-textarea")[0]; var editor = CodeMirror.fromTextArea(code,{lineNumbers : true,   onChange: function(){editor.save()}}); var $runBtn = $("#run"); var $userName = $(".username").val();  $runBtn.click(function(){ var $code = editor.getValue();  $.ajax({ type:"POST", url:"/runCode",data: {"code": $code,"userName" : $userName},success: function(data){if(data.isErrorExist){$("#console").empty(); $("#console").append(JSONtoString(data.err)); $("#console").appendTo("#usersCode"); $("#console").show(); console.log(data.err);} else{$("#console").empty(); $("#console").append(data.results); $("#console").appendTo("#usersCode"); $("#console").show(); }}, error: function(xhr,status, error){alert(error);}}) });}); </script>');
		  
		  //res.write('<input type="hidden" class="userid" value="');
		  //res.write(userId.toString()); res.write('">');
		  res.write('<input type="hidden" class="useremail" value="');
		  res.write(userEmail); res.write('">');
		  res.write('<input type="hidden" class="username" value="');
		  res.write(userName); res.write('">');
		  
		  res.write('<div class="d-flex flex-column flex-md-row align-items-center p-3 px-md-4 mb-3 bg-white border-bottom box-shadow"><h5 class="my-0 mr-md-auto font-weight-normal">JOON</h5><nav class="my-2 my-md-0 mr-md-3">    <button type="button" id="chat" class="btn btn-outline-primary">채팅</button>		<button type="button" id="fileM" class="btn btn-outline-warning">파일 매니저</button></nav><a class="btn btn-outline-primary" href="/logout">로그아웃</a></div>');
		  res.write('<script src="/upload.js"></script>');
		  res.write('<div class="chat"></div>');
		  
		  res.write('<div class="fileM">');
		
		  res.write('<pre style="white-space : pre-line;" id="console" class="alert alert-danger" role="alert"></pre>');
			res.write('<div id="usersCode">');
			res.write('<form action="/runCode" method="POST">');
		    res.write('<button id = "run" type="button" class="btn btn-success">Save & Run!</button>');		  
		    res.write('<textarea class="codemirror-textarea">');
		  	readStream.pipe(res);		    
		    
			
		  

        }
      }
    });
	
		    
		    
		    
		  /*
			streamRes(res, readStream, function(err) {
				if (err) next(err);
				else {
					console.log('file test.html has been piped to client');
				}
			});		
			*/
           //res.status(200).send('Upload complete');

      });

     

      // track progress

      form.on('progress',function(byteRead,byteExpected){

           console.log(' Reading total  '+byteRead+'/'+byteExpected);

      });

     

      form.parse(req);

 

 

});

 

module.exports = router;

 



