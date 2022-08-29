const bodyParser = require('body-parser');
const cors = require('cors');
const express = require("express");
const port = process.env.PORT || 4000;
const app = express();

//bcrypt
const bcrypt = require("bcryptjs");



app.use(cors());
app.use(bodyParser.urlencoded({
    extended: true
  }));

// Connect to database
const mysql = require("mysql2");
const con = mysql.createConnection({
    host:"bet3evpp1vzht5klobur-mysql.services.clever-cloud.com",
    user:"ur9bbdmjful3npk7",
    port:3306,
    database:"bet3evpp1vzht5klobur",
    password:"WgppfOHyBeFqQ2KXF7uW"
});
con.connect((err)=>err ? console.log(err) : console.log("connected") );

// parse application/json
app.use(bodyParser.json());

app.post("/api/register", async (req,res)=>{
    const register_parameters = req.body
    console.log(req.body);
    const salt =  await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(register_parameters.password,salt);
    let sql = `INSERT INTO appUser() 
                VALUES(
                    "${register_parameters.email}",
                    "${register_parameters.pname}",
                    "${register_parameters.phone}",
                    "${hashedPassword}"
                )`
    
    console.log(sql);
    return new Promise((resolve,reject)=>{
        con.query(sql,(err,result)=> err ? reject(err) : resolve({message:result}));
    })
    .then((message)=>res.send("ROW_INSERTED"))
    .catch((err)=>err.code === "ER_DUP_ENTRY" ? res.send("DUP_ENTRY"): res.send("UNKNOWN_ERROR"));

});
app.post("/api/login", async (req,res)=>{
    const login_parameters = req.body
    console.log(req.body);
    let sql = `SELECT \`password\` FROM appUser 
                WHERE email= "${login_parameters.email}"
                `
    
    console.log(sql);
    return new Promise((resolve,reject)=>{
        con.query(sql,(err,result)=> err ? reject(err) : resolve(result));
    })
    .then((result)=> result.length == 0 ? false :  bcrypt.compareSync(login_parameters.password,result[0].password)) //
    .then((ifSuccess)=>ifSuccess ? res.send("LOGIN_SUCCESS") : res.send("LOGIN_UNSUCCESS"))
    .catch((err)=>console.log(err));
    
});
app.post("/api/registerVisitor", async (req,res)=>{
    const register_parameters = req.body
    console.log(req.body);
    let sql = "";
    if((register_parameters.sponsor_name === "")&& !(register_parameters.upi_number === "")) {
        sql = `INSERT INTO visitor(visitor_id,name,email,registration_number,phone_number,visitor_type,conference_day,if_sponsored,payment_method,upi_number,amount_paid) 
                VALUES(
                    "${register_parameters.visitor_id}",
                    "${register_parameters.name}",
                    "${register_parameters.email}",
                    "${register_parameters.registration_number}",
                    "${register_parameters.phone_number}",
                    "${register_parameters.visitor_type}",
                    "${register_parameters.conference_day}",
                    "${register_parameters.if_sponsored}",
                    "${register_parameters.payment_method}",
                    "${register_parameters.upi_number}",
                    "${register_parameters.amount_paid}"
                )`
        }
    else if((register_parameters.upi_number === "") && !(register_parameters.sponsor_name === "")) {
    sql = `INSERT INTO visitor(visitor_id,name,email,registration_number,phone_number,visitor_type,conference_day,if_sponsored,sponsor_name,payment_method,amount_paid) 
            VALUES(
            "${register_parameters.visitor_id}",
            "${register_parameters.name}",
            "${register_parameters.email}",
            "${register_parameters.registration_number}",
            "${register_parameters.phone_number}",
            "${register_parameters.visitor_type}",
            "${register_parameters.conference_day}",
            "${register_parameters.if_sponsored}",
            "${register_parameters.sponsor_name}",
            "${register_parameters.payment_method}",
            "${register_parameters.amount_paid}"
        )`
    }
    else if((register_parameters.upi_number === "") && (register_parameters.sponsor_name === "")) {
        sql = `INSERT INTO visitor(visitor_id,name,email,registration_number,phone_number,visitor_type,conference_day,if_sponsored,payment_method,amount_paid) 
                VALUES(
                "${register_parameters.visitor_id}",
                "${register_parameters.name}",
                "${register_parameters.email}",
                "${register_parameters.registration_number}",
                "${register_parameters.phone_number}",
                "${register_parameters.visitor_type}",
                "${register_parameters.conference_day}",
                "${register_parameters.if_sponsored}",
                "${register_parameters.payment_method}",
                "${register_parameters.amount_paid}"
            )`
    }
    else {
        sql = `INSERT INTO visitor(visitor_id,name,email,registration_number,phone_number,visitor_type,conference_day,if_sponsored,sponsor_name,payment_method,upi_number,amount_paid) 
                VALUES(
                "${register_parameters.visitor_id}",
                "${register_parameters.name}",
                "${register_parameters.email}",
                "${register_parameters.registration_number}",
                "${register_parameters.phone_number}",
                "${register_parameters.visitor_type}",
                "${register_parameters.conference_day}",
                "${register_parameters.if_sponsored}",
                "${register_parameters.sponsor_name}",
                "${register_parameters.payment_method}",
                "${register_parameters.upi_number}",
                "${register_parameters.amount_paid}"
            )`
    }
    


     return new Promise((resolve,reject)=>{
         con.query(sql,(err,result)=> err ? reject(err) : resolve({message:result}));
     })
     .then((message)=>res.send("ROW_INSERTED"))
     .catch((err)=>err.code === "ER_DUP_ENTRY" ? res.send("DUP_ENTRY"): res.send("UNKNOWN_ERROR"));

});

app.get("/api/getAllVisitorIds",(req,res)=>{
    let sql = `SELECT visitor_id FROM visitor`;
    return new Promise((resolve,reject)=>{
        con.query(sql,(err,result)=> err ? reject(err) : resolve({message:result}));
    })
    .then((message)=>res.send(message))
    .catch(()=>res.send("BAD"));
});

app.post("/api/addConsoleEntry/:id",(req,res)=>{
    const addConsoleEntryParameters = req.body;
    let sql = `INSERT INTO console_entry_permissions(visitor_id,session_id,session_title)
                VALUES(
                "${req.params.id}",
                "${addConsoleEntryParameters.session_id}",
                "${addConsoleEntryParameters.session_title}"
                )`;
    return new Promise((resolve,reject)=>{
        con.query(sql,(err,result)=> err ? reject(err) : resolve({message:result}));
    })
    .then((message)=>res.sendStatus(200))
    .catch((err)=>err.code === "ER_DUP_ENTRY" ? res.send("DUP_ENTRY"): res.send("UNKNOWN_ERROR"));
});

app.get("/api/sessionStatus",(req,res)=>{
    let sql  = `SELECT * FROM session_on`;
    return new Promise((resolve,reject)=>{
        con.query(sql,(err,result)=> err ? reject(err) : resolve({message:result}));
    })
    .then((message)=>res.send(message))
    .catch(()=>res.send("BAD"));
})

app.get("/api/getSessionTitle/:id",(req,res)=>{
    let sql = `SELECT DISTINCT session_title FROM console_entry_permissions WHERE session_id="${req.params.id}"`;
    return new Promise((resolve,reject)=>{
        con.query(sql,(err,result)=> err ? reject(err) : resolve({message:result}));
    })
    .then((message)=>res.send(message))
    .catch(()=>res.send("BAD"));
});

app.post("/api/addSession/:id",(req,res)=>{
    let sql = `INSERT INTO session_on(session_id) VALUES("${req.params.id}")`;
    return new Promise((resolve,reject)=>{
        con.query(sql,(err,result)=> err ? reject(err) : resolve({message:result}));
    })
    .then((message)=>res.sendStatus(200))
    .catch(()=>res.send("BAD"));
})

app.post("/api/deleteSession/:id",(req,res)=>{
    let sql = `DELETE FROM session_on WHERE session_id="${req.params.id}"`;
    return new Promise((resolve,reject)=>{
        con.query(sql,(err,result)=> err ? reject(err) : resolve({message:result}));
    })
    .then(()=>res.sendStatus(200))
    .catch(()=>res.send("BAD"));
})


app.get("/api/getPermission/:visitor_id/:session_id",(req,res)=>{
    let sql = `SELECT permissionGranted FROM console_entry_permissions WHERE visitor_id = "${req.params.visitor_id}" AND session_id="${req.params.session_id}"`;
    return new Promise((resolve,reject)=>{
        con.query(sql,(err,result)=> err ? reject(err) : resolve({message:result}));
    })
    .then((message)=>res.send(message))
    .catch(()=>res.send("BAD"));
})

app.post("/api/revokePermission/:visitor_id/:session_id",(req,res)=>{
    let sql = `UPDATE console_entry_permissions SET permissionGranted = 0  WHERE visitor_id = "${req.params.visitor_id}" AND session_id="${req.params.session_id}"`;
    return new Promise((resolve,reject)=>{
        con.query(sql,(err,result)=> err ? reject(err) : resolve({message:result}));
    })
    .then(()=>res.sendStatus(200))
    .catch(()=>res.send("BAD"));
})
app.get("/api/getAllVisitors",(req,res)=>{
    let sql = `SELECT * FROM visitor`;
    return new Promise((resolve,reject)=>{
        con.query(sql,(err,result)=> err ? reject(err) : resolve({message:result}));
    })
    .then((message)=>res.send(message))
    .catch(()=>res.send("BAD"));
});



app.listen(port,()=>console.log("Listening"));