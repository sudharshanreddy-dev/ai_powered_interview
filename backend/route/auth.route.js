import { Router } from "express";
import { register, login, refresh_access_token, logout } from "../controller/auth.controller.js";
import validate from "../middleware/validate.js";
import { registerSchema, loginSchema } from "../schema/user.schema.js";

export const auth_router = Router();

auth_router.get('/test',(req,res)=>{
    res.send("auth testing route working")
})



auth_router.post('/register',validate(registerSchema),register)
auth_router.post('/login',validate(loginSchema),login)
auth_router.get('/refresh', refresh_access_token)
auth_router.post('/logout',logout)

