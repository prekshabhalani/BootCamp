let express = require('express');
let router = express.Router();
let { getBootcamps,
    getBootcamp,
    createBootcamp,
    updateBootcamp,
    deleteBootcamp,
    getBootcampsInRadius,
    bootcampPhotoUpload
} = require('../controllers/bootcamp.controller');

const Bootcamp = require('../models/bootcamp.model');
const advancedResults = require("../middlewares/advancedResults");

//Include other resource router 
let courseRouter = require('./course.router');
let reviewRouter = require('./review.router');

let { protect, authorize } = require('../middlewares/auth');

//Re-route into the other resourse router 
router.use('/:bootcampId/courses', courseRouter.router);
router.use('/:bootcampId/reviews', reviewRouter.router);


router
    .route('/:id/photo')
    .put(protect,authorize('publisher','admin'),bootcampPhotoUpload);

router
    .route('/')
    .get(advancedResults(Bootcamp, 'courses'), getBootcamps)
    .post(protect, authorize('publisher','admin'), createBootcamp);
router
    .route('/:id')
    .get(getBootcamp)
    .put(protect, authorize('publisher','admin'), updateBootcamp)
    .delete(protect, authorize('publisher','admin'), deleteBootcamp);

router
    .route('/radius/:zipcode/:distance')
    .get(getBootcampsInRadius)

module.exports = {
    router: router
}
