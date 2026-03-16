import React, { useState } from 'react';
import { useUIStore } from '@/stores';
import { LineChart, BarChart, PieChart, AreaChart } from '@/components/charts';
import { StatCard, StatCardsGrid } from '@/components/common';
import { Card, CardHeader, CardTitle, CardContent, CardDescription, Tabs, TabsList, TabsTrigger, TabsContent, Select, SelectContent, SelectItem, SelectTrigger, SelectValue, Button } from '@/components/ui';
import {
  Calendar,
  Download,
  Users,
  BookOpen,
  TrendingUp,
  DollarSign,
  Target,
  Clock,
} from 'lucide-react';
import { formatCurrency, formatNumber } from '@/utils';

export function Reports() {
  const { setBreadcrumbs } = useUIStore();
  const [dateRange, setDateRange] = useState('30days');

  React.useEffect(() => {
    setBreadcrumbs([{ label: 'Reportes', href: '/reports' }]);
  }, [setBreadcrumbs]);

  // Mock data
  const revenueData = [
    { date: '01/01', revenue: 1200, expenses: 400 },
    { date: '05/01', revenue: 1800, expenses: 500 },
    { date: '10/01', revenue: 2400, expenses: 600 },
    { date: '15/01', revenue: 2100, expenses: 550 },
    { date: '20/01', revenue: 3200, expenses: 700 },
    { date: '25/01', revenue: 3800, expenses: 800 },
    { date: '30/01', revenue: 4500, expenses: 900 },
  ];

  const enrollmentData = [
    { month: 'Ene', enrollments: 45, completions: 32 },
    { month: 'Feb', enrollments: 52, completions: 38 },
    { month: 'Mar', enrollments: 61, completions: 45 },
    { month: 'Abr', enrollments: 58, completions: 42 },
    { month: 'May', enrollments: 72, completions: 55 },
    { month: 'Jun', enrollments: 85, completions: 68 },
  ];

  const coursePerformanceData = [
    { name: 'React Avanzado', students: 156, rating: 4.8 },
    { name: 'Node.js', students: 132, rating: 4.6 },
    { name: 'TypeScript', students: 98, rating: 4.9 },
    { name: 'Next.js', students: 87, rating: 4.7 },
    { name: 'Docker', students: 76, rating: 4.5 },
  ];

  const studentActivityData = [
    { hour: '00:00', active: 12 },
    { hour: '04:00', active: 5 },
    { hour: '08:00', active: 45 },
    { hour: '12:00', active: 78 },
    { hour: '16:00', active: 92 },
    { hour: '20:00', active: 65 },
    { hour: '23:59', active: 28 },
  ];

  const completionRateData = [
    { name: 'Completado', value: 68 },
    { name: 'En progreso', value: 24 },
    { name: 'Abandonado', value: 8 },
  ];

  const deviceData = [
    { name: 'Desktop', value: 58 },
    { name: 'Mobile', value: 32 },
    { name: 'Tablet', value: 10 },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Reportes y Analíticas</h1>
          <p className="text-muted-foreground">Análisis detallado del rendimiento de tu plataforma</p>
        </div>
        <div className="flex gap-2">
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="w-[180px]">
              <Calendar className="mr-2 h-4 w-4" />
              <SelectValue placeholder="Período" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7days">Últimos 7 días</SelectItem>
              <SelectItem value="30days">Últimos 30 días</SelectItem>
              <SelectItem value="90days">Últimos 90 días</SelectItem>
              <SelectItem value="year">Este año</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Exportar
          </Button>
        </div>
      </div>

      {/* Stats */}
      <StatCardsGrid>
        <StatCard
          title="Ingresos Totales"
          value={formatCurrency(45600)}
          trend={{ value: 23.5, label: 'vs período anterior', positive: true }}
          icon={DollarSign}
          iconColor="text-green-600"
          iconBgColor="bg-green-100"
        />
        <StatCard
          title="Nuevos Estudiantes"
          value={formatNumber(342)}
          trend={{ value: 18.2, label: 'vs período anterior', positive: true }}
          icon={Users}
          iconColor="text-blue-600"
          iconBgColor="bg-blue-100"
        />
        <StatCard
          title="Inscripciones"
          value={formatNumber(528)}
          trend={{ value: 12.8, label: 'vs período anterior', positive: true }}
          icon={BookOpen}
          iconColor="text-purple-600"
          iconBgColor="bg-purple-100"
        />
        <StatCard
          title="Tasa de Finalización"
          value="68%"
          trend={{ value: 5.4, label: 'vs período anterior', positive: true }}
          icon={Target}
          iconColor="text-orange-600"
          iconBgColor="bg-orange-100"
        />
      </StatCardsGrid>

      {/* Tabs */}
      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">General</TabsTrigger>
          <TabsTrigger value="revenue">Ingresos</TabsTrigger>
          <TabsTrigger value="students">Estudiantes</TabsTrigger>
          <TabsTrigger value="courses">Cursos</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <LineChart
              title="Ingresos vs Gastos"
              data={revenueData}
              lines={[
                { key: 'revenue', name: 'Ingresos', color: '#10b981' },
                { key: 'expenses', name: 'Gastos', color: '#ef4444' },
              ]}
              xAxisKey="date"
              yAxisFormatter={(v) => `$${v}`}
              height={300}
            />
            <AreaChart
              title="Inscripciones y Finalizaciones"
              data={enrollmentData}
              areas={[
                { key: 'enrollments', name: 'Inscripciones', color: '#3b82f6' },
                { key: 'completions', name: 'Finalizaciones', color: '#10b981' },
              ]}
              xAxisKey="month"
              height={300}
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <PieChart
              title="Tasa de Finalización"
              data={completionRateData}
              colors={['#10b981', '#f59e0b', '#ef4444']}
              donut
              height={250}
            />
            <PieChart
              title="Dispositivos"
              data={deviceData}
              colors={['#3b82f6', '#8b5cf6', '#06b6d4']}
              height={250}
            />
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Actividad por Hora</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {studentActivityData.map((item) => (
                    <div key={item.hour} className="flex items-center gap-3">
                      <span className="text-sm w-12">{item.hour}</span>
                      <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary rounded-full"
                          style={{ width: `${(item.active / 100) * 100}%` }}
                        />
                      </div>
                      <span className="text-sm w-8">{item.active}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="revenue" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <AreaChart
              title="Ingresos Mensuales"
              data={enrollmentData.map(d => ({ ...d, revenue: d.enrollments * 100 }))}
              areas={[
                { key: 'revenue', name: 'Ingresos', color: '#10b981', gradientStart: '#10b981', gradientEnd: '#10b981' },
              ]}
              xAxisKey="month"
              yAxisFormatter={(v) => `$${v}`}
              height={350}
            />
            <Card>
              <CardHeader>
                <CardTitle>Ingresos por Curso</CardTitle>
                <CardDescription>Top 5 cursos con mayores ingresos</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {coursePerformanceData.map((course, index) => (
                    <div key={course.name} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-sm font-medium">
                          {index + 1}
                        </span>
                        <span>{course.name}</span>
                      </div>
                      <span className="font-medium">{formatCurrency(course.students * 100)}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="students" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <LineChart
              title="Crecimiento de Estudiantes"
              data={enrollmentData}
              lines={[
                { key: 'enrollments', name: 'Nuevos estudiantes', color: '#3b82f6' },
              ]}
              xAxisKey="month"
              height={300}
            />
            <BarChart
              title="Rendimiento por Curso"
              data={coursePerformanceData}
              bars={[
                { key: 'students', name: 'Estudiantes', color: '#8b5cf6' },
              ]}
              xAxisKey="name"
              xAxisFormatter={(v) => v.split(' ')[0]}
              height={300}
            />
          </div>
        </TabsContent>

        <TabsContent value="courses" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <BarChart
              title="Rendimiento de Cursos"
              data={coursePerformanceData}
              bars={[
                { key: 'students', name: 'Estudiantes', color: '#3b82f6' },
                { key: 'rating', name: 'Calificación', color: '#f59e0b' },
              ]}
              xAxisKey="name"
              xAxisFormatter={(v) => v.split(' ')[0]}
              height={300}
            />
            <Card>
              <CardHeader>
                <CardTitle>Mejores Cursos</CardTitle>
                <CardDescription>Top 5 por calificación</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[...coursePerformanceData]
                    .sort((a, b) => b.rating - a.rating)
                    .map((course, index) => (
                      <div key={course.name} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-yellow-100 text-sm font-medium text-yellow-700">
                            {index + 1}
                          </span>
                          <span>{course.name}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <span className="text-yellow-500">★</span>
                          <span className="font-medium">{course.rating}</span>
                        </div>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
