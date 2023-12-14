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
import { getRandomTestimonials } from "./components/testimonials";

type DiffValue = string | Array<string> | object | number;

const MAX_LEN = 1024 * 5;

interface DiffItem {
    property: string;
    old: DiffValue;
    new: DiffValue;
    meaning: string;
}

interface DiffResult {
    type: string;
    usage: string;
    summarize: string;
    diff: DiffItem[];
}

interface State {
    file1: string;
    file2: string;
    loading: boolean;
    result: DiffResult;
    testimonials: {
        name: string;
        text: string;
    }[];
    error: string;
}

const BLANK_RESULT = {
    type: "",
    usage: "",
    summarize: "",
    diff: [],
} as DiffResult;

interface Props {}

class App extends Component<Props, State> {
    state = {
        loading: false,
        testimonials: [],
        result: BLANK_RESULT,
        error: "",
        file1:
            document.location.hostname === "localhost"
                ? `{
            "compilerOptions": {
              "lib": ["ESNext"],
              "module": "esnext",
              "target": "esnext",
              "moduleResolution": "bundler",
              "allowImportingTsExtensions": true,
              "noEmit": true,
              "composite": true,
              "strict": true,
              "downlevelIteration": true,
              "skipLibCheck": true,
              "jsx": "react-jsx",
              "allowSyntheticDefaultImports": true,
              "forceConsistentCasingInFileNames": true,
              "allowJs": true,
              "types": [
                "bun-types" // add Bun global
              ]
            }
          }
          `
                : "",
        file2:
            document.location.hostname === "localhost"
                ? `{
            "compilerOptions": {
              "lib": ["ESNext", "DOM"],
              "module": "esnext",
              "target": "esnext",
              "moduleResolution": "bundler",
              "moduleDetection": "force",
              "allowImportingTsExtensions": true,
              "noEmit": false,
              "composite": true,
              "strict": true,
              "downlevelIteration": true,
              "skipLibCheck": false,
              "jsx": "react-jsx",
              "allowSyntheticDefaultImports": true,
              "forceConsistentCasingInFileNames": true,
              "allowJs": false,
              "baseUrl:": "./src",
              "types": [
                "bun-types" // add Bun global
              ]
            }
          }
          `
                : "",
    };

    componentDidMount(): void {
        if (this.state.testimonials.length > 0) {
            return;
        }
        const testimonials = getRandomTestimonials(3);
        this.setState({ testimonials });
    }

    async compare() {
        // const b = sessionStorage.getItem("gemini");
        // if (b && b !== "undefined" && b[0] === "{") {
        //     const res = JSON.parse(b);
        //     this.setState({ result: res });
        //     return res;
        // }

        if (
            this.state.file1.length > MAX_LEN ||
            this.state.file2.length > MAX_LEN
        ) {
            this.setState({
                error: "File too large. Max size is 5kb",
            });
            return;
        }

        if (this.state.file1.length < 20 || this.state.file2.length < 20) {
            this.setState({
                error: "File too small. Write something more meaningful",
            });
            return;
        }

        const testimonials = getRandomTestimonials(3);
        this.setState({
            loading: true,
            error: "",
            result: BLANK_RESULT,
            testimonials,
        });
        const res = await callAPI("gemini", ["config"], {
            file1: this.state.file1,
            file2: this.state.file2,
        });
        if (!res.JSON || !res.JSON.type) {
            this.setState({
                loading: false,
                error: "Error building results. Try again leter",
            });
        } else {
            sessionStorage.setItem("gemini", JSON.stringify(res.JSON));
            this.setState({ result: res.JSON, loading: false });
        }
    }

    renderValue(value: DiffValue, def: string = "") {
        if (!value) {
            return def;
        }
        if (typeof value === "string" || typeof value === "number") {
            return value || def;
        }
        return JSON.stringify(value) || def;
    }

    renderResults() {
        return (
            <>
                <Segment textAlign="left">
                    <Grid stackable columns="two">
                        <Grid.Column>
                            <Header as="h1">File Type</Header>
                            <p>{this.state.result.type}</p>
                            <Header as="h1">Usage</Header>
                            <p>{this.state.result.usage}</p>
                        </Grid.Column>
                        <Grid.Column>
                            <Header as="h1">Summary</Header>
                            <p>{this.state.result.summarize}</p>
                        </Grid.Column>
                    </Grid>
                </Segment>
                <Segment textAlign="left">
                    <Table basic="very" celled collapsing>
                        <Table.Header>
                            <Table.Row>
                                <Table.HeaderCell>Property</Table.HeaderCell>
                                <Table.HeaderCell>Old Value</Table.HeaderCell>
                                <Table.HeaderCell>New Value</Table.HeaderCell>
                                <Table.HeaderCell>Meaning</Table.HeaderCell>
                            </Table.Row>
                        </Table.Header>

                        <Table.Body>
                            {this.state.result.diff.map((item: DiffItem) => {
                                return (
                                    <Table.Row>
                                        <Table.Cell>
                                            <Header.Content>
                                                {item.property}
                                            </Header.Content>
                                        </Table.Cell>
                                        <Table.Cell>
                                            {this.renderValue(item.old, "NEW")}
                                        </Table.Cell>
                                        <Table.Cell>
                                            {this.renderValue(
                                                item.new,
                                                "DELETED"
                                            )}
                                        </Table.Cell>
                                        <Table.Cell>{item.meaning}</Table.Cell>
                                    </Table.Row>
                                );
                            })}
                        </Table.Body>
                    </Table>
                </Segment>
            </>
        );
    }

    renderTestimonials() {
        const square = { height: 150 };
        return (
            <div style={{ paddingTop: "15px" }}>
                <Container>
                    <Header inverted as="h2">
                        Testimonials: What people say
                    </Header>
                </Container>
                <div style={{ paddingTop: "15px" }}></div>
                <Grid stackable columns="3">
                    {this.state.testimonials.map(
                        (item: { name: string; text: string }) => {
                            return (
                                <Grid.Column>
                                    <Segment style={square} textAlign="center">
                                        <Header as="h2">
                                            {item.name}
                                            <Header.Subheader>
                                                "<i>{item.text}</i>"
                                            </Header.Subheader>
                                        </Header>
                                    </Segment>
                                </Grid.Column>
                            );
                        }
                    )}
                </Grid>
            </div>
        );
    }

    onUpload(variable: string, e: BaseSyntheticEvent) {
        if (e.target.files) {
            e.preventDefault();

            const reader = new FileReader();

            reader.onload = async (e) => {
                const text = e.target!.result as string;

                variable === "file1"
                    ? this.setState({ file1: text })
                    : this.setState({ file2: text });
            };

            reader.readAsText(e.target.files[0]);
        }
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
                                        Deep Compare:
                                    </Header>
                                </Grid.Column>
                                <Grid.Column width={8}>
                                    <p>
                                        Succinct, yet thorough comparison of two
                                        structured text files, highlighting
                                        differences with detailed explanations
                                        and insights into file usage and impact.
                                        Works with JSON, YAML, XML, Dockerfile,
                                        etc. And even code snippets.
                                    </p>
                                    {/* <Segment>2</Segment> */}
                                </Grid.Column>
                                <Grid.Column>
                                    {/* <Segment>3</Segment> */}
                                </Grid.Column>
                            </Grid>
                        </div>
                    </Container>
                    <Container className="content">
                        <Form>
                            <Segment>
                                <Grid columns={2} stackable textAlign="center">
                                    <Divider vertical>
                                        <Button
                                            primary
                                            disabled={this.state.loading}
                                            onClick={this.compare.bind(this)}
                                        >
                                            Compare
                                        </Button>
                                    </Divider>
                                    <Grid.Row verticalAlign="middle">
                                        <Grid.Column>
                                            <div
                                                style={{ paddingRight: "40px" }}
                                            >
                                                <Header>
                                                    <input
                                                        id="file"
                                                        type="file"
                                                        onChange={this.onUpload.bind(
                                                            this,
                                                            "file1"
                                                        )}
                                                    />
                                                </Header>
                                                <TextArea
                                                    value={this.state.file1}
                                                    placeholder="Paste content of file 1"
                                                    rows="15"
                                                    onChange={(e) =>
                                                        this.setState({
                                                            file1: e.target
                                                                .value,
                                                        })
                                                    }
                                                />
                                            </div>
                                        </Grid.Column>

                                        <Grid.Column>
                                            <div
                                                style={{ paddingLeft: "40px" }}
                                            >
                                                <Header>
                                                    <input
                                                        id="file"
                                                        type="file"
                                                        onChange={this.onUpload.bind(
                                                            this,
                                                            "file2"
                                                        )}
                                                    />
                                                </Header>

                                                <TextArea
                                                    value={this.state.file2}
                                                    placeholder="Paste content of file 2"
                                                    rows="15"
                                                    onChange={(e) =>
                                                        this.setState({
                                                            file2: e.target
                                                                .value,
                                                        })
                                                    }
                                                />
                                            </div>
                                        </Grid.Column>
                                    </Grid.Row>
                                </Grid>
                            </Segment>
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
                            {this.state.result.type
                                ? undefined
                                : this.renderTestimonials()}
                            {this.state.result.type &&
                                !this.state.loading &&
                                this.renderResults()}
                        </Form>
                    </Container>
                </Segment>
            </div>
        );
    }
}

export default App;
