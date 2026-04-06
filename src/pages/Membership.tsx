import { motion } from "framer-motion";
import { Check, X } from "lucide-react";
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useState } from "react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

const features = [
  { name: "Digital app access", community: true, member: true, collective: true },
  { name: "Event recording access", community: "2-week delay", member: "Immediate", collective: "Immediate" },
  { name: "Live event attendance", community: false, member: true, collective: true },
  { name: "Companion worksheets", community: false, member: true, collective: true },
  { name: "MINDCAST app suite", community: "Basic", member: "Full", collective: "Full" },
  { name: "Module library", community: "Starter", member: "Full library", collective: "Full library" },
  { name: "Facilitator inner circle", community: false, member: false, collective: true },
  { name: "Monthly guest pass", community: false, member: false, collective: true },
  { name: "Priority event booking", community: false, member: false, collective: true },
];

const faqs = [
  { q: "Do I need to attend live to get value?", a: "Not at all. Recordings, worksheets, and the app suite are available to all members. Live events are an add-on that deepens the practice." },
  { q: "Can I cancel anytime?", a: "Yes. No lock-in contracts. Cancel from your portal at any time and your access continues until the end of your billing period." },
  { q: "What apps are included?", a: "All memberships include access to MINDCAST Relationships, Little Minds Big Questions, MINDCAST Wellness, and the Module Library." },
  { q: "Is this therapy?", a: "No. MINDCAST is a structured life practice. We complement therapy but don't replace it. If you're in crisis, please reach out to a professional." },
  { q: "What is the Facilitator Circle?", a: "An exclusive group for Collective members who want to lead MINDCAST practices in their own communities. Includes training, resources, and peer support." },
  { q: "Can I gift a membership?", a: "Yes! Gift memberships are available for Member and Collective tiers. Contact us for details." },
];

const CellValue = ({ value }: { value: boolean | string }) => {
  if (value === true) return <Check className="w-4 h-4 text-primary mx-auto" />;
  if (value === false) return <X className="w-4 h-4 text-primary/20 mx-auto" />;
  return <span className="text-xs text-muted-foreground">{value}</span>;
};

const Membership = () => (
  <>
    <Navbar />
    <section className="section-navy min-h-[50vh] flex items-center pt-16">
      <div className="container mx-auto px-6 text-center py-24">
        <motion.h1 initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} className="heading-display text-5xl sm:text-6xl md:text-8xl max-w-4xl mx-auto leading-[0.9]">
          CHOOSE YOUR PRACTICE
        </motion.h1>
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }} className="mt-8 text-cream/60 font-body text-base max-w-xl mx-auto">
          Every tier gives you access to the MINDCAST ecosystem. Choose what fits your life right now.
        </motion.p>
      </div>
    </section>

    {/* Comparison Table */}
    <section className="section-white py-24">
      <div className="container mx-auto px-6">
        <div className="max-w-4xl mx-auto overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b-[3px] border-primary">
                <th className="text-left py-6 pr-4"></th>
                <th className="py-6 px-4 text-center">
                  <span className="font-display text-xl tracking-widest text-primary block">COMMUNITY</span>
                  <span className="font-display text-3xl text-primary">FREE</span>
                </th>
                <th className="py-6 px-4 text-center bg-primary/5">
                  <span className="text-[10px] tracking-widest text-cream bg-primary px-3 py-1 mb-2 inline-block">RECOMMENDED</span>
                  <span className="font-display text-xl tracking-widest text-primary block">MEMBER</span>
                  <span className="font-display text-3xl text-primary">$25<span className="text-sm text-muted-foreground">/mo</span></span>
                </th>
                <th className="py-6 px-4 text-center">
                  <span className="font-display text-xl tracking-widest text-primary block">COLLECTIVE</span>
                  <span className="font-display text-3xl text-primary">$65<span className="text-sm text-muted-foreground">/mo</span></span>
                </th>
              </tr>
            </thead>
            <tbody>
              {features.map((f, i) => (
                <tr key={i} className="border-b border-primary/10">
                  <td className="py-4 pr-4 text-sm text-muted-foreground font-body">{f.name}</td>
                  <td className="py-4 px-4 text-center"><CellValue value={f.community} /></td>
                  <td className="py-4 px-4 text-center bg-primary/5"><CellValue value={f.member} /></td>
                  <td className="py-4 px-4 text-center"><CellValue value={f.collective} /></td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr>
                <td></td>
                <td className="py-6 px-4 text-center"><Link to="/portal" className="btn-navy text-xs py-3 px-6 inline-block">GET STARTED</Link></td>
                <td className="py-6 px-4 text-center bg-primary/5"><Link to="/portal" className="btn-navy text-xs py-3 px-6 inline-block">JOIN NOW</Link></td>
                <td className="py-6 px-4 text-center"><Link to="/portal" className="btn-navy text-xs py-3 px-6 inline-block">JOIN NOW</Link></td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </section>

    {/* FAQ */}
    <section className="section-navy py-24">
      <div className="container mx-auto px-6 max-w-3xl">
        <h2 className="heading-display text-4xl md:text-6xl text-center mb-16">FREQUENTLY ASKED</h2>
        <Accordion type="single" collapsible>
          {faqs.map((faq, i) => (
            <AccordionItem key={i} value={`faq-${i}`} className="border-cream/10">
              <AccordionTrigger className="text-cream/80 text-sm tracking-wider hover:no-underline">{faq.q}</AccordionTrigger>
              <AccordionContent className="text-cream/50 text-sm font-body leading-relaxed">{faq.a}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>

    <Footer />
  </>
);

export default Membership;
