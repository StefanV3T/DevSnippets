'use client';

import { useState } from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Copy, Check, ChevronDown, ChevronUp } from 'lucide-react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";
import { vs } from "react-syntax-highlighter/dist/esm/styles/prism";
import { useTheme } from 'next-themes';
import { toast } from 'react-toastify';

interface SnippetCardProps {
  id: string;
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
  const [expanded, setExpanded] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    toast.success('Code copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  const toggleExpand = () => {
    setExpanded(!expanded);
  };

  // Get the correct language identifier for syntax highlighting
  const syntaxLanguage = LANGUAGE_MAP[language] || 'plaintext';
  const { theme: currentTheme } = useTheme();

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
        <div className="relative">
          {/* Code container with fixed height when collapsed */}
          <div 
            className="relative rounded-t-lg bg-muted overflow-hidden"
            style={{
              maxHeight: expanded ? 'none' : '150px',
            }}
          >
            {/* Copy button */}
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-2 top-2 z-10"
              onClick={handleCopy}
            >
              {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            </Button>
            
            {/* Syntax highlighter */}
            <SyntaxHighlighter 
              language={syntaxLanguage}  
              style={currentTheme === 'light' ? vs : vscDarkPlus}
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
            
            {/* Gradient fade when collapsed */}
            {!expanded && (
              <div 
                className="absolute bottom-0 left-0 right-0 h-24 pointer-events-none"
                style={{
                  background: currentTheme === 'light' 
                    ? 'linear-gradient(to top, rgba(241, 245, 249, 1) 20%, rgba(241, 245, 249, 0) 100%)'
                    : 'linear-gradient(to top, rgba(30, 30, 30, 1) 20%, rgba(30, 30, 30, 0) 100%)'
                }}
              />
            )}
          </div>
          
          {/* Expand/collapse button */}
          <Button 
            variant="secondary" 
            size="sm" 
            onClick={toggleExpand} 
            className="w-full flex items-center justify-center rounded-t-none border-t-0"
          >
            {expanded ? (
              <>Collapse <ChevronUp className="ml-1 h-4 w-4" /></>
            ) : (
              <>Expand <ChevronDown className="ml-1 h-4 w-4" /></>
            )}
          </Button>
        </div>
        
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