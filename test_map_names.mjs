import fs from 'fs';
fetch("https://unpkg.com/world-atlas@2.0.2/countries-110m.json")
  .then(res => res.json())
  .then(data => {
    const mapNames = data.objects.countries.geometries.map(g => g.properties.name);
    fs.writeFileSync('map_names.json', JSON.stringify(mapNames, null, 2));
    console.log("Saved map_names.json, count:", mapNames.length);
  });
