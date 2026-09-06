import { useState, useRef, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, ArrowRight } from 'lucide-react';
import {
  useGetSettings,
  useGetPricingPlans,
  useGetServices,
  useGetProjects,
  useGetTestimonials,
} from '@workspace/api-client-react';

// ── Modern chat icon (custom SVG) ────────────────────────────────────────────

function ChatIcon({ className = '' }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" className={className}>
      <path
        d="M5.59961 19.9203L7.12357 18.7012L7.13478 18.6926C7.45249 18.4384 7.61281 18.3101 7.79168 18.2188C7.95216 18.1368 8.12328 18.0771 8.2998 18.0408C8.49877 18 8.70603 18 9.12207 18H17.8031C18.921 18 19.4806 18 19.908 17.7822C20.2843 17.5905 20.5905 17.2842 20.7822 16.9079C21 16.4805 21 15.9215 21 14.8036V7.19691C21 6.07899 21 5.5192 20.7822 5.0918C20.5905 4.71547 20.2837 4.40973 19.9074 4.21799C19.4796 4 18.9203 4 17.8002 4H6.2002C5.08009 4 4.51962 4 4.0918 4.21799C3.71547 4.40973 3.40973 4.71547 3.21799 5.0918C3 5.51962 3 6.08009 3 7.2002V18.6712C3 19.7369 3 20.2696 3.21846 20.5433C3.40845 20.7813 3.69644 20.9198 4.00098 20.9195C4.35115 20.9191 4.76744 20.5861 5.59961 19.9203Z"
        stroke="white"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

// ── WhatsApp icon ─────────────────────────────────────────────────────────────

function WaIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="white" xmlns="http://www.w3.org/2000/svg">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
      <path d="M12 0C5.373 0 0 5.373 0 12c0 2.126.554 4.124 1.528 5.856L.057 23.625c-.073.27.006.554.2.737.194.183.46.25.718.175L7.07 22.9A11.935 11.935 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.818 9.818 0 01-5.017-1.376l-.358-.214-3.718 1.002 1.01-3.668-.234-.378A9.817 9.817 0 012.182 12C2.182 6.573 6.573 2.182 12 2.182c5.427 0 9.818 4.391 9.818 9.818 0 5.427-4.391 9.818-9.818 9.818z"/>
    </svg>
  );
}

// ── Types ─────────────────────────────────────────────────────────────────────

type Msg = {
  id: number;
  from: 'bot' | 'user';
  text: string;
  showWa?: boolean;
};

// ── Static FAQ base (patterns scored by priority × 1000 + length) ────────────

interface FAQ {
  patterns: string[];
  answer: string;
  priority?: number; // default 10
}

const STATIC_FAQS: FAQ[] = [
  // Greetings
  {
    priority: 5,
    patterns: ['hello', 'hi', 'hey', 'sup', "what's up", 'howdy', 'hiya', 'good morning', 'good afternoon', 'good evening'],
    answer: "Hey! Welcome to Espy Media. Ask me anything — services, pricing, how we work, or anything else you'd like to know!",
  },

  // ── PRICING (priority 30 — must beat any "website" match) ────────────────
  {
    priority: 30,
    patterns: [
      'price', 'pricing', 'cost', 'how much', 'rates', 'charge', 'fees',
      'packages', 'plans', 'website price', 'website cost', 'website charge',
      'website prices', 'your prices', 'your pricing', 'what are your prices',
      'site cost', 'site price', 'what does it cost', 'how much does a website',
      'how much for a website', 'cheapest', 'affordable', 'budget',
    ],
    answer: '', // dynamically built from live data
    _key: 'pricing',
  } as any,

  // Individual plans
  {
    priority: 30,
    patterns: ['starter plan', 'starter package', 'starter', '7000', '7,000', '₹7000', '₹7,000'],
    answer: '', _key: 'starter',
  } as any,
  {
    priority: 30,
    patterns: ['business plan', 'business package', '13000', '13,000', '₹13000', '₹13,000'],
    answer: '', _key: 'business',
  } as any,
  {
    priority: 30,
    patterns: ['custom plan', 'enterprise', 'custom quote', 'custom pricing', 'fully custom', 'web app', 'booking system', 'payment gateway integration'],
    answer: "The Custom Plan is for businesses that need something beyond a standard site — like web applications, booking systems, payment gateways, CRM integrations, or custom automations. Pricing is scoped per project. Reach out and we'll put together a detailed quote.",
  },

  // ── PAYMENT ───────────────────────────────────────────────────────────────
  {
    priority: 30,
    patterns: [
      'payment mode', 'payment method', 'how to pay', 'how can i pay',
      'payment options', 'do you accept', 'upi', 'bank transfer', 'cash',
      'online payment', 'card payment', 'razorpay', 'gpay', 'paytm', 'neft', 'imps',
    ],
    answer: "We accept UPI, bank transfer (NEFT/IMPS/RTGS), and major payment apps like GPay, PhonePe, and Paytm. We typically take 50% upfront and the remaining 50% on delivery. Reach out on WhatsApp to sort out payment details for your project.",
  },

  // ── SERVICES OVERVIEW ─────────────────────────────────────────────────────
  {
    priority: 15,
    patterns: [
      'what do you do', 'what is espy', 'about espy', 'who are you',
      'what does espy do', 'what services', 'offerings', 'services offered',
      'all services', 'list of services',
    ],
    answer: '', _key: 'services',
  } as any,

  // ── WEB DESIGN ───────────────────────────────────────────────────────────
  {
    priority: 15,
    patterns: [
      'web design', 'build a site', 'build a website', 'develop a website',
      'web development', 'make a website', 'create a website', 'need a website',
      'new website', 'redesign', 'landing page',
    ],
    answer: "Our web design work is built for performance and conversions — not just looks. Every site includes:\n\n• Mobile-first & fully responsive\n• SEO-ready from day one\n• Sub-2s load times (Core Web Vitals optimised)\n• Conversion-optimised layouts\n• Brand identity integration\n\nMost projects ship in 3–6 weeks. Want to know pricing?",
  },
  { priority: 5, patterns: ['website'], answer: "We build custom websites tailored to your brand and goals — responsive, fast, SEO-ready, and conversion-focused. Want to know about pricing or the process?" },

  // ── PAID ADS ─────────────────────────────────────────────────────────────
  {
    priority: 15,
    patterns: [
      'paid ads', 'advertising', 'google ads', 'meta ads', 'facebook ads',
      'instagram ads', 'campaigns', 'run ads', 'ad management', 'ppc',
      'digital marketing', 'social media ads',
    ],
    answer: "We run paid ad campaigns on Meta (Facebook & Instagram) and Google Ads. We handle everything — strategy, ad creatives, targeting, A/B testing, and ongoing optimisation. The focus is always ROI, not just impressions.",
  },

  // ── LEAD GEN ─────────────────────────────────────────────────────────────
  {
    priority: 15,
    patterns: ['lead generation', 'get leads', 'lead gen', 'generate leads', 'more customers', 'pipeline'],
    answer: "Lead generation is a core part of what we do. We build systems — funnels, landing pages, paid campaigns — that attract and capture qualified leads for your business. Basically, we fill your pipeline.",
  },

  // ── BRANDING & GRAPHIC DESIGN ─────────────────────────────────────────────
  {
    priority: 15,
    patterns: [
      'branding', 'graphic design', 'logo', 'brand design', 'visual identity',
      'brand identity', 'social media design', 'poster', 'flyer', 'print design',
      'instagram post', 'creatives', 'brand guidelines',
    ],
    answer: "Our design team covers the full spectrum:\n\n• Logo & brand identity\n• Brand guidelines\n• Social media creatives (posts, reels, stories)\n• Print design (posters, flyers, packaging)\n• UI mockups & web graphics\n\nWe make sure your brand looks sharp and consistent everywhere.",
  },

  // ── ADMIN PANELS / CMS ───────────────────────────────────────────────────
  {
    priority: 20,
    patterns: ['admin panel', 'admin dashboard', 'cms', 'content management', 'backend', 'manage content', 'manage my website'],
    answer: "The Business and Custom plans both include a full admin panel (CMS) so you can manage your website content — pages, blog posts, projects, pricing, and more — without touching any code. The Starter Plan is more straightforward without a CMS.",
  },

  // ── E-COMMERCE ────────────────────────────────────────────────────────────
  {
    priority: 20,
    patterns: ['ecommerce', 'e-commerce', 'online store', 'shopify', 'sell online', 'product listing', 'online shop', 'cart', 'checkout'],
    answer: "Yes, we build e-commerce sites. Starter covers basic e-commerce, the Business Plan includes a full store with admin panel, and the Custom Plan handles advanced solutions — payment gateways, inventory, custom checkout flows, the works.",
  },

  // ── TIMELINE ─────────────────────────────────────────────────────────────
  {
    priority: 15,
    patterns: ['how long', 'delivery time', 'turnaround', 'how fast', 'deadline', 'duration', 'when will it be ready', 'how many days', 'how many weeks'],
    answer: "Most websites are delivered in 3–6 weeks. We're a lean team so there's no bloated agency overhead slowing things down. Complex custom projects may take longer — we'll give you a clear timeline before we start.",
  },

  // ── PROCESS ──────────────────────────────────────────────────────────────
  {
    priority: 15,
    patterns: ['process', 'how does it work', 'how do you work', 'what are the steps', 'what happens next', 'how to get started', 'get started', 'how to start', 'next steps'],
    answer: "Here's how we work:\n\n1. Discovery — We understand your brand, goals, and requirements.\n2. Strategy — We map out the approach and scope.\n3. Design — Mockups tailored to your brand.\n4. Build — Fast, clean code with performance in mind.\n5. Launch — We hand over, support, and stay in touch.\n\nNo surprises, just results.",
  },

  // ── SUPPORT & MAINTENANCE ────────────────────────────────────────────────
  {
    priority: 15,
    patterns: ['support', 'maintenance', 'after launch', 'post launch', 'help after', 'bug fix', 'changes after'],
    answer: "All plans include free post-launch support — Starter gets 6 months, Business and Custom get a full year. We don't disappear after handing over the site.",
  },

  // ── SEO ───────────────────────────────────────────────────────────────────
  {
    priority: 15,
    patterns: ['seo', 'search engine', 'google ranking', 'rank on google', 'search optimisation', 'search optimization', 'rank higher'],
    answer: "SEO is baked into every site we build — semantic HTML, schema markup, fast load times, and solid technical SEO from day one. Business Plan adds enhanced SEO, and Custom goes even further with advanced optimisation.",
  },

  // ── HOSTING & DOMAIN ─────────────────────────────────────────────────────
  {
    priority: 15,
    patterns: ['hosting', 'domain', 'free domain', 'free hosting', "what's included", 'included in the plan'],
    answer: "Free domain and free hosting (1 year) are included in all three plans. After the first year, standard renewal rates apply — we'll give you full transparency upfront.",
  },

  // ── PORTFOLIO / WORK ─────────────────────────────────────────────────────
  {
    priority: 15,
    patterns: ['portfolio', 'past work', 'examples', 'case study', 'previous projects', 'your work', 'show me work', 'clients', 'projects done'],
    answer: '', _key: 'projects',
  } as any,

  // ── TESTIMONIALS ─────────────────────────────────────────────────────────
  {
    priority: 15,
    patterns: ['testimonials', 'reviews', 'what do clients say', 'client feedback', 'ratings', 'happy clients', 'satisfied customers'],
    answer: '', _key: 'testimonials',
  } as any,

  // ── CONTACT / REACH US ───────────────────────────────────────────────────
  {
    priority: 15,
    patterns: ['contact', 'reach you', 'get in touch', 'talk to someone', 'speak to', 'call you', 'email you', 'reach out', 'inquiry', 'enquiry'],
    answer: "Best way is WhatsApp — we respond fast. You can also fill the contact form on our Contact page. Hit the button below to start a chat directly!",
    showWa: true,
  } as any,
  {
    priority: 15,
    patterns: ['whatsapp', 'chat with you', 'message you', 'wa number'],
    answer: "WhatsApp is our go-to! Tap the button below and it opens a direct chat with us. We usually reply within a few hours.",
    showWa: true,
  } as any,

  // ── WHY ESPY ─────────────────────────────────────────────────────────────
  {
    priority: 15,
    patterns: ['why espy', 'why choose you', 'what makes you different', 'why should i choose', 'unique', 'different from others', 'why not another agency'],
    answer: "A few things that set us apart:\n\n• Full-stack — design, dev, ads, branding all in one place\n• One-time pricing, no retainers or surprise fees\n• Fast delivery — most projects in 3–6 weeks\n• Results-first, not just pretty pixels\n• Real support after launch\n\nBasically — less fluff, more output.",
  },

  // ── RETAINERS / MONTHLY ───────────────────────────────────────────────────
  {
    priority: 20,
    patterns: ['retainer', 'monthly fee', 'subscription fee', 'recurring fee', 'do i pay monthly'],
    answer: "Nope — all our pricing is one-time. No monthly retainers, no ongoing fees. You pay once and own your site. The only recurring cost is domain & hosting renewal after year one, which is standard and transparent.",
  },

  // ── REFUND / GUARANTEE ───────────────────────────────────────────────────
  {
    priority: 15,
    patterns: ['refund', 'money back', 'cancel', 'guarantee', 'if not happy'],
    answer: "We stand behind our work. If something isn't right, we'd rather fix it than leave you unhappy. For specifics on our terms, reach out on WhatsApp and we can discuss.",
    showWa: true,
  } as any,

  // ── LOCATION ─────────────────────────────────────────────────────────────
  {
    priority: 15,
    patterns: ['location', 'where are you based', 'where are you located', 'india', 'your office', 'your city', 'do you work remotely'],
    answer: "We're a remote-first studio — we work with clients across India and beyond. Location is never a barrier.",
  },

  // ── BLOG ─────────────────────────────────────────────────────────────────
  {
    priority: 15,
    patterns: ['blog', 'articles', 'read your blog', 'latest posts', 'tips', 'insights'],
    answer: "We have a blog with tips, insights, and case studies on web design, digital marketing, and branding. Check it out in the Blog section of the site!",
  },

  // ── GRAPHIC DESIGN PORTFOLIO ─────────────────────────────────────────────
  {
    priority: 15,
    patterns: ['graphic portfolio', 'design portfolio', 'graphic work', 'design work', 'see your designs'],
    answer: "Our graphic design portfolio is on the Graphic Design page — branding, social media, print, and UI work across a range of industries. Head over and take a look!",
  },

  // ── CATCH-ALL "services" single word ─────────────────────────────────────
  {
    priority: 8,
    patterns: ['services'],
    answer: "We offer Web Design, Paid Advertising, Lead Generation, and Branding & Graphic Design. Want details on any of these?",
  },
];

// ── Scoring engine ────────────────────────────────────────────────────────────

function getBestMatch(
  input: string,
  faqs: FAQ[],
): { answer: string; showWa?: boolean } | null {
  const q = input.toLowerCase().trim();
  let best: { score: number; faq: FAQ } | null = null;

  for (const faq of faqs) {
    const priority = faq.priority ?? 10;
    for (const pattern of faq.patterns) {
      if (q.includes(pattern)) {
        const score = priority * 1000 + pattern.length;
        if (!best || score > best.score) {
          best = { score, faq };
        }
      }
    }
  }

  if (!best) return null;
  return {
    answer: best.faq.answer,
    showWa: (best.faq as any).showWa ?? false,
  };
}

// ── Suggested questions ───────────────────────────────────────────────────────

const SUGGESTIONS = [
  'What services do you offer?',
  'How much does a website cost?',
  'What are your payment modes?',
  'How long does a project take?',
];

// ── Component ─────────────────────────────────────────────────────────────────

export function Chatbot() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [unread, setUnread] = useState(1);
  const [msgs, setMsgs] = useState<Msg[]>([
    { id: 0, from: 'bot', text: "Hey! I'm the Espy Media assistant. Ask me anything about our services, pricing, payment, or how we work — happy to help!" },
  ]);

  const { data: settings }      = useGetSettings();
  const { data: pricingPlans }  = useGetPricingPlans();
  const { data: services }      = useGetServices();
  const { data: projects }      = useGetProjects();
  const { data: testimonials }  = useGetTestimonials({ published: true });

  const waNumber = settings?.whatsapp?.replace(/\D/g, '') || '';

  // Build dynamic answers from live backend data
  const dynamicFaqs = useMemo((): FAQ[] => {
    const built: FAQ[] = [];

    // Pricing
    const plans = pricingPlans?.filter((p: any) => p.published) ?? [];
    if (plans.length) {
      const lines = plans.map((p: any) =>
        `• ${p.name} — ${p.price}\n  ${p.description?.split('.')[0] ?? ''}`
      ).join('\n\n');
      built.push({
        priority: 30,
        patterns: [
          'price', 'pricing', 'cost', 'how much', 'rates', 'charge', 'fees',
          'packages', 'plans', 'website price', 'website cost', 'website charge',
          'website prices', 'your prices', 'your pricing', 'what are your prices',
          'site cost', 'site price', 'what does it cost', 'how much does a website',
          'how much for a website', 'cheapest', 'affordable', 'budget',
        ],
        answer: `Here's a quick look at our plans:\n\n${lines}\n\nAll one-time pricing, no retainers! Want details on a specific plan?`,
      });

      // Individual plan matches
      plans.forEach((p: any) => {
        built.push({
          priority: 30,
          patterns: [p.name.toLowerCase(), p.name.toLowerCase().replace(' plan', '')],
          answer: `${p.name} — ${p.price}\n\n${p.description ?? ''}\n\nFeatures include:\n${(p.features ?? []).slice(0, 6).map((f: string) => `• ${f}`).join('\n')}${(p.features ?? []).length > 6 ? '\n• …and more' : ''}`,
        });
      });
    }

    // Services
    const svcs = services?.filter((s: any) => s.published) ?? [];
    if (svcs.length) {
      const lines = svcs.map((s: any) => `• ${s.name}${s.headline ? ` — ${s.headline}` : ''}`).join('\n');
      built.push({
        priority: 15,
        patterns: ['what do you do', 'what is espy', 'about espy', 'who are you', 'what does espy do', 'what services', 'offerings', 'services offered', 'all services', 'list of services'],
        answer: `We're a full-stack creative studio. Here's what we do:\n\n${lines}\n\nAll under one roof — so things move fast and stay consistent.`,
      });
    }

    // Projects / portfolio
    const pubs = projects?.filter((p: any) => p.published).slice(0, 5) ?? [];
    if (pubs.length) {
      const lines = pubs.map((p: any) => `• ${p.title}${p.category ? ` (${p.category})` : ''}`).join('\n');
      built.push({
        priority: 15,
        patterns: ['portfolio', 'past work', 'examples', 'case study', 'previous projects', 'your work', 'show me work', 'clients', 'projects done'],
        answer: `Here are some of our recent projects:\n\n${lines}\n\nHead to the Work section to see full case studies with results and details.`,
      });
    }

    // Testimonials
    const pubs2 = testimonials?.filter((t: any) => t.published).slice(0, 2) ?? [];
    if (pubs2.length) {
      const lines = pubs2.map((t: any) =>
        `"${t.quote.slice(0, 120)}${t.quote.length > 120 ? '…' : ''}"\n— ${t.clientName}${t.company ? `, ${t.company}` : ''}`
      ).join('\n\n');
      built.push({
        priority: 15,
        patterns: ['testimonials', 'reviews', 'what do clients say', 'client feedback', 'ratings', 'happy clients', 'satisfied customers'],
        answer: `Here's what some of our clients say:\n\n${lines}\n\nCheck the homepage for more reviews!`,
      });
    }

    return built;
  }, [pricingPlans, services, projects, testimonials]);

  // Merge dynamic + static (dynamic takes priority via higher score)
  const allFaqs = useMemo(() => [...dynamicFaqs, ...STATIC_FAQS], [dynamicFaqs]);

  const bottomRef  = useRef<HTMLDivElement>(null);
  const inputRef   = useRef<HTMLInputElement>(null);
  const nextId     = useRef(1);

  useEffect(() => {
    if (open) { setUnread(0); setTimeout(() => inputRef.current?.focus(), 300); }
  }, [open]);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [msgs]);

  const waHref = (context?: string) => {
    const text = context
      ? `Hi Espy Media, I was on your website chatbot and had a question: "${context}". Can you help?`
      : 'Hi Espy Media, I have a question and would like to speak with someone.';
    return waNumber
      ? `https://wa.me/${waNumber}?text=${encodeURIComponent(text)}`
      : '/contact';
  };

  const push = (msg: Omit<Msg, 'id'>) =>
    setMsgs((prev) => [...prev, { ...msg, id: nextId.current++ }]);

  const handleSend = (text = input.trim()) => {
    if (!text) return;
    setInput('');
    push({ from: 'user', text });

    setTimeout(() => {
      const match = getBestMatch(text, allFaqs);
      if (match && match.answer) {
        push({ from: 'bot', text: match.answer, showWa: match.showWa });
      } else {
        push({
          from: 'bot',
          text: "I don't have the answer to that one — but our team definitely can help! Tap below to chat with us on WhatsApp.",
          showWa: true,
        });
      }
    }, 420);
  };

  return (
    <>
      {/* ── Chat window ────────────────────────────────────────────────── */}
      <AnimatePresence>
        {open && (
          <motion.div
            key="chat"
            initial={{ opacity: 0, y: 20, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.97 }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            className="fixed bottom-24 right-4 sm:right-6 z-50 flex flex-col w-[calc(100vw-2rem)] max-w-[370px]"
            style={{
              height: 'min(530px, calc(100dvh - 110px))',
              background: 'linear-gradient(160deg, #0e0b18 0%, #08060f 100%)',
              border: '1px solid rgba(124,58,237,0.22)',
              borderRadius: '22px',
              boxShadow: '0 32px 96px rgba(0,0,0,0.65), 0 0 0 1px rgba(255,255,255,0.04), inset 0 1px 0 rgba(255,255,255,0.07)',
            }}
          >
            {/* Header */}
            <div
              className="flex items-center justify-between px-5 py-4 flex-shrink-0 rounded-t-[22px]"
              style={{ background: 'linear-gradient(135deg,rgba(124,58,237,0.14) 0%,rgba(124,58,237,0.03) 100%)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}
            >
              <div className="flex items-center gap-3">
                <div className="relative">
                  {settings?.chatbotAvatarUrl ? (
                    <img
                      src={settings.chatbotAvatarUrl}
                      alt="Chatbot avatar"
                      className="w-10 h-10 rounded-full object-cover"
                      style={{ boxShadow: '0 0 22px rgba(124,58,237,0.5)' }}
                    />
                  ) : (
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center"
                      style={{ background: 'linear-gradient(135deg,#7C3AED,#5b21b6)', boxShadow: '0 0 22px rgba(124,58,237,0.5)' }}
                    >
                      <ChatIcon className="w-5 h-5 text-white" />
                    </div>
                  )}
                  <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-400 border-2 border-[#0e0b18]" />
                </div>
                <div>
                  <p className="text-white text-sm font-semibold font-manrope leading-tight">Espy Media</p>
                  <p className="text-emerald-400 text-[11px] font-inter">Online — reply in minutes</p>
                </div>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="w-8 h-8 rounded-full flex items-center justify-center text-zinc-500 hover:text-white hover:bg-white/10 transition-all"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3" style={{ scrollbarWidth: 'none' }}>
              {msgs.map((msg) => (
                <div key={msg.id} className={`flex ${msg.from === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className="flex flex-col gap-2 max-w-[88%]">
                    <div
                      className="px-4 py-3 text-sm font-inter leading-relaxed whitespace-pre-line"
                      style={msg.from === 'user'
                        ? {
                            background: 'linear-gradient(135deg,#7C3AED,#6d28d9)',
                            color: '#fff',
                            borderRadius: '18px 18px 4px 18px',
                            boxShadow: '0 4px 16px rgba(124,58,237,0.28)',
                          }
                        : {
                            background: 'rgba(255,255,255,0.05)',
                            border: '1px solid rgba(255,255,255,0.08)',
                            color: '#d4d4d8',
                            borderRadius: '18px 18px 18px 4px',
                          }
                      }
                    >
                      {msg.text}
                    </div>

                    {/* WhatsApp CTA */}
                    {msg.showWa && (
                      <a
                        href={waHref(msgs.find(m => m.from === 'user' && m.id === msg.id - 1)?.text)}
                        target="_blank"
                        rel="noreferrer"
                        className="self-start inline-flex items-center gap-2 px-4 py-2.5 rounded-full text-xs font-semibold font-manrope text-white transition-all duration-200 hover:brightness-110 active:scale-95"
                        style={{
                          background: 'linear-gradient(135deg,#25D366,#1aa150)',
                          boxShadow: '0 4px 18px rgba(37,211,102,0.32)',
                        }}
                      >
                        <WaIcon />
                        Chat on WhatsApp
                        <ArrowRight className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                </div>
              ))}
              <div ref={bottomRef} />
            </div>

            {/* Suggestion chips — only on first open */}
            {msgs.length === 1 && (
              <div className="px-4 pb-3 flex flex-wrap gap-2 flex-shrink-0">
                {SUGGESTIONS.map((q) => (
                  <button
                    key={q}
                    onClick={() => handleSend(q)}
                    className="text-[11px] font-inter text-zinc-300 px-3 py-1.5 rounded-full border border-white/10 bg-white/[0.04] hover:bg-[#7C3AED]/20 hover:border-[#7C3AED]/40 hover:text-white transition-all duration-200"
                  >
                    {q}
                  </button>
                ))}
              </div>
            )}

            {/* Input row */}
            <div
              className="px-4 py-3 flex items-center gap-2 flex-shrink-0"
              style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}
            >
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Ask anything..."
                className="flex-1 bg-white/[0.05] border border-white/[0.08] rounded-full px-4 py-2.5 text-white text-sm placeholder-zinc-600 focus:outline-none focus:border-[#7C3AED]/50 transition-all font-inter"
              />
              <button
                onClick={() => handleSend()}
                disabled={!input.trim()}
                className="w-9 h-9 rounded-full flex-shrink-0 flex items-center justify-center transition-all duration-200 disabled:opacity-25 hover:scale-105 active:scale-95"
                style={{
                  background: input.trim()
                    ? 'linear-gradient(135deg,#7C3AED,#6d28d9)'
                    : 'rgba(255,255,255,0.07)',
                  boxShadow: input.trim() ? '0 4px 14px rgba(124,58,237,0.4)' : 'none',
                }}
              >
                <Send className="w-4 h-4 text-white" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Trigger button ──────────────────────────────────────────────── */}
      <motion.button
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? 'Close chat' : 'Open chat'}
        className="fixed bottom-5 right-4 sm:right-6 z-50 w-14 h-14 rounded-full flex items-center justify-center"
        style={{
          background: open
            ? 'rgba(255,255,255,0.07)'
            : 'linear-gradient(135deg,#7C3AED 0%,#5b21b6 100%)',
          border: open ? '1px solid rgba(255,255,255,0.1)' : 'none',
          boxShadow: open
            ? '0 4px 24px rgba(0,0,0,0.4)'
            : '0 6px 32px rgba(124,58,237,0.55), 0 0 0 1px rgba(124,58,237,0.25)',
        }}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.92 }}
      >
        <AnimatePresence mode="wait">
          {open ? (
            <motion.span key="x" initial={{ rotate: -80, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 80, opacity: 0 }} transition={{ duration: 0.16 }}>
              <X className="w-5 h-5 text-white" />
            </motion.span>
          ) : (
            <motion.span key="chat" initial={{ rotate: 80, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -80, opacity: 0 }} transition={{ duration: 0.16 }}>
              <ChatIcon className="w-6 h-6 text-white" />
            </motion.span>
          )}
        </AnimatePresence>

        {/* Unread dot */}
        <AnimatePresence>
          {!open && unread > 0 && (
            <motion.span
              key="badge"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center font-manrope border-2 border-[#08060f]"
            >
              {unread}
            </motion.span>
          )}
        </AnimatePresence>

        {/* Subtle pulse ring */}
        {!open && (
          <span className="absolute inset-0 rounded-full animate-ping opacity-[0.18] bg-[#7C3AED]" />
        )}
      </motion.button>
    </>
  );
}
