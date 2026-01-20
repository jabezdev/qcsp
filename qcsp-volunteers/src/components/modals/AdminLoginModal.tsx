import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Lock, LogOut } from "lucide-react";
import { useVolunteerStore } from "@/store/volunteerStore";
import { useToast } from "@/hooks/use-toast";

export function AdminLoginModal() {
  const { isAdmin, setIsAdmin } = useVolunteerStore();
  const [isOpen, setIsOpen] = useState(false);
  const [password, setPassword] = useState("");
  const { toast } = useToast();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Simple hardcoded password for prototype
    if (password === "QCSPvolunteers2026") {
      setIsAdmin(true);
      setIsOpen(false);
      setPassword("");
      toast({
        title: "Logged in",
        description: "You now have write access.",
      });
    } else {
      toast({
        variant: "destructive",
        title: "Incorrect Password",
        description: "Please try again.",
      });
    }
  };

  const handleLogout = () => {
    setIsAdmin(false);
    toast({
      title: "Logged out",
      description: "You are now in read-only mode.",
    });
  };

  if (isAdmin) {
    return (
      <Button variant="outline" size="sm" onClick={handleLogout} className="gap-2">
        <LogOut className="h-4 w-4" />
        <span className="hidden sm:inline">Logout</span>
      </Button>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Lock className="h-4 w-4" />
          <span className="hidden sm:inline">Admin Access</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Admin Login</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleLogin} className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter admin password"
            />
          </div>
          <DialogFooter>
            <Button type="submit">Login</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
