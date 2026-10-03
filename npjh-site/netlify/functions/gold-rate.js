// Netlify serverless function: fetches the live IBJA gold/silver rate
// server-side (no browser CORS restriction applies here) and hands it
// back to the site's own front-end with permissive CORS headers.
exports.handler = async function () {
  try {
    const res = await fetch(
      "https://goldliveindia.com/ibja/index.php?gold=data&nocache=" + Date.now()
    );
    if (!res.ok) {
      throw new Error("Upstream responded with " + res.status);
    }
    const data = await res.json();
    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "public, max-age=43200, s-maxage=43200",
        "Access-Control-Allow-Origin": "*",
      },
      body: JSON.stringify(data),
    };
  } catch (err) {
    return {
      statusCode: 502,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
      body: JSON.stringify({ error: "Could not fetch gold rate" }),
    };
  }
};
