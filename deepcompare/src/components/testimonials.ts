export const TESTIMONIALS = [
    {
        name: "Felix the Fox",
        text: "Deep Compare has been an absolute game-changer for managing my JSON configs. It's so intuitive and precise, I can't imagine going back to manual comparisons!",
    },
    {
        name: "Ollie the Owl",
        text: "The level of detail that Deep Compare provides is unmatched. It's like having an extra set of eyes that never misses a single difference in my YAML files.",
    },
    {
        name: "Molly the Mole",
        text: "As someone who works with nested configuration files daily, Deep Compare has saved me countless hours. It digs deep into the structure, ensuring nothing is overlooked.",
    },
    {
        name: "Gerry the Giraffe",
        text: "I love how Deep Compare elevates my view over complex configurations. It's the tool I've been longing for to maintain a high-level overview while managing detailed settings.",
    },
    {
        name: "Leo the Lion",
        text: "In the tech jungle, Deep Compare stands out as the king. It's powerful, robust, and the customer support is as responsive as a lion's reflexes.",
    },
    {
        name: "Penny the Penguin",
        text: "I work in a chilly environment with lots of moving parts. Deep Compare has brought warmth and efficiency to my workflow, making file comparisons a breeze!",
    },
    {
        name: "Bella the Butterfly",
        text: "With Deep Compare, I flit through config comparisons with ease. The interface is as colorful and user-friendly as a butterfly garden!",
    },
    {
        name: "Sammy the Squirrel",
        text: "Juggling multiple configuration formats can be nuts, but Deep Compare handles it with such finesse. It's like having a secret stash of efficiency acorns!",
    },
    {
        name: "Daisy the Dolphin",
        text: "Deep Compare is the smartest tool in the sea of configuration management. Its intelligent comparison algorithm swims circles around the competition!",
    },
    {
        name: "Eddie the Eagle",
        text: "Soaring above the mountains of data, Deep Compare gives me the eagle-eyed precision I need. It's the apex tool for any serious developer.",
    },
].concat([
    {
        name: "Wally the Walrus",
        text: "Deep Compare has streamlined my configuration management process like nothing else. It's robust, reliable, and absolutely indispensable!",
    },
    {
        name: "Tina the Tiger",
        text: "The precision and depth of Deep Compare are unrivaled. It's the perfect tool for prowling through complex config files.",
    },
    {
        name: "Ricky the Rabbit",
        text: "For quick and efficient file comparisons, Deep Compare is my go-to. It's like hopping through fields of data with ease!",
    },
    {
        name: "Hazel the Hedgehog",
        text: "Deep Compare navigates through the thorns of complicated configurations with ease. It's a lifesaver for any developer!",
    },
    {
        name: "Barney the Bear",
        text: "I've been using Deep Compare to manage large JSON files. It's as powerful and reliable as a bear in the tech woods!",
    },
    {
        name: "Zoe the Zebra",
        text: "Deep Compare stands out with its clear and intuitive interface, much like a zebra in the wild. It's absolutely essential for my coding projects.",
    },
    {
        name: "Percy the Peacock",
        text: "The elegance and functionality of Deep Compare are like the plumage of a peacock – impressive and effective.",
    },
    {
        name: "Gavin the Gorilla",
        text: "Deep Compare is a heavyweight in file comparison. It's as strong and dependable as a gorilla when it comes to handling my YAML files.",
    },
    {
        name: "Ivy the Iguana",
        text: "Navigating complex file structures is a breeze with Deep Compare. It's as adept and agile as an iguana in the wild!",
    },
    {
        name: "Frankie the Frog",
        text: "Deep Compare leaps ahead of other tools in terms of functionality and ease of use. It's been a game-changer for my development workflow.",
    },
]);

export const getRandomTestimonials = (count: number) => {
    const randomTestimonials = [];
    const usedIndexes = new Set<number>(); // Keep track of used indexes

    while (randomTestimonials.length < count) {
        const randomIndex = Math.floor(Math.random() * TESTIMONIALS.length);

        if (!usedIndexes.has(randomIndex)) {
            randomTestimonials.push(TESTIMONIALS[randomIndex]);
            usedIndexes.add(randomIndex);
        }
    }

    return randomTestimonials;
};
