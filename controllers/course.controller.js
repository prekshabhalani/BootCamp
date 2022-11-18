let Course = require("../models/course.model");
let Bootcamp = require("../models/bootcamp.model");

let ErrorResponse = require("../utils/errorResponse");
let asyncHandler = require("../middlewares/async");

//@desc Get courses
//@route GET/api/v1/courses
//@route GET/api/v1/bootcamps/:bootcampId/courses
//@access public

exports.getCourses = asyncHandler(async (req, res, next) => {

    res.status(200).json(res.advancedResults);
})

//@desc Set course
//@route POST/api/v1/bootcamps/:bootcampId/courses
//@access Private 

exports.createCourse = asyncHandler(async (req, res, next) => {
    //set user 
    req.body.user = req.user.id;
    req.body.bootcamp = req.params.bootcampId;
    let bootcamp = await Bootcamp.findById(req.body.bootcamp);
    if (!bootcamp) {
        return next(new ErrorResponse(`No bootcamp with the id of ${req.body.bootcamp}`), 404);
    }
    //Make sure user is Bootcamp owner
    if (bootcamp.user.toString() !== req.user.id && req.user.role !== 'admin') {
        return next(
            new ErrorResponse(
                `User ${req.user.id} is not authorized to add a course to bootcamp ${bootcamp._id}.`,
                401
            )
        );
    }

    let course = Course.create(req.body);
    res.status(201).json({
        success: true,
        count: course.length,
        data: { course }
    });
});
//@desc Get course
//@route GET/api/v1/courses/:id
//@access public
exports.getCourse = asyncHandler(async (req, res, next) => {
    let course = await Course.findById(req.params.id).populate({
        path: 'bootcamp',
        select: 'name description averageCost'
    }
    );
    if (!course) {
        return next(
            new ErrorResponse(
                `course is not found with the id of ${req.params.id}`,
                404
            )
        );
    }
    res.status(200).json({
        success: true,
        data: course,
    });
});


//@desc update course
//@route PUT/api/v1/courses/:id
//@access public 


exports.updateCourse = asyncHandler(async (req, res, next) => {
    let course = await Course.findById(req.params.id);
    if (!course) {
        return next(
            new ErrorResponse(
                `Record not found in ${req.params.id} id for update`,
                404
            )
        );
    }
    //Make sure user is Bootcamp owner
    if (course.user.toString() !== req.user.id && req.user.role !== 'admin') {
        return next(
            new ErrorResponse(
                `User ${req.user.id} is not authorized to update course ${course._id}.`,
                401
            )
        );
    }
    course = await Course.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true,
    }).populate({
        path: 'bootcamp'
    });
    res.status(200).json({
        success: true,
        data: course,
    });
});

//@desc Delete course
//@route DELETE/api/v1/courses/:id
//@access public

exports.deleteCourse = asyncHandler(async (req, res, next) => {
    let course = await Course.findById(req.params.id);
    if (!course) {
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
                `User ${req.user.id} is not authorized to delete course ${course._id}.`,
                401
            )
        );
    }
    await course.remove();
    res.status(200).json({
        success: true,
        data: { course },
    });
});
