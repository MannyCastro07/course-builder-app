import React, { useState } from 'react';
import { useUIStore } from '@/stores';
import { Button, Card, CardHeader, CardTitle, CardDescription, CardContent, Input, Textarea, Tabs, TabsList, TabsTrigger, TabsContent, Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui';
import { FileUploader } from '@/components/common';
import {
  Save,
  School,
  Mail,
  CreditCard,
  Palette,
  Bell,
  Shield,
  Upload,
  Globe,
  Clock,
} from 'lucide-react';

export function Settings() {
  const { setBreadcrumbs } = useUIStore();
  const [activeTab, setActiveTab] = useState('general');
  const [saving, setSaving] = useState(false);

  React.useEffect(() => {
    setBreadcrumbs([{ label: 'Configuración', href: '/settings' }]);
  }, [setBreadcrumbs]);

  const handleSave = async () => {
    setSaving(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setSaving(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Configuración</h1>
          <p className="text-muted-foreground">Personaliza tu escuela y preferencias</p>
        </div>
        <Button onClick={handleSave} loading={saving}>
          <Save className="mr-2 h-4 w-4" />
          Guardar cambios
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 lg:grid-cols-6 lg:w-auto">
          <TabsTrigger value="general">
            <School className="mr-2 h-4 w-4" />
            General
          </TabsTrigger>
          <TabsTrigger value="appearance">
            <Palette className="mr-2 h-4 w-4" />
            Apariencia
          </TabsTrigger>
          <TabsTrigger value="email">
            <Mail className="mr-2 h-4 w-4" />
            Email
          </TabsTrigger>
          <TabsTrigger value="payments">
            <CreditCard className="mr-2 h-4 w-4" />
            Pagos
          </TabsTrigger>
          <TabsTrigger value="notifications">
            <Bell className="mr-2 h-4 w-4" />
            Notificaciones
          </TabsTrigger>
          <TabsTrigger value="security">
            <Shield className="mr-2 h-4 w-4" />
            Seguridad
          </TabsTrigger>
        </TabsList>

        {/* General Settings */}
        <TabsContent value="general" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Información de la Escuela</CardTitle>
              <CardDescription>Configura los datos básicos de tu escuela</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Nombre de la escuela</label>
                  <Input defaultValue="Mi Escuela Online" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Email de contacto</label>
                  <Input type="email" defaultValue="contacto@miescuela.com" />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Descripción</label>
                <Textarea
                  defaultValue="Una plataforma de aprendizaje en línea de calidad."
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Idioma</label>
                  <Select defaultValue="es">
                    <SelectTrigger>
                      <Globe className="mr-2 h-4 w-4" />
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="es">Español</SelectItem>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="pt">Português</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Zona horaria</label>
                  <Select defaultValue="America/Mexico_City">
                    <SelectTrigger>
                      <Clock className="mr-2 h-4 w-4" />
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="America/Mexico_City">Ciudad de México</SelectItem>
                      <SelectItem value="America/Bogota">Bogotá</SelectItem>
                      <SelectItem value="America/Madrid">Madrid</SelectItem>
                      <SelectItem value="America/Buenos_Aires">Buenos Aires</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Moneda</label>
                  <Select defaultValue="MXN">
                    <SelectTrigger>
                      <span className="mr-2">$</span>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="MXN">MXN - Peso mexicano</SelectItem>
                      <SelectItem value="USD">USD - Dólar estadounidense</SelectItem>
                      <SelectItem value="EUR">EUR - Euro</SelectItem>
                      <SelectItem value="COP">COP - Peso colombiano</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Branding</CardTitle>
              <CardDescription>Personaliza la apariencia visual de tu escuela</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="text-sm font-medium mb-2 block">Logo</label>
                  <FileUploader
                    accept={{ 'image/*': ['.png', '.jpg', '.jpeg', '.svg'] }}
                    maxFiles={1}
                    onUpload={() => {}}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Favicon</label>
                  <FileUploader
                    accept={{ 'image/*': ['.png', '.ico'] }}
                    maxFiles={1}
                    onUpload={() => {}}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Appearance Settings */}
        <TabsContent value="appearance" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Colores y Temas</CardTitle>
              <CardDescription>Personaliza los colores de tu plataforma</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Color primario</label>
                  <div className="flex gap-2">
                    <input
                      type="color"
                      defaultValue="#3b82f6"
                      className="h-10 w-20 rounded border"
                    />
                    <Input defaultValue="#3b82f6" className="flex-1" />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Color secundario</label>
                  <div className="flex gap-2">
                    <input
                      type="color"
                      defaultValue="#10b981"
                      className="h-10 w-20 rounded border"
                    />
                    <Input defaultValue="#10b981" className="flex-1" />
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Fuente</label>
                <Select defaultValue="inter">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="inter">Inter</SelectItem>
                    <SelectItem value="roboto">Roboto</SelectItem>
                    <SelectItem value="opensans">Open Sans</SelectItem>
                    <SelectItem value="poppins">Poppins</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Email Settings */}
        <TabsContent value="email" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Configuración de Email</CardTitle>
              <CardDescription>Configura el servidor de correo saliente</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Servidor SMTP</label>
                  <Input placeholder="smtp.ejemplo.com" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Puerto</label>
                  <Input type="number" placeholder="587" />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Usuario SMTP</label>
                  <Input placeholder="usuario@ejemplo.com" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Contraseña SMTP</label>
                  <Input type="password" placeholder="••••••••" />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Nombre del remitente</label>
                <Input defaultValue="Mi Escuela Online" />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Payment Settings */}
        <TabsContent value="payments" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Stripe</CardTitle>
              <CardDescription>Configura tu integración con Stripe</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Clave pública</label>
                <Input placeholder="pk_test_..." />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Clave secreta</label>
                <Input type="password" placeholder="sk_test_..." />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>PayPal</CardTitle>
              <CardDescription>Configura tu integración con PayPal</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Client ID</label>
                <Input placeholder="Ae1k..." />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Client Secret</label>
                <Input type="password" placeholder="••••••••" />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notification Settings */}
        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Notificaciones por Email</CardTitle>
              <CardDescription>Configura qué notificaciones enviar a los usuarios</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                { id: 'new-enrollment', label: 'Nueva inscripción', default: true },
                { id: 'course-completion', label: 'Curso completado', default: true },
                { id: 'new-comment', label: 'Nuevo comentario', default: false },
                { id: 'payment-received', label: 'Pago recibido', default: true },
                { id: 'password-reset', label: 'Restablecimiento de contraseña', default: true },
              ].map((item) => (
                <div key={item.id} className="flex items-center justify-between py-2">
                  <span>{item.label}</span>
                  <input
                    type="checkbox"
                    defaultChecked={item.default}
                    className="h-4 w-4 rounded border-gray-300"
                  />
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security Settings */}
        <TabsContent value="security" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Seguridad de la Cuenta</CardTitle>
              <CardDescription>Configura opciones de seguridad</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between py-2">
                <div>
                  <p className="font-medium">Autenticación de dos factores (2FA)</p>
                  <p className="text-sm text-muted-foreground">Requiere código adicional al iniciar sesión</p>
                </div>
                <input type="checkbox" className="h-4 w-4 rounded border-gray-300" />
              </div>
              <div className="flex items-center justify-between py-2">
                <div>
                  <p className="font-medium">Bloqueo de sesión</p>
                  <p className="text-sm text-muted-foreground">Bloquear después de 30 minutos de inactividad</p>
                </div>
                <input type="checkbox" defaultChecked className="h-4 w-4 rounded border-gray-300" />
              </div>
              <div className="flex items-center justify-between py-2">
                <div>
                  <p className="font-medium">Historial de inicios de sesión</p>
                  <p className="text-sm text-muted-foreground">Guardar historial de inicios de sesión</p>
                </div>
                <input type="checkbox" defaultChecked className="h-4 w-4 rounded border-gray-300" />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
