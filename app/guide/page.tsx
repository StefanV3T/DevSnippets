'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  LogIn, 
  PlusCircle, 
  Search, 
  Tag, 
  Copy, 
  Edit, 
  Trash, 
  ChevronDown, 
  Home,
  AlertCircle,
  ChevronRight,
  ChevronLeft,
  Menu,
  X
} from 'lucide-react';
import { ThemeToggle } from '@/components/ThemeToggle';
import { AuthButton } from '@/components/AuthButton';
import React from 'react';

// Define the steps for our guide
const STEPS = [
{
        id: 'introduction',
        title: 'Introduction',
        icon: <Home className="h-6 w-6" />
},
  {
    id: 'getting-started',
    title: 'Getting started',
    icon: <LogIn className="h-6 w-6" />
  },
  {
    id: 'adding-snippets',
    title: 'Adding snippets',
    icon: <PlusCircle className="h-6 w-6" />
  },
  {
    id: 'managing-snippets',
    title: 'Managing snippets',
    icon: <Copy className="h-6 w-6" />
  },
  {
    id: 'finding-snippets',
    title: 'Finding snippets',
    icon: <Search className="h-6 w-6" />
  }
];

export default function GuidePage() {
  const [currentStep, setCurrentStep] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const nextStep = () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  return (
    <main className="container mx-auto px-4 py-8 md:px-8">
      {/* Mobile-friendly header */}
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-3xl font-bold md:text-4xl">DevSnippet guide</h1>
        <div className="flex items-center gap-4">
          <ThemeToggle />
          <Link href="/">
            <Button variant="outline" className="ml-auto">
              <Home className="mr-2 h-4 w-4" />
              <span className="hidden sm:inline">Back to home</span>
              <span className="sm:hidden">Home</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* Responsive container - full width on mobile, constrained on larger screens */}
      <div className="mx-auto w-full md:w-4/5 lg:w-3/5">

      {/* Progress steps */}
      <div className="mb-8">
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-xl font-bold md:text-2xl">Guide Steps</h2>
          <div className="mt-2 text-sm text-muted-foreground sm:mt-0">
            Step {currentStep + 1} of {STEPS.length}
          </div>
        </div>
        
        {/* Mobile menu button */}
        <div className="mb-4 block sm:hidden">
          <Button 
            variant="outline" 
            className="w-full justify-between" 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            <span className="flex items-center">
              {STEPS[currentStep].icon}
              <span className="ml-2">{STEPS[currentStep].title}</span>
            </span>
            {mobileMenuOpen ? <X size={18} /> : <ChevronDown size={18} />}
          </Button>

          {/* Mobile dropdown menu */}
          {mobileMenuOpen && (
            <div className="mt-2 rounded-md border bg-card p-2 shadow-sm">
              {STEPS.map((step, index) => (
                <button
                  key={step.id}
                  className={`flex w-full items-center rounded-md p-2 text-left ${
                    index === currentStep ? 'bg-primary/10 text-primary' : ''
                  }`}
                  onClick={() => {
                    setCurrentStep(index);
                    setMobileMenuOpen(false);
                  }}
                >
                  <span className="mr-2">{step.icon}</span>
                  <span>{step.title}</span>
                </button>
              ))}
            </div>
          )}
        </div>
        
        {/* Desktop horizontal steps - hidden on mobile */}
        <div className="hidden sm:flex sm:w-full sm:items-center">
          {STEPS.map((step, index) => (
            <React.Fragment key={step.id}>
              {/* Step indicator and label */}
              <div className="flex flex-col items-center">
                <button
                  onClick={() => setCurrentStep(index)}
                  className={`flex h-10 w-10 md:h-12 md:w-12 items-center justify-center rounded-full border-2 ${
                    index === currentStep 
                      ? 'border-primary bg-primary text-primary-foreground'
                      : index < currentStep 
                        ? 'border-primary bg-primary/10 text-primary'
                        : 'border-muted-foreground/30 text-muted-foreground/70'
                  }`}
                >
                  {step.icon}
                </button>
                <span className={`mt-2 text-center text-xs sm:text-sm ${
                  index === currentStep ? 'font-medium text-primary' : 'text-muted-foreground'
                }`}>
                  {step.title}
                </span>
              </div>
              
              {/* Connecting line between steps */}
              {index < STEPS.length - 1 && (
                <div className="flex-1 px-1 md:px-2 flex items-center">
                  <div className="h-0.5 w-full bg-transparant"></div>
                </div>
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Content sections - Only show the current step */}
      <div className="mb-12">
          {/* Step 0: Introduction */}
          {currentStep === 0 && (
                  <section className="mb-12">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-xl md:text-2xl">Welcome to DevSnippet</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="mb-4">
                        DevSnippet is a powerful tool that helps developers save, organize, and quickly find code snippets.
                        This guide will walk you through all the features and help you get the most out of the application.
                      </p>
                    </CardContent>
                  </Card>
                </section>
          )}

        {/* Step 1: Getting Started */}
        {currentStep === 1 && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center text-xl md:text-2xl">
                <LogIn className="mr-2 h-5 w-5 text-primary" />
                Creating an account & logging in
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-lg border p-4">
                <h4 className="mb-2 font-semibold">Step 1: Click the "Sign in" button</h4>
                <p>Located in the top-right corner of the page.</p>
              </div>
              
              <div className="rounded-lg border p-4">
                <h4 className="mb-2 font-semibold">Step 2: Create an account</h4>
                <p>If you don't have an account yet, click the "Sign Up" button and enter your email and password.</p>
              </div>
              
              <div className="rounded-lg border p-4">
                <h4 className="mb-2 font-semibold">Step 3: Sign in</h4>
                <p>Enter your email and password, then click the "Sign In" button.</p>
              </div>

              <div className="rounded-md bg-amber-50 p-4 dark:bg-amber-950/30">
                <div className="flex items-center">
                  <AlertCircle className="mr-2 h-4 w-4 flex-shrink-0 text-amber-600" />
                  <p className="text-sm font-medium text-amber-800 dark:text-amber-600">
                    You must be signed in to save snippets and access your personal collection.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 2: Adding Snippets */}
        {currentStep === 2 && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center text-xl md:text-2xl">
                <PlusCircle className="mr-2 h-5 w-5 text-primary" />
                Creating a new snippet
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-lg border p-4">
                <h4 className="mb-2 font-semibold">Step 1: Click "Add snippet"</h4>
                <p>Look for the "Add snippet" button in the top-right area of your dashboard.</p>
              </div>
              
              <div className="rounded-lg border p-4">
                <h4 className="mb-2 font-semibold">Step 2: Fill in the details</h4>
                <ul className="ml-6 list-disc space-y-2">
                  <li><strong>Title:</strong> Give your snippet a descriptive name</li>
                  <li><strong>Description:</strong> Add details about what the snippet does</li>
                  <li><strong>Language:</strong> Select the programming language</li>
                  <li><strong>Code:</strong> Paste or type your code in the editor</li>
                  <li><strong>Tags:</strong> Add relevant tags to categorize your snippet</li>
                </ul>
              </div>
              
              <div className="rounded-lg border p-4">
                <h4 className="mb-2 font-semibold">Step 3: Save your snippet</h4>
                <p>Click the "Create" button to save your snippet to your collection.</p>
              </div>

              <div className="rounded-md bg-blue-50 p-4 dark:bg-blue-950/30">
                <p className="text-sm text-blue-800 dark:text-blue-500">
                  <strong>Pro tip:</strong> Add multiple tags to make your snippets easier to find later!
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 3: Managing Snippets */}
        {currentStep === 3 && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center text-xl md:text-2xl">
                <Copy className="mr-2 h-5 w-5 text-primary" />
                Working with snippets
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:gap-6 md:grid-cols-2">
                <div className="rounded-lg border p-4">
                  <h4 className="mb-2 flex items-center font-semibold">
                    <Copy className="mr-2 h-4 w-4 flex-shrink-0" />
                    <span>Copying code</span>
                  </h4>
                  <p>Click the copy icon in the top-right corner of any snippet card to copy the code to your clipboard.</p>
                </div>
                
                <div className="rounded-lg border p-4">
                  <h4 className="mb-2 flex items-center font-semibold">
                    <ChevronDown className="mr-2 h-4 w-4 flex-shrink-0" />
                    <span>Expanding snippets</span>
                  </h4>
                  <p>Click the "Expand" button below the code to see the full snippet when it's too large.</p>
                </div>
                
                <div className="rounded-lg border p-4">
                  <h4 className="mb-2 flex items-center font-semibold">
                    <Edit className="mr-2 h-4 w-4 flex-shrink-0" />
                    <span>Editing snippets</span>
                  </h4>
                  <p>Click the "Edit" button at the bottom of a snippet card to modify its content or details.</p>
                </div>
                
                <div className="rounded-lg border p-4">
                  <h4 className="mb-2 flex items-center font-semibold">
                    <Trash className="mr-2 h-4 w-4 flex-shrink-0" />
                    <span>Deleting snippets</span>
                  </h4>
                  <p>Click the "Delete" button at the bottom of a snippet card to remove it from your collection.</p>
                </div>
              </div>

              <div className="mt-6 rounded-md bg-red-50 p-4 dark:bg-red-950/30">
                <div className="flex items-center">
                  <AlertCircle className="mr-2 h-4 w-4 flex-shrink-0 text-red-600" />
                  <p className="text-sm font-medium text-red-800 dark:text-red-600">
                    Warning: Deleting a snippet cannot be undone.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 4: Finding Snippets */}
        {currentStep === 4 && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center text-xl md:text-2xl">
                <Search className="mr-2 h-5 w-5 text-primary" />
                Searching & filtering
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="rounded-lg border p-4">
                <h4 className="mb-2 flex items-center font-semibold">
                  <Search className="mr-2 h-4 w-4 flex-shrink-0" />
                  <span>Searching</span>
                </h4>
                <p>Use the search bar at the top of the page to find snippets by title, description, or code content.</p>
              </div>
              
              <div className="rounded-lg border p-4">
                <h4 className="mb-2 flex items-center font-semibold">
                  <Tag className="mr-2 h-4 w-4 flex-shrink-0" />
                  <span>Filtering by tags</span>
                </h4>
                <p>Click on any tag to filter snippets. Click "All" to see all snippets again.</p>
              </div>
              
              <div className="rounded-md bg-blue-50 p-4 dark:bg-blue-950/30">
                <p className="text-sm text-blue-800 dark:text-blue-500">
                  <strong>Pro tip:</strong> Use consistent tag naming conventions to make filtering more effective.
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Navigation buttons */}
      <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-between">
        <Button 
          variant="outline" 
          onClick={prevStep} 
          disabled={currentStep === 0}
          className="w-full sm:w-auto"
        >
          <ChevronLeft className="mr-2 h-4 w-4" /> Previous
        </Button>
        
        {currentStep < STEPS.length - 1 ? (
          <Button onClick={nextStep} className="w-full sm:w-auto">
            Next <ChevronRight className="ml-2 h-4 w-4" />
          </Button>
        ) : (
          <Link href="/" className="w-full sm:w-auto">
            <Button className="w-full">
              <Home className="mr-2 h-4 w-4" /> Return to DevSnippet
            </Button>
          </Link>
        )}
      </div>
      </div>
    </main>
  );
}