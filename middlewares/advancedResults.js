
const advancedResults = (Model, populate) => async (req, res, next) => {
    //copy of query through spread oprtor
    let reqQuery = { ...req.query };
    //console.log(reqQuery);

    //Field to not execute
    let removeFields = ['select', 'sort', 'limit', 'page'];

    //loop through the  remove fields to delete them from req.query
    removeFields.forEach(param => delete reqQuery[param]);


    let queryStr = JSON.stringify(reqQuery);//create query string 

    // const bootcamps = await Bootcamp.find({'name':'bootcamp1'}).select('name');//return one field at a time with id 
    //covert into string so we manipulate becoz             
    //mongooes query need {'a':{ $lt : 100}}
    //req.query return    {'a':{ lt : 100}}
    queryStr = queryStr.replace(/\b(gt|gte|lt|lte|in)\b/g, match => `$${match}`); //create Oprator with ($gt , $lt)

    // const bootcamps = await Bootcamp.find(req.query);
    //replace req.query with new query
    let query;
    query = Model.find(JSON.parse(queryStr));

    //Select specific fields
    if (req.query.select) {
        const selectedFields = req.query.select.replaceAll(",", " ");
        query = query.select(selectedFields);
    }
    //Sort specific fields
    if (req.query.sort) {
        console.log(req.query.sort);
        let sortBy = req.query.sort.split(',').join(' ');//or use replaceAll
        query = query.sort(sortBy);

    }
    else
        query = query.sort('name');//-name for decending order

    //populate
    if(populate){
        query = query.populate(populate);
    }

    //Specifie data display from which page :default 1
    let page = parseInt(req.query.page || 1);

    //Specifie data display how many in each page :default 100
    let limit = parseInt(req.query.limit || 100);

    //Specified no. of data to skip 
    let startIndex = (page - 1) * limit;
    let endIndex = page * limit;
    let totalPage = await Model.countDocuments();

    //display data according pagination  
    query = query.skip(startIndex).limit(limit);

    //Create object for pagination to display next and priview 
    let pagination = {};
    //set prev page value if there 
    if (startIndex > 0) {
        pagination.prev = {
            page: page - 1,
            limit
        }
    }
    //Set next page value if there 
    if (endIndex < totalPage) {
        pagination.next = {
            page: page + 1,
            limit
        }
    }

    const results = await query;
    res.advancedResults = {
        success: true,
        count: results.length,
        pagination,
        data:results
    }
    next();
}
module.exports = advancedResults;