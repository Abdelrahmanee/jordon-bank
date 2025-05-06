





import { Router } from 'express'
import { authenticate, authorize , decodeUserFromToken} from '../../middelwares/auth.middelwares.js'
import { createCode } from './code.controller.js'


const codeRouter = Router()


codeRouter.post('/create-code',decodeUserFromToken , createCode )


export default codeRouter
