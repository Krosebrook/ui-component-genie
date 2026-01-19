import React, { useEffect, useState } from 'react';
import { blink } from '../lib/blink';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Code, Trash2, ExternalLink, Calendar, Search } from 'lucide-react';
import { Input } from '../components/ui/input';
import { toast } from 'react-hot-toast';

interface ComponentRecord {
  id: string;
  name: string;
  description: string;
  code: string;
  created_at: string;
}

export const LibraryPage: React.FC = () => {
  const [components, setComponents] = useState<ComponentRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchComponents = async () => {
    try {
      setLoading(true);
      const { records } = await blink.db.components.list();
      setComponents(records as ComponentRecord[]);
    } catch (error) {
      console.error('Failed to fetch components:', error);
      toast.error('Failed to load your library');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComponents();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this component?')) return;
    
    try {
      await blink.db.components.delete({ id });
      setComponents(prev => prev.filter(c => c.id !== id));
      toast.success('Component deleted');
    } catch (error) {
      console.error('Failed to delete component:', error);
      toast.error('Failed to delete component');
    }
  };

  const filteredComponents = components.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">My Library</h1>
          <p className="text-muted-foreground">Manage and reuse your generated components.</p>
        </div>
        <div className="relative w-full md:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input 
            placeholder="Search components..." 
            className="pl-9"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => (
            <Card key={i} className="animate-pulse">
              <div className="h-48 bg-muted rounded-t-lg" />
              <CardHeader className="space-y-2">
                <div className="h-4 bg-muted rounded w-3/4" />
                <div className="h-3 bg-muted rounded w-1/2" />
              </CardHeader>
            </Card>
          ))}
        </div>
      ) : filteredComponents.length === 0 ? (
        <div className="text-center py-20 bg-muted/20 rounded-xl border-2 border-dashed">
          <Code className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-20" />
          <h3 className="text-lg font-medium">No components found</h3>
          <p className="text-muted-foreground">Start by generating your first component!</p>
          <Button variant="outline" className="mt-4" onClick={() => window.location.href = '/'}>
            Go to Generator
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredComponents.map((component) => (
            <Card key={component.id} className="group hover:shadow-xl transition-all border-primary/5 hover:border-primary/20">
              <div className="h-48 bg-slate-950 flex items-center justify-center p-4 overflow-hidden rounded-t-lg relative">
                <pre className="text-[10px] text-slate-400 font-mono opacity-40 group-hover:opacity-60 transition-opacity">
                  <code>{component.code.slice(0, 500)}...</code>
                </pre>
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 to-transparent flex items-end p-4">
                  <div className="flex gap-2">
                    <Button size="sm" variant="secondary" className="h-8 text-xs gap-1">
                      <ExternalLink className="w-3 h-3" />
                      Preview
                    </Button>
                  </div>
                </div>
              </div>
              <CardHeader className="p-4">
                <CardTitle className="text-lg truncate">{component.name}</CardTitle>
                <CardDescription className="line-clamp-2 h-10">{component.description || 'No description provided.'}</CardDescription>
              </CardHeader>
              <CardFooter className="p-4 pt-0 flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Calendar className="w-3 h-3" />
                  {new Date(component.created_at).toLocaleDateString()}
                </div>
                <div className="flex gap-1">
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:bg-destructive/10" onClick={() => handleDelete(component.id)}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
