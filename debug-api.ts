async function main() {
    const url = 'http://localhost:3000/api/pages/home';
    console.log(`Fetching ${url}...`);
    try {
        const res = await fetch(url);
        console.log(`Status: ${res.status}`);
        const text = await res.text();
        console.log('Raw Received Body:');
        console.log('---------------------------------------------------');
        console.log(text);
        console.log('---------------------------------------------------');
        // Try parsing
        JSON.parse(text);
        console.log('JSON Parse Success');
    } catch (error) {
        console.error('Fetch/Parse Error:', error);
    }
}

main();
