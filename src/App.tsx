import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Live from "./pages/Live";
import Resources from "./pages/Resources";
import Membership from "./pages/Membership";
import Portal from "./pages/Portal";
import About from "./pages/About";
import EcosystemPage from "./pages/EcosystemPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/live" element={<Live />} />
          <Route path="/resources" element={<Resources />} />
          <Route path="/membership" element={<Membership />} />
          <Route path="/portal" element={<Portal />} />
          <Route path="/about" element={<About />} />
          <Route path="/ecosystem" element={<EcosystemPage />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
