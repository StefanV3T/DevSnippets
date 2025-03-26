'use client';

import { useEffect, useRef, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Editor from '@monaco-editor/react';
import { toast } from 'react-toastify';

interface AddEditSnippetDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (snippet: {
    title: string;
    description: string;
    code: string;
    language: string;
    tags: string[];
  }) => void;
  initialData?: {
    id: string;
    title: string;
    description: string;
    code: string;
    language: string;
    tags: string[];
  };
}

const LANGUAGES = [
  'JavaScript',
  'TypeScript',
  'Python',
  'Java',
  'C++',
  'Ruby',
  'Go',
  'Rust',
  'PHP',
  'HTML',
  'CSS',
  'SQL',
  'Shell',
];

const LANGUAGE_MAP: Record<string, string> = {
  JavaScript: 'javascript',
  TypeScript: 'typescript',
  Python: 'python',
  Java: 'java',
  'C++': 'cpp',
  Ruby: 'ruby',
  Go: 'go',
  Rust: 'rust',
  PHP: 'php',
  HTML: 'html',
  CSS: 'css',
  SQL: 'sql',
  Shell: 'shell',
};

declare global {
  interface Window {
    monaco?: typeof import('monaco-editor');
  }
}

export function AddEditSnippetDialog({
  isOpen,
  onOpenChange,
  onSubmit,
  initialData,
}: AddEditSnippetDialogProps) {
  const [id, setId] = useState(initialData?.id ?? '');
  const [title, setTitle] = useState(initialData?.title ?? '');
  const [description, setDescription] = useState(initialData?.description ?? '');
  const [code, setCode] = useState(initialData?.code ?? '');
  const [language, setLanguage] = useState(initialData?.language ?? '');
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState<string[]>(initialData?.tags ?? []);
  const editorRef = useRef<any>(null);

  useEffect(() => {
    if (initialData) {
      setId(initialData.id);
      setTitle(initialData.title);
      setDescription(initialData.description);
      setCode(initialData.code);
      setLanguage(initialData.language);
      setTags(initialData.tags);
    }
  }, [initialData]);

  // Effect to update the Monaco editor when language changes
  useEffect(() => {
    if (editorRef.current && language) {
      const model = editorRef.current.getModel();
      if (model) {
        const monacoLanguage = LANGUAGE_MAP[language] || 'plaintext';
        window.monaco?.editor.setModelLanguage(model, monacoLanguage);
      }
    }
  }, [language]);

  const handleEditorDidMount = (editor: any) => {
    editorRef.current = editor;
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ title, description, code, language, tags });
    toast.success(initialData ? 'Snippet updated successfully!' : 'Snippet created successfully!');
    onOpenChange(false);
    resetForm();
  };

  const handleAddTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput('');
    } else if (tags.includes(tagInput.trim())) {
      toast.info('Tag already exists');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter((tag) => tag !== tagToRemove));
  };

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setCode('');
    setLanguage('');
    setTags([]);
    setTagInput('');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{initialData ? 'Edit Snippet' : 'Add New Snippet'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter snippet title"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter snippet description"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="language">Language</Label>
            <Select value={language} onValueChange={setLanguage}>
              <SelectTrigger>
                <SelectValue placeholder="Select language" />
              </SelectTrigger>
              <SelectContent>
                {LANGUAGES.map((lang) => (
                  <SelectItem key={lang} value={lang}>
                    {lang}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="code">Code</Label>
            <Editor
              height="400px"
              defaultLanguage="javascript"
              language={LANGUAGE_MAP[language] || 'plaintext'}
              value={code}
              theme="vs-dark"
              onChange={(value) => setCode(value || "")}
              onMount={handleEditorDidMount}
              options={{
                minimap: { enabled: false },
                fontSize: 14,
                lineNumbers: "on",
                scrollBeyondLastLine: false,
                automaticLayout: true,
              }}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="tags">Tags</Label>
            <div className="flex gap-2">
              <Input
                id="tags"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                placeholder="Add tags"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddTag();
                  }
                }}
              />
              <Button type="button" onClick={handleAddTag}>
                Add
              </Button>
            </div>
            <div className="flex flex-wrap gap-2 pt-2">
              {tags.map((tag) => (
                <div
                  key={tag}
                  className="flex items-center gap-1 rounded-full bg-secondary px-3 py-1 text-sm"
                >
                  {tag}
                  <button
                    type="button"
                    onClick={() => removeTag(tag)}
                    className="ml-1 text-muted-foreground hover:text-foreground"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">{initialData ? 'Update' : 'Create'}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}