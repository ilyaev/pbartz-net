import { Component, BaseSyntheticEvent } from "react";
import {
    Button,
    Container,
    Dimmer,
    Divider,
    Form,
    Grid,
    Header,
    Loader,
    Segment,
    Table,
    TextArea,
} from "semantic-ui-react";

import "semantic-ui-css/semantic.min.css";
import "./App.css";
import { callAPI } from "./actions/api";

interface State {
    loading: boolean;
    error?: string;
    palette?: any[];
}

interface Props {}

const htmlColor = (s: string) => {
    const regex = /\d+\.\d+/g;

    // Extract numbers
    const matches = s
        .replace(/\,\./gi, ",0.")
        .replace(/\(\./gi, "(0.")
        .match(regex)
        ?.map((x) => Math.round(parseFloat(x) * 255));
    console.log(
        s,
        s.replace(/\,\./gi, ",0.").replace(/\(\./gi, "(0."),
        matches
    );
    return `rgb(${matches?.join(", ")})`;
};

class App extends Component<Props, State> {
    state = {
        loading: false,
        error: undefined,
        palette: [
            {
                name: "Sun",
                description:
                    "A bright and cheerful palette inspired by the sun.",
                colors: [
                    {
                        color: "rgb(0.67, 0.52, 0.41)",
                    },
                    {
                        color: "rgb(0.45, 0.42, 0.41)",
                    },
                    {
                        color: "rgb(0.34, 0.32, 0.31)",
                    },
                    {
                        color: "rgb(0.27, 0.25, 0.24)",
                    },
                    {
                        color: "rgb(0.76, 0.73, 0.69)",
                    },
                ].map((x) => x.color),
            },
            {
                name: "Warm Sunset",
                description:
                    "A warm and inviting palette inspired by a sunset.",
                colors: [
                    "rgb(.9,.3,.1)",
                    "rgb(1.0,.48,.28)",
                    "rgb(1.0,.59,.44)",
                    "rgb(.98,.77,.63)",
                    "rgb(.98,.85,.75)",
                ],
            },
            {
                name: "Cool Ocean",
                description:
                    "A cool and refreshing palette inspired by the ocean.",
                colors: [
                    "rgb(.9,.3,.1)",
                    "rgb(.27,.42,.51)",
                    "rgb(.42,.6,.7)",
                    "rgb(.47,.76,.84)",
                    "rgb(.56,.87,.9)",
                ],
            },
            {
                name: "Forest Greens",
                description: "A lush and vibrant palette inspired by a forest.",
                colors: [
                    "rgb(.9,.3,.1)",
                    "rgb(.27,.46,.29)",
                    "rgb(.4,.62,.4)",
                    "rgb(.47,.77,.51)",
                    "rgb(.53,.89,.58)",
                ],
            },
            {
                name: "Desert Sands",
                description:
                    "A warm and earthy palette inspired by the desert.",
                colors: [
                    "rgb(.9,.3,.1)",
                    "rgb(.96,.79,.54)",
                    "rgb(.98,.85,.72)",
                    "rgb(1.0,.89,.77)",
                    "rgb(1.0,.9,.82)",
                ],
            },
            {
                name: "Tropical Paradise",
                description:
                    "A bright and cheerful palette inspired by a tropical paradise.",
                colors: [
                    "rgb(.9,.3,.1)",
                    "rgb(.37,.7,.39)",
                    "rgb(.62,.85,.33)",
                    "rgb(.8,.9,.37)",
                    "rgb(.98,1.0,.44)",
                ],
            },
            {
                name: "Monochromatic Red",
                description: "A monochromatic palette based on the color red.",
                colors: [
                    "rgb(.9,.3,.1)",
                    "rgb(.92,.34,.12)",
                    "rgb(.94,.38,.13)",
                    "rgb(.96,.41,.15)",
                    "rgb(.98,.44,.17)",
                ],
            },
            {
                name: "Complementary Green and Red",
                description:
                    "A complementary palette based on the colors green and red.",
                colors: [
                    "rgb(.9,.3,.1)",
                    "rgb(.27,.46,.29)",
                    "rgb(.4,.62,.4)",
                    "rgb(.47,.77,.51)",
                    "rgb(.53,.89,.58)",
                ],
            },
            {
                name: "Analogous Yellow, Orange, and Red",
                description:
                    "An analogous palette based on the colors yellow, orange, and red.",
                colors: [
                    "rgb(.9,.3,.1)",
                    "rgb(1.0,.85,.75)",
                    "rgb(.98,.77,.63)",
                    "rgb(.96,.72,.59)",
                    "rgb(.95,.66,.54)",
                ],
            },
            {
                name: "Triadic Blue, Red, and Yellow",
                description:
                    "A triadic palette based on the colors blue, red, and yellow.",
                colors: [
                    "rgb(.9,.3,.1)",
                    "rgb(.27,.42,.51)",
                    "rgb(1.0,.85,.75)",
                    "rgb(.47,.76,.84)",
                    "rgb(.8,.9,.37)",
                ],
            },
            {
                name: "Tetradic Blue, Green, Orange, and Red",
                description:
                    "A tetradic palette based on the colors blue, green, orange, and red.",
                colors: [
                    "rgb(.9,.3,.1)",
                    "rgb(.27,.46,.29)",
                    "rgb(.4,.62,.4)",
                    "rgb(.98,.44,.17)",
                    "rgb(.27,.42,.51)",
                ],
            },
            {
                name: "Split-Complementary Red, Blue-Green, and Yellow",
                description:
                    "A split-complementary palette based on the colors red, blue-green, and yellow.",
                colors: [
                    "rgb(.9,.3,.1)",
                    "rgb(.19,.51,.45)",
                    "rgb(1.0,.85,.75)",
                    "rgb(.36,.71,.63)",
                    "rgb(.8,.9,.37)",
                ],
            },
            {
                name: "Double Split-Complementary Red, Green-Blue, and Yellow-Orange",
                description:
                    "A double split-complementary palette based on the colors red, green-blue, and yellow-orange.",
                colors: [
                    "rgb(.9,.3,.1)",
                    "rgb(.25,.53,.54)",
                    "rgb(.96,.72,.59)",
                    "rgb(.38,.68,.64)",
                    "rgb(1.0,.85,.75)",
                ],
            },
            {
                name: "Triadic with Shades and Tints",
                description:
                    "A triadic palette with shades and tints of the primary colors.",
                colors: [
                    "rgb(.9,.3,.1)",
                    "rgb(.72,.24,.08)",
                    "rgb(1.0,.59,.44)",
                    "rgb(.47,.76,.84)",
                    "rgb(.56,.87,.9)",
                ],
            },
            {
                name: "Analogous with Accents",
                description: "An analogous palette with accent colors.",
                colors: [
                    "rgb(.9,.3,.1)",
                    "rgb(1.0,.59,.44)",
                    "rgb(.98,.77,.63)",
                    "rgb(.37,.7,.39)",
                    "rgb(.27,.46,.29)",
                ],
            },
            {
                name: "Monochromatic with Shades and Tints",
                description:
                    "A monochromatic palette with shades and tints of the primary color.",
                colors: [
                    "rgb(.9,.3,.1)",
                    "rgb(.82,.27,.09)",
                    "rgb(.73,.22,.07)",
                    "rgb(.65,.17,.06)",
                    "rgb(.56,.12,.05)",
                ],
            },
        ]
            .concat([
                {
                    name: "Warm Embrace",
                    description:
                        "A cozy palette of warm, inviting colors that evoke a sense of comfort and security.",
                    colors: [
                        "rgb(0.9, 0.3, 0.1)",
                        "rgb(1.0, 0.6, 0.2)",
                        "rgb(1.0, 0.8, 0.4)",
                        "rgb(0.9, 0.7, 0.5)",
                        "rgb(0.8, 0.6, 0.4)",
                    ],
                },
                {
                    name: "Autumn Glow",
                    description:
                        "A vibrant palette of rich, warm colors that capture the essence of the autumn season.",
                    colors: [
                        "rgb(0.9, 0.3, 0.1)",
                        "rgb(1.0, 0.7, 0.2)",
                        "rgb(0.9, 0.6, 0.3)",
                        "rgb(0.8, 0.5, 0.4)",
                        "rgb(0.7, 0.4, 0.3)",
                    ],
                },
                {
                    name: "Desert Sunset",
                    description:
                        "A warm, earthy palette inspired by the colors of a desert sunset.",
                    colors: [
                        "rgb(0.9, 0.3, 0.1)",
                        "rgb(0.9, 0.7, 0.3)",
                        "rgb(1.0, 0.8, 0.4)",
                        "rgb(0.9, 0.6, 0.5)",
                        "rgb(0.8, 0.5, 0.4)",
                    ],
                },
                {
                    name: "Midnight Sky",
                    description:
                        "A deep, rich palette of cool colors that evoke the mystery and wonder of the night sky.",
                    colors: [
                        "rgb(0.9, 0.3, 0.1)",
                        "rgb(0.3, 0.3, 0.5)",
                        "rgb(0.4, 0.4, 0.6)",
                        "rgb(0.5, 0.5, 0.7)",
                        "rgb(0.6, 0.6, 0.8)",
                    ],
                },
                {
                    name: "Tropical Paradise",
                    description:
                        "A vibrant, cheerful palette of bright colors that evoke the feeling of a tropical paradise.",
                    colors: [
                        "rgb(0.9, 0.3, 0.1)",
                        "rgb(0.3, 0.7, 0.3)",
                        "rgb(0.4, 0.8, 0.4)",
                        "rgb(0.5, 0.9, 0.5)",
                        "rgb(0.6, 1.0, 0.6)",
                    ],
                },
                {
                    name: "Lavender Fields",
                    description:
                        "A soft, calming palette of purple and pink colors inspired by the beauty of lavender fields.",
                    colors: [
                        "rgb(0.9, 0.3, 0.1)",
                        "rgb(0.7, 0.3, 0.5)",
                        "rgb(0.8, 0.4, 0.6)",
                        "rgb(0.9, 0.5, 0.7)",
                        "rgb(1.0, 0.6, 0.8)",
                    ],
                },
                {
                    name: "Forest Green",
                    description:
                        "A deep, rich palette of green colors that evoke the feeling of a lush forest.",
                    colors: [
                        "rgb(0.9, 0.3, 0.1)",
                        "rgb(0.3, 0.5, 0.3)",
                        "rgb(0.4, 0.6, 0.4)",
                        "rgb(0.5, 0.7, 0.5)",
                        "rgb(0.6, 0.8, 0.6)",
                    ],
                },
                {
                    name: "Ocean Depths",
                    description:
                        "A cool, mysterious palette of blue and green colors that evoke the feeling of the deep ocean.",
                    colors: [
                        "rgb(0.9, 0.3, 0.1)",
                        "rgb(0.3, 0.4, 0.5)",
                        "rgb(0.4, 0.5, 0.6)",
                        "rgb(0.5, 0.6, 0.7)",
                        "rgb(0.6, 0.7, 0.8)",
                    ],
                },
                {
                    name: "Candy Shop",
                    description:
                        "A bright, cheerful palette of pastel colors that evoke the feeling of a candy shop.",
                    colors: [
                        "rgb(0.9, 0.3, 0.1)",
                        "rgb(0.7, 0.5, 0.3)",
                        "rgb(0.8, 0.6, 0.4)",
                        "rgb(0.9, 0.7, 0.5)",
                        "rgb(1.0, 0.8, 0.6)",
                    ],
                },
                {
                    name: "Monochrome",
                    description:
                        "A simple, elegant palette of shades of a single color.",
                    colors: [
                        "rgb(0.9, 0.3, 0.1)",
                        "rgb(0.8, 0.2, 0.05)",
                        "rgb(0.7, 0.1, 0.02)",
                        "rgb(0.6, 0.05, 0.01)",
                        "rgb(0.5, 0.02, 0.005)",
                    ],
                },
            ])
            .concat([
                {
                    name: "Autumn Sunset",
                    description:
                        "A warm and inviting palette inspired by the colors of a autumn sunset.",
                    colors: [
                        "rgb(0.9, 0.3, 0.1)",
                        "rgb(0.87, 0.27, 0.08)",
                        "rgb(0.85, 0.24, 0.06)",
                        "rgb(0.82, 0.20, 0.04)",
                        "rgb(0.78, 0.17, 0.02)",
                    ],
                },
                {
                    name: "Desert Heat",
                    description:
                        "A hot and dusty palette inspired by the colors of a desert.",
                    colors: [
                        "rgb(0.9, 0.3, 0.1)",
                        "rgb(0.8, 0.25, 0.05)",
                        "rgb(0.7, 0.2, 0.0)",
                        "rgb(0.6, 0.15, 0.05)",
                        "rgb(0.5, 0.1, 0.1)",
                    ],
                },
                {
                    name: "Arctic Chill",
                    description:
                        "A cool and crisp palette inspired by the colors of the arctic.",
                    colors: [
                        "rgb(0.9, 0.3, 0.1)",
                        "rgb(0.7, 0.6, 0.8)",
                        "rgb(0.5, 0.8, 1.0)",
                        "rgb(0.3, 1.0, 1.0)",
                        "rgb(0.1, 1.0, 0.8)",
                    ],
                },
                {
                    name: "Forest Green",
                    description:
                        "A lush and verdant palette inspired by the colors of a forest.",
                    colors: [
                        "rgb(0.9, 0.3, 0.1)",
                        "rgb(0.3, 0.4, 0.2)",
                        "rgb(0.2, 0.5, 0.3)",
                        "rgb(0.1, 0.6, 0.4)",
                        "rgb(0.0, 0.7, 0.5)",
                    ],
                },
                {
                    name: "Ocean Blue",
                    description:
                        "A deep and mysterious palette inspired by the colors of the ocean.",
                    colors: [
                        "rgb(0.9, 0.3, 0.1)",
                        "rgb(0.3, 0.4, 0.6)",
                        "rgb(0.2, 0.5, 0.7)",
                        "rgb(0.1, 0.6, 0.8)",
                        "rgb(0.0, 0.7, 0.9)",
                    ],
                },
            ])
            .concat([
                {
                    name: "Warm and Energetic",
                    description:
                        "A vibrant palette that exudes warmth and energy.",
                    colors: [
                        "rgb(.9,.3,.1)",
                        "rgb(1.0,.5,.2)",
                        "rgb(1.00,.60,.30)",
                        "rgb(1.00,.70,.40)",
                        "rgb(1.00,.80,.50)",
                    ],
                },
                {
                    name: "Cool and Tranquil",
                    description:
                        "A serene palette that evokes a sense of tranquility and calmness.",
                    colors: [
                        "rgb(.9,.3,.1)",
                        "rgb(.8,.4,.5)",
                        "rgb(.7,.5,.6)",
                        "rgb(.6,.6,.7)",
                        "rgb(.5,.7,.8)",
                    ],
                },
                {
                    name: "Earthy and Natural",
                    description:
                        "A palette that captures the essence of nature, featuring earthy and organic tones.",
                    colors: [
                        "rgb(.9,.3,.1)",
                        "rgb(.7,.5,.3)",
                        "rgb(.6,.4,.2)",
                        "rgb(.5,.3,.2)",
                        "rgb(.4,.2,.1)",
                    ],
                },
                {
                    name: "Bright and Cheerful",
                    description:
                        "A cheerful palette that radiates brightness and optimism.",
                    colors: [
                        "rgb(.9,.3,.1)",
                        "rgb(1.0,.6,.2)",
                        "rgb(1.0,.7,.3)",
                        "rgb(1.0,.8,.4)",
                        "rgb(1.0,.9,.5)",
                    ],
                },
                {
                    name: "Dark and Moody",
                    description:
                        "A palette that evokes a sense of mystery and intrigue, with deep and moody tones.",
                    colors: [
                        "rgb(.9,.3,.1)",
                        "rgb(.5,.2,.1)",
                        "rgb(.4,.2,.1)",
                        "rgb(.3,.1,.1)",
                        "rgb(.2,.1,.1)",
                    ],
                },
            ])
            .concat([
                {
                    name: "Complementary Palette",
                    description:
                        "This palette uses the complementary color of the main color, resulting in a high-contrast effect.",
                    colors: ["rgb(0.9, 0.3, 0.1)", "rgb(0.1, 0.7, 0.9)"],
                },
                {
                    name: "Analogous Palette",
                    description:
                        "This palette uses colors that are adjacent to the main color on the color wheel, resulting in a harmonious effect.",
                    colors: [
                        "rgb(0.9, 0.3, 0.1)",
                        "rgb(0.8, 0.4, 0.2)",
                        "rgb(1.0, 0.2, 0.0)",
                    ],
                },
                {
                    name: "Triadic Palette",
                    description:
                        "This palette uses three colors that are evenly spaced around the color wheel, resulting in a vibrant effect.",
                    colors: [
                        "rgb(0.9, 0.3, 0.1)",
                        "rgb(0.2, 0.8, 0.3)",
                        "rgb(0.6, 0.2, 0.8)",
                    ],
                },
                {
                    name: "Earth Tones Palette",
                    description:
                        "This palette uses warm, natural colors that are often found in nature.",
                    colors: [
                        "rgb(0.9, 0.3, 0.1)",
                        "rgb(0.7, 0.5, 0.3)",
                        "rgb(0.5, 0.4, 0.2)",
                    ],
                },
                {
                    name: "Cool Tones Palette",
                    description:
                        "This palette uses cool, refreshing colors that are often associated with water and ice.",
                    colors: [
                        "rgb(0.9, 0.3, 0.1)",
                        "rgb(0.2, 0.7, 0.9)",
                        "rgb(0.3, 0.5, 0.7)",
                    ],
                },
            ]),
    };

    componentDidMount(): void {}

    renderPalette() {
        return this.state.palette.map((palette) => {
            return (
                <>
                    <div>{palette.name}</div>
                    <div style={{ display: "flex", flexDirection: "row" }}>
                        {palette.colors.map((color) => {
                            return (
                                <div
                                    style={{
                                        padding: "5px",
                                        // margin: "1px",
                                        width: "100px",
                                        height: "50px",
                                        backgroundColor: htmlColor(color),
                                    }}
                                ></div>
                            );
                        })}
                    </div>
                </>
            );
        });
    }

    render() {
        return (
            <div className="App">
                <Segment inverted vertical textAlign="center">
                    <Container textAlign="left">
                        <div>
                            <Grid columns="equal">
                                <Grid.Column>
                                    <Header inverted as="h1">
                                        Creative Palette
                                    </Header>
                                </Grid.Column>
                                <Grid.Column width={8}>
                                    <p>
                                        Palette generator based on texts and
                                        pictures
                                    </p>
                                </Grid.Column>
                            </Grid>
                        </div>
                    </Container>
                    <Container className="content">
                        <Form>
                            <Segment></Segment>
                            <Dimmer active={this.state.loading}>
                                <Loader>Generating report...</Loader>
                            </Dimmer>
                            {/* <Segment.Inline>
                                <Button
                                    primary
                                    disabled={this.state.loading}
                                    onClick={this.compare.bind(this)}
                                >
                                    Compare
                                </Button>
                            </Segment.Inline> */}
                            {this.state.error && (
                                <Segment color="red" inverted>
                                    {this.state.error}
                                </Segment>
                            )}
                            {this.state.palette.length && this.renderPalette()}
                        </Form>
                    </Container>
                </Segment>
            </div>
        );
    }
}

export default App;
