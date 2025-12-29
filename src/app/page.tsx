'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { 
  BookOpen, 
  Trophy, 
  Rocket, 
  CheckCircle2, 
  BarChart3, 
  ShieldCheck,
  ArrowRight,
  GraduationCap
} from 'lucide-react'

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Navigation */}
      <header className="px-4 lg:px-6 h-16 flex items-center border-b backdrop-blur-md sticky top-0 z-50 bg-background/80">
        <Link className="flex items-center justify-center" href="#">
          <GraduationCap className="h-8 w-8 text-primary mr-2" />
          <span className="text-xl font-bold tracking-tight">QuizApp 2026</span>
        </Link>
        <nav className="ml-auto flex gap-4 sm:gap-6 items-center">
          <Link className="text-sm font-medium hover:text-primary transition-colors hidden sm:block" href="#features">
            Características
          </Link>
          <Link href="/login">
            <Button variant="ghost" className="text-sm font-medium">
              Iniciar Sesión
            </Button>
          </Link>
          <Link href="/registro">
            <Button className="text-sm font-medium shadow-md">
              Registrarse
            </Button>
          </Link>
        </nav>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48 px-4 relative overflow-hidden">
          <div className="absolute inset-0 bg-primary/5 -z-10" />
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
          <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
          
          <div className="container mx-auto flex flex-col items-center text-center space-y-8">
            <div className="inline-flex items-center rounded-full border px-3 py-1 text-sm font-medium bg-background shadow-sm animate-in fade-in slide-in-from-bottom-2 duration-1000">
              <span className="flex h-2 w-2 rounded-full bg-primary mr-2 animate-pulse" />
              Preparación Oficial para Bolivia 2026
            </div>
            
            <h1 className="text-4xl font-extrabold tracking-tighter sm:text-5xl md:text-6xl lg:text-7xl max-w-3xl animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-200">
              Domina tu Examen de Admisión con <span className="text-primary">Confianza</span>
            </h1>
            
            <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl/relaxed lg:text-2xl/relaxed animate-in fade-in slide-in-from-bottom-6 duration-1000 delay-300">
              La plataforma más completa con 775 preguntas reales, simulacros cronometrados y seguimiento de progreso inteligente.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-500">
              <Link href="/registro">
                <Button size="lg" className="h-12 px-8 text-lg font-bold shadow-xl shadow-primary/20 hover:scale-105 transition-all">
                  Comenzar Prueba Gratis 24h
                </Button>
              </Link>
              <Link href="#features">
                <Button size="lg" variant="outline" className="h-12 px-8 text-lg font-medium">
                  Saber más
                </Button>
              </Link>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 pt-12 animate-in fade-in duration-1000 delay-700">
              <div className="flex flex-col items-center space-y-1">
                <span className="text-3xl font-bold">+750</span>
                <span className="text-sm text-muted-foreground uppercase tracking-widest">Preguntas</span>
              </div>
              <div className="flex flex-col items-center space-y-1">
                <span className="text-3xl font-bold">4</span>
                <span className="text-sm text-muted-foreground uppercase tracking-widest">Áreas</span>
              </div>
              <div className="flex flex-col items-center space-y-1">
                <span className="text-3xl font-bold">100%</span>
                <span className="text-sm text-muted-foreground uppercase tracking-widest">Actualizado</span>
              </div>
              <div className="flex flex-col items-center space-y-1">
                <span className="text-3xl font-bold">24/7</span>
                <span className="text-sm text-muted-foreground uppercase tracking-widest">Acceso</span>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="w-full py-20 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="text-center space-y-4 mb-16">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">Todo lo que necesitas para aprobar</h2>
              <p className="text-muted-foreground max-w-[800px] mx-auto text-lg">
                Diseñado específicamente para el sistema de evaluación boliviano, cubriendo todas las competencias requeridas.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <Card className="border-none shadow-lg bg-background hover:translate-y-[-4px] transition-all duration-300">
                <CardContent className="p-8 flex flex-col items-center text-center space-y-4">
                  <div className="p-4 bg-primary/10 rounded-2xl">
                    <BookOpen className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="text-xl font-bold">Modo Estudio Inteligente</h3>
                  <p className="text-muted-foreground">
                    Practica por temas específicos con retroalimentación inmediata y explicaciones detalladas.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-none shadow-lg bg-background hover:translate-y-[-4px] transition-all duration-300">
                <CardContent className="p-8 flex flex-col items-center text-center space-y-4">
                  <div className="p-4 bg-primary/10 rounded-2xl">
                    <Trophy className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="text-xl font-bold">Simulacros Reales</h3>
                  <p className="text-muted-foreground">
                    Exámenes cronometrados de 100 preguntas que replican fielmente la experiencia de admisión.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-none shadow-lg bg-background hover:translate-y-[-4px] transition-all duration-300">
                <CardContent className="p-8 flex flex-col items-center text-center space-y-4">
                  <div className="p-4 bg-primary/10 rounded-2xl">
                    <BarChart3 className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="text-xl font-bold">Estadísticas de Avance</h3>
                  <p className="text-muted-foreground">
                    Visualiza tus fortalezas y debilidades por área con gráficos de rendimiento detallados.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="w-full py-20 px-4">
          <Card className="max-w-5xl mx-auto bg-primary text-primary-foreground overflow-hidden border-none shadow-2xl relative">
            <div className="absolute top-0 right-0 p-8 opacity-10">
              <Rocket className="w-64 h-64" />
            </div>
            <CardContent className="p-12 md:p-20 text-center space-y-8 relative z-10">
              <h2 className="text-3xl md:text-5xl font-bold tracking-tight">¿Listo para asegurar tu futuro?</h2>
              <p className="text-primary-foreground/80 text-xl max-w-2xl mx-auto leading-relaxed">
                Únete a cientos de estudiantes que ya se están preparando con éxito. El examen 2026 está a la vuelta de la esquina.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
                <Link href="/registro">
                  <Button size="lg" variant="secondary" className="h-14 px-10 text-xl font-bold">
                    Crear mi cuenta ahora
                  </Button>
                </Link>
              </div>
              <div className="flex items-center justify-center gap-6 text-sm font-medium text-primary-foreground/60">
                <div className="flex items-center gap-1">
                  <CheckCircle2 className="h-4 w-4" /> Registro instantáneo
                </div>
                <div className="flex items-center gap-1">
                  <CheckCircle2 className="h-4 w-4" /> Prueba de 24h incluida
                </div>
              </div>
            </CardContent>
          </Card>
        </section>
      </main>

      <footer className="w-full py-12 border-t bg-background">
        <div className="container mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex flex-col items-center md:items-start space-y-2">
            <div className="flex items-center">
              <GraduationCap className="h-6 w-6 text-primary mr-2" />
              <span className="text-lg font-bold">QuizApp 2026</span>
            </div>
            <p className="text-sm text-muted-foreground text-center md:text-left max-w-xs">
              La plataforma líder en preparación para exámenes de admisión en Bolivia.
            </p>
          </div>
          <div className="flex gap-8">
            <div className="flex flex-col space-y-2">
              <span className="font-bold">Producto</span>
              <Link className="text-sm text-muted-foreground hover:text-primary" href="#features">Características</Link>
              <Link className="text-sm text-muted-foreground hover:text-primary" href="/login">Acceso</Link>
            </div>
            <div className="flex flex-col space-y-2">
              <span className="font-bold">Legal</span>
              <Link className="text-sm text-muted-foreground hover:text-primary" href="#">Privacidad</Link>
              <Link className="text-sm text-muted-foreground hover:text-primary" href="#">Términos</Link>
            </div>
          </div>
        </div>
        <div className="mt-12 pt-8 border-t text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()} QuizApp 2026. Todos los derechos reservados.
        </div>
      </footer>
    </div>
  )
}