import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  CheckCircle2, XCircle, Shield, Users, Sparkles, 
  FileText, Landmark, Heart, Building, TrendingUp, Target
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

const PATHWAYS = [
  {
    title: 'Grants & Foundations',
    description: 'Readiness, alignment, submission strategy',
    icon: FileText,
    color: 'emerald'
  },
  {
    title: 'Contracts & RFPs',
    description: 'Procurement, compliance, capability building',
    icon: Landmark,
    color: 'blue'
  },
  {
    title: 'Donors & Philanthropy',
    description: 'Relationship-based funding',
    icon: Heart,
    color: 'violet'
  },
  {
    title: 'Public Funding & Civic Access',
    description: 'Ethical engagement with public systems',
    icon: Building,
    color: 'amber'
  }
];

const WHO_ITS_FOR = [
  'Nonprofits building long-term funding stability',
  'Small businesses and solopreneurs pursuing contracts and procurement',
  'Community organizations seeking ethical access to capital',
  'Startups building credibility before funding'
];

const PROMISES = [
  { we_promise: 'Honest assessments of funding readiness', we_refuse: 'Guaranteed funding or awards' },
  { we_promise: 'Clear guidance on grants and contracts', we_refuse: '"Anyone can get a grant" messaging' },
  { we_promise: 'Ethical use of AI and templates', we_refuse: 'Fabricated narratives or inflated outcomes' },
  { we_promise: 'Capacity-building before applications', we_refuse: 'Pressure to apply when you\'re not ready' },
  { we_promise: 'Education about public funding systems', we_refuse: 'Earmarks, favors, or behind-the-scenes access' },
  { we_promise: 'Long-term sustainability strategies', we_refuse: 'Quick money, shortcuts, or hype' }
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-900">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgyNTUsMjU1LDI1NSwwLjAzKSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-40" />
        
        <div className="relative max-w-6xl mx-auto px-4 py-20 md:py-32">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <Badge className="bg-emerald-500/10 text-emerald-300 border-emerald-500/30 mb-6">
              Ethical Funding Readiness Platform
            </Badge>
            
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 leading-tight">
              Build Real Funding Power —<br />Not Just Applications.
            </h1>
            
            <p className="text-xl text-slate-300 mb-8 max-w-3xl mx-auto">
              The Grants + Contracts Accelerator helps nonprofits, businesses, and community organizations become 
              funding-ready, contract-ready, and sustainability-ready — ethically, strategically, and with long-term impact.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to={createPageUrl('Home')}>
                <Button size="lg" className="bg-emerald-600 hover:bg-emerald-700 text-white px-8">
                  Start Your Funding Readiness Profile
                </Button>
              </Link>
              <Button size="lg" variant="outline" className="border-white/20 text-white hover:bg-white/10">
                See How It Works
              </Button>
            </div>
            
            <p className="text-sm text-emerald-300 mt-6">
              Start building funding readiness for <strong>$25/month</strong>
            </p>
          </motion.div>
        </div>
      </section>

      {/* Value Statement */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-4xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-6">
              We Promise Something Different — The Truth.
            </h2>
            <p className="text-lg text-slate-600 mb-6">
              Others promise that <em>anyone</em> can get a grant and that there are "millions of dollars just waiting for you."
            </p>
            <p className="text-lg text-slate-900 font-medium mb-6">
              The Grants + Contracts Accelerator is built on ethical guidance, real-world experience, and respect for how funding systems actually work.
            </p>
            <p className="text-lg text-slate-600">
              We provide honest assessments, valuable tools, and strategic resources so you don't waste time, damage credibility, 
              or chase money that isn't meant for your organization.
            </p>
          </motion.div>
        </div>
      </section>

      {/* What Makes This Different */}
      <section className="py-20">
        <div className="max-w-6xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
              This Isn't a Grant Database.
            </h2>
            <p className="text-xl text-slate-600">
              It's a <strong>funding readiness and capital access system</strong> designed to help you:
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-8">
            {[
              { icon: Shield, text: 'Build real organizational infrastructure' },
              { icon: Target, text: 'Understand when grants are appropriate — and when they\'re not' },
              { icon: TrendingUp, text: 'Access contracts, donors, and public funding pathways' },
              { icon: CheckCircle2, text: 'Grow from readiness → eligibility → sustainability' }
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <Card className="h-full">
                  <CardContent className="p-6 flex items-start gap-4">
                    <div className="p-3 bg-emerald-100 rounded-lg">
                      <item.icon className="w-6 h-6 text-emerald-600" />
                    </div>
                    <p className="text-slate-700 text-lg flex-1">{item.text}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Who It's For */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-4xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">Who It's For</h2>
          </motion.div>

          <div className="space-y-4">
            {WHO_ITS_FOR.map((text, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="flex items-center gap-3 p-4 bg-white rounded-lg border border-slate-200"
              >
                <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                <p className="text-slate-700">{text}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Funding Pathways */}
      <section className="py-20">
        <div className="max-w-6xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">Funding Pathways</h2>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-6">
            {PATHWAYS.map((pathway, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <Card className="h-full hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className={`p-3 bg-${pathway.color}-100 rounded-lg inline-block mb-4`}>
                      <pathway.icon className={`w-6 h-6 text-${pathway.color}-600`} />
                    </div>
                    <h3 className="text-xl font-semibold text-slate-900 mb-2">{pathway.title}</h3>
                    <p className="text-slate-600">{pathway.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Promises Table */}
      <section className="py-20 bg-gradient-to-br from-slate-900 to-slate-800">
        <div className="max-w-5xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              What We Promise — and What We Refuse to Promise
            </h2>
          </motion.div>

          <div className="space-y-4">
            {PROMISES.map((promise, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="grid md:grid-cols-2 gap-4 bg-white/5 backdrop-blur-sm rounded-lg p-6 border border-white/10"
              >
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-1" />
                  <p className="text-white">{promise.we_promise}</p>
                </div>
                <div className="flex items-start gap-3">
                  <XCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-1" />
                  <p className="text-slate-300">{promise.we_refuse}</p>
                </div>
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mt-12 text-center"
          >
            <div className="inline-block p-6 bg-emerald-600/10 border border-emerald-500/30 rounded-xl">
              <p className="text-2xl font-bold text-emerald-300 mb-2">Our Guiding Principle</p>
              <p className="text-lg text-white">We don't promise funding.</p>
              <p className="text-lg text-white">We promise honesty, strategy, and readiness.</p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-emerald-600">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
              Ready to Build Real Funding Power?
            </h2>
            <p className="text-xl text-emerald-100 mb-8">
              Start with an honest assessment of where you are — and a clear path forward.
            </p>
            <Link to={createPageUrl('Home')}>
              <Button size="lg" className="bg-white text-emerald-600 hover:bg-slate-50 px-8">
                Start Your Funding Readiness Profile
              </Button>
            </Link>
            <p className="text-emerald-100 mt-4">$25/month • Cancel anytime</p>
          </motion.div>
        </div>
      </section>
    </div>
  );
}