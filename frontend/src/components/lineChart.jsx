
import {
    LineChart,
    ResponsiveContainer,
    Legend,
    Tooltip,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
} from "recharts";
import analyticData from "./analytic_data.json";
import './Dashboard.scss';


function Line_Chart({month}){
    const data= analyticData.monthly_expenses[month];


    const monthlydata= Object.keys(data).map((day)=>({
        label: `${day}`,
        Date_wise_expense: data[day],
    }));
    
    return(
        <ResponsiveContainer width="100%" aspect={2}>
                <LineChart data={monthlydata} margin={{ right: 100, top: 100 }}>
                    <XAxis dataKey="label" interval={"preserveStartEnd"} />
                    <YAxis></YAxis>
                    <Legend />
                    <Tooltip />
                    <Line
                        dataKey="Date_wise_expense"
                        stroke="green"
                        activeDot={{ r: 9 }}
                    />
                </LineChart>
            </ResponsiveContainer>
    );
}
export default Line_Chart;