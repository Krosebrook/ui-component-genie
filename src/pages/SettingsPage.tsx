import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Switch } from '../components/ui/switch';
import { User, Bell, Shield, Palette, Github } from 'lucide-react';

export const SettingsPage: React.FC = () => {
  return (
    <div className="p-8 max-w-4xl mx-auto space-y-8">
      <div className="space-y-1">
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">Manage your account and app preferences.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-[200px_1fr] gap-8">
        <div className="flex flex-col space-y-1">
          <Button variant="secondary" className="justify-start gap-2">
            <User className="w-4 h-4" />
            Profile
          </Button>
          <Button variant="ghost" className="justify-start gap-2">
            <Palette className="w-4 h-4" />
            Appearance
          </Button>
          <Button variant="ghost" className="justify-start gap-2">
            <Bell className="w-4 h-4" />
            Notifications
          </Button>
          <Button variant="ghost" className="justify-start gap-2">
            <Shield className="w-4 h-4" />
            Security
          </Button>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
              <CardDescription>Update your public profile details.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">Display Name</Label>
                  <Input id="firstName" defaultValue="Kai" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Username</Label>
                  <Input id="lastName" defaultValue="kaibuilds" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input id="email" defaultValue="kai@example.com" disabled />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Appearance</CardTitle>
              <CardDescription>Customize how UI Component Genie looks for you.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Dark Mode</Label>
                  <p className="text-sm text-muted-foreground">Switch between light and dark themes.</p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Compact Mode</Label>
                  <p className="text-sm text-muted-foreground">Show more components at once in the library.</p>
                </div>
                <Switch />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Integrations</CardTitle>
              <CardDescription>Connect your account with external services.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between border p-4 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-slate-900 rounded-lg text-white">
                    <Github className="w-5 h-5" />
                  </div>
                  <div className="space-y-0.5">
                    <Label>GitHub</Label>
                    <p className="text-sm text-muted-foreground">Export your components directly to GitHub.</p>
                  </div>
                </div>
                <Button variant="outline" size="sm">Connect</Button>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end gap-3">
            <Button variant="outline">Cancel</Button>
            <Button>Save Changes</Button>
          </div>
        </div>
      </div>
    </div>
  );
};
