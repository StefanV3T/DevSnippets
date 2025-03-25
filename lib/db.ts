import { openDB, DBSchema, IDBPDatabase } from 'idb';
import { supabase } from './supabase';

interface SnippetDBSchema extends DBSchema {
  snippets: {
    key: string;
    value: {
      id: string;
      title: string;
      description: string;
      code: string;
      language: string;
      tags: string[];
      created_at: number;
      updated_at: number;
      user_id: string;
    };
    indexes: { 'by-title': string; 'by-tags': string[] };
  };
}

const DB_NAME = 'devsnippet-db';
const DB_VERSION = 1;

export async function initDB(): Promise<IDBPDatabase<SnippetDBSchema>> {
  return openDB<SnippetDBSchema>(DB_NAME, DB_VERSION, {
    upgrade(db) {
      const snippetStore = db.createObjectStore('snippets', { keyPath: 'id' });
      snippetStore.createIndex('by-title', 'title');
      snippetStore.createIndex('by-tags', 'tags', { multiEntry: true });
    },
  });
}

export async function getAllSnippets() {
  const db = await initDB();
  const localSnippets = await db.getAll('snippets');

  const { data: user } = await supabase.auth.getUser();
  if (!user) return localSnippets;

  const { data: cloudSnippets } = await supabase
    .from('snippets')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (cloudSnippets) {
    const mergedSnippets = [...localSnippets];
    for (const cloudSnippet of cloudSnippets) {
      const localIndex = mergedSnippets.findIndex(local => local.id === cloudSnippet.id);
      if (localIndex >= 0) {
        mergedSnippets[localIndex] = cloudSnippet;
      } else {
        mergedSnippets.push(cloudSnippet);
      }
    }
    return mergedSnippets;
  }

  return localSnippets;
}


export async function addSnippet(snippet: Omit<SnippetDBSchema['snippets']['value'], 'id' | 'created_at' | 'updated_at' | 'user_id'>) {
  const db = await initDB();
  const id = crypto.randomUUID();
  const timestamp = new Date().toISOString();

  const { data: { session } } = await supabase.auth.getSession();

  console.log('Full Session Data:', session);
  console.log('User:', session?.user);

  if (!session?.user) {
    console.error('Authentication Error:', {session});
    throw new Error("User not authenticated");
  }

  const newSnippet = {
    ...snippet,
    id,
    user_id: session.user.id,
    created_at: timestamp,
    updated_at: timestamp,
  };

  try {
    // First, sync with local DB
    await db.add('snippets', newSnippet);

    // Then, sync with Supabase
    const { data, error } = await supabase.from('snippets').insert([newSnippet]);

    if (error) {
      console.error('Supabase Insert Error:', {
        message: error.message,
        details: error.details,
        code: error.code,
        hint: error.hint,
        newSnippet
      });
      throw new Error(error.message);
    }

    console.log('Snippet added successfully', { data, newSnippet });
    return newSnippet;
  } catch (error) {
    console.error('Complete Error Adding Snippet:', error);
    throw error;
  }
}



export async function updateSnippet(
  id: string,
  snippet: Partial<Omit<SnippetDBSchema['snippets']['value'], 'id' | 'created_at' | 'updated_at' | 'user_id'>>
) {
  const db = await initDB();
  const existingSnippet = await db.get('snippets', id);
  if (!existingSnippet) throw new Error('Snippet not found');

  const updatedSnippet = {
    ...existingSnippet,
    ...snippet,
    updated_at: new Date().toISOString(),
  };

  await db.put('snippets', updatedSnippet);

  const { data: user } = await supabase.auth.getUser();
  if (!user) throw new Error("User not authenticated");

  await supabase
    .from('snippets')
    .update(updatedSnippet)
    .eq('id', id)
    .eq('user_id', user.id);
}


export async function deleteSnippet(id: string) {
  const db = await initDB();
  await db.delete('snippets', id);

  const { data: user } = await supabase.auth.getUser();
  if (user) {
    await supabase
      .from('snippets')
      .delete()
      .eq('id', id);
  }
}

export async function searchSnippets(query: string) {
  const db = await initDB();
  const snippets = await db.getAll('snippets');
  
  return snippets.filter(snippet => 
    snippet.title.toLowerCase().includes(query.toLowerCase()) ||
    snippet.description.toLowerCase().includes(query.toLowerCase()) ||
    snippet.tags.some(tag => tag.toLowerCase().includes(query.toLowerCase()))
  );
}

export async function getSnippetsByTag(tag: string) {
  const db = await initDB();
  const index = db.transaction('snippets').store.index('by-tags');
  return index.getAll(tag);
}