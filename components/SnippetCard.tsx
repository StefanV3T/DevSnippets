'use client';

import { useState } from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Copy, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";

interface SnippetCardProps {
  title: string;
  description: string;
  code: string;
  language: string;
  tags: string[];
  onEdit?: () => void;
  onDelete?: () => void;
}

// Language mapping to ensure correct syntax highlighting
const LANGUAGE_MAP: Record<string, string> = {
  'JavaScript': 'javascript',
  'TypeScript': 'typescript',
  'Python': 'python',
  'Java': 'java',
  'C++': 'cpp',
  'Ruby': 'ruby',
  'Go': 'go',
  'Rust': 'rust',
  'PHP': 'php',
  'HTML': 'html',
  'CSS': 'css',
  'SQL': 'sql',
  'Shell': 'bash'
};

export function SnippetCard({
  title,
  description,
  code,
  language,
  tags,
  onEdit,
  onDelete,
}: SnippetCardProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Get the correct language identifier for syntax highlighting
  const syntaxLanguage = LANGUAGE_MAP[language] || 'plaintext';

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>{title}</span>
          <Badge variant="secondary">{language}</Badge>
        </CardTitle>
        <p className="text-sm text-muted-foreground">{description}</p>
      </CardHeader>
      <CardContent>
        <pre className="relative rounded-lg bg-muted p-4">
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-2 top-2"
            onClick={handleCopy}
          >
            {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
          </Button>
          <SyntaxHighlighter 
            language={syntaxLanguage}  
            style={vscDarkPlus}
            className="!bg-[#1e1e1e]/10 !mt-0 !mb-0"
            customStyle={{
              margin: 0,
              padding: "1rem",
            }}
            lineProps={{
              style: {
                wordBreak: "break-all",
                whiteSpace: "pre-wrap",
              },
            }}
            wrapLines={true}
          >
            {code}
          </SyntaxHighlighter>
        </pre>
        <div className="mt-4 flex flex-wrap gap-2">
          {tags.map((tag) => (
            <Badge key={tag} variant="outline">
              {tag}
            </Badge>
          ))}
        </div>
      </CardContent>
      {(onEdit || onDelete) && (
        <CardFooter className="flex justify-end gap-2">
          {onEdit && (
            <Button variant="outline" size="sm" onClick={onEdit}>
              Edit
            </Button>
          )}
          {onDelete && (
            <Button variant="destructive" size="sm" onClick={onDelete}>
              Delete
            </Button>
          )}
        </CardFooter>
      )}
    </Card>
  );
}