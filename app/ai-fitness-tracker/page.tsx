"use client"
/* eslint-disable react/no-unescaped-entities */

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'

type Macros = {
  calories: number
  protein: number
  carbs: number
  fat: number
}

type ParsedItem = {
  name: string
  quantity: number
  unit?: string
  macros: Macros
  note?: string
  matchedAs?: string
}

type MealEntry = {
  id: string
  timestamp: number
  input: string
  items: ParsedItem[]
  totals: Macros
}

// -------- Profile & Plan Types --------
type Gender = 'male' | 'female'
type Units = 'metric' | 'imperial'
type Profile = {
  gender: Gender
  heightCm: number
  weightKg: number
  goalWeightKg: number
  units: Units
}

type Plan = {
  ageAssumed: number
  bmr: number
  tdee: number
  targetCalories: number
  proteinG: number
  fatG: number
  carbsG: number
  deltaKg: number
  dailyDeltaKcal: number
  weeksToGoal: number
  targetDate: string
}

// Nutrition DB: lightweight reference values. Macros are roughly per unit specified.
// Units supported: unit (piece), g (grams), oz (ounces), cup, tbsp, slice
// Calories/macros sourced from common averages; this is a demo approximation, not medical advice.
const NDB = {
  // piece-based
  egg: { unit: 'unit', gramsPerUnit: 50, macrosPerUnit: { calories: 78, protein: 6, carbs: 0.6, fat: 5 } },
  banana: { unit: 'unit', gramsPerUnit: 118, macrosPerUnit: { calories: 105, protein: 1.3, carbs: 27, fat: 0.4 } },
  apple: { unit: 'unit', gramsPerUnit: 182, macrosPerUnit: { calories: 95, protein: 0.5, carbs: 25, fat: 0.3 } },
  toast: { unit: 'slice', gramsPerUnit: 28, macrosPerUnit: { calories: 80, protein: 3, carbs: 14, fat: 1 } },
  bread: { unit: 'slice', gramsPerUnit: 28, macrosPerUnit: { calories: 80, protein: 3, carbs: 14, fat: 1 } },
  coffee: { unit: 'cup', gramsPerUnit: 240, macrosPerUnit: { calories: 2, protein: 0.3, carbs: 0, fat: 0 } },
  oatmeal: { unit: 'cup', gramsPerUnit: 234, macrosPerUnit: { calories: 154, protein: 6, carbs: 27, fat: 3 } },
  milk: { unit: 'cup', gramsPerUnit: 244, macrosPerUnit: { calories: 122, protein: 8, carbs: 12, fat: 5 } },
  yogurt: { unit: 'cup', gramsPerUnit: 245, macrosPerUnit: { calories: 149, protein: 8.5, carbs: 11.4, fat: 8 } },

  // grams-based (per 100g)
  chicken: { unit: 'g', per: 100, macrosPer100g: { calories: 165, protein: 31, carbs: 0, fat: 3.6 } },
  "chicken breast": { unit: 'g', per: 100, macrosPer100g: { calories: 165, protein: 31, carbs: 0, fat: 3.6 } },
  rice: { unit: 'g', per: 100, macrosPer100g: { calories: 130, protein: 2.7, carbs: 28, fat: 0.3 } },
  beef: { unit: 'g', per: 100, macrosPer100g: { calories: 250, protein: 26, carbs: 0, fat: 15 } },
  salmon: { unit: 'g', per: 100, macrosPer100g: { calories: 208, protein: 20, carbs: 0, fat: 13 } },
  potato: { unit: 'g', per: 100, macrosPer100g: { calories: 77, protein: 2, carbs: 17, fat: 0.1 } },

  // tbsp/cup-based
  butter: { unit: 'tbsp', gramsPerUnit: 14, macrosPerUnit: { calories: 102, protein: 0.1, carbs: 0, fat: 12 } },
  "peanut butter": { unit: 'tbsp', gramsPerUnit: 16, macrosPerUnit: { calories: 95, protein: 3.5, carbs: 3.2, fat: 8 } },
  oil: { unit: 'tbsp', gramsPerUnit: 14, macrosPerUnit: { calories: 119, protein: 0, carbs: 0, fat: 14 } },
  "olive oil": { unit: 'tbsp', gramsPerUnit: 14, macrosPerUnit: { calories: 119, protein: 0, carbs: 0, fat: 14 } },
} as const

const ALIASES: Record<string, keyof typeof NDB> = {
  eggs: 'egg',
  slice: 'toast',
  bread: 'bread',
  toasts: 'toast',
  coffees: 'coffee',
  cup: 'coffee', // context-dependent, but fine for demo if paired with coffee
  cups: 'coffee',
  pb: 'peanut butter',
  chicken: 'chicken',
  breast: 'chicken breast',
}

const UNIT_NORMALIZE: Record<string, string> = {
  g: 'g', gram: 'g', grams: 'g',
  oz: 'oz', ounce: 'oz', ounces: 'oz',
  cup: 'cup', cups: 'cup',
  tbsp: 'tbsp', tablespoon: 'tbsp', tablespoons: 'tbsp',
  tsp: 'tsp', teaspoon: 'tsp', teaspoons: 'tsp',
  slice: 'slice', slices: 'slice',
  unit: 'unit', piece: 'unit', pieces: 'unit',
}

const OZ_TO_G = 28.3495

const initialMacros = (): Macros => ({ calories: 0, protein: 0, carbs: 0, fat: 0 })

function addMacros(a: Macros, b: Macros): Macros {
  return {
    calories: +(a.calories + b.calories).toFixed(1),
    protein: +(a.protein + b.protein).toFixed(1),
    carbs: +(a.carbs + b.carbs).toFixed(1),
    fat: +(a.fat + b.fat).toFixed(1),
  }
}

function multiplyMacros(m: Macros, factor: number): Macros {
  return {
    calories: +(m.calories * factor).toFixed(1),
    protein: +(m.protein * factor).toFixed(1),
    carbs: +(m.carbs * factor).toFixed(1),
    fat: +(m.fat * factor).toFixed(1),
  }
}

function normalizeFoodName(raw: string): string {
  const s = raw.trim().toLowerCase()
  if (ALIASES[s]) return ALIASES[s]
  return s
}

function matchFood(token: string): keyof typeof NDB | undefined {
  const t = normalizeFoodName(token)
  if (t in NDB) return t as keyof typeof NDB
  // try partials for multiword keys
  const keys = Object.keys(NDB)
  const found = keys.find((k) => t.includes(k))
  if (found) return found as keyof typeof NDB
  return undefined
}

function parseQuantityUnit(fragment: string): { qty: number; unit?: string; name?: string } {
  // Examples: "2 eggs", "1 cup oatmeal", "100g chicken", "6 oz chicken", "2 slices bread", "1 tbsp butter"
  const f = fragment.trim().toLowerCase()
  const re = /(?:(\d+\.?\d*)\s*)?(cup|cups|tbsp|tablespoon|tablespoons|tsp|teaspoon|teaspoons|g|gram|grams|oz|ounce|ounces|slice|slices|unit|piece|pieces)?\s*(.*)/
  const m = f.match(re)
  if (!m) return { qty: 1, unit: undefined, name: f }
  const qty = m[1] ? parseFloat(m[1]) : 1
  const unit = m[2] ? UNIT_NORMALIZE[m[2]] || m[2] : undefined
  const name = m[3]?.trim()
  return { qty: isNaN(qty) ? 1 : qty, unit, name }
}

function convertToMacros(name: keyof typeof NDB, qty: number, unit?: string): { macros: Macros; note?: string } {
  const item = NDB[name]
  // grams-based
  if ('macrosPer100g' in item) {
    // figure grams input
    let grams = 0
    if (unit === 'g' || !unit) grams = qty
    else if (unit === 'oz') grams = qty * OZ_TO_G
    else if (unit === 'cup' || unit === 'tbsp' || unit === 'slice' || unit === 'unit') {
      // crude fallback: use gramsPerUnit if we have a sibling entry in DB with same name and gramsPerUnit, else estimate
      const gramsPerUnit = (item as any).gramsPerUnit ?? 100
      grams = qty * gramsPerUnit
    } else {
      grams = qty
    }
    const factor = grams / item.per
    return { macros: multiplyMacros(item.macrosPer100g as unknown as Macros, factor) }
  }

  // unit-based
  if ('macrosPerUnit' in item) {
    if (!unit || unit === item.unit) {
      return { macros: multiplyMacros(item.macrosPerUnit as unknown as Macros, qty) }
    }
    // convert supported unit → target unit by grams where possible
    let grams = 0
    if (unit === 'g') grams = qty
    else if (unit === 'oz') grams = qty * OZ_TO_G
    else if (unit === 'cup' || unit === 'tbsp' || unit === 'slice' || unit === 'unit') {
      const gpu = (NDB[name] as any).gramsPerUnit ?? 0
      grams = qty * gpu
    }
    const targetGpu = (NDB[name] as any).gramsPerUnit ?? 0
    if (grams > 0 && targetGpu > 0) {
      const units = grams / targetGpu
      return { macros: multiplyMacros((NDB[name] as any).macrosPerUnit, units) }
    }
    return { macros: multiplyMacros((NDB[name] as any).macrosPerUnit, qty), note: `Assumed unit ${item.unit}` }
  }
  // fallback
  return { macros: initialMacros(), note: 'Unknown item' }
}

function parseMealInput(input: string): ParsedItem[] {
  // Split by commas and 'and'
  const parts = input
    .split(/,|\band\b/gi)
    .map((s) => s.trim())
    .filter(Boolean)

  const items: ParsedItem[] = []
  for (const part of parts) {
    const { qty, unit, name } = parseQuantityUnit(part)
    const candidate = name || part
    const matched = matchFood(candidate)
    if (!matched) {
      items.push({ name: candidate, quantity: qty, unit, macros: initialMacros(), note: 'Unrecognized item' })
      continue
    }
    const { macros, note } = convertToMacros(matched, qty, unit)
    items.push({ name: candidate, quantity: qty, unit, macros, note, matchedAs: matched })
  }
  return items
}

function sumItems(items: ParsedItem[]): Macros {
  return items.reduce((acc, it) => addMacros(acc, it.macros), initialMacros())
}

function formatDate(ts: number) {
  const d = new Date(ts)
  // Fixed locale/timeZone to avoid SSR/CSR mismatch
  return d.toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short', timeZone: 'UTC' })
}

function dayKey(ts: number) {
  const d = new Date(ts)
  return d.toISOString().slice(0, 10)
}

export default function AIFitnessDemo() {
  const [text, setText] = useState('')
  const [log, setLog] = useState<MealEntry[]>([])
  // Deterministic default to match SSR; load user profile from localStorage on mount
  const DEFAULT_PROFILE: Profile = { gender: 'male', heightCm: 175, weightKg: 75, goalWeightKg: 70, units: 'metric' }
  const [profile, setProfile] = useState<Profile>(DEFAULT_PROFILE)

  // load/save
  useEffect(() => {
    try {
      const raw = localStorage.getItem('aft_log')
      if (raw) setLog(JSON.parse(raw))
    } catch {}
  }, [])
  // Load profile after mount to avoid hydration mismatch
  useEffect(() => {
    try {
      const raw = localStorage.getItem('aft_profile')
      if (raw) setProfile((prev) => ({ ...prev, ...JSON.parse(raw) }))
    } catch {}
  }, [])
  useEffect(() => {
    try {
      localStorage.setItem('aft_log', JSON.stringify(log))
    } catch {}
  }, [log])
  useEffect(() => {
    try {
      localStorage.setItem('aft_profile', JSON.stringify(profile))
    } catch {}
  }, [profile])

  const addToLog = () => {
    const items = parseMealInput(text)
    const totals = sumItems(items)
    const entry: MealEntry = {
      id: crypto.randomUUID(),
      timestamp: Date.now(),
      input: text.trim(),
      items,
      totals,
    }
    setLog((prev) => [entry, ...prev])
    setText('')
  }

  const removeEntry = (id: string) => setLog((prev) => prev.filter((e) => e.id !== id))

  const perDay = useMemo(() => {
    const map = new Map<string, Macros>()
    for (const e of log) {
      const k = dayKey(e.timestamp)
      map.set(k, addMacros(map.get(k) ?? initialMacros(), e.totals))
    }
    return Array.from(map.entries()).sort((a, b) => (a[0] < b[0] ? 1 : -1))
  }, [log])

  // -------- Profile helpers & plan calculations --------
  const LB_PER_KG = 2.20462
  const CM_PER_IN = 2.54
  const KCAL_PER_KG = 7700 // rule-of-thumb
  const ACTIVITY = 1.2 // sedentary default
  const AGE_ASSUMED = 30 // we don't collect age; use assumption

  function toKg(lbs: number) { return lbs / LB_PER_KG }
  function toLbs(kg: number) { return kg * LB_PER_KG }
  function toCmFromFtIn(ft: number, inch: number) { return ft * 30.48 + inch * CM_PER_IN }
  function toFtInFromCm(cm: number) {
    const totalIn = cm / CM_PER_IN
    const ft = Math.floor(totalIn / 12)
    const inch = Math.round(totalIn - ft * 12)
    return { ft, inch }
  }

  function calcPlan(p: Profile): Plan {
    const s = p.gender === 'male' ? 5 : -161
    const bmr = 10 * p.weightKg + 6.25 * p.heightCm - 5 * AGE_ASSUMED + s
    const tdee = bmr * ACTIVITY
    const deltaKg = +(p.goalWeightKg - p.weightKg).toFixed(2)
    // pick 500 kcal/day deficit/surplus as a moderate pace (about 0.45 kg/week)
    const dailyDeltaKcal = deltaKg < 0 ? -500 : deltaKg > 0 ? 500 : 0
    const targetCaloriesRaw = tdee + dailyDeltaKcal
    // safety floor/ceiling
    const minCal = Math.max(1200, bmr * 0.8)
    const maxCal = tdee * 1.2
    const targetCalories = Math.min(Math.max(targetCaloriesRaw, minCal), maxCal)

    // macros: protein 1.8 g/kg, fat 0.8 g/kg, rest carbs
    const proteinG = +(p.weightKg * 1.8).toFixed(0)
    const fatG = +(p.weightKg * 0.8).toFixed(0)
    const calsAfterPF = targetCalories - (proteinG * 4 + fatG * 9)
    const carbsG = Math.max(0, Math.round(calsAfterPF / 4))

    // timeline
    const totalKcalNeeded = Math.abs(deltaKg) * KCAL_PER_KG
    const dailyKcalGap = Math.abs(tdee - targetCalories)
    const days = dailyKcalGap > 0 ? totalKcalNeeded / dailyKcalGap : 0
    const weeksToGoal = +(days / 7).toFixed(1)
    const goalDate = new Date(Date.now() + Math.round(days) * 24 * 3600 * 1000)

    return {
      ageAssumed: AGE_ASSUMED,
      bmr: Math.round(bmr),
      tdee: Math.round(tdee),
      targetCalories: Math.round(targetCalories),
      proteinG, fatG, carbsG,
      deltaKg,
      dailyDeltaKcal: Math.round(targetCalories - tdee),
      weeksToGoal,
      targetDate: goalDate.toLocaleDateString('en-US', { timeZone: 'UTC' }),
    }
  }

  const plan = useMemo(() => calcPlan(profile), [profile])

  return (
    <main className="mx-auto max-w-5xl px-6 py-16 md:py-24">
      <div className="mb-8 flex items-center gap-2">
        <Link
          href="/projects/ai-fitness-tracker"
          className="inline-flex items-center gap-2 rounded-md border border-white/10 bg-white/5 px-3 py-1.5 text-sm text-muted hover:bg-white/10 hover:text-fg/90 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/30"
        >
          <span aria-hidden>←</span>
          <span>Back to Project</span>
        </Link>
      </div>

      <section className="mb-8">
        <div className="mb-2">
          <span className="inline-flex items-center rounded-full border border-white/10 bg-white/10 px-2.5 py-1 text-[11px] uppercase tracking-wide text-white/80">Mini Demo</span>
        </div>
        <h1 className="text-3xl md:text-4xl font-semibold">AI Fitness Tracker — Live Demo</h1>
        <p className="mt-2 text-fg/80">Type meals in plain English. We&apos;ll estimate calories, protein, carbs, and fat using a small in-browser rules engine. Data is saved to your browser only.</p>
        <p className="mt-1 text-sm text-white/70">Note: This is a simplified client-only demo for the case study. The full version (not included here) uses Java Servlets + MySQL (SQL) and additional backend features.</p>
      </section>

      {/* Input moved below profile/plan */}

      {/* Profile & Plan */}
      <section aria-label="Profile and plan" className="mb-10">
        <div className="grid gap-6 md:grid-cols-2">
          {/* Profile inputs */}
          <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-white/5 to-white/[0.03] p-5 md:p-6">
            <h2 className="text-lg font-semibold mb-3">Your profile</h2>
            <div className="grid gap-3">
              <div className="flex flex-wrap items-center gap-3">
                <label className="text-sm text-white/70">Gender</label>
                <div className="flex gap-2">
                  <button
                    className={`px-3 py-1.5 text-sm rounded-md border ${profile.gender==='male'?'bg-white/15 border-white/20':'bg-white/5 border-white/10'}`}
                    onClick={() => setProfile({ ...profile, gender: 'male' })}
                  >Male</button>
                  <button
                    className={`px-3 py-1.5 text-sm rounded-md border ${profile.gender==='female'?'bg-white/15 border-white/20':'bg-white/5 border-white/10'}`}
                    onClick={() => setProfile({ ...profile, gender: 'female' })}
                  >Female</button>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <label className="text-sm text-white/70">Units</label>
                <div className="flex gap-2">
                  <button
                    className={`px-3 py-1.5 text-sm rounded-md border ${profile.units==='metric'?'bg-white/15 border-white/20':'bg-white/5 border-white/10'}`}
                    onClick={() => setProfile({ ...profile, units: 'metric' })}
                  >Metric</button>
                  <button
                    className={`px-3 py-1.5 text-sm rounded-md border ${profile.units==='imperial'?'bg-white/15 border-white/20':'bg-white/5 border-white/10'}`}
                    onClick={() => setProfile({ ...profile, units: 'imperial' })}
                  >Imperial</button>
                </div>
              </div>

              {profile.units === 'metric' ? (
                <>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label htmlFor="heightCm" className="block text-sm text-white/70 mb-1">Height (cm)</label>
                      <input id="heightCm" type="number" min={100} max={250} value={profile.heightCm}
                        placeholder="e.g., 175"
                        title="Height in centimeters"
                        onChange={(e)=>setProfile({ ...profile, heightCm: Number(e.target.value||0) })}
                        className="w-full rounded-md bg-black/30 border border-white/10 p-2" />
                    </div>
                    <div>
                      <label htmlFor="weightKg" className="block text-sm text-white/70 mb-1">Weight (kg)</label>
                      <input id="weightKg" type="number" min={30} max={300} value={profile.weightKg}
                        placeholder="e.g., 75"
                        title="Weight in kilograms"
                        onChange={(e)=>setProfile({ ...profile, weightKg: Number(e.target.value||0) })}
                        className="w-full rounded-md bg-black/30 border border-white/10 p-2" />
                    </div>
                  </div>
                  <div>
                    <label htmlFor="goalWeightKg" className="block text-sm text-white/70 mb-1">Goal weight (kg)</label>
                    <input id="goalWeightKg" type="number" min={30} max={300} value={profile.goalWeightKg}
                      placeholder="e.g., 70"
                      title="Goal weight in kilograms"
                      onChange={(e)=>setProfile({ ...profile, goalWeightKg: Number(e.target.value||0) })}
                      className="w-full rounded-md bg-black/30 border border-white/10 p-2" />
                  </div>
                </>
              ) : (
                (()=>{
                  const { ft, inch } = toFtInFromCm(profile.heightCm)
                  const [wLbs, gwLbs] = [toLbs(profile.weightKg), toLbs(profile.goalWeightKg)]
                  return (
                    <>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label htmlFor="heightFt" className="block text-sm text-white/70 mb-1">Height (ft)</label>
                          <input id="heightFt" type="number" min={3} max={8} value={ft}
                            placeholder="e.g., 5"
                            title="Height in feet"
                            onChange={(e)=>{
                              const newFt = Number(e.target.value||0)
                              setProfile({ ...profile, heightCm: toCmFromFtIn(newFt, inch) })
                            }}
                            className="w-full rounded-md bg-black/30 border border-white/10 p-2" />
                        </div>
                        <div>
                          <label htmlFor="heightIn" className="block text-sm text-white/70 mb-1">Height (in)</label>
                          <input id="heightIn" type="number" min={0} max={11} value={inch}
                            placeholder="e.g., 9"
                            title="Height in inches"
                            onChange={(e)=>{
                              const newIn = Number(e.target.value||0)
                              const { ft: curFt } = toFtInFromCm(profile.heightCm)
                              setProfile({ ...profile, heightCm: toCmFromFtIn(curFt, newIn) })
                            }}
                            className="w-full rounded-md bg-black/30 border border-white/10 p-2" />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label htmlFor="weightLb" className="block text-sm text-white/70 mb-1">Weight (lb)</label>
                          <input id="weightLb" type="number" min={66} max={660} value={Math.round(wLbs)}
                            placeholder="e.g., 165"
                            title="Weight in pounds"
                            onChange={(e)=>setProfile({ ...profile, weightKg: toKg(Number(e.target.value||0)) })}
                            className="w-full rounded-md bg-black/30 border border-white/10 p-2" />
                        </div>
                        <div>
                          <label htmlFor="goalWeightLb" className="block text-sm text-white/70 mb-1">Goal weight (lb)</label>
                          <input id="goalWeightLb" type="number" min={66} max={660} value={Math.round(gwLbs)}
                            placeholder="e.g., 154"
                            title="Goal weight in pounds"
                            onChange={(e)=>setProfile({ ...profile, goalWeightKg: toKg(Number(e.target.value||0)) })}
                            className="w-full rounded-md bg-black/30 border border-white/10 p-2" />
                        </div>
                      </div>
                    </>
                  )
                })()
              )}

              <p className="text-xs text-white/50">Assumptions: age {AGE_ASSUMED}, sedentary activity. Calculations are estimates and not medical advice.</p>
            </div>
          </div>

          {/* Plan summary */}
          <div className="rounded-2xl border border-white/10 bg-white/[0.05] p-5 md:p-6">
            <h2 className="text-lg font-semibold mb-3">Plan & timeline</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              <div className="rounded-xl border border-white/10 bg-black/30 p-3 text-center">
                <div className="text-xs text-white/70">BMR</div>
                <div className="text-xl font-semibold">{plan.bmr} kcal</div>
              </div>
              <div className="rounded-xl border border-white/10 bg-black/30 p-3 text-center">
                <div className="text-xs text-white/70">TDEE</div>
                <div className="text-xl font-semibold">{plan.tdee} kcal</div>
              </div>
              <div className="rounded-xl border border-white/10 bg-black/30 p-3 text-center">
                <div className="text-xs text-white/70">Target cals</div>
                <div className="text-xl font-semibold">{plan.targetCalories} kcal</div>
              </div>
            </div>
            <div className="mt-4 grid gap-2 sm:grid-cols-3">
              <div className="rounded-lg border border-white/10 bg-white/5 p-3 text-center">Protein {plan.proteinG} g</div>
              <div className="rounded-lg border border-white/10 bg-white/5 p-3 text-center">Carbs {plan.carbsG} g</div>
              <div className="rounded-lg border border-white/10 bg-white/5 p-3 text-center">Fat {plan.fatG} g</div>
            </div>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <div className="rounded-xl border border-white/10 bg-black/30 p-3">
                <div className="text-sm text-white/70">Weight change</div>
                {(() => {
                  const isImp = profile.units === 'imperial'
                  const delta = isImp ? toLbs(plan.deltaKg) : plan.deltaKg
                  const unit = isImp ? 'lb' : 'kg'
                  return (
                    <div className="text-lg">{delta === 0 ? 'Maintain' : `${delta > 0 ? '+' : ''}${delta.toFixed(1)} ${unit} target`}</div>
                  )
                })()}
                <div className="text-xs text-white/60">Daily adjustment: {plan.dailyDeltaKcal>0?'+':''}{plan.dailyDeltaKcal} kcal vs TDEE</div>
              </div>
              <div className="rounded-xl border border-white/10 bg-black/30 p-3">
                <div className="text-sm text-white/70">Timeline estimate</div>
                <div className="text-lg">{plan.weeksToGoal === 0 ? '—' : `${plan.weeksToGoal} weeks`}</div>
                <div className="text-xs text-white/60">ETA: {plan.weeksToGoal === 0 ? '—' : plan.targetDate}</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section aria-label="Input" className="mb-10">
        <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-white/5 to-white/[0.03] p-5 md:p-6">
          <label htmlFor="meal" className="block text-sm font-medium text-muted mb-2">Enter a meal</label>
          <textarea
            id="meal"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="e.g., 150g chicken with 1 cup rice and salad"
            rows={3}
            className="w-full rounded-lg bg-black/30 border border-white/10 p-3 focus:outline-none focus:ring-2 focus:ring-white/30"
          />
          <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
            <div className="text-xs text-white/60">Examples: &quot;2 eggs and toast with butter, coffee&quot; · &quot;6 oz chicken, 1 cup rice&quot; · &quot;1 cup oatmeal with 1 tbsp peanut butter&quot;</div>
            <button
              onClick={addToLog}
              disabled={!text.trim()}
              className="inline-flex items-center rounded-md border border-white/15 bg-white/10 px-4 py-2 text-sm hover:bg-white/15 disabled:opacity-50"
            >
              Add to log
            </button>
          </div>
        </div>
      </section>

      <section className="mb-12">
        <h2 className="text-xl font-semibold mb-3">Today&apos;s totals</h2>
        {(() => {
          const todayKey = dayKey(Date.now())
          const totals = perDay.find(([k]) => k === todayKey)?.[1] ?? initialMacros()
          const targets = {
            calories: plan.targetCalories,
            protein: plan.proteinG,
            carbs: plan.carbsG,
            fat: plan.fatG,
          }
          const remainingRaw = {
            calories: targets.calories - totals.calories,
            protein: targets.protein - totals.protein,
            carbs: targets.carbs - totals.carbs,
            fat: targets.fat - totals.fat,
          }
          const remaining = {
            calories: Math.max(0, Math.round(remainingRaw.calories)),
            protein: Math.max(0, +remainingRaw.protein.toFixed(1)),
            carbs: Math.max(0, +remainingRaw.carbs.toFixed(1)),
            fat: Math.max(0, +remainingRaw.fat.toFixed(1)),
          }

          const Card = ({ label, value, unit, sub }: { label: string; value: number; unit: string; sub?: string }) => (
            <div className="rounded-xl border border-white/10 bg-white/5 p-4 text-center">
              <div className="text-sm text-white/70">{label}</div>
              <div className="text-2xl font-semibold">{Math.round(value)}{unit}</div>
              {sub ? <div className="mt-1 text-xs text-white/60">{sub}</div> : null}
            </div>
          )

          return (
            <>
              <div className="mb-3 grid grid-cols-2 sm:grid-cols-4 gap-3">
                <Card label="Calories" value={totals.calories} unit=" kcal" sub={`Target ${targets.calories} kcal`} />
                <Card label="Protein" value={totals.protein} unit=" g" sub={`Target ${targets.protein} g`} />
                <Card label="Carbs" value={totals.carbs} unit=" g" sub={`Target ${targets.carbs} g`} />
                <Card label="Fat" value={totals.fat} unit=" g" sub={`Target ${targets.fat} g`} />
              </div>
              <div className="text-sm text-white/70 mb-2">Remaining</div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <Card label="Calories" value={remaining.calories} unit=" kcal" sub={remainingRaw.calories < 0 ? `Over by ${Math.abs(Math.round(remainingRaw.calories))} kcal` : undefined} />
                <Card label="Protein" value={remaining.protein} unit=" g" sub={remainingRaw.protein < 0 ? `Over by ${Math.abs(remainingRaw.protein).toFixed(1)} g` : undefined} />
                <Card label="Carbs" value={remaining.carbs} unit=" g" sub={remainingRaw.carbs < 0 ? `Over by ${Math.abs(remainingRaw.carbs).toFixed(1)} g` : undefined} />
                <Card label="Fat" value={remaining.fat} unit=" g" sub={remainingRaw.fat < 0 ? `Over by ${Math.abs(remainingRaw.fat).toFixed(1)} g` : undefined} />
              </div>
            </>
          )
        })()}
      </section>

      <section className="mb-12">
        <h2 className="text-xl font-semibold mb-3">Meal log</h2>
        {log.length === 0 ? (
          <p className="text-white/70">No entries yet. Add your first meal above.</p>
        ) : (
          <ul className="space-y-3">
            {log.map((e) => (
              <li key={e.id} className="rounded-xl border border-white/10 bg-white/[0.05] p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="text-sm text-white/60">{formatDate(e.timestamp)}</div>
                    <div className="mt-1 text-fg/90">{e.input}</div>
                  </div>
                  <button
                    onClick={() => removeEntry(e.id)}
                    className="text-xs text-white/60 hover:text-white/90 border border-white/10 rounded-md px-2 py-1"
                    aria-label="Delete entry"
                  >
                    Delete
                  </button>
                </div>
                <div className="mt-3 grid grid-cols-2 sm:grid-cols-4 gap-2 text-sm">
                  <div className="rounded-lg border border-white/10 bg-black/30 p-2 text-center">Cal {e.totals.calories.toFixed(0)}</div>
                  <div className="rounded-lg border border-white/10 bg-black/30 p-2 text-center">P {e.totals.protein.toFixed(1)} g</div>
                  <div className="rounded-lg border border-white/10 bg-black/30 p-2 text-center">C {e.totals.carbs.toFixed(1)} g</div>
                  <div className="rounded-lg border border-white/10 bg-black/30 p-2 text-center">F {e.totals.fat.toFixed(1)} g</div>
                </div>
                {e.items.length > 0 ? (
                  <details className="mt-3 group">
                    <summary className="cursor-pointer text-sm text-white/70">Show breakdown</summary>
                    <div className="mt-2 grid gap-2 sm:grid-cols-2">
                      {e.items.map((it, i) => (
                        <div key={i} className="rounded-lg border border-white/10 bg-white/5 p-2">
                          <div className="text-sm font-medium">{it.quantity} {it.unit ? `${it.unit} ` : ''}{it.name}{it.matchedAs && it.matchedAs !== it.name ? <span className="text-white/50"> · matched: {it.matchedAs}</span> : null}</div>
                          <div className="mt-1 text-xs text-white/70">Cal {it.macros.calories.toFixed(0)} · P {it.macros.protein.toFixed(1)}g · C {it.macros.carbs.toFixed(1)}g · F {it.macros.fat.toFixed(1)}g{it.note ? ` — ${it.note}` : ''}</div>
                        </div>
                      ))}
                    </div>
                  </details>
                ) : null}
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="mb-16">
        <h2 className="text-xl font-semibold mb-3">Daily trend (summary)</h2>
        {perDay.length === 0 ? (
          <p className="text-white/70">No data yet.</p>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-white/10">
            <table className="min-w-[560px] w-full text-sm">
              <thead className="bg-white/10">
                <tr>
                  <th className="text-left p-2 font-semibold">Date</th>
                  <th className="text-right p-2 font-semibold">Calories</th>
                  <th className="text-right p-2 font-semibold">Protein (g)</th>
                  <th className="text-right p-2 font-semibold">Carbs (g)</th>
                  <th className="text-right p-2 font-semibold">Fat (g)</th>
                </tr>
              </thead>
              <tbody>
                {perDay.map(([d, m]) => (
                  <tr key={d} className="odd:bg-white/5">
                    <td className="p-2">{new Date(d).toLocaleDateString('en-US', { timeZone: 'UTC' })}</td>
                    <td className="p-2 text-right">{m.calories.toFixed(0)}</td>
                    <td className="p-2 text-right">{m.protein.toFixed(1)}</td>
                    <td className="p-2 text-right">{m.carbs.toFixed(1)}</td>
                    <td className="p-2 text-right">{m.fat.toFixed(1)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <footer className="text-xs text-white/50">
        This demo runs entirely in your browser. Values are approximations for educational use only.
      </footer>
    </main>
  )
}
