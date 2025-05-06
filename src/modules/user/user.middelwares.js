import User from "../../../db/models/user.model.js";
import { AppError, catchAsyncError } from "../../utilies/error.js";



export const checkUniquenational_card = catchAsyncError(async (req, res, next) => {
    const { national_card } = req.body;
  
    if (national_card) {
      const userIsExist = await User.findOne({ national_card });
      if (userIsExist) {
        throw new AppError('National card is already used', 400);
      }
    }
  
    next();
  });
  
  export const checkUniquePhone = catchAsyncError(async (req, res, next) => {
    const { phone } = req.body;
  
    if (phone) {
      const userIsExist = await User.findOne({ phone });
      if (userIsExist) {
        throw new AppError('Phone number is already used', 400);
      }
    }
  
    next();
  });
  