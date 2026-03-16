import React from 'react';
import { cn } from '@/utils';
import { Card, CardContent } from '@/components/ui';
import { ArrowUpRight, ArrowDownRight, TrendingUp, TrendingDown } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  description?: string;
  trend?: {
    value: number;
    label?: string;
    positive?: boolean;
  };
  icon?: React.ElementType;
  iconColor?: string;
  iconBgColor?: string;
  className?: string;
  loading?: boolean;
}

export function StatCard({
  title,
  value,
  description,
  trend,
  icon: Icon,
  iconColor = 'text-primary',
  iconBgColor = 'bg-primary/10',
  className,
  loading = false,
}: StatCardProps) {
  if (loading) {
    return (
      <Card className={cn('overflow-hidden', className)}>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-3">
            <div className="h-4 w-24 bg-muted rounded" />
            <div className="h-8 w-32 bg-muted rounded" />
            <div className="h-4 w-48 bg-muted rounded" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn('overflow-hidden', className)}>
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <h3 className="text-2xl font-bold">{value}</h3>
            
            {description && (
              <p className="text-sm text-muted-foreground">{description}</p>
            )}
            
            {trend && (
              <div className="flex items-center gap-1.5">
                <span
                  className={cn(
                    'flex items-center text-sm font-medium',
                    trend.positive !== false ? 'text-green-600' : 'text-red-600'
                  )}
                >
                  {trend.positive !== false ? (
                    <TrendingUp className="mr-1 h-4 w-4" />
                  ) : (
                    <TrendingDown className="mr-1 h-4 w-4" />
                  )}
                  {trend.value > 0 && '+'}{trend.value}%
                </span>
                {trend.label && (
                  <span className="text-sm text-muted-foreground">{trend.label}</span>
                )}
              </div>
            )}
          </div>
          
          {Icon && (
            <div className={cn('flex h-12 w-12 items-center justify-center rounded-lg', iconBgColor)}>
              <Icon className={cn('h-6 w-6', iconColor)} />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

interface StatCardsGridProps {
  children: React.ReactNode;
  columns?: 2 | 3 | 4;
  className?: string;
}

export function StatCardsGrid({ children, columns = 4, className }: StatCardsGridProps) {
  const gridCols = {
    2: 'grid-cols-1 sm:grid-cols-2',
    3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4',
  };

  return (
    <div className={cn('grid gap-4', gridCols[columns], className)}>
      {children}
    </div>
  );
}
