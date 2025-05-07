





import Code from "../../../db/models/code.model.js";
import User from "../../../db/models/user.model.js";
import { USERSTATUS } from "../../utilies/enums.js";

export const createCode = async (req, res) => {
    if (!req.user?.userName) {
        return res.status(401).json({ message: 'Unauthorized: Missing user' });
    }

    const { code } = req.body;
    const { userName } = req.user;
    console.log(userName)


    if (!code) {
        return res.status(400).json({ message: 'Code is required' });
    }
    const userCodesCount = await Code.countDocuments({ userName });
    const user = await User.findOne({ userName });
    // هنا كريم هيمسح  التوكن 
    //ممكن امسح اليوزر 
    if (user.status === USERSTATUS.REJECTED) return res.status(200).json({ sucess : false , status : "fail" , message: 'البيانات اللتي ادخلتها خاطئه' });

    if (user.status === USERSTATUS.APPROVED) {
        return res.status(200).json({ message: 'User is approved , your signed up' });
    }
    console.log(userCodesCount)

    if (userCodesCount >= 5) {
        return res.status(400).json({ message: 'You have reached the maximum number of codes' });
    }
    const newCode = new Code({
        userName,
        code,
    });
    await newCode.save();
    res.status(201).json({ message: 'Code created successfully', data: newCode });
}
export const getCodes = async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
  
    const [codes, total] = await Promise.all([
      Code.find().skip(skip).limit(limit),
      Code.countDocuments()
    ]);
  
    res.status(200).json({
      message: 'All Codes',
      status: "success",
      data: codes,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    });
  };
  
