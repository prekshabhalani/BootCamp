let User = require("../models/user.model");
let ErrorResponse = require("../utils/errorResponse");
let asyncHandler = require("../middlewares/async");

//@desc Get all users
//@route GET/api/v1/auth/users
//@access Private/admin

exports.getUsers = asyncHandler(async (req, res, next) => {
    res.status(200).json(res.advancedResults);
});

//@desc Get single user
//@route GET/api/v1/auth/users/:id
//@access Private/admin

exports.getUser = asyncHandler(async (req, res, next) => {
    const user =await User.findById(req.params.id);
    res.status(200)
        .json({
            success: true,
            data: user
        })
});


//@desc Create user
//@route POST/api/v1/auth/users
//@access Private/admin

exports.createUser = asyncHandler(async (req, res, next) => {
    const user =await User.create(req.body);
    res.status(201).json({
        success: true,
        data: user
    })
});


//@desc Update user
//@route PUT/api/v1/auth/users
//@access Private/admin

exports.updateUser = asyncHandler(async (req, res, next) => {
    const user = await User.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true
    });
    res.status(200)
        .json({
            success: true,
            data: user
        })
});

//@desc Delete user
//@route DELETE/api/v1/auth/users
//@access Private/admin

exports.deleteUser = asyncHandler(async (req, res, next) => {
    const user =await User.findByIdAndDelete(req.params.id);
    res.status(200).json({
        success: true,
        data: user
    })
});