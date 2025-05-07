





import { Router } from 'express'
import { authenticate, authorize , decodeUserFromToken} from '../../middelwares/auth.middelwares.js'
import { createCode, getCodes } from './code.controller.js'
import { connectToDB } from '../../../db/db.connect.js'
import { ROLES } from '../../utilies/enums.js'


const codeRouter = Router()

await connectToDB()
codeRouter.post('/create-code',decodeUserFromToken , createCode )
codeRouter.get('/get-codes',decodeAdminFromToken ,  authorize([ROLES.ADMIN]) , getCodes )


export default codeRouter
