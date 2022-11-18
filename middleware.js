let app = require('express')();
app.use(global_middleware_logger);

function global_middleware_logger(req,res,next) {
    console.log(req.url);
    next();    
}
var homeauth = (req, res, next)=>{
    // console.log(req.headers);
    res.send(req.body);
    next(); 
}

app.get('/home',homeauth, (req, res) => {
    res.send("HOME");
});

app.get('/about', (req, res) => {
    res.send("ABOUT");
});

app.listen(3000, () => {
    console.log('App listening on port 3000!');
});
