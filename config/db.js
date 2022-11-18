let mongoose = require("mongoose");
console.log("---------------------",process.env.MONGO_URI);
let connectDB = async () => {
	let conn = await mongoose.connect(process.env.MONGO_URI, {
		// useNewUrlParser: true,
		// useCreateIndex: true,
		// useFindAndModify: false,
		// useUnifiedTopology: true
	});
	console.log(`MongoDB connected to ${conn.connection.host}`);
};
module.exports = connectDB;
 