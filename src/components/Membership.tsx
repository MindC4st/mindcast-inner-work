import { motion } from "framer-motion";
import { Check } from "lucide-react";

const tiers = [
  {
    name: "FREE",
    price: "$0",
    period: "forever",
    features: ["Digital tools access", "Community forum", "Weekly newsletter"],
    highlighted: false,
  },
  {
    name: "PLUS",
    price: "$29",
    period: "/mo",
    features: ["Live events access", "Learning modules", "All apps included", "Monthly workshops"],
    highlighted: true,
  },
  {
    name: "COLLECTIVE",
    price: "$79",
    period: "/mo",
    features: ["Everything in Plus", "Worksheets & workbooks", "Session recordings", "Priority support", "1-on-1 coaching calls"],
    highlighted: false,
  },
];

const Membership = () => (
  <section id="membership" className="section-white py-24 md:py-32">
    <div className="container mx-auto px-6">
      <motion.h2
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="heading-display text-5xl md:text-7xl text-center mb-20 text-primary"
      >
        MEMBERSHIP
      </motion.h2>

      <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
        {tiers.map((tier, i) => (
          <motion.div
            key={tier.name}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: i * 0.1 }}
            className={`border-2 p-8 flex flex-col ${
              tier.highlighted
                ? "border-primary bg-primary text-silver"
                : "border-primary bg-background text-primary"
            }`}
          >
            <h3 className="font-display text-2xl tracking-widest mb-2">{tier.name}</h3>
            <div className="mb-6">
              <span className="font-display text-5xl">{tier.price}</span>
              <span className={`text-sm ml-1 ${tier.highlighted ? "text-silver/60" : "text-muted-foreground"}`}>
                {tier.period}
              </span>
            </div>
            <ul className="space-y-3 flex-1 mb-8">
              {tier.features.map((f) => (
                <li key={f} className="flex items-start gap-3 text-sm font-body">
                  <Check className={`w-4 h-4 mt-0.5 flex-shrink-0 ${tier.highlighted ? "text-silver/70" : "text-primary/50"}`} />
                  <span className={tier.highlighted ? "text-silver/80" : "text-muted-foreground"}>
                    {f}
                  </span>
                </li>
              ))}
            </ul>
            <a
              href="#waitlist"
              className={tier.highlighted ? "btn-filled text-center text-xs" : "btn-navy text-center text-xs"}
            >
              GET STARTED
            </a>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);

export default Membership;
