# ClinicPro - AI Agent Reference Guide

**AI-Powered Medical Scribing Platform for New Zealand GPs**  
*Solo GP-built project using AI-assisted development*

---

## 🎯 Quick Context

**What**: AI consultation note generation for NZ GPs (transcription → SOAP notes in <1 minute)  
**Who**: New Zealand General Practitioners, solo/small practices  
**Business**: Tiered SaaS ($30-89 NZD/month) with usage-based RBAC  

### Core Features
- Real-time transcription (Deepgram) + AI note generation (OpenAI/Claude)
- Template-driven documentation with NZ clinical guidelines (RAG)
- Mobile recording via QR code (no app required)
- Clinical decision support (differential diagnosis, ACC codes)
- Privacy-first design (NZ Privacy Act 2020 compliant)

---

## 🏗️ Architecture

**Tech Stack**: Next.js 15 + React 19 + TypeScript + Clerk RBAC + Neon PostgreSQL + OpenAI/Claude + AWS S3 + Ably + Stripe + Vercel

**Organization**: Feature-based structure with Next.js route groups for business domain separation (clinical, admin, business, marketing, user)

> **See**: `.cursor/rules/architecture.mdc` for detailed tech stack, project structure, and architectural patterns
