import { Card } from 'react-bootstrap';
import Moment from 'react-moment';
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { ReportDay } from '../types/ReportDayType';

export function Chart({ data }: { data: ReportDay[] }) {
    const gradientOffset = () => {
        const dataMax = Math.max(...data.map((i) => i.amount));
        const dataMin = Math.min(...data.map((i) => i.amount));

        if (dataMax <= 0) {
            return 0
        }
        else if (dataMin >= 0) {
            return 1
        }
        else {
            return dataMax / (dataMax - dataMin);
        }
    }

    const off = gradientOffset();
    return <ResponsiveContainer height={400}>
        <AreaChart data={data}>
            {/* <Line type="monotone" dataKey="amount" stroke="#8884d8" /> */}
            <CartesianGrid stroke="#ccc" strokeDasharray="5 5" opacity={0.25} />
            <YAxis />
            <XAxis dataKey="formatted_date" />
            <Tooltip content={<CustomTooltip />} />
            <Area type="monotone" dataKey="amount" stroke="#82ca9d" fillOpacity={1} fill="url(#colorPv)" />
            <defs>
                <linearGradient id="colorPv" x1="0" y1="0" x2="0" y2="1">
                    {off > 0.05 && <stop offset="5%" stopColor="#82ca9d" stopOpacity={0.8} />}
                    {off > 0.05 && <stop offset={off} stopColor="#82ca9d" stopOpacity={0} />}
                    {off < 0.95 && <stop offset={off} stopColor="red" stopOpacity={0} />}
                    {off < 0.95 && <stop offset="95%" stopColor="red" stopOpacity={0.8} />}
                </linearGradient>
            </defs>

        </AreaChart>
    </ResponsiveContainer>
}

const CustomTooltip = (props: any) => {
    const { active, payload, label } = props
    if (active && payload && payload[0]) {
        const data = payload[0].payload
        return (
            <Card>
                <Card.Body>
                    <Card.Title><Moment format="D MMM YYYY">{data.date}</Moment></Card.Title>
                    {!!data.change && <p className="label">{`${data.change > 0 ? "Куплено" : "Проданно"} ${Math.abs(data.change)} акций`}</p>}
                    {data.amount !== 0 && <p className="intro">{data.amount > 0 ? "В Лонгах" : "В Шортах"} на {Math.abs(data.amount)} акций</p>}
                </Card.Body>
            </Card>
        );
    }
    return null;
};