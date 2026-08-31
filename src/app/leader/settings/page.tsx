'use client'
import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  GearSix, Sun, Moon, Monitor, Bell, Lock, Users, Database,
  SignOut, Trash, CaretRight, CheckCircle, Shield, Eye,
  Palette, SealCheck
} from '@phosphor-icons/react'
import { useAppStore } from '@/stores/appStore'
import { Avatar } from '@/components/common/Avatar'
import { useLeader } from '@/queries'

type ThemeOption = 'light' | 'dark' | 'system'

const themeIcons = { light: Sun, dark: Moon, system: Monitor }
const themeLabels = { light: 'Light', dark: 'Dark', system: 'System' }

export default function SettingsPage() {
  const { activeTenantId, userRole, theme, setTheme, setUserRole } = useAppStore()
  const { data: leader } = useLeader(activeTenantId)
  const [notifBirthdays, setNotifBirthdays] = useState(true)
  const [notifFollowUps, setNotifFollowUps] = useState(true)
  const [notifMission, setNotifMission] = useState(true)
  const [notifFollowers, setNotifFollowers] = useState(false)
  const [defaultPrivacy, setDefaultPrivacy] = useState<'public' | 'team_accessible'>('team_accessible')

  return (
    <div className="max-w-2xl mx-auto">
      <header className="sticky top-0 z-20 bg-background/95 backdrop-blur-xl border-b">
        <div className="flex items-center gap-3 px-4 py-3">
          <GearSix size={20} className="text-primary" weight="fill" />
          <h1 className="text-xl font-bold flex-1">Settings</h1>
        </div>
      </header>

      <div className="px-4 py-4 space-y-4">
        {/* Profile card */}
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="rounded-2xl border bg-card p-4 flex items-center gap-4">
          {leader && <Avatar src={leader.avatarUrl} name={leader.name} size="xl" verified />}
          <div className="flex-1 min-w-0">
            <p className="font-bold text-foreground">{leader?.name ?? '—'}</p>
            <p className="text-sm text-muted-foreground truncate">{leader?.title}</p>
            <p className="text-xs text-muted-foreground">{leader?.organization}</p>
          </div>
          <button className="text-xs text-primary font-medium px-3 py-1.5 rounded-xl border border-primary/30 hover:bg-primary/5 transition-colors">Edit</button>
        </motion.div>

        {/* Appearance */}
        <Section icon={<Palette size={18} weight="fill" />} title="Appearance">
          <div className="grid grid-cols-3 gap-2">
            {(['light', 'dark', 'system'] as ThemeOption[]).map(t => {
              const Icon = themeIcons[t]
              const active = theme === t
              return (
                <button
                  key={t}
                  onClick={() => setTheme(t)}
                  className={`flex flex-col items-center gap-2 py-3 rounded-xl border-2 transition-all ${active ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/30'}`}
                >
                  <Icon size={20} className={active ? 'text-primary' : 'text-muted-foreground'} />
                  <span className={`text-xs font-medium ${active ? 'text-primary' : 'text-muted-foreground'}`}>{themeLabels[t]}</span>
                  {active && <CheckCircle size={14} className="text-primary" weight="fill" />}
                </button>
              )
            })}
          </div>
        </Section>

        {/* Notifications */}
        <Section icon={<Bell size={18} weight="fill" />} title="Notifications">
          <div className="space-y-1">
            <Toggle label="Birthday reminders" sub="Notify 3 days before a contact's birthday" value={notifBirthdays} onChange={setNotifBirthdays} />
            <Toggle label="Follow-up reminders" sub="Alert when a follow-up is due" value={notifFollowUps} onChange={setNotifFollowUps} />
            <Toggle label="Mission updates" sub="New posts, events, and project activity" value={notifMission} onChange={setNotifMission} />
            <Toggle label="New followers" sub="When someone follows you or your mission" value={notifFollowers} onChange={setNotifFollowers} />
          </div>
        </Section>

        {/* Privacy defaults */}
        <Section icon={<Lock size={18} weight="fill" />} title="Privacy Defaults">
          <p className="text-xs text-muted-foreground mb-3">Default privacy level for new contacts and notes</p>
          <div className="grid grid-cols-2 gap-2">
            {[
              { value: 'public', label: 'Public', color: 'text-emerald-600', desc: 'Visible to all' },
              { value: 'team_accessible', label: 'Team Only', color: 'text-blue-600', desc: 'Shared with team' },
            ].map(opt => (
              <button
                key={opt.value}
                onClick={() => setDefaultPrivacy(opt.value as typeof defaultPrivacy)}
                className={`text-left p-3 rounded-xl border-2 transition-all ${defaultPrivacy === opt.value ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/30'}`}
              >
                <p className={`text-sm font-semibold ${opt.color}`}>{opt.label}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{opt.desc}</p>
              </button>
            ))}
          </div>
        </Section>

        {/* Demo role switcher */}
        <Section icon={<Eye size={18} weight="fill" />} title="Demo: View As" sub="Switch roles to test different experience levels">
          <div className="space-y-1">
            {(['leader', 'team_admin', 'follower'] as const).map(role => (
              <button
                key={role}
                onClick={() => setUserRole(role)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm transition-colors ${userRole === role ? 'bg-primary/10 text-primary font-semibold' : 'hover:bg-muted text-foreground'}`}
              >
                <span className="capitalize">{role === 'team_admin' ? 'Team Admin' : role.charAt(0).toUpperCase() + role.slice(1)}</span>
                {userRole === role && <CheckCircle size={16} className="text-primary" weight="fill" />}
              </button>
            ))}
          </div>
          <p className="text-[10px] text-muted-foreground mt-2">Contacts and notes visibility changes by role. Leaders see everything; team sees team-accessible and above; followers see only public content.</p>
        </Section>

        {/* Team & Access */}
        <Section icon={<Users size={18} weight="fill" />} title="Team & Access">
          <NavRow icon={<Users size={16} />} label="Manage team members" href="/leader/team" />
          <NavRow icon={<Shield size={16} />} label="Permission levels" href="#" />
          <NavRow icon={<SealCheck size={16} />} label="Verified contacts" href="#" />
        </Section>

        {/* Data */}
        <Section icon={<Database size={18} weight="fill" />} title="Data & Export">
          <NavRow icon={<Database size={16} />} label="Export contacts (CSV)" href="#" />
          <NavRow icon={<Database size={16} />} label="Export interaction history" href="#" />
        </Section>

        {/* Danger zone */}
        <div className="rounded-2xl border border-red-200 dark:border-red-900 bg-red-50 dark:bg-red-950/20 p-4">
          <h3 className="text-sm font-semibold text-red-700 dark:text-red-400 mb-3">Danger zone</h3>
          <div className="space-y-1">
            <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors">
              <SignOut size={16} />
              Sign out
            </button>
            <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors">
              <Trash size={16} />
              Delete account
            </button>
          </div>
        </div>

        <p className="text-center text-xs text-muted-foreground pb-4">LeaderZ v1.0 · Phase 1 Demo</p>
      </div>
    </div>
  )
}

function Section({ icon, title, sub, children }: { icon: React.ReactNode; title: string; sub?: string; children: React.ReactNode }) {
  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="rounded-2xl border bg-card p-4">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-primary">{icon}</span>
        <div>
          <h2 className="text-sm font-semibold text-foreground">{title}</h2>
          {sub && <p className="text-xs text-muted-foreground">{sub}</p>}
        </div>
      </div>
      {children}
    </motion.div>
  )
}

function Toggle({ label, sub, value, onChange }: { label: string; sub?: string; value: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="flex items-center justify-between py-2.5 px-1">
      <div>
        <p className="text-sm font-medium text-foreground">{label}</p>
        {sub && <p className="text-xs text-muted-foreground">{sub}</p>}
      </div>
      <button
        role="switch"
        aria-checked={value}
        onClick={() => onChange(!value)}
        className={`relative w-10 h-6 rounded-full transition-colors ${value ? 'bg-primary' : 'bg-muted'}`}
      >
        <span className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white shadow transition-transform ${value ? 'translate-x-4' : ''}`} />
      </button>
    </div>
  )
}

function NavRow({ icon, label, href }: { icon: React.ReactNode; label: string; href: string }) {
  return (
    <a href={href} className="flex items-center gap-3 px-1 py-2.5 rounded-xl text-sm text-foreground hover:bg-muted transition-colors">
      <span className="text-muted-foreground">{icon}</span>
      <span className="flex-1">{label}</span>
      <CaretRight size={14} className="text-muted-foreground" />
    </a>
  )
}
