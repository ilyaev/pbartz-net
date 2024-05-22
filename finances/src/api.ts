export const descriptionMapping = [
    {
        title: "Safeway",
        matches: ["safeway "],
    },
    {
        title: "Trader Joe",
        matches: ["trader joe"],
    },
    {
        title: "Costco",
        matches: ["costco "],
    },
    {
        title: "Starbucks",
        matches: ["starbucks "],
    },
    {
        title: "Peets",
        matches: ["peet's"],
    },
    {
        title: "CVS",
        matches: ["cvs pharmacy", "cvs/pharmacy"],
    },
    {
        title: "Paris Baguette",
        matches: ["tst* paris ba"],
    },
    {
        title: "Amazon",
        matches: [
            "amazon marketplace",
            "amazn.com",
            "amazon.com",
            "amazon markeplace",
            "amazon prime",
        ],
    },
    {
        title: "Michaels",
        matches: ["michaels stor"],
    },
    {
        title: "USCIS",
        matches: ["uscis "],
    },
    {
        title: "McDonalds",
        matches: ["mcdonald's "],
    },
    {
        title: "Toyota Lease",
        matches: ["toyota ach "],
    },
    {
        title: "Zelle",
        matches: ["zelle payment"],
    },
    {
        title: "Barnes & Noble",
        matches: ["barnes & nobl"],
    },
    {
        title: "Europian Food",
        matches: ["european food"],
    },
    {
        title: "Chipotle",
        matches: ["chipotle "],
    },
    {
        title: "San Ramon Gas",
        matches: ["gill fuels san ramon"],
    },
    {
        title: "Target",
        matches: ["target "],
    },
    {
        title: "99 Ranch",
        matches: ["99 ranch"],
    },
    {
        title: "7-Eleven",
        matches: ["7-eleven"],
    },
    {
        title: "Raleys",
        matches: ["raley's", "raley s"],
    },
    {
        title: "ARCO",
        matches: ["arco#", "arco #"],
    },
    {
        title: "Shell",
        matches: ["shell service"],
    },
    {
        title: "Chevron",
        matches: ["chevron "],
    },
    {
        title: "76",
        matches: ["76 ", " 76 "],
    },
    {
        title: "T-Mobile",
        matches: ["tmobile*"],
    },
    {
        title: "PGE",
        matches: ["pacific gas & electric"],
    },
    {
        title: "Comcast",
        matches: ["comcast "],
    },
    {
        title: "Water",
        matches: ["ebmud "],
    },
    {
        title: "Garbage",
        matches: ["alameda county aci"],
    },
    {
        title: "Schwab",
        matches: ["schwab brokerage"],
    },
    {
        title: "Geico",
        matches: ["geico auto"],
    },
    {
        title: "IRS",
        matches: ["irs des"],
    },
    {
        title: "TurboTax",
        matches: ["intuit *turbotax"],
    },
    {
        title: "Flowers",
        matches: ["flowers kyiv", "flowers.ua"],
    },
    {
        title: "Dental",
        matches: ["azar mahmoudi"],
    },
    {
        title: "Bank of America",
        matches: ["bkofamerica atm"],
    },
    {
        title: "Fastrak",
        matches: ["fastrak "],
    },
    {
        title: "Concerts",
        matches: ["ticketmaster", "axs.com", "sf playhouse"],
    },
    {
        title: "Museums",
        matches: ["de young", "deyoung"],
    },
];

export const description2gropName = (description: string) => {
    for (const mapping of descriptionMapping) {
        for (const match of mapping.matches) {
            if (description.toLowerCase().indexOf(match) !== -1) {
                return mapping.title;
            }
        }
    }
    return description;
};

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
