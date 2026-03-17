import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useUIStore } from '@/stores';
import { Card, CardContent, CardHeader, CardTitle, Button } from '@/components/ui';
import { BookOpen, Clock3, Trophy, ArrowRight } from 'lucide-react';

const learnerHighlights = [
  {
    title: 'Continue learning',
    description: 'Pick up where you left off and keep your momentum going.',
    icon: BookOpen,
  },
  {
    title: 'Study plan',
    description: 'Reserve focused time each week to finish your active lessons.',
    icon: Clock3,
  },
  {
    title: 'Milestones',
    description: 'Track completions and celebrate each finished module.',
    icon: Trophy,
  },
];

export function TraineeDashboard() {
  const navigate = useNavigate();
  const { setBreadcrumbs } = useUIStore();

  React.useEffect(() => {
    setBreadcrumbs([{ label: 'Learning Dashboard' }]);
  }, [setBreadcrumbs]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Learning Dashboard</h1>
          <p className="text-muted-foreground">Everything here is focused on your learning path and enrolled courses.</p>
        </div>
        <Button onClick={() => navigate('/learn/courses')}>
          Go to my courses
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {learnerHighlights.map((item) => (
          <Card key={item.title}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <item.icon className="h-5 w-5" />
                {item.title}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">{item.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>What you can access</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p>• Your learning dashboard</p>
          <p>• Your enrolled courses and lessons</p>
          <p>• Learner help resources</p>
        </CardContent>
      </Card>
    </div>
  );
}
