import { auth } from '@clerk/nextjs/server';
import { eq } from 'drizzle-orm';
import { NextResponse } from 'next/server';

import { db } from '@/libs/DB';
import { templateSchema } from '@/models/Schema';

export async function GET() {
  try {
    const { userId } = auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const templates = await db.select().from(templateSchema).where(eq(templateSchema.userId, userId));
    return NextResponse.json(templates);
  } catch (error) {
    console.error('Error fetching templates:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { userId } = auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { name, content } = await request.json();
    const newTemplate = await db.insert(templateSchema).values({ userId, name, content }).returning();
    return NextResponse.json(newTemplate[0]);
  } catch (error) {
    console.error('Error creating template:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const { userId } = auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id, name, content } = await request.json();
    const updatedTemplate = await db.update(templateSchema)
      .set({ name, content })
      .where(eq(templateSchema.id, id))
      .returning();

    if (updatedTemplate.length === 0) {
      return NextResponse.json({ error: 'Template not found' }, { status: 404 });
    }

    return NextResponse.json(updatedTemplate[0]);
  } catch (error) {
    console.error('Error updating template:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { userId } = auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await request.json();
    const deletedTemplate = await db.delete(templateSchema)
      .where(eq(templateSchema.id, id))
      .returning();

    if (deletedTemplate.length === 0) {
      return NextResponse.json({ error: 'Template not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Template deleted successfully' });
  } catch (error) {
    console.error('Error deleting template:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
