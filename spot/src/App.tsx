import { Component } from "react";
import {
    Container,
    Grid,
    Header,
    Menu,
    Segment,
    Visibility,
} from "semantic-ui-react";

import "semantic-ui-css/semantic.min.css";
import "./App.css";

interface State {
    fixed: boolean;
}
interface Props {}

class App extends Component<Props, State> {
    state = {
        fixed: false,
    };

    componentDidMount(): void {}

    hideFixedMenu = () => this.setState({ fixed: false });
    showFixedMenu = () => this.setState({ fixed: true });

    render() {
        const { fixed } = this.state;
        return (
            <div className="App">
                <Visibility
                    once={false}
                    onBottomPassed={this.showFixedMenu}
                    onBottomPassedReverse={this.hideFixedMenu}
                >
                    <Segment
                        inverted
                        textAlign="center"
                        style={{
                            minHeight: 400,
                            padding: "1em 0em",
                            background:
                                // "url(https://source.unsplash.com/800x600/?music)",
                                "url(/app_bg_8.jpg)",
                            backgroundSize: "cover",
                            backgroundPosition: "center",
                            // filter: "blur(5px) brightness(0.5)",
                        }}
                        vertical
                    >
                        {/* <div
                            style={{
                                position: "absolute",
                                top: "0",
                                left: "0",
                                width: "100%",
                                height: "100%",
                                zIndex: 0,

                            }}
                        ></div> */}
                        <div style={{ zIndex: 100 }}>
                            <Menu
                                fixed={fixed ? "top" : undefined}
                                inverted={!fixed}
                                pointing={!fixed}
                                secondary={!fixed}
                                size="large"
                            >
                                <Container>
                                    {/* <Menu.Item as="a" active>
                                        Design
                                    </Menu.Item>
                                    <Menu.Item as="a">FAQ</Menu.Item>
                                    <Menu.Item as="a">Contact</Menu.Item>
                                    <Menu.Item as="a">Download</Menu.Item> */}
                                    {/* <Menu.Item position="right">
                                    <Button as="a" inverted={!fixed}>
                                        Log in
                                    </Button>
                                    <Button
                                        as="a"
                                        inverted={!fixed}
                                        primary={fixed}
                                        style={{ marginLeft: "0.5em" }}
                                    >
                                        Sign Up
                                    </Button>
                                </Menu.Item> */}
                                </Container>
                            </Menu>
                            {this.renderHeading()}
                        </div>
                    </Segment>
                </Visibility>

                <Segment style={{ padding: "3em 0em" }} vertical>
                    <Grid container stackable verticalAlign="middle">
                        <Grid.Row>
                            <Grid.Column width={7}>
                                <Header as="h3" style={{ fontSize: "2em" }}>
                                    Quick Access Playlists:
                                </Header>
                                <p style={{ fontSize: "1.33em" }}>
                                    Dive into your music without delay. Playlist
                                    Spot smartly tracks your most frequently
                                    used playlists, offering them on a platter
                                    for instant enjoyment.
                                </p>
                                <Header as="h3" style={{ fontSize: "2em" }}>
                                    Live Track Details:
                                </Header>
                                <p style={{ fontSize: "1.33em" }}>
                                    Stay in tune with the music. Get intriguing
                                    insights about the current track playing,
                                    from artist trivia to song facts that enrich
                                    your listening experience.
                                </p>
                            </Grid.Column>
                            <Grid.Column floated="right" width={7}>
                                <Header as="h3" style={{ fontSize: "2em" }}>
                                    Dynamic Audio Visualization:
                                </Header>
                                <p style={{ fontSize: "1.33em" }}>
                                    See your music come to life. With Playlist
                                    Spot, each track is an audio-visual
                                    spectacle, offering a feast for the eyes as
                                    well as the ears.
                                </p>
                                <Header as="h3" style={{ fontSize: "2em" }}>
                                    One-Click Convenience:
                                </Header>
                                <p style={{ fontSize: "1.33em" }}>
                                    Love what you're hearing? Add the currently
                                    playing track to your preferred playlist
                                    with just a single click, making playlist
                                    management seamless and straightforward.
                                </p>
                            </Grid.Column>
                        </Grid.Row>
                        <Grid.Row>
                            <Grid.Column textAlign="left">
                                *Spotify premium required
                            </Grid.Column>
                        </Grid.Row>
                    </Grid>
                </Segment>
            </div>
        );
    }

    renderHeading(mobile: boolean = false) {
        return (
            <Container text>
                <Header
                    as="h1"
                    content="Playlist Spot"
                    inverted
                    style={{
                        fontSize: mobile ? "2em" : "4em",
                        fontWeight: "normal",
                        marginBottom: 0,
                        zIndex: 100,
                        marginTop: mobile ? ".25em" : ".5em",
                    }}
                />
                <Header
                    as="h2"
                    content="The Easy Way to Enjoy Spotify on Your Mac*"
                    inverted
                    style={{
                        fontSize: mobile ? "1.5em" : "1.7em",
                        fontWeight: "normal",
                        marginTop: mobile ? "0.3em" : "1.em",
                    }}
                />
                <a href="">
                    <img style={{ marginTop: ".1em" }} src="/appstore.svg" />
                </a>
                {/* <Button primary size="huge">
                    Get Started
                    <Icon name={"right arrow"} />
                </Button> */}
            </Container>
        );
    }
}

export default App;
