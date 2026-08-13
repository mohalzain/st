import express, { json, urlencoded } from "express";
import dotenv from 'dotenv'
import mariadb from 'mariadb'

dotenv.config({path:'./enviroment.env'})
const path = process.cwd()
const app = express()


app.use(express.urlencoded())
app.use(express.json())
app.use(express.static('./public'))

app.get('/',(req,res)=>{
    res.sendFile(`${path}/public/index.html`)
})
app.post('/add-task',(req,res)=>{
    mariadb.createConnection({host:process.env.HOST,user:process.env.USER,password:process.env.password,database:process.env.DATABASE})
    .then(conn=>{
        conn.query('INSERT INTO tasks (title,priority,completed) VALUES (?,?,?)',[req.body.title,req.body.priority,req.body.completed])
        .then(data=>{console.log(data); res.status(200).send(JSON.stringify({status:'sucess',message:'task-completed'}))}).catch(err=>{console.log(err)})
    })
})

app.get('/render-tasks',(req,res)=>{
    mariadb.createConnection({host:process.env.HOST,user:process.env.USER,password:process.env.password,database:process.env.DATABASE})
    .then(conn=>{
        conn.query('SELECT * FROM tasks').then(data=>{console.log(data); res.status(200).send(JSON.stringify(data))}).catch(err=>{console.log(err)})
    })
})

app.post('/completed-task',(req,res)=>{
    console.log(req.body.completed)
    mariadb.createConnection({host:process.env.HOST,user:process.env.USER,password:process.env.password,database:process.env.DATABASE})
    .then(conn=>{
            conn.query('UPDATE tasks SET completed = ? WHERE title = ?',[req.body.completed,req.body.title])
            .then(data=>{console.log(data);res.status(200).send(JSON.stringify({status:'sucess',message:'task-completed'}))})
        })
    .catch(err=>{
        console.log(err); 
        res.status(405).send(JSON.stringify({status:'failed',message:'incompleted db'}))
    })
})

app.post('/delete-task',(req,res)=>{
    console.log(req.body.title)
    mariadb.createConnection({host:process.env.HOST,user:process.env.USER,password:process.env.password,database:process.env.DATABASE})
    .then(conn=>{
            conn.query('DELETE FROM tasks WHERE title = ?',[req.body.title])
            .then(data=>{console.log(data);res.status(200).send(JSON.stringify({status:'sucess',message:'task-deleted'}))})
        })
    .catch(err=>{
        console.log(err); 
        res.status(405).send(JSON.stringify({status:'failed',message:'incompleted db'}))
    })
})




app.listen(process.env.PORT,process.env.ADDRESS,(error)=>{
    if (error) {
        console.log(`An Error Occured:\n ${error}`)
    }
    console.log(`Server Running On: ${process.env.ADDRESS}:${process.env.PORT}`)
})