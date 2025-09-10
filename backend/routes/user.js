import express from "express"
import { getUsers, login, logout, signup, updateUser } from "../controllers/user.js";
import {authenticate} from "../middlewares/auth.js"



const router = express.Router()

router.post("/signup", signup)
router.post("/login", login)
router.post("/logout", logout)

router.get("/users",authenticate ,getUsers)
router.put("/update-user", authenticate,updateUser)



export default router