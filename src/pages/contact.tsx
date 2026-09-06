import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, ArrowLeft, CheckCircle2, Loader2 } from 'lucide-react';
import { NavBar } from '@/components/nav-bar';
import { Footer } from '@/components/footer';
import { useCreateLead, useGetSettings } from '@workspace/api-client-react';

export default function Contact() {
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [submissionError, setSubmissionError] = useState('');
  const [formData, setFormData] = useState({
    projectType: '', budget: '', timeline: '',
    name: '', email: '', phone: '', company: '', details: ''
  });

  const createLead = useCreateLead();
  const { data: settings, isLoading: settingsLoading } = useGetSettings();

  const handleNext = () => {
    if (step === 1 && !formData.projectType) return;
    setStep(step + 1);
  };
  const handleBack = () => setStep(step - 1);

  const handleSubmit = async () => {
    if (!formData.name || !formData.email) return;
    setSubmitting(true);
    setSubmissionError('');
    try {
      const whatsappNumber = settings?.whatsapp?.replace(/\D/g, '') || '';
      if (settingsLoading || !whatsappNumber) {
        setSubmissionError('WhatsApp is not configured yet. Please contact the site administrator.');
        return;
      }
      await createLead.mutateAsync({
        data: {
          name: formData.name,
          email: formData.email,
          company: formData.company || undefined,
          projectType: formData.projectType || undefined,
          budget: formData.budget || undefined,
          timeline: formData.timeline || undefined,
          details: formData.details
            ? `Phone: ${formData.phone || '—'}\n\n${formData.details}`
            : formData.phone ? `Phone: ${formData.phone}` : undefined,
          status: 'new',
        },
      });
      const message = [
        'New enquiry for Espy Media',
        '',
        `Name: ${formData.name}`,
        `Email: ${formData.email}`,
        formData.phone ? `Phone: ${formData.phone}` : '',
        formData.company ? `Company: ${formData.company}` : '',
        `Service: ${formData.projectType || 'Not specified'}`,
        `Budget: ${formData.budget || 'Not specified'}`,
        `Timeline: ${formData.timeline || 'Not specified'}`,
        formData.details ? `Project details: ${formData.details}` : '',
      ].filter(Boolean).join('\n');
      window.location.assign(`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`);
    } catch {
      setSubmissionError('We could not submit your enquiry. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const projectTypes = [
    { value: 'Web Design', label: 'Web Design', desc: 'New website or redesign' },
    { value: 'Paid Advertising', label: 'Paid Advertising', desc: 'Campaign management' },
    { value: 'Lead Generation', label: 'Lead Generation', desc: 'Pipeline building' },
    { value: 'Branding & Design', label: 'Branding & Design', desc: 'Visual identity' },
  ];
  const budgets   = ['Under Rs 10,000', 'Rs 10,000 - Rs 25,000', 'Rs 25,000 - Rs 50,000', 'Rs 50,000+'];
  const timelines = ['ASAP', '1 Week', '1 Month', 'Just an Enquiry'];

  return (
    <div className="min-h-screen bg-black text-white overflow-x-hidden">
      <NavBar />

      {/* Background */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-b from-[#0a0514] to-black" />
        <div className="absolute top-0 left-0 w-[1px] h-[1px] bg-transparent stars-1 animate-[animStar_50s_linear_infinite]" />
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[700px] h-[700px] bg-violet-600/[0.05] rounded-full blur-[130px]" />
        <div className="grain-overlay absolute inset-0" />
      </div>

      <main className="relative z-10">
        <section className="min-h-screen pt-28 sm:pt-36 pb-16 sm:pb-20">
          <div className="container mx-auto px-4 sm:px-6 max-w-3xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-12"
            >
              <p className="section-label mb-5">Start a project</p>
              <h1 className="section-headline mb-4" style={{ fontSize: 'clamp(2rem, 6vw, 5rem)' }}>
                Let's build something<br />
                <span className="text-gradient-purple italic">unforgettable.</span>
              </h1>
              <p className="text-lg text-zinc-400 font-inter">
                Tell us about your vision. We'll be in touch shortly.
              </p>
            </motion.div>

            {/* Progress bar */}
            <div className="flex items-center gap-2 mb-12">
              {[1, 2, 3].map((s) => (
                <div
                  key={s}
                  className={`h-0.5 flex-1 rounded-full transition-all duration-500 ${
                    s <= step ? 'bg-[#7C3AED]' : 'bg-white/10'
                  }`}
                />
              ))}
            </div>

            <AnimatePresence mode="wait">
              {/* Step 1 — Project type */}
              {step === 1 && (
                <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }}>
                  <h2 className="text-3xl font-bold mb-2 font-manrope">What do you need?</h2>
                  <p className="text-zinc-400 mb-8 font-inter">Select the service that fits your project</p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                    {projectTypes.map((type) => (
                      <button
                        key={type.value}
                        onClick={() => setFormData({ ...formData, projectType: type.value })}
                        className={`p-6 border-2 rounded-xl text-left transition-all duration-200 ${
                          formData.projectType === type.value
                            ? 'border-[#7C3AED] bg-[#7C3AED]/10'
                            : 'border-white/10 bg-white/[0.02] hover:border-white/20'
                        }`}
                      >
                        <div className="font-semibold text-lg mb-1 font-manrope text-white">{type.label}</div>
                        <div className="text-sm text-zinc-400 font-inter">{type.desc}</div>
                      </button>
                    ))}
                  </div>

                  <button
                    onClick={handleNext}
                    disabled={!formData.projectType}
                    className="espy-cta espy-cta--contact w-full"
                  >
                    <span className="inner-glow" />
                    <span className="label">Continue <ArrowRight className="w-4 h-4" /></span>
                  </button>
                </motion.div>
              )}

              {/* Step 2 — Budget + timeline */}
              {step === 2 && (
                <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }}>
                  <h2 className="text-3xl font-bold mb-2 font-manrope">Project scope</h2>
                  <p className="text-zinc-400 mb-8 font-inter">Help us understand your timeline and budget</p>

                  <div className="space-y-8 mb-8">
                    <div>
                      <label className="text-sm font-semibold text-zinc-300 mb-4 block uppercase tracking-wider font-manrope">Budget range</label>
                      <div className="space-y-3">
                        {budgets.map((budget) => (
                          <button
                            key={budget}
                            onClick={() => setFormData({ ...formData, budget })}
                            className={`w-full flex items-center gap-4 p-4 border rounded-xl text-left transition-all duration-200 font-inter ${
                              formData.budget === budget
                                ? 'border-[#7C3AED] bg-[#7C3AED]/10 text-white'
                                : 'border-white/10 bg-white/[0.02] text-zinc-300 hover:border-white/20'
                            }`}
                          >
                            <span className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 ${formData.budget === budget ? 'border-[#7C3AED] bg-[#7C3AED]' : 'border-zinc-600'}`}>
                              {formData.budget === budget && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
                            </span>
                            {budget}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="text-sm font-semibold text-zinc-300 mb-4 block uppercase tracking-wider font-manrope">Timeline</label>
                      <div className="space-y-3">
                        {timelines.map((timeline) => (
                          <button
                            key={timeline}
                            onClick={() => setFormData({ ...formData, timeline })}
                            className={`w-full flex items-center gap-4 p-4 border rounded-xl text-left transition-all duration-200 font-inter ${
                              formData.timeline === timeline
                                ? 'border-[#7C3AED] bg-[#7C3AED]/10 text-white'
                                : 'border-white/10 bg-white/[0.02] text-zinc-300 hover:border-white/20'
                            }`}
                          >
                            <span className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 ${formData.timeline === timeline ? 'border-[#7C3AED] bg-[#7C3AED]' : 'border-zinc-600'}`}>
                              {formData.timeline === timeline && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
                            </span>
                            {timeline}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <button onClick={handleBack} className="pill-btn-ghost flex-1 justify-center">
                      <ArrowLeft className="w-4 h-4" /> Back
                    </button>
                    <button onClick={handleNext} className="espy-cta espy-cta--contact flex-1">
                      <span className="inner-glow" />
                      <span className="label">Continue <ArrowRight className="w-4 h-4" /></span>
                    </button>
                  </div>
                  {submissionError && <p className="mt-4 text-sm text-red-300 font-inter">{submissionError}</p>}
                </motion.div>
              )}

              {/* Step 3 — Details */}
              {step === 3 && (
                <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }}>
                  <h2 className="text-3xl font-bold mb-2 font-manrope">Your details</h2>
                  <p className="text-zinc-400 mb-8 font-inter">How should we reach you on WhatsApp?</p>

                  <div className="space-y-5 mb-8">
                    {[
                      { id: 'name',    label: 'Name *',           type: 'text',  placeholder: 'John Smith',         required: true  },
                      { id: 'email',   label: 'Email *',          type: 'email', placeholder: 'john@company.com',   required: true  },
                      { id: 'phone',   label: 'WhatsApp / Phone', type: 'tel',   placeholder: '+91 98765 43210',    required: false },
                      { id: 'company', label: 'Company',          type: 'text',  placeholder: 'Acme Inc',           required: false },
                    ].map((field) => (
                      <div key={field.id}>
                        <label htmlFor={field.id} className="text-sm font-semibold text-zinc-300 mb-2 block font-manrope">{field.label}</label>
                        <input
                          id={field.id}
                          type={field.type}
                          value={formData[field.id as keyof typeof formData]}
                          onChange={(e) => setFormData({ ...formData, [field.id]: e.target.value })}
                          placeholder={field.placeholder}
                          className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-4 py-3.5 text-white placeholder-zinc-600 focus:outline-none focus:border-[#7C3AED] transition-all font-inter text-sm"
                        />
                      </div>
                    ))}
                    <div>
                      <label htmlFor="details" className="text-sm font-semibold text-zinc-300 mb-2 block font-manrope">Project details</label>
                      <textarea
                        id="details"
                        value={formData.details}
                        onChange={(e) => setFormData({ ...formData, details: e.target.value })}
                        placeholder="Tell us more about your project goals, challenges, and vision..."
                        rows={5}
                        className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-4 py-3.5 text-white placeholder-zinc-600 focus:outline-none focus:border-[#7C3AED] transition-all font-inter text-sm resize-none"
                      />
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <button onClick={handleBack} className="pill-btn-ghost flex-1 justify-center">
                      <ArrowLeft className="w-4 h-4" /> Back
                    </button>
                    <button
                      onClick={handleSubmit}
                      disabled={!formData.name || !formData.email || submitting || settingsLoading}
                      className="espy-cta espy-cta--contact flex-1"
                    >
                      <span className="inner-glow" />
                      <span className="label">
                        {submitting ? <><Loader2 className="w-4 h-4 animate-spin" /> Sending…</> : <>Send <ArrowRight className="w-4 h-4" /></>}
                      </span>
                    </button>
                  </div>
                </motion.div>
              )}

              {/* Step 4 — Success / fallback */}
              {step === 4 && (
                <motion.div
                  key="step4"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.4 }}
                  className="text-center py-20"
                >
                  <div className="w-20 h-20 rounded-full bg-[#7C3AED] flex items-center justify-center mx-auto mb-8 shadow-[0_0_60px_rgba(124,58,237,0.4)]">
                    <CheckCircle2 className="w-10 h-10 text-white" />
                  </div>
                  <h2 className="text-4xl font-bold mb-4 font-manrope text-white">Message sent!</h2>
                  <p className="text-lg text-zinc-400 mb-10 font-inter">
                    Thanks, <span className="text-white font-semibold">{formData.name}</span>. We've received your inquiry and will get back to you shortly.
                  </p>
                  <button onClick={() => window.location.href = '/'} className="pill-btn-ghost">
                    Back to Home
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
