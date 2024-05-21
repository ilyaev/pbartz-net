import { Component } from "react";
import "react-data-grid/lib/styles.css";

import DataGrid from "react-data-grid";
import { Row } from "./App";

interface Props {
    rows: Row[];
}
interface State {}

const currencyFormatter = new Intl.NumberFormat(navigator.language, {
    style: "currency",
    currency: "usd",
});

class FinGrid extends Component<Props, State> {
    state = {};

    render() {
        const columns = [
            { key: "date", name: "Date" },
            {
                key: "description",
                name: "Description",
                renderCell: (props: { row: Row }) => {
                    return props.row.description.slice(0, 45);
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
            { key: "category", name: "Category" },
            { key: "source", name: "Source" },
        ];

        return (
            <DataGrid
                columns={columns}
                rows={this.props.rows}
                className={"fill-grid"}
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
