const mongoose = require('mongoose');

const CourseSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Please add a course title']
    },
    description: {
        type: String,
        required: [true, 'Please add a course description']
    },
    tuition: {
        type: Number,
        required: [true, 'Please add a tuition fee ']
    },
    minimumSkill: {
        type: String,
        required: [true, 'Please add a minimum course title'],
        enum: ['beginner', 'intermediate', 'advanced']
    },
    scholarshipAvailable: {
        type: Boolean,
        default: false
    },
    createAt: {
        type: Date,
        default: Date.now
    },
    bootcamp: {
        type: mongoose.Schema.ObjectId,
        ref: 'Bootcamp',
        require: true
    },
    user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        require: true
    }
});

CourseSchema.statics.getAverageCost = async function (bootcampId) {
    console.log('Calculating Averahge cost.... ');
    const obj = await this.aggregate([
        {
            $match: {
                bootcamp: bootcampId
            }
        },
        {
            $group: {
                _id: '$bootcamp',
                averageCost: {
                    $avg: '$tuition'
                }
            }
        }
    ]);

    //Add obj into bootcamp database
    try {
        await this.model('Bootcamp').findByIdAndUpdate(bootcampId, {
            averageCost: Math.ceil(obj[0].averageCost / 10) * 10
        })
    } catch (e) {
        console.log(e);
    }


}
//Call averageCost before remove
CourseSchema.pre('remove', async function () {
    this.constructor.getAverageCost(this.bootcamp);
});
//Call averageCost after save
CourseSchema.post('save', async function () {
    this.constructor.getAverageCost(this.bootcamp);
});
module.exports = mongoose.model('Course', CourseSchema);