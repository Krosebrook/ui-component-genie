import React, { useState, useEffect } from 'react';
import { useAgent, useBlinkAuth } from '@blinkdotnew/react';
import type { Sandbox } from '@blinkdotnew/react';
import { componentAgent } from '../lib/agents';
import { blink } from '../lib/blink';
import { Button } from '../components/ui/button';
import { Textarea } from '../components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Sparkles, Code, Play, Download, Copy, Trash2, Loader2, Save } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '../components/ui/dialog';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';

export const GeneratorPage: React.FC = () => {
  const { user, isAuthenticated } = useBlinkAuth();
  const [prompt, setPrompt] = useState('');
  const [generatedCode, setGeneratedCode] = useState('');
  const [isSaveDialogOpen, setIsSaveDialogOpen] = useState(false);
  const [saveData, setSaveData] = useState({ name: '', description: '' });
  const [isSaving, setIsSaving] = useState(false);
  const [sandbox, setSandbox] = useState<Sandbox | null>(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [isInitializingSandbox, setIsInitializingSandbox] = useState(false);

  // Initialize sandbox
  useEffect(() => {
    if (!isAuthenticated || sandbox) return;

    const initSandbox = async () => {
      try {
        setIsInitializingSandbox(true);
        const sbx = await blink.sandbox.create({ template: 'devtools-base' });
        
        // Prepare sandbox with essential files
        await sbx.commands.run(`
          mkdir -p src &&
          echo 'import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>
);' > src/main.tsx &&
          echo '@tailwind base;
@tailwind components;
@tailwind utilities;' > src/index.css &&
          echo 'import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
export default defineConfig({
  plugins: [react()],
  server: { host: "0.0.0.0", allowedHosts: true, port: 3000 }
});' > vite.config.ts &&
          echo '{
  "name": "preview",
  "type": "module",
  "dependencies": {
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "lucide-react": "^0.453.0",
    "framer-motion": "^11.11.10",
    "clsx": "^2.1.1",
    "tailwind-merge": "^2.5.4"
  },
  "devDependencies": {
    "@types/react": "^18.3.12",
    "@types/react-dom": "^18.3.1",
    "@vitejs/plugin-react": "^4.3.3",
    "autoprefixer": "^10.4.20",
    "postcss": "^8.4.47",
    "tailwindcss": "^3.4.14",
    "vite": "^5.4.10"
  },
  "scripts": {
    "dev": "vite"
  }
}' > package.json &&
          npm install &&
          npm run dev -- --host 0.0.0.0 &
        `, { timeoutMs: 0 });

        setSandbox(sbx);
      } catch (error) {
        console.error('Failed to init sandbox:', error);
        toast.error('Failed to initialize preview environment');
      } finally {
        setIsInitializingSandbox(false);
      }
    };

    initSandbox();
  }, [isAuthenticated, sandbox]);

  const { sendMessage, isLoading, messages } = useAgent({
    agent: componentAgent,
    sandbox: sandbox || undefined,
    onFinish: async (response) => {
      setGeneratedCode(response.text);
      
      if (sandbox) {
        try {
          // Write generated code to App.tsx in sandbox
          await sandbox.commands.run(`echo '${response.text.replace(/'/g, "'\\''")}' > src/App.tsx`);
          setPreviewUrl(`https://${sandbox.getHost(3000)}`);
        } catch (error) {
          console.error('Failed to update sandbox:', error);
        }
      }
      
      toast.success('Component generated successfully!');
    },
    onError: (error) => {
      toast.error('Failed to generate component. Please try again.');
      console.error(error);
    }
  });

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    setGeneratedCode('');
    setPreviewUrl('');
    await sendMessage(`Generate a React component for: ${prompt}. Return ONLY the code, no markdown.`);
  };

  const handleSave = async () => {
    if (!saveData.name.trim()) {
      toast.error('Please provide a name for the component');
      return;
    }

    try {
      setIsSaving(true);
      await blink.db.components.create({
        user_id: user?.id,
        name: saveData.name,
        description: saveData.description,
        code: generatedCode,
      });
      toast.success('Component saved to your library!');
      setIsSaveDialogOpen(false);
      setSaveData({ name: '', description: '' });
    } catch (error) {
      console.error('Failed to save component:', error);
      toast.error('Failed to save component');
    } finally {
      setIsSaving(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedCode);
    toast.success('Code copied to clipboard!');
  };

  const handleDownload = () => {
    const element = document.createElement("a");
    const file = new Blob([generatedCode], {type: 'text/plain'});
    element.href = URL.createObjectURL(file);
    element.download = `${saveData.name || 'component'}.tsx`;
    document.body.appendChild(element);
    element.click();
    toast.success('File downloaded!');
  };

  const handleClear = () => {
    setPrompt('');
    setGeneratedCode('');
    setSaveData({ name: '', description: '' });
    setPreviewUrl('');
  };

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Generate UI Components</h1>
        <p className="text-muted-foreground">Describe the component you want, and our AI will build it for you.</p>
      </div>

      <Card className="border-2 border-primary/10 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            AI Prompt
          </CardTitle>
          <CardDescription>Be specific about colors, sizes, and animations.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea 
            placeholder="e.g., A glassmorphic pricing card with a gradient button and hover animations..."
            className="min-h-[120px] text-lg resize-none focus-visible:ring-primary"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
          />
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={handleClear}>Clear</Button>
            <Button disabled={isLoading || !prompt || isInitializingSandbox} onClick={handleGenerate} className="gap-2">
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  Generate Component
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {generatedCode && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-fade-in">
          <Card className="flex flex-col">
            <CardHeader className="flex-row items-center justify-between space-y-0">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Play className="w-4 h-4" />
                Preview
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 min-h-[400px] flex flex-col bg-muted/20 rounded-b-lg border-t overflow-hidden p-0 relative">
              {previewUrl ? (
                <iframe 
                  src={previewUrl} 
                  className="w-full h-full border-none bg-white"
                  title="Preview"
                />
              ) : (
                <div className="flex-1 flex items-center justify-center p-8 text-center space-y-4">
                  <div className="space-y-4">
                    <p className="text-sm text-muted-foreground">
                      {isLoading ? 'Wait a moment, we are rendering your component...' : 'Your preview will appear here after generation.'}
                    </p>
                    <div className="p-12 border-2 border-dashed border-muted rounded-xl bg-background/50">
                       <Sparkles className={`w-8 h-8 mx-auto mb-2 ${isLoading ? 'text-primary animate-pulse' : 'text-primary/40'}`} />
                       <p className="text-xs text-muted-foreground">
                         {isInitializingSandbox ? 'Setting up preview environment...' : 'Ready to generate.'}
                       </p>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="flex flex-col">
            <CardHeader className="flex-row items-center justify-between space-y-0">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Code className="w-4 h-4" />
                Code Output
              </CardTitle>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="h-8 gap-2" onClick={() => setIsSaveDialogOpen(true)}>
                  <Save className="w-4 h-4" />
                  Save
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={copyToClipboard}>
                  <Copy className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleDownload}>
                  <Download className="w-4 h-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="flex-1 p-0 overflow-hidden bg-slate-950 rounded-b-lg border-t">
              <pre className="p-4 text-xs font-mono text-slate-300 overflow-auto max-h-[400px]">
                <code>{generatedCode}</code>
              </pre>
            </CardContent>
          </Card>
        </div>
      )}

      <Dialog open={isSaveDialogOpen} onOpenChange={setIsSaveDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Save to Library</DialogTitle>
            <DialogDescription>Give your component a name and description to find it later.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Component Name</Label>
              <Input 
                id="name" 
                placeholder="e.g., Glassmorphic Pricing Card" 
                value={saveData.name}
                onChange={(e) => setSaveData(prev => ({ ...prev, name: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description (Optional)</Label>
              <Textarea 
                id="description" 
                placeholder="What is this component used for?" 
                value={saveData.description}
                onChange={(e) => setSaveData(prev => ({ ...prev, description: e.target.value }))}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsSaveDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving ? 'Saving...' : 'Save Component'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
