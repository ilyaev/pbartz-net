import { Component } from "react";
import {
    Button,
    Container,
    Divider,
    Form,
    Grid,
    Header,
    Icon,
    Segment,
    Table,
    TextArea,
} from "semantic-ui-react";

import "semantic-ui-css/semantic.min.css";
import "./App.css";
import { callAPI } from "./actions/api";

type DiffValue = string | Array<string> | object | number;

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
        result: BLANK_RESULT,
        file1: `{
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
          `,
        file2: `{
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
          `,
    };

    async compare() {
        const b = sessionStorage.getItem("gemini");
        if (b && b !== "undefined" && b[0] === "{") {
            const res = JSON.parse(b);
            this.setState({ result: res });
            return res;
        }
        this.setState({ loading: true });
        const res = await callAPI("gemini", ["config"], {
            file1: this.state.file1,
            file2: this.state.file2,
        });
        sessionStorage.setItem("gemini", JSON.stringify(res.JSON));
        this.setState({ result: res.JSON, loading: false });
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

    render() {
        return (
            <div className="App">
                <Segment inverted vertical textAlign="center">
                    <Container>
                        <Header inverted as="h1">
                            Deep Compare Configuration Files
                        </Header>
                    </Container>
                    <Container className="content">
                        <Form>
                            <Segment>
                                <Grid columns={2} stackable textAlign="center">
                                    <Divider vertical>Vs</Divider>
                                    <Grid.Row verticalAlign="middle">
                                        <Grid.Column>
                                            <Header>
                                                <Icon name="file" />
                                                File 1
                                            </Header>

                                            <TextArea
                                                value={this.state.file1}
                                                placeholder="Paste content of file 1"
                                                rows="15"
                                                onChange={(e) =>
                                                    this.setState({
                                                        file1: e.target.value,
                                                    })
                                                }
                                            />
                                        </Grid.Column>

                                        <Grid.Column>
                                            <Header>
                                                <Icon name="file" />
                                                File 2
                                            </Header>

                                            <TextArea
                                                value={this.state.file2}
                                                placeholder="Paste content of file 2"
                                                rows="15"
                                                onChange={(e) =>
                                                    this.setState({
                                                        file2: e.target.value,
                                                    })
                                                }
                                            />
                                        </Grid.Column>
                                    </Grid.Row>
                                </Grid>
                            </Segment>
                            <Segment.Inline>
                                <Button
                                    primary
                                    disabled={this.state.loading}
                                    onClick={this.compare.bind(this)}
                                >
                                    Compare
                                </Button>
                            </Segment.Inline>
                            {this.state.result.type &&
                                !this.state.loading &&
                                this.renderResults()}
                        </Form>
                    </Container>

                    {/* <Segment inverted vertical as="footer">
                        Cover template
                    </Segment> */}
                </Segment>
            </div>
        );
    }
}

export default App;
