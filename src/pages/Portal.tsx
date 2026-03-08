import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { ImagePlaceholderDark } from "@/components/ImagePlaceholder";
import { LogOut, Calendar, FileText, Play, Layout } from "lucide-react";

const Portal = () => {
  const [loggedIn, setLoggedIn] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const userName = "MEMBER";

  if (!loggedIn) {
    return (
      <>
        <Navbar />
        <section className="section-navy min-h-screen flex items-center pt-16">
          <div className="container mx-auto px-6 max-w-md text-center">
            <motion.h1 initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="heading-display text-5xl mb-4">MEMBER PORTAL</motion.h1>
            <p className="text-silver/50 text-sm mb-12">Use your membership email.</p>
            <form onSubmit={(e) => { e.preventDefault(); if (email && password) { localStorage.setItem("mindcast-auth", "true"); setLoggedIn(true); }}} className="space-y-4">
              <input type="email" placeholder="EMAIL" value={email} onChange={(e) => setEmail(e.target.value)} required className="w-full bg-transparent border-2 border-silver/30 text-silver px-6 py-4 text-sm tracking-widest placeholder:text-silver/30 focus:border-silver focus:outline-none" />
              <input type="password" placeholder="PASSWORD" value={password} onChange={(e) => setPassword(e.target.value)} required className="w-full bg-transparent border-2 border-silver/30 text-silver px-6 py-4 text-sm tracking-widest placeholder:text-silver/30 focus:border-silver focus:outline-none" />
              <button type="submit" className="btn-filled w-full text-xs">ENTER YOUR PORTAL</button>
            </form>
          </div>
        </section>
        <Footer />
      </>
    );
  }

  const upcomingEvents = [
    { date: "SUNDAY 15 MARCH — 6:00PM", topic: "The Anatomy of a Difficult Conversation" },
    { date: "SUNDAY 22 MARCH — 6:00PM", topic: "Nervous System Regulation in Daily Life" },
  ];

  const purchasedResources = [
    "THE WEEKLY REFLECTION KIT",
    "HARD CONVERSATION GUIDE",
    "NERVOUS SYSTEM RESET",
  ];

  const recordings = [
    { title: "Grief as a Teacher", locked: false },
    { title: "The Practice of Repair", locked: false },
    { title: "Embodied Listening", locked: true },
    { title: "Consent in Everyday Life", locked: true },
  ];

  const apps = [
    { name: "RELATIONSHIPS", desc: "Couples & families" },
    { name: "LITTLE MINDS", desc: "Kids' big questions" },
    { name: "WELLNESS", desc: "Cycle-synced tools" },
    { name: "MODULE LIBRARY", desc: "Learning modules" },
  ];

  const activity = [
    "You attended 3 sessions this month",
    "New resource added: Nervous System Reset",
    "Next session: Sunday 15 March",
  ];

  return (
    <>
      <Navbar />
      {/* Dashboard Header */}
      <section className="section-navy pt-24 pb-12">
        <div className="container mx-auto px-6 flex items-center justify-between">
          <div>
            <h1 className="heading-display text-4xl md:text-5xl">WELCOME BACK, {userName}</h1>
            <span className="inline-block mt-3 border-2 border-silver/30 text-silver/60 text-[10px] tracking-widest px-4 py-1">MEMBER — $25/MO</span>
          </div>
          <button onClick={() => { localStorage.removeItem("mindcast-auth"); setLoggedIn(false); }} className="btn-outlined text-xs py-2 px-4 flex items-center gap-2"><LogOut size={14} /> LOG OUT</button>
        </div>
      </section>

      {/* Tonight's Session */}
      <section className="section-white pt-16 pb-0">
        <div className="container mx-auto px-6">
          <div className="max-w-5xl mx-auto">
            <Link to="/session/communication-reset" className="block border-[3px] border-primary bg-primary p-8 hover:bg-primary/90 transition-colors">
              <span className="text-silver/40 text-[10px] tracking-widest">TONIGHT'S SESSION</span>
              <h2 className="font-display text-2xl tracking-widest text-silver mt-1">COMMUNICATION RESET</h2>
              <span className="text-silver/50 text-xs tracking-widest mt-2 inline-flex items-center gap-2">OPEN MODULE →</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Dashboard Grid */}
      <section className="section-white py-8">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-6 max-w-5xl mx-auto">
            {/* Upcoming Events */}
            <div className="border-[3px] border-primary p-8">
              <div className="flex items-center gap-3 mb-6"><Calendar size={20} className="text-primary" /><h2 className="font-display text-xl tracking-widest text-primary">UPCOMING EVENTS</h2></div>
              {upcomingEvents.map((e, i) => (
                <div key={i} className="border-b border-primary/10 py-4 last:border-0">
                  <p className="text-xs tracking-widest text-primary/40 mb-1">{e.date}</p>
                  <p className="text-sm text-primary font-body mb-3">{e.topic}</p>
                  <button className="btn-navy text-xs py-2 px-4">RESERVE</button>
                </div>
              ))}
            </div>

            {/* My Resources */}
            <div className="border-[3px] border-primary p-8">
              <div className="flex items-center gap-3 mb-6"><FileText size={20} className="text-primary" /><h2 className="font-display text-xl tracking-widest text-primary">MY RESOURCES</h2></div>
              {purchasedResources.map((r, i) => (
                <div key={i} className="flex items-center justify-between border-b border-primary/10 py-4 last:border-0">
                  <span className="text-sm text-primary font-body">{r}</span>
                  <button className="btn-navy text-xs py-1 px-3">DOWNLOAD</button>
                </div>
              ))}
            </div>

            {/* Session Recordings */}
            <div className="border-[3px] border-primary p-8">
              <div className="flex items-center gap-3 mb-6"><Play size={20} className="text-primary" /><h2 className="font-display text-xl tracking-widest text-primary">SESSION RECORDINGS</h2></div>
              <div className="grid grid-cols-2 gap-3">
                {recordings.map((r, i) => (
                  <div key={i} className="relative">
                    <ImagePlaceholderDark label="Recording thumbnail" className="w-full h-24 mb-2" />
                    {r.locked && <span className="absolute top-2 right-2 bg-silver text-primary text-[9px] tracking-widest px-2 py-0.5">UPGRADE</span>}
                    <p className="text-xs text-primary font-body">{r.title}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* My Apps */}
            <div className="border-[3px] border-primary p-8">
              <div className="flex items-center gap-3 mb-6"><Layout size={20} className="text-primary" /><h2 className="font-display text-xl tracking-widest text-primary">MY APPS</h2></div>
              <div className="grid grid-cols-2 gap-3">
                {apps.map((a, i) => (
                  <div key={i} className="border-2 border-primary/20 p-4 hover:border-primary transition-colors cursor-pointer">
                    <h3 className="font-display text-sm tracking-wider text-primary">{a.name}</h3>
                    <p className="text-xs text-muted-foreground">{a.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="max-w-5xl mx-auto mt-6 border-[3px] border-primary p-8">
            <h2 className="font-display text-xl tracking-widest text-primary mb-4">RECENT ACTIVITY</h2>
            {activity.map((a, i) => (
              <p key={i} className="text-sm text-muted-foreground font-body py-2 border-b border-primary/10 last:border-0">{a}</p>
            ))}
          </div>

          {/* Account Settings */}
          <div className="max-w-5xl mx-auto mt-6 border-[3px] border-primary p-8">
            <h2 className="font-display text-xl tracking-widest text-primary mb-6">ACCOUNT SETTINGS</h2>
            <div className="grid md:grid-cols-3 gap-6">
              <div><p className="text-xs tracking-widest text-primary/40 mb-1">NAME</p><p className="text-sm text-primary">Member Name</p></div>
              <div><p className="text-xs tracking-widest text-primary/40 mb-1">EMAIL</p><p className="text-sm text-primary">{email || "member@mindcast.co"}</p></div>
              <div><p className="text-xs tracking-widest text-primary/40 mb-1">MEMBERSHIP</p><p className="text-sm text-primary">MEMBER — $25/mo</p></div>
            </div>
            <button className="btn-navy text-xs py-2 px-6 mt-6">MANAGE BILLING</button>
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
};

export default Portal;
