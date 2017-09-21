const fs = require('fs');
const allc = require('./all_cities.json');

const data = allc.map(c => [c.name, c.lon, c.lat, c.population]);


// data.length = 50000;
data.length = data.length;

const string = 'window.cities=' + JSON.stringify(data);
fs.writeFileSync('cities_' + data.length + '.js', string);


