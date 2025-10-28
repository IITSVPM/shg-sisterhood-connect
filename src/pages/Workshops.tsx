import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Plus, Calendar, MapPin, User } from "lucide-react";
import { format } from "date-fns";

const Workshops = () => {
  const [workshops, setWorkshops] = useState<any[]>([]);
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    date: "",
    time: "",
    location: "",
    facilitator: "",
    max_participants: "",
  });

  useEffect(() => {
    fetchWorkshops();
  }, []);

  const fetchWorkshops = async () => {
    const { data } = await supabase
      .from("workshops")
      .select("*")
      .order("date", { ascending: true });
    
    if (data) setWorkshops(data);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await supabase.from("workshops").insert({
      title: formData.title,
      description: formData.description,
      date: formData.date,
      time: formData.time,
      location: formData.location,
      facilitator: formData.facilitator,
      max_participants: formData.max_participants ? parseInt(formData.max_participants) : null,
    });

    if (error) {
      toast.error("Failed to add workshop");
    } else {
      toast.success("Workshop added successfully!");
      setOpen(false);
      setFormData({ title: "", description: "", date: "", time: "", location: "", facilitator: "", max_participants: "" });
      fetchWorkshops();
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Workshops Management</h1>
            <p className="text-muted-foreground">Organize and track skill development workshops</p>
          </div>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="w-4 h-4" />
                Add Workshop
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Workshop</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label>Title</Label>
                  <Input
                    placeholder="Enter workshop title"
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
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Date</Label>
                    <Input
                      type="date"
                      value={formData.date}
                      onChange={(e) => setFormData({...formData, date: e.target.value})}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Time</Label>
                    <Input
                      type="time"
                      value={formData.time}
                      onChange={(e) => setFormData({...formData, time: e.target.value})}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Location</Label>
                  <Input
                    placeholder="Enter location"
                    value={formData.location}
                    onChange={(e) => setFormData({...formData, location: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Facilitator</Label>
                  <Input
                    placeholder="Enter facilitator name"
                    value={formData.facilitator}
                    onChange={(e) => setFormData({...formData, facilitator: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Max Participants</Label>
                  <Input
                    type="number"
                    placeholder="Enter max participants"
                    value={formData.max_participants}
                    onChange={(e) => setFormData({...formData, max_participants: e.target.value})}
                  />
                </div>
                <Button type="submit" className="w-full">Add Workshop</Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {workshops.map((workshop) => (
            <Card key={workshop.id}>
              <CardHeader>
                <CardTitle>{workshop.title}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {workshop.description && (
                  <p className="text-sm text-muted-foreground">{workshop.description}</p>
                )}
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="w-4 h-4 text-primary" />
                    <span>{format(new Date(workshop.date), "MMMM dd, yyyy")}</span>
                    {workshop.time && <span className="text-muted-foreground">at {workshop.time}</span>}
                  </div>
                  {workshop.location && (
                    <div className="flex items-center gap-2 text-sm">
                      <MapPin className="w-4 h-4 text-primary" />
                      <span>{workshop.location}</span>
                    </div>
                  )}
                  {workshop.facilitator && (
                    <div className="flex items-center gap-2 text-sm">
                      <User className="w-4 h-4 text-primary" />
                      <span>{workshop.facilitator}</span>
                    </div>
                  )}
                </div>
                <div className="flex items-center justify-between pt-2 border-t">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    workshop.status === 'scheduled' 
                      ? 'bg-primary/10 text-primary' 
                      : workshop.status === 'completed'
                      ? 'bg-success/10 text-success'
                      : 'bg-muted text-muted-foreground'
                  }`}>
                    {workshop.status}
                  </span>
                  {workshop.max_participants && (
                    <span className="text-sm text-muted-foreground">
                      {workshop.registered_count} / {workshop.max_participants} participants
                    </span>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Workshops;
