var express    = require("express");
const cookieParser = require('cookie-parser');
var mysql      = require('mysql');
var fs = require('fs');
var bodyParser = require("body-parser")
var methodOverride = require("method-override")
var logger = require("morgan")
// Dependencies


var connection = mysql.createConnection({
  host     : '127.0.0.1',
  user     : 'root',
  password : '=8cHCYpJ',
  database : 'tlpl',
  port: '3306',
  insecureAuth:true,
  multipleStatements: true
});
connection.connect(function(err){
if(!err) {
    console.log("Database is connected ... nn");
} else {
    console.log("Error connecting database ... nn"+err);
}
});


var app = express();
app.use(methodOverride("_method"))
app.use(express.static(__dirname+'/template'));
app.use(bodyParser.json({limit:'50mb'}));
app.use(bodyParser.urlencoded({limit:'50mb', extended: true}));

app.use(cookieParser("my very well kept secret"))


app.use(function(req, res, next) {
    //0 is control group, 1 is experimental group
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
    next();
});

app.get('/home', function(req,res){
    res.sendFile(__dirname + '/template/template.html')
})

app.listen(8000);
