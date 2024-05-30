import { Component } from "react";
import { Row } from "./App";
import {
    XAxis,
    YAxis,
    Tooltip,
    Bar,
    BarChart,
    CartesianGrid,
    Legend,
    ResponsiveContainer,
} from "recharts";
import moment from "moment";
import { description2gropName } from "./api";

interface Props {
    rows: Row[];
    search: string;
    date: string;
    onSelect: (type: string, value: string) => void;
}
interface State {}

class FinCharts extends Component<Props, State> {
    state = {};

    getData() {
        const dict = {} as { [key: string]: number };
        const dictPie = {} as { [key: string]: number };
        const dictDays = {} as { [key: string]: number };
        const dictDescriptions = {} as { [key: string]: number };
        const categories = [] as string[];
        const months = [] as string[];
        if (this.props.date.length === 7) {
            for (let i = 31; i > 0; i--) {
                const d = i + "";
                dictDays[
                    this.props.date + "-" + (d.length === 1 ? `0${d}` : d)
                ] = 0;
            }
        }
        this.props.rows.forEach((row) => {
            const date = moment(row.date).format("MM/YYYY");
            if (categories.indexOf(row.category) === -1) {
                categories.push(row.category);
            }
            if (months.indexOf(date) === -1) {
                months.push(date);
            }
            if (!dict[date]) {
                dict[date] = 0;
            }
            dict[date] += parseFloat(row.amount);

            if (!dictPie[row.category]) {
                dictPie[row.category] = 0;
            }
            dictPie[row.category] += parseFloat(row.amount);

            const day = row.date;
            if (!dictDays[day]) {
                dictDays[day] = 0;
            }
            dictDays[day] += parseFloat(row.amount);
            let descr = row.description.trim().toLowerCase();
            if (!this.props.search) {
                descr = description2gropName(descr);
            }
            if (!dictDescriptions[descr]) {
                dictDescriptions[descr] = 0;
            }
            dictDescriptions[descr] += parseFloat(row.amount);
        });
        return {
            bar: Object.keys(dict)
                .sort((a, b) => {
                    const its = a.split("/");
                    const ito = b.split("/");
                    return its[1] === ito[1]
                        ? its[0] > ito[0]
                            ? 1
                            : -1
                        : its[1] > ito[1]
                        ? 1
                        : -1;
                })
                .map((key) => {
                    return {
                        Month: key,
                        Amount: parseFloat(dict[key].toFixed(2)),
                    };
                }),
            pie: Object.keys(dictPie)
                .sort((a, b) => {
                    return dictPie[b] - dictPie[a];
                })
                .map((key) => {
                    return {
                        Category: key,
                        Amount: parseFloat(dictPie[key].toFixed(2)),
                    };
                }),
            days: Object.keys(dictDays).map((key) => {
                return {
                    Day: key,
                    Amount: parseFloat(dictDays[key].toFixed(2)),
                };
            }),
            descr: Object.keys(dictDescriptions)
                .sort((a, b) => {
                    return dictDescriptions[b] - dictDescriptions[a];
                })
                .map((key) => {
                    return {
                        Description: key,
                        Amount: parseFloat(dictDescriptions[key].toFixed(2)),
                    };
                }),
        };
    }

    render() {
        const data = this.getData();
        return (
            <>
                {data.bar.length > 1 && (
                    <ResponsiveContainer width={"96%"} height={"50%"}>
                        <BarChart
                            width={730}
                            height={400}
                            data={data.bar}
                            onClick={(data) => {
                                this.props.onSelect(
                                    "month",
                                    data.activeLabel || ""
                                );
                            }}
                        >
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="Month" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Bar dataKey="Amount" fill="#8884d8" />
                        </BarChart>
                    </ResponsiveContainer>
                )}
                {((data.pie.length === 1 && data.bar.length === 1) ||
                    this.props.date.length === 7) && (
                    <ResponsiveContainer width={"96%"} height={"50%"}>
                        <BarChart
                            data={data.days.reverse()}
                            onClick={(data) => {
                                this.props.onSelect(
                                    "month",
                                    data.activeLabel || ""
                                );
                            }}
                        >
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="Day" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Bar dataKey="Amount" fill="#82ca9d" />
                        </BarChart>
                    </ResponsiveContainer>
                )}
                {data.pie.length > 1 && (
                    <ResponsiveContainer width={"96%"} height={"50%"}>
                        <BarChart
                            data={data.pie}
                            onClick={(data) => {
                                this.props.onSelect(
                                    "category",
                                    data.activeLabel || ""
                                );
                            }}
                        >
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="Category" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Bar dataKey="Amount" fill="#82ca9d" />
                        </BarChart>
                    </ResponsiveContainer>
                )}

                {data.pie.length === 1 && (
                    <ResponsiveContainer width={"96%"} height={"50%"}>
                        <BarChart data={data.descr}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="Description" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Bar dataKey="Amount" fill="#4e795e" />
                        </BarChart>
                    </ResponsiveContainer>
                )}
            </>
        );
    }
}

export default FinCharts;
