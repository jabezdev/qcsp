import { LucideIcon } from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ExternalLink } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface AppInfo {
  id: string;
  name: string;
  description: string;
  icon: LucideIcon;
  path: string;
  color: string;
  status: 'active' | 'coming-soon' | 'beta';
}

interface AppCardProps {
  app: AppInfo;
}

export function AppCard({ app }: AppCardProps) {
  const Icon = app.icon;
  const isActive = app.status === 'active';
  
  return (
    <Card className={cn(
      "card-hover group relative overflow-hidden",
      !isActive && "opacity-70"
    )}>
      {/* Gradient accent bar */}
      <div 
        className="absolute top-0 left-0 right-0 h-1"
        style={{ background: `linear-gradient(90deg, ${app.color}, ${app.color}80)` }}
      />
      
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div 
            className="p-3 rounded-lg mb-3 transition-transform group-hover:scale-110"
            style={{ backgroundColor: `${app.color}15` }}
          >
            <Icon className="h-6 w-6" style={{ color: app.color }} />
          </div>
          <Badge 
            variant={app.status === 'active' ? 'default' : 'secondary'}
            className="text-xs"
          >
            {app.status === 'active' ? 'Live' : app.status === 'beta' ? 'Beta' : 'Coming Soon'}
          </Badge>
        </div>
        <CardTitle className="text-lg font-display">{app.name}</CardTitle>
        <CardDescription className="text-sm">
          {app.description}
        </CardDescription>
      </CardHeader>
      
      <CardContent className="pb-3">
        {/* Could add stats or preview here */}
      </CardContent>
      
      <CardFooter>
        {isActive ? (
          <Button asChild className="w-full group/btn">
            <a href={app.path}>
              Open App
              <ExternalLink className="ml-2 h-4 w-4 transition-transform group-hover/btn:translate-x-0.5" />
            </a>
          </Button>
        ) : (
          <Button disabled className="w-full">
            Coming Soon
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
