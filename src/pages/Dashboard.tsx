import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { 
  TrendingUp, 
  Users, 
  DollarSign, 
  TrendingDown,
  Calendar,
  ShoppingBag,
  Target,
  Mic,
  Sparkles
} from "lucide-react";
import { format } from "date-fns";

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalSavings: 0,
    activeMembers: 0,
    activeLoans: 0,
    loanAmount: 0,
    monthlyGrowth: 0,
    workshops: 0,
    products: 0,
    avgSavings: 0,
  });
  const [goal, setGoal] = useState<any>(null);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [isListening, setIsListening] = useState(false);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    // Fetch members stats
    const { data: members } = await supabase
      .from("members")
      .select("total_savings, active_loans");
    
    if (members) {
      const totalSavings = members.reduce((sum, m) => sum + Number(m.total_savings), 0);
      const avgSavings = members.length > 0 ? totalSavings / members.length : 0;
      const totalLoanAmount = members.reduce((sum, m) => sum + Number(m.active_loans), 0);
      const activeLoansCount = members.filter(m => Number(m.active_loans) > 0).length;
      
      setStats(prev => ({
        ...prev,
        totalSavings,
        activeMembers: members.length,
        activeLoans: activeLoansCount,
        loanAmount: totalLoanAmount,
        avgSavings,
        monthlyGrowth: 12.5,
      }));
    }

    // Fetch workshops count
    const { count: workshopsCount } = await supabase
      .from("workshops")
      .select("*", { count: "exact", head: true });
    
    // Fetch products count
    const { count: productsCount } = await supabase
      .from("products")
      .select("*", { count: "exact", head: true });

    setStats(prev => ({
      ...prev,
      workshops: workshopsCount || 0,
      products: productsCount || 0,
    }));

    // Fetch active goal
    const { data: goals } = await supabase
      .from("goals")
      .select("*")
      .eq("status", "active")
      .order("created_at", { ascending: false })
      .limit(1);
    
    if (goals && goals.length > 0) {
      setGoal(goals[0]);
    }

    // Fetch recent transactions
    const { data: txns } = await supabase
      .from("transactions")
      .select(`
        *,
        members (full_name)
      `)
      .order("transaction_date", { ascending: false })
      .limit(4);
    
    if (txns) {
      setTransactions(txns);
    }
  };

  const progress = goal ? (Number(goal.current_amount) / Number(goal.target_amount)) * 100 : 0;
  const remaining = goal ? Number(goal.target_amount) - Number(goal.current_amount) : 0;
  const daysLeft = goal && goal.deadline 
    ? Math.ceil((new Date(goal.deadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
    : 0;

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Welcome Back!</h1>
          <p className="text-muted-foreground">Here's an overview of your SHG's financial health and activities</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Savings</CardTitle>
              <DollarSign className="w-5 h-5 text-success" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">₹{stats.totalSavings.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground mt-1">
                +20.1% from last month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Active Members</CardTitle>
              <Users className="w-5 h-5 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.activeMembers}</div>
              <p className="text-xs text-muted-foreground mt-1">
                +2 new members this month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Active Loans</CardTitle>
              <TrendingUp className="w-5 h-5 text-warning" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.activeLoans}</div>
              <p className="text-xs text-muted-foreground mt-1">
                ₹{stats.loanAmount.toLocaleString()} total outstanding
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Monthly Growth</CardTitle>
              <Sparkles className="w-5 h-5 text-accent" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.monthlyGrowth}%</div>
              <p className="text-xs text-muted-foreground mt-1">
                Above target of 10%
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Goal Progress and Quick Activities */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {goal && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="w-5 h-5 text-success" />
                  Current Goal Progress
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="font-medium">{goal.title}</span>
                    <span className="text-sm text-muted-foreground">{Math.round(progress)}%</span>
                  </div>
                  <Progress value={progress} className="h-2" />
                  <p className="text-sm text-muted-foreground mt-2">
                    ₹{Number(goal.current_amount).toLocaleString()} of ₹{Number(goal.target_amount).toLocaleString()} raised
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                  <div>
                    <p className="text-2xl font-bold text-success">₹{remaining.toLocaleString()}</p>
                    <p className="text-xs text-muted-foreground">Remaining</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-warning">{daysLeft} days</p>
                    <p className="text-xs text-muted-foreground">Time left</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle>Quick Activities</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-3 p-3 rounded-lg bg-primary/5">
                  <Calendar className="w-5 h-5 text-primary" />
                  <div>
                    <p className="text-sm text-muted-foreground">Workshops</p>
                    <p className="text-2xl font-bold">{stats.workshops}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-lg bg-warning/5">
                  <ShoppingBag className="w-5 h-5 text-warning" />
                  <div>
                    <p className="text-sm text-muted-foreground">Products</p>
                    <p className="text-2xl font-bold">{stats.products}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-lg bg-success/5">
                  <Target className="w-5 h-5 text-success" />
                  <div>
                    <p className="text-sm text-muted-foreground">Achieved</p>
                    <p className="text-2xl font-bold">5</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-lg bg-accent/5">
                  <DollarSign className="w-5 h-5 text-accent" />
                  <div>
                    <p className="text-sm text-muted-foreground">Avg. Savings</p>
                    <p className="text-2xl font-bold">₹{Math.round(stats.avgSavings).toLocaleString()}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Transactions */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Transactions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {transactions.map((txn) => (
                <div key={txn.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <DollarSign className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">{txn.members?.full_name || "Unknown"}</p>
                      <p className="text-sm text-muted-foreground capitalize">{txn.type.replace("_", " ")}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`font-bold ${txn.type === 'fine' ? 'text-destructive' : 'text-success'}`}>
                      ₹{Number(txn.amount).toLocaleString()}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {format(new Date(txn.transaction_date), "yyyy-MM-dd")}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Voice Recognition */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mic className="w-5 h-5" />
              Voice Recognition
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button 
              variant={isListening ? "destructive" : "default"}
              size="lg"
              className="w-full"
              onClick={() => setIsListening(!isListening)}
            >
              <Mic className="w-5 h-5 mr-2" />
              {isListening ? "Listening..." : "Start Voice Command"}
            </Button>
            <div className="space-y-2 text-sm text-muted-foreground">
              <p className="font-medium text-foreground">Voice Commands:</p>
              <p>💰 "Add 500 rupees to [member name] savings"</p>
              <p>💸 "Record loan payment of [amount] from [name]"</p>
              <p>⚠️ "Add fine of [amount] rupees for [name]"</p>
              <p>📊 "Show savings balance for all members"</p>
              <p>👥 "Add new member [name]"</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
