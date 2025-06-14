
import { Router } from 'express'
import { adminLogin, approveUser, createAdmin, createUser, deleteUser, firstLogin, getAllApprovedUsers, getAllPendingUsers, getAllRejectedUsers, getLoggedUserProfile, getUserProfile, login, logout, rejectUser } from './user.controllers.js'
import { checkUniquenational_card, checkUniquePhone } from './user.middelwares.js'
import { authenticate, authorize, decodeAdminFromToken, decodeLoggedUserProfile, decodeUserFromToken } from '../../middelwares/auth.middelwares.js'
import { validate } from '../../middelwares/validation.middelware.js'
import { ROLES } from '../../utilies/enums.js'
import { connectToDB } from '../../../db/db.connect.js'


const userRouter = Router()

// Make Password Un hashed 
// Test Get codes 
// test check he is Rejcted at create Code 

await connectToDB()
userRouter.post('/create-user', checkUniquenational_card, checkUniquePhone, createUser)
userRouter.post('/create-admin', checkUniquenational_card, checkUniquePhone, createAdmin)
userRouter.delete('/delete-user',decodeAdminFromToken   , authorize([ROLES.ADMIN]), deleteUser)

userRouter.post('/login', login)
userRouter.post('/first-login',  firstLogin)
userRouter.patch('/approve-user', decodeAdminFromToken, authorize([ROLES.ADMIN]), approveUser)
userRouter.patch('/reject-user', decodeAdminFromToken, authorize([ROLES.ADMIN]), rejectUser)

userRouter.get('/all-pending-users', decodeAdminFromToken, authorize([ROLES.ADMIN]), getAllPendingUsers)
userRouter.get('/all-rejected-users', decodeAdminFromToken, authorize([ROLES.ADMIN]), getAllRejectedUsers)
userRouter.get('/all-approved-users', decodeAdminFromToken, authorize([ROLES.ADMIN]), getAllApprovedUsers)
userRouter.get('/profile', decodeUserFromToken, getUserProfile)

userRouter.get('/logged-user-profile', decodeLoggedUserProfile, getLoggedUserProfile)


userRouter.post('/login-admin', adminLogin)
userRouter.patch('/logout', authenticate, logout)


export default userRouter
