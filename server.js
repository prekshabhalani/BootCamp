let express = require("express");
let app = express();
let mongoSanatize = require('express-mongo-sanitize');
let helmet = require('helmet');
let xss_clean = require('xss-clean');
let expressRateLimit = require('express-rate-limit');
let hpp = require('hpp');
let cors = require('cors');
let dotenv = require("dotenv");
let morgan = require("morgan");
let fs = require("fs");
let fileUpload = require('express-fileupload');
let cookieParser = require('cookie-parser')
let path = require("path");
let colors = require('colors');


//custom modules
let bootcamps = require("./routes/bootcamp.router");
let courses = require("./routes/course.router");
let error = require('./middlewares/error')
let auth = require('./routes/auth.router');
let users = require('./routes/users.router');
let reviews = require('./routes/review.router');

//JSON PARSER
app.use(express.json());

// COOKIE PARSER
app.use(cookieParser());

//load env variables
dotenv.config({ path: "./config/config.env" });
let connectDB = require("./config/db");
connectDB();

//get entry of all url
let accessLockStream = fs.createWriteStream(
	path.join(__dirname, "access.log"),
	{ flags: "a" }
);
app.use(morgan("dev", { stream: accessLockStream }));

// File uploding 
app.use(fileUpload());

// Sanatize data
app.use(mongoSanatize());

// Set sequrity header 
app.use(helmet());


// Prevent XSS attacks
app.use(xss_clean());

// Rate limit 
const limiter = expressRateLimit({
	windowMs: 1, //10 min
	max: 1
})
app.use(limiter);
// Prevent http param polution
app.use(hpp());

// Enable CORS
app.use(cors());

// Set static folder
app.use(express.static(path.join(__dirname, 'public')));

// Mount router
app.use("/api/v1/bootcamps", bootcamps.router);
app.use("/api/v1/courses", courses.router);
app.use("/api/v1/auth", auth.router);
app.use("/api/v1/users", users.router);
app.use("/api/v1/reviews", reviews.router);


app.use(error.errorHandler);

var Crypto = require('crypto'); // add import crypto mdule

var secretKey = 'fd85b494-aaaa'; // detine secret key 
var secret_iv = 'smsit'; // define secret IV
var encryptionMethod = 'AES-256-CBC'; // Encryption method
var key = Crypto.createHash("sha512").update(secretKey, 'utf-8').digest("hex").substr(0, 32);//Create key
var iv = Crypto.createHash('sha512').update(secret_iv, 'utf-8').digest("hex").substr(0, 16); //Create iv 

// Call encrption function

var encrypted_Message = encrypt_string("hello1", encryptionMethod, key, iv);

console.log(encrypted_Message); // Store out[ut for decrpt


function encrypt_string(plain_text, encryptionMethod, secret, iv) {
	var encryptor = Crypto.createCipheriv(encryptionMethod, secret, iv);
	//encrpt using AES-256-CBC 
	var aes_encrypted = encryptor.update (plain_text, 'utf8', 'base64')+ encryptor. final ('base64'); 
	// convert to baseba 
	return Buffer.from(aes_encrypted).toString('base64');

};
// now call decrypt function

var decryptedMessage = decrypt_string("dTFvM0pqUUx0L2tNbjQ5VHFWZEhWUT09", encryptionMethod, key, iv);

console.log(decryptedMessage); // you can check hello is the output.

// add decrypt function



function decrypt_string(encryptedMessage, encryptionMethod, secret, iv) {

	const buff = Buffer.from(encryptedMessage, 'base64'); //get base64 string 
	encryptedMessage = buff.toString('utf-8'); 
	// convert to string 
	var decryptor = Crypto.createDecipheriv(encryptionMethod, secret, iv); 
	return decryptor.update(encryptedMessage, 'base64', 'utf8') + decryptor.final('utf8'); // return decrpt one
}




let port = process.env.PORT || 5000;
let server = app.listen(
	port,
	console.log(`Server is running on ${process.env.NODE_ENV} mode on
port ${port}`)
);

//handle unhandle promise rejection ==it handle server while we manually make any change and that effect db server and hang our process ex:change password
process.on("unhandledRejection", (err, promise) => {
	console.log("ERROR IN SERVER PROMISE", err.message);
	server.close();
});
