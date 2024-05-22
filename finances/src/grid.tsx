import { Component } from "react";
import "react-data-grid/lib/styles.css";

import DataGrid from "react-data-grid";
import { Row } from "./App";

interface Props {
    rows: Row[];
    onSelect: (type: string, value: string) => void;
}
interface State {}

export const currencyFormatter = new Intl.NumberFormat(navigator.language, {
    style: "currency",
    currency: "usd",
});

function isIpad() {
    return /iPad/.test(navigator.userAgent);
}

class FinGrid extends Component<Props, State> {
    state = {};

    render() {
        const columns = [
            {
                key: "date",
                name: "Date",
                renderCell: (props: { row: Row }) => {
                    return (
                        <div
                            onClick={() => {
                                this.props.onSelect("date", props.row.date);
                            }}
                        >
                            {props.row.date}
                        </div>
                    );
                },
            },
            {
                key: "description",
                name: "Description",
                renderCell: (props: { row: Row }) => {
                    return props.row.description.slice(0, isIpad() ? 25 : 45);
                },
            },

            {
                key: "amount",
                name: "Amount",
                renderCell: (props: { row: Row }) => {
                    if (!props || !props.row) {
                        return null;
                    }
                    return (
                        <div
                            style={{
                                width: "100%",
                                textAlign: "right",
                            }}
                        >
                            {props.row.amount
                                ? parseFloat(props.row.amount).toFixed(2)
                                : "-"}
                        </div>
                    );
                },
                renderSummaryCell: () => {
                    const total = this.props.rows.reduce((acc, row) => {
                        return acc + parseFloat(row.amount);
                    }, 0);
                    return (
                        <div
                            style={{
                                width: "100%",
                                textAlign: "right",
                            }}
                        >
                            <strong>{currencyFormatter.format(total)}</strong>
                        </div>
                    );
                },
            },
            {
                key: "category",
                name: "Category",
                renderCell: (props: { row: Row }) => {
                    return (
                        <div
                            onClick={() => {
                                this.props.onSelect(
                                    "category",
                                    props.row.category
                                );
                            }}
                        >
                            {props.row.category}
                        </div>
                    );
                },
            },
            { key: "source", name: "Bank" },
        ];

        return (
            <DataGrid
                columns={columns}
                rows={this.props.rows}
                className={"fill-grid rdg-light"}
                bottomSummaryRows={[
                    {
                        id: "total_0",
                        totalCount: this.props.rows.length,
                    },
                ]}
            />
        );
    }
}

export default FinGrid;
