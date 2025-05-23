'use client';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Calendar, BookOpen, ClipboardCheck } from "lucide-react";

interface DashboardStatsProps {
  totalAlumnos: number;
  totalProfesores: number;
  asistenciasHoy: number;
  asistenciasSemana: number;
}

export function DashboardStats({
  totalAlumnos,
  totalProfesores,
  asistenciasHoy,
  asistenciasSemana
}: DashboardStatsProps) {
  const stats = [
    {
      title: "Total Estudiantes",
      value: totalAlumnos.toString(),
      description: "Estudiantes activos",
      icon: Users,
    },
    {
      title: "Asistencias Hoy",
      value: asistenciasHoy.toString(),
      description: "Registros de hoy",
      icon: Calendar,
    },
    {
      title: "Total Profesores",
      value: totalProfesores.toString(),
      description: "Profesores activos",
      icon: BookOpen,
    },
    {
      title: "Asistencias Semana",
      value: asistenciasSemana.toString(),
      description: "Registros de la semana",
      icon: ClipboardCheck,
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {stat.title}
              </CardTitle>
              <Icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">
                {stat.description}
              </p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
} 