var express = require('express');

var router = express.Router();

var multiparty = require('multiparty');

var fs = require('fs');

var User = require('../models/user');

 var path =require('path');

 var ejs = require('ejs');

var unzip = require('unzip-stream');

var toString = require('stream-to-string');

var DecompressZip = require('decompress-zip');

var streamRes = require('stream-res');

var walk    = require('walk');


function getFiles (dir,files_,dirs_){
	
	var files = fs.readdirSync(dir);
	for (var i in files){
		var name = dir + '/' + files[i];
		if(fs.statSync(name).isDirectory()){
			if(name.substring(name.lastIndexOf("/")+1,name.length) === "__MACOSX"){ // 파일명이 __MACOSX이면 do nothing.
				
			}
			else{
				dirs_.push(name);
				getFiles(name, files_,dirs_);
			}
		}
		else{
			console.log(name);
			files_.push(name);
		}
	}
	
	
}


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
	
	var files   = [];
	var dirs = [];
	var root_dir ;
	var fs_json_arr = []; //unzip된 파일의 구조를 json으로 나타낸 arr		
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
		  
           part.pipe(writeStream);

 

           part.on('data',function(chunk){

			   	
                 console.log(filename+' read '+chunk.length + 'bytes');

           });

          

           part.on('end',function(){
			   	
                 console.log(filename+' Part read complete');
			   
			   	
                 writeStream.end();
				
			   
			   //fs.createReadStream('/tmp2/'+temp_filename).pipe(unzip.Extract({ path: '/user_storage'}));
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
		
	
	
//		   var readStream = fs.createReadStream('/tmp2/'+temp_filename); //원래 코드
			console.log(temp_filename);
			var d = new Date();
			var date = d.getFullYear()+'-'+(d.getMonth() + 1) +'-'+d.getDate()+'-'+d.getHours()+'-'+d.getMinutes()+'-'+d.getSeconds();
			var unzipper = new DecompressZip('/tmp2/'+temp_filename);
			   unzipper.on('error',function(err){
				   console.log(err);
				  console.log('Caught an err');
			   });
			   unzipper.on('extract',function(log){
				   
				var root = temp_filename.substring(0,temp_filename.lastIndexOf("."));
				
				root_dir = '/user_storage/'+userEmail+'/'+date;
				   
				   
				   getFiles(root_dir,files,dirs);
				    console.log(files,dirs);
				   fs_json_arr.push({"id" : root_dir, "parent" :"#", "text" : "Project","icon" : "https://www.jstree.com/static/3.2.1/assets/images/tree_icon.png"});
					dirs.forEach(function(dir){					
						fs_json_arr.push({"id": dir,"parent" : dir.substring(0,dir.lastIndexOf("/")),"text" : dir.substring(dir.lastIndexOf("/")+1,dir.length)});
					});
					files.forEach(function(file){											if(file.substring(file.lastIndexOf(".")+1,file.length) == "DS_Store"){//"DS_STORE 파일이면 do nothing"
							
					}
					else{
						fs_json_arr.push({"id": file,"parent" : file.substring(0,file.lastIndexOf("/")),"icon" : "jstree-file","text" : file.substring(file.lastIndexOf("/")+1,file.length)});
					}
						
					});
					console.log(fs_json_arr);
				   
				    jsonWS = fs.createWriteStream('/workspace/mission_ide/mission_ide/templateLogReg/project_json_uploads/'+userEmail+'.json');
				   	jsonWS.write(JSON.stringify(fs_json_arr));
				   	jsonWS.end();
				   return res.render(path.join(__dirname, '../templateLogReg/','editor.ejs'),{userEmail: userEmail, userName: userName});
			
				   /*
				// Walker options
				var walker  = walk.walk(root_dir, { followLinks: false });

				walker.on('file', function(root, stat, next) {
					// Add this file to the list of files
					files.push(root + '/' + stat.name);
					next();
				});
				walker.on('directory',function(root,stat,next){
					
					dirs.push(root + '/' +stat.name);
					next();
				});
				walker.on('end', function() {
					console.log(files);
					console.log(dirs);

						
					fs_json_arr.push({"id" : root_dir, "parent" :"#", "text" : root_dir});
					dirs.forEach(function(dir){
						fs_json_arr.push({"id": dir,"parent" : dir.substring(0,dir.lastIndexOf("/")),"icon" : "fa fa-folder"});
					});
					files.forEach(function(file){						
						fs_json_arr.push({"id": file,"parent" : file.substring(0,file.lastIndexOf("/")),"icon" : "jstree-file"});
					});
					console.log(fs_json_arr);	
				});
				*/
				
				  // 현재 이코드의 문제점: directory 안에 (cpp코드나 py코드)와 디렉토리가 같이있으면 caught ERROR! 오류를 뿜는다. 왜그런지 잘 모르겠따.
				   
				console.log('Finished extracting') ;
				   
			   });
			   unzipper.extract({
				  path: '/user_storage/'+userEmail+'/'+date				  
			   });
			   
		
		/*	fs.createReadStream('/tmp2/'+temp_filename).pipe(unzip.Parse()).on('entry',function(entry){
			var fileName = entry.path;
			var type = entry.type; // Directory or File
			var size = entry.size;
			if (type === 'Directory'){ 
				
			}
			else if(type === 'File'){
				
			}
		});
		*/
			/*toString(readStream,function(err,msg){
				
				return res.render(path.join(__dirname ,'../templateLogReg/' ,'editor.ejs'),{userEmail: userEmail, userName: userName, readStream: msg});	
			});
			*/
			 // TODO: JSON 파일 write, getFiles 재귀함수 
			/*
			JSON.stringify(fs_json_arr);
			console.log(fs_json_arr);
			jsonWS = fs.createWriteStream('/user_storage/'+userName+'.json');
			
			jsonWS.write('[');
						
			
			for (var i = 0 ; i<fs_json_arr.length; i++){
				console.log(fs_json_arr[i]);
			}
			fs_json_arr.forEach(function(item){
				console.log(item);
				jsonWS.write(JSON.stringify(item));
				
			});
			jsonWS.write(']');
			jsonWS.end();
			*/
			//var io = req.app.get('socketio');
			
		  

        }
      }
    });
	
		    
		    
      });

     

      // track progress

      form.on('progress',function(byteRead,byteExpected){

           console.log(' Reading total  '+byteRead+'/'+byteExpected);

      });

     

      form.parse(req);

 

 

});

 

module.exports = router;

 



