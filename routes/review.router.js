const express = require('express');
const { getReview  , getReviews ,addReview,deleteReview,updateReview} = require('../controllers/reviews.controller');

const Review = require('../models/review.model');

const router = express.Router({ mergeParams: true });

const advancedResults = require('../middlewares/advancedResults');
const { protect, authorize } = require('../middlewares/auth');

router
.route('/')
.get(advancedResults(Review,{
    path:'bootcamp',
    select: 'name Description'
}),getReviews)
.post(protect,authorize('admin','user'),addReview);

router
.route('/:id')
.get(getReview)
.put(protect,authorize('admin','user'),updateReview)
.delete(protect,authorize('admin','user'),deleteReview)
module.exports = {
    router
};
