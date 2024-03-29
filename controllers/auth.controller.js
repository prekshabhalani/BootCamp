let crypto = require('crypto');
let User = require("../models/user.model");
let ErrorResponse = require("../utils/errorResponse");
let sendEmail = require('../utils/sendEmail');
let asyncHandler = require("../middlewares/async");


//@desc Register user
//@route POST/api/v1/auth/register
//@access Public

exports.register = asyncHandler(async (req, res, next) => {
    let { name, email, password, role } = req.body;
    // Create user
    const user = await User.create({
        name,
        email,
        password,
        role
    });
    // Set token and send response
    sendTokenResponse(user, 200, res);
});

//@desc Login user
//@route POST/api/v1/auth/login
//@access Public

exports.login = asyncHandler(async (req, res, next) => {
    let { email, password } = req.body;
    // Validate user and password
    if (!email || !password) {
        return next(new ErrorResponse(
            'Please provide email and password', 400
        ));
    }

    //Check user 
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
        return next(new ErrorResponse(
            'Please enter valid email', 401
        ));
    }

    //Check password 

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
        return next(new ErrorResponse(
            'Please enter valid password', 401
        ));//or we can say Invalid credential
    }
    // Set token and send response
    sendTokenResponse(user, 200, res);

});

//@desc Get current login user
//@route GET/api/v1/auth/me
//@access Private

exports.getMe = asyncHandler(async (req, res, next) => {
    const user = await User.findById(req.user.id);
    res.status(200)
        .json({
            success: true,
            data: user
        })
})


//@desc Log user out / Clear cookie
//@route GET/api/v1/auth/logout
//@access Private

exports.logout = asyncHandler(async (req, res, next) => {
    res.cookie('token','none',{
        expires:new Date(Date.now + 10* 1000),
        httpOnly:true
    })
    res.status(200)
        .json({
            success: true,
            data: {}
        })
})

//@desc Update user details 
//@route PUT/api/v1/auth/updatedetails
//@access Private

exports.updateDetails = asyncHandler(async (req, res, next) => {
    //this is just for name and email update
    const fieldsToUpdate = {
        name: req.body.name,
        email: req.body.email
    }
    const user = await User.findByIdAndUpdate(req.user.id, fieldsToUpdate, {
        new: true,
        runValidators: true
    });
    res.status(200)
        .json({
            success: true,
            data: user
        })


})


//@desc Update password
//@route PUT/api/v1/auth/updatepassword
//@access Private

exports.updatePassword = asyncHandler(async (req, res, next) => {
    const user = await User.findById(req.user.id).select('+password');
    //check current password
    if (!(await user.matchPassword(req.body.currentPassword))) {
        return next(new ErrorResponse(`Password is incorrect`, 401));
    }
    user.password = req.body.newPassword;
    await user.save();
    sendTokenResponse(user, 200, res)


})

//@desc Forget password
//@route POST/api/v1/auth/forgetpassword
//@access Public

exports.forgotPassword = asyncHandler(async (req, res, next) => {
    const user = await User.findOne({ email: req.body.email });
    if (!user) {
        return next(new ErrorResponse(`This is no user with that email`, 404));
    }
    // Get reset password token
    const resetToken = user.getResetPasswordToken();

    //console.log(resetToken);
    await user.save({ validateBeforeSave: false });

    // Create reset url
    const resetUrl = `${req.protocol}://${req.get('host')}/api/v1/auth/resetpassword/${resetToken}`;

    const message = `You are recive this email because you (or someone else) has request a reset of password. Please make a put request to: \n\n${resetUrl}`;
    try {
        await sendEmail({
            email: user.email,
            subject: 'Password reset token',
            message
        })
        res.status(200).json({ success: true, data: 'Email sent' });
    } catch (error) {
        console.log(error);
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;
        await user.save({ validateBeforeSave: false });
        return next(new ErrorResponse('Email could not be send ', 500));
    }

})

//@desc Reset password
//@route PUT/api/v1/auth/resetpassword:resettoken
//@access Public

exports.resetPassword = asyncHandler(async (req, res, next) => {
    // Get hashed token 
    const resetPasswordToken =
        crypto
            .createHash('sha256')
            .update(req.params.resettoken)
            .digest('hex');
    const user = await User.findOne(
        {
            resetPasswordToken,
            resetPasswordExpire: { $gt: Date.now() }
        });
    if (!user) {
        return next(new ErrorResponse('Invalid token', 400))
    }
    // Set new password 
    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    sendTokenResponse(user, 200, res);


})

// Get token from model , Create cookie and send respond
const sendTokenResponse = (user, statusCode, res) => {
    //Create token
    const token = user.getSignJwtToken();

    const options = {
        expires: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRE * 24 * 60 * 60 * 1000),
        httpOnly: true

    };
    // Secure connction with https
    if (process.env.NODE_ENV === 'production') {
        options.secure = true;
    }

    res.status(statusCode)
        .cookie('token', token, options)
        .json({
            success: true,
            token,
            data: user
        })

}