'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Users, Target, PaperPlaneTilt, ArrowRight, ArrowLeft,
  Upload, UserPlus, Check, Sparkle, Globe, X, Plus,
  CheckCircle
} from '@phosphor-icons/react'
import { useAppStore } from '@/stores/appStore'
import { cn } from '@/lib/utils'

const STEPS = [
  {
    id: 1,
    icon: Users,
    color: 'text-violet-600',
    bg: 'bg-violet-100 dark:bg-violet-900/40',
    title: 'Bring your relationships',
    subtitle: 'Start with the people who matter most to your mission',
  },
  {
    id: 2,
    icon: Target,
    color: 'text-primary',
    bg: 'bg-primary/10',
    title: 'Define your mission',
    subtitle: 'Tell people what you stand for and what you\'re working toward',
  },
  {
    id: 3,
    icon: PaperPlaneTilt,
    color: 'text-blue-600',
    bg: 'bg-blue-100 dark:bg-blue-900/40',
    title: 'Make your first post',
    subtitle: 'Say hello to your followers and share your vision',
  },
]

const IMPACT_AREAS = [
  'Rural Development', 'Education', 'Healthcare', 'Environment',
  'Women Empowerment', 'Youth', 'Agriculture', 'Infrastructure',
  'Technology', 'Social Justice', 'Housing', 'Arts & Culture',
]

interface QuickContact {
  id: string
  name: string
  phone: string
}

export default function OnboardingPage() {
  const router = useRouter()
  const { completeOnboarding } = useAppStore()
  const [step, setStep] = useState(0)
  const [direction, setDirection] = useState(1)

  // Step 1 state
  const [contacts, setContacts] = useState<QuickContact[]>([])
  const [addingContact, setAddingContact] = useState(false)
  const [newName, setNewName] = useState('')
  const [newPhone, setNewPhone] = useState('')

  // Step 2 state
  const [missionName, setMissionName] = useState('')
  const [missionDesc, setMissionDesc] = useState('')
  const [selectedAreas, setSelectedAreas] = useState<string[]>([])

  // Step 3 state
  const [postText, setPostText] = useState('')
  const [finishing, setFinishing] = useState(false)
  const [done, setDone] = useState(false)

  function goNext() {
    setDirection(1)
    setStep(s => s + 1)
  }

  function goBack() {
    setDirection(-1)
    setStep(s => s - 1)
  }

  function addContact() {
    if (!newName.trim()) return
    setContacts(prev => [...prev, { id: Date.now().toString(), name: newName.trim(), phone: newPhone.trim() }])
    setNewName('')
    setNewPhone('')
    setAddingContact(false)
  }

  function removeContact(id: string) {
    setContacts(prev => prev.filter(c => c.id !== id))
  }

  function toggleArea(area: string) {
    setSelectedAreas(prev =>
      prev.includes(area) ? prev.filter(a => a !== area) : [...prev, area]
    )
  }

  async function finish() {
    setFinishing(true)
    await new Promise(r => setTimeout(r, 1200))
    setDone(true)
    await new Promise(r => setTimeout(r, 800))
    completeOnboarding()
    router.replace('/leader/home')
  }

  const currentStep = STEPS[step]
  const Icon = currentStep?.icon ?? Users

  if (done) {
    return (
      <div className="min-h-dvh flex flex-col items-center justify-center px-6 text-center">
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', damping: 16, stiffness: 250 }}
          className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-6"
        >
          <CheckCircle size={40} className="text-primary" weight="fill" />
        </motion.div>
        <motion.h1
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-2xl font-bold mb-2"
        >
          You're all set!
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-muted-foreground text-sm"
        >
          Taking you to your home page…
        </motion.p>
      </div>
    )
  }

  return (
    <div className="min-h-dvh flex flex-col">
      {/* Top bar */}
      <div className="flex items-center justify-between px-5 py-4 shrink-0">
        <div className="flex items-center gap-1.5">
          <Globe size={18} className="text-primary" weight="fill" />
          <span className="text-sm font-bold text-foreground">LeaderZ</span>
        </div>
        <button
          onClick={() => { completeOnboarding(); router.replace('/leader/home') }}
          className="text-xs text-muted-foreground hover:text-foreground transition-colors px-2 py-1 rounded-lg hover:bg-muted"
        >
          Skip setup
        </button>
      </div>

      {/* Progress */}
      <div className="flex gap-1.5 px-5 mb-6 shrink-0">
        {STEPS.map((s, i) => (
          <div
            key={s.id}
            className={cn(
              'h-1 flex-1 rounded-full transition-all duration-500',
              i <= step ? 'bg-primary' : 'bg-muted'
            )}
          />
        ))}
      </div>

      {/* Step content */}
      <div className="flex-1 overflow-y-auto">
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="px-5 pb-4"
          >
            {/* Step header */}
            <div className="flex items-start gap-4 mb-6">
              <div className={cn('w-12 h-12 rounded-2xl flex items-center justify-center shrink-0', currentStep.bg)}>
                <Icon size={22} className={currentStep.color} weight="fill" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground font-medium mb-0.5">Step {step + 1} of {STEPS.length}</p>
                <h2 className="text-xl font-bold text-foreground">{currentStep.title}</h2>
                <p className="text-sm text-muted-foreground mt-0.5 leading-relaxed">{currentStep.subtitle}</p>
              </div>
            </div>

            {/* Step 1: Contacts */}
            {step === 0 && (
              <div className="space-y-3">
                {/* Import options */}
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { label: 'Import CSV', icon: Upload, sublabel: 'From spreadsheet' },
                    { label: 'From phone', icon: Users, sublabel: 'Sync contacts' },
                  ].map(({ label, icon: BIcon, sublabel }) => (
                    <button
                      key={label}
                      className="flex flex-col items-center gap-2 p-4 rounded-2xl border border-dashed border-border hover:border-primary/40 hover:bg-muted/40 transition-all text-center"
                    >
                      <BIcon size={20} className="text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium text-foreground">{label}</p>
                        <p className="text-[10px] text-muted-foreground">{sublabel}</p>
                      </div>
                    </button>
                  ))}
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex-1 h-px bg-border" />
                  <span className="text-xs text-muted-foreground">or add manually</span>
                  <div className="flex-1 h-px bg-border" />
                </div>

                {/* Added contacts */}
                {contacts.length > 0 && (
                  <div className="space-y-2">
                    {contacts.map(c => (
                      <div key={c.id} className="flex items-center gap-3 p-3 rounded-xl bg-muted">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-sm font-bold shrink-0">
                          {c.name[0]}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{c.name}</p>
                          {c.phone && <p className="text-xs text-muted-foreground">{c.phone}</p>}
                        </div>
                        <button onClick={() => removeContact(c.id)} className="p-1 rounded-lg hover:bg-muted-foreground/10 transition-colors">
                          <X size={14} className="text-muted-foreground" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Quick-add form */}
                {addingContact ? (
                  <div className="rounded-2xl border bg-card p-4 space-y-3">
                    <input
                      autoFocus
                      value={newName}
                      onChange={e => setNewName(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && addContact()}
                      placeholder="Full name *"
                      className="w-full bg-muted rounded-xl px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/30"
                    />
                    <input
                      value={newPhone}
                      onChange={e => setNewPhone(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && addContact()}
                      placeholder="Phone number (optional)"
                      className="w-full bg-muted rounded-xl px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/30"
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={() => { setAddingContact(false); setNewName(''); setNewPhone('') }}
                        className="flex-1 py-2 rounded-xl border text-sm font-medium text-muted-foreground hover:bg-muted transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={addContact}
                        disabled={!newName.trim()}
                        className="flex-1 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-semibold disabled:opacity-40 hover:bg-primary/90 transition-colors"
                      >
                        Add
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => setAddingContact(true)}
                    className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl border border-dashed border-primary/40 text-primary text-sm font-medium hover:bg-primary/5 transition-colors"
                  >
                    <Plus size={16} weight="bold" />
                    Add a contact
                  </button>
                )}
              </div>
            )}

            {/* Step 2: Mission */}
            {step === 1 && (
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Mission name</label>
                  <input
                    value={missionName}
                    onChange={e => setMissionName(e.target.value)}
                    placeholder="e.g. Rural Development Initiative"
                    className="w-full bg-muted rounded-2xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/30"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1.5 block">What are you working toward?</label>
                  <textarea
                    value={missionDesc}
                    onChange={e => setMissionDesc(e.target.value)}
                    placeholder="Describe your mission, goals, and the change you want to see…"
                    className="w-full bg-muted rounded-2xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none min-h-[100px]"
                    maxLength={300}
                  />
                  <p className="text-[10px] text-muted-foreground text-right mt-1">{missionDesc.length}/300</p>
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-2 block">Impact areas</label>
                  <div className="flex flex-wrap gap-2">
                    {IMPACT_AREAS.map(area => (
                      <button
                        key={area}
                        onClick={() => toggleArea(area)}
                        className={cn(
                          'px-3 py-1.5 rounded-full text-xs font-medium border transition-all',
                          selectedAreas.includes(area)
                            ? 'bg-primary text-primary-foreground border-primary'
                            : 'border-border text-muted-foreground hover:border-primary/40 hover:text-foreground'
                        )}
                      >
                        {selectedAreas.includes(area) && <Check size={10} className="inline mr-1" weight="bold" />}
                        {area}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: First post */}
            {step === 2 && (
              <div className="space-y-4">
                <div className="rounded-2xl border bg-card p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm shrink-0">
                      S
                    </div>
                    <div>
                      <p className="text-sm font-semibold">Sridhar Vembu</p>
                      <p className="text-[10px] text-muted-foreground flex items-center gap-1">
                        <Globe size={10} />
                        Public · Now
                      </p>
                    </div>
                  </div>
                  <textarea
                    autoFocus
                    value={postText}
                    onChange={e => setPostText(e.target.value)}
                    placeholder="Share your mission with the world. What are you working on? What change do you hope to make?"
                    className="w-full bg-transparent text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none resize-none min-h-[120px]"
                    maxLength={500}
                  />
                  <p className="text-[10px] text-muted-foreground text-right mt-2">{postText.length}/500</p>
                </div>

                <div className="rounded-2xl border border-dashed p-4 flex flex-col items-center gap-2 text-center hover:border-primary/40 hover:bg-muted/30 transition-all cursor-pointer">
                  <Upload size={20} className="text-muted-foreground" />
                  <p className="text-sm font-medium text-foreground">Add a photo</p>
                  <p className="text-xs text-muted-foreground">A photo can make your post more impactful</p>
                </div>

                <div className="rounded-2xl bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-800 p-4 flex gap-3">
                  <Sparkle size={16} className="text-indigo-600 shrink-0 mt-0.5" weight="fill" />
                  <p className="text-xs text-indigo-700 dark:text-indigo-400 leading-relaxed">
                    Posts that share a personal story or vision typically see 3× more engagement from followers.
                  </p>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Footer navigation */}
      <div className="px-5 pb-8 pt-4 shrink-0 flex gap-3">
        {step > 0 && (
          <button
            onClick={goBack}
            className="flex items-center justify-center w-12 h-12 rounded-2xl border hover:bg-muted transition-colors"
            aria-label="Back"
          >
            <ArrowLeft size={20} />
          </button>
        )}
        {step < STEPS.length - 1 ? (
          <button
            onClick={goNext}
            className="flex-1 flex items-center justify-center gap-2 h-12 rounded-2xl bg-primary text-primary-foreground font-semibold text-sm hover:bg-primary/90 transition-colors"
          >
            Continue
            <ArrowRight size={18} weight="bold" />
          </button>
        ) : (
          <button
            onClick={finish}
            disabled={finishing}
            className="flex-1 flex items-center justify-center gap-2 h-12 rounded-2xl bg-primary text-primary-foreground font-semibold text-sm hover:bg-primary/90 transition-colors disabled:opacity-70"
          >
            {finishing ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Setting up…
              </span>
            ) : (
              <>
                <CheckCircle size={18} weight="fill" />
                {postText.trim() ? 'Publish & finish' : 'Finish setup'}
              </>
            )}
          </button>
        )}
      </div>
    </div>
  )
}
