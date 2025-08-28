import { Button } from '@/components/ui/button';
import { GraduationCap, BookOpen, Users, Star } from 'lucide-react';

interface HeroSectionProps {
  schoolName: string;
}

export function HeroSection({ schoolName }: HeroSectionProps) {
  return (
    <section className="relative bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-800 text-white">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-black/10">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iZ3JpZCIgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBwYXR0ZXJuVW5pdHM9InVzZXJTcGFjZU9uVXNlIj48cGF0aCBkPSJNIDQwIDAgTCAwIDAgMCA0MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjZmZmZmZmIiBzdHJva2Utb3BhY2l0eT0iMC4wNSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-30"></div>
      </div>

      <div className="relative container mx-auto px-4 py-20 lg:py-32">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          {/* School Name */}
          <div className="space-y-4">
            <div className="flex items-center justify-center space-x-3 mb-6">
              <GraduationCap className="h-12 w-12" />
              <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
                {schoolName}
              </h1>
            </div>
            <p className="text-xl md:text-2xl text-blue-100 max-w-3xl mx-auto leading-relaxed">
              Welcome to our learning community where every student is empowered to achieve excellence 
              and discover their full potential in a supportive, innovative environment.
            </p>
          </div>

          {/* Feature Icons */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-2xl mx-auto mt-12">
            <div className="text-center space-y-3">
              <BookOpen className="h-8 w-8 mx-auto text-blue-200" />
              <h3 className="font-semibold">Academic Excellence</h3>
              <p className="text-blue-100 text-sm">Innovative curriculum and dedicated teaching</p>
            </div>
            <div className="text-center space-y-3">
              <Users className="h-8 w-8 mx-auto text-blue-200" />
              <h3 className="font-semibold">Strong Community</h3>
              <p className="text-blue-100 text-sm">Collaborative learning environment</p>
            </div>
            <div className="text-center space-y-3">
              <Star className="h-8 w-8 mx-auto text-blue-200" />
              <h3 className="font-semibold">Student Success</h3>
              <p className="text-blue-100 text-sm">Supporting every student's journey</p>
            </div>
          </div>

          {/* Call to Action */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-8">
            <Button 
              size="lg" 
              className="bg-white text-blue-700 hover:bg-blue-50 font-semibold px-8"
            >
              Apply Now
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              className="border-white text-white hover:bg-white hover:text-blue-700 font-semibold px-8"
            >
              Schedule a Visit
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}