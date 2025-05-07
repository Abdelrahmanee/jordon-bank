import User from "../../db/models/user.model.js";
import { ROLES } from "../utilies/enums.js";
import { AppError, catchAsyncError } from "../utilies/error.js";
import jwt, { decode } from 'jsonwebtoken';



const JWT_SECRET = process.env.JWT_SECRET ;
export const authenticate = catchAsyncError(async (req, res, next) => {
  const authHeader = req.headers.authorization;
  console.log(authHeader)

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new AppError('Authorization token missing or malformed', 401);
  }

  const token = authHeader.split(' ')[1];

  let decoded;
  try {
    decoded = jwt.verify(token, JWT_SECRET);
  } catch (err) {
    throw new AppError('Invalid or expired token', 401);
  }

  const user = await User.findOne({ userName: decoded.userName });
  if (!user) throw new AppError('User not found', 404);

  req.user = user.toObject();
  delete req.user.password;
  delete req.user.__v;
  delete req.user.createdAt;
  delete req.user.updatedAt;
  next();
});
export const authorize = (roles = Object.values(ROLES)) => {
    return (req, res, next) => {
      console.log(req.user.role)
        if (roles.includes(req.user.role)) return next()
        return next(new AppError('you not allowed to access this endpoin', 403))
    }
}


export const decodeUserFromToken = catchAsyncError(async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) return next();
  
  console.log("first" , authHeader)
  console.log("first")
  const token = authHeader.split(" ")[1];
  console.log("first" , token)

    const decoded = jwt.verify(token, JWT_SECRET);
    if(!decoded?.userName) return res.json({ message: 'Invalid token ,Name Required Here' });
    const user = await User.findOne({ userName: decoded.userName });
    if (user) {
      req.user = user.toObject();
      delete req.user.password;
      delete req.user.__v;
      delete req.user.createdAt;
      delete req.user.updatedAt;
    
  } 
  next();
});

export const decodeAdminFromToken = catchAsyncError(async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) return next();
  const token = authHeader.split(" ")[1];
  if(!token) return next(new AppError('Token not provided', 401));
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findOne({ _id : decoded.id , role : ROLES.ADMIN });
    if (user) {
      req.user = user.toObject();
      delete req.user.password;
      delete req.user.__v;
      delete req.user.createdAt;
      delete req.user.updatedAt;
    }
  } catch (err) {
    return next();
  }
  next();
});
export const decodeLoggedUserProfile = catchAsyncError(async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) return next();
  const token = authHeader.split(" ")[1];
  if(!token) return next(new AppError('Token not provided', 401));
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    console.log(decoded)
    const user = await User.findOne({ _id : decoded.id  });
    console.log(user)
    if(!user) return next(new AppError('User not found', 404));
    
    if (user) {
      req.user = user.toObject();
      delete req.user.password;
      delete req.user.__v;
      delete req.user.createdAt;
      delete req.user.updatedAt;
    }
  } catch (err) {
    return next();
  }
  next();
});
