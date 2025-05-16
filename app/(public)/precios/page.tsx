import { PublicHeader } from "@/components/public/header"

export default function PreciosPage() {
  return (
    <div className="min-h-screen bg-white">
      <PublicHeader />
      
      <main className="pt-16">
        {/* Niveles y Precios Section */}
        <section className="py-20">
          <div className="container mx-auto px-6">
            <h1 className="text-4xl font-bold text-center mb-12">Niveles Educativos y Precios</h1>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                <div className="bg-blue-600 text-white p-6">
                  <h3 className="text-2xl font-bold text-center">Inicial</h3>
                  <p className="text-center text-3xl font-bold mt-4">S/. 350</p>
                  <p className="text-center text-sm mt-2">por mes</p>
                </div>
                <div className="p-6">
                  <ul className="space-y-4">
                    <li className="flex items-center">
                      <svg className="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      3, 4 y 5 años
                    </li>
                    <li className="flex items-center">
                      <svg className="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Estimulación temprana
                    </li>
                    <li className="flex items-center">
                      <svg className="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Desarrollo psicomotriz
                    </li>
                  </ul>
                </div>
              </div>
              <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                <div className="bg-orange-500 text-white p-6">
                  <h3 className="text-2xl font-bold text-center">Primaria</h3>
                  <p className="text-center text-3xl font-bold mt-4">S/. 450</p>
                  <p className="text-center text-sm mt-2">por mes</p>
                </div>
                <div className="p-6">
                  <ul className="space-y-4">
                    <li className="flex items-center">
                      <svg className="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      1ro a 6to grado
                    </li>
                    <li className="flex items-center">
                      <svg className="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Inglés intensivo
                    </li>
                    <li className="flex items-center">
                      <svg className="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Talleres extracurriculares
                    </li>
                  </ul>
                </div>
              </div>
              <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                <div className="bg-blue-600 text-white p-6">
                  <h3 className="text-2xl font-bold text-center">Secundaria</h3>
                  <p className="text-center text-3xl font-bold mt-4">S/. 500</p>
                  <p className="text-center text-sm mt-2">por mes</p>
                </div>
                <div className="p-6">
                  <ul className="space-y-4">
                    <li className="flex items-center">
                      <svg className="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      1ro a 5to año
                    </li>
                    <li className="flex items-center">
                      <svg className="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Preparación pre-universitaria
                    </li>
                    <li className="flex items-center">
                      <svg className="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Orientación vocacional
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Información Adicional */}
        <section className="py-20 bg-gray-50">
          <div className="container mx-auto px-6">
            <h2 className="text-3xl font-bold text-center mb-12">Información Adicional</h2>
            <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              <div>
                <h3 className="text-xl font-semibold mb-4">Matrícula</h3>
                <ul className="space-y-2">
                  <li>Inicial: S/. 400</li>
                  <li>Primaria: S/. 500</li>
                  <li>Secundaria: S/. 550</li>
                </ul>
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-4">Incluye</h3>
                <ul className="space-y-2">
                  <li>Material educativo digital</li>
                  <li>Plataforma virtual</li>
                  <li>Actividades extracurriculares</li>
                  <li>Seguro escolar</li>
                </ul>
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