const http = require("https");

//https://www.theaudiodb.com/api/v1/json/253221276b25211525322y/searchtrack.php?s=coldplay&t=yellow

const options = {
    method: "GET",
    hostname: "theaudiodb.p.rapidapi.com",
    port: null,
    path: "/searchtrack.php?s=coldplay&t=yellow",
    headers: {
        "X-RapidAPI-Key": "0ea3150488mshf830a2544bed126p1147efjsn24b4af0c1ff4",
        "X-RapidAPI-Host": "theaudiodb.p.rapidapi.com",
    },
};

const req = http.request(options, function (res) {
    const chunks = [];

    res.on("data", function (chunk) {
        chunks.push(chunk);
    });

    res.on("end", function () {
        const body = Buffer.concat(chunks);
        console.log(body.toString());
    });
});

req.end();
