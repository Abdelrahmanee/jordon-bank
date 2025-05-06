




import { Router } from "express"
import userRouter from "../modules/user/user.routes.js"
import codeRouter from "../modules/code/code.routes.js"

const v1_router = Router()

v1_router.use('/users', userRouter)
v1_router.use('/code', codeRouter)


export default v1_router