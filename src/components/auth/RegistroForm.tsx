'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { supabase } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card'
import { toast } from 'sonner'
import { Loader2, UserPlus } from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils'

const registroSchema = z.object({
  nombre: z.string().min(3, 'El nombre debe tener al menos 3 caracteres'),
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Las contraseñas no coinciden",
  path: ["confirmPassword"],
})

type RegistroFormValues = z.infer<typeof registroSchema>

export function RegistroForm() {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegistroFormValues>({
    resolver: zodResolver(registroSchema),
  })

  const handleSocialLogin = async (provider: 'google') => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      })
      if (error) throw error
    } catch (error: any) {
      toast.error(`Error con ${provider}: ${error.message}`)
    }
  }

  const onSubmit = async (values: RegistroFormValues) => {
    setLoading(true)
    try {
      // Registro en Supabase Auth
      // El perfil se crea automáticamente mediante un Trigger en la BD
      const { data, error: authError } = await supabase.auth.signUp({
        email: values.email,
        password: values.password,
        options: {
          data: {
            full_name: values.nombre,
          }
        }
      })

      if (authError) throw authError
      if (!data.user) throw new Error('No se pudo crear el usuario')

      toast.success('¡Registro exitoso! Ya puedes iniciar sesión.')
      router.push('/login')
    } catch (error: any) {
      toast.error(error.message || 'Error al registrarse')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-md border shadow-xl bg-card/95 backdrop-blur-sm animate-in fade-in zoom-in duration-300">
      <CardHeader className="space-y-1 text-center">
        <div className="flex justify-center mb-4">
          <div className="p-3 bg-primary rounded-full shadow-lg shadow-primary/20">
            <UserPlus className="h-8 w-8 text-primary-foreground" />
          </div>
        </div>
        <CardTitle className="text-2xl font-bold tracking-tight">Crea tu Cuenta</CardTitle>
        <CardDescription>
          Únete y obtén 24 horas de acceso total gratis
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <Button 
          variant="outline" 
          onClick={() => handleSocialLogin('google')} 
          className="w-full h-11 border-2 hover:bg-muted/50 transition-all"
        >
          <svg className="mr-2 h-5 w-5" viewBox="0 0 24 24">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
          </svg>
          Registrarse con Google
        </Button>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-card px-2 text-muted-foreground font-medium">O usa tu correo</span>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="nombre">Nombre Completo</Label>
            <Input
              id="nombre"
              placeholder="Juan Pérez"
              {...register('nombre')}
              className={cn(errors.nombre && "border-destructive focus-visible:ring-destructive")}
              disabled={loading}
            />
            {errors.nombre && (
              <p className="text-xs text-destructive font-medium">{errors.nombre.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Correo Electrónico</Label>
            <Input
              id="email"
              type="email"
              placeholder="juan@ejemplo.com"
              {...register('email')}
              className={cn(errors.email && "border-destructive focus-visible:ring-destructive")}
              disabled={loading}
            />
            {errors.email && (
              <p className="text-xs text-destructive font-medium">{errors.email.message}</p>
            )}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="password">Contraseña</Label>
              <Input
                id="password"
                type="password"
                {...register('password')}
                className={cn(errors.password && "border-destructive focus-visible:ring-destructive")}
                disabled={loading}
              />
              {errors.password && (
                <p className="text-xs text-destructive font-medium">{errors.password.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirmar</Label>
              <Input
                id="confirmPassword"
                type="password"
                {...register('confirmPassword')}
                className={cn(errors.confirmPassword && "border-destructive focus-visible:ring-destructive")}
                disabled={loading}
              />
              {errors.confirmPassword && (
                <p className="text-xs text-destructive font-medium">{errors.confirmPassword.message}</p>
              )}
            </div>
          </div>
          <Button 
            type="submit" 
            className="w-full h-11 text-base font-semibold shadow-md active:scale-95 transition-all" 
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creando cuenta...
              </>
            ) : (
              'Comenzar Prueba Gratis'
            )}
          </Button>
        </form>
      </CardContent>
      <CardFooter className="flex flex-col space-y-4">
        <div className="text-sm text-center text-muted-foreground">
          ¿Ya tienes una cuenta?{' '}
          <Link href="/login" className="text-primary hover:underline font-semibold">
            Inicia sesión
          </Link>
        </div>
      </CardFooter>
    </Card>
  )
}