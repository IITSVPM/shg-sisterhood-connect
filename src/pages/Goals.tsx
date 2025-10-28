import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Plus, Target } from "lucide-react";
import { format } from "date-fns";

const Goals = () => {
  const [goals, setGoals] = useState<any[]>([]);
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    target_amount: "",
    current_amount: "",
    deadline: "",
  });

  useEffect(() => {
    fetchGoals();
  }, []);

  const fetchGoals = async () => {
    const { data } = await supabase
      .from("goals")
      .select("*")
      .order("created_at", { ascending: false });
    
    if (data) setGoals(data);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await supabase.from("goals").insert({
      title: formData.title,
      description: formData.description,
      target_amount: parseFloat(formData.target_amount),
      current_amount: formData.current_amount ? parseFloat(formData.current_amount) : 0,
      deadline: formData.deadline || null,
    });

    if (error) {
      toast.error("Failed to add goal");
    } else {
      toast.success("Goal added successfully!");
      setOpen(false);
      setFormData({ title: "", description: "", target_amount: "", current_amount: "", deadline: "" });
      fetchGoals();
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Goals Management</h1>
            <p className="text-muted-foreground">Set and track community goals</p>
          </div>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="w-4 h-4" />
                Add Goal
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Goal</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label>Goal Title</Label>
                  <Input
                    placeholder="Enter goal title"
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Description</Label>
                  <Textarea
                    placeholder="Enter description"
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Target Amount (₹)</Label>
                  <Input
                    type="number"
                    placeholder="Enter target amount"
                    value={formData.target_amount}
                    onChange={(e) => setFormData({...formData, target_amount: e.target.value})}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Current Amount (₹)</Label>
                  <Input
                    type="number"
                    placeholder="Enter current amount"
                    value={formData.current_amount}
                    onChange={(e) => setFormData({...formData, current_amount: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Deadline</Label>
                  <Input
                    type="date"
                    value={formData.deadline}
                    onChange={(e) => setFormData({...formData, deadline: e.target.value})}
                  />
                </div>
                <Button type="submit" className="w-full">Add Goal</Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {goals.map((goal) => {
            const progress = (Number(goal.current_amount) / Number(goal.target_amount)) * 100;
            const remaining = Number(goal.target_amount) - Number(goal.current_amount);
            const daysLeft = goal.deadline 
              ? Math.ceil((new Date(goal.deadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
              : null;

            return (
              <Card key={goal.id}>
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-lg bg-success/10 flex items-center justify-center">
                      <Target className="w-6 h-6 text-success" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{goal.title}</CardTitle>
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                        goal.status === 'active' 
                          ? 'bg-primary/10 text-primary' 
                          : goal.status === 'achieved'
                          ? 'bg-success/10 text-success'
                          : 'bg-muted text-muted-foreground'
                      }`}>
                        {goal.status}
                      </span>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {goal.description && (
                    <p className="text-sm text-muted-foreground">{goal.description}</p>
                  )}
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm font-medium">Progress</span>
                      <span className="text-sm text-muted-foreground">{Math.round(progress)}%</span>
                    </div>
                    <Progress value={progress} className="h-2" />
                    <p className="text-xs text-muted-foreground mt-2">
                      ₹{Number(goal.current_amount).toLocaleString()} of ₹{Number(goal.target_amount).toLocaleString()}
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                    <div>
                      <p className="text-xl font-bold text-success">₹{remaining.toLocaleString()}</p>
                      <p className="text-xs text-muted-foreground">Remaining</p>
                    </div>
                    {daysLeft !== null && (
                      <div>
                        <p className="text-xl font-bold text-warning">{daysLeft} days</p>
                        <p className="text-xs text-muted-foreground">Time left</p>
                      </div>
                    )}
                  </div>
                  {goal.deadline && (
                    <p className="text-xs text-muted-foreground">
                      Deadline: {format(new Date(goal.deadline), "MMM dd, yyyy")}
                    </p>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Goals;
