import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, Clock, User, ExternalLink } from 'lucide-react';
import type { NewsArticle } from '../../../server/src/schema';

interface NewsSectionProps {
  news: NewsArticle[];
}

export function NewsSection({ news }: NewsSectionProps) {
  // Default news items when no data is available
  const defaultNews: Partial<NewsArticle>[] = [
    {
      id: 1,
      title: "Welcome Back to School - New Academic Year 2024",
      summary: "We're excited to welcome all students back for another amazing year of learning and growth.",
      author: "Principal Johnson",
      published_at: new Date('2024-01-15'),
      content: ""
    },
    {
      id: 2,
      title: "Science Fair Winners Announced",
      summary: "Congratulations to our outstanding science fair participants who showcased incredible projects.",
      author: "Ms. Thompson",
      published_at: new Date('2024-01-10'),
      content: ""
    },
    {
      id: 3,
      title: "Winter Break Holiday Schedule",
      summary: "Important dates and information about the upcoming winter break and return to classes.",
      author: "Administration",
      published_at: new Date('2024-01-05'),
      content: ""
    }
  ];

  const displayNews = news.length > 0 ? news : defaultNews;

  return (
    <section className="space-y-8">
      <div className="text-center space-y-4">
        <h2 className="text-3xl md:text-4xl font-bold text-slate-800">Latest News</h2>
        <p className="text-lg text-slate-600 max-w-2xl mx-auto">
          Stay updated with the latest announcements, achievements, and important information from our school community.
        </p>
      </div>

      {displayNews.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-slate-500 text-lg">No news articles available at this time.</p>
          <p className="text-slate-400 text-sm mt-2">Check back soon for updates!</p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {displayNews.map((article, index) => (
            <Card key={article.id || index} className="hover:shadow-lg transition-shadow duration-300 group">
              <CardHeader>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <Badge variant="secondary" className="text-xs">
                    Latest
                  </Badge>
                  {article.published_at && (
                    <div className="flex items-center text-xs text-slate-500 gap-1">
                      <Calendar className="h-3 w-3" />
                      {new Date(article.published_at).toLocaleDateString()}
                    </div>
                  )}
                </div>
                <CardTitle className="text-xl group-hover:text-blue-600 transition-colors">
                  {article.title}
                </CardTitle>
                <CardDescription className="line-clamp-2">
                  {article.summary || 'No summary available.'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="flex items-center text-sm text-slate-600 gap-1">
                    <User className="h-4 w-4" />
                    {article.author || 'School Administration'}
                  </div>
                  <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-700">
                    Read More
                    <ExternalLink className="h-4 w-4 ml-1" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <div className="text-center">
        <Button variant="outline" size="lg" className="font-semibold">
          View All News
        </Button>
      </div>
    </section>
  );
}