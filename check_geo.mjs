
import fetch from 'node-fetch';
async function checkGeo() {
    const res = await fetch('https://raw.githubusercontent.com/datasets/geo-countries/master/data/countries.geojson');
    const data = await res.json();
    const canada = data.features.find(f => f.properties.ISO_A3 === 'CAN');
    console.log('--- Canada GeoJSON Properties ---');
    console.log(canada ? canada.properties : 'Not found');
}
checkGeo();
