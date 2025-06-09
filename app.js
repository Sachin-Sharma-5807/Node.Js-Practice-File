import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import {createServer} from 'http';
import userRoute from './routes/employee.js';

const app = express();
 
const server = createServer(app);
 
app.use(cors());
app.use(bodyParser.json());

app.get('/', (req, res) => {
    res.json({message: "Hello from the server"});
})
 
// routes
app.use('/global', userRoute);

 

console.log(`Database connected to url`)
 

server.listen(8080, "127.0.0.1", () =>{
    console.log(`Server is running on http://127.0.0.1:8080`);
})