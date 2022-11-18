const fs = require('fs');
const mongoose = require('mongoose');
const dotenv = require('dotenv');

// Load env vars
dotenv.config({ path: './config/config.env' });

// Load models
const Bootcamp = require('./models/bootcamp.model');
const Course = require('./models/course.model');
const User = require('./models/user.model');
const Review = require('./models/review.model');

// Connect to DB
mongoose.connect(process.env.MONGO_URI, {
    // useNewUrlParser: true,
    // useCreateIndex: true,
    // useFindAndModify: false,
    // useUnifiedTopology: true
});

// Read JSON files
const bootcamps = JSON.parse(
    fs.readFileSync(`${__dirname}/data/bootcamps.json`, 'utf-8')
);
const course = JSON.parse(
    fs.readFileSync(`${__dirname}/data/courses.json`, 'utf-8')
);

const user = JSON.parse(
    fs.readFileSync(`${__dirname}/data/users.json`, 'utf-8')
);
const reviews = JSON.parse(
    fs.readFileSync(`${__dirname}/data/reviews.json`, 'utf-8')
);
// Import into DB
const importData = async () => {

    try {

        await Bootcamp.create(bootcamps);
        await Course.create(course);
        await User.create(user);
        await Review.create(reviews);
        console.log('Data Imported...');
        process.exit();
    } catch (err) {
        console.error(err);
    }
};
// Delete data
const deleteData = async () => {
    try {
        await Bootcamp.deleteMany();
        await Course.deleteMany();
        await User.deleteMany();
        await Review.deleteMany();
        console.log('Data Destroyed...');
        process.exit();
    } catch (err) { 
        console.error(err);
    }
};
// console.log(process.argv)
//argv process enviroment varible inside process object it invoke at the time of node server's start
if (process.argv[2] === '-i') {
    importData();
} else if (process.argv[2] === '-d') {
    deleteData();
}
