import { useState, useMemo } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useVolunteerStore } from '@/store/volunteerStore';
import { Users, Plus, Trash2, Check, X, Search, Mail, Pencil } from 'lucide-react';
import { PERSON_COLORS, Person, PersonColor } from '@/types/volunteer';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import Fuse from 'fuse.js';

const colorMap: Record<string, string> = {
  'quantum-cyan': 'bg-cyan-500',
  'quantum-purple': 'bg-purple-500',
  'quantum-blue': 'bg-blue-500',
  'quantum-teal': 'bg-teal-500',
  'quantum-pink': 'bg-pink-500',
  'quantum-orange': 'bg-orange-500',
  'quantum-green': 'bg-green-500',
  'quantum-yellow': 'bg-yellow-500',
};

const colorNames: Record<string, string> = {
  'quantum-cyan': 'Cyan',
  'quantum-purple': 'Purple',
  'quantum-blue': 'Blue',
  'quantum-teal': 'Teal',
  'quantum-pink': 'Pink',
  'quantum-orange': 'Orange',
  'quantum-green': 'Green',
  'quantum-yellow': 'Yellow',
};

function VolunteerCard({
  person,
  assignmentCount,
  onEdit,
  onDelete,
}: {
  person: Person;
  assignmentCount: number;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const color = PERSON_COLORS[person.colorIndex % PERSON_COLORS.length];
  const bgClass = colorMap[color] || 'bg-gray-500';

  return (
    <div className="group relative border rounded-lg p-4 bg-card hover:shadow-md transition-all">
      <div className="flex items-start gap-3">
        <div className={cn("w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm", bgClass)}>
          {person.nickname.slice(0, 2).toUpperCase()}
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-medium truncate">{person.fullName}</div>
          <div className="text-xs text-muted-foreground truncate flex items-center gap-1">
            <Mail className="w-3 h-3" />
            {person.email}
          </div>
        </div>
      </div>
      
      <div className="mt-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className={cn("px-2 py-0.5 rounded text-xs font-medium text-white", bgClass)}>
            {person.nickname}
          </span>
          {assignmentCount > 0 && (
            <span className="text-xs text-muted-foreground">
              {assignmentCount} assignment{assignmentCount !== 1 ? 's' : ''}
            </span>
          )}
        </div>
      </div>

      {/* Action buttons */}
      <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <Button size="icon" variant="ghost" className="h-7 w-7" onClick={onEdit}>
          <Pencil className="w-3 h-3" />
        </Button>
        <Button 
          size="icon" 
          variant="ghost" 
          className="h-7 w-7 text-destructive hover:text-destructive"
          onClick={() => {
            if (confirm(`Remove ${person.fullName} from volunteers?`)) {
              onDelete();
            }
          }}
        >
          <Trash2 className="w-3 h-3" />
        </Button>
      </div>
    </div>
  );
}

function AddEditForm({
  person,
  onSave,
  onCancel,
}: {
  person?: Person;
  onSave: (data: Omit<Person, 'id'>) => void;
  onCancel: () => void;
}) {
  const [nickname, setNickname] = useState(person?.nickname || '');
  const [fullName, setFullName] = useState(person?.fullName || '');
  const [email, setEmail] = useState(person?.email || '');
  const [colorIndex, setColorIndex] = useState(person?.colorIndex ?? 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nickname.trim() || !fullName.trim() || !email.trim()) return;
    onSave({
      nickname: nickname.trim(),
      fullName: fullName.trim(),
      email: email.trim(),
      colorIndex,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="border rounded-lg p-4 bg-accent/20 space-y-4">
      <div className="flex items-center gap-2 text-sm font-medium">
        {person ? <Pencil className="w-4 h-4 text-primary" /> : <Plus className="w-4 h-4 text-primary" />}
        {person ? 'Edit Volunteer' : 'Add Volunteer'}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="nickname" className="text-xs">Badge Name</Label>
          <Input
            id="nickname"
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            placeholder="e.g., JD"
            className="h-9"
            autoFocus
          />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs">Badge Color</Label>
          <div className="flex gap-1.5 flex-wrap">
            {PERSON_COLORS.map((color, idx) => (
              <button
                key={color}
                type="button"
                className={cn(
                  "w-7 h-7 rounded-full transition-all",
                  colorMap[color],
                  colorIndex === idx ? "ring-2 ring-offset-2 ring-primary scale-110" : "hover:scale-105"
                )}
                onClick={() => setColorIndex(idx)}
                title={colorNames[color]}
              />
            ))}
          </div>
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="fullName" className="text-xs">Full Name</Label>
        <Input
          id="fullName"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          placeholder="e.g., John Doe"
          className="h-9"
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="email" className="text-xs">Email Address</Label>
        <div className="relative">
          <Mail className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="john@example.com"
            className="h-9 pl-9"
          />
        </div>
      </div>

      <div className="flex gap-2 pt-2">
        <Button type="submit" size="sm">
          <Check className="w-3 h-3 mr-1" />
          {person ? 'Save Changes' : 'Add Volunteer'}
        </Button>
        <Button type="button" size="sm" variant="ghost" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  );
}

export function PeopleModal() {
  const { people, assignments, addPerson, updatePerson, deletePerson } = useVolunteerStore();
  const [isOpen, setIsOpen] = useState(false);
  const [filter, setFilter] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);

  // Search with fuzzy matching
  const filteredPeople = useMemo(() => {
    if (!filter.trim()) return people;
    const fuse = new Fuse(people, {
      keys: ['nickname', 'fullName', 'email'],
      threshold: 0.4,
      ignoreLocation: true,
    });
    return fuse.search(filter).map((r) => r.item);
  }, [people, filter]);

  // Get assignment count per person
  const getAssignmentCount = (personId: string) => {
    return assignments.filter((a) => a.personId === personId).length;
  };

  const handleAdd = (data: Omit<Person, 'id'>) => {
    addPerson(data);
    setIsAdding(false);
  };

  const handleEdit = (data: Omit<Person, 'id'>) => {
    if (editingId) {
      updatePerson(editingId, data);
      setEditingId(null);
    }
  };

  const editingPerson = editingId ? people.find((p) => p.id === editingId) : undefined;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Users className="w-4 h-4" />
          Volunteers
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-3xl w-full max-h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Users className="w-5 h-5 text-primary" />
            Volunteers
            <span className="text-sm font-normal text-muted-foreground ml-2">
              ({people.length} total)
            </span>
          </DialogTitle>
          <DialogDescription>
            Manage the people who can be assigned to committees and projects.
          </DialogDescription>
        </DialogHeader>

        {/* Search & Add */}
        <div className="flex gap-3 items-center">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search volunteers..."
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="pl-9"
            />
          </div>
          {!isAdding && !editingId && (
            <Button onClick={() => setIsAdding(true)} className="gap-2">
              <Plus className="w-4 h-4" />
              Add Volunteer
            </Button>
          )}
        </div>

        <ScrollArea className="flex-1 -mx-6 px-6">
          <div className="space-y-4 py-4">
            {/* Add Form */}
            {isAdding && (
              <AddEditForm
                onSave={handleAdd}
                onCancel={() => setIsAdding(false)}
              />
            )}

            {/* Edit Form */}
            {editingPerson && (
              <AddEditForm
                person={editingPerson}
                onSave={handleEdit}
                onCancel={() => setEditingId(null)}
              />
            )}

            {/* Volunteer Grid */}
            {filteredPeople.length > 0 ? (
              <div className="grid grid-cols-2 gap-3">
                {filteredPeople.map((person) => (
                  <VolunteerCard
                    key={person.id}
                    person={person}
                    assignmentCount={getAssignmentCount(person.id)}
                    onEdit={() => {
                      setIsAdding(false);
                      setEditingId(person.id);
                    }}
                    onDelete={() => deletePerson(person.id)}
                  />
                ))}
              </div>
            ) : filter ? (
              <div className="text-center py-12 text-muted-foreground">
                <Search className="w-12 h-12 mx-auto mb-3 opacity-20" />
                <p>No volunteers match "{filter}"</p>
              </div>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <Users className="w-12 h-12 mx-auto mb-3 opacity-20" />
                <p>No volunteers yet</p>
                <p className="text-sm">Click "Add Volunteer" to get started</p>
              </div>
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
