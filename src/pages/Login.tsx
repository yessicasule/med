import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Heart } from "lucide-react";
import { toast } from "sonner";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Demo login - in production, this would call authentication API
    if (email && password) {
      toast.success("Login successful!");
      // Navigate based on user role - for now, default to patient dashboard
      navigate("/patient/dashboard");
    } else {
      toast.error("Please enter your credentials");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-muted/50 to-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center space-x-2 mb-2">
            <Heart className="h-10 w-10 fill-secondary text-secondary" />
            <span className="text-2xl font-bold text-foreground">MedicalCare</span>
          </Link>
          <p className="text-muted-foreground">Welcome back! Please login to your account.</p>
        </div>

        <Card className="shadow-card">
          <CardHeader>
            <CardTitle>Login</CardTitle>
            <CardDescription>Enter your credentials to access your account</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your.email@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <div className="flex items-center justify-between text-sm">
                <label className="flex items-center gap-2">
                  <input type="checkbox" className="rounded" />
                  <span className="text-muted-foreground">Remember me</span>
                </label>
                <Link to="/forgot-password" className="text-secondary hover:underline">
                  Forgot password?
                </Link>
              </div>
              <Button type="submit" className="w-full" size="lg">
                Login
              </Button>
            </form>

            <div className="mt-6 text-center text-sm">
              <span className="text-muted-foreground">Don't have an account? </span>
              <Link to="/register" className="text-secondary hover:underline font-medium">
                Sign up
              </Link>
            </div>
          </CardContent>
        </Card>

        <div className="mt-6 text-center text-xs text-muted-foreground">
          <p>By logging in, you agree to our</p>
          <div className="space-x-2">
            <Link to="/terms" className="hover:text-foreground underline">Terms of Service</Link>
            <span>and</span>
            <Link to="/privacy" className="hover:text-foreground underline">Privacy Policy</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
