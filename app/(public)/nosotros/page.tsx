import { PublicHeader } from "@/components/public/header"

export default function NosotrosPage() {
  return (
    <div className="min-h-screen bg-white">
      <PublicHeader />
      
      <main className="pt-16">
        {/* Nosotros Section */}
        <section className="py-20 bg-gray-50">
          <div className="container mx-auto px-6">
            <h1 className="text-4xl font-bold text-center mb-12">Nosotros</h1>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold mb-2">Misión</h3>
                <p className="text-gray-600">
                  Formar estudiantes íntegros con excelencia académica y valores sólidos
                </p>
              </div>
              <div className="text-center">
                <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold mb-2">Visión</h3>
                <p className="text-gray-600">
                  Ser reconocidos como una institución líder en educación integral
                </p>
              </div>
              <div className="text-center">
                <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold mb-2">Valores</h3>
                <p className="text-gray-600">
                  Respeto, responsabilidad, honestidad y compromiso con la excelencia
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Historia Section */}
        <section className="py-20">
          <div className="container mx-auto px-6">
            <h2 className="text-3xl font-bold text-center mb-12">Nuestra Historia</h2>
            <div className="max-w-3xl mx-auto">
              <p className="text-gray-600 mb-6">
                El Colegio María de los Ángeles fue fundado en 1990 con la visión de brindar una educación 
                integral de calidad. Desde entonces, hemos formado a miles de estudiantes que hoy son 
                profesionales exitosos y ciudadanos comprometidos con su comunidad.
              </p>
              <p className="text-gray-600 mb-6">
                A lo largo de los años, hemos mantenido nuestro compromiso con la excelencia académica y 
                la formación en valores, adaptándonos a los cambios y desafíos de la educación moderna.
              </p>
              <p className="text-gray-600">
                Hoy, seguimos innovando y mejorando nuestros programas educativos para preparar a nuestros 
                estudiantes para los retos del futuro, sin perder de vista nuestros valores fundamentales.
              </p>
            </div>
          </div>
        </section>

        {/* Equipo Section */}
        <section className="py-20 bg-gray-50">
          <div className="container mx-auto px-6">
            <h2 className="text-3xl font-bold text-center mb-12">Nuestro Equipo</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-32 h-32 rounded-full bg-gray-300 mx-auto mb-4"></div>
                <h3 className="text-xl font-semibold">Dra. María García</h3>
                <p className="text-gray-600">Directora General</p>
              </div>
              <div className="text-center">
                <div className="w-32 h-32 rounded-full bg-gray-300 mx-auto mb-4"></div>
                <h3 className="text-xl font-semibold">Dr. Juan Pérez</h3>
                <p className="text-gray-600">Director Académico</p>
              </div>
              <div className="text-center">
                <div className="w-32 h-32 rounded-full bg-gray-300 mx-auto mb-4"></div>
                <h3 className="text-xl font-semibold">Lic. Ana Torres</h3>
                <p className="text-gray-600">Coordinadora de Convivencia</p>
              </div>
            </div>
          </div>
        </section>
      </main>

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