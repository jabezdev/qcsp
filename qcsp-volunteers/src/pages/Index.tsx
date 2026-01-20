import { useEffect, useState } from 'react';
import { AssignmentMatrix } from '@/components/AssignmentMatrix';
import { NameBank } from '@/components/NameBank';
import { CommitteeModal } from '@/components/modals/CommitteeModal';
import { ProgramModal } from '@/components/modals/ProgramModal';
import { PeopleModal } from '@/components/modals/PeopleModal';
import { AdminLoginModal } from '@/components/modals/AdminLoginModal';
import { ThemeToggle } from '@/components/ThemeToggle';
import { DataManagement } from '@/components/DataManagement';
import { useVolunteerStore } from '@/store/volunteerStore';
import { Sparkles, X, ChevronUp, ChevronDown } from 'lucide-react';
import { DndContext, DragOverlay, useSensor, useSensors, PointerSensor, defaultDropAnimationSideEffects, DropAnimation } from '@dnd-kit/core';
import { PersonBadge } from '@/components/PersonBadge';
import { Person } from '@/types/volunteer';
import { cn } from '@/lib/utils';

const dropAnimationConfig: DropAnimation = {
    sideEffects: defaultDropAnimationSideEffects({
        styles: {
            active: {
                opacity: '0',
            },
        },
    }),
};

const Index = () => {
  const { setSelectedPerson, selectedPersonId, people, fetchData, isLoading, addAssignment, removeAssignment, isAdmin, assignments } = useVolunteerStore();
  const selectedPerson = people.find(p => p.id === selectedPersonId);
  const [activeDragItem, setActiveDragItem] = useState<{ person: Person, type: 'bank-item' | 'assignment' } | null>(null);
  const [isBankOpen, setIsBankOpen] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const sensors = useSensors(useSensor(PointerSensor, {
    activationConstraint: { distance: 8 }
  }));

  const handleDragStart = (event: any) => {
      if (event.active.data.current) {
          setActiveDragItem({
              person: event.active.data.current.person,
              type: event.active.data.current.type
          });
      }
  };

  const handleDragEnd = (event: any) => {
      const { active, over } = event;
      setActiveDragItem(null);

      if (!over) return;

      const activeType = active.data.current?.type;
      const person = active.data.current?.person;

      // 1. Dropped into Matrix Cell
      if (over.data.current && over.data.current.committeeId && over.data.current.programId) {
          const { committeeId, programId } = over.data.current;
          
          if (person) {
              // If moving from another assignment, remove the old one first (or simulate move)
              // But keep it simple: Add new. If user wants to "move", they usually delete old one implicitly?
              // Standard behavior: Dragging from matrix = Move. Dragging from Bank = Copy/Add.
              
              if (activeType === 'assignment') {
                   const oldAssignmentId = active.data.current.assignmentId;
                   // Avoid duplicate if dropped on same cell? 
                   // The store might handle duplicates or we allow multiple roles.
                   // We'll remove old and add new.
                   if (oldAssignmentId) {
                       // Optimistic update order?
                       addAssignment({ personId: person.id, committeeId, programId });
                       removeAssignment(oldAssignmentId);
                   }
              } else {
                  // From Bank
                  addAssignment({ personId: person.id, committeeId, programId });
              }
          }
      } 
      
      // 2. Dropped into Volunteer Bank (Trash/Return)
      else if (over.id === 'volunteer-bank') {
          if (activeType === 'assignment') {
              const assignmentId = active.data.current.assignmentId;
              if (assignmentId) removeAssignment(assignmentId);
          }
      }
  };

  return (
    <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
    <div className="h-screen bg-background grid-pattern flex flex-col overflow-hidden">
      {/* Header - Fixed Height */}
      <header className="border-b border-border bg-card/80 backdrop-blur-sm z-50 flex-none h-[60px]">
        <div className="w-full px-4 h-full">
          <div className="flex items-center h-full">
            <div className="flex items-center gap-4">
              <div className="h-8 w-auto">
                <img src="/QCSP_Brandmark.png" alt="QCSP Logo" className="h-full object-contain" onError={(e) => {
                    e.currentTarget.style.display = 'none';
                    e.currentTarget.nextElementSibling?.classList.remove('hidden');
                }}/>
                <div className="hidden text-xl font-bold tracking-tighter text-primary">QCSP</div>
              </div>
              
               <div className="hidden md:block border-l pl-4 ml-4">
                 <h1 className="font-display font-semibold text-lg text-foreground">
                  QCSP Volunteer Matrix
                </h1>
              </div>
            </div>

            <div className="ml-auto flex items-center gap-2">
              
              {isAdmin && (
                <>
                  <DataManagement />
                  <CommitteeModal />
                  <ProgramModal />
                  <PeopleModal />
                </>
              )}
                            <ThemeToggle />              <AdminLoginModal />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content - Flex Column */}
      <main className="flex-1 flex flex-col overflow-hidden">
        
        {/* Matrix Area - Grows to fill available space */}
        <div className="flex-1 overflow-hidden p-4"> 
            <AssignmentMatrix />
        </div>

        {isAdmin && (
             <div className="relative flex-none shadow-[0_-5px_15px_-5px_rgba(0,0,0,0.1)] z-40 transition-all duration-300 ease-in-out" style={{ height: isBankOpen ? '300px' : '0px' }}>
                 <button 
                    onClick={() => setIsBankOpen(!isBankOpen)}
                    className="absolute -top-6 left-1/2 -translate-x-1/2 bg-white dark:bg-zinc-900 border border-border rounded-t-lg px-4 py-1 text-xs font-semibold shadow-sm z-50 flex items-center gap-2 hover:bg-muted/50"
                 >
                     {isBankOpen ? <ChevronDown className="w-3 h-3" /> : <ChevronUp className="w-3 h-3" />}
                     Volunteer Bank
                 </button>
                 <div className="h-full w-full overflow-hidden">
                    <NameBank />
                 </div>
             </div>
        )}

      </main>

      {/* Selected Person Toast */}
      {selectedPerson && (
        <div 
            className="fixed right-6 z-[60] animate-in slide-in-from-bottom-5 fade-in duration-300 pointer-events-none transition-all"
            style={{ bottom: isAdmin && isBankOpen ? '320px' : '24px' }}
        >
           <div className="bg-card text-card-foreground border border-border shadow-2xl rounded-xl p-4 flex items-start gap-4 min-w-[300px] pointer-events-auto">
              <div className="p-3 rounded-full bg-primary/10 text-primary mt-1">
                 <Sparkles className="w-5 h-5" />
              </div>
              <div className="flex-1 space-y-1">
                 <div className="flex items-center justify-between">
                     <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Selected Volunteer</p>
                     <button 
                        onClick={() => setSelectedPerson(null)}
                        className="text-muted-foreground hover:text-foreground transition-colors absolute top-4 right-4"
                    >
                        <X className="w-4 h-4" />
                    </button>
                 </div>
                 
                 <div>
                    <h3 className="font-bold text-lg leading-tight">{selectedPerson.fullName}</h3>
                    {isAdmin && <p className="text-sm text-muted-foreground">{selectedPerson.email}</p>}
                 </div>
                 
                 <div className="pt-2 flex items-center gap-2">
                    <span className={cn(
                        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent",
                        assignments.filter(a => a.personId === selectedPerson.id).length > 0 
                            ? "bg-primary text-primary-foreground shadow hover:bg-primary/80"
                            : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                    )}>
                        {assignments.filter(a => a.personId === selectedPerson.id).length} Active Assignments
                    </span>
                 </div>
              </div>
           </div>
        </div>
      )}

      <DragOverlay dropAnimation={dropAnimationConfig}>
          {activeDragItem ? (
              <div className="opacity-90 scale-105 pointer-events-none cursor-grabbing">
                  <PersonBadge 
                    person={activeDragItem.person} 
                    count={assignments.filter(a => a.personId === activeDragItem.person.id).length}
                    variant={activeDragItem.type === 'assignment' ? 'matrix' : 'bank'}
                    className="shadow-xl"
                  />
              </div>
          ) : null}
      </DragOverlay>

    </div>
    </DndContext>
  );
};

export default Index;
