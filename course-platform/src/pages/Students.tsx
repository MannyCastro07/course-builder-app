import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUIStore } from '@/stores';
import { useStudents } from '@/hooks';
import { DataTable } from '@/components/common';
import { Button, Card, CardHeader, Input, Badge, Select, SelectContent, SelectItem, SelectTrigger, SelectValue, Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Plus,
  Search,
  MoreVertical,
  Edit,
  Trash2,
  Mail,
  UserPlus,
  Download,
  Upload,
  Filter,
  GraduationCap,
} from 'lucide-react';
import { formatDate, formatRelativeDate } from '@/utils';
import type { Student } from '@/types';

export function Students() {
  const navigate = useNavigate();
  const { setBreadcrumbs } = useUIStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [courseFilter, setCourseFilter] = useState<string>('all');
  const [page, setPage] = useState(1);
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);
  const [showImportDialog, setShowImportDialog] = useState(false);

  React.useEffect(() => {
    setBreadcrumbs([{ label: 'Estudiantes', href: '/students' }]);
  }, [setBreadcrumbs]);

  const { students, total, isLoading, deleteStudent, bulkDeleteStudents } = useStudents({
    filters: {
      search: searchQuery,
      status: statusFilter === 'all' ? undefined : statusFilter,
      courseId: courseFilter === 'all' ? undefined : courseFilter,
    },
    page,
    limit: 10,
  });

  const handleSelectRow = (id: string, selected: boolean) => {
    if (selected) {
      setSelectedStudents([...selectedStudents, id]);
    } else {
      setSelectedStudents(selectedStudents.filter((s) => s !== id));
    }
  };

  const handleSelectAll = (selected: boolean) => {
    if (selected) {
      setSelectedStudents(students.map((s) => s.id));
    } else {
      setSelectedStudents([]);
    }
  };

  const handleBulkDelete = () => {
    if (confirm(`¿Estás seguro de que deseas eliminar ${selectedStudents.length} estudiantes?`)) {
      bulkDeleteStudents(selectedStudents);
      setSelectedStudents([]);
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'success' | 'warning' | 'destructive'> = {
      active: 'success',
      completed: 'default',
      dropped: 'destructive',
    };
    const labels: Record<string, string> = {
      active: 'Activo',
      completed: 'Completado',
      dropped: 'Abandonado',
    };
    return <Badge variant={variants[status] || 'default'}>{labels[status] || status}</Badge>;
  };

  const columns = [
    {
      key: 'student',
      title: 'Estudiante',
      render: (row: Student) => (
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
            <span className="text-sm font-medium text-primary">
              {row.user.firstName[0]}{row.user.lastName[0]}
            </span>
          </div>
          <div>
            <p className="font-medium">{row.user.firstName} {row.user.lastName}</p>
            <p className="text-sm text-muted-foreground">{row.user.email}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'courses',
      title: 'Cursos',
      render: (row: Student) => (
        <div className="flex items-center gap-1">
          <GraduationCap className="h-4 w-4 text-muted-foreground" />
          <span>{row.enrolledCourses?.length || 0}</span>
        </div>
      ),
    },
    {
      key: 'progress',
      title: 'Progreso',
      render: (row: Student) => (
        <div className="flex items-center gap-2">
          <div className="h-2 w-24 rounded-full bg-muted overflow-hidden">
            <div
              className="h-full bg-primary transition-all"
              style={{ width: `${row.totalProgress || 0}%` }}
            />
          </div>
          <span className="text-sm">{row.totalProgress || 0}%</span>
        </div>
      ),
    },
    {
      key: 'status',
      title: 'Estado',
      render: (row: Student) => getStatusBadge(row.enrolledCourses?.[0]?.status || 'active'),
    },
    {
      key: 'lastActive',
      title: 'Última actividad',
      render: (row: Student) => (
        <span className="text-sm text-muted-foreground">
          {row.lastActive ? formatRelativeDate(row.lastActive) : 'Nunca'}
        </span>
      ),
    },
    {
      key: 'joined',
      title: 'Registro',
      render: (row: Student) => formatDate(row.createdAt, 'dd/MM/yyyy'),
    },
    {
      key: 'actions',
      title: '',
      render: (row: Student) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => navigate(`/students/${row.id}`)}>
              <Edit className="mr-2 h-4 w-4" />
              Ver detalles
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => window.location.href = `mailto:${row.user.email}`}>
              <Mail className="mr-2 h-4 w-4" />
              Enviar correo
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => deleteStudent(row.id)} className="text-destructive">
              <Trash2 className="mr-2 h-4 w-4" />
              Eliminar
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Estudiantes</h1>
          <p className="text-muted-foreground">Gestiona tus estudiantes y sus inscripciones</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setShowImportDialog(true)}>
            <Upload className="mr-2 h-4 w-4" />
            Importar
          </Button>
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Exportar
          </Button>
          <Button onClick={() => navigate('/students/new')}>
            <Plus className="mr-2 h-4 w-4" />
            Añadir estudiante
          </Button>
        </div>
      </div>

      {/* Bulk Actions */}
      {selectedStudents.length > 0 && (
        <Card className="bg-primary/5 border-primary">
          <CardHeader className="py-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">
                {selectedStudents.length} estudiante(s) seleccionado(s)
              </span>
              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  <Mail className="mr-2 h-4 w-4" />
                  Enviar correo
                </Button>
                <Button variant="outline" size="sm">
                  <UserPlus className="mr-2 h-4 w-4" />
                  Inscribir a curso
                </Button>
                <Button variant="destructive" size="sm" onClick={handleBulkDelete}>
                  <Trash2 className="mr-2 h-4 w-4" />
                  Eliminar
                </Button>
              </div>
            </div>
          </CardHeader>
        </Card>
      )}

      {/* Filters */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div className="flex flex-1 gap-4 w-full sm:w-auto flex-wrap">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar estudiantes..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[150px]">
                  <Filter className="mr-2 h-4 w-4" />
                  <SelectValue placeholder="Estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="active">Activos</SelectItem>
                  <SelectItem value="completed">Completados</SelectItem>
                  <SelectItem value="dropped">Abandonados</SelectItem>
                </SelectContent>
              </Select>
              <Select value={courseFilter} onValueChange={setCourseFilter}>
                <SelectTrigger className="w-[180px]">
                  <GraduationCap className="mr-2 h-4 w-4" />
                  <SelectValue placeholder="Curso" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los cursos</SelectItem>
                  <SelectItem value="course1">React Avanzado</SelectItem>
                  <SelectItem value="course2">Node.js Fundamentos</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Students Table */}
      <DataTable
        data={students}
        columns={columns}
        keyExtractor={(row) => row.id}
        loading={isLoading}
        selectable
        selectedRows={selectedStudents}
        onSelectRow={handleSelectRow}
        onSelectAll={handleSelectAll}
        pagination={{
          page,
          limit: 10,
          total,
          onPageChange: setPage,
        }}
        emptyMessage="No se encontraron estudiantes"
      />

      {/* Import Dialog */}
      <Dialog open={showImportDialog} onOpenChange={setShowImportDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Importar estudiantes</DialogTitle>
            <DialogDescription>
              Sube un archivo CSV con la lista de estudiantes
            </DialogDescription>
          </DialogHeader>
          <div className="border-2 border-dashed border-muted rounded-lg p-8 text-center">
            <Upload className="h-10 w-10 mx-auto mb-4 text-muted-foreground" />
            <p className="text-sm text-muted-foreground mb-4">
              Arrastra un archivo CSV o haz clic para seleccionar
            </p>
            <Button variant="outline">Seleccionar archivo</Button>
          </div>
          <p className="text-xs text-muted-foreground">
            El archivo debe incluir: nombre, apellido, email (opcional: curso)
          </p>
        </DialogContent>
      </Dialog>
    </div>
  );
}
