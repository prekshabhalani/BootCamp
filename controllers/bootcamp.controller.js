let Bootcamp = require("../models/bootcamp.model");
let ErrorResponse = require("../utils/errorResponse");
let asyncHandler = require("../middlewares/async");
let geocoder = require("../utils/geocoder");
let path = require('path');

//@desc Create bootcamp
//@route GET/api/v1/bootcamps
//@access Private
exports.createBootcamp = asyncHandler(async (req, res, next) => {
    // console.log(req.body)
    // Add user 
    req.body.user = req.user.id;

    // Check for publist bootcamps
    let publistBootcamp = await Bootcamp.findOne({ user: req.user.id });

    // If the user is not an admin, they can only add one bootcamp
    if (publistBootcamp && req.user.role !== 'admin') {
        return next(
            new ErrorResponse(
                `The user with ID ${req.user.id} has already published a Bootcamp`,
                400
            ))
    }


    let bootcamp = await Bootcamp.create(req.body);
    res.status(201).json({
        success: true,
        data: bootcamp,
    });
});

// @desc Get bootcamps with filter too
// @route GET/api/v1/bootcamps
// @route GET/api/v1/bootcamps?sort=name?select=name,averageCost?page=2?index=3
// @access Private

exports.getBootcamps = asyncHandler(async (req, res, next) => {

    res.status(200).json(res.advancedResults);

})

// @desc Get bootcamp
// @route GET /api/v1/bootcamps/:id
// @access Public

exports.getBootcamp = asyncHandler(async (req, res, next) => {
    let bootcamp = await Bootcamp.findById(req.params.id);
    if (!bootcamp) {
        return next(
            new ErrorResponse(`Bootcamp is not found with the id of ${req.params.id}`,404)
        );
        // return res.status(400).json({
        //     success: false,
        //     message: 'Record not found',
        //     data: bootcamp
        // });
    }
    res.status(200).json({
        success: true,
        data: bootcamp,
    });
});

// @desc Update bootcamp value
// @route PUT/api/v1/bootcamps/:id
// @access Private

exports.updateBootcamp = asyncHandler(async (req, res, next) => {
    let bootcamp = await Bootcamp.findById(req.params.id);
    if (!bootcamp) {
        return next(
            new ErrorResponse(
                `Record not found in ${req.params.id} id for update`,
                404
            )
        );
    }

    //Make sure user is Bootcamp owner
    if (bootcamp.user.toString() !== req.user.id && req.user.role !== 'admin') {
        return next(
            new ErrorResponse(
                `User ${req.params.id} is not authorized to update this bootcamp`,
                401
            ) 
        );
    }
    bootcamp = await Bootcamp.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true,
    })
    res.status(200).json({
        success: true,
        data: bootcamp,
    });
});

// @desc Delete Bootcamp
// @route DELETE/api/v1/bootcamps/:id
// @access Public

exports.deleteBootcamp = asyncHandler(async (req, res, next) => {
    let bootcamp = Bootcamp.findById(req.params.id).populate('courses');

    if (!bootcamp) {
        return next(
            new ErrorResponse(
                `Record of ${req.params.id} is not found to delete `,
                400
            )
        );
    }
     //Make sure user is Bootcamp owner
     if (bootcamp.user.toString() !== req.user.id && req.user.role !== 'admin') {
        return next(
            new ErrorResponse(
                `User ${req.param.id} is not authorized to delete this bootcamp`,
                401
            )
        );
    }
    bootcamp.remove();
    res.status(200).json({
        success: true,
        data: { bootcamp },
    });
});

// @desc Get bootcamps within a radius
// @route GET /api/v1/bootcamps/radius/:zipcode/:distance
// @access Private
exports.getBootcampsInRadius = asyncHandler(async (req, res, next) => {
    let { zipcode, distance } = req.params;
    // Get lat/lng from geocoder
    let loc = await geocoder.geocode(zipcode);
    let lat = loc[0].latitude;
    let lng = loc[0].longitude;
    // Calc radius using radians
    // Divide dist by radius of Earth
    // Earth Radius = 3,963 mi / 6,378 km
    let radius = distance / 3963;
    let bootcamps = await Bootcamp.find({
        location: { $geoWithin: { $centerSphere: [[lng, lat], radius] } },
    });
    res.status(200).json({
        success: true,
        count: bootcamps.length,
        data: bootcamps,
    });
});

// @desc Upload photos for bootcamp
// @route PUT/api/v1/bootcamps/:id/photo
// @access Private

exports.bootcampPhotoUpload = asyncHandler(async (req, res, next) => {
    let bootcamp = await Bootcamp.findById(req.params.id).populate('courses');
    if (!bootcamp) {
        return next(
            new ErrorResponse(
                `Record of ${req.params.id} is not found to delete `,
                400
            )
        );
    }
     //Make sure user is Bootcamp owner
     if (bootcamp.user.toString() !== req.user.id && req.user.role !== 'admin') {
        return next(
            new ErrorResponse(
                `User ${req.param.id} is not authorized to update this bootcamp`,
                401
            )
        );
    }
    if (!req.files) {
        return next(
            new ErrorResponse(
                `Please upload a file`, 400
            ))
    }
    let file = req.files.file;
    //Check file type must be image
    if (!file.mimetype.startsWith('image/')) {
        return next(
            new ErrorResponse(
                `Please uplode an image file`, 400
            ));
    }
    //Check file size
    if (file.size > process.env.MAX_FILE_UPLOAD) {
        return next(
            new ErrorResponse(
                `Please uplaod an image less then ${process.env.MAX_FILE_UPLOAD}`, 400
            )
        )
    }
    //Set name of photo using id and extension
    let fileName = `photo_${bootcamp._id}${path.parse(file.name).ext}`;
    //Move photo file into the folder
    file.mv(`${process.env.FILE_UPLOAD_PATH}/${fileName}`, async err => {
        if (err) {
            console.log(err);
            return next(new ErrorResponse(
                `Problem with photo upload`, 500
            ))
        }
        //Update photoName into database
        await Bootcamp.findByIdAndUpdate(req.param.id, { photo: file.name });

    });
    res.status(200).json({
        success: true,
        data: { bootcamp },
    });

});