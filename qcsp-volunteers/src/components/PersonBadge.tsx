import { Person, PERSON_COLORS } from '@/types/volunteer';
import { useVolunteerStore } from '@/store/volunteerStore';
import { cn } from '@/lib/utils';

interface PersonBadgeProps {
  person: Person;
  assignmentId?: string;
  onRemove?: () => void;
  className?: string;
  count?: number;
  variant?: 'default' | 'bank' | 'matrix';
}

const colorClasses: Record<string, { bg: string; text: string; border: string; }> = {
  'quantum-cyan': {
    bg: 'bg-cyan-500 dark:bg-cyan-600',
    text: 'text-white dark:text-white',
    border: 'border-cyan-600 dark:border-cyan-500',
  },
  'quantum-purple': {
    bg: 'bg-purple-500 dark:bg-purple-600',
    text: 'text-white dark:text-white',
    border: 'border-purple-600 dark:border-purple-500',
  },
  'quantum-blue': {
    bg: 'bg-blue-500 dark:bg-blue-600',
    text: 'text-white dark:text-white',
    border: 'border-blue-600 dark:border-blue-500',
  },
  'quantum-teal': {
    bg: 'bg-teal-500 dark:bg-teal-600',
    text: 'text-white dark:text-white',
    border: 'border-teal-600 dark:border-teal-500',
  },
  'quantum-pink': {
    bg: 'bg-pink-500 dark:bg-pink-600',
    text: 'text-white dark:text-white',
    border: 'border-pink-600 dark:border-pink-500',
  },
  'quantum-orange': {
    bg: 'bg-orange-500 dark:bg-orange-600',
    text: 'text-white dark:text-white',
    border: 'border-orange-600 dark:border-orange-500',
  },
  'quantum-green': {
    bg: 'bg-green-500 dark:bg-green-600',
    text: 'text-white dark:text-white',
    border: 'border-green-600 dark:border-green-500',
  },
  'quantum-yellow': {
    bg: 'bg-yellow-500 dark:bg-yellow-600',
    text: 'text-white dark:text-white',
    border: 'border-yellow-600 dark:border-yellow-500',
  },
};

export function PersonBadge({ person, assignmentId, onRemove, className, count, variant = 'default' }: PersonBadgeProps) {
  const { setSelectedPerson, selectedPersonId, isAdmin, removeAssignment } = useVolunteerStore();
  const isSelected = selectedPersonId === person.id;
  const hasSelection = selectedPersonId !== null;
  const isOther = hasSelection && !isSelected;
  const color = PERSON_COLORS[person.colorIndex % PERSON_COLORS.length];
  const styles = colorClasses[color] || colorClasses['quantum-cyan'];

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedPerson(person.id === selectedPersonId ? null : person.id);
  };

  return (
    <div
      onClick={handleClick}
      className={cn(
        "relative group select-none transition-all duration-200",
        "flex items-center gap-2 px-3 py-1.5 rounded-sm border shadow-sm",
        "cursor-grab active:cursor-grabbing",
        // Width behavior: allow growth but fit content mostly.
        variant === 'matrix' ? 'w-auto max-w-[140px] justify-start text-left' : 'w-auto max-w-[180px]',
        styles.bg,
        styles.border,
        styles.text,
        isSelected && "ring-2 ring-primary ring-offset-2",
        isOther && "opacity-50 saturate-50",
        className
      )}
    >
      <span className={cn(
        "font-medium truncate",
        person.nickname.length > 8 ? "text-[11px]" : "text-xs"
      )}>
        {person.nickname}
      </span>
      
      {count !== undefined && count > 0 && (
        <span className="ml-auto flex shrink-0 h-4 min-w-4 items-center justify-center rounded-full bg-black/10 px-1 text-[9px] font-bold">
            {count}
        </span>
      )}

      {isAdmin && assignmentId && (
         <button
            onClick={(e) => {
                e.stopPropagation();
                if (onRemove) onRemove(); // Fallback
                removeAssignment(assignmentId);
            }}
             className="absolute -top-1 -right-1 opacity-0 group-hover:opacity-100 h-4 w-4 bg-destructive text-destructive-foreground rounded-full flex items-center justify-center hover:scale-110 transition-all z-20 shadow-sm"
         >
             <span className="text-[10px] font-bold leading-none pb-0.5">×</span>
         </button>
      )}
    </div>
  );
}
