
import fs from 'fs';
const geoJSON = JSON.parse(fs.readFileSync('public/countries.geojson', 'utf8'));
const canada = geoJSON.features.find(f => f.properties.name === 'Canada');
if (canada) {
    console.log('Canada properties:', JSON.stringify(canada.properties, null, 2));
} else {
    const someFeature = geoJSON.features[0];
    console.log('First feature properties:', JSON.stringify(someFeature.properties, null, 2));
}
