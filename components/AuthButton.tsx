'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { EyeIcon, EyeOffIcon, LogIn, LogOut, User } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { Session } from '@supabase/supabase-js';
import { toast } from 'react-toastify';

export function AuthButton() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'signin' | 'signup'>('signin');
  const [session, setSession] = useState<Session | null>(null);
  
  // Sign in form state
  const [signinEmail, setSigninEmail] = useState('');
  const [signinPassword, setSigninPassword] = useState('');
  const [signinLoading, setSigninLoading] = useState(false);
  const [signinError, setSigninError] = useState<string | null>(null);
  const [showSigninPassword, setShowSigninPassword] = useState(false);
  
  // Sign up form state
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupConfirmPassword, setSignupConfirmPassword] = useState('');
  const [signupLoading, setSignupLoading] = useState(false);
  const [signupError, setSignupError] = useState<string | null>(null);
  const [showSignupPassword, setShowSignupPassword] = useState(false);

  useEffect(() => {
    // Check initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
      }
    );

    // Cleanup subscription
    return () => {
      subscription.unsubscribe();
    };
  }, []);
  
  // Reset form state when dialog opens/closes
  useEffect(() => {
    if (!isOpen) {
      resetForms();
    }
  }, [isOpen]);
  
  const resetForms = () => {
    // Reset sign in form
    setSigninEmail('');
    setSigninPassword('');
    setSigninError(null);
    setShowSigninPassword(false);
    
    // Reset sign up form
    setSignupEmail('');
    setSignupPassword('');
    setSignupConfirmPassword('');
    setSignupError(null);
    setShowSignupPassword(false);
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setSigninLoading(true);
    setSigninError(null);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: signinEmail,
        password: signinPassword,
      });

      if (error) throw error;

      setIsOpen(false);
      toast.success('Successfully signed in!');
      window.location.reload();
    } catch (err: any) {
      setSigninError(err.message);
      toast.error(`Sign in failed: ${err.message}`);
    } finally {
      setSigninLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setSignupLoading(true);
    setSignupError(null);
    
    // Validate password match
    if (signupPassword !== signupConfirmPassword) {
      setSignupError("Passwords don't match");
      setSignupLoading(false);
      return;
    }
    
    // Validate password strength
    if (signupPassword.length < 8) {
      setSignupError("Password must be at least 8 characters");
      setSignupLoading(false);
      return;
    }

    try {
      const { error } = await supabase.auth.signUp({
        email: signupEmail,
        password: signupPassword,
      });

      if (error) throw error;

      setIsOpen(false);
      toast.success('Account created successfully! Check your email for confirmation.');
    } catch (err: any) {
      setSignupError(err.message);
      toast.error(`Registration failed: ${err.message}`);
    } finally {
      setSignupLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      toast.info('You have been signed out');
      window.location.reload();
    } catch (error: any) {
      toast.error(`Sign out failed: ${error.message}`);
    }
  };

  // Handle tab change
  const handleTabChange = (value: string) => {
    setActiveTab(value as 'signin' | 'signup');
    setSigninError(null);
    setSignupError(null);
  };

  return (
    <>
      {session?.user ? (
        <Button variant="outline" onClick={handleSignOut}>
          <LogOut className="mr-2 h-4 w-4" />
          Sign out
        </Button>
      ) : (
        <Button variant="outline" onClick={() => setIsOpen(true)}>
          <LogIn className="mr-2 h-4 w-4" />
          Sign in
        </Button>
      )}
      
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="text-center text-xl">Welcome to DevSnippets</DialogTitle>
          </DialogHeader>
          
          <Tabs 
            defaultValue="signin" 
            value={activeTab}
            onValueChange={handleTabChange}
            className="w-full"
          >
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="signin">Sign in</TabsTrigger>
              <TabsTrigger value="signup">Create account</TabsTrigger>
            </TabsList>
            
            {/* Sign In Tab */}
            <TabsContent value="signin">
              <form onSubmit={handleSignIn} className="space-y-4 pt-2">
                <div className="space-y-2">
                  <Label htmlFor="signin-email">Email</Label>
                  <Input
                    id="signin-email"
                    type="email"
                    value={signinEmail}
                    onChange={(e) => setSigninEmail(e.target.value)}
                    placeholder="your@email.com"
                    autoComplete="email"
                    required
                    disabled={signinLoading}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="signin-password">Password</Label>
                  <div className="relative">
                    <Input
                      id="signin-password"
                      type={showSigninPassword ? "text" : "password"}
                      value={signinPassword}
                      onChange={(e) => setSigninPassword(e.target.value)}
                      placeholder="••••••••"
                      autoComplete="current-password"
                      required
                      disabled={signinLoading}
                    />
                    <button
                      type="button"
                      onClick={() => setShowSigninPassword(!showSigninPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400"
                      tabIndex={-1}
                    >
                      {showSigninPassword ? 
                        <EyeOffIcon className="h-4 w-4" /> : 
                        <EyeIcon className="h-4 w-4" />
                      }
                    </button>
                  </div>
                </div>
                
                {signinError && (
                  <div className="rounded-md bg-red-50 p-2 dark:bg-red-900/20">
                    <p className="text-sm text-red-600 dark:text-red-400">{signinError}</p>
                  </div>
                )}
                
                <Button 
                  type="submit" 
                  className="w-full" 
                  disabled={signinLoading}
                >
                  {signinLoading ? "Signing in..." : "Sign in"}
                </Button>
              </form>
            </TabsContent>
            
            {/* Sign Up Tab */}
            <TabsContent value="signup">
              <form onSubmit={handleSignUp} className="space-y-4 pt-2">
                <div className="space-y-2">
                  <Label htmlFor="signup-email">Email</Label>
                  <Input
                    id="signup-email"
                    type="email"
                    value={signupEmail}
                    onChange={(e) => setSignupEmail(e.target.value)}
                    placeholder="your@email.com"
                    autoComplete="email"
                    required
                    disabled={signupLoading}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="signup-password">Password</Label>
                  <div className="relative">
                    <Input
                      id="signup-password"
                      type={showSignupPassword ? "text" : "password"}
                      value={signupPassword}
                      onChange={(e) => setSignupPassword(e.target.value)}
                      placeholder="••••••••"
                      autoComplete="new-password"
                      required
                      disabled={signupLoading}
                    />
                    <button
                      type="button"
                      onClick={() => setShowSignupPassword(!showSignupPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400"
                      tabIndex={-1}
                    >
                      {showSignupPassword ? 
                        <EyeOffIcon className="h-4 w-4" /> : 
                        <EyeIcon className="h-4 w-4" />
                      }
                    </button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Must be at least 8 characters
                  </p>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="signup-confirm-password">Confirm Password</Label>
                  <Input
                    id="signup-confirm-password"
                    type="password"
                    value={signupConfirmPassword}
                    onChange={(e) => setSignupConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    autoComplete="new-password"
                    required
                    disabled={signupLoading}
                  />
                </div>
                
                {signupError && (
                  <div className="rounded-md bg-red-50 p-2 dark:bg-red-900/20">
                    <p className="text-sm text-red-600 dark:text-red-400">{signupError}</p>
                  </div>
                )}
                
                <Button 
                  type="submit" 
                  className="w-full" 
                  disabled={signupLoading}
                >
                  {signupLoading ? "Creating account..." : "Create account"}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>
    </>
  );
}