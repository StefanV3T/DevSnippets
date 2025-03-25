'use client';

import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';

interface TagFilterProps {
  tags: string[];
  selectedTag: string | null;
  onSelectTag: (tag: string | null) => void;
}

export function TagFilter({ tags, selectedTag, onSelectTag }: TagFilterProps) {
  return (
    <ScrollArea className="w-full">
      <div className="flex gap-2 pb-4">
        <Badge
          variant={selectedTag === null ? 'default' : 'outline'}
          className="cursor-pointer"
          onClick={() => onSelectTag(null)}
        >
          All
        </Badge>
        {tags.map((tag) => (
          <Badge
            key={tag}
            variant={selectedTag === tag ? 'default' : 'outline'}
            className="cursor-pointer"
            onClick={() => onSelectTag(tag)}
          >
            {tag}
          </Badge>
        ))}
      </div>
    </ScrollArea>
  );
}