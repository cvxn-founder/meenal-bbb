export interface StepAnalysisRequest {
  step: number;
  stepName: string;
  wizardData: Record<string, unknown>;
  contextData: Record<string, unknown>;
}

const SYSTEM_PROMPT = `You are a senior pharma marketing strategist specializing in the Indian pharmaceutical market. You help brand managers build comprehensive brand strategies using structured analytical frameworks. Be concise, data-driven, and action-oriented. Format responses with clear headings and bullet points. Keep responses focused and under 500 words unless the complexity warrants more.`;

function buildUserPrompt(req: StepAnalysisRequest): string {
  const { step, stepName, wizardData, contextData } = req;
  const s1 = (wizardData.step1 as Record<string, string>) ?? {};
  const brand = s1.brandName || 'the brand';
  const company = s1.companyName || 'the company';
  const drugClass = s1.drugClass || 'the drug class';

  switch (step) {
    case 1:
      return `Analyze this product profile for ${brand} by ${company}:
Drug class: ${drugClass}
Key ingredient: ${s1.keyIngredientName || 'N/A'}
MoA: ${s1.keyIngredientMoa || 'N/A'}
Uses: ${s1.uses || 'N/A'}
Type: ${s1.innovatorGeneric || 'Generic'}
MRP: Rs. ${s1.mrpValue || 'N/A'} per ${s1.mrpPackType || 'pack'}

Provide a brief product positioning assessment covering: clinical differentiation, pricing positioning, and key strategic considerations for the Indian market.`;

    case 2: {
      const s2 = (wizardData.step2 as Record<string, string>) ?? {};
      return `Analyze the market environment for ${brand} (${drugClass}) in India:

Country attractiveness: ${s2.countryAttractive || 'Not assessed'}
Industry attractiveness: ${s2.industryAttractive || 'Not assessed'}
Market attractiveness: ${s2.marketAttractive || 'Not assessed'}
Category size: ${s2.categorySize || 'N/A'} | Growth: ${s2.categoryGrowth || 'N/A'} | Competition: ${s2.competitiveIntensity || 'N/A'}
Market context: ${s2.marketSizeGrowth || 'Not provided'}
Key players: ${s2.keyPlayers || 'Not listed'}
Clinical evidence level: ${s2.clinicalEvidence || 'N/A'} | Publication level: ${s2.publicationLevel || 'N/A'}

India context: Population 1.44Bn, Pharma market $54.6Bn growing 12.3%, OOP reimbursement >30%.

Provide a structured environment analysis with: attractiveness verdict, key market drivers, barriers to entry, and strategic recommendations.`;
    }

    case 3: {
      const s3 = (wizardData.step3 as Record<string, string>) ?? {};
      const competitors = (contextData.competitors as unknown[]) ?? [];
      return `Define and analyze the market for ${brand} in India:

Market definition: ${s3.marketDefinition || 'Not defined'}
Market size & growth: ${s3.marketSizeGrowthRate || 'Not provided'}
Drug classes/molecules: ${s3.drugClassMolecules || 'Not listed'}
Physician universe: ${s3.physicianUniverse || 'Not quantified'}
Patient universe: ${s3.patientUniverse || 'Not quantified'} million
Key players: ${s3.keyPlayers || 'Not listed'}
Semantic competitor search found: ${competitors.length} related drugs

Provide: market sizing assessment, competitive intensity analysis, key unmet needs in this market, and market entry/growth recommendations.`;
    }

    case 4: {
      const s4 = (wizardData.step4 as Record<string, string>) ?? {};
      const metrics = contextData.funnelMetrics as Record<string, string | number> ?? {};
      return `Analyze the patient funnel for ${brand} (${drugClass}) in India:

Patients living with disease: ${s4.patientsLiving || '?'} Mn
Diagnosed: ${s4.patientsDiagnosed || '?'} Mn (${metrics.diagnosedPct || '?'}% diagnosis rate)
Treated: ${s4.patientsTreated || '?'} Mn (${metrics.treatedPct || '?'}% treatment rate)
Target patients: ${s4.patientsTargeted || '?'} Mn (${metrics.targetedPct || '?'}% target rate)

Analyze the leakage at each funnel stage. Identify: where the biggest opportunity lies, what is causing patient leakage, and what interventions would be most effective. Recommend priority leverage points.`;
    }

    case 5: {
      const s5 = (wizardData.step5 as Record<string, string>) ?? {};
      return `Map the complete patient journey for ${brand} (${drugClass}):

Origination: ${s5.origination || 'Not described'}
Diagnosis: ${s5.diagnosis || 'Not described'}
Treatment choices: ${s5.treatmentChoices || 'Not described'}
Brand choice: ${s5.brandChoice || 'Not described'}
Access/Fulfilment: ${s5.accessFulfilment || 'Not described'}
Adherence: ${s5.adherence || 'Not described'}

Create a narrative patient journey analysis. Identify: key decision points, moments of truth, barriers at each stage, and opportunities for brand intervention. Suggest specific tactics for each stage.`;
    }

    case 6: {
      const s6 = (wizardData.step6 as Record<string, unknown>) ?? {};
      const lp = s6.leveragePoints as Record<string, { selected: boolean; leakage: string }> ?? {};
      const selected = Object.entries(lp).filter(([, v]) => v.selected).map(([k, v]) => `${k} (leakage: ${v.leakage || 'N/A'}%)`);
      const recs = (contextData.recommendations as Array<{ stage: string; reason: string }>) ?? [];
      return `Evaluate leverage points for ${brand} in the Indian pharma market:

Selected leverage points: ${selected.join(', ') || 'None selected yet'}
Auto-recommendations: ${recs.map(r => r.stage + ': ' + r.reason).join('; ')}

For each selected leverage point, provide: tactical recommendations, expected impact, resource requirements, and success metrics. Prioritize the top 3 and explain the strategic logic.`;
    }

    case 7: {
      const s7 = (wizardData.step7 as Record<string, unknown>) ?? {};
      const stakeholders = s7.stakeholders as Array<{ type: string; influence: number; drivers: string; barriers: string }> ?? [];
      const shText = stakeholders.map(sh => `${sh.type} (${sh.influence}% influence): Drivers: ${sh.drivers || 'N/A'}, Barriers: ${sh.barriers || 'N/A'}`).join('\n');
      return `Analyze key stakeholder dynamics for ${brand} (${drugClass}) in India:

${shText}

India context: 50,000 GPs, 41,000 CPs, 60,000 Internal Medicine specialists, 37,000 Gynecologists, 5,200 Urologists.

Provide: stakeholder influence analysis, engagement strategy for each key group, key messages by stakeholder type, and priority engagement tactics. Identify the most influential stakeholders and how to win them.`;
    }

    case 8: {
      const s8 = (wizardData.step8 as Record<string, unknown>) ?? {};
      const competitors = s8.competitors as Array<{ brand: string; company: string; segment: string; coverage: string; notes: string }> ?? [];
      const compText = competitors.filter(c => c.brand).map(c => `${c.brand} (${c.company}): ${c.segment} segment, ${c.coverage} coverage. ${c.notes}`).join('\n');
      return `Analyze contested categories for ${brand} in Indian pharma:

Competitors:
${compText || 'Not yet mapped'}

Category matrix: ${(s8.categoryMatrix as string) || 'Not described'}

Identify: which segments are most contested, where the white space opportunities are, how ${brand} should position vs each competitor, and recommended focus segments. Include specific tactics to penetrate key segments.`;
    }

    case 9: {
      const s9 = (wizardData.step9 as Record<string, string>) ?? {};
      const pubs = contextData.publications as Array<{ title?: string }> ?? [];
      return `Build brand wheel analysis for ${brand}:

Features & Attributes:
- ${s9.feature1 || 'Not defined'}, ${s9.feature2 || 'Not defined'}, ${s9.feature3 || 'Not defined'}

Clinical Data: ${s9.clinicalData1 || 'N/A'} | ${s9.clinicalData2 || 'N/A'} | ${s9.clinicalData3 || 'N/A'}
Endorsements: ${s9.endorsement1 || 'N/A'} | ${s9.endorsement2 || 'N/A'} | ${s9.endorsement3 || 'N/A'}
Supporting evidence: ${s9.supportingEvidence || 'Not provided'}
Current SMP: "${s9.smp || 'Not defined'}"
Brand Essence: "${s9.brandEssence || 'Not defined'}"

Relevant publications found: ${pubs.map(p => p.title?.slice(0, 60)).filter(Boolean).join('; ') || 'None'}

Evaluate the brand wheel. Refine the SMP and brand essence. Suggest 3 alternative SMPs. Identify the strongest claims and recommend key messages for HCPs and patients.`;
    }

    case 10: {
      const s10 = (wizardData.step10 as Record<string, unknown>) ?? {};
      const segs = s10.segments as Array<Record<string, string | number>> ?? [];
      const segText = segs.map(seg => `${seg.hcpType}: Universe ${seg.universe}, MMM ${seg.mmm}, Tier1 ${seg.tier1}%, Tier2 ${seg.tier2}%, Tier3 ${seg.tier3}%`).join('\n');
      const totalUniv = contextData.totalUniverse as number ?? 0;
      const totalMMM = contextData.totalMMM as number ?? 0;
      return `Optimize HCP segmentation strategy for ${brand} in India:

Segments:
${segText || 'Not defined'}
Total universe: ${totalUniv.toLocaleString()} | Total MMM: ${totalMMM.toLocaleString()}

Provide: segmentation strategy assessment, resource allocation recommendations, tier optimization advice, coverage gap analysis, and ROI expectations by segment. Suggest optimal call frequency and channel mix by tier.`;
    }

    case 11: {
      const s1d = (wizardData.step1 as Record<string, string>) ?? {};
      const s2 = (wizardData.step2 as Record<string, string>) ?? {};
      const s3 = (wizardData.step3 as Record<string, string>) ?? {};
      const s4 = (wizardData.step4 as Record<string, string>) ?? {};
      const s9 = (wizardData.step9 as Record<string, string>) ?? {};
      return `Generate a comprehensive SWOT analysis for ${brand} (${company}) in India.

CONTEXT SUMMARY:
Product: ${s1d.brandName || brand}, ${s1d.drugClass || drugClass}, Key ingredient: ${s1d.keyIngredientName || 'N/A'}
Environment: Country ${s2.countryAttractive || 'N/A'}, Industry ${s2.industryAttractive || 'N/A'}, Market ${s2.marketAttractive || 'N/A'}
Market: ${s3.marketDefinition || 'N/A'}, Size: ${s3.marketSizeGrowthRate || 'N/A'}
Funnel: ${s4.patientsLiving || 'N/A'}Mn living, ${s4.patientsDiagnosed || 'N/A'}Mn diagnosed, ${s4.patientsTreated || 'N/A'}Mn treated
Brand: SMP "${s9.smp || 'N/A'}", Essence "${s9.brandEssence || 'N/A'}"

Generate 4-5 bullet points for each SWOT quadrant. Use the format:
## Strengths
- [point]
## Weaknesses
- [point]
## Opportunities
- [point]
## Threats
- [point]

Then provide a 2-3 sentence strategic synthesis.`;
    }

    case 12: {
      const leaderboard = contextData.leaderboard as Array<Record<string, string>> ?? [];
      const s3 = (wizardData.step3 as Record<string, string>) ?? {};
      const boardText = leaderboard.map(r => `${r.rank}. ${r.brand} (${r.company}): MAT Y5 = ${r.mat5}, CAGR = ${r.cagr}`).join('\n');
      return `Analyze market position and provide strategic recommendations for ${brand}:

Market: ${s3.marketDefinition || 'N/A'}, Size: ${s3.marketSizeGrowthRate || 'N/A'}

AWACS Leaderboard:
${boardText || 'Data not provided'}

Provide:
1. Market position assessment for ${brand}
2. Gap to market leadership
3. Growth trajectory analysis
4. Strategic recommendations to improve market rank
5. Key success factors for the next 3 years in the Indian pharma context`;
    }

    default:
      return `Analyze step ${step} (${stepName}) for ${brand} in the Indian pharma market. Data: ${JSON.stringify(wizardData).slice(0, 500)}`;
  }
}

export async function callQwen(env: { DASHSCOPE_API_KEY: string; DASHSCOPE_BASE_URL?: string; QWEN_CHAT_MODEL?: string }, req: StepAnalysisRequest): Promise<string> {
  const baseUrl = env.DASHSCOPE_BASE_URL || 'https://dashscope-intl.aliyuncs.com/compatible-mode/v1';
  const model = env.QWEN_CHAT_MODEL || 'qwen-turbo-latest';
  const userPrompt = buildUserPrompt(req);

  const response = await fetch(`${baseUrl}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${env.DASHSCOPE_API_KEY}`
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: userPrompt }
      ],
      max_tokens: 1024,
      temperature: 0.7
    })
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Qwen API error ${response.status}: ${errText.slice(0, 200)}`);
  }

  const data = await response.json() as {
    choices: Array<{ message: { content: string } }>;
    error?: { message: string };
  };

  if (data.error) throw new Error(data.error.message);

  return data.choices?.[0]?.message?.content ?? 'No response generated.';
}
