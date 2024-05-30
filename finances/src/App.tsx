import { Component } from "react";
import "./App.css";
import "semantic-ui-css/semantic.min.css";
import { callAPI } from "./api";
import FinGrid from "./grid";
import FinCharts from "./charts";
import FinToolbar from "./toolbar";
import { State as ToolbarState } from "./toolbar";
import CategoryModal from "./category";

export interface Row {
    date: string;
    description: string;
    amount: string;
    category: string;
    source: string;
}

interface Props {}
interface State {
    rows: Row[];
    allRows: Row[];
    loaded: boolean;
    categories: string[];
    filters: ToolbarState;
    initialized: boolean;
    categoryModal: boolean;
    categoryDescription: string;
    category: string;
}

class App extends Component<Props, State> {
    state = {
        rows: [] as Row[],
        allRows: [] as Row[],
        loaded: false,
        categories: [],
        filters: {} as ToolbarState,
        initialized: false,
        categoryModal: false,
        categoryDescription: "",
        category: "",
    };

    async componentDidMount() {
        const data = await callAPI("finances", ["rows"], {
            email: (localStorage.getItem("email") || "").replace(/"/g, ""),
        });
        const categories = data.result.reduce((acc: string[], row: Row) => {
            if (acc.indexOf(row.category) === -1) {
                acc.push(row.category);
            }
            return acc;
        }, []);
        const rows = data.result
            .filter((a: Row) =>
                parseFloat(a.amount) > 0 &&
                a.description.indexOf("UCSCEPAY") === -1 &&
                a.description.indexOf("DR ADJ REDIST") === -1 &&
                a.description.indexOf("HIMS & HERS") === -1
                    ? true
                    : false
            )
            .sort((a: Row, b: Row) => (a.date < b.date ? 1 : -1));
        this.setState({
            loaded: true,
            categories: categories.sort(),
            allRows: [].concat(rows),
            rows: rows,
        });
    }
    syncState = (state: ToolbarState) => {
        const its = [] as string[];
        if (state.search) {
            its.push(`search=${state.search}`);
        }
        if (state.categories && state.categories.length > 0) {
            its.push(
                `categories=${encodeURIComponent(state.categories.join(","))}`
            );
        }
        if (state.date) {
            its.push(`date=${state.date}`);
        }
        document.location.hash = its.join("&");
    };

    onFilter = (params: ToolbarState, skip: boolean = false) => {
        const search = (params.search || "").toLowerCase();
        const categories = params.categories || [];
        const date = params.date || "";
        this.setState({
            initialized: true,
            filters: params,
            rows: this.state.allRows.filter((row: Row) => {
                if (
                    search &&
                    row.description.toLowerCase().indexOf(search) === -1 &&
                    row.category.toLowerCase().indexOf(search) === -1
                ) {
                    return false;
                }
                if (
                    categories &&
                    categories.length > 0 &&
                    categories.indexOf(row.category) === -1
                ) {
                    return false;
                }

                if (date && row.date.indexOf(date) === -1) {
                    return false;
                }

                return true;
            }),
        });
        skip || this.syncState(params);
    };

    onChartSelect = (type: string, selection: string) => {
        const hash = document.location.hash.replace(/^#/, "");
        if (type === "description") {
            this.setState({
                categoryModal: true,
                categoryDescription: selection.split("|||")[0],
                category: selection.split("|||")[1],
            });
            return;
        }
        if (type === "month" || type === "date") {
            let date = selection.split("/").reverse().join("-");
            if (type === "date") {
                if (this.state.filters.date.length === 7) {
                    date = selection;
                } else {
                    date = selection.split("-").slice(0, 2).join("-");
                }
            }
            let newHash = hash
                .split("&")
                .map((one) =>
                    one.indexOf("date=") === -1 ? one : "date=" + date
                )
                .join("&");
            if (newHash.indexOf("date=") === -1) {
                newHash += `&date=${date}`;
            }

            document.location.hash = newHash;
        }
        if (type === "category") {
            let newHash = hash
                .split("&")
                .map((one) =>
                    one.indexOf("categories=") === -1
                        ? one
                        : "categories=" + encodeURIComponent(selection)
                )
                .join("&");
            if (newHash.indexOf("categories=") === -1) {
                newHash += `&categories=${selection}`;
            }
            document.location.hash = newHash;
        }
    };

    renderModal() {
        if (!this.state.categoryModal) {
            return null;
        }
        return (
            <CategoryModal
                categoryDescription={this.state.categoryDescription}
                category={this.state.category}
                onClose={(reload) => {
                    this.setState({
                        categoryModal: false,
                        categoryDescription: "",
                    });
                    if (reload) {
                        setTimeout(() => {
                            document.location.reload();
                        }, 1000);
                    }
                }}
            />
        );
    }

    render() {
        return (
            <>
                {this.renderModal()}
                {this.state.loaded && (
                    <FinToolbar
                        categories={this.state.categories}
                        onChange={this.onFilter}
                        total={this.state.rows.reduce((acc, row) => {
                            return acc + parseFloat(row.amount);
                        }, 0)}
                    />
                )}
                {this.state.initialized && (
                    <div style={{ display: "flex" }}>
                        <div
                            style={{
                                flex: "1 1 50%",
                                boxSizing: "border-box",
                                width: "50vw",
                            }}
                        >
                            <FinGrid
                                rows={this.state.rows}
                                onSelect={this.onChartSelect}
                            />
                        </div>
                        <div
                            style={{
                                flex: "1 1 50%",
                                boxSizing: "border-box",
                                width: "50vw",
                            }}
                        >
                            <FinCharts
                                rows={this.state.rows}
                                search={this.state.filters.search}
                                date={this.state.filters.date}
                                onSelect={this.onChartSelect}
                            />
                        </div>
                    </div>
                )}
            </>
        );
    }
}

export default App;
