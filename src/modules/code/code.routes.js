





import { Router } from 'express'
import { authenticate, authorize , decodeUserFromToken} from '../../middelwares/auth.middelwares.js'
import { createCode } from './code.controller.js'
import { connectToDB } from '../../../db/db.connect.js'


const codeRouter = Router()

await connectToDB()
codeRouter.post('/create-code',decodeUserFromToken , createCode )


export default codeRouter
