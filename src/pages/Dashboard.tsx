import { useQuery } from '@tanstack/react-query';
import { statsAPI } from '@/api/stats';
import { Loader2, Users, Sparkles, Mic, Rocket, ChevronRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { NavLink } from 'react-router-dom';


export default function Dashboard() {
  const { data: statsData, isLoading } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: statsAPI.getDashboardStats
  });

  const dashboardStats = statsData?.data;

  const stats = [
    { title: 'Registered Users', value: dashboardStats?.users ?? '0', icon: Users, color: 'text-blue-600', bg: 'bg-blue-100', link: '/users' },
    { title: 'Social Tasks', value: dashboardStats?.socialTasks ?? '0', icon: Sparkles, color: 'text-violet-600', bg: 'bg-violet-100', link: '/social-admin' },
    { title: 'Therapy Words', value: dashboardStats?.therapyWords ?? '0', icon: Mic, color: 'text-emerald-600', bg: 'bg-emerald-100', link: '/therapy-admin' },
    { title: 'Game Levels', value: dashboardStats?.spaceLevels ?? '0', icon: Rocket, color: 'text-sky-600', bg: 'bg-sky-100', link: '/speech-space-admin' },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }


  const managementSections = [
    { 
      title: 'User Management', 
      desc: 'Review registrations and update user profiles.', 
      icon: Users, 
      link: '/users', 
      color: 'primary',
      bg: 'bg-primary/5'
    },
    { 
      title: 'Social Skills', 
      desc: 'Manage social interaction tasks and guides.', 
      icon: Sparkles, 
      link: '/social-admin', 
      color: 'violet-600',
      bg: 'bg-violet-50'
    },
    { 
      title: 'Speech Therapy', 
      desc: 'Update syllabus words and phoneme data.', 
      icon: Mic, 
      link: '/therapy-admin', 
      color: 'emerald-600',
      bg: 'bg-emerald-50'
    },
    { 
      title: 'Speech Space', 
      desc: 'Configure game levels and curriculum.', 
      icon: Rocket, 
      link: '/speech-space-admin', 
      color: 'sky-600',
      bg: 'bg-sky-50'
    }
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Autimate Admin Control</h1>
          <p className="text-muted-foreground mt-2">Centralized platform management for all therapy modules.</p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <NavLink key={stat.title} to={stat.link}>
            <Card className="therapy-card border-none hover:scale-[1.02] transition-transform cursor-pointer">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">{stat.title}</CardTitle>
                <div className={`p-2 rounded-lg ${stat.bg}`}>
                  <stat.icon className={`h-4 w-4 ${stat.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
              </CardContent>
            </Card>
          </NavLink>
        ))}
      </div>

      <h2 className="text-xl font-bold text-foreground">Management Modules</h2>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {managementSections.map((section) => (
          <Card key={section.title} className={`therapy-card border-none overflow-hidden group ${section.bg}`}>
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-lg">
                <section.icon className={`h-5 w-5 ${section.color === 'primary' ? 'text-primary' : section.color}`} /> 
                {section.title}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground mb-6 line-clamp-2">
                {section.desc}
              </p>
              <NavLink 
                to={section.link} 
                className={`therapy-button w-full flex items-center justify-center gap-2 text-sm py-2 ${
                  section.color === 'primary' ? '' : 'bg-white border border-muted/20 text-foreground hover:bg-muted/10 shadow-none'
                }`}
              >
                Manage <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </NavLink>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
