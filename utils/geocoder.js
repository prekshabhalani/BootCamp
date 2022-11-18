let NodeGeocoder =require('node-geocoder');

const options = {
    provider:'mapquest',
    httpAdapter:'https',
    apiKey:'8f4xP2QkfApCIIFv9n9mv9sp7A4J137G',
    formatter:null
};
const geocoder = NodeGeocoder(options);

module.exports=geocoder;

