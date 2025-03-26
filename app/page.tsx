'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import { SearchBar } from '@/components/SearchBar';
import { SnippetCard } from '@/components/SnippetCard';
import { TagFilter } from '@/components/TagFilter';
import { ThemeToggle } from '@/components/ThemeToggle';
import { AuthButton } from '@/components/AuthButton';
import { AddEditSnippetDialog } from '@/components/AddEditSnippetDialog';
import { getAllSnippets, searchSnippets, addSnippet, updateSnippet, deleteSnippet, getSnippetsByTag } from '@/lib/db';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import Script from 'next/script';

interface Snippet {
  id: string;
  title: string;
  description: string;
  code: string;
  language: string;
  tags: string[];
}

export default function Home() {
  const [snippets, setSnippets] = useState<Snippet[]>([]);
  const [filteredSnippets, setFilteredSnippets] = useState<Snippet[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingSnippet, setEditingSnippet] = useState<Snippet | null>(null);
  const [allTags, setAllTags] = useState<string[]>([]);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    checkUser();
    loadSnippets();
  }, []);

  useEffect(() => {
    const tags = new Set<string>();
    snippets.forEach((snippet) => {
      snippet.tags.forEach((tag) => tags.add(tag));
    });
    setAllTags(Array.from(tags));
  }, [snippets]);

  // Apply filters to snippets
  useEffect(() => {
    if (!snippets.length) {
      setFilteredSnippets([]);
      return;
    }
    
    let results = [...snippets];
    
    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      results = results.filter(snippet => 
        snippet.title.toLowerCase().includes(query) ||
        snippet.description.toLowerCase().includes(query) ||
        snippet.code.toLowerCase().includes(query) ||
        snippet.tags.some(tag => tag.toLowerCase().includes(query))
      );
    }
    
    // Apply tag filter (only if no search query or we want both filters simultaneously)
    if (selectedTag) {
      results = results.filter(snippet => 
        snippet.tags.includes(selectedTag)
      );
    }
    
    setFilteredSnippets(results);
  }, [searchQuery, selectedTag, snippets]);

  const checkUser = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    const user = session?.user;
    if (user) {
      setIsLoggedIn(true);
    }
  }

  const loadSnippets = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    const user = session?.user;
  
    if (!user) {
      console.warn('No user logged in, skipping snippet fetch.');
      return;
    }
  
    const { data: loadedSnippets, error: snippetsError } = await supabase
      .from('snippets')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });
  
    if (snippetsError) {
      console.error('Error fetching snippets:', snippetsError);
      return;
    }
  
    setSnippets(loadedSnippets || []);
  };
  

  const handleAddSnippet = async (snippetData: Omit<Snippet, 'id'>) => {
    const {data: { session } } = await supabase.auth.getSession();
    const user = session?.user;
    
    if (!user) {
      console.warn('No user logged in, skipping snippet add.');
      return;
    }

    const snippetWithUserId = {
      ...snippetData,
      user_id: user.id,
    }

    console.log('Adding snippet:', snippetWithUserId);
    await addSnippet(snippetWithUserId);
    loadSnippets();
  };

  const handleEditSnippet = async (snippetData: Omit<Snippet, 'id'>) => {
    if (editingSnippet) {
      const { data: { session } } = await supabase.auth.getSession();
    const user = session?.user;

      if(!user) {
        console.warn("No user logged in, skipping snippet edit.");
        return;
      }

      const updatedSnippet = {
        ...snippetData,
        user_id: user.id,
      }
      await updateSnippet(editingSnippet.id, updatedSnippet);
      setEditingSnippet(null);
      loadSnippets();
    }
  };

  const handleDeleteSnippet = async (id: string) => {
    await deleteSnippet(id);
    loadSnippets();
  };

  return isLoggedIn ? (
    <main className="container mx-auto px-4 py-6 sm:p-8">
      {/* Mobile-friendly header that stacks on small screens */}
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-3xl font-bold md:text-4xl">DevSnippets</h1>
        <div className="flex flex-wrap items-center gap-2 sm:gap-4">
          <Link href="/guide" target='_blank'>Need help?</Link>
          <ThemeToggle />
          <AuthButton />
          <Button 
            onClick={() => setIsAddDialogOpen(true)}
            className="flex-1 sm:flex-none"
          >
            <PlusCircle className="mr-2 h-4 w-4" />
            <span className="sm:inline">Add Snippet</span>
          </Button>
        </div>
      </div>

{/* Search and filters - Full width on mobile */}
{snippets.length > 0 && (
        <div className="mb-6 space-y-4">
          <div className="w-full sm:max-w-md">
            <SearchBar value={searchQuery} onChange={setSearchQuery} />
          </div>
          <div className="pb-1">
            <TagFilter tags={allTags} selectedTag={selectedTag} onSelectTag={setSelectedTag} />
          </div>
        </div>
      )}

      {/* Responsive grid - 1 column on mobile, 2-3 on larger screens */}
      <div className="grid gap-4 sm:gap-6 md:grid-cols-2 lg:grid-cols-3">
      {filteredSnippets.length === 0 && snippets.length > 0 && selectedTag && (
          <div className="col-span-full flex flex-col items-center justify-center gap-4 rounded-lg border bg-muted p-4 sm:p-6">
            <h2 className="text-center text-lg font-semibold text-muted-foreground sm:text-xl">
              No snippets found with tag: {selectedTag}
            </h2>
            <Button 
              variant="outline" 
              onClick={() => setSelectedTag(null)}
              className="mt-2 flex items-center gap-2"
            >
              Show all snippets
            </Button>
          </div>
        )}
        
        {filteredSnippets.length === 0 && snippets.length > 0 && searchQuery && (
          <div className="col-span-full flex flex-col items-center justify-center gap-4 rounded-lg border bg-muted p-4 sm:p-6">
            <h2 className="text-center text-lg font-semibold text-muted-foreground sm:text-xl">
              No snippets found for: {searchQuery}
            </h2>
            <Button 
              variant="outline" 
              onClick={() => setSearchQuery('')}
              className="mt-2 flex items-center gap-2"
            >
              Clear search
            </Button>
          </div>
        )}

        {snippets.length === 0 && (
          <div className="col-span-full flex flex-col items-center justify-center gap-4 rounded-lg border bg-muted p-4 sm:p-6">
            <h2 className="text-center text-lg font-semibold text-muted-foreground sm:text-xl">
              No snippets found
            </h2>
            <p className="text-center text-muted-foreground">
              Start by creating your first snippet to organize your code.
            </p>
            <Button onClick={() => setIsAddDialogOpen(true)} className="mt-2 flex items-center gap-2">
              <PlusCircle className="h-4 w-4 sm:h-5 sm:w-5" />
              Create Snippet
            </Button>
          </div>
        )}

{filteredSnippets.map((snippet) => (
  <SnippetCard
    key={snippet.id}
    {...snippet}
    onEdit={() => setEditingSnippet(snippet)}
    onDelete={() => handleDeleteSnippet(snippet.id)}
  />
))} 
      </div>
  
      <AddEditSnippetDialog
        isOpen={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        onSubmit={handleAddSnippet}
      />
  
      <AddEditSnippetDialog
        isOpen={!!editingSnippet}
        onOpenChange={(open) => !open && setEditingSnippet(null)}
        onSubmit={handleEditSnippet}
        initialData={editingSnippet ?? undefined}
      />
      <Script id="structured-data" type="application/ld+json" dangerouslySetInnerHTML={{
        __html: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "SoftwareApplication",
          "name": "DevSnippets",
          "applicationCategory": "DeveloperApplication",
          "operatingSystem": "Any",
          "offers": {
            "@type": "Offer",
            "price": "0",
            "priceCurrency": "USD"
          },
          "description": "A code snippet manager for developers to save, organize, and quickly find code snippets.",
        })
      }} />
    </main>
  ) : (
    <main className="container mx-auto px-4 py-6 md:px-8 md:py-8">
      {/* Mobile-friendly header */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4 sm:mb-8">
        <h1 className="text-3xl font-bold md:text-4xl">DevSnippets</h1>
        <div className="flex items-center gap-2 sm:gap-4">
          <ThemeToggle />
          <AuthButton />
        </div>
      </div>

      {/* Hero Section - Better text scaling for mobile */}
      <div className="my-12 flex flex-col items-center text-center sm:my-16">
        <h2 className="mb-4 text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl lg:text-6xl">
          Store & organize your <span className="text-primary">code snippets</span>
        </h2>
        <p className="mb-6 max-w-2xl text-lg text-muted-foreground sm:mb-8 sm:text-xl">
          DevSnippet helps you save, organize, and quickly find code snippets for your development projects
        </p>
        <div className="flex w-full flex-col gap-3 sm:flex-row sm:justify-center">
          <AuthButton />
          <Link href="/guide" className="w-full sm:w-auto">
            <Button variant="outline" className="w-full sm:w-auto">
              Jump into more details
            </Button>
          </Link>
        </div>
      </div>

      {/* Features Section - Single column on mobile, 3 columns on larger screens */}
      <div className="my-12 grid gap-6 sm:my-16 md:grid-cols-3">
        <div className="rounded-lg border bg-card p-5 shadow-sm sm:p-6">
          <div className="mb-4 w-fit rounded-full bg-primary/10 p-3">
            <PlusCircle className="h-5 w-5 text-primary sm:h-6 sm:w-6" />
          </div>
          <h3 className="mb-2 text-lg font-bold sm:text-xl">Save code snippets</h3>
          <p className="text-sm text-muted-foreground sm:text-base">
            Quickly save code snippets with syntax highlighting for over 10 programming languages
          </p>
        </div>
        
        <div className="rounded-lg border bg-card p-5 shadow-sm sm:p-6">
          <div className="mb-4 w-fit rounded-full bg-primary/10 p-3">
            <svg className="h-5 w-5 text-primary sm:h-6 sm:w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
            </svg>
          </div>
          <h3 className="mb-2 text-lg font-bold sm:text-xl">Organize with tags</h3>
          <p className="text-sm text-muted-foreground sm:text-base">
            Add tags to your snippets and filter your collection to find what you need fast
          </p>
        </div>
        
        <div className="rounded-lg border bg-card p-5 shadow-sm sm:p-6">
          <div className="mb-4 w-fit rounded-full bg-primary/10 p-3">
            <svg className="h-5 w-5 text-primary sm:h-6 sm:w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <h3 className="mb-2 text-lg font-bold sm:text-xl">Powerful search</h3>
          <p className="text-sm text-muted-foreground sm:text-base">
            Find any snippet instantly with our powerful search functionality
          </p>
        </div>
      </div>

      {/* CTA Section - Better padding for mobile */}
      <div className="my-12 rounded-xl bg-muted p-6 text-center sm:my-16 sm:p-8">
        <h3 className="mb-3 text-xl font-bold sm:mb-4 sm:text-2xl">Ready to organize your code snippets?</h3>
        <p className="mb-5 text-sm text-muted-foreground sm:mb-6 sm:text-base">Sign in or create an account to get started</p>
        <AuthButton />
      </div>
      <Script id="structured-data" type="application/ld+json" dangerouslySetInnerHTML={{
        __html: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "SoftwareApplication",
          "name": "DevSnippets",
          "applicationCategory": "DeveloperApplication",
          "operatingSystem": "Any",
          "offers": {
            "@type": "Offer",
            "price": "0",
            "priceCurrency": "USD"
          },
          "description": "A code snippet manager for developers to save, organize, and quickly find code snippets.",
        })
      }} />
    </main>
  );
  
}
