'use client';

import { useState, useRef, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Tag, X } from 'lucide-react';

interface TagFilterProps {
  tags: string[];
  selectedTag: string | null;
  onSelectTag: (tag: string | null) => void;
}

export function TagFilter({ tags, selectedTag, onSelectTag }: TagFilterProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [scrollPosition, setScrollPosition] = useState(0);
  const selectedTagRef = useRef<HTMLDivElement>(null);
  
  // Remember scroll position before selection
  const handleTagClick = (tag: string) => {
    if (scrollContainerRef.current) {
      setScrollPosition(scrollContainerRef.current.scrollLeft);
    }
    
    onSelectTag(selectedTag === tag ? null : tag);
  };
  
  // Scroll to the selected tag when it changes
  useEffect(() => {
    if (selectedTag && scrollContainerRef.current && selectedTagRef.current) {
      // Get position of the selected tag element
      const container = scrollContainerRef.current;
      const selectedElement = selectedTagRef.current;
      const containerWidth = container.offsetWidth;
      const elementLeft = selectedElement.offsetLeft;
      
      // Scroll to center the selected tag
      container.scrollTo({
        left: Math.max(0, elementLeft - containerWidth / 2 + selectedElement.offsetWidth / 2),
        behavior: 'smooth'
      });
    }
  }, [selectedTag]);
  
  // Skip rendering if no tags
  if (tags.length === 0) return null;

  return (
    <div className="flex flex-col">
      {/* Tag scrolling area with touch-friendly sizing */}
      <div 
        ref={scrollContainerRef}
        className="flex items-center space-x-2 overflow-x-auto pb-2 pt-1 px-1 -mx-1"
        style={{ WebkitOverflowScrolling: 'touch', scrollbarWidth: 'none' }}
      >
        <Badge
          variant={selectedTag === null ? "secondary" : "outline"}
          className="cursor-pointer whitespace-nowrap py-1.5 px-3 text-sm"
          onClick={() => onSelectTag(null)}
        >
          <Tag className="mr-1.5 h-3.5 w-3.5" />
          All
        </Badge>
        
        {tags.map((tag) => (
          <div 
            key={tag}
            ref={selectedTag === tag ? selectedTagRef : null}
          >
            <Badge
              variant={selectedTag === tag ? "secondary" : "outline"}
              className={`cursor-pointer whitespace-nowrap py-1.5 px-3 text-sm transition-all ${
                selectedTag === tag ? "ring-1 ring-primary" : ""
              }`}
              onClick={() => handleTagClick(tag)}
            >
              {tag}
              {selectedTag === tag && (
                <button 
                  className="ml-1.5 rounded-full hover:bg-muted"
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectTag(null);
                  }}
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </Badge>
          </div>
        ))}
      </div>
      
      {/* Active filter indicator - more visible on mobile */}
      {selectedTag && (
        <div className="mt-2 flex items-center text-sm text-muted-foreground">
          <span className="font-medium">Active filter:</span>
          <Badge variant="secondary" className="ml-2 py-1 px-2.5">
            {selectedTag}
            <button 
              className="ml-1.5 rounded-full hover:bg-muted"
              onClick={() => onSelectTag(null)}
              aria-label="Clear filter"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </Badge>
        </div>
      )}
    </div>
  );
}