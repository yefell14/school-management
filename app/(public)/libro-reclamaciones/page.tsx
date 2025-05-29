"use client"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useState } from "react"
import { AlertTriangle, ThumbsUp, Heart, MessageSquare, Info } from "lucide-react"

const formSchema = z.object({
  nombre: z.string().min(2, "El nombre es requerido"),
  email: z.string().email("Email inválido"),
  telefono: z.string().min(6, "Teléfono inválido"),
  tipo: z.string().min(1, "Tipo requerido"),
  prioridad: z.string().min(1, "Prioridad requerida"),
  asunto: z.string().min(2, "El asunto es requerido"),
  descripcion: z.string().min(10, "La descripción debe tener al menos 10 caracteres"),
})

const tipos = [
  { value: "reclamo", label: "Reclamo", icon: AlertTriangle, color: "text-red-600", bgColor: "bg-red-50" },
  { value: "queja", label: "Queja", icon: AlertTriangle, color: "text-orange-600", bgColor: "bg-orange-50" },
  { value: "sugerencia", label: "Sugerencia", icon: MessageSquare, color: "text-blue-600", bgColor: "bg-blue-50" },
  { value: "felicitacion", label: "Felicitación", icon: Heart, color: "text-green-600", bgColor: "bg-green-50" },
  { value: "consulta", label: "Consulta", icon: ThumbsUp, color: "text-purple-600", bgColor: "bg-purple-50" },
]

export default function LibroReclamacionesPage() {
  const [tipoSeleccionado, setTipoSeleccionado] = useState("reclamo")

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nombre: "",
      email: "",
      telefono: "",
      tipo: "reclamo",
      prioridad: "",
      asunto: "",
      descripcion: "",
    },
  })

  function onSubmit(values: z.infer<typeof formSchema>) {
    console.log({ ...values, tipo: tipoSeleccionado })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-blue-600 to-blue-400 text-white overflow-hidden">
        <div className="container mx-auto px-4 py-24">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-5xl md:text-6xl font-bold mb-6 drop-shadow-lg">Reclamaciones</h1>
            <p className="text-xl md:text-2xl mb-8 drop-shadow-md">
              Comunícate con nosotros para cualquier reclamación o sugerencia
            </p>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0">
          <svg
            className="w-full h-16 fill-white"
            viewBox="0 0 1440 100"
            preserveAspectRatio="none"
          >
            <path d="M0,0 L1440,0 L1440,100 L0,100 L0,0 L1440,100 L1440,0 Z" />
          </svg>
        </div>
      </section>

      {/* Contenido Principal */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid md:grid-cols-3 gap-8">
          {/* Selector de tipo */}
          <div className="space-y-4">
            {tipos.map((tipo) => (
              <button
                key={tipo.value}
                onClick={() => setTipoSeleccionado(tipo.value)}
                className={`w-full flex flex-col items-center gap-2 border-2 rounded-lg p-4 font-medium transition-all
                  ${tipo.color} 
                  ${tipoSeleccionado === tipo.value ? tipo.bgColor : 'hover:bg-gray-50'}
                  ${tipoSeleccionado === tipo.value ? 'border-current' : 'border-transparent'}`}
              >
                <tipo.icon className="w-8 h-8" />
                <span>{tipo.label}</span>
              </button>
            ))}
          </div>

          {/* Formulario */}
          <div className="md:col-span-2">
            <Card className="shadow-xl">
              <CardHeader className="bg-blue-100 px-6 py-4 rounded-t-xl">
                <CardTitle className="flex items-center gap-2 text-blue-700">
                  <Info className="w-5 h-5" /> Formulario de Comunicación
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormField
                        control={form.control}
                        name="nombre"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Nombre Completo *</FormLabel>
                            <FormControl>
                              <Input placeholder="Ingrese su nombre completo" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Correo Electrónico *</FormLabel>
                            <FormControl>
                              <Input type="email" placeholder="correo@ejemplo.com" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="telefono"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Teléfono</FormLabel>
                            <FormControl>
                              <Input placeholder="Ingrese su teléfono" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="prioridad"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Prioridad</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Seleccione prioridad" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="alta">Alta</SelectItem>
                                <SelectItem value="media">Media</SelectItem>
                                <SelectItem value="baja">Baja</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="asunto"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Asunto *</FormLabel>
                          <FormControl>
                            <Input placeholder="Ingrese el asunto" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="descripcion"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Descripción Detallada *</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Describa detalladamente su comunicación..."
                              className="min-h-[150px]"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <Button
                      type="submit"
                      className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-6 text-lg font-semibold hover:brightness-110"
                    >
                      Enviar Comunicación
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
