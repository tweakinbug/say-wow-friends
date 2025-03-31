/* export default async function rd_rd(address, amount) {

    const api = process.env.API_II;
    console.log(api);
    try {
        const data = await fetch(process.env.API_II, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ address, amount })
        });
        const res = await data.json();
        return res;
    } catch (error) {
        return "error with env";
    }
    
} */