var express=require('express'),

app=express();

app.use(express.static(__dirname+'/public'));


app.get('/',function(req,res){
      res.sendfile('views/index.html')
     });
app.listen(8080);
console.log('server run on port 8080');