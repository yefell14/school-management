"use client"

import { useState } from "react"
import { subDays } from "date-fns"

type ChartData = number[][]
type ChartLabels = string[]
type ChartColors = string[]

export default function ReportesPage() {
  const [dateRange, setDateRange] = useState({
    from: subDays(new Date(), 7),
    to: new Date(),
  })
  const [periodoSeleccionado, setPeriodoSeleccionado] = useState("semana")
  const [nivelSeleccionado, setNivelSeleccionado] = useState("todos")

  // Datos de ejemplo para los gráficos
  const datosAsistenciaSemanal = {
    labels: ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes"],
    alumnos: {
      presentes: [95, 92, 94, 90, 93],
      tardanzas: [3, 5, 4, 7, 5],
      ausentes: [2, 3, 2, 3, 2],
    },
    profesores: {
      presentes: [98, 97, 100, 96, 98],
      tardanzas: [2, 3, 0, 4, 2],
      ausentes: [0, 0, 0, 0, 0],
    },
  }

  // Función para renderizar un gráfico de barras simple
  const renderBarChart = (data: ChartData, labels: ChartLabels, title: string, colors: ChartColors) => {
    const maxValue = Math.max(...data.flat()) || 100
    
    return (
      <div className="space-y-2">
        <h4 className="text-sm font-medium">{title}</h4>
        <div className="h-[200px] flex items-end justify-between gap-2">
          {data.map((series: number[], seriesIndex: number) => (
            <div key={seriesIndex} className="flex-1 flex items-end justify-around">
              {series.map((value: number, i: number) => (
                <div key={i} className="relative flex flex-col items-center w-full">
                  <div
                    className={`w-full max-w-[30px] rounded-t-md ${colors[i]}`}
                    style={{ height: `${(value / maxValue) * 180}px` }}
                  ></div>
                  <span className="text-xs mt-1">{labels[i]}</span>
                  <span className="absolute top-0 -translate-y-5 text-xs font-bold">{value}%</span>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    )
  }

  // Función para renderizar un gráfico circular simple
  const renderPieChart = (data: number[], labels: ChartLabels, colors: ChartColors) => {
    const total = data.reduce((acc, val) => acc + val, 0)
    let currentAngle = 0
    
    return (
      <div className="flex justify-center">
        <div className="relative w-[200px] h-[200px]">
          <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
            {data.map((value: number, i: number) => {
              const percentage = (value / total) * 100
              const angle = (percentage / 100) * 360
              const largeArcFlag = angle > 180 ? 1 : 0
              
              const startX = 50 + 50 * Math.cos((currentAngle * Math.PI) / 180)
              const startY = 50 + 50 * Math.sin((currentAngle * Math.PI) / 180)
              const endAngle = currentAngle + angle
              const endX = 50 + 50 * Math.cos((endAngle * Math.PI) / 180)
              const endY = 50 + 50 * Math.sin((endAngle * Math.PI) / 180)

              const pathData = `M 50 50 L ${startX} ${startY} A 50 50 0 ${largeArcFlag} 1 ${endX} ${endY} Z`
              
              currentAngle = endAngle

              return (
                <path
                  key={i}
                  d={pathData}
                  fill={colors[i]}
                  stroke="white"
                  strokeWidth="1"
                />
              )
            })}
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className="text-2xl font-bold">{total}%</div>
              <div className="text-sm text-gray-500">Total</div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold tracking-tight">Reportes de Asistencia</h2>
      
      {/* Gráfico de Asistencia Semanal */}
      <div className="grid gap-4 md:grid-cols-2">
        <div className="p-6 bg-white rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Asistencia Semanal - Alumnos</h3>
          {renderBarChart(
            [
              datosAsistenciaSemanal.alumnos.presentes,
              datosAsistenciaSemanal.alumnos.tardanzas,
              datosAsistenciaSemanal.alumnos.ausentes,
            ],
            datosAsistenciaSemanal.labels,
            "Asistencia de Alumnos",
            ["bg-green-500", "bg-yellow-500", "bg-red-500"]
          )}
        </div>
        
        <div className="p-6 bg-white rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Asistencia Semanal - Profesores</h3>
          {renderBarChart(
            [
              datosAsistenciaSemanal.profesores.presentes,
              datosAsistenciaSemanal.profesores.tardanzas,
              datosAsistenciaSemanal.profesores.ausentes,
            ],
            datosAsistenciaSemanal.labels,
            "Asistencia de Profesores",
            ["bg-green-500", "bg-yellow-500", "bg-red-500"]
          )}
        </div>
      </div>
    </div>
  )
}
