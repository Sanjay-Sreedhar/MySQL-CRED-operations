const express=require("express");
const app=express();
const bodyParser=require("body-parser");
const mysql=require("mysql");
var cors=require("cors");//no idea what its used for
app.use(cors());

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

//View the details of all the books 
app.get("/",(req,res)=>{
    con.query("select * from details",(err,result,fields)=>{
        if(err){
            throw err;
        }          
        res.send(result);        
    });
});

//View the details of a selected book
app.get("/view/:ids",(req,res)=>{
    let id=req.params.ids;
    con.query("select * from details where id= "+id,(err,result,fields)=>{
        if(err){
            throw err;     
        } 
        res.send(result);
    })
})

//Enter a new book details
app.post("/new",jsonParser,(req,res)=>{
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
app.patch("/edit",jsonParser,(req,res)=>{
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
app.delete("/delete/:id",(req,res)=>{
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

