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
      await updateSnippet(editingSnippet.id, snippetData);
      setEditingSnippet(null);
      loadSnippets();
    }
  };

  const handleDeleteSnippet = async (id: string) => {
    await deleteSnippet(id);
    loadSnippets();
  };

  return (
    <main className="container mx-auto py-8">
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
        <TagFilter
          tags={allTags}
          selectedTag={selectedTag}
          onSelectTag={setSelectedTag}
        />
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
  );
}
