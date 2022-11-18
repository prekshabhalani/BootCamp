let express = require('express');
let router = express.Router({ mergeParams: true });
let {
    getCourses,
    getCourse,
    createCourse,
    deleteCourse,
    updateCourse
} = require('../controllers/course.controller');
// Other resourses
const Course = require('../models/course.model');
const { protect, authorize } = require('../middlewares/auth');
const advancedResults = require('../middlewares/advancedResults');
router
    .route('/')
    .get(
        advancedResults(Course, 'bootcamp'), getCourses)
    .post(protect, authorize('admin','publisher'), createCourse);
router
    .route('/:id')
    .get(getCourse).put(protect, authorize('admin','publisher'), updateCourse)
    .delete(protect, authorize('admin','publisher'),deleteCourse);

module.exports = {
    router: router
}
