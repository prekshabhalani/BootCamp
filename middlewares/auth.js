//it used to protect routes
const jwt = require('jsonwebtoken');
const asyncHandler = require('./async');
const ErrorResponse = require('../utils/errorResponse');
const User = require('../models/user.model');

//Protect router
exports.protect = asyncHandler(async (req, res, next) => {
    let token;
    // Set token through the barare token in header
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    }
    // Set token through cookie
    else if(req.cookies.token){
        token = req.cookies.token;
    }
    // Make sure token exits
    if (!token) {
        return next(new ErrorResponse('Not authorize to access this route', 401));
    }

    //verified token
    try {
        // Abstract payload
        const decoded = jwt.verify(token, process.env.JWT_SECRET)
        console.log(decoded);
        req.user = await User.findById(decoded.id);
        next();
    } catch (error) {
        return next(new ErrorResponse('Not authorize to access this route', 401));

    }
});

// Grant access to specific role
exports.authorize = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return next(
                new ErrorResponse(
                    `User ${req.user.id} not authorize to access this route`,
                    403
                ));
        }
        next();
    }
}