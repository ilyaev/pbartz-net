import { googleLogout } from "@react-oauth/google";
import { Component } from "react";
import "react-data-grid/lib/styles.css";
import { Button, Dropdown, Header, Input } from "semantic-ui-react";
import { currencyFormatter } from "./grid";

export interface State {
    search: string;
    categories: string[];
    date: string;
    initialized: boolean;
}

interface Props {
    categories: string[];
    total: number;
    onChange: (params: State, skip: boolean) => void;
}

let TIMER_ID;

const CURRENT_YEAR = new Date().getFullYear();

class FinToolbar extends Component<Props, State> {
    state = {
        search: "",
        categories: [],
        date: `${CURRENT_YEAR}-`,
        initialized: false,
    };

    loadState = () => {
        const state = {} as State;
        const hash = document.location.hash.replace(/^#/, "");
        hash.split("&").forEach((it) => {
            const [key, value] = decodeURIComponent(it).split("=");
            if (key === "search") {
                state.search = value;
            } else if (key === "categories") {
                state.categories = value
                    .split(",")
                    .map((v) => decodeURIComponent(v));
            } else if (key === "date") {
                state.date = value;
            }
        });

        if (typeof state.search === "undefined") {
            state.search = "";
        }
        if (typeof state.categories === "undefined") {
            state.categories = [];
        }
        if (typeof state.date === "undefined") {
            state.date = `${CURRENT_YEAR}-`;
        }

        // const isInitialized = this.state.initialized;

        if (
            JSON.stringify(state) !== JSON.stringify(this.state) ||
            !this.state.initialized
        ) {
            state.initialized = true;
            setTimeout(() => {
                this.setState(state);
                this.props.onChange(state, true);
            }, 100);
        }
    };

    componentDidMount(): void {
        addEventListener("hashchange", this.onHashChange);
        this.loadState();
    }

    componentWillUnmount(): void {
        removeEventListener("hashchange", this.onHashChange);
    }

    onHashChange = () => {
        setTimeout(() => {
            this.loadState();
        }, 100);
    };

    render() {
        const options = this.props.categories.map((category) => {
            return {
                key: category,
                text: category,
                value: category,
            };
        });

        return (
            <div className="toolbar">
                <Input
                    icon={"search"}
                    placeholder="Search..."
                    value={this.state.search}
                    onChange={(val) => {
                        this.setState({ search: val.target.value });
                        setTimeout(() => {
                            if (TIMER_ID) {
                                clearTimeout(TIMER_ID);
                            }
                            TIMER_ID = setTimeout(() => {
                                this.props.onChange(this.state, false);
                                clearTimeout(TIMER_ID);
                            }, 300);
                        }, 100);
                    }}
                />
                <div className="dropdown">
                    <Dropdown
                        placeholder="Categories..."
                        fluid
                        multiple
                        selection
                        options={options}
                        value={this.state.categories}
                        onChange={(_e, data) => {
                            this.setState({
                                categories: data.value as string[],
                            });
                            setTimeout(() => {
                                this.props.onChange(this.state, false);
                            }, 100);
                        }}
                    />
                </div>
                <Input
                    icon={"search"}
                    placeholder="Date..."
                    className="date-search"
                    value={this.state.date}
                    onChange={(val) => {
                        this.setState({ date: val.target.value });
                        setTimeout(() => {
                            this.props.onChange(this.state, false);
                        }, 100);
                    }}
                />
                <div className="toolbar-button">
                    <Button
                        onClick={() => {
                            this.setState({
                                search: "",
                                categories: [],
                                date: `${CURRENT_YEAR}-`,
                            });
                            this.props.onChange(
                                {
                                    search: "",
                                    categories: [],
                                    date: `${CURRENT_YEAR}-`,
                                    initialized: true,
                                },
                                false
                            );
                        }}
                    >
                        Reset
                    </Button>
                </div>
                <div
                    style={{ flex: 1, marginTop: "10px", textAlign: "center" }}
                >
                    <Header as="h3">
                        {currencyFormatter.format(this.props.total)}
                    </Header>
                </div>
                <div className="toolbar-button-logout">
                    <Button
                        onClick={() => {
                            localStorage.setItem("email", "");
                            googleLogout();
                            setTimeout(() => {
                                document.location.reload();
                            }, 500);
                        }}
                    >
                        Log Out
                    </Button>
                </div>
            </div>
        );
    }
}

export default FinToolbar;
