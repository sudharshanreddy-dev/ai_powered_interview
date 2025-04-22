// import express from "express";
// import dotenv from "dotenv";
// import { auth_router } from "./route/auth.route.js";
// import cookieParser from "cookie-parser";

// //configurations
// dotenv.config();


// const app = express();

// //middleware
// app.use(cookieParser())
// app.use(express.urlencoded({ extended: true }));
// app.use(express.json())




// app.get('/test', (req, res) => {
//     res.send('test route wworking');
// })

// app.use('/auth', auth_router);



// app.listen(5000, () => {
//     console.log('server is running on port 5000');
// })


import { httpServer } from "./app.js";
import "./utils/socket.js";

httpServer.listen(5000, () => {
    console.log('server is running on port 5000');
});