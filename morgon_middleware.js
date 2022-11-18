let app = require('express')();
let dotenv = require('dotenv');
let morgan = require('morgan');
let fs = require('fs');
let path = require('path')
//load env variables
dotenv.config({ path: './config/config.env' });

let accessLockStream = fs.createWriteStream(path.join(__dirname,'access.log'),{flags:'a'});
app.use(morgan('dev',{stream:accessLockStream}));

let port = process.env.PORT || 5000;
app.listen(port, console.log(`Server is running on ${process.env.NODE_ENV} mode on
port ${port}`)) 