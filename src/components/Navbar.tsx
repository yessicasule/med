import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Heart, Menu } from "lucide-react";
import { useState } from "react";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="bg-primary text-primary-foreground shadow-soft sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center space-x-2">
            <Heart className="h-8 w-8 fill-secondary text-secondary" />
            <span className="text-xl font-semibold">MedicalCare</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link to="/" className="hover:text-secondary transition-colors">
              Home
            </Link>
            <Link to="/find-doctors" className="hover:text-secondary transition-colors">
              Find Doctors
            </Link>
            <Link to="/about" className="hover:text-secondary transition-colors">
              About
            </Link>
            <Link to="/contact" className="hover:text-secondary transition-colors">
              Contact
            </Link>
          </div>

          <div className="hidden md:flex items-center space-x-4">
            <Link to="/login">
              <Button variant="ghost" className="text-primary-foreground hover:text-secondary hover:bg-primary/80">
                Login
              </Button>
            </Link>
            <Link to="/register">
              <Button variant="secondary">
                Get Started
              </Button>
            </Link>
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden"
          >
            <Menu className="h-6 w-6" />
          </button>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden pb-4">
            <div className="flex flex-col space-y-3">
              <Link to="/" className="hover:text-secondary transition-colors py-2">
                Home
              </Link>
              <Link to="/find-doctors" className="hover:text-secondary transition-colors py-2">
                Find Doctors
              </Link>
              <Link to="/about" className="hover:text-secondary transition-colors py-2">
                About
              </Link>
              <Link to="/contact" className="hover:text-secondary transition-colors py-2">
                Contact
              </Link>
              <div className="flex flex-col space-y-2 pt-4 border-t border-primary-foreground/20">
                <Link to="/login">
                  <Button variant="ghost" className="w-full text-primary-foreground hover:text-secondary hover:bg-primary/80">
                    Login
                  </Button>
                </Link>
                <Link to="/register">
                  <Button variant="secondary" className="w-full">
                    Get Started
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
