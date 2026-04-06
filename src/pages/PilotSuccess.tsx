import { motion } from "framer-motion";
import { CheckCircle, Calendar, MapPin, Headphones, Mail } from "lucide-react";
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const PilotSuccess = () => (
  <>
    <Navbar />
    <section className="section-navy min-h-[80vh] flex items-center pt-24 pb-16">
      <div className="container mx-auto px-6 max-w-2xl">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-10"
        >
          <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-6" />
          <h1 className="font-display text-4xl sm:text-5xl md:text-6xl tracking-wider leading-[0.95] mb-6">
            YOU'RE IN. WELCOME TO THE FOUNDING PILOT.
          </h1>
          <p className="text-cream/70 font-body text-base leading-relaxed max-w-xl mx-auto">
            Your payment was successful and your spot is confirmed. Check your email — you will receive your login details for the Mindcast member portal within the next few minutes. Your first episode will be ready to listen to from Monday 13 April.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="border-2 border-cream/20 p-8 mb-10"
        >
          <h2 className="font-display text-2xl tracking-wider mb-6 text-center">WHAT'S NEXT</h2>
          <div className="space-y-5">
            <div className="flex items-start gap-4">
              <Calendar className="w-5 h-5 text-cream/60 mt-0.5 shrink-0" />
              <div>
                <p className="font-display text-sm tracking-wider text-cream/90">FIRST SESSION</p>
                <p className="font-body text-sm text-cream/60">Tuesday 21 April 2026, 5:30pm</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <MapPin className="w-5 h-5 text-cream/60 mt-0.5 shrink-0" />
              <div>
                <p className="font-display text-sm tracking-wider text-cream/90">LOCATION</p>
                <p className="font-body text-sm text-cream/60">111 Jarden Mile, Taupō</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <Headphones className="w-5 h-5 text-cream/60 mt-0.5 shrink-0" />
              <div>
                <p className="font-display text-sm tracking-wider text-cream/90">WHAT TO DO NOW</p>
                <p className="font-body text-sm text-cream/60">
                  Listen to the Johann Hari episode on Diary of a CEO before Session 1.
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.4 }}
          className="text-center space-y-4"
        >
          <Link
            to="/portal/login"
            className="inline-block bg-cream text-primary font-display text-lg tracking-widest px-10 py-4 hover:bg-cream/90 transition-colors"
          >
            LOGIN TO YOUR PORTAL
          </Link>
          <p className="text-cream/40 font-body text-xs flex items-center justify-center gap-1.5">
            <Mail className="w-3.5 h-3.5" />
            Questions? Email admin@mindcast.co.nz
          </p>
        </motion.div>
      </div>
    </section>
    <Footer />
  </>
);

export default PilotSuccess;
