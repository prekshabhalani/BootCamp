let express = require('express');
let router = express.Router({ mergeParams: true });

let {
    createUser, deleteUser, getUser, getUsers, updateUser,
} = require('../controllers/users.controller');
// Other resourses
const User = require('../models/user.model');

const { protect, authorize } = require('../middlewares/auth');
const advancedResults = require('../middlewares/advancedResults');

router.use(protect);
router.use(authorize('admin'));

router
    .route('/')
    .get(advancedResults(User),getUsers)
    .post(createUser);


router
    .route('/:id')
    .get(getUser)
    .put(updateUser)
    .delete(deleteUser)

module.exports = {
    router: router
}
