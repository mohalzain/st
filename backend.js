import express, { json, urlencoded } from "express";
import dotenv from 'dotenv'
import mariadb from 'mariadb'
import crypto from 'crypto'
import cookieParser from "cookie-parser";

dotenv.config({path:'./enviroment.env'})
const path = process.cwd()
const app = express()
let sessions = {}

function checkSession(req,res,next){
    const keys = Object.keys(req.cookies)
    if (keys.length == 0){
        console.log('redirecting')
        res.status(401).send({reqstatus:'failed',message:'unauothirizes access'})
    } else {
        if (sessions[req.cookies.sessionId]){
            next()
        }
    }
}

app.get('/',(req,res)=>{
    res.sendFile(`${path}/public/homepage.html`)
})

app.use(express.urlencoded())
app.use(express.json())
app.use(express.static('./public'))




app.get('/login',(req,res)=>{
    res.sendFile(`${path}/public/login.html`)
})

app.post('/login',(req,res)=>{
    let data = req.body.data
    data =  Buffer.from(data,'base64')
    data = data.toString()
    data = data.split(':')
    const username = data[0]
    const password = crypto.createHash('SHA256').update(data[1]).digest('hex')
    console.log(username)
    console.log(password)
    mariadb.createConnection({host:process.env.HOST,user:process.env.USER,password:process.env.password,database:process.env.DATABASE})
    .then(conn=>{
        conn.query('SELECT * FROM Users WHERE username = ?',[username])
        .then(data=>{
            if (data.length != 0){
                console.log(data)
                if (data[0].username == username && data[0].password == password){
                    const sessionId = crypto.randomUUID()
                    sessions[sessionId] = {username:username,id:data[0].id}
                    console.log(sessions)
                    res.cookie('sessionId',sessionId ,{maxAge:1000 * 120})
                    res.status(200).send({reqstatus:'sucess',message:'user found'})
                    
                } else {
                    res.status(401).send({reqstatus:'failed',message:'password or username wrong'})
                }
                
            } else {
                res.status(401).send({reqstatus:'failed',message:'password or username wrong'})
            }
        }).catch(err=>{
            res.status(404).send({reqstatus:'failed',message:'system error'})
            console.log(`Couldnot Connect to the database try again: ${err}`)
        })
    })
})



app.get('/register',(req,res)=>{
    res.sendFile(`${path}/public/register.html`)
})

app.post('/register',(req,res)=>{
    let data = req.body.data
    data =  Buffer.from(data,'base64')
    data = data.toString()
    data = data.split(':')
    const username = data[0]
    const password = crypto.createHash('SHA256').update(data[1]).digest('hex')
    console.log(username)
    console.log(password)
    mariadb.createConnection({host:process.env.HOST,user:process.env.USER,password:process.env.password,database:process.env.DATABASE})
    .then(conn=>{
       conn.query('Insert INTO Users (username,password)  VALUES (?,?)',[username,password])
       .then(data=>{
            res.status(200).send({reqstatus:'success',message:'Account Created'})
        }).catch(err=>{
            console.log(`Querry Error: ${err}`)
            res.status(401).send({reqstatus:'failed',message:'Username Already Exist'})
        })
    }).catch(err=>{
        res.status(404).send({reqstatus:'failed',message:'system error'})
        console.log(`Couldnot Connect to the database try again: ${err}`)
    })

})



app.use(cookieParser())
app.use(checkSession)



app.get('/show',(req,res)=>{
    const keys = Object.keys(req.cookies)
    if (keys.length > 0){
        console.log(`show cookies: ${req.cookies.sessionId}`)
    res.status(200)
    }
    
})

app.post('/add-task',(req,res)=>{

    const session = req.cookies.sessionId
    console.log(session[session])
    console.log(sessions[session].username)
    console.log(sessions[session].id)
    if (sessions[session]){
        mariadb.createConnection({host:process.env.HOST,user:process.env.USER,password:process.env.password,database:process.env.DATABASE})
    .then(conn=>{
        conn.query('INSERT INTO users_tasks (title,priority,completed,user_id) VALUES (?,?,?,?) ',[req.body.title,req.body.priority,req.body.completed,sessions[session].id])
        .then(data=>{console.log(data); res.status(200).send(JSON.stringify({reqstatus:'sucess',message:'task-completed'}))})
        .catch(err=>{console.log(err); res.status(501).send({reqstatus:'failed',message:'error task didnt get added'})})
    })
    }
    
})

app.get('/render-tasks',(req,res)=>{
        
        const session = req.cookies.sessionId
        mariadb.createConnection({host:process.env.HOST,user:process.env.USER,password:process.env.password,database:process.env.DATABASE})
        .then(conn=>{
        conn.query('SELECT * FROM users_tasks WHERE user_id = ?',[sessions[session].id])
        .then(data=>{console.log(data); res.status(200).send(JSON.stringify(data))})
        .catch(err=>{console.log(err); res.status(501).send({reqstatus:'failed',message:'error cannot get tasks'})})
        })
        .catch(err=>{console.log(err); res.status(501).send({reqstatus:'failed',message:'error connect to db'})})
      
})

app.post('/completed-task',(req,res)=>{
    const session = req.cookies.sessionId
    console.log(req.body.completed)
    mariadb.createConnection({host:process.env.HOST,user:process.env.USER,password:process.env.password,database:process.env.DATABASE})
    .then(conn=>{
            conn.query('UPDATE users_tasks SET completed = ? WHERE title = ? AND user_id = ?',[req.body.completed,req.body.title,sessions[session].id])
            .then(data=>{console.log(data);res.status(200).send(JSON.stringify({status:'sucess',message:'task-completed'}))})
        })
    .catch(err=>{
        console.log(err); 
        res.status(405).send(JSON.stringify({status:'failed',message:'incompleted db'}))
    })
})

app.post('/delete-task',(req,res)=>{
    const session = req.cookies.sessionId
    console.log(req.body.title)
    mariadb.createConnection({host:process.env.HOST,user:process.env.USER,password:process.env.password,database:process.env.DATABASE})
    .then(conn=>{
            conn.query('DELETE FROM users_tasks WHERE title = ? AND user_id = ?',[req.body.title,sessions[session].id])
            .then(data=>{console.log(data);res.status(200).send(JSON.stringify({status:'sucess',message:'task-deleted'}))})
        })
    .catch(err=>{
        console.log(err); 
        res.status(405).send(JSON.stringify({status:'failed',message:'incompleted db'}))
    })
})



setInterval(()=>{console.log(sessions)},10000)

app.listen(process.env.PORT,process.env.ADDRESS,(error)=>{
    if (error) {
        console.log(`An Error Occured:\n ${error}`)
    }
    console.log(`Server Running On: ${process.env.ADDRESS}:${process.env.PORT}`)
})