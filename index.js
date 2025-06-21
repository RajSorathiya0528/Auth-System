import express from 'express';
import dotenv from 'dotenv'
import cors from 'cors'
import connection from './utils/db.js'
import router from './Route/User.Route.js'
import cookieParser from 'cookie-parser';

dotenv.config()

const app = express();
const port = process.env.PORT;

connection()
app.use(cors({
    origin : "http://localhost:3000",
    methods : ['GET', 'POST', 'DELETE', 'OPTION'],
    allowedHeaders : ['Content-Type','Authorization'],
    credentials : true
}))
app.use(express.json())
app.use(express.urlencoded({extended : true}))
app.use(cookieParser());

app.use('/api/v1/users', router);

app.get("/", (req, res) => {
    res.send("hello world!");
});

app.listen(port, () => {
    console.log(`app listening on port ${port}`)
})