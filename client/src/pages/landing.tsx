import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Handshake, Search, Shield, Clock, Rocket, Palette, TrendingUp, ArrowRight, Menu, X } from "lucide-react";

export default function Landing() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogin = () => {
    window.location.href = "/api/login";
  };

  const handleGetStarted = () => {
    window.location.href = "/api/login";
  };

  const handleHiringTalent = () => {
    window.location.href = "/api/login";
  };

  const opportunities = [
    {
      id: 1,
      title: "Senior Full-Stack Engineer",
      company: "TechStart Inc.",
      equity: "0.5-2% Equity",
      skills: ["React", "Node.js", "PostgreSQL", "Remote"],
      description: "Join our fast-growing fintech startup as a senior engineer. Help build the future of digital payments with competitive salary plus significant equity upside.",
      icon: Rocket,
      iconColor: "text-blue-600",
      iconBg: "bg-blue-100",
      equityColor: "bg-green-100 text-green-800",
      postedDays: 2,
    },
    {
      id: 2,
      title: "Co-Founder & Head of Design",
      company: "CreativeHub",
      equity: "15-25% Equity",
      skills: ["UI/UX Design", "Product Strategy", "Leadership", "San Francisco"],
      description: "Seeking a visionary design leader to join as co-founder. Shape the product direction and build the design team for our creative collaboration platform.",
      icon: Palette,
      iconColor: "text-purple-600",
      iconBg: "bg-purple-100",
      equityColor: "bg-blue-100 text-blue-800",
      postedDays: 7,
    },
    {
      id: 3,
      title: "Marketing Manager",
      company: "GrowthCo",
      equity: "0.1-0.5% Equity",
      skills: ["Digital Marketing", "Growth Hacking", "Analytics", "Remote"],
      description: "Drive growth for our B2B SaaS platform. Experience with SEO, content marketing, and paid acquisition required. Competitive base + equity package.",
      icon: TrendingUp,
      iconColor: "text-green-600",
      iconBg: "bg-green-100",
      equityColor: "bg-orange-100 text-orange-800",
      postedDays: 3,
    },
  ];

  return (
    <div className="bg-slate-50 min-h-screen">
      {/* Header Navigation */}
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-primary">EquityForge.io</h1>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex space-x-8">
              <a href="#" className="text-gray-700 hover:text-primary transition-colors duration-200">Find Opportunities</a>
              <a href="#" className="text-gray-700 hover:text-primary transition-colors duration-200">Find Talent</a>
              <a href="#" className="text-gray-700 hover:text-primary transition-colors duration-200">How It Works</a>
              <a href="#" className="text-gray-700 hover:text-primary transition-colors duration-200">About</a>
            </nav>

            {/* Auth Buttons */}
            <div className="hidden md:flex items-center space-x-4">
              <Button variant="ghost" onClick={handleLogin}>
                Sign In
              </Button>
              <Button onClick={handleLogin}>
                Get Started
              </Button>
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </Button>
            </div>
          </div>

          {/* Mobile Navigation */}
          {mobileMenuOpen && (
            <div className="md:hidden py-4 border-t border-gray-200">
              <nav className="flex flex-col space-y-4">
                <a href="#" className="text-gray-700 hover:text-primary transition-colors duration-200">Find Opportunities</a>
                <a href="#" className="text-gray-700 hover:text-primary transition-colors duration-200">Find Talent</a>
                <a href="#" className="text-gray-700 hover:text-primary transition-colors duration-200">How It Works</a>
                <a href="#" className="text-gray-700 hover:text-primary transition-colors duration-200">About</a>
                <div className="flex flex-col space-y-2 pt-4 border-t border-gray-200">
                  <Button variant="ghost" onClick={handleLogin} className="justify-start">
                    Sign In
                  </Button>
                  <Button onClick={handleLogin} className="justify-start">
                    Get Started
                  </Button>
                </div>
              </nav>
            </div>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary to-blue-700 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Connect Talent with{" "}
              <span className="text-blue-200">Equity Opportunities</span>
            </h1>
            <p className="text-xl md:text-2xl text-blue-100 mb-8 max-w-3xl mx-auto">
              The premier platform for professionals seeking full-time, part-time, contract, or co-founder roles with equity compensation
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button
                size="lg"
                variant="secondary"
                onClick={handleGetStarted}
                className="bg-white text-primary hover:bg-gray-100 px-8 py-4 text-lg shadow-lg"
              >
                <Search className="w-5 h-5 mr-2" />
                I'm Looking for Opportunities
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={handleHiringTalent}
                className="border-2 border-white text-white hover:bg-white hover:text-primary px-8 py-4 text-lg"
              >
                <Handshake className="w-5 h-5 mr-2" />
                I'm Hiring Talent
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Why Choose EquityForge?</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              We specialize in connecting talented professionals with innovative companies offering equity compensation
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <Card className="text-center p-8 hover:shadow-lg transition-shadow duration-300">
              <CardContent className="pt-6">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Handshake className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Equity-Focused Matching</h3>
                <p className="text-gray-600">
                  Connect with startups and companies offering equity compensation, from co-founder roles to employee stock options
                </p>
              </CardContent>
            </Card>

            {/* Feature 2 */}
            <Card className="text-center p-8 hover:shadow-lg transition-shadow duration-300">
              <CardContent className="pt-6">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Search className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Smart Talent Matching</h3>
                <p className="text-gray-600">
                  Our AI-powered algorithm matches skills, experience, and career goals with the right opportunities
                </p>
              </CardContent>
            </Card>

            {/* Feature 3 */}
            <Card className="text-center p-8 hover:shadow-lg transition-shadow duration-300">
              <CardContent className="pt-6">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Shield className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Trusted Community</h3>
                <p className="text-gray-600">
                  Vetted profiles, transparent reviews, and secure communication tools ensure quality connections
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Job Listings Preview */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-12">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Latest Opportunities</h2>
              <p className="text-gray-600">Discover exciting roles with equity potential</p>
            </div>
            <Button variant="ghost" onClick={handleLogin} className="text-primary hover:text-blue-700 font-semibold flex items-center">
              View All <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>

          <div className="grid gap-6">
            {opportunities.map((opportunity) => {
              const IconComponent = opportunity.icon;
              return (
                <Card key={opportunity.id} className="p-6 hover:shadow-lg transition-shadow duration-300">
                  <CardContent className="p-0">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center">
                        <div className={`w-12 h-12 ${opportunity.iconBg} rounded-lg flex items-center justify-center mr-4`}>
                          <IconComponent className={`${opportunity.iconColor} w-6 h-6`} />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">{opportunity.title}</h3>
                          <p className="text-gray-600">{opportunity.company}</p>
                        </div>
                      </div>
                      <Badge className={opportunity.equityColor}>
                        {opportunity.equity}
                      </Badge>
                    </div>
                    <div className="flex flex-wrap gap-2 mb-4">
                      {opportunity.skills.map((skill, index) => (
                        <Badge key={index} variant="secondary">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                    <p className="text-gray-600 mb-4">
                      {opportunity.description}
                    </p>
                    <div className="flex justify-between items-center">
                      <div className="text-sm text-gray-500 flex items-center">
                        <Clock className="w-4 h-4 mr-1" />
                        Posted {opportunity.postedDays} day{opportunity.postedDays !== 1 ? 's' : ''} ago
                      </div>
                      <Button onClick={handleLogin}>
                        Apply Now
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="col-span-2">
              <h3 className="text-2xl font-bold mb-4">EquityForge.io</h3>
              <p className="text-gray-300 mb-6 max-w-md">
                Connecting talented professionals with innovative companies and equity opportunities. Build your future with us.
              </p>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">For Talent</h4>
              <ul className="space-y-2 text-gray-300">
                <li><a href="#" className="hover:text-white transition-colors duration-200">Find Jobs</a></li>
                <li><a href="#" className="hover:text-white transition-colors duration-200">Browse Companies</a></li>
                <li><a href="#" className="hover:text-white transition-colors duration-200">Salary Guide</a></li>
                <li><a href="#" className="hover:text-white transition-colors duration-200">Career Resources</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">For Companies</h4>
              <ul className="space-y-2 text-gray-300">
                <li><a href="#" className="hover:text-white transition-colors duration-200">Post Jobs</a></li>
                <li><a href="#" className="hover:text-white transition-colors duration-200">Find Talent</a></li>
                <li><a href="#" className="hover:text-white transition-colors duration-200">Pricing</a></li>
                <li><a href="#" className="hover:text-white transition-colors duration-200">Success Stories</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 mt-8 text-center text-gray-400">
            <p>&copy; 2024 EquityForge.io. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
