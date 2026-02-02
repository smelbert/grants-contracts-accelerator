import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Award, 
  BookOpen, 
  Users, 
  Lightbulb,
  ArrowRight,
  CheckCircle2,
  Target,
  TrendingUp
} from 'lucide-react';

export default function PublicHomePage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
                <span className="text-white font-bold text-lg">E</span>
              </div>
              <span className="text-xl font-bold text-slate-900">EIS</span>
            </div>
            <div className="hidden md:flex items-center gap-8">
              <Link to={createPageUrl('PublicHome')} className="text-slate-700 hover:text-emerald-600 font-medium">Home</Link>
              <Link to={createPageUrl('AboutEIS')} className="text-slate-700 hover:text-emerald-600 font-medium">About</Link>
              <Link to={createPageUrl('Register')}>
                <Button className="bg-emerald-600 hover:bg-emerald-700">Get Started</Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-emerald-50 via-teal-50 to-white py-20 md:py-32">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 bg-emerald-100 text-emerald-700 px-4 py-2 rounded-full text-sm font-medium mb-6">
                <Award className="w-4 h-4" />
                Expert Guidance for Nonprofit Success
              </div>
              <h1 className="text-5xl md:text-6xl font-bold text-slate-900 mb-6 leading-tight">
                Transform Your Nonprofit with Strategic Funding
              </h1>
              <p className="text-xl text-slate-600 mb-8 leading-relaxed">
                Unlock sustainable growth through expert-guided grant writing, contracts, and donor engagement strategies. Build capacity, secure funding, and amplify your impact.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link to={createPageUrl('Register')}>
                  <Button size="lg" className="bg-emerald-600 hover:bg-emerald-700 text-lg px-8">
                    Start Your Journey
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                </Link>
                <Link to={createPageUrl('AboutEIS')}>
                  <Button size="lg" variant="outline" className="text-lg px-8">
                    Learn More
                  </Button>
                </Link>
              </div>
            </div>
            <div className="relative">
              <div className="bg-white rounded-2xl shadow-2xl p-8 border border-slate-200">
                <div className="space-y-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center">
                      <Target className="w-6 h-6 text-emerald-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-900">Strategic Planning</h3>
                      <p className="text-sm text-slate-600">Build winning funding strategies</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                      <BookOpen className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-900">Expert Training</h3>
                      <p className="text-sm text-slate-600">Learn from industry leaders</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center">
                      <TrendingUp className="w-6 h-6 text-purple-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-900">Proven Results</h3>
                      <p className="text-sm text-slate-600">Track record of success</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-slate-900 text-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div>
              <p className="text-5xl font-bold text-emerald-400 mb-2">$50M+</p>
              <p className="text-slate-300">In Funding Secured</p>
            </div>
            <div>
              <p className="text-5xl font-bold text-emerald-400 mb-2">500+</p>
              <p className="text-slate-300">Organizations Served</p>
            </div>
            <div>
              <p className="text-5xl font-bold text-emerald-400 mb-2">95%</p>
              <p className="text-slate-300">Client Success Rate</p>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-slate-900 mb-4">Comprehensive Support for Your Mission</h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              From startup to scale, we provide the tools, training, and expertise you need to secure sustainable funding
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="hover:shadow-xl transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-emerald-100 flex items-center justify-center mb-4">
                  <BookOpen className="w-6 h-6 text-emerald-600" />
                </div>
                <CardTitle>Grant Writing Excellence</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-600 mb-4">
                  Master the art of compelling proposals with expert guidance, templates, and feedback
                </p>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2 text-sm text-slate-600">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5" />
                    Professional templates
                  </li>
                  <li className="flex items-start gap-2 text-sm text-slate-600">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5" />
                    1-on-1 coaching
                  </li>
                  <li className="flex items-start gap-2 text-sm text-slate-600">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5" />
                    Review & feedback
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="hover:shadow-xl transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center mb-4">
                  <Users className="w-6 h-6 text-blue-600" />
                </div>
                <CardTitle>Capacity Building</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-600 mb-4">
                  Strengthen your organization's infrastructure for long-term sustainability
                </p>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2 text-sm text-slate-600">
                    <CheckCircle2 className="w-4 h-4 text-blue-600 mt-0.5" />
                    Strategic planning
                  </li>
                  <li className="flex items-start gap-2 text-sm text-slate-600">
                    <CheckCircle2 className="w-4 h-4 text-blue-600 mt-0.5" />
                    Board development
                  </li>
                  <li className="flex items-start gap-2 text-sm text-slate-600">
                    <CheckCircle2 className="w-4 h-4 text-blue-600 mt-0.5" />
                    Systems optimization
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="hover:shadow-xl transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-purple-100 flex items-center justify-center mb-4">
                  <Lightbulb className="w-6 h-6 text-purple-600" />
                </div>
                <CardTitle>Funding Strategy</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-600 mb-4">
                  Develop diversified funding streams tailored to your organization's stage
                </p>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2 text-sm text-slate-600">
                    <CheckCircle2 className="w-4 h-4 text-purple-600 mt-0.5" />
                    Funder matching
                  </li>
                  <li className="flex items-start gap-2 text-sm text-slate-600">
                    <CheckCircle2 className="w-4 h-4 text-purple-600 mt-0.5" />
                    Donor cultivation
                  </li>
                  <li className="flex items-start gap-2 text-sm text-slate-600">
                    <CheckCircle2 className="w-4 h-4 text-purple-600 mt-0.5" />
                    Revenue planning
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-emerald-600 to-teal-600 text-white">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-4xl font-bold mb-6">Ready to Transform Your Funding Future?</h2>
          <p className="text-xl text-emerald-50 mb-8">
            Join hundreds of nonprofits who have successfully secured sustainable funding with EIS
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to={createPageUrl('Register')}>
              <Button size="lg" className="bg-white text-emerald-600 hover:bg-slate-50 text-lg px-8">
                Get Started Today
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
            <Link to={createPageUrl('AboutEIS')}>
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-emerald-700 text-lg px-8">
                Meet Dr. Elbert
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 py-12">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
                  <span className="text-white font-bold">E</span>
                </div>
                <span className="text-white font-bold text-lg">EIS</span>
              </div>
              <p className="text-sm">
                Empowering nonprofits to achieve sustainable growth through strategic funding and capacity building.
              </p>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2 text-sm">
                <li><Link to={createPageUrl('PublicHome')} className="hover:text-white">Home</Link></li>
                <li><Link to={createPageUrl('AboutEIS')} className="hover:text-white">About EIS</Link></li>
                <li><Link to={createPageUrl('Register')} className="hover:text-white">Get Started</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Contact</h4>
              <p className="text-sm">
                Email: info@eis.org<br />
                Phone: (555) 123-4567
              </p>
            </div>
          </div>
          <div className="border-t border-slate-800 mt-8 pt-8 text-center text-sm">
            <p>&copy; 2026 EIS. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}