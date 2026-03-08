import { useState } from "react";
import { motion } from "framer-motion";
import { X, ShoppingCart } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ImagePlaceholder from "@/components/ImagePlaceholder";

interface Product {
  id: number;
  title: string;
  price: number;
  category: string;
  desc: string;
  badge?: string;
}

const products: Product[] = [
  { id: 1, title: "THE WEEKLY REFLECTION KIT", price: 12, category: "SELF-DISCOVERY", desc: "4-week journaling practice. One prompt per day." },
  { id: 2, title: "HARD CONVERSATION GUIDE", price: 18, category: "RELATIONSHIPS", desc: "A step-by-step worksheet for navigating difficult talks." },
  { id: 3, title: "NERVOUS SYSTEM RESET", price: 12, category: "NERVOUS SYSTEM", desc: "7-day breathwork and somatic practice guide." },
  { id: 4, title: "CYCLE AWARENESS JOURNAL", price: 22, category: "CYCLE & WELLNESS", desc: "Track your four phases across one full cycle." },
  { id: 5, title: "PARTS WORK INTRO", price: 15, category: "SELF-DISCOVERY", desc: "A guided IFS-inspired worksheet for meeting your inner parts." },
  { id: 6, title: "THE REPAIR PROTOCOL", price: 18, category: "RELATIONSHIPS", desc: "For couples: a structured 3-session repair process." },
  { id: 7, title: "BIG QUESTIONS FAMILY PACK", price: 25, category: "PARENTING", desc: "12 conversation cards for kids and parents. Ages 5–14." },
  { id: 8, title: "BOUNDARIES WORKBOOK", price: 22, category: "SELF-DISCOVERY", desc: "Identify, name, and communicate your limits." },
  { id: 9, title: "STARTER BUNDLE", price: 55, category: "BUNDLES", desc: "Best of MINDCAST: 5 core worksheets. Save 30%.", badge: "BEST VALUE" },
];

const categories = ["ALL", "RELATIONSHIPS", "SELF-DISCOVERY", "NERVOUS SYSTEM", "PARENTING", "CYCLE & WELLNESS", "BUNDLES"];

interface CartItem { product: Product; qty: number; }

const Resources = () => {
  const [filter, setFilter] = useState("ALL");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [cartOpen, setCartOpen] = useState(false);

  const filtered = filter === "ALL" ? products : products.filter((p) => p.category === filter);

  const addToCart = (product: Product) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.product.id === product.id);
      if (existing) return prev.map((i) => i.product.id === product.id ? { ...i, qty: i.qty + 1 } : i);
      return [...prev, { product, qty: 1 }];
    });
    setCartOpen(true);
  };

  const removeFromCart = (id: number) => setCart((prev) => prev.filter((i) => i.product.id !== id));
  const total = cart.reduce((sum, i) => sum + i.product.price * i.qty, 0);
  const cartCount = cart.reduce((sum, i) => sum + i.qty, 0);

  return (
    <>
      <Navbar />
      <section className="section-navy min-h-[50vh] flex items-center pt-16">
        <div className="container mx-auto px-6 text-center py-24">
          <motion.h1 initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} className="heading-display text-5xl sm:text-6xl md:text-8xl max-w-4xl mx-auto leading-[0.9]">
            TOOLS YOU KEEP WORKING WITH
          </motion.h1>
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }} className="mt-8 text-silver/60 font-body text-base max-w-xl mx-auto">
            Every resource is a standalone inner work practice — designed to be used once a week, for life.
          </motion.p>
        </div>
      </section>

      {/* Member discount banner */}
      <div className="bg-primary border-y-[3px] border-silver/20 py-4">
        <p className="text-center text-silver/70 text-xs tracking-[0.2em]">MEMBERS SAVE 20% ON EVERYTHING — AUTOMATICALLY APPLIED AT CHECKOUT</p>
      </div>

      {/* Filter bar */}
      <section className="section-white py-8 border-b-2 border-primary/10 sticky top-16 z-40 bg-background">
        <div className="container mx-auto px-6">
          <div className="flex items-center justify-between">
            <div className="flex flex-wrap gap-3">
              {categories.map((cat) => (
                <button key={cat} onClick={() => setFilter(cat)} className={`text-xs tracking-widest px-4 py-2 border-2 transition-colors ${filter === cat ? "border-primary bg-primary text-silver" : "border-primary/20 text-primary/50 hover:border-primary"}`}>
                  {cat}
                </button>
              ))}
            </div>
            <button onClick={() => setCartOpen(true)} className="relative btn-navy text-xs py-2 px-4 flex items-center gap-2">
              <ShoppingCart size={14} /> CART
              {cartCount > 0 && <span className="absolute -top-2 -right-2 bg-silver text-primary text-[10px] w-5 h-5 flex items-center justify-center">{cartCount}</span>}
            </button>
          </div>
        </div>
      </section>

      {/* Product grid */}
      <section className="section-white py-16">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {filtered.map((p, i) => (
              <motion.div key={p.id} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }} className="border-[3px] border-primary p-6 relative flex flex-col">
                {p.badge && <span className="absolute top-4 right-4 bg-primary text-silver text-[10px] tracking-widest px-3 py-1">{p.badge}</span>}
                <ImagePlaceholder label="Worksheet/workbook mockup A4" className="w-full h-48 mb-4" />
                <span className="text-[10px] tracking-widest text-primary/40 mb-2">{p.category}</span>
                <h3 className="font-display text-lg tracking-wider text-primary mb-2">{p.title}</h3>
                <p className="text-sm text-muted-foreground mb-4 flex-1">{p.desc}</p>
                <div className="flex items-center justify-between">
                  <span className="font-display text-2xl text-primary">${p.price}</span>
                  <div className="flex gap-2">
                    <button className="text-xs tracking-widest text-primary/50 hover:text-primary transition-colors">PREVIEW</button>
                    <button onClick={() => addToCart(p)} className="btn-navy text-xs py-2 px-4">ADD TO CART</button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Cart slide-out */}
      {cartOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-primary/50" onClick={() => setCartOpen(false)} />
          <motion.div initial={{ x: "100%" }} animate={{ x: 0 }} className="relative w-full max-w-md bg-background border-l-[3px] border-primary h-full overflow-y-auto p-8">
            <div className="flex items-center justify-between mb-8">
              <h2 className="font-display text-3xl tracking-wider text-primary">YOUR CART</h2>
              <button onClick={() => setCartOpen(false)} className="text-primary"><X size={24} /></button>
            </div>
            {cart.length === 0 ? (
              <p className="text-muted-foreground text-sm">Your cart is empty.</p>
            ) : (
              <>
                {cart.map((item) => (
                  <div key={item.product.id} className="flex items-start justify-between border-b border-primary/10 py-4">
                    <div>
                      <h3 className="font-display text-sm tracking-wider text-primary">{item.product.title}</h3>
                      <p className="text-xs text-muted-foreground">Qty: {item.qty} × ${item.product.price}</p>
                    </div>
                    <button onClick={() => removeFromCart(item.product.id)} className="text-primary/40 hover:text-primary"><X size={16} /></button>
                  </div>
                ))}
                <div className="mt-8 pt-4 border-t-2 border-primary">
                  <div className="flex justify-between mb-6">
                    <span className="font-display text-xl tracking-wider text-primary">TOTAL</span>
                    <span className="font-display text-2xl text-primary">${total}</span>
                  </div>
                  <button className="btn-navy text-xs w-full py-4">CHECKOUT</button>
                </div>
              </>
            )}
          </motion.div>
        </div>
      )}

      <Footer />
    </>
  );
};

export default Resources;
