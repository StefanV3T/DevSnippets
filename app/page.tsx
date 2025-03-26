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
    if (searchQuery) {
      searchSnippets(searchQuery).then(setSnippets);
    } else if (selectedTag) {
      getSnippetsByTag(selectedTag).then(setSnippets);
    } else {
      loadSnippets();
    }
  }, [searchQuery, selectedTag]);

  useEffect(() => {
    const tags = new Set<string>();
    snippets.forEach((snippet) => {
      snippet.tags.forEach((tag) => tags.add(tag));
    });
    setAllTags(Array.from(tags));
  }, [snippets]);

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
    <main className="container mx-auto p-8">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-4xl font-bold">DevSnippet</h1>
        <div className="flex items-center gap-4">
          <ThemeToggle />
          <AuthButton />
          <Button onClick={() => setIsAddDialogOpen(true)}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Add Snippet
          </Button>
        </div>
      </div>
  
      <div className="mb-6 space-y-4">
        <div className="w-full max-w-md">
          <SearchBar value={searchQuery} onChange={setSearchQuery} />
        </div>
        <TagFilter tags={allTags} selectedTag={selectedTag} onSelectTag={setSelectedTag} />
      </div>
  
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {snippets.map((snippet) => (
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
    </main>
  ) : (
    <main className="container mx-auto px-4 py-8 md:px-8">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-4xl font-bold">DevSnippet</h1>
        <div className="flex items-center gap-4">
          <ThemeToggle />
          <AuthButton />
        </div>
      </div>

      {/* Hero Section */}
      <div className="my-16 flex flex-col items-center text-center">
        <h2 className="mb-4 text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
          Store & organize your <span className="text-primary">code snippets</span>
        </h2>
        <p className="mb-8 max-w-2xl text-xl text-muted-foreground">
          DevSnippet helps you save, organize, and quickly find code snippets for your development projects
        </p>
        <div className="flex flex-col gap-4 sm:flex-row">
          <AuthButton />
          <Link href="/guide">
          <Button variant="outline">
            Jump into more details
          </Button>
          </Link>
        </div>
      </div>

      {/* Features Section */}
      <div className="my-16 grid gap-8 md:grid-cols-3">
        <div className="rounded-lg border bg-card p-6 shadow-sm">
          <div className="mb-4 rounded-full bg-primary/10 p-3 w-fit">
            <PlusCircle className="h-6 w-6 text-primary" />
          </div>
          <h3 className="mb-2 text-xl font-bold">Save code snippets</h3>
          <p className="text-muted-foreground">
            Quickly save code snippets with syntax highlighting for over 10 programming languages
          </p>
        </div>
        <div className="rounded-lg border bg-card p-6 shadow-sm">
          <div className="mb-4 rounded-full bg-primary/10 p-3 w-fit">
            <svg className="h-6 w-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
            </svg>
          </div>
          <h3 className="mb-2 text-xl font-bold">Organize with tags</h3>
          <p className="text-muted-foreground">
            Add tags to your snippets and filter your collection to find what you need fast
          </p>
        </div>
        <div className="rounded-lg border bg-card p-6 shadow-sm">
          <div className="mb-4 rounded-full bg-primary/10 p-3 w-fit">
            <svg className="h-6 w-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <h3 className="mb-2 text-xl font-bold">Powerful search</h3>
          <p className="text-muted-foreground">
            Find any snippet instantly with our powerful search functionality
          </p>
        </div>
      </div>

      {/* CTA Section */}
      <div className="my-16 rounded-xl bg-muted p-8 text-center">
        <h3 className="mb-4 text-2xl font-bold">Ready to organize your code snippets?</h3>
        <p className="mb-6 text-muted-foreground">Sign in or create an account to get started</p>
        <AuthButton />
      </div>
    </main>
  );
  
}
