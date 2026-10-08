import { motion } from 'framer-motion';
import { Link } from 'wouter';
import { useGetFaqs } from '@workspace/api-client-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

export function FaqSection() {
  const { data: faqs, isLoading, isError } = useGetFaqs();

  if (isLoading) {
    return (
      <section aria-label="Frequently asked questions" className="bg-black px-5 py-16 sm:px-8 md:py-24">
        <div className="mx-auto grid max-w-7xl gap-10 md:grid-cols-[0.8fr_1.2fr]">
          <div className="h-40 animate-pulse rounded-xl bg-white/[0.04]" />
          <div className="space-y-4">
            <div className="h-16 animate-pulse rounded-xl bg-white/[0.04]" />
            <div className="h-16 animate-pulse rounded-xl bg-white/[0.04]" />
            <div className="h-16 animate-pulse rounded-xl bg-white/[0.04]" />
          </div>
        </div>
      </section>
    );
  }

  if (isError) {
    return (
      <section aria-labelledby="faq-title" className="border-y border-white/[0.06] bg-zinc-950/40 px-5 py-16 sm:px-8 md:py-24">
        <div className="mx-auto grid max-w-7xl gap-8 md:grid-cols-[0.8fr_1.2fr]">
          <div>
            <p className="section-label mb-4">A few useful answers</p>
            <h2 id="faq-title" className="section-headline">Frequently asked questions</h2>
          </div>
          <p role="status" className="text-sm leading-7 text-zinc-400">
            Our FAQs are temporarily unavailable. Please <Link href="/contact" className="text-[#c4b5fd] underline underline-offset-4">contact us</Link> and we&apos;ll be happy to help.
          </p>
        </div>
      </section>
    );
  }

  if (!faqs?.length) return null;

  return (
    <section id="faq" aria-labelledby="faq-title" className="relative overflow-hidden border-y border-white/[0.06] bg-zinc-950/40 px-5 py-16 sm:px-8 md:py-28">
      <div className="mx-auto grid max-w-7xl gap-10 md:grid-cols-[0.8fr_1.2fr] md:gap-16">
        <motion.header
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          viewport={{ once: true, amount: 0.35 }}
          className="md:sticky md:top-32 md:self-start"
        >
          <p className="section-label mb-4">A few useful answers</p>
          <h2 id="faq-title" className="section-headline">Good questions.<br />Clear answers.</h2>
          <p className="mt-5 max-w-sm text-sm leading-7 text-zinc-400 sm:text-base">
            Thinking about a website or digital project? Here&apos;s what clients often ask before we get started.
          </p>
          <Link href="/contact" className="mt-7 inline-flex items-center gap-2 text-sm font-semibold text-white transition-colors hover:text-[#c4b5fd]">
            Still have a question? <span aria-hidden="true">↗</span>
          </Link>
        </motion.header>

        <Accordion type="single" collapsible className="w-full">
          {faqs.map((faq, index) => (
            <motion.div
              key={faq.id}
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: Math.min(index * 0.045, 0.25), ease: [0.22, 1, 0.36, 1] }}
              viewport={{ once: true, amount: 0.2 }}
            >
              <AccordionItem value={`faq-${faq.id}`} className="border-white/[0.10]">
                <AccordionTrigger className="gap-5 py-5 text-left font-manrope text-base font-semibold leading-snug text-white hover:no-underline sm:py-6 sm:text-lg [&[data-state=open]>svg]:text-[#a78bfa]">
                  <span className="flex items-start gap-4">
                    <span className="pt-0.5 font-mono text-[10px] tracking-widest text-zinc-600">
                      {String(index + 1).padStart(2, '0')}
                    </span>
                    {faq.question}
                  </span>
                </AccordionTrigger>
                <AccordionContent className="pl-9 pr-8 text-sm leading-7 text-zinc-400 sm:pl-10 sm:text-base">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            </motion.div>
          ))}
        </Accordion>
      </div>
    </section>
  );
}
