import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Heart } from "lucide-react";
import { toast } from "sonner";

const Register = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [role, setRole] = useState(searchParams.get("role") || "patient");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
    specialty: "", // For doctors
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords don't match");
      return;
    }

    // Demo registration - in production, this would call registration API
    if (formData.name && formData.email && formData.password && formData.phone) {
      toast.success("Registration successful!");
      
      // Redirect based on role
      if (role === "doctor") {
        navigate("/doctor-portal");
      } else if (role === "receptionist") {
        navigate("/receptionist-portal");
      } else if (role === "patient") {
        navigate("/patient/dashboard");
      } else {
        navigate("/login");
      }
    } else {
      toast.error("Please fill in all required fields");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-muted/50 to-background flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center space-x-2 mb-2">
            <Heart className="h-10 w-10 fill-secondary text-secondary" />
            <span className="text-2xl font-bold text-foreground">MedicalCare</span>
          </Link>
          <p className="text-muted-foreground">Create your account to get started</p>
        </div>

        <Card className="shadow-card">
          <CardHeader>
            <CardTitle>Sign Up</CardTitle>
            <CardDescription>Choose your role and fill in your details</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleRegister} className="space-y-4">
              <div className="space-y-3">
                <Label>I am a</Label>
                <RadioGroup value={role} onValueChange={setRole} className="flex gap-4">
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="patient" id="patient" />
                    <Label htmlFor="patient" className="cursor-pointer">Patient</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="doctor" id="doctor" />
                    <Label htmlFor="doctor" className="cursor-pointer">Doctor</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="receptionist" id="receptionist" />
                    <Label htmlFor="receptionist" className="cursor-pointer">Receptionist</Label>
                  </div>
                </RadioGroup>
              </div>

              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  name="name"
                  type="text"
                  placeholder="John Doe"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="your.email@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  name="phone"
                  type="tel"
                  placeholder="+1 (555) 000-0000"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                />
              </div>

              {role === "doctor" && (
                <div className="space-y-2">
                  <Label htmlFor="specialty">Specialty</Label>
                  <Input
                    id="specialty"
                    name="specialty"
                    type="text"
                    placeholder="e.g., Cardiology, Pediatrics"
                    value={formData.specialty}
                    onChange={handleChange}
                    required
                  />
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="Create a strong password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  placeholder="Re-enter your password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                />
              </div>

              <Button type="submit" className="w-full" size="lg">
                Create Account
              </Button>
            </form>

            <div className="mt-6 text-center text-sm">
              <span className="text-muted-foreground">Already have an account? </span>
              <Link to="/login" className="text-secondary hover:underline font-medium">
                Login
              </Link>
            </div>
          </CardContent>
        </Card>

        <div className="mt-6 text-center text-xs text-muted-foreground">
          <p>By signing up, you agree to our</p>
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

export default Register;
