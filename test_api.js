async function t() {
    try {
        const res = await fetch("https://agri-backend-plux.vercel.app/api/user-performance?userId=test1234");
        console.log("Status:", res.status);
        const json = await res.json();
        console.log("Response:", JSON.stringify(json, null, 2));
    } catch(e) {
        console.error("Fetch Error:", e);
    }
}
t();
