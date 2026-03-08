import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import PositioningStrip from "@/components/PositioningStrip";
import Framework from "@/components/Framework";
import Ecosystem from "@/components/Ecosystem";
import LivePreview from "@/components/LivePreview";
import ResourcesPreview from "@/components/ResourcesPreview";
import Testimonials from "@/components/Testimonials";
import MembershipSnapshot from "@/components/MembershipSnapshot";
import Waitlist from "@/components/Waitlist";
import Footer from "@/components/Footer";

const Index = () => (
  <>
    <Navbar />
    <Hero />
    <PositioningStrip />
    <Framework />
    <Ecosystem />
    <LivePreview />
    <ResourcesPreview />
    <Testimonials />
    <MembershipSnapshot />
    <Waitlist />
    <Footer />
  </>
);

export default Index;
