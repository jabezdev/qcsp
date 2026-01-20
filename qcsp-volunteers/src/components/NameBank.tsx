import { useVolunteerStore } from '@/store/volunteerStore';
import { PersonBadge } from './PersonBadge';
import { useDraggable, useDroppable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Search, ListFilter } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useState, useMemo } from 'react';
import { Person } from '@/types/volunteer';
import Fuse from 'fuse.js';
import { cn } from '@/lib/utils';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

function DraggablePerson({ person, count, disabled }: { person: Person, count: number, disabled?: boolean }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: `person-${person.id}`,
    data: { person, type: 'bank-item' },
    disabled
  });

  const style = transform ? {
    transform: CSS.Translate.toString(transform),
  } : undefined;

  if (isDragging) {
      return (
          <div ref={setNodeRef} style={style} className="opacity-30 p-1">
              <PersonBadge person={person} count={count} variant="bank" />
          </div>
      );
  }

  return (
    <div ref={setNodeRef} style={style} {...listeners} {...attributes} className={cn("cursor-grab active:cursor-grabbing p-1 touch-none", disabled && "cursor-default opacity-50")}>
      <PersonBadge person={person} count={count} variant="bank" />
    </div>
  );
}

export function NameBank() {
  const { people, assignments } = useVolunteerStore();
  const [filter, setFilter] = useState('');
  const [sortMethod, setSortMethod] = useState<'name-asc' | 'name-desc' | 'assignments-high' | 'assignments-low'>('name-asc');
  
  // Make the bank a droppable zone for deleting assignments
  const { setNodeRef, isOver } = useDroppable({
    id: 'volunteer-bank',
    data: { type: 'bank' }
  });

  const filteredPeople = useMemo(() => {
    let result = people;

    // Filter
    if (filter) {
      const fuse = new Fuse(people, {
        keys: ['nickname', 'fullName', 'email'],
        threshold: 0.5,
        ignoreLocation: true,
        findAllMatches: true,
      });
      result = fuse.search(filter).map(res => res.item);
    }

    // Sort
    return [...result].sort((a, b) => {
      const countA = assignments.filter(as => as.personId === a.id).length;
      const countB = assignments.filter(as => as.personId === b.id).length;

      switch (sortMethod) {
          case 'name-asc': return a.nickname.localeCompare(b.nickname);
          case 'name-desc': return b.nickname.localeCompare(a.nickname);
          case 'assignments-high': return countB - countA || a.nickname.localeCompare(b.nickname);
          case 'assignments-low': return countA - countB || a.nickname.localeCompare(b.nickname);
          default: return 0;
      }
    });

  }, [people, assignments, filter, sortMethod]);

  return (
    <div 
        ref={setNodeRef}
        className={cn(
            "flex flex-col h-full bg-background border-t border-border shadow-lg transition-colors",
            isOver && "bg-destructive/10 border-destructive/50"
        )}
    >
      {/* Header / Toolbar */}
      <div className="flex items-center gap-3 p-3 border-b border-border bg-card">
        <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search volunteers..."
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="pl-8 h-9"
            />
        </div>
        
        <div className="flex-1"></div>

        <Select value={sortMethod} onValueChange={(val: any) => setSortMethod(val)}>
            <SelectTrigger className="w-[180px] h-9">
                 <ListFilter className="w-4 h-4 mr-2" />
                 <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
                <SelectItem value="name-asc">Name (A-Z)</SelectItem>
                <SelectItem value="name-desc">Name (Z-A)</SelectItem>
                <SelectItem value="assignments-high">Most Assignments</SelectItem>
                <SelectItem value="assignments-low">Fewest Assignments</SelectItem>
            </SelectContent>
        </Select>
      </div>

      {/* Grid Content */}
      <div className="flex-1 overflow-hidden relative">
         <ScrollArea className="h-full w-full p-4">
            <div className="flex flex-wrap gap-2 pb-10">
                {filteredPeople.map(person => (
                    <DraggablePerson 
                        key={person.id} 
                        person={person} 
                        count={assignments.filter(a => a.personId === person.id).length}
                    />
                ))}
                {filteredPeople.length === 0 && (
                     <div className="w-full pt-10 text-center text-muted-foreground">
                         No volunteers found matching your search.
                     </div>
                )}
            </div>
            
            {isOver && (
                <div className="absolute inset-0 bg-destructive/10 backdrop-blur-[1px] flex items-center justify-center pointer-events-none z-10 border-2 border-dashed border-destructive/50 m-2 rounded-lg">
                    <div className="bg-destructive text-destructive-foreground px-4 py-2 rounded-md font-bold shadow-lg flex items-center gap-2">
                        <span>Drop to Remove Assignment</span>
                    </div>
                </div>
            )}
         </ScrollArea>
      </div>
    </div>
  );
}
