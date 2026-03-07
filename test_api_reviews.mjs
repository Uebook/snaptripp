
import fetch from 'node-fetch';
async function testApi() {
    const country = 'Canada';
    const url = `http://localhost:3000/api/reviews?country=${encodeURIComponent(country)}`;
    console.log('Fetching:', url);
    try {
        const res = await fetch(url);
        const data = await res.json();
        console.log('Response:', JSON.stringify(data, null, 2));
    } catch (err) {
        console.error('Error:', err.message);
    }
}
testApi();
