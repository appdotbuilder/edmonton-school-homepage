import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  GraduationCap, 
  Users, 
  BookOpen, 
  FileText, 
  Calendar, 
  Phone,
  School,
  Trophy,
  ExternalLink
} from 'lucide-react';
import type { QuickLink } from '../../../server/src/schema';

interface QuickLinksSectionProps {
  links: QuickLink[];
}

export function QuickLinksSection({ links }: QuickLinksSectionProps) {
  // Default quick links when no data is available
  const defaultLinks = [
    {
      id: 1,
      title: "Admissions",
      description: "Learn about our enrollment process and requirements",
      url: "/admissions",
      icon: GraduationCap,
      display_order: 1,
      is_active: true
    },
    {
      id: 2,
      title: "Academic Programs",
      description: "Explore our comprehensive curriculum and specializations",
      url: "/academics",
      icon: BookOpen,
      display_order: 2,
      is_active: true
    },
    {
      id: 3,
      title: "Staff Directory",
      description: "Connect with our dedicated teachers and administrators",
      url: "/staff",
      icon: Users,
      display_order: 3,
      is_active: true
    },
    {
      id: 4,
      title: "Student Portal",
      description: "Access grades, assignments, and important updates",
      url: "/portal",
      icon: School,
      display_order: 4,
      is_active: true
    },
    {
      id: 5,
      title: "Athletics",
      description: "Sports teams, schedules, and athletic achievements",
      url: "/athletics",
      icon: Trophy,
      display_order: 5,
      is_active: true
    },
    {
      id: 6,
      title: "School Calendar",
      description: "Important dates, holidays, and school events",
      url: "/calendar",
      icon: Calendar,
      display_order: 6,
      is_active: true
    },
    {
      id: 7,
      title: "Forms & Documents",
      description: "Download important forms and policy documents",
      url: "/documents",
      icon: FileText,
      display_order: 7,
      is_active: true
    },
    {
      id: 8,
      title: "Contact Us",
      description: "Get in touch with our school administration",
      url: "/contact",
      icon: Phone,
      display_order: 8,
      is_active: true
    }
  ];

  // Use API data if available, otherwise use defaults
  const displayLinks = links.length > 0 
    ? links.filter((link: QuickLink) => link.is_active).sort((a: QuickLink, b: QuickLink) => a.display_order - b.display_order)
    : defaultLinks;

  const getIcon = (index: number) => {
    const icons = [GraduationCap, BookOpen, Users, School, Trophy, Calendar, FileText, Phone];
    return icons[index % icons.length];
  };

  return (
    <section className="space-y-8">
      <div className="text-center space-y-4">
        <h2 className="text-3xl md:text-4xl font-bold text-slate-800">Quick Links</h2>
        <p className="text-lg text-slate-600 max-w-2xl mx-auto">
          Easy access to the most important areas of our school website and resources.
        </p>
      </div>

      {displayLinks.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-slate-500 text-lg">No quick links available at this time.</p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {displayLinks.map((link, index) => {
            const IconComponent = 'icon' in link ? link.icon : getIcon(index);
            
            return (
              <Card key={link.id || index} className="hover:shadow-lg transition-all duration-300 group hover:-translate-y-1">
                <CardHeader className="text-center pb-4">
                  <div className="mx-auto mb-4 p-3 bg-blue-100 rounded-full group-hover:bg-blue-200 transition-colors">
                    <IconComponent className="h-8 w-8 text-blue-600" />
                  </div>
                  <CardTitle className="text-lg group-hover:text-blue-600 transition-colors">
                    {link.title}
                  </CardTitle>
                  <CardDescription className="text-sm line-clamp-2">
                    {link.description || 'Access this important resource'}
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                  <Button 
                    variant="ghost" 
                    className="w-full text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                    onClick={() => {
                      if (link.url?.startsWith('http')) {
                        window.open(link.url, '_blank');
                      } else {
                        // Handle internal navigation here
                        console.log('Navigate to:', link.url);
                      }
                    }}
                  >
                    Visit
                    <ExternalLink className="h-4 w-4 ml-1" />
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </section>
  );
}