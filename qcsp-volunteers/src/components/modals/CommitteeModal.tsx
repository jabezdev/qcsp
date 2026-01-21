import { useState } from 'react';
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
import { useVolunteerStore } from '@/store/volunteerStore';
import { Users, Plus, Trash2, Check, X, GripVertical } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { FunctionalCommittee } from '@/types/volunteer';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

function SortableRow({ 
  committee, 
  onUpdate, 
  onDelete 
}: { 
  committee: FunctionalCommittee;
  onUpdate: (id: string, data: Partial<FunctionalCommittee>) => void;
  onDelete: (id: string) => void;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(committee.name);
  const [description, setDescription] = useState(committee.description || '');

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: committee.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const handleSave = () => {
    if (!name.trim()) return;
    onUpdate(committee.id, { name: name.trim(), description: description.trim() || undefined });
    setIsEditing(false);
  };

  const handleCancel = () => {
    setName(committee.name);
    setDescription(committee.description || '');
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSave();
    if (e.key === 'Escape') handleCancel();
  };

  if (isEditing) {
    return (
      <TableRow ref={setNodeRef} style={style} className="bg-accent/30">
        <TableCell className="w-10">
          <div className="w-6" />
        </TableCell>
        <TableCell>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={handleKeyDown}
            className="h-8"
            autoFocus
          />
        </TableCell>
        <TableCell>
          <Input
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            onKeyDown={handleKeyDown}
            className="h-8"
            placeholder="Optional description..."
          />
        </TableCell>
        <TableCell className="w-24">
          <div className="flex gap-1">
            <Button size="icon" variant="ghost" className="h-7 w-7 text-green-600" onClick={handleSave}>
              <Check className="w-4 h-4" />
            </Button>
            <Button size="icon" variant="ghost" className="h-7 w-7" onClick={handleCancel}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        </TableCell>
      </TableRow>
    );
  }

  return (
    <TableRow 
      ref={setNodeRef} 
      style={style}
      className={cn(
        "group cursor-pointer hover:bg-muted/50 transition-colors",
        isDragging && "opacity-50 bg-muted"
      )}
      onClick={() => setIsEditing(true)}
    >
      <TableCell className="w-10">
        <div 
          {...attributes} 
          {...listeners}
          className="cursor-grab active:cursor-grabbing p-1 opacity-0 group-hover:opacity-100 transition-opacity"
          onClick={(e) => e.stopPropagation()}
        >
          <GripVertical className="w-4 h-4 text-muted-foreground" />
        </div>
      </TableCell>
      <TableCell className="font-medium">{committee.name}</TableCell>
      <TableCell className="text-muted-foreground">{committee.description || '—'}</TableCell>
      <TableCell className="w-24">
        <Button 
          size="icon" 
          variant="ghost" 
          className="h-7 w-7 opacity-0 group-hover:opacity-100 text-destructive hover:text-destructive"
          onClick={(e) => {
            e.stopPropagation();
            if (confirm('Delete this committee? All related assignments will be removed.')) {
              onDelete(committee.id);
            }
          }}
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </TableCell>
    </TableRow>
  );
}

export function CommitteeModal() {
  const { committees, addCommittee, updateCommittee, deleteCommittee, setCommittees } = useVolunteerStore();
  const [isOpen, setIsOpen] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [newName, setNewName] = useState('');
  const [newDescription, setNewDescription] = useState('');

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = (event: any) => {
    const { active, over } = event;
    if (active.id !== over?.id) {
      const oldIndex = committees.findIndex((c) => c.id === active.id);
      const newIndex = committees.findIndex((c) => c.id === over.id);
      setCommittees(arrayMove(committees, oldIndex, newIndex));
    }
  };

  const handleAdd = () => {
    if (!newName.trim()) return;
    addCommittee({ name: newName.trim(), description: newDescription.trim() || undefined });
    setNewName('');
    setNewDescription('');
    setIsAdding(false);
  };

  const handleAddKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleAdd();
    if (e.key === 'Escape') {
      setIsAdding(false);
      setNewName('');
      setNewDescription('');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Users className="w-4 h-4" />
          Committees
        </Button>
      </DialogTrigger>
      
      <DialogContent className="max-w-2xl w-full h-[85vh] flex flex-col overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Users className="w-5 h-5 text-primary" />
            Functional Committees
          </DialogTitle>
          <DialogDescription>
            Committees represent the rows in your volunteer matrix. Click a row to edit, drag to reorder.
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="flex-1 min-h-0 mt-4 -mx-6 px-6 overflow-y-auto">
          <div className="border rounded-lg overflow-hidden mb-10">
            <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead className="w-10"></TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Description</TableHead>
                <TableHead className="w-24"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                <SortableContext items={committees.map(c => c.id)} strategy={verticalListSortingStrategy}>
                  {committees.map((committee) => (
                    <SortableRow
                      key={committee.id}
                      committee={committee}
                      onUpdate={updateCommittee}
                      onDelete={deleteCommittee}
                    />
                  ))}
                </SortableContext>
              </DndContext>
              
              {isAdding ? (
                <TableRow className="bg-primary/5">
                  <TableCell className="w-10">
                    <Plus className="w-4 h-4 text-primary" />
                  </TableCell>
                  <TableCell>
                    <Input
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                      onKeyDown={handleAddKeyDown}
                      placeholder="Committee name..."
                      className="h-8"
                      autoFocus
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      value={newDescription}
                      onChange={(e) => setNewDescription(e.target.value)}
                      onKeyDown={handleAddKeyDown}
                      placeholder="Optional description..."
                      className="h-8"
                    />
                  </TableCell>
                  <TableCell className="w-24">
                    <div className="flex gap-1">
                      <Button size="icon" variant="ghost" className="h-7 w-7 text-green-600" onClick={handleAdd}>
                        <Check className="w-4 h-4" />
                      </Button>
                      <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => {
                        setIsAdding(false);
                        setNewName('');
                        setNewDescription('');
                      }}>
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                <TableRow 
                  className="cursor-pointer hover:bg-muted/30 transition-colors"
                  onClick={() => setIsAdding(true)}
                >
                  <TableCell colSpan={4}>
                    <div className="flex items-center gap-2 text-muted-foreground py-1">
                      <Plus className="w-4 h-4" />
                      <span className="text-sm">Add committee...</span>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {committees.length === 0 && !isAdding && (
          <div className="text-center py-8 text-muted-foreground">
            <Users className="w-12 h-12 mx-auto mb-3 opacity-20" />
            <p>No committees yet</p>
            <p className="text-sm">Click "Add committee" to create your first one</p>
          </div>
        )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
