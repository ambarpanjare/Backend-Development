import {asyncHandler} from "../utils/asyncHandler.js"
import {ApiError} from "../utils/ApiError.js"
import {User} from "../models/user.model.js" 
import {uploadOnCloudinary} from "../utils/cloudinary.js"
import {ApiResponse} from "../utils/ApiResponse.js"

const registerUser = asyncHandler(async(req,res)=>{
    // get user details from frontend
    // validation - not empty
    // check if user already exists : username,email
    // check for images, check for avtar
    // upload them to cloudnary, avtar
    // create user object- create entry in db
    // remove password and refresh token field from response
    // check for user creation
    // return res
    
    const {fullName,email,username,password}=req.body
    console.log("email : ",email);

    // validation- not empty
    if(
        [fullName,email,username,password].some((field)=>
        field?.trim()==="")
    ){
        throw new ApiError(400,"All fields are required")
    } 

    // check if user already exists : username,email
    const existedUser = User.findOne({
        $or:[{ username },{ email }]
    })
    if(existedUser){
        throw new ApiError(409,"User already exists")
    }

    const avtarLocalPath = req.files?.avtar[0]?.path
    const coverImageLocalPath = req.files?.coverImage[0]?.path

    if(!avtarLocalPath){
        throw new ApiError(400,"Avtar is required")
    }

    // upload them to cloudnary, avtar
    const avtar = await uploadOnCloudinary(avtarLocalPath)
    const coverImage = await uploadOnCloudinary(coverImageLocalPath)

    if(!avtar){
        throw new ApiError(400,"Failed to upload avtar")
    }
    // create user object- create entry in db
    const user =await User.create({
        fullName,
        avtar:avtar.url,
        coverImage:coverImage?.url || "",
        email,
        password,
        username:username.toLowerCase()
    })

    // remove password and refresh token field from response
    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    )
    // check for user creation
    if(!createdUser){
        throw new ApiError(500,"Something went wrong while registering the user")
    }
    // return res
    return res.status(201).json(
        new ApiResponse(200,createdUser,"User registered successfully")
    )

})

export {registerUser} 