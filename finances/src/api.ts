export const callAPI = async (
    action: string,
    params: string[],
    body: object
) => {
    let base = "/api/";
    if (document.location.hostname.indexOf("localhost") !== -1) {
        base = "http://localhost:3000/api/";
    }
    const url = base + action + "/" + params.join("/");
    const response = await fetch(url, {
        method: body ? "POST" : "GET",
        body: JSON.stringify(body),
    }).catch((err) => {
        return new Response(JSON.stringify({ error: err, success: false }));
    });
    const data = await response.json();
    return data;
};
