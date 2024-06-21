export interface GameConfigCard {
    name: string;
    ingredients: string[];
    description: string;
    color?: string;
    parents?: string[];
}

export interface GameConfig {
    cards: GameConfigCard[];
}

export enum CARD_COLOR {
    default = "rgba(50,50,50,0.5)",
    dragging = "rgba(0, 100,0, 0.7)",
    error = "rgba(50,0,0,0.5)",
    water = "rgba(0,0,150,0.8)",
    fire = "rgba(100,0,0,0.8)",
    air = "rgba(100,100,100,0.5)",
    earth = "rgba(150, 105, 25, 0.6)",
}

export const GAME_CONFIG: GameConfig = {
    cards: [
        {
            name: "Water",
            ingredients: [],
            color: CARD_COLOR.water,
            description:
                "Liquid, clear, and life-giving. Can be used to quench thirst or grow plants.",
        },
        {
            name: "Fire",
            ingredients: [],
            color: CARD_COLOR.fire,
            description:
                "Hot, bright, and destructive. Can be used to cook food or forge metals.",
        },
        {
            name: "Air",
            ingredients: [],
            color: CARD_COLOR.air,
            description:
                "Invisible, light, and life-giving. Can be used to breathe or create wind.",
        },
        {
            name: "Earth",
            ingredients: [],
            color: CARD_COLOR.earth,
            description:
                "Solid, stable, and fertile. Can be used to grow plants or build structures.",
        },
        {
            name: "Steam",
            ingredients: ["Water", "Fire"],
            color: CARD_COLOR.water,
            description:
                "Hot, gaseous, and expansive. Can be used to power machines or create clouds.",
        },
        {
            name: "Wind",
            ingredients: ["Air", "Fire"],
            color: CARD_COLOR.air,
            description:
                "Powerful, destructive, and mobile. Can be used to move objects or create storms.",
        },
        {
            name: "Lava",
            ingredients: ["Fire", "Earth"],
            color: CARD_COLOR.fire,
            description:
                "Molten, destructive, and hot. Can be used to forge metals or create volcanoes.",
        },
        {
            name: "Mist",
            ingredients: ["Water", "Air"],
            color: CARD_COLOR.water,
            description:
                "Water vapor, ethereal, and elusive. Can be used to create illusions or obscure vision.",
        },
        {
            name: "Mud",
            ingredients: ["Water", "Earth"],
            color: CARD_COLOR.earth,
            description:
                "Sticky, malleable, and fertile. Can be used to grow plants or create sculptures.",
        },
        {
            name: "Dust",
            ingredients: ["Air", "Earth"],
            color: CARD_COLOR.air,
            description:
                "Fine particles, dry, and airborne. Can be used to create sandstorms or obscure vision.",
        },
        {
            name: "Cloud",
            ingredients: ["Steam", "Air"],
            color: CARD_COLOR.air,
            description:
                "Water vapor condensed, fluffy, and rain-bearing. Can be used to create rain or storms.",
        },
        {
            name: "Dust Storm",
            ingredients: ["Wind", "Earth"],
            color: CARD_COLOR.earth,
            description:
                "Destructive, mobile, and suffocating. Can be used to bury objects or create havoc.",
        },
        {
            name: "Volcano",
            ingredients: ["Lava", "Water"],
            color: CARD_COLOR.fire,
            description:
                "Explosive, destructive, and heat-generating. Can be used to forge metals or create mountains.",
        },
        {
            name: "Rain",
            ingredients: ["Cloud", "Earth"],
            color: CARD_COLOR.water,
            description:
                "Liquid water falling from the sky. Can be used to quench thirst or grow plants.",
        },
        {
            name: "Lightning",
            ingredients: ["Wind", "Fire"],
            color: CARD_COLOR.air,
            description:
                "Electric discharge in the sky. Can be used to ignite objects or create storms.",
        },
        {
            name: "Sand",
            ingredients: ["Dust", "Earth"],
            color: CARD_COLOR.earth,
            description:
                "Small grains of rock. Can be used to create glass or build structures.",
        },
        {
            name: "Stone",
            ingredients: ["Earth", "Sand"],
            color: CARD_COLOR.earth,
            description:
                "Solid, hard, and durable. Can be used to build structures or create tools.",
        },
        {
            name: "Ice",
            ingredients: ["Water", "Air"],
            color: CARD_COLOR.water,
            description:
                "Solid, crystalline, and cold. Can be used to preserve food or create weapons.",
        },
        {
            name: "Snow",
            ingredients: ["Ice", "Air"],
            color: CARD_COLOR.air,
            description:
                "Frozen water crystals. Can be used to create winter landscapes or cool things down.",
        },
        {
            name: "Earthquake",
            ingredients: ["Earth", "Fire"],
            color: CARD_COLOR.earth,
            description:
                "A sudden shaking of the ground. Can be used to destroy structures or create mountains.",
        },
        {
            name: "Thunder",
            ingredients: ["Lightning", "Air"],
            color: CARD_COLOR.air,
            description:
                "A loud noise caused by lightning. Can be used to scare enemies or create storms.",
        },
        {
            name: "Metal",
            ingredients: ["Lava", "Earth"],
            color: CARD_COLOR.earth,
            description:
                "Solid, strong, and durable. Can be used to create tools or weapons.",
        },
        {
            name: "Glass",
            ingredients: ["Sand", "Fire"],
            color: CARD_COLOR.earth,
            description:
                "Transparent, brittle, and fragile. Can be used to create windows or mirrors.",
        },
        {
            name: "Fog",
            ingredients: ["Mist", "Earth"],
            color: CARD_COLOR.water,
            description:
                "Dense, low-lying cloud. Can be used to obscure vision or create a mysterious atmosphere.",
        },
        {
            name: "Lightning Bolt",
            ingredients: ["Lightning", "Earth"],
            color: CARD_COLOR.fire,
            description:
                "Powerful, destructive, and unpredictable. Can be used to ignite objects or create explosions.",
        },
        {
            name: "Tsunami",
            ingredients: ["Water", "Earthquake"],
            color: CARD_COLOR.water,
            description:
                "Giant wave, destructive, and fast-moving. Can be used to drown objects or create chaos.",
        },
        {
            name: "Aurora",
            ingredients: ["Air", "Lightning"],
            color: CARD_COLOR.air,
            description:
                "Beautiful, colorful display in the sky. Can be used to create a magical atmosphere or illuminate the night.",
        },
        {
            name: "Geyser",
            ingredients: ["Water", "Volcano"],
            color: CARD_COLOR.water,
            description:
                "Hot spring, powerful, and unpredictable. Can be used to create a spectacular display or provide a source of heat.",
        },
        {
            name: "Clay",
            ingredients: ["Mud", "Earth"],
            color: CARD_COLOR.earth,
            description:
                "Malleable, sticky, and versatile. Can be used to create pottery or sculptures.",
        },
        {
            name: "Coral",
            ingredients: ["Water", "Stone"],
            color: CARD_COLOR.earth,
            description:
                "Hard, porous, and colorful. Can be used to build reefs or create jewelry.",
        },
        {
            name: "Magma",
            ingredients: ["Lava", "Fire"],
            color: CARD_COLOR.fire,
            description:
                "Molten rock, extremely hot, and destructive. Can be used to create volcanic eruptions or forge metals.",
        },
        {
            name: "Sleet",
            ingredients: ["Rain", "Ice"],
            color: CARD_COLOR.water,
            description:
                "Frozen rain, slippery, and cold. Can be used to create icy landscapes or make travel difficult.",
        },
        {
            name: "Hail",
            ingredients: ["Ice", "Cloud"],
            color: CARD_COLOR.water,
            description:
                "Frozen precipitation, hard, and damaging. Can be used to create storms or damage crops.",
        },
        {
            name: "Whirlwind",
            ingredients: ["Wind", "Dust"],
            color: CARD_COLOR.air,
            description:
                "Powerful, rotating column of wind. Can be used to lift objects or create havoc.",
        },
        {
            name: "Tornado",
            ingredients: ["Whirlwind", "Cloud"],
            color: CARD_COLOR.air,
            description:
                "Violent, rotating column of air. Can be used to destroy structures or create powerful storms.",
        },
        {
            name: "Blizzard",
            ingredients: ["Snow", "Wind"],
            color: CARD_COLOR.air,
            description:
                "Powerful snowstorm, cold, and blinding. Can be used to create whiteout conditions or make travel impossible.",
        },
        {
            name: "Sandstorm",
            ingredients: ["Wind", "Sand"],
            color: CARD_COLOR.earth,
            description:
                "Powerful storm of sand, blinding, and suffocating. Can be used to bury objects or create a desert landscape.",
        },
        {
            name: "Meteor",
            ingredients: ["Fire", "Stone"],
            color: CARD_COLOR.fire,
            description:
                "Burning rock from space, destructive, and unpredictable. Can be used to create craters or ignite fires.",
        },
        {
            name: "Ash",
            ingredients: ["Fire", "Earth"],
            color: CARD_COLOR.earth,
            description:
                "Fine, powdery residue, gray, and airborne. Can be used to create volcanic landscapes or fertilize soil.",
        },
        {
            name: "Smoke",
            ingredients: ["Fire", "Air"],
            color: CARD_COLOR.air,
            description:
                "Gaseous product of combustion, gray, and obscuring. Can be used to create a smoky atmosphere or obscure vision.",
        },
        {
            name: "Coal",
            ingredients: ["Ash", "Earth"],
            color: CARD_COLOR.earth,
            description:
                "Black, combustible, and carbon-rich. Can be used as fuel or to create steel.",
        },
        {
            name: "Oil",
            ingredients: ["Water", "Earth"],
            color: CARD_COLOR.earth,
            description:
                "Viscous, flammable, and black. Can be used as fuel or to create lubricants.",
        },
        {
            name: "Gas",
            ingredients: ["Air", "Fire"],
            color: CARD_COLOR.air,
            description:
                "Flammable, colorless, and odorless. Can be used as fuel or to create explosions.",
        },
        {
            name: "Plastic",
            ingredients: ["Oil", "Fire"],
            color: CARD_COLOR.earth,
            description:
                "Versatile, moldable, and synthetic. Can be used to create a wide variety of objects or to insulate.",
        },
        {
            name: "Steel",
            ingredients: ["Metal", "Fire"],
            color: CARD_COLOR.earth,
            description:
                "Strong, durable, and malleable. Can be used to create tools, weapons, or structures.",
        },
        {
            name: "Bronze",
            ingredients: ["Copper", "Tin"],
            color: CARD_COLOR.earth,
            description:
                "Hard, durable, and corrosion-resistant. Can be used to create tools, weapons, or sculptures.",
        },
        {
            name: "Gold",
            ingredients: ["Metal", "Fire"],
            color: CARD_COLOR.earth,
            description:
                "Precious, malleable, and non-reactive. Can be used to create jewelry, coins, or electronics.",
        },
        {
            name: "Silver",
            ingredients: ["Metal", "Fire"],
            color: CARD_COLOR.earth,
            description:
                "Precious, conductive, and reflective. Can be used to create jewelry, coins, or photographic film.",
        },
        {
            name: "Copper",
            ingredients: ["Metal", "Fire"],
            color: CARD_COLOR.earth,
            description:
                "Ductile, conductive, and reddish-brown. Can be used to create wires, pipes, or coins.",
        },
        {
            name: "Tin",
            ingredients: ["Metal", "Fire"],
            color: CARD_COLOR.earth,
            description:
                "Soft, malleable, and silvery-white. Can be used to create alloys, solder, or coatings.",
        },
        {
            name: "Iron",
            ingredients: ["Metal", "Fire"],
            color: CARD_COLOR.earth,
            description:
                "Strong, durable, and magnetic. Can be used to create tools, weapons, or structures.",
        },
        {
            name: "Lead",
            ingredients: ["Metal", "Fire"],
            color: CARD_COLOR.earth,
            description:
                "Soft, dense, and toxic. Can be used to create weights, batteries, or shielding.",
        },
        {
            name: "Mercury",
            ingredients: ["Metal", "Fire"],
            color: CARD_COLOR.earth,
            description:
                "Liquid at room temperature, dense, and toxic. Can be used in thermometers, barometers, or scientific experiments.",
        },
        {
            name: "Diamond",
            ingredients: ["Carbon", "Fire"],
            color: CARD_COLOR.earth,
            description:
                "Hardest known natural material, transparent, and beautiful. Can be used to create jewelry or tools.",
        },
        {
            name: "Carbon",
            ingredients: ["Coal", "Fire"],
            color: CARD_COLOR.earth,
            description:
                "Essential element for life, black, and versatile. Can be used to create diamonds, graphite, or plastics.",
        },
        {
            name: "Oxygen",
            ingredients: ["Air", "Fire"],
            color: CARD_COLOR.air,
            description:
                "Colorless, odorless, and essential for life. Can be used for breathing or to create fire.",
        },
        {
            name: "Hydrogen",
            ingredients: ["Water", "Fire"],
            color: CARD_COLOR.water,
            description:
                "Lightest element, colorless, and odorless. Can be used as fuel or to create water.",
        },
        {
            name: "Life",
            ingredients: ["Water", "Oxygen"],
            color: CARD_COLOR.earth,
            description:
                "The ability to grow, reproduce, and adapt. Can be used to create new life or sustain existing life.",
        },
        {
            name: "Tree",
            ingredients: ["Life", "Earth"],
            color: CARD_COLOR.earth,
            description:
                "A tall plant with a woody trunk and branches. Can be used to provide wood or oxygen.",
        },
        {
            name: "Flower",
            ingredients: ["Life", "Water"],
            color: CARD_COLOR.earth,
            description:
                "A colorful part of a plant that produces seeds. Can be used to create beauty or attract pollinators.",
        },
        {
            name: "Animal",
            ingredients: ["Life", "Air"],
            color: CARD_COLOR.earth,
            description:
                "A living organism that can move independently and consume other organisms for food. Can be used to provide food or companionship.",
        },
        {
            name: "Forest",
            ingredients: ["Tree", "Earth"],
            color: CARD_COLOR.earth,
            description:
                "A large area of land covered with trees. Can be used to provide wood or oxygen.",
        },
    ],
};

export const ELEMENTS_MAP = GAME_CONFIG.cards.reduce((acc, card) => {
    acc[card.name] = card;
    return acc;
}, {} as { [s: string]: GameConfigCard });

export const getElementParents = (name: string): string[] => {
    const res = [...ELEMENTS_MAP[name].ingredients];
    res.forEach((parent) => {
        res.push(...getElementParents(parent));
    });
    return res.reduce((acc, el) => {
        if (acc.indexOf(el) === -1) {
            acc.push(el);
        }
        return acc;
    }, [] as string[]);
};

GAME_CONFIG.cards = GAME_CONFIG.cards.map((card) => {
    card.parents = getElementParents(card.name);
    return card;
});
