const express=require("express");
const app=express();

const bodyParser=require("body-parser");

const mysql=require("mysql");

var cors=require("cors");//no idea what its used for
const { response } = require("express");
app.use(cors());

const jwt=require("jsonwebtoken");

//json parser
var jsonParser=bodyParser.json();

//url encoded
var urlParser=bodyParser.urlencoded({extended: false});

//Creating database connection
var con=mysql.createConnection({

    host: 'localhost',
    user: 'root',
    password: '',
    database: 'books'
    
});

con.connect((err)=>{
    if(err){
        throw err;
    }
    console.log("connected to database");
});

//Middleware for token verification
function verifyToken(req,res,next) {

    let authHeader=req.headers.authorization;
    if(authHeader==undefined){
        res.send({Error:"No token provided"})
    }
    //the authHeader contains two set of data: bearer and token. token is in second half,so we split it and take the token only
    let token=authHeader.split(" ")[1]; 
    jwt.verify(token,"secret",(err,decoded)=>{
        if(err){
            res.send({Invalid:"Invalid Token"})
        }
        else{
            next();
        }
    })
}

//Login 
app.post("/login",jsonParser,(req,res)=>{
    let user=req.body.username;
    let pass=req.body.password;
    if(user==undefined || pass==undefined){
        res.send({ERROR:"Authentication Failed"});
    }
    let q=`select name from users where username='${user}' and password=sha1('${pass}');`;
    con.query(q,(err,result)=>{
        if(err || result.length==0){
            res.send({error:"Login failed"})
        }
        else{
            let resp={
                // id : result[0].id,
                name : result[0].name
            }
        let token = jwt.sign(resp,"secret",{ expiresIn: 300})
        res.send({auth:"True",token:token});        
        }
    })
})

//View the details of all the books 
app.get("/",verifyToken,(req,res)=>{
    con.query("select * from details",(err,result,fields)=>{
        if(err){
            throw err;
        }          
        res.send(result);        
    });
});

//View the details of a selected book
app.get("/view/:ids",verifyToken,(req,res)=>{
    let id=req.params.ids;
    con.query("select * from details where id= "+id,(err,result,fields)=>{
        if(err){
            throw err;     
        } 
        res.send(result);
    })
})

//Enter a new book details
app.post("/new",jsonParser,verifyToken,(req,res)=>{
    let t=req.body.title; //title here is from postman
    let au=req.body.author;
    let desc=req.body.desc;
    let pr=req.body.price;

    let q=`insert into details (title,author,desciption,price) values('${t}','${au}','${desc}','${pr}')`;
    con.query(q,(err,result)=>{
        if(err){
            res.send({err:"err"});
        }
        else{
            res.send({success:"Inserted successfully"});
        }
    })
})

//Update the details of a book
app.patch("/edit",jsonParser,verifyToken,(req,res)=>{
    let t=req.body.title;
    let au=req.body.author;
    let desc=req.body.desciption;
    let pr=req.body.price; 
    let id=req.body.id;

    let q= `update details set title='${t}',author='${au}', desciption='${desc}',price='${pr}' where id=${id};`;
    con.query(q,(err,result)=>{
        if(err){
            res.send({error:"ERRO"})
        }
        else
        {
            res.send({success:"Updated successfully"})
        }
    })
})


//Delete a book details
app.delete("/delete/:id",verifyToken,(req,res)=>{
    let id=req.params.id;
    con.query('delete from details where id='+id,(err,result,fields)=>{
        if(err){
            throw err;
        }
        console.log("Deleted the details of books with id"+id);
    })
})


app.listen(8000,()=>{
    console.log("server running in port 8000");
});

