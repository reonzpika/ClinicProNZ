import { NextResponse } from 'next/server';
import OpenAI from 'openai';

import { extractRBACContext } from '@/src/lib/rbac-enforcer';
import { TemplateService } from '@/src/features/templates/template-service';
import { compileTemplate } from '@/src/features/templates/utils/compileTemplate';
import { PromptOverridesService } from '@/src/features/prompts/prompt-overrides-service';
import { getDb } from 'database/client';
import { promptRollouts, promptVersions } from '@/db/schema';

export async function POST(req: Request) {
  try {
    const context = await extractRBACContext(req);
    if (context.tier !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const body = await req.json();
    const { templateId, additionalNotes = '', transcription = '', typedInput = '', systemText, userText, scope, generate } = body || {};

    if (!templateId) {
      return NextResponse.json({ error: 'templateId required' }, { status: 400 });
    }

    const template = await TemplateService.getById(templateId);
    if (!template) {
      return NextResponse.json({ error: 'Template not found' }, { status: 404 });
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
        const rows = await db.select({ versionId: promptRollouts.versionId }).from(promptRollouts).where(promptRollouts.scope.eq('global')).orderBy(promptRollouts.createdAt.desc()).limit(1) as any;
        const versionId = rows?.[0]?.versionId || null;
        if (versionId) {
          const vRows = await db.select().from(promptVersions).where(promptVersions.id.eq(versionId)).limit(1) as any;
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
