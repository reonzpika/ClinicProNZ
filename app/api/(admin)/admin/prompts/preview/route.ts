import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import { and, desc, eq } from 'drizzle-orm';

import { extractRBACContext } from '@/src/lib/rbac-enforcer';
import { TemplateService } from '@/src/features/templates/template-service';
import { compileTemplate } from '@/src/features/templates/utils/compileTemplate';
import { PromptOverridesService } from '@/src/features/prompts/prompt-overrides-service';
import { getDb } from 'database/client';
import { promptRollouts, promptVersions } from '@/db/schema';
import { generateSystemPrompt } from '@/src/features/templates/utils/systemPrompt';

function buildUserBaseOverrideTemplate(): string {
  const sections: string[] = [];
  sections.push('=== CONSULTATION DATA ===');
  sections.push('');
  sections.push('{{DATA}}');
  sections.push('');
  sections.push('=== CRITICAL SAFETY REQUIREMENTS ===');
  sections.push('');
  sections.push('## MEDICATION VERIFICATION (MANDATORY)');
  sections.push('');
  sections.push('Cross-reference EVERY medication against your NZ pharmaceutical training data:');
  sections.push('');
  sections.push('**Test each medication:**');
  sections.push('☐ Is this EXACT name in NZ formulary/PHARMAC data I was trained on?');
  sections.push('☐ Does it match a known NZ medication EXACTLY (not just similar)?');
  sections.push('');
  sections.push('**MUST flag these examples:**');
  sections.push('- "Zolpram" → Sounds like Zoloft/Zolpidem but NOT in NZ formulary → FLAG');
  sections.push('- "Stonoprim" → Not in NZ medication database → FLAG');
  sections.push('- "still clear" → Not a medication name → FLAG');
  sections.push('- Similar-sounding but not exact → FLAG');
  sections.push('');
  sections.push('**Confident examples:**');
  sections.push('- "citalopram" → Yes, NZ SSRI → Use confidently ✓');
  sections.push('- "Flixonase" → Yes, NZ nasal spray brand → Use confidently ✓');
  sections.push('- "paracetamol" → Yes, common NZ medication → Use confidently ✓');
  sections.push('');
  sections.push('**Rule: If NOT found in your NZ pharmaceutical knowledge → FLAG IT**');
  sections.push('Better to over-flag than miss medication errors.');
  sections.push('');
  sections.push('## ANTI-HALLUCINATION REQUIREMENTS');
  sections.push('');
  sections.push('**Assessment sections:**');
  sections.push('✓ Use EXACT problem wording from Additional Notes');
  sections.push('✗ Never upgrade symptoms to diagnoses not stated by GP');
  sections.push('✗ Never add differential diagnoses not mentioned');
  sections.push('');
  sections.push('**Plan/Management sections:**');
  sections.push('✓ Include ONLY actions explicitly stated in consultation data');
  sections.push('✗ Never infer standard treatments based on diagnosis');
  sections.push('✗ Never add "Consider..." unless GP said it');
  sections.push('✗ Never add "Advised..." unless documented');
  sections.push('✗ Never add "Review if..." unless stated');
  sections.push('');
  sections.push('**Violation examples to AVOID:**');
  sections.push('❌ Diagnosis="sinusitis" → adding "Consider decongestants" (not stated)');
  sections.push('❌ Adding "symptomatic treatment" (not documented)');
  sections.push('❌ Writing "None documented" in empty sections');
  sections.push('');
  sections.push('**Blank section policy:**');
  sections.push('- If template section has no data → leave COMPLETELY BLANK (no text)');
  sections.push('- Do NOT write "None", "Not documented", or any placeholder');
  sections.push('');
  sections.push('## PRE-OUTPUT VALIDATION CHECKLIST');
  sections.push('');
  sections.push('Before generating, verify:');
  sections.push('☐ Every assessment matches Additional Notes exactly?');
  sections.push('☐ Every plan item explicitly stated?');
  sections.push('☐ All medications verified against NZ formulary or flagged?');
  sections.push('☐ No inferred treatments added?');
  sections.push('☐ Empty sections left blank?');
  sections.push('');
  sections.push('Generate the clinical note now.');
  return sections.join('\n');
}

export async function POST(req: Request) {
  try {
    const context = await extractRBACContext(req);
    if (context.tier !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const body = await req.json();
    const { templateId, additionalNotes = '', transcription = '', typedInput = '', systemText, userText, scope, generate, placeholdersOnly } = body || {};

    if (!templateId) {
      return NextResponse.json({ error: 'templateId required' }, { status: 400 });
    }

    const template = await TemplateService.getById(templateId);
    if (!template) {
      return NextResponse.json({ error: 'Template not found' }, { status: 404 });
    }

    if (placeholdersOnly === true) {
      const systemPlaceholder = generateSystemPrompt('{{TEMPLATE}}');
      const userPlaceholder = buildUserBaseOverrideTemplate();
      return NextResponse.json({ placeholders: { system: systemPlaceholder, user: userPlaceholder } });
    }

    const { system: baseSystem, user: baseUser } = compileTemplate(
      templateId,
      template.templateBody,
      { additionalNotes, transcription, typedInput },
    );

    const buildDataBlock = () => {
      const parts: string[] = [];
      parts.push('=== CONSULTATION DATA ===');
      parts.push('');
      if (additionalNotes?.trim()) {
        parts.push('PRIMARY SOURCE: Additional Notes');
        parts.push("(GP's clinical reasoning and problem list - use as clinical authority)");
        parts.push('');
        parts.push(additionalNotes.trim());
        parts.push('');
      }
      if (transcription?.trim()) {
        parts.push('SUPPLEMENTARY SOURCE: Transcription');
        parts.push('(Doctor-patient dialogue - extract supporting details)');
        parts.push('');
        parts.push(transcription.trim());
        parts.push('');
      }
      if (typedInput?.trim()) {
        parts.push('SUPPLEMENTARY SOURCE: Typed Notes');
        parts.push('(Additional observations and measurements)');
        parts.push('');
        parts.push(typedInput.trim());
        parts.push('');
      }
      return parts.join('\n');
    };

    // If explicit override texts provided, preview with those; otherwise use rollout per scope
    let effectiveSystem = baseSystem;
    let effectiveUser = baseUser;

    if (typeof systemText === 'string' && typeof userText === 'string') {
      if (!systemText.includes('{{TEMPLATE}}')) {
        return NextResponse.json({ error: 'System override must include {{TEMPLATE}}' }, { status: 400 });
      }
      if (!userText.includes('{{DATA}}')) {
        return NextResponse.json({ error: 'User override must include {{DATA}}' }, { status: 400 });
      }
      effectiveSystem = systemText.replaceAll('{{TEMPLATE}}', template.templateBody);
      effectiveUser = userText.replaceAll('{{DATA}}', buildDataBlock());
    } else {
      if (scope === 'global') {
        // Resolve global-only rollout
        const db = getDb();
        const rows = await db
          .select({ versionId: promptRollouts.versionId })
          .from(promptRollouts)
          .where(eq(promptRollouts.scope, 'global'))
          .orderBy(desc(promptRollouts.createdAt))
          .limit(1) as any;
        const versionId = rows?.[0]?.versionId || null;
        if (versionId) {
          const vRows = await db
            .select()
            .from(promptVersions)
            .where(eq(promptVersions.id, versionId))
            .limit(1) as any;
          const v = vRows?.[0];
          if (v) {
            effectiveSystem = v.systemText.replaceAll('{{TEMPLATE}}', template.templateBody);
            effectiveUser = v.userText.replaceAll('{{DATA}}', buildDataBlock());
          }
        }
      } else {
        // default: self > global
        const activeVersion = await PromptOverridesService.getActiveForUser(context.userId);
        effectiveSystem = activeVersion ? activeVersion.systemText.replaceAll('{{TEMPLATE}}', template.templateBody) : baseSystem;
        effectiveUser = activeVersion ? activeVersion.userText.replaceAll('{{DATA}}', buildDataBlock()) : baseUser;
      }
    }

    if (generate === true) {
      // Non-streaming generation using effective prompts
      const apiKey = process.env.OPENAI_API_KEY;
      if (!apiKey) return NextResponse.json({ error: 'Missing OPENAI_API_KEY' }, { status: 500 });
      const openai = new OpenAI({ apiKey, timeout: 45000 });
      const completion: any = await openai.chat.completions.create({
        model: 'gpt-4.1-mini',
        messages: [
          { role: 'system', content: effectiveSystem },
          { role: 'user', content: effectiveUser },
        ],
        temperature: 0.1,
        max_tokens: 2000,
        stream: false,
      });
      const note = completion?.choices?.[0]?.message?.content || '';
      return NextResponse.json({
        base: { system: baseSystem, user: baseUser },
        effective: { system: effectiveSystem, user: effectiveUser },
        note,
      });
    }

    return NextResponse.json({ base: { system: baseSystem, user: baseUser }, effective: { system: effectiveSystem, user: effectiveUser } });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message || 'Failed to build preview' }, { status: 400 });
  }
}
