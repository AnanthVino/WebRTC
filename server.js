
var express=require('express'),

app=express(),
http=require('http'),
server=http.createServer(app);
var io=require('socket.io').listen(server);
var mongo=require('mongojs'); 
var db='login';
var collection=['vinoth'];
var connect=mongo.connect(db,collection);
app.use(express.json());
app.use(express.urlencoded());
app.use(express.static(__dirname+'/public'));


app.get('/',function(req,res){
      res.sendfile('views/log.html')
     });

    app.post('/signup',function(req,res){
      console.log(req.body);
         connect.vinoth.save({firstname:req.body.firstname,lastname:req.body.lastname,emailid:req.body.email,password:req.body.password,conpassword:req.body.password2,month:req.body.month1,day:req.body.day1,year:req.body.year1},function(err,data){
                            if(!err)
                            {
                              res.sendfile('views/log.html');
                             }else
                           {
                           console.log(err);
                            }
                               
          });
     });

    app.get('/signup',function(req,res)
    {
          res.sendfile('views/video.html');
    });
          
     app.post('/login',function(req,res){
      console.log(req.body);
         connect.vinoth.findOne({username:req.body.inputEmail1,password:req.body.password},function(err,data){
                                     
                                     console.log(data);
                                      if(data)
                                      {
                                        var success={url:'/home',data:'success'}
                                        res.send(success);
                                      }else
                                      {
                                        var data={data:'invalid username/password'};
                                        res.send(data);
                                      }
                                    

         });
          
     });

         app.get('/home',function(req,res){
                        res.sendfile('views/chat.html');
    });

     

     

     

     
var onlineuser=[];
var socketid={};
  
  io.sockets.on('connection',function(socket){
          socket.on('myname',function(data){
                      socket.username=data.username;
                   onlineuser.push(data.username);
                   socketid[socket.username]=socket;
                   console.log(onlineuser);
                   io.sockets.emit('onlineuser',onlineuser);
              });

          socket.on('callRequest',function(data){

              socketid[data.peerid].emit('callRequest',{peerid:socket.username});
          });
          socket.on('accept',function(data){

              socketid[data.peerid].emit('accept',{peerid:socket.username});
          });
           socket.on('decline',function(data){

              socketid[data.peerid].emit('decline',{peerid:socket.username});
          });
           socket.on('busy',function(data){
            socketid[data.peerid].emit('busy','data');

           });
           socket.on('sendChat',function(data)
           {
            socketid[data.peerid].emit('receivePeer',{msg:data.msg,peerid:socket.username});
           })
          socket.on('disconnect',function()
          {
              var i=onlineuser.indexOf(socket.username);
                 onlineuser.splice(i,1);
              io.sockets.emit('onlineuser',onlineuser);
          });
  });


server.listen(8080);
console.log('server run on port 8080');
 