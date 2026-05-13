// components/smart-note/NormalizedNotePreview.tsx
'use client'

import { AlertCircle } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import type { ClinicalNote } from '@/lib/ai/clinical-note-prompt'
import { cn } from '@/lib/utils'

interface Props {
    note: ClinicalNote
    originalText: string
}

export function NormalizedNotePreview({ note, originalText }: Props) {
    return (
        <Card>
            <CardContent className="p-4">
                <Tabs defaultValue="normalized">
                    <div className="mb-3 flex items-center justify-between">
                        <TabsList>
                            <TabsTrigger value="normalized">Clinical note</TabsTrigger>
                            <TabsTrigger value="original">Original input</TabsTrigger>
                        </TabsList>
                        <UrgencyBadge flag={note.urgencyFlag} />
                    </div>

                    <TabsContent value="normalized" className="space-y-4">
                        <Section label="Chief complaint">{note.chiefComplaint}</Section>
                        {note.history && <Section label="History">{note.history}</Section>}

                        {note.observations.length > 0 && (
                            <Section label="Observations">
                                <ul className="ml-4 list-disc space-y-0.5 text-sm">
                                    {note.observations.map((o, i) => (
                                        <li key={i}>{o}</li>
                                    ))}
                                </ul>
                            </Section>
                        )}

                        {note.vitals && Object.values(note.vitals).some(Boolean) && (
                            <Section label="Vitals">
                                <dl className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm sm:grid-cols-3">
                                    {Object.entries(note.vitals)
                                        .filter(([, v]) => Boolean(v))
                                        .map(([k, v]) => (
                                            <div key={k} className="flex gap-2">
                                                <dt className="capitalize text-muted-foreground">
                                                    {k.replace(/([A-Z])/g, ' $1').trim()}:
                                                </dt>
                                                <dd className="font-medium">{v as string}</dd>
                                            </div>
                                        ))}
                                </dl>
                            </Section>
                        )}

                        {note.medications.length > 0 && (
                            <Section label="Medications">
                                <ul className="space-y-1 text-sm">
                                    {note.medications.map((m, i) => (
                                        <li key={i}>
                                            <span className="font-medium">{m.name}</span>
                                            {m.dose && ` — ${m.dose}`}
                                            {m.frequency && `, ${m.frequency}`}
                                            {m.notes && (
                                                <span className="text-muted-foreground">
                                                    {' '}
                                                    ({m.notes})
                                                </span>
                                            )}
                                        </li>
                                    ))}
                                </ul>
                            </Section>
                        )}

                        {note.suggestedFollowUp.length > 0 && (
                            <Section label="Suggested follow-up">
                                <ul className="ml-4 list-disc space-y-0.5 text-sm">
                                    {note.suggestedFollowUp.map((s, i) => (
                                        <li key={i}>{s}</li>
                                    ))}
                                </ul>
                            </Section>
                        )}

                        {note.uncertainPhrases.length > 0 && (
                            <div className="flex items-start gap-2 rounded-md border border-yellow-500/50 bg-yellow-50 px-3 py-2 text-sm text-yellow-900 dark:bg-yellow-950/30 dark:text-yellow-200">
                                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                                <div className="flex-1">
                                    <div className="mb-1.5 font-medium">
                                        Uncertain phrases — please verify:
                                    </div>
                                    <ul className="space-y-1.5 text-xs">
                                        {note.uncertainPhrases.map((u, i) => (
                                            <li key={i}>
                                                <span className="font-mono">"{u.original}"</span>
                                                {' → '}
                                                <span>interpreted as: {u.interpretation}</span>
                                                <div className="text-muted-foreground">
                                                    Why: {u.reason}
                                                </div>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        )}
                    </TabsContent>

                    <TabsContent value="original">
                        <pre className="whitespace-pre-wrap rounded-md bg-muted p-3 font-mono text-sm">
                            {originalText}
                        </pre>
                    </TabsContent>
                </Tabs>
            </CardContent>
        </Card>
    )
}

function Section({ label, children }: { label: string; children: React.ReactNode }) {
    return (
        <div>
            <h4 className="mb-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                {label}
            </h4>
            <div className="text-sm">{children}</div>
        </div>
    )
}

function UrgencyBadge({ flag }: { flag: ClinicalNote['urgencyFlag'] }) {
    const styles: Record<ClinicalNote['urgencyFlag'], string> = {
        routine: 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300',
        urgent: 'bg-orange-100 text-orange-800 dark:bg-orange-900/40 dark:text-orange-300',
        emergency: 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300',
    }
    return <Badge className={cn('uppercase', styles[flag])}>{flag}</Badge>
}