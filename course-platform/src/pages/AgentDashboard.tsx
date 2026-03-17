import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useUIStore } from '@/stores';
import { Card, CardContent, CardHeader, CardTitle, Button } from '@/components/ui';
import { Bot, BookOpen, ArrowRight } from 'lucide-react';

export function AgentDashboard() {
  const navigate = useNavigate();
  const { setBreadcrumbs } = useUIStore();

  React.useEffect(() => {
    setBreadcrumbs([{ label: 'Agent Dashboard' }]);
  }, [setBreadcrumbs]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Agent Dashboard</h1>
        <p className="text-muted-foreground">Access your assigned workspace and continue supporting course operations.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bot className="h-5 w-5" />
              Assigned queue
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground">Use this role to support operations without exposing the full admin back office.</p>
            <Button onClick={() => navigate('/agent/courses')}>
              Open course workspace
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              Courses
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">Review course content and continue the operational tasks assigned to you.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
