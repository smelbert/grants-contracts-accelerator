import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search, Info } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

const FMV_DATA = [
  // Facility/Space
  { category: 'Facility/Space', item: 'Gymnasium rental — community rate', range: '$50–$125', unit: 'per hour', how: 'Use local YMCA, school district, or community center published rate.', notes: 'Vary by region and time of day. Higher evenings/weekends.' },
  { category: 'Facility/Space', item: 'Gymnasium rental — premium/private', range: '$100–$300', unit: 'per hour', how: 'Use comparable private facility rate.', notes: 'For high-end or specialized facilities.' },
  { category: 'Facility/Space', item: 'Conference room / meeting space', range: '$25–$100', unit: 'per hour', how: "Use hotel, coworking, or library published rate for comparable space.", notes: 'Day rate often $150–$400. Use per-hour if partial day.' },
  { category: 'Facility/Space', item: 'Warehouse / storage space', range: '$0.50–$2.00', unit: 'per sq ft/month', how: 'Use local commercial real estate listings for comparable size/location.', notes: 'For donated storage, distribution, or staging space.' },
  { category: 'Facility/Space', item: 'Office space', range: '$15–$40', unit: 'per sq ft/year', how: 'Use local commercial real estate comps or CoStar data.', notes: 'Varies significantly by city/suburb.' },
  // Food & Bev
  { category: 'Food/Bev', item: 'Pizza (large, chain)', range: '$14–$22', unit: 'per pizza', how: 'Use published delivery menu price or wholesale/catering invoice.', notes: 'Use retail value if no receipt. Document source.' },
  { category: 'Food/Bev', item: 'Coffee / beverages (case)', range: '$60–$120', unit: 'per case', how: 'Wholesale invoice or comparable Costco/wholesale pricing.', notes: 'Canned/bottled; adjust for specialty/cold brew.' },
  { category: 'Food/Bev', item: 'Catered meal (per person)', range: '$15–$40', unit: 'per person', how: 'Comparable catering quote from a local caterer.', notes: 'Buffet/simple vs. plated/formal varies widely.' },
  // Equipment
  { category: 'Equipment', item: 'Basketball (game quality)', range: '$30–$60', unit: 'each', how: 'Retail price from Spalding, Wilson, or Nike website.', notes: 'Youth vs. men\'s size; document model and brand.' },
  { category: 'Equipment', item: 'Laptop (business-class, 3 yrs old)', range: '$400–$800', unit: 'each', how: 'eBay sold listings or CPO (certified pre-owned) pricing.', notes: 'Age and spec matter. Get 3 comparables and average.' },
  { category: 'Equipment', item: 'Printer / Copier (office)', range: '$150–$600', unit: 'each', how: 'Amazon/Best Buy pricing for equivalent model.', notes: 'Commercial copiers can be $1,000+.' },
  { category: 'Equipment', item: 'Folding tables', range: '$40–$80', unit: 'each', how: 'Costco or Home Depot retail price for comparable size.', notes: '' },
  // Apparel
  { category: 'Apparel/Uniforms', item: 'Youth sports jersey (blank)', range: '$15–$35', unit: 'each', how: 'Wholesale screen-printing supplier or BSN Sports catalog.', notes: 'Custom printing adds $5–$15/item.' },
  { category: 'Apparel/Uniforms', item: 'T-shirt (branded/printed)', range: '$8–$25', unit: 'each', how: 'Wholesale blank + decoration cost from comparable vendor.', notes: 'Premium brands (Under Armour, Nike) higher end.' },
  // Professional Services
  { category: 'Professional Services', item: 'Attorney (general nonprofit/business)', range: '$150–$400', unit: 'per hour', how: 'State bar published rates; local nonprofit legal aid comps.', notes: 'Specialized (IP, tax, litigation) may be higher.' },
  { category: 'Professional Services', item: 'CPA / Accountant', range: '$100–$300', unit: 'per hour', how: 'Local CPA firm published hourly rate.', notes: 'Tax prep vs. audit engagement rates differ.' },
  { category: 'Professional Services', item: 'Graphic Designer', range: '$50–$150', unit: 'per hour', how: 'Freelance designer platforms (Upwork, 99designs) comparables.', notes: 'Junior vs. senior rates; branding vs. production work.' },
  { category: 'Professional Services', item: 'Web Developer', range: '$75–$200', unit: 'per hour', how: 'Comparable freelance or agency hourly rate.', notes: 'Full-stack vs. front-end; project complexity matters.' },
  { category: 'Professional Services', item: 'Photographer (event)', range: '$100–$300', unit: 'per hour', how: 'Local photographer rate card or 2-hour minimum quote.', notes: 'Includes post-processing; prints/products extra.' },
  // Technology
  { category: 'Technology', item: 'Software license (e.g. MS 365 Business)', range: '$12–$22', unit: 'per user/month', how: 'Published retail price from vendor website.', notes: 'Discount off MSRP for donated licenses (e.g., TechSoup).' },
  { category: 'Technology', item: 'Cloud storage (e.g. Google Workspace)', range: '$6–$18', unit: 'per user/month', how: 'Published pricing from vendor.', notes: 'Use Business Standard or equivalent tier.' },
  // Transportation
  { category: 'Transportation', item: 'Vehicle use (personal car)', range: '$0.21', unit: 'per mile', how: 'IRS charitable mileage rate (current year). Not deductible to volunteer — org tracking only.', notes: 'Charitable rate ≠ business rate. Confirm current IRS rate annually.' },
  { category: 'Transportation', item: 'Van / 15-passenger rental', range: '$80–$150', unit: 'per day', how: 'Enterprise, Budget, or National comparable rental rate.', notes: 'Weekend vs. weekday rates differ.' },
  // Printing
  { category: 'Printing/Marketing', item: 'Flyers/brochures (color, 500 qty)', range: '$80–$180', unit: 'per run', how: 'Get quote from Vistaprint, Canva Print, or local print shop.', notes: 'Double-sided, full color, 8.5×11 baseline.' },
  { category: 'Printing/Marketing', item: 'Banner (vinyl, 3×6 ft)', range: '$40–$90', unit: 'each', how: 'Vistaprint or comparable banner vendor online price.', notes: 'Grommets included.' },
];

const CATEGORIES = [...new Set(FMV_DATA.map(d => d.category))];

export default function InKindFMVLibrary() {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  const filtered = FMV_DATA.filter(item => {
    const matchesCat = selectedCategory === 'All' || item.category === selectedCategory;
    const q = search.toLowerCase();
    const matchesSearch = !q || item.item.toLowerCase().includes(q) || item.category.toLowerCase().includes(q) || item.notes.toLowerCase().includes(q);
    return matchesCat && matchesSearch;
  });

  const catColor = { 'Facility/Space': 'bg-blue-100 text-blue-800', 'Food/Bev': 'bg-orange-100 text-orange-800', 'Equipment': 'bg-purple-100 text-purple-800', 'Apparel/Uniforms': 'bg-pink-100 text-pink-800', 'Professional Services': 'bg-emerald-100 text-emerald-800', 'Technology': 'bg-cyan-100 text-cyan-800', 'Transportation': 'bg-yellow-100 text-yellow-800', 'Printing/Marketing': 'bg-rose-100 text-rose-800' };

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-bold text-[#143A50]">FMV Reference Library</h2>
        <p className="text-sm text-slate-500">Starting-point benchmarks for common in-kind gifts. Always document your specific source for each individual gift.</p>
      </div>

      <Alert className="bg-amber-50 border-amber-200">
        <Info className="w-4 h-4 text-amber-600" />
        <AlertDescription className="text-amber-800 text-sm">
          <strong>Important:</strong> These are starting-point benchmarks only — not authoritative valuations.
          For each gift, you must document the specific source that supports the FMV you use. The IRS expects
          you to use the price a willing buyer would pay a willing seller — document comparable sales, published rates,
          or professional appraisals as appropriate.
        </AlertDescription>
      </Alert>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input placeholder="Search items..." className="pl-9" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <div className="flex flex-wrap gap-2">
          {['All', ...CATEGORIES].map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
                selectedCategory === cat
                  ? 'bg-[#143A50] text-white border-[#143A50]'
                  : 'bg-white text-slate-600 border-slate-200 hover:border-[#143A50]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <div className="hidden md:grid grid-cols-12 gap-2 px-4 py-2 bg-slate-100 rounded-lg text-xs font-semibold text-slate-600 uppercase tracking-wide">
          <div className="col-span-2">Category</div>
          <div className="col-span-3">Item / Service</div>
          <div className="col-span-2">Typical FMV Range</div>
          <div className="col-span-1">Unit</div>
          <div className="col-span-4">How to Document</div>
        </div>
        {filtered.map((item, i) => (
          <Card key={i} className="overflow-hidden">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-2 px-4 py-3 items-start">
              <div className="col-span-2">
                <Badge className={catColor[item.category] || 'bg-slate-100 text-slate-700'}>{item.category}</Badge>
              </div>
              <div className="col-span-3">
                <p className="font-medium text-sm text-slate-900">{item.item}</p>
                {item.notes && <p className="text-xs text-slate-400 mt-0.5">{item.notes}</p>}
              </div>
              <div className="col-span-2">
                <p className="font-bold text-emerald-700">{item.range}</p>
              </div>
              <div className="col-span-1">
                <p className="text-sm text-slate-600">{item.unit}</p>
              </div>
              <div className="col-span-4">
                <p className="text-sm text-slate-600">{item.how}</p>
              </div>
            </div>
          </Card>
        ))}
        {filtered.length === 0 && (
          <Card><CardContent className="py-10 text-center text-slate-500">No items match your search.</CardContent></Card>
        )}
      </div>
    </div>
  );
}