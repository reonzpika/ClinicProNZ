# Technical Architecture Research Findings

**Document Status:** Research findings for Objective 1 design (23 Nov 2025)  
**Purpose:** Evaluate technical approaches for building NZ-sovereign clinical AI system  
**Source:** Perplexity AI research query (23 Nov 2025)

---

## Research Question

**What is the optimal technical architecture to deliver 50+ clinical AI tools for NZ general practice under cost, privacy, and safety constraints?**

**Context:**
- 5,000 NZ GPs × 50 requests/day = 250,000 requests/day at national scale
- Azure OpenAI GPT-4: $140-170k/month (cost-prohibitive)
- Target: $5-10k/month infrastructure cost
- Must be NZ data sovereign (hosted NZ/AU, no offshore PHI)
- Safety-critical healthcare application (assist-only, no diagnostic/treatment advice)
- Must handle NZ-specific data (Pharmac, ACC codes, regional lab variations)

---

## Technical Architecture Approaches Evaluated

### **1. Single Small LLM (7B-13B parameters, fine-tuned)**

**Description:**
- One unified model fine-tuned on NZ clinical data
- Self-hosted on NZ/AU GPU infrastructure
- Handles all 50+ tools with shared NZ domain knowledge

**Pros:**
- ✓ Lower latency and operational cost
- ✓ Easier local hosting for NZ data sovereignty
- ✓ Direct fine-tuning for NZ-specific content (BPAC, Pharmac, ACC)
- ✓ Unified architecture (simpler deployment)

**Cons:**
- ✗ May lack depth for highly specialized tasks requiring contextual clinical knowledge
- ✗ Risk of reduced performance on multi-task and complex reasoning vs larger models
- ✗ Especially concerning for safety-critical workflows

**Cost Implications:**
- $5-10k/month with model quantization and optimized serving
- Training infrastructure costs relatively low
- Fits target budget

**Safety/Reliability:**
- Less "black-box" than massive models
- Requires continuous validation and auditing
- Risk: generalist model may hallucinate on edge cases

**Maintenance Burden:** Moderate
- Retraining needed for guideline updates
- Single model to maintain (simpler than multiple models)

**Development Timeline:** 2-4 months

**Real-World Examples:**
- DocOA (osteoarthritis domain-specific LLM) - NCBI 2024[1]

**References:**
- [1] https://pmc.ncbi.nlm.nih.gov/articles/PMC11301122/
- [2] https://arxiv.org/html/2506.12958v2
- [3] https://bit-biomed.com/moe-mixture-of-experts-significantly-enhancing-ai-efficiency-and-accuracy-in-healthcare-a-bit-research-alliance-empirical-analysis/

---

### **2. Hybrid Approach (LLM + Rule-Based Systems)**

**Description:**
- LLM handles unstructured tasks (inbox triage, letter interpretation, communication)
- Rule-based engines handle deterministic tasks (prescription validation, screening eligibility, recall scheduling)
- Combined orchestration layer

**Pros:**
- ✓ Combines LLM flexibility with deterministic reliability
- ✓ Higher reliability for safety-critical use cases
- ✓ Rule-based layer provides "hard safety net" for critical calculations
- ✓ Can offload simple tasks to cheaper rule engines

**Cons:**
- ✗ Integration complexity
- ✗ Potential for workflow fragmentation if boundaries poorly defined
- ✗ Needs clear task allocation strategy

**Cost Implications:**
- Rules engines cost minimal (compute-cheap)
- LLM scaled for unstructured tasks only
- Can optimize overall costs by offloading deterministic work

**Safety/Reliability:**
- **High** - Rule-based layer provides deterministic validation
- Critical calculations (CVDRA, dose adjustments) use proven algorithms
- LLM only used where appropriate

**Maintenance Burden:** High
- Needs ongoing synchronization between rules engine and clinical guidelines
- LLM updates separate from rules updates
- Two systems to maintain and validate

**Development Timeline:** 3-6 months

**Real-World Examples:**
- NHS AI Skunkworks projects
- NZ COVID lab result bots (rule-based triage)

**References:**
- [4] https://journalwjarr.com/sites/default/files/fulltext_pdf/WJARR-2025-1093.pdf
- [5] https://www.jmir.org/2025/1/e74976

---

### **3. Task-Specific Fine-Tuned Models**

**Description:**
- Separate specialized models for each major task domain
- Each model optimized for specific use case (prescription model, lab interpretation model, care gap model, etc.)

**Pros:**
- ✓ Maximum accuracy per task
- ✓ Tailored to NZ guidelines and data formats per domain
- ✓ Isolation reduces cross-task interference

**Cons:**
- ✗ High maintenance burden - many models to update
- ✗ Deployment complexity (orchestrating multiple models)
- ✗ Lock-in risk for older models
- ✗ Harder to share NZ domain knowledge across tasks

**Cost Implications:**
- **High** - Scaling individual models for 250k requests/day fragments resources
- Infrastructure costs inflate with many deployed models
- Each model needs separate GPU allocation

**Safety/Reliability:**
- **Highest** for safety-critical isolated tools
- Each model validated independently
- Failure in one model doesn't affect others

**Maintenance Burden:** Very High
- Many models to retrain when guidelines/formats change
- Version management complexity
- Testing burden multiplies

**Development Timeline:** 6+ months

**Real-World Examples:**
- Mayo Clinic sepsis prediction alerts (single-task model)[5]

**References:**
- [5] https://www.jmir.org/2025/1/e74976

---

### **4. Mixture of Experts (MoE)**

**Description:**
- Multiple specialized sub-models ("experts") within unified framework
- Gating network routes each request to appropriate expert(s)
- Only active experts used per request (parameter-efficient)

**Pros:**
- ✓ Allows specialization per task/domain within unified framework
- ✓ Active parameters reduced at inference (lower cost than monolithic large model)
- ✓ Scalable for growing set of tools - add new experts without retraining entire system
- ✓ Excellent at handling multimodal and multi-specialty workflows (lab, text, images)
- ✓ Easier scaling as system grows

**Cons:**
- ✗ Implementation expertise needed (gating networks, expert selection)
- ✗ Development timeline longer
- ✗ Complexity in training and validation

**Cost Implications:**
- Operational costs **lower than large monolithic models**
- Supports cost reduction below GPT-4/5 levels
- Parameter-efficient (only active experts loaded)
- Fits $5-10k/month target

**Safety/Reliability:**
- **High if gating works well**
- Can "route" critical requests to proven, validated experts
- Expert isolation provides some fault tolerance

**Maintenance Burden:** Moderate
- Training new experts for added tools relatively straightforward
- Gating network needs retraining as experts added
- Easier than maintaining many separate models

**Development Timeline:** 4-8 months

**Real-World Examples:**
- Mixtral 8x7B (open-source MoE, approaching GPT-4 on domain tasks)
- BIT Research Alliance healthcare MoE implementations[3]

**References:**
- [3] https://bit-biomed.com/moe-mixture-of-experts-significantly-enhancing-ai-efficiency-and-accuracy-in-healthcare-a-bit-research-alliance-empirical-analysis/
- [6] https://www.datacamp.com/blog/mixture-of-experts-moe

---

### **5. Agentic Workflows (LLM + Tool-Calling + Orchestration)**

**Description:**
- LLM acts as intelligent coordinator
- Calls calculation APIs, rule engines, databases, external tools
- Dynamic decision-making and task sequencing

**Pros:**
- ✓ Dynamic decision-making and task sequencing
- ✓ Supports highly multi-task and evolving setups
- ✓ Can integrate existing tools/APIs easily
- ✓ Flexible architecture for adding new capabilities

**Cons:**
- ✗ Complexity in system design
- ✗ Orchestration overhead
- ✗ LLM reliability affects entire workflow
- ✗ Debugging complexity (hard to trace failures)

**Cost Implications:**
- Potentially efficient if orchestrator only passes requests to cost-effective APIs/models
- LLM orchestrator needs to run on every request
- Tool-calling overhead adds latency

**Safety/Reliability:**
- Additional tooling and guardrails required for critical actions
- Safety depends on tool policies and orchestration logic
- LLM hallucination risk in orchestration decisions

**Maintenance Burden:** Moderate to High
- Coordination logic must be robust and frequently validated
- Each tool change may require orchestration updates
- Testing complexity (many execution paths)

**Development Timeline:** 4-8 months

**Real-World Examples:**
- Modular AI healthcare agents (PMC 2025)[7][8]
- McKinsey modular healthcare AI architecture[8]

**References:**
- [7] https://pmc.ncbi.nlm.nih.gov/articles/PMC12629813/
- [8] https://www.mckinsey.com/industries/healthcare/our-insights/the-coming-evolution-of-healthcare-ai-toward-a-modular-architecture

---

### **6. RAG + Commercial LLM (Retrieval-Augmented Generation)**

**Description:**
- Use GPT-4 (Azure AU-hosted) with NZ-specific knowledge retrieval
- Curated knowledge base: BPAC, NZGG, Pharmac, HealthPathways
- Retrieve relevant context, augment LLM prompts

**Pros:**
- ✓ High quality outputs (GPT-4 reasoning)
- ✓ Faster development (no model training)
- ✓ NZ-specific knowledge via retrieval (no fine-tuning needed)
- ✓ Easier to update knowledge base than retrain model

**Cons:**
- ✗ **Cost at scale** - $140-170k/month for 250k requests/day
- ✗ Privacy concerns (even with Azure AU, Microsoft controls infrastructure)
- ✗ Vendor lock-in (Microsoft pricing, deprecation risk)
- ✗ Latency overhead (retrieval + LLM inference)

**Cost Implications:**
- **Prohibitive** at national scale ($1.7M/year API costs)
- Does not meet target budget ($5-10k/month)

**Safety/Reliability:**
- High (GPT-4 quality)
- But black-box model (limited auditability)

**Maintenance Burden:** Low to Moderate
- No model training/retraining
- Knowledge base updates straightforward
- API dependency risk

**Development Timeline:** 2-3 months (fastest)

**Real-World Examples:**
- Many commercial healthcare AI pilots use this approach

**References:**
- [1] https://pmc.ncbi.nlm.nih.gov/articles/PMC11301122/

---

## Comparison Table

| Approach | Cost (250k req/day) | Safety/Reliability | Maintenance | Dev Timeline | Multi-Task Capability | NZ Customization |
|----------|---------------------|--------------------|--------------|--------------|-----------------------|------------------|
| **Single Small LLM** | $5-10k/month ✓ | Moderate (needs audit) | Moderate | 2-4 months | Limited | High (fine-tuning) |
| **Hybrid (LLM+Rules)** | $5-10k/month ✓ | **High** (rules safety net) | High | 3-6 months | **Excellent** | **Excellent** |
| **Task-Specific Models** | $15-25k/month ✗ | **Highest** per task | Very High | 6+ months | Poor (fragmented) | Excellent per task |
| **MoE** | $7-12k/month ✓ | **High** (if gated well) | Moderate | 4-8 months | **Excellent** | **Excellent** |
| **Agentic Workflows** | $8-15k/month ✓ | Moderate (orchestration risk) | Moderate-High | 4-8 months | **Excellent** | Good (tool-based) |
| **RAG + GPT-4** | $140-170k/month ✗✗✗ | High (GPT-4 quality) | Low-Moderate | 2-3 months | Good | Moderate (retrieval) |

---

## 2024-2025 Research Insights

### Small Model Performance vs GPT-4

**Key Finding:** Small, smart models (Mixtral 8x7B, StableBeluga2) are **approaching GPT-4/5 levels** on several domain-specific tasks but still lag in complex reasoning or multitasking without RAG or MoE enhancements.[2]

**Implication:** For **narrow, well-defined NZ clinical tasks** (lab interpretation, inbox triage), small models can achieve 70-80% of GPT-4 quality at 20-50x lower cost.

### Hybrid/RAG Approaches

**Key Finding:** Hybrid/RAG approaches (layering retrieval over general LLMs or using tool-augmented workflows) can often **match or beat GPT-4** for domain specificity at far lower cost.[1]

**Implication:** Combining small LLM with rule-based validation and NZ knowledge retrieval may outperform pure GPT-4 for our use case.

### MoE Adoption in Clinical AI

**Key Finding:** MoE architectures are being adopted for clinical multimodal/complex AI, leading to **faster cost-effective iterations** and improved model specialization.[3][6]

**Implication:** MoE is proven in healthcare domain for multi-task scenarios like ours.

---

## Healthcare Safety-Critical Recommendations

### Industry Consensus (2025 Research)

1. **Hybrid or MoE designs** where deterministic and rule-based validation "wrap" any AI outputs are recommended for safety-critical tools.[9][4]

2. **Rigorous monitoring, regular auditing, conservative default behaviors**, and hard stops for ambiguous/unsafe outputs are mandatory.[9][4]

3. **Pure general-purpose LLMs are not enough** - robust data pipelines, specialized evaluation metrics, and clear boundaries for AI assistance vs diagnostic advice are required.[8][5]

### Specific Safety Mechanisms Required

- Rule-based validation layer for all safety-critical outputs
- Monthly safety regressions (prohibited-claim rate ≤0.5%)
- Hard stops for ambiguous cases (default to human review)
- Audit logs (no PHI, track all AI decisions)
- Rollback capability (revert to previous version if issues detected)

**References:**
- [4] https://journalwjarr.com/sites/default/files/fulltext_pdf/WJARR-2025-1093.pdf
- [5] https://www.jmir.org/2025/1/e74976
- [9] https://www.sciencedirect.com/science/article/pii/S1566253525008747

---

## Handling Multi-Task and NZ-Specific Challenges

### Multi-Task Learning

**Best Supported By:**
- MoE (expert specialization within unified framework)
- Agentic workflows (dynamic task routing)
- Modular hybrid (clear task boundaries)

**Least Suitable:**
- Task-specific models (fragmented, no shared learning)
- Single small LLM (generalist struggles with 50+ diverse tasks)

### Domain-Specific Customization (NZ Guidelines, Pharmac, ACC)

**Best Approaches:**
- Fine-tuning (single LLM) - direct NZ knowledge injection
- Expert components (MoE) - NZ-specific experts
- Curated clinical APIs and rule engines (hybrid) - NZ rules hardcoded

**Key Requirement:** Comprehensive NZ clinical corpus (BPAC, NZGG, Pharmac, ACC, regional guidelines)

### Structured Output Generation (CVDRA, Dose Calculations)

**Most Reliable:**
- Rule-based or API-enhanced architectures
- NOT generative models alone (hallucination risk)

**Recommendation:** Use LLM to extract parameters, rule engine to compute results

### Regional Data Variation (Lab Format Differences)

**Solution:** Modular data layers and normalization
- Data virtualization layer "normalizes" regional formats
- AI sees consistent schema
- Adapters handle LabTests Auckland ≠ SCL ≠ Medlab differences

**References:**
- [3] https://bit-biomed.com/moe-mixture-of-experts-significantly-enhancing-ai-efficiency-and-accuracy-in-healthcare-a-bit-research-alliance-empirical-analysis/
- [4] https://journalwjarr.com/sites/default/files/fulltext_pdf/WJARR-2025-1093.pdf
- [8] https://www.mckinsey.com/industries/healthcare/our-insights/the-coming-evolution-of-healthcare-ai-toward-a-modular-architecture
- [10] https://gcgglobalhealthcare.com/preparing-healthcare-it-architecture-for-ai-part-2/

---

## Expert Recommendation for NZ GP Context

### Perplexity Conclusion

> "For a NZ GP context meeting your constraints, **modular hybrid architectures (LLM+Rules with plug-in APIs for tool-calling, robust data layers, locally hosted MoE, and rule-based validation around all safety-critical outputs)** offer the best blend of scalability, cost, reliability, and adaptability to local clinical requirements."[8][4][5][3][1]

### Why Hybrid/MoE is Recommended

1. **Cost-Effective:** Meets $5-10k/month target (vs $140k/month for GPT-4)
2. **Safety:** Rule-based validation for critical calculations (CVDRA, dose adjustments)
3. **Scalability:** MoE allows adding new tools without full retraining
4. **NZ Customization:** Fine-tuned experts + NZ rule libraries
5. **Multi-Task:** Proven approach for 50+ diverse clinical tools
6. **Proven:** Industry adoption in healthcare (BIT Research, NHS, McKinsey recommendations)

---

## Preliminary Recommendation (Subject to Objective 1 Research)

### Leading Candidate: **Hybrid MoE Architecture**

**Architecture:**
```
┌─────────────────────────────────────────────────┐
│           Medtech FHIR Integration              │
│    (Inbox, Patient Data, Observations, etc.)    │
└──────────────────┬──────────────────────────────┘
                   │
┌──────────────────▼──────────────────────────────┐
│          Data Normalization Layer               │
│   (Handle regional lab variations, DHB formats) │
└──────────────────┬──────────────────────────────┘
                   │
         ┌─────────▼─────────┐
         │  Request Router   │
         └─────────┬─────────┘
                   │
        ┌──────────┴──────────┐
        │                     │
┌───────▼───────┐    ┌────────▼────────┐
│   MoE LLM     │    │  Rules Engine   │
│  (7-13B NZ)   │    │ (Deterministic) │
├───────────────┤    ├─────────────────┤
│ • Inbox Expert│    │ • CVDRA calc    │
│ • Lab Expert  │    │ • Dose calc     │
│ • Letter Expert│   │ • Screening     │
│ • Care Gap    │    │   eligibility   │
│   Expert      │    │ • Recall logic  │
│ • Comms Expert│    │ • Pharmac rules │
└───────┬───────┘    └────────┬────────┘
        │                     │
        └──────────┬──────────┘
                   │
         ┌─────────▼─────────┐
         │ Safety Validation │
         │  (Prohibited      │
         │   claim checks)   │
         └─────────┬─────────┘
                   │
         ┌─────────▼─────────┐
         │ Alert Prioritizer │
         │  (Dashboard UX)   │
         └─────────┬─────────┘
                   │
         ┌─────────▼─────────┐
         │  Medtech Widget   │
         │   (GP Interface)  │
         └───────────────────┘
```

**Rationale:**
- **MoE LLM** handles unstructured, context-dependent tasks (triage, letter interpretation, communication)
- **Rules Engine** handles safety-critical calculations (CVDRA, dosing, screening eligibility)
- **Best of both worlds:** LLM flexibility + Rule-based safety
- **Scalable:** Add new experts as new tools developed
- **Cost-Efficient:** Only active experts loaded per request
- **NZ-Tuned:** Each expert fine-tuned on NZ-specific data

### Objective 1 Will Systematically Evaluate

Despite this leading candidate, **Objective 1 R&D will systematically compare**:
1. Pure small LLM (7B baseline)
2. Hybrid LLM+Rules (no MoE)
3. Hybrid MoE+Rules (leading candidate)
4. Agentic workflows (LLM orchestrator + tools)

**Success Criteria:** Architecture selected based on:
- Accuracy on 3 representative use cases (inbox triage, lab interpretation, care gap detection)
- Cost per 1,000 requests
- Latency (P95 <5.0s)
- Safety metrics (prohibited-claim rate, refusal appropriateness)
- Development/maintenance complexity

---

## Next Steps

1. **Document this research in grant proposal** - Show systematic evaluation approach
2. **Update Objective 1** - Include architecture comparison as core R&D activity
3. **Design proof-of-concept experiments** - 3 use cases × 4 architectures = 12 PoCs
4. **Define evaluation metrics** - Quantifiable comparison criteria
5. **Budget allocation** - Time/cost for each architecture PoC

---

**Document Version:** 1.0  
**Last Updated:** 23 Nov 2025  
**Status:** Research findings documented; Objective 1 design in progress
