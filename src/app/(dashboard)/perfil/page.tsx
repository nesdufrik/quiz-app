'use client'

import { useState, useRef } from 'react'
import { useAuthStore } from '@/stores/authStore'
import { Card, CardHeader, CardTitle, CardContent, CardFooter, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { User, Mail, Camera, Loader2, KeyRound, CheckCircle2 } from 'lucide-react'
import { supabase } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { cn } from '@/lib/utils'

// Función para optimizar imagen
const optimizarAvatar = (file: File): Promise<Blob> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload = (event) => {
      const img = new Image()
      img.src = event.target?.result as string
      img.onload = () => {
        const SIZE = 200
        const canvas = document.createElement('canvas')
        canvas.width = SIZE
        canvas.height = SIZE
        const ctx = canvas.getContext('2d')
        if (!ctx) return reject('No ctx')
        
        // Dibujar centrado y recortado (aspect fill)
        const scale = Math.max(SIZE / img.width, SIZE / img.height)
        const x = (SIZE / 2) - (img.width / 2) * scale
        const y = (SIZE / 2) - (img.height / 2) * scale
        ctx.drawImage(img, x, y, img.width * scale, img.height * scale)

        canvas.toBlob((blob) => {
          if (blob) resolve(blob)
          else reject('Error compress')
        }, 'image/webp', 0.8)
      }
    }
  })
}

export default function PerfilPage() {
  const { user, profile, setProfile } = useAuthStore()
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [passLoading, setPassLoading] = useState(false)
  
  // States para formularios
  const [nombre, setNombre] = useState(profile?.nombre_completo || '')
  const [newPassword, setNewPassword] = useState('')
  
  const fileInputRef = useRef<HTMLInputElement>(null)

  if (!user) return null

  const initials = nombre.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()

  // 1. Actualizar Nombre
  const handleUpdateProfile = async () => {
    setLoading(true)
    try {
      const { error } = await supabase
        .from('perfiles')
        .update({ nombre_completo: nombre })
        .eq('id', user.id)

      if (error) throw error
      
      setProfile({ ...profile, nombre_completo: nombre })
      toast.success('Perfil actualizado correctamente')
    } catch (error: any) {
      toast.error('Error: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  // 2. Cambiar Avatar
  const handleAvatarClick = () => fileInputRef.current?.click()

  const handleUploadAvatar = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    try {
      const optimized = await optimizarAvatar(file)
      const filePath = `${user.id}/avatar-${Date.now()}.webp`

      // Subir
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, optimized, { upsert: true })

      if (uploadError) throw uploadError

      const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(filePath)

      // Actualizar tabla perfiles
      const { error: dbError } = await supabase
        .from('perfiles')
        .update({ avatar_url: publicUrl })
        .eq('id', user.id)

      if (dbError) throw dbError

      setProfile({ ...profile, avatar_url: publicUrl })
      toast.success('Foto de perfil actualizada')
    } catch (error: any) {
      toast.error('Error al subir imagen')
    } finally {
      setUploading(false)
    }
  }

  // 3. Cambiar Contraseña
  const handleChangePassword = async () => {
    if (newPassword.length < 6) {
      return toast.error('La contraseña debe tener al menos 6 caracteres')
    }
    setPassLoading(true)
    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword })
      if (error) throw error
      toast.success('Contraseña actualizada con éxito')
      setNewPassword('')
    } catch (error: any) {
      toast.error(error.message)
    } finally {
      setPassLoading(false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto space-y-8 animate-in fade-in duration-500 pb-10">
      <header>
        <h1 className="text-3xl font-bold text-foreground">Mi Perfil</h1>
        <p className="text-muted-foreground">Gestiona tu información personal y seguridad.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Lado Izquierdo: Avatar */}
        <div className="md:col-span-1">
          <Card className="border shadow-sm">
            <CardContent className="pt-8 flex flex-col items-center">
              <div className="relative group cursor-pointer" onClick={handleAvatarClick}>
                <Avatar className="h-32 w-32 border-4 border-background shadow-xl">
                  <AvatarImage src={profile?.avatar_url || undefined} />
                  <AvatarFallback className="text-2xl bg-primary/10 text-primary">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  {uploading ? <Loader2 className="animate-spin text-white" /> : <Camera className="text-white" />}
                </div>
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  className="hidden" 
                  accept="image/*" 
                  onChange={handleUploadAvatar} 
                />
              </div>
              <h3 className="mt-4 font-bold text-lg">{profile?.nombre_completo}</h3>
              <p className="text-sm text-muted-foreground">{user.email}</p>
              <BadgePremium className="mt-2" role={profile?.rol} />
            </CardContent>
          </Card>
        </div>

        {/* Lado Derecho: Formularios */}
        <div className="md:col-span-2 space-y-6">
          {/* Datos Personales */}
          <Card className="border shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg">Información Personal</CardTitle>
              <CardDescription>Actualiza tu nombre público en la plataforma.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Correo Electrónico</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input id="email" value={user.email} disabled className="pl-10 bg-muted/50" />
                </div>
                <p className="text-[10px] text-muted-foreground uppercase font-bold px-1">No se puede cambiar el email</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="name">Nombre Completo</Label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input 
                    id="name" 
                    value={nombre} 
                    onChange={(e) => setNombre(e.target.value)} 
                    className="pl-10"
                    placeholder="Tu nombre"
                  />
                </div>
              </div>
            </CardContent>
            <CardFooter className="bg-muted/30 border-t">
              <Button 
                onClick={handleUpdateProfile} 
                disabled={loading || nombre === profile?.nombre_completo}
                className="ml-auto"
              >
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Guardar Cambios
              </Button>
            </CardFooter>
          </Card>

          {/* Seguridad / Contraseña */}
          <Card className="border shadow-sm border-amber-500/20">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <KeyRound className="h-5 w-5 text-amber-500" /> Seguridad
              </CardTitle>
              <CardDescription>Actualiza tu contraseña de acceso.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="pass">Nueva Contraseña</Label>
                <Input 
                  id="pass" 
                  type="password" 
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Mínimo 6 caracteres"
                />
              </div>
            </CardContent>
            <CardFooter className="bg-muted/30 border-t">
              <Button 
                variant="outline"
                onClick={handleChangePassword} 
                disabled={passLoading || !newPassword}
                className="ml-auto border-amber-500/30 text-amber-700 hover:bg-amber-500/10 dark:text-amber-400"
              >
                {passLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Actualizar Contraseña
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  )
}

function BadgePremium({ className, role }: { className?: string, role?: string }) {
  if (role === 'admin') {
    return (
      <div className={cn("inline-flex items-center gap-1 px-2 py-1 rounded-full bg-primary text-primary-foreground text-[10px] font-bold uppercase", className)}>
        <CheckCircle2 className="h-3 w-3" /> Administrador
      </div>
    )
  }
  return (
    <div className={cn("inline-flex items-center gap-1 px-2 py-1 rounded-full bg-muted text-muted-foreground text-[10px] font-bold uppercase", className)}>
      Estudiante
    </div>
  )
}