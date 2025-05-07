import User from "../../../db/models/user.model.js";
import { ROLES, USERSTATUS } from "../../utilies/enums.js";
import { AppError, catchAsyncError } from "../../utilies/error.js";
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

import dotenv from 'dotenv'
dotenv.config();
const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = '7d';

export const createUser = catchAsyncError(async (req, res) => {
  const { userName, phone, national_card, password } = req.body;

  const hasUsernameLogin = userName && password;
  const hasPhoneLogin = phone && national_card && password;

  if (!hasUsernameLogin && !hasPhoneLogin) {
    throw new AppError(
      'You must provide either (userName + password) or (phone + national_card + password)',
      400
    );
  }

  const duplicateQuery = hasUsernameLogin ? { userName } : { phone, national_card };

  const isExists = await User.findOne(duplicateQuery);
  if (isExists) throw new AppError('User already exists', 400);

  const newUser = new User({
    userName: userName?.trim(),
    phone: phone?.trim(),
    national_card: national_card?.trim(),
    password: password.trim(),
    status: USERSTATUS.PENDING,
    role: ROLES.USER,
  });
  await newUser.save();

  const tokenPayload = {
    id: newUser._id,
    role: newUser.role,
    ...(newUser.userName && { userName: newUser.userName }),
  };

  const token = jwt.sign(tokenPayload, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
  });

  const user = await User.findById(newUser._id).select('-password');
  res.status(201).json({ message: 'User created successfully', data: user, token });
});


export const approveUser = catchAsyncError(async (req, res) => {
  await handleUserStatusChange(req, res, USERSTATUS.APPROVED, 'User Approved successfully');
});

export const rejectUser = catchAsyncError(async (req, res) => {
  await handleUserStatusChange(req, res, USERSTATUS.REJECTED, 'User Rejected successfully');
});

const handleUserStatusChange = async (req, res, targetStatus, successMessage) => {
  const { userId } = req.body;

  const user = await User.findById(userId);
  if (!user) throw new AppError('User not found', 404);

  if (user.status === targetStatus) {
    throw new AppError(`User already ${targetStatus.toLowerCase()}`, 400);
  }

  user.status = targetStatus;
  await user.save();

  const userData = user.toObject();
  delete userData.password;
  delete userData.__v;
  delete userData.createdAt;
  delete userData.updatedAt;

  res.status(200).json({
    message: successMessage,
    data: userData,
  });
};



export const createAdmin = catchAsyncError(async (req, res) => {
  const { national_card, phone, password } = req.body;
  const isExists = await User.findOne({ national_card, phone });
  if (isExists) throw new AppError('Admin already exists', 400);
  const newUser = new User({
    national_card,
    phone,
    password,
    status: USERSTATUS.APPROVED,
    role: ROLES.ADMIN,
  });

  await newUser.save();
  const tokenPayload = {
    id: newUser._id,
    role: newUser.role,
  };
  console.log("Role" + newUser.role)
  const token = jwt.sign(tokenPayload, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
  })
  const user = await User.findById(newUser._id)
  res.status(201).json({ message: 'Admin created successfully', data: user, token });
})
export const getAllPendingUsers = catchAsyncError(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  const filter = { role: ROLES.USER, status: USERSTATUS.PENDING };
  const [users, total] = await Promise.all([
    User.find(filter)
      .select('-__v -createdAt -updatedAt -password')
      .skip(skip)
      .limit(limit),
    User.countDocuments(filter),
  ]);

  res.status(200).json({
    message: 'All Pending Users',
    data: users,
    pagination: {
      total,
      page,
      limit,
      pages: Math.ceil(total / limit),
    },
  });
});

export const getAllRejectedUsers = catchAsyncError(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  const filter = { role: ROLES.USER, status: USERSTATUS.REJECTED };
  const [users, total] = await Promise.all([
    User.find(filter)
      .select('-__v -createdAt -updatedAt -password')
      .skip(skip)
      .limit(limit),
    User.countDocuments(filter),
  ]);

  res.status(200).json({
    message: 'All Rejected Users',
    data: users,
    pagination: {
      total,
      page,
      limit,
      pages: Math.ceil(total / limit),
    },
  });
});

export const getAllApprovedUsers = catchAsyncError(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  const filter = { role: ROLES.USER, status: USERSTATUS.APPROVED };
  const [users, total] = await Promise.all([
    User.find(filter)
      .select('-__v -createdAt -updatedAt -password')
      .skip(skip)
      .limit(limit),
    User.countDocuments(filter),
  ]);

  res.status(200).json({
    message: 'All Approved Users',
    data: users,
    pagination: {
      total,
      page,
      limit,
      pages: Math.ceil(total / limit),
    },
  });
});


export const login = catchAsyncError(async (req, res, next) => {
  const { phone, national_card, password } = req.body;

  const user = await User.findOne({ phone , national_card });

  if (!user) {
    throw new AppError("Invalid credentials. Please check your phone and national ID.", 401);
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    throw new AppError("Incorrect password.", 401);
  }

  if (user.role === ROLES.USER && user.status === USERSTATUS.PENDING) {
    throw new AppError("Your account is not approved yet.", 403);
  }
  if (user.status === USERSTATUS.REJECTED) {
    throw new AppError("Your account is rejected.", 403);
  }

  const token = jwt.sign(
    {
      id: user._id,
      phone: user.phone,
      national_card: user.national_card,
      role: user.role,
    },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );

  const userData = user.toObject();
  delete userData.password;
  delete userData.__v;
  delete userData.createdAt;
  delete userData.updatedAt;

  res.status(200).json({
    message: "Logged in successfully.",
    token,
    data: userData,
  });
});

export const deleteUser = catchAsyncError(async (req, res, next) => {
  const { userId } = req.body;

  const user = await User.findById(userId);
  if (!user) throw new AppError('User not found', 404);

  await user.deleteOne(); 

  res.status(200).json({ message: "User is deleted successfully" });
});
export const logout = catchAsyncError(async (req, res, next) => {
  await User.findByIdAndUpdate(req.user._id, { isLoggedOut: true, status: USERSTATUS.OFFLINE })
  res.status(200).json({ message: "Logged out success" })
})

export const getUserProfile = catchAsyncError(async (req, res, next) => {
  console.log(req.user)
  const user = await User.findById(req.user._id).select('-password -__v -createdAt -updatedAt')
  if (!user) throw new AppError('User not found', 404)
  res.status(200).json({ message: 'User profile', data: user })
})

export const adminLogin = catchAsyncError(async (req, res, next) => {
  const { phone, national_card, password } = req.body;
  const admin = await User.findOne({ phone, national_card, role: ROLES.ADMIN }).select(' -__v -createdAt -updatedAt')
  if (!admin) {
    throw new AppError("Invalid credentials. Please check your phone and national ID.", 401);
  }
  const isMatch = await bcrypt.compare(password, admin.password);
  if (!isMatch) {
    throw new AppError("Incorrect password.", 401);
  }
  const tokenPayload = {
    id: admin._id,
    role: admin.role,
  };
  const token = jwt.sign(tokenPayload, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
  })
  const adminObj =  admin.toObject()
  delete adminObj.password
  delete adminObj.__v
  res.status(200).json({ status : true, message: 'User profile', data: adminObj , token })
})


export const firstLogin = catchAsyncError(async (req, res, next) => {
  const { phone, national_card, password } = req.body;

  if (!phone || !national_card || !password) {
    throw new AppError("Phone, national ID, and password are required", 400);
  }

  // Check if phone already exists
  const phoneExists = await User.findOne({ phone });
  if (phoneExists) {
    throw new AppError("Phone number already in use", 400);
  }

  // Check if national_card already exists
  const nationalCardExists = await User.findOne({ national_card });
  if (nationalCardExists) {
    throw new AppError("National ID already in use", 400);
  }

  const newUser = new User({
    phone: phone.trim(),
    national_card: national_card.trim(),
    password: password.trim(), 
    status: USERSTATUS.PENDING,
    role: ROLES.USER,
  });

  await newUser.save();

  const token = jwt.sign(
    {
      id: newUser._id,
      phone: newUser.phone,
      national_card: newUser.national_card,
      role: newUser.role,
    },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );

  const userData = newUser.toObject();
  delete userData.password;
  delete userData.__v;
  delete userData.createdAt;
  delete userData.updatedAt;

  res.status(201).json({
    status: true,
    message: "User registered and logged in successfully.",
    token,
    data: userData,
  });
});


export const getLoggedUserProfile = catchAsyncError(async (req, res, next) => {
  const user = await User.findById(req.user._id).select('-password -__v -createdAt -updatedAt')
  if (!user) throw new AppError('User not found', 404)

  res.status(200).json({ message: 'User profile', data: user })
})

