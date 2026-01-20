import { useRef } from 'react';
import { Button } from '@/components/ui/button';
import { useVolunteerStore } from '@/store/volunteerStore';
import { Download, Upload } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { API_URL } from '@/lib/api';

export function DataManagement() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { people, committees, programs, assignments, fetchData } = useVolunteerStore();

  const handleExport = () => {
    const data = {
      people,
      committees,
      programs,
      assignments,
      exportedAt: new Date().toISOString(),
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `qcsp-volunteer-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      const data = JSON.parse(text);
      
      // Validate the data structure
      if (!data.people || !data.committees || !data.programs || !data.assignments) {
        throw new Error('Invalid backup file format');
      }

      // Send to server
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          people: data.people,
          committees: data.committees,
          programs: data.programs,
          assignments: data.assignments,
        }),
      });

      if (!response.ok) throw new Error('Failed to import data');
      
      // Refresh the store
      await fetchData();
      
      alert('Data imported successfully!');
    } catch (error) {
      console.error('Import error:', error);
      alert('Failed to import data. Please check the file format.');
    }
    
    // Reset the input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <>
      <input
        ref={fileInputRef}
        type="file"
        accept=".json"
        onChange={handleFileChange}
        className="hidden"
      />
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="h-8 gap-1.5">
            <Download className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Data</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={handleExport} className="gap-2">
            <Download className="h-4 w-4" />
            <span>Export Backup</span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleImportClick} className="gap-2">
            <Upload className="h-4 w-4" />
            <span>Import Backup</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
}
