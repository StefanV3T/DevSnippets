import { NextResponse } from 'next/server';
import { getAllSnippets, addSnippet, updateSnippet, deleteSnippet, searchSnippets, getSnippetsByTag } from '../../../lib/db';
import { cookies } from 'next/headers';

// GET - Get all snippets
export async function GET() {
  try {
    const snippets = await getAllSnippets();
    return NextResponse.json(snippets, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch snippets', message: error }, { status: 500 });
  }
}

// POST - Add a new snippet
export async function POST(request: Request) {
  const snippet = await request.json();
  try {
    const newSnippet = await addSnippet(snippet);
    return NextResponse.json(newSnippet, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to add snippet' }, { status: 500 });
  }
}

// PUT - Update an existing snippet
export async function PUT(request: Request) {
  const { id, snippet } = await request.json();
  try {
    await updateSnippet(id, snippet);
    return NextResponse.json({ message: 'Snippet updated successfully' }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update snippet' }, { status: 500 });
  }
}

// DELETE - Delete a snippet
export async function DELETE(request: Request) {
  const { id } = await request.json();
  try {
    await deleteSnippet(id);
    return NextResponse.json({ message: 'Snippet deleted successfully' }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete snippet' }, { status: 500 });
  }
}

// GET - Search snippets
export async function search(request: Request) {
  const { query } = new URL(request.url);
  try {
    const snippets = await searchSnippets(query);
    return NextResponse.json(snippets, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to search snippets' }, { status: 500 });
  }
}

// GET - Get snippets by tag
export async function getByTag(request: Request) {
  const { tag } = new URL(request.url).searchParams;
  try {
    const snippets = await getSnippetsByTag(tag);
    return NextResponse.json(snippets, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch snippets by tag' }, { status: 500 });
  }
}
