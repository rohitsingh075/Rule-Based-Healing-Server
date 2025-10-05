import { User } from "../models/user.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { APIError } from "../utils/APIerror.js";
import { APIresponse } from "../utils/APIresponse.js"
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";



const registerUser = asyncHandler(async (req, res) => {
    try {

        const { username, email, password } = req.body;

        // Required Fields Check
        if (!username || !email || !password) {
            throw new APIError(400, "All fields are required.");
        }

        // Empty String Check
        if ([username, email, password].some(field => field.trim() === "")) {
            throw new APIError(400, "No empty fields are allowed.");
        }

        // Check for Existing User
        const existedUser = await User.findOne({
            $or: [{ username }, { email }],
        });

        if (existedUser) {
            throw new APIError(409, "User with email or username already exists.");
        }

        // Hash Password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create User
        const user = await User.create({
            email,
            password: hashedPassword,
            username: username.toLowerCase(),
        });

        // Remove Sensitive Info
        const createdUser = await User.findById(user._id).select("-password -refreshToken");

        // if (!createdUser) {
        //     throw new APIError(500, "Something went wrong while registering the user.");
        // }

        // Success Response
        return res.status(201).json(
            new APIresponse(
                201,
                { user: createdUser },
                "User registered successfully"
            )
        );
    } catch (error) {
        console.log("Error occured at user.controller.js at /register route", error);
        throw new APIError(500, "Something went wrong while registering the user.", error.message);
    }
});



//login user controller

const loginUser = asyncHandler(async (req, res) => {
    try {

        // console.log("hitting the login route"); 

        // Get credentials from request body
        const { email, username, password } = req.body;

        // Check if either email or username is provided (but not necessarily both)
        if (!email && !username) {
            throw new APIError(400, "Either email or username is required");
        }

        // Check if password is provided
        if (!password) {
            throw new APIError(400, "Password is required");
        }

        // Build query based on provided credentials
        const query = {};
        if (email) {
            query.email = email;
        } else if (username) {
            query.username = username;
        }

        // Find user based on provided identifier (email or username)
        const user = await User.findOne(query);

        // If user doesn't exist
        if (!user) {
            throw new APIError(404, "User does not exist");
        }

        // Verify password
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            throw new APIError(401, "Invalid credentials");
        }
        // console.log("generating token");
        // Generate JWT token


        const token = jwt.sign({
            email: user.email,
            _id: user._id
        }, process.env.JWT_KEY, { expiresIn: "1d" });

        //storing the token is res
        res.cookie("token", token, {
            httpOnly: true,
            secure: false,
            sameSite: "Lax",
            path:"/",
            maxAge: 24 * 60 * 60 * 1000,//1 day
        });

        console.log("generated token", token);
        res.send('logged in successfully ');
    }
    catch (error) {
        console.log("Error occurred at user.controller.js at /login route", error);

        // Here's the key change: Re-throw the original error if it's an APIError
        if (error instanceof APIError) {
            throw error; // This preserves the original status code and message
        }

        // Otherwise, throw a generic error
        throw new APIError(500, "Something went wrong while logging in");

    }
});

const logoutUser = asyncHandler(async (req, res) => {
    try {
        const token1=req.cookies.token;
        console.log("Cookies before clearing:", token1);
        res.clearCookie("token", {
            httpOnly: true,
            secure: false,
            sameSite: "Lax",
            path: "/"
        });
        
        console.log("Cookies after clearing:", req.cookies.token);
        res.status(200).json(new APIresponse(200, null, "User logged out successfully"));
    } catch (error) {
        console.log("Error occurred at user.controller.js at /logout route", error);
        throw new APIError(500, "Something went wrong while logging out");
    }
});


export { loginUser, registerUser, logoutUser };

