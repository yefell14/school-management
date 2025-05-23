'use client';

import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis } from "recharts";

interface AsistenciaData {
  fecha: string;
  presentes: number;
  ausentes: number;
  tardanzas: number;
  justificados: number;
}

interface OverviewProps {
  data: AsistenciaData[];
}

export function Overview({ data }: OverviewProps) {
  const chartData = data.map(item => ({
    name: new Date(item.fecha).toLocaleDateString('es-ES', { weekday: 'short' }),
    presentes: item.presentes,
    ausentes: item.ausentes,
    tardanzas: item.tardanzas,
    justificados: item.justificados
  }));

  return (
    <ResponsiveContainer width="100%" height={350}>
      <BarChart data={chartData}>
        <XAxis
          dataKey="name"
          stroke="#888888"
          fontSize={12}
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          stroke="#888888"
          fontSize={12}
          tickLine={false}
          axisLine={false}
          tickFormatter={(value) => `${value}`}
        />
        <Bar
          dataKey="presentes"
          fill="currentColor"
          radius={[4, 4, 0, 0]}
          className="fill-green-500"
        />
        <Bar
          dataKey="ausentes"
          fill="currentColor"
          radius={[4, 4, 0, 0]}
          className="fill-red-500"
        />
        <Bar
          dataKey="tardanzas"
          fill="currentColor"
          radius={[4, 4, 0, 0]}
          className="fill-yellow-500"
        />
        <Bar
          dataKey="justificados"
          fill="currentColor"
          radius={[4, 4, 0, 0]}
          className="fill-blue-500"
        />
      </BarChart>
    </ResponsiveContainer>
  );
} 