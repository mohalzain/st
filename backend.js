import express, { json, urlencoded } from "express";
import dotenv from 'dotenv'


dotenv.config({path:'./enviroment.env'})
const path = process.cwd()
const app = express()


app.use(express.urlencoded())
app.use(express.json())







app.listen(process.env.PORT,process.env.ADDRESS,(error)=>{
    if (error) {
        console.log(`An Error Occured:\n ${error}`)
    }
    console.log(`Server Running On: ${process.env.ADDRESS}:${process.env.PORT}`)
})