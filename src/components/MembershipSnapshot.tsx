import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { Link } from "react-router-dom";

const tiers = [
  {
    name: "COMMUNITY",
    price: "FREE",
    period: "",
    features: ["Digital tools access", "Event recordings (2-week delay)", "Community forum"],
    highlighted: false,
    badge: "",
  },
  {
    name: "MEMBER",
    price: "$25",
    period: "/mo",
    features: ["Live event access weekly", "Companion worksheets", "All apps included", "Full module library"],
    highlighted: true,
    badge: "RECOMMENDED",
  },
  {
    name: "COLLECTIVE",
    price: "$65",
    period: "/mo",
    features: ["Everything in Member", "Facilitator circle", "Priority booking", "Monthly guest pass"],
    highlighted: false,
    badge: "",
  },
];

const MembershipSnapshot = () => (
  <section className="section-white py-24 md:py-32">
    <div className="container mx-auto px-6">
      <motion.h2
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="heading-display text-5xl md:text-7xl text-center mb-20 text-primary"
      >
        CHOOSE YOUR PRACTICE
      </motion.h2>

      <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto mb-12">
        {tiers.map((tier, i) => (
          <motion.div
            key={tier.name}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: i * 0.1 }}
            className={`border-[3px] p-8 flex flex-col relative ${
              tier.highlighted
                ? "border-primary bg-primary text-silver"
                : "border-primary bg-background text-primary"
            }`}
          >
            {tier.badge && (
              <span className="absolute -top-4 left-8 bg-silver text-primary text-xs tracking-widest px-4 py-1 font-medium">
                {tier.badge}
              </span>
            )}
            <h3 className="font-display text-2xl tracking-widest mb-2">{tier.name}</h3>
            <div className="mb-6">
              <span className="font-display text-5xl">{tier.price}</span>
              {tier.period && (
                <span className={`text-sm ml-1 ${tier.highlighted ? "text-silver/60" : "text-muted-foreground"}`}>
                  {tier.period}
                </span>
              )}
            </div>
            <ul className="space-y-3 flex-1 mb-8">
              {tier.features.map((f) => (
                <li key={f} className="flex items-start gap-3 text-sm font-body">
                  <Check className={`w-4 h-4 mt-0.5 flex-shrink-0 ${tier.highlighted ? "text-silver/70" : "text-primary/50"}`} />
                  <span className={tier.highlighted ? "text-silver/80" : "text-muted-foreground"}>{f}</span>
                </li>
              ))}
            </ul>
            <Link
              to="/membership"
              className={`text-center text-xs ${tier.highlighted ? "btn-filled" : "btn-navy"}`}
            >
              GET STARTED
            </Link>
          </motion.div>
        ))}
      </div>

      <div className="text-center">
        <Link to="/membership" className="btn-navy text-xs">SEE FULL MEMBERSHIP DETAILS</Link>
      </div>
    </div>
  </section>
);

export default MembershipSnapshot;
