import { ThemeToggle } from '@/components/ThemeToggle';
import { AppCard, type AppInfo } from '@/components/AppCard';
import { Users, Calendar, FileText, MessageSquare, BarChart3, Settings } from 'lucide-react';

// Define the apps available in the QCSP Hub
const apps: AppInfo[] = [
  {
    id: 'volunteers',
    name: 'Volunteer Matrix',
    description: 'Manage volunteer assignments across committees and programs with a drag-and-drop interface.',
    icon: Users,
    path: '/volunteers',
    color: 'hsl(199, 89%, 48%)', // quantum-cyan
    status: 'active',
  },
  {
    id: 'events',
    name: 'Event Manager',
    description: 'Plan and coordinate QCSP events, track RSVPs, and manage schedules.',
    icon: Calendar,
    path: '/events',
    color: 'hsl(262, 83%, 58%)', // quantum-purple
    status: 'coming-soon',
  },
  {
    id: 'documents',
    name: 'Document Hub',
    description: 'Central repository for QCSP documents, templates, and resources.',
    icon: FileText,
    path: '/documents',
    color: 'hsl(150, 80%, 40%)', // quantum-green
    status: 'coming-soon',
  },
  {
    id: 'announcements',
    name: 'Announcements',
    description: 'Broadcast important updates and news to the QCSP community.',
    icon: MessageSquare,
    path: '/announcements',
    color: 'hsl(25, 90%, 50%)', // quantum-orange
    status: 'coming-soon',
  },
  {
    id: 'reports',
    name: 'Reports & Analytics',
    description: 'View insights and statistics about QCSP activities and volunteer engagement.',
    icon: BarChart3,
    path: '/reports',
    color: 'hsl(320, 80%, 55%)', // quantum-pink
    status: 'coming-soon',
  },
  {
    id: 'settings',
    name: 'Settings',
    description: 'Configure QCSP Hub settings, user preferences, and integrations.',
    icon: Settings,
    path: '/settings',
    color: 'hsl(215, 20%, 50%)', // muted gray
    status: 'coming-soon',
  },
];

const Index = () => {
  const activeApps = apps.filter(app => app.status === 'active');
  const comingSoonApps = apps.filter(app => app.status !== 'active');

  return (
    <div className="min-h-screen bg-background grid-pattern">
      {/* Header */}
      <header className="border-b border-border bg-card/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16">
          <div className="flex items-center justify-between h-full">
            <div className="flex items-center gap-4">
              <div className="h-8 w-auto">
                <img 
                  src="/QCSP_Brandmark.png" 
                  alt="QCSP Logo" 
                  className="h-full object-contain" 
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                    (e.currentTarget.nextElementSibling as HTMLElement)?.classList.remove('hidden');
                  }}
                />
                <div className="hidden text-xl font-bold tracking-tighter text-primary font-display">QCSP</div>
              </div>
              <div className="border-l pl-4 h-8 flex items-center">
                <h1 className="font-display font-semibold text-lg text-foreground">
                  QCSP Hub
                </h1>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <ThemeToggle />
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-12 md:py-20">
        <div className="max-w-3xl mx-auto text-center mb-12">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-display font-bold mb-4">
            Welcome to <span className="gradient-text">QCSP Hub</span>
          </h2>
          <p className="text-lg text-muted-foreground">
            Your central portal to all QCSP applications and services. 
            Access tools to manage volunteers, events, documents, and more.
          </p>
        </div>

        {/* Active Apps */}
        {activeApps.length > 0 && (
          <div className="mb-16">
            <h3 className="text-xl font-display font-semibold mb-6 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
              Available Apps
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {activeApps.map((app) => (
                <AppCard key={app.id} app={app} />
              ))}
            </div>
          </div>
        )}

        {/* Coming Soon Apps */}
        {comingSoonApps.length > 0 && (
          <div>
            <h3 className="text-xl font-display font-semibold mb-6 text-muted-foreground">
              Coming Soon
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {comingSoonApps.map((app) => (
                <AppCard key={app.id} app={app} />
              ))}
            </div>
          </div>
        )}
      </section>

      {/* Footer */}
      <footer className="border-t border-border mt-auto">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
            <p>© {new Date().getFullYear()} QCSP. All rights reserved.</p>
            <p>Built with ❤️ by QCSP volunteers</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
