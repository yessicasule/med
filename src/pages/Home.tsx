import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Calendar, FileText, CreditCard, Shield, Clock, Users, Heart } from "lucide-react";
import Navbar from "@/components/Navbar";

const Home = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary to-primary/80 text-primary-foreground">
        <div className="container mx-auto px-4 py-20">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <h1 className="text-5xl md:text-6xl font-bold leading-tight">
                Your Health, <span className="text-secondary">Simplified</span>
              </h1>
              <p className="text-lg text-primary-foreground/90">
                Experience seamless healthcare management. Book appointments, access medical records, and connect with healthcare professionals—all in one secure platform.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link to="/register">
                  <Button size="lg" variant="secondary" className="w-full sm:w-auto">
                    Get Started
                  </Button>
                </Link>
                <Link to="/doctors">
                  <Button size="lg" variant="outline" className="w-full sm:w-auto bg-white/10 text-white border-white/20 hover:bg-white/20">
                    Find Doctors
                  </Button>
                </Link>
              </div>
            </div>
            <div className="hidden md:block">
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-8 shadow-card">
                <img 
                  src="https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=800&q=80" 
                  alt="Healthcare professionals" 
                  className="rounded-lg shadow-lg w-full"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Comprehensive Healthcare Solutions</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Everything you need to manage your health journey in one integrated platform
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="shadow-card hover:shadow-lg transition-shadow">
              <CardContent className="pt-6">
                <div className="bg-secondary/10 w-16 h-16 rounded-full flex items-center justify-center mb-4">
                  <Calendar className="h-8 w-8 text-secondary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Easy Appointments</h3>
                <p className="text-muted-foreground">
                  Book, reschedule, or cancel appointments with your preferred doctors in just a few clicks.
                </p>
              </CardContent>
            </Card>

            <Card className="shadow-card hover:shadow-lg transition-shadow">
              <CardContent className="pt-6">
                <div className="bg-accent/10 w-16 h-16 rounded-full flex items-center justify-center mb-4">
                  <FileText className="h-8 w-8 text-accent" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Medical Records</h3>
                <p className="text-muted-foreground">
                  Access your complete medical history, prescriptions, and test results anytime, anywhere.
                </p>
              </CardContent>
            </Card>

            <Card className="shadow-card hover:shadow-lg transition-shadow">
              <CardContent className="pt-6">
                <div className="bg-success/10 w-16 h-16 rounded-full flex items-center justify-center mb-4">
                  <CreditCard className="h-8 w-8 text-success-foreground" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Secure Billing</h3>
                <p className="text-muted-foreground">
                  Transparent pricing with online and offline payment options for your convenience.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <img 
                src="https://images.unsplash.com/photo-1631217868264-e5b90bb7e133?auto=format&fit=crop&w=800&q=80" 
                alt="Medical team" 
                className="rounded-xl shadow-card"
              />
            </div>
            <div className="space-y-6">
              <h2 className="text-4xl font-bold">Why Choose MedicalCare?</h2>
              <div className="space-y-4">
                <div className="flex gap-4">
                  <div className="bg-secondary/10 w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0">
                    <Shield className="h-6 w-6 text-secondary" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-1">Secure & Private</h3>
                    <p className="text-muted-foreground">
                      Your data is encrypted and protected with enterprise-grade security.
                    </p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="bg-accent/10 w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0">
                    <Clock className="h-6 w-6 text-accent" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-1">24/7 Access</h3>
                    <p className="text-muted-foreground">
                      Manage your health anytime, from any device, wherever you are.
                    </p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="bg-success/10 w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0">
                    <Users className="h-6 w-6 text-success-foreground" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-1">Expert Network</h3>
                    <p className="text-muted-foreground">
                      Connect with verified doctors and healthcare professionals.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-secondary to-accent text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-4">Ready to Get Started?</h2>
          <p className="text-lg mb-8 max-w-2xl mx-auto opacity-90">
            Join thousands of patients and healthcare professionals using MedicalCare for better health management.
          </p>
          <Link to="/register">
            <Button size="lg" variant="outline" className="bg-white text-secondary hover:bg-white/90 border-0">
              Create Your Account
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-primary text-primary-foreground py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <Heart className="h-6 w-6 fill-secondary text-secondary" />
                <span className="text-lg font-semibold">MedicalCare</span>
              </div>
              <p className="text-sm text-primary-foreground/80">
                Your trusted healthcare management platform.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2 text-sm text-primary-foreground/80">
                <li><Link to="/" className="hover:text-secondary transition-colors">Home</Link></li>
                <li><Link to="/doctors" className="hover:text-secondary transition-colors">Find Doctors</Link></li>
                <li><Link to="/about" className="hover:text-secondary transition-colors">About Us</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">For Professionals</h4>
              <ul className="space-y-2 text-sm text-primary-foreground/80">
                <li><Link to="/register?role=doctor" className="hover:text-secondary transition-colors">Register as Doctor</Link></li>
                <li><Link to="/admin" className="hover:text-secondary transition-colors">Admin Portal</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-sm text-primary-foreground/80">
                <li><Link to="/contact" className="hover:text-secondary transition-colors">Contact Us</Link></li>
                <li><Link to="/privacy" className="hover:text-secondary transition-colors">Privacy Policy</Link></li>
                <li><Link to="/terms" className="hover:text-secondary transition-colors">Terms of Service</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-primary-foreground/20 mt-8 pt-8 text-center text-sm text-primary-foreground/70">
            <p>&copy; 2025 MedicalCare. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
