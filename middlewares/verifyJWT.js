import { User } from "../models/user.model.js";
import { APIError } from "../utils/APIerror.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from 'jsonwebtoken'


export const verifyJWT  = asyncHandler(async (req,res,next)=>{
    try {

        console.log("auth working started");
        const token = req.cookies.token || req.header("Authorization")?.replace("Bearer ", "");
        //if token is not present
        if (!token) {
            console.log("auth working started");
            throw new APIError(401,"Unauthorized request")
        };
        
        const decodedInfo = jwt.verify(token,process.env.JWT_KEY);
        // console.log("SIGNATURE:",decodedInfo);
        
        const user = await User.findById(decodedInfo?._id).select("-password ")
        if(!user){
            throw new APIError(401,"Invalid Access Token");
        }
        req.user = user;
        next()
    } catch (error) {
        throw new APIError(401,error?.message || "Invalid Access Token")
    }
    
}) 
