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
import { Textarea } from '@/components/ui/textarea';
import { useVolunteerStore } from '@/store/volunteerStore';
import { FolderKanban, Plus, Trash2, Check, X, ChevronRight, ChevronDown, GripVertical, Layers } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ProgramTeam } from '@/types/volunteer';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay, 
  defaultDropAnimationSideEffects,
  DragEndEvent
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

// Sortable Project Card
function SortableProject({ 
  project, 
  onUpdate, 
  onDelete 
}: { 
  project: ProgramTeam;
  onUpdate: (id: string, data: Partial<ProgramTeam>) => void;
  onDelete: (id: string) => void;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(project.name);
  const [description, setDescription] = useState(project.description || '');

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: project.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const handleSave = () => {
    if (!name.trim()) return;
    onUpdate(project.id, { name: name.trim(), description: description.trim() || undefined });
    setIsEditing(false);
  };

  const handleCancel = () => {
    setName(project.name);
    setDescription(project.description || '');
    setIsEditing(false);
  };

  if (isEditing) {
    return (
      <div ref={setNodeRef} style={style} className="bg-accent/30 rounded-lg p-3 space-y-2">
        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Project name..."
          className="h-8"
          autoFocus
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleSave();
            if (e.key === 'Escape') handleCancel();
          }}
        />
        <Textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Description (optional)..."
          className="h-16 resize-none text-sm"
        />
        <div className="flex gap-2">
          <Button size="sm" variant="default" onClick={handleSave} className="h-7">
            <Check className="w-3 h-3 mr-1" /> Save
          </Button>
          <Button size="sm" variant="ghost" onClick={handleCancel} className="h-7">
            Cancel
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "group flex items-start gap-2 p-3 rounded-lg border bg-card hover:bg-accent/30 transition-colors cursor-pointer",
        isDragging && "opacity-50 z-50 relative"
      )}
      onClick={() => setIsEditing(true)}
    >
      <div
        {...attributes}
        {...listeners}
        className="cursor-grab active:cursor-grabbing mt-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
        onClick={(e) => e.stopPropagation()}
      >
        <GripVertical className="w-4 h-4 text-muted-foreground" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-primary/60 flex-shrink-0" />
          <span className="font-medium text-sm">{project.name}</span>
        </div>
        {project.description && (
          <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{project.description}</p>
        )}
      </div>
      <Button
        size="icon"
        variant="ghost"
        className="h-6 w-6 opacity-0 group-hover:opacity-100 text-destructive hover:text-destructive flex-shrink-0"
        onClick={(e) => {
          e.stopPropagation();
          if (confirm('Delete this project?')) {
            onDelete(project.id);
          }
        }}
      >
        <Trash2 className="w-3 h-3" />
      </Button>
    </div>
  );
}

// Program Group Component
function SortableProgramGroup({
  groupName,
  projects,
  onRenameGroup,
  onDeleteGroup,
  onUpdateProject,
  onDeleteProject,
  onAddProject,
  onReorderProjects,
}: {
  groupName: string;
  projects: ProgramTeam[];
  onRenameGroup: (oldName: string, newName: string) => void;
  onDeleteGroup: (groupName: string) => void;
  onUpdateProject: (id: string, data: Partial<ProgramTeam>) => void;
  onDeleteProject: (id: string) => void;
  onAddProject: (groupName: string) => void;
  onReorderProjects: (groupName: string, oldIndex: number, newIndex: number) => void;
}) {
  const [isEditingName, setIsEditingName] = useState(false);
  const [newGroupName, setNewGroupName] = useState(groupName);

  // Sortable for THE GROUP
  const {
      attributes,
      listeners,
      setNodeRef,
      transform,
      transition,
      isDragging,
    } = useSortable({ id: groupName });
  
  const style = {
      transform: CSS.Transform.toString(transform),
      transition,
      zIndex: isDragging ? 100 : 'auto',
      position: 'relative' as const,
  };

  // Sensors for INTERNAL projects list
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleRename = () => {
    if (newGroupName.trim() && newGroupName !== groupName) {
      onRenameGroup(groupName, newGroupName.trim());
    }
    setIsEditingName(false);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (active.id !== over?.id) {
      const oldIndex = projects.findIndex((p) => p.id === active.id);
      const newIndex = projects.findIndex((p) => p.id === over.id);
      onReorderProjects(groupName, oldIndex, newIndex);
    }
  };

  return (
    <AccordionItem 
      value={groupName} 
      ref={setNodeRef} 
      style={style}
      className={cn("border rounded-lg overflow-hidden bg-muted/20 mb-2", isDragging && "opacity-50")}
    >
      <div className="flex">
        <div 
           {...attributes} 
           {...listeners}
           className="flex items-center justify-center px-2 cursor-grab active:cursor-grabbing hover:bg-muted/40 border-r border-transparent hover:border-border transition-colors"
           onClick={(e) => e.stopPropagation()}
        >
             <GripVertical className="w-4 h-4 text-muted-foreground/50" />
        </div>
        <div className="flex-1">
            <AccordionTrigger className="px-4 py-3 hover:no-underline hover:bg-muted/30 group">
                <div className="flex items-center gap-3 flex-1 overflow-hidden">
                <FolderKanban className="w-5 h-5 text-primary flex-shrink-0" />
                {isEditingName ? (
                    <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                    <Input
                        value={newGroupName}
                        onChange={(e) => setNewGroupName(e.target.value)}
                        className="h-7 w-48"
                        autoFocus
                        onKeyDown={(e) => {
                        if (e.key === 'Enter') handleRename();
                        if (e.key === 'Escape') {
                            setNewGroupName(groupName);
                            setIsEditingName(false);
                        }
                        }}
                        onBlur={handleRename}
                    />
                    </div>
                ) : (
                    <span 
                    className="font-semibold cursor-text truncate"
                    onClick={(e) => {
                        e.stopPropagation();
                        setIsEditingName(true);
                    }}
                    title={groupName}
                    >
                    {groupName}
                    </span>
                )}
                <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full flex-shrink-0">
                    {projects.length}
                </span>
                </div>
                <Button
                size="icon"
                variant="ghost"
                className="h-7 w-7 opacity-0 group-hover:opacity-100 text-destructive hover:text-destructive mr-2 flex-shrink-0"
                onClick={(e) => {
                    e.stopPropagation();
                    if (confirm(`Delete program "${groupName}" and all its projects?`)) {
                    onDeleteGroup(groupName);
                    }
                }}
                >
                <Trash2 className="w-4 h-4" />
                </Button>
            </AccordionTrigger>
        </div>
      </div>
      
      <AccordionContent className="px-4 pb-4 bg-background/50">
        <div className="space-y-2 pt-2">
          {/* Internal DndContext for Projects */}
          <DndContext 
            id={`dnd-context-${groupName}`}
            sensors={sensors} 
            collisionDetection={closestCenter} 
            onDragEnd={handleDragEnd}
          >
            <SortableContext items={projects.map(p => p.id)} strategy={verticalListSortingStrategy}>
              {projects.map((project) => (
                <SortableProject
                  key={project.id}
                  project={project}
                  onUpdate={onUpdateProject}
                  onDelete={onDeleteProject}
                />
              ))}
            </SortableContext>
          </DndContext>
          
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start text-muted-foreground hover:text-primary mt-2"
            onClick={() => onAddProject(groupName)}
          >
            <Plus className="w-4 h-4 mr-2" />
            Add project to {groupName}
          </Button>
        </div>
      </AccordionContent>
    </AccordionItem>
  );
}

export function ProgramModal() {
  const { programs, addProgram, updateProgram, deleteProgram, setPrograms } = useVolunteerStore();
  const [isOpen, setIsOpen] = useState(false);
  const [newProgramName, setNewProgramName] = useState('');

  // Sensors for GROUPS
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  // Group programs by their group property
  const groupedPrograms = useMemo(() => {
    const groups: Record<string, ProgramTeam[]> = {};
    const ungrouped: ProgramTeam[] = [];
    const groupOrders: Record<string, number> = {};

    // First pass to find group orders
    programs.forEach(p => {
        if (p.group && p.groupOrder !== undefined) {
             // If multiple projects have different groupOrder for same group, take the first one found or min?
             // Ideally they are synced. We'll take the first defined one.
             if (groupOrders[p.group] === undefined) {
                 groupOrders[p.group] = p.groupOrder;
             }
        }
    });

    // Sort projects items by their internal 'order'
    const sortedProjects = [...programs].sort((a, b) => (a.order || 0) - (b.order || 0));

    sortedProjects.forEach((p) => {
      if (p.group) {
        if (!groups[p.group]) groups[p.group] = [];
        groups[p.group].push(p);
      } else {
        ungrouped.push(p);
      }
    });

    const groupNames = Object.keys(groups).sort((a, b) => {
         const orderA = groupOrders[a] ?? 9999;
         const orderB = groupOrders[b] ?? 9999;
         if (orderA !== orderB) return orderA - orderB;
         return a.localeCompare(b);
    });

    return { groups, ungrouped, groupNames };
  }, [programs]);

  const handleAddProgram = () => {
    if (!newProgramName.trim()) return;
    const group = newProgramName.trim();
    // Default groupOrder at the end
    const lastOrder = groupedPrograms.groupNames.length;
    addProgram({ name: 'New Project', group, groupOrder: lastOrder, order: 0 });
    setNewProgramName('');
  };

  const handleRenameGroup = (oldName: string, newName: string) => {
    programs.forEach((p) => {
      if (p.group === oldName) {
        updateProgram(p.id, { group: newName });
      }
    });
  };

  const handleDeleteGroup = (groupName: string) => {
    programs.forEach((p) => {
      if (p.group === groupName) {
        deleteProgram(p.id);
      }
    });
  };

  const handleAddProject = (groupName: string) => {
    // Determine last order
    const groupProjects = groupedPrograms.groups[groupName] || [];
    const maxOrder = Math.max(...groupProjects.map(p => p.order || 0), -1);
    
    // Determine groupOrder (from existing)
    const existing = groupProjects[0];
    const groupOrder = existing?.groupOrder;

    addProgram({ 
        name: 'New Project', 
        group: groupName, 
        order: maxOrder + 1,
        groupOrder
    });
  };

  const handleReorderProjects = (groupName: string, oldIndex: number, newIndex: number) => {
    const groupProjects = groupedPrograms.groups[groupName];
    const reordered = arrayMove(groupProjects, oldIndex, newIndex);
    
    const updatedPrograms = programs.map((p) => {
      if (p.group !== groupName) return p;
      const idx = reordered.findIndex((rp) => rp.id === p.id);
      if (idx !== -1) return { ...p, order: idx };
      return p;
    });
    
    setPrograms(updatedPrograms);
  };

  const handleReorderGroups = (event: DragEndEvent) => {
      const { active, over } = event;
      if (!over || active.id === over.id) return;

      const oldIndex = groupedPrograms.groupNames.indexOf(active.id);
      const newIndex = groupedPrograms.groupNames.indexOf(over.id);
      
      const newGroupNames = arrayMove(groupedPrograms.groupNames, oldIndex, newIndex);
      
      // Update ALL projects map
      const updatedPrograms = programs.map(p => {
          if (!p.group) return p;
          const newGroupOrder = newGroupNames.indexOf(p.group);
          if (newGroupOrder !== -1 && p.groupOrder !== newGroupOrder) {
              return { ...p, groupOrder: newGroupOrder };
          }
          return p;
      });

      setPrograms(updatedPrograms);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <FolderKanban className="w-4 h-4" />
          Programs
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-2xl w-full h-[85vh] flex flex-col overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <FolderKanban className="w-5 h-5 text-primary" />
            Programs & Projects
          </DialogTitle>
          <DialogDescription>
             Manage program teams and their projects. Drag to reorder groups and projects.
          </DialogDescription>
        </DialogHeader>

        <div className="flex gap-2 py-2">
          <Input 
            placeholder="New Program Name..." 
            value={newProgramName}
            onChange={(e) => setNewProgramName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAddProgram()}
          />
          <Button onClick={handleAddProgram} disabled={!newProgramName.trim()}>
            <Plus className="w-4 h-4 mr-2" /> Add Program
          </Button>
        </div>

        <ScrollArea className="flex-1 min-h-0 -mx-6 px-6 overflow-y-auto">
          <div className="space-y-3 py-4 pb-10">
            {/* Ungrouped Projects */}
            {groupedPrograms.ungrouped.length > 0 && (
              <div className="border rounded-lg p-4 bg-muted/10">
                <h4 className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
                  <Layers className="w-4 h-4" />
                  Standalone Projects (no program)
                </h4>
                <div className="space-y-2">
                  {groupedPrograms.ungrouped.map((project) => (
                    <SortableProject
                      key={project.id}
                      project={project}
                      onUpdate={updateProgram}
                      onDelete={deleteProgram}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Program Groups (Sortable) */}
             <DndContext 
                id="groups-dnd-context"
                sensors={sensors} 
                collisionDetection={closestCenter} 
                onDragEnd={handleReorderGroups}
             >
                <SortableContext items={groupedPrograms.groupNames} strategy={verticalListSortingStrategy}>
                    <Accordion type="multiple" defaultValue={groupedPrograms.groupNames} className="space-y-2">
                    {groupedPrograms.groupNames.map((groupName) => (
                        <SortableProgramGroup
                            key={groupName}
                            groupName={groupName}
                            projects={groupedPrograms.groups[groupName]}
                            onRenameGroup={handleRenameGroup}
                            onDeleteGroup={handleDeleteGroup}
                            onUpdateProject={updateProgram}
                            onDeleteProject={deleteProgram}
                            onAddProject={handleAddProject}
                            onReorderProjects={handleReorderProjects}
                        />
                    ))}
                    </Accordion>
                </SortableContext>
            </DndContext>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}