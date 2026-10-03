// Netlify serverless function: fetches the live IBJA gold/silver rate
// server-side (no browser CORS restriction applies here) and hands it
// back to the site's own front-end with permissive CORS headers.
function secondsUntilNextIbjaUpdate(){var now=new Date();var utcMs=now.getTime()+now.getTimezoneOffset()*60000;var ist=new Date(utcMs+19800000);var secNow=ist.getHours()*3600+ist.getMinutes()*60+ist.getSeconds();var b1=12*3600+8*60;var b2=17*3600+8*60;var secToNext;if(secNow<b1){secToNext=b1-secNow;}else if(secNow<b2){secToNext=b2-secNow;}else{secToNext=(86400-secNow)+b1;}return Math.max(secToNext,120);} exports.handler = async function () {
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
        "Cache-Control": `public, max-age=${secondsUntilNextIbjaUpdate()}, s-maxage=${secondsUntilNextIbjaUpdate()}`,
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
