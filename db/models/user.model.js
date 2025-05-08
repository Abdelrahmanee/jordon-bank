import { Schema, model } from 'mongoose';
import bcrypt from 'bcrypt';
import { ROLES, USERSTATUS } from '../../src/utilies/enums.js';

const userSchema = new Schema({
  national_card: {
    type: String,
    sparse: true,
    // required: true,
  },
  userName:{
    sparse: true,
    type: String,
  },
  password: {
    type: String,
    required: true,
  },
  phone: {
    type: String,
    sparse: true,
    // required: true,
  },
status: {
    type: String,
    enum: Object.values(USERSTATUS),
    default: USERSTATUS.PENDING,
  },
  role: {
    type: String,
    enum: Object.values(ROLES),
    default: ROLES.USER,
  }
}, { timestamps: true });

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err) {
    next(err);
  }
});

const User = model('User', userSchema);
export default User;
