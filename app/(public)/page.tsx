import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative min-h-screen pt-16 bg-gradient-to-r from-blue-600 to-blue-800">
        <div className="absolute inset-0 bg-black/50" />
        <div className="relative container mx-auto px-6 flex items-center justify-center h-[calc(100vh-4rem)]">
          <div className="text-center text-white">
            <h1 className="text-5xl font-bold mb-6">Colegio María de los Ángeles</h1>
            <p className="text-xl mb-8 max-w-2xl mx-auto">
              Formando líderes del mañana con valores, excelencia académica y desarrollo integral
            </p>
            <div className="flex justify-center gap-4">
              <Link href="/login">
                <Button size="lg" className="bg-orange-500 hover:bg-orange-600">
                  Iniciar Sesión
                </Button>
              </Link>
              <Link href="/libro-reclamaciones">
                <Button size="lg" variant="outline" className="text-white border-white hover:bg-white/10">
                  Libro de Reclamaciones
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8">
        <div className="container mx-auto px-6">
          <div className="text-center">
            <p>© 2024 Colegio María de los Ángeles. Todos los derechos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
