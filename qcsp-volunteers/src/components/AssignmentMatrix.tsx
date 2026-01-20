import { useState, useMemo } from 'react';
import { useVolunteerStore } from '@/store/volunteerStore';
import { PersonBadge } from './PersonBadge';
import { cn } from '@/lib/utils';
import { ChevronRight, ChevronDown, Layers, Users, FolderKanban, ArrowRight, ArrowDown } from 'lucide-react';
import { useDroppable, useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';

export function AssignmentMatrix() {
  const { committees, programs, assignments, people, removeAssignment, isAdmin } = useVolunteerStore();
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({});

  // 1. Prepare Data Structure
  const { groups, groupOrder } = useMemo(() => {
      const g: Record<string, typeof programs> = {};
      const order: string[] = [];
      
      // Sort programs by name first to ensure consistent order within groups
      const sortedPrograms = [...programs].sort((a, b) => a.name.localeCompare(b.name));

      sortedPrograms.forEach(p => {
          const groupName = p.group || 'Ungrouped';
          if (!g[groupName]) {
              g[groupName] = [];
              order.push(groupName);
          }
          g[groupName].push(p);
      });
      
      return { groups: g, groupOrder: order };
  }, [programs]);

  // 2. Calculate Visible Columns
  const visibleColumns = useMemo(() => {
      const cols: { id: string, type: 'project' | 'placeholder', name: string, group: string, description?: string, projectNames?: string[], originalId?: string }[] = [];
      
      groupOrder.forEach(gName => {
          if (expandedGroups[gName]) {
              groups[gName].forEach(p => {
                  cols.push({ 
                      id: p.id, 
                      type: 'project', 
                      name: p.name, 
                      group: gName,
                      description: p.description
                  });
              });
          } else {
              // Placeholder for collapsed group - include project names for display
              const groupProjects = groups[gName] || [];
              cols.push({ 
                  id: `group-${gName}`, 
                  type: 'placeholder', 
                  name: gName, 
                  group: gName,
                  projectNames: groupProjects.map(p => p.name)
              });
          }
      });
      return cols;
  }, [groups, groupOrder, expandedGroups]);

  // 3. Grid Template
  // Left col: 250px (Committee Name)
  // Data cols: minmax(140px, 1fr) for projects, 60px for placeholders?
  // User said "Do not make the columns fit the space. It's okay to scroll horizontally."
  // So we use fixed width or min-content.
  const getColWidth = (type: string) => type === 'placeholder' ? '240px' : '160px';
  
  const gridTemplateColumns = `220px ${visibleColumns.map(c => getColWidth(c.type)).join(' ')}`;

  const toggleGroup = (group: string) => {
      setExpandedGroups(prev => ({
          ...prev,
          [group]: !prev[group]
      }));
  };

  // Helper to get assignments
  const getAssignments = (committeeId: string, programId: string) => {
    return assignments.filter(
      (a) => a.committeeId === committeeId && a.programId === programId
    );
  };

  return (
    <div className="flex flex-col h-full bg-background border rounded-lg shadow-sm overflow-hidden select-none">
      
      {/* Scrollable Container */}
      <div className="flex-1 overflow-auto relative custom-scrollbar">
         <div className="grid w-max" style={{ gridTemplateColumns }}>
             
             {/* --- HEADER ROW 1: GROUPS --- */}
             <div className="sticky top-0 left-0 col-start-1 row-start-1 z-50 bg-card border-b border-r border-border h-10 flex items-center px-4 text-xs font-medium text-muted-foreground">
                 <div className="flex items-center gap-2">
                    <FolderKanban className="w-4 h-4" />
                    <span>Program Teams</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                 </div>
             </div>

             {groupOrder.map((gName, idx) => {
                 const isExpanded = !!expandedGroups[gName];
                 const span = isExpanded ? groups[gName].length : 1;
                 const groupProjects = groups[gName] || [];
                 // We need to calculate the grid-column-start index properly
                 // Previous groups' spans override this.
                 // Actually relying on auto-flow with span is easier.
                 
                 return (
                     <div 
                        key={gName} 
                        className={cn(
                            "sticky top-0 z-40 border-b border-r border-border h-10 flex items-center justify-center px-2 transition-colors cursor-pointer hover:bg-muted/50 text-sm font-medium",
                            isExpanded ? "bg-accent/20 backdrop-blur-md bg-card/80" : "bg-card"
                        )}
                        style={{ gridColumn: `span ${span}` }}
                        onClick={() => toggleGroup(gName)}
                     >
                        <div className="flex items-center gap-1.5 overflow-hidden justify-center w-full">
                            {isExpanded ? <ChevronDown className="w-3.5 h-3.5 opacity-50 flex-none" /> : <ChevronRight className="w-3.5 h-3.5 opacity-50 flex-none" />}
                            <span className="truncate font-semibold" title={gName}>{gName}</span>
                            {!isExpanded && (
                                <span className="text-[10px] bg-muted text-muted-foreground px-1.5 rounded-full flex-none">
                                    {groupProjects.length}
                                </span>
                            )}
                        </div>
                     </div>
                 );
             })}


             {/* --- HEADER ROW 2: PROJECTS --- */}
             {/* Empty cell for top-left intersection row 2 */}
             <div className="sticky top-10 left-0 z-50 bg-card border-b border-r border-border min-h-[56px] flex items-center px-4 text-xs font-medium text-muted-foreground">
                 <div className="flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    <span>Functional Committees</span>
                    <ArrowDown className="w-3.5 h-3.5" />
                 </div>
             </div>

             {visibleColumns.map((col, idx) => {
                 if (col.type === 'placeholder') {
                     return (
                         <div 
                             key={`h-${col.id}`} 
                             className="sticky top-10 z-40 min-h-[56px] border-b border-r border-border bg-muted/10 flex items-center justify-center backdrop-blur-md px-2 py-1"
                         >
                            {col.projectNames && col.projectNames.length > 0 ? (
                                <span className="text-[10px] text-muted-foreground text-center line-clamp-3" title={col.projectNames.join(', ')}>
                                    {col.projectNames.join(', ')}
                                </span>
                            ) : (
                                <div className="w-1 h-6 rounded-full bg-border/50" />
                            )}
                         </div>
                     );
                 }
                 return (
                     <div 
                         key={`h-${col.id}`} 
                         className="sticky top-10 z-40 min-h-[56px] px-2 py-1.5 border-b border-r border-border bg-card flex flex-col items-center justify-center text-center group hover:bg-accent/5 backdrop-blur-md"
                     >
                         <span className="text-xs font-medium leading-tight line-clamp-2" title={col.name}>
                             {col.name}
                         </span>
                         {col.description && (
                             <span className="text-[10px] text-muted-foreground leading-tight line-clamp-2 mt-0.5" title={col.description}>
                                 {col.description}
                             </span>
                         )}
                     </div>
                 );
             })}


             {/* --- DATA ROWS --- */}
             {committees.map(committee => (
                 <>
                    {/* Row Header (Sticky Left) */}
                    <div 
                        key={`row-${committee.id}`} 
                        className="sticky left-0 z-30 bg-card border-b border-r border-border px-4 py-2 min-h-[48px] flex flex-col justify-center"
                    >
                        <div className="font-semibold text-sm">{committee.name}</div>
                        {committee.description && (
                            <div className="text-[11px] text-muted-foreground line-clamp-2 mt-0.5 leading-tight">
                                {committee.description}
                            </div>
                        )}
                    </div>

                    {/* Cells */}
                    {visibleColumns.map(col => {
                        if (col.type === 'placeholder') {
                             const groupPrograms = groups[col.group] || [];
                             const groupProgramIds = groupPrograms.map(p => p.id);
                             const groupAssignments = assignments.filter(
                                a => a.committeeId === committee.id && groupProgramIds.includes(a.programId)
                             );

                             // Deduplicate people in placeholder cell
                             const uniquePeopleInGroup = Array.from(new Set(groupAssignments.map(a => a.personId)))
                                .map(id => people.find(p => p.id === id))
                                .filter(Boolean);

                             return (
                                 <div 
                                    key={`cell-${committee.id}-${col.id}`} 
                                    className="bg-muted/5 border-b border-r border-border min-h-[48px] p-2 flex flex-wrap content-start gap-1" 
                                 >
                                     {uniquePeopleInGroup.map(person => {
                                        if (!person) return null;
                                        return (
                                            <div key={person.id} className="opacity-80">
                                                <PersonBadge person={person} variant="matrix" className="h-6 text-[10px] px-1.5" />
                                            </div>
                                        );
                                     })}
                                 </div>
                             );
                        }

                        // Droppable Cell
                        return (
                            <MatrixCell 
                                key={`cell-${committee.id}-${col.id}`}
                                committeeId={committee.id}
                                programId={col.id}
                                assignments={getAssignments(committee.id, col.id)}
                                people={people}
                            />
                        );
                    })}
                 </>
             ))}
         </div>
      </div>
    </div>
  );
}

// Droppable Cell Component
function MatrixCell({ committeeId, programId, assignments, people }: { 
    committeeId: string, 
    programId: string, 
    assignments: any[], 
    people: any[] 
}) {
    const { isOver, setNodeRef } = useDroppable({
        id: `cell-${committeeId}-${programId}`,
        data: { committeeId, programId }
    });

    return (
        <div
            ref={setNodeRef}
            className={cn(
                "min-h-[48px] border-b border-r border-border p-2 transition-colors flex flex-wrap content-start gap-1.5",
                isOver ? "bg-primary/10" : "bg-card hover:bg-accent/5"
            )}
        >
            {assignments.map(assignment => {
                const person = people.find(p => p.id === assignment.personId);
                if (!person) return null;
                return (
                    <DraggableAssignment 
                        key={assignment.id} 
                        assignmentId={assignment.id} 
                        person={person} 
                    />
                );
            })}
        </div>
    );
}

function DraggableAssignment({ person, assignmentId }: { person: any, assignmentId: string }) {
    const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
        id: `assignment-${assignmentId}`,
        data: { type: 'assignment', assignmentId, person }
    });

    const style = transform ? {
        transform: CSS.Translate.toString(transform),
    } : undefined;

    if (isDragging) {
        return (
            <div ref={setNodeRef} style={style} className="opacity-30">
                <PersonBadge person={person} variant="matrix"/>
            </div>
        );
    }

    return (
        <div ref={setNodeRef} style={style} {...listeners} {...attributes} className="cursor-grab active:cursor-grabbing touch-none">
            <PersonBadge person={person} assignmentId={assignmentId} variant="matrix" />
        </div>
    );
}
