
import React from 'react';
import {
    LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
    XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';

interface DataPoint {
    label: string;
    value: number;
}

interface ChartConfig {
    type: 'line' | 'bar' | 'pie';
    title: string;
    subtitle?: string;
    data: DataPoint[];
    xAxisKey: string;
    dataKey: string;
    color?: string;
}

interface DataVisualizerProps {
    charts: ChartConfig[];
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-white p-3 border border-slate-200 shadow-lg rounded-lg">
                <p className="text-sm font-semibold text-slate-800">{label}</p>
                <p className="text-sm text-blue-600">
                    Value: {payload[0].value}
                </p>
            </div>
        );
    }
    return null;
};

const DataVisualizer: React.FC<DataVisualizerProps> = ({ charts }) => {
    if (!charts || charts.length === 0) return null;

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 my-8">
            {charts.map((chart, index) => (
                <div key={index} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                    <h3 className="text-lg font-bold text-slate-800 mb-1">{chart.title}</h3>
                    {chart.subtitle && <p className="text-sm text-slate-500 mb-4">{chart.subtitle}</p>}

                    <div className="h-64 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            {chart.type === 'line' ? (
                                <LineChart data={chart.data} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                                    <XAxis dataKey={chart.xAxisKey} stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                                    <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                                    <Tooltip content={<CustomTooltip />} />
                                    <Line
                                        type="monotone"
                                        dataKey={chart.dataKey}
                                        stroke={chart.color || COLORS[index % COLORS.length]}
                                        strokeWidth={3}
                                        dot={{ r: 4, fill: '#fff', strokeWidth: 2 }}
                                        activeDot={{ r: 6 }}
                                    />
                                </LineChart>
                            ) : chart.type === 'bar' ? (
                                <BarChart data={chart.data} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                    <XAxis dataKey={chart.xAxisKey} stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                                    <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                                    <Tooltip content={<CustomTooltip />} cursor={{ fill: '#f1f5f9' }} />
                                    <Bar
                                        dataKey={chart.dataKey}
                                        fill={chart.color || COLORS[index % COLORS.length]}
                                        radius={[4, 4, 0, 0]}
                                    />
                                </BarChart>
                            ) : (
                                <PieChart>
                                    <Pie
                                        data={chart.data}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={80}
                                        fill="#8884d8"
                                        paddingAngle={5}
                                        dataKey={chart.dataKey}
                                    >
                                        {chart.data.map((entry, i) => (
                                            <Cell key={`cell-${i}`} fill={COLORS[i % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip content={<CustomTooltip />} />
                                    <Legend iconType="circle" />
                                </PieChart>
                            )}
                        </ResponsiveContainer>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default DataVisualizer;
