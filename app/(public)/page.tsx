import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b bg-gradient-to-r from-yellow-400 to-orange-500 px-4 text-white">
        <div className="flex items-center gap-2">
          <span className="text-xl font-bold">María de los Ángeles</span>
        </div>
        <nav className="hidden md:flex items-center gap-6">
          <Link href="/" className="font-medium hover:underline">
            Inicio
          </Link>
          <Link href="/nosotros" className="font-medium hover:underline">
            Nosotros
          </Link>
          <Link href="/matricula" className="font-medium hover:underline">
            Matrícula
          </Link>
          <Link href="/login" className="font-medium hover:underline">
            Iniciar Sesión
          </Link>
        </nav>
        <div className="md:hidden">
          <Button variant="ghost" size="icon" className="text-white">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="lucide lucide-menu"
            >
              <line x1="4" x2="20" y1="12" y2="12" />
              <line x1="4" x2="20" y1="6" y2="6" />
              <line x1="4" x2="20" y1="18" y2="18" />
            </svg>
          </Button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative py-20 px-4 md:px-6 lg:px-8 bg-gradient-to-r from-blue-500 to-blue-700 text-white">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">Bienvenidos a María de los Ángeles</h1>
          <p className="text-xl md:text-2xl mb-8 max-w-3xl">
            Formando líderes del mañana con valores, excelencia académica y desarrollo integral.
          </p>
          <div className="flex flex-wrap gap-4">
            <Button className="bg-yellow-500 hover:bg-yellow-600 text-white border-2 border-yellow-400">
              <Link href="/matricula">Información de Matrícula</Link>
            </Button>
            <Button variant="outline" className="bg-transparent hover:bg-white/10 text-white border-2 border-white">
              <Link href="/nosotros">Conoce Más</Link>
            </Button>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 w-full h-16 bg-gradient-to-r from-yellow-400 to-orange-500 clip-diagonal"></div>
      </section>

      {/* Features */}
      <section className="py-16 px-4 md:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12 text-blue-800">Nuestra Propuesta Educativa</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-lg shadow-md border-t-4 border-yellow-500 hover:shadow-lg transition-shadow">
              <h3 className="text-xl font-bold mb-3 text-blue-700">Excelencia Académica</h3>
              <p className="text-gray-600">
                Programa educativo de alta calidad con docentes calificados y metodologías innovadoras.
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md border-t-4 border-orange-500 hover:shadow-lg transition-shadow">
              <h3 className="text-xl font-bold mb-3 text-blue-700">Formación en Valores</h3>
              <p className="text-gray-600">Educación integral que promueve valores éticos, morales y espirituales.</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md border-t-4 border-blue-500 hover:shadow-lg transition-shadow">
              <h3 className="text-xl font-bold mb-3 text-blue-700">Desarrollo Integral</h3>
              <p className="text-gray-600">
                Actividades extracurriculares que fomentan habilidades artísticas, deportivas y sociales.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto bg-gradient-to-r from-blue-800 to-blue-900 text-white py-8 px-4 md:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-lg font-bold mb-4">María de los Ángeles</h3>
            <p className="text-blue-200">Formando líderes del mañana con valores y excelencia académica.</p>
          </div>
          <div>
            <h3 className="text-lg font-bold mb-4">Enlaces Rápidos</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/" className="text-blue-200 hover:text-white">
                  Inicio
                </Link>
              </li>
              <li>
                <Link href="/nosotros" className="text-blue-200 hover:text-white">
                  Nosotros
                </Link>
              </li>
              <li>
                <Link href="/matricula" className="text-blue-200 hover:text-white">
                  Matrícula
                </Link>
              </li>
              <li>
                <Link href="/login" className="text-blue-200 hover:text-white">
                  Iniciar Sesión
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-bold mb-4">Contacto</h3>
            <address className="not-italic text-blue-200">
              <p>Av. Principal 123</p>
              <p>Ciudad, País</p>
              <p>Teléfono: (123) 456-7890</p>
              <p>Email: info@mariadelosangeles.edu</p>
            </address>
          </div>
        </div>
        <div className="max-w-6xl mx-auto mt-8 pt-6 border-t border-blue-700 text-center text-blue-300">
          <p>&copy; {new Date().getFullYear()} María de los Ángeles. Todos los derechos reservados.</p>
        </div>
      </footer>
    </div>
  )
}
