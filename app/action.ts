"use server";

import { GoogleGenerativeAI } from "@google/generative-ai";
import { Patient } from "@/schema/patient";

const SUMMARY_CACHE_TTL_MS = 10 * 60 * 1000;
const RATE_LIMIT_WINDOW_MS = 60 * 1000;
const RATE_LIMIT_MAX_REQUESTS = 5;

const summaryCache = new Map<string, { summary: string; createdAt: number }>();
const rateLimitStore = new Map<string, number[]>();

function getCacheKey(patientData: Partial<Patient>) {
    return String(patientData.id || patientData.name || "unknown-patient");
}

function getCachedSummary(cacheKey: string) {
    const cached = summaryCache.get(cacheKey);
    if (!cached) return null;

    if (Date.now() - cached.createdAt > SUMMARY_CACHE_TTL_MS) {
        summaryCache.delete(cacheKey);
        return null;
    }

    return cached.summary;
}

function setCachedSummary(cacheKey: string, summary: string) {
    summaryCache.set(cacheKey, {
        summary,
        createdAt: Date.now(),
    });
}

function isRateLimited(cacheKey: string) {
    const now = Date.now();
    const recentRequests = (rateLimitStore.get(cacheKey) || []).filter(
        (timestamp) => now - timestamp < RATE_LIMIT_WINDOW_MS
    );

    if (recentRequests.length >= RATE_LIMIT_MAX_REQUESTS) {
        rateLimitStore.set(cacheKey, recentRequests);
        return true;
    }

    rateLimitStore.set(cacheKey, [...recentRequests, now]);
    return false;
}

function isGeminiRateLimitError(error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    return (
        message.includes("429") ||
        message.toLowerCase().includes("quota") ||
        message.toLowerCase().includes("rate limit") ||
        message.toLowerCase().includes("resource_exhausted")
    );
}

function removeEmptyFields<T>(value: T): T {
    if (Array.isArray(value)) {
        return value
            .map((item) => removeEmptyFields(item))
            .filter((item) => item !== undefined && item !== null && item !== "") as T;
    }

    if (value && typeof value === "object") {
        return Object.fromEntries(
            Object.entries(value)
                .map(([key, nestedValue]) => [key, removeEmptyFields(nestedValue)])
                .filter(([, nestedValue]) => {
                    if (nestedValue === undefined || nestedValue === null || nestedValue === "") return false;
                    if (Array.isArray(nestedValue) && nestedValue.length === 0) return false;
                    return !(typeof nestedValue === "object" && Object.keys(nestedValue).length === 0);
                })
        ) as T;
    }

    return value;
}

function extractCancerRelevantData(patient: Partial<Patient>) {
    return removeEmptyFields({
        id: patient.id,
        name: patient.name,
        dob: patient.dob || "unknown",
        sex: patient.sex,
        suspectedCase: patient.suspectedCase,
        biopsyNumber: patient.biopsyNumber,
        hbcrID: patient.hbcrID,
        address: patient.address,
        diseases: patient.diseases || [],
        patientStatus: patient.patientStatus,
        diagnosedDate: patient.diagnosedDate,
        diagnosedYearsAgo: patient.diagnosedYearsAgo,
        stageOfTheCancer: patient.stageOfTheCancer,
        treatmentStartDate: patient.treatmentStartDate,
        treatmentEndDate: patient.treatmentEndDate,
        treatmentDetails: patient.treatmentDetails || [],
        hospitalRegistrationDate: patient.hospitalRegistrationDate,
        assignedHospital: patient.assignedHospital?.name,
        patientDeathDate: patient.patientDeathDate,
        followUps: (patient.followUps || []).slice(-2),
    });
}

function buildFallbackSummary(patientData: Partial<Patient>) {
    const statusParts = [
        patientData.sex ? `a ${patientData.sex} patient` : "a patient",
        patientData.patientStatus ? `currently marked as ${patientData.patientStatus}` : "with current status not clearly documented",
    ];

    const cancerParts = [
        patientData.suspectedCase ? "listed as a suspected cancer case" : null,
        Array.isArray(patientData.diseases) && patientData.diseases.length > 0
            ? `with documented disease(s): ${patientData.diseases.join(", ")}`
            : null,
        patientData.stageOfTheCancer ? `stage recorded as ${patientData.stageOfTheCancer}` : null,
        patientData.biopsyNumber ? `biopsy number ${patientData.biopsyNumber}` : null,
    ].filter(Boolean);

    const timelineParts = [
        patientData.diagnosedDate ? `diagnosed on ${patientData.diagnosedDate}` : null,
        patientData.treatmentStartDate ? `treatment started on ${patientData.treatmentStartDate}` : null,
        patientData.treatmentEndDate ? `treatment ended on ${patientData.treatmentEndDate}` : null,
        patientData.hospitalRegistrationDate ? `registered at hospital on ${patientData.hospitalRegistrationDate}` : null,
        patientData.assignedHospital ? `assigned to ${patientData.assignedHospital}` : null,
    ].filter(Boolean);

    const followUps = Array.isArray(patientData.followUps) ? patientData.followUps : [];
    const latestFollowUp = followUps.length > 0 ? followUps[followUps.length - 1] : null;
    const latestFollowUpText =
        latestFollowUp && typeof latestFollowUp === "object" && "remarks" in latestFollowUp
            ? `Latest follow-up notes: ${String(latestFollowUp.remarks)}.`
            : "Latest follow-up concerns are not documented in the available record.";

    return `This is ${statusParts.join(", ")}${cancerParts.length ? `, ${cancerParts.join(", ")}` : ", with cancer diagnosis/stage details not clearly documented"}. ${timelineParts.length ? `Care timeline includes ${timelineParts.join(", ")}.` : "Diagnosis, treatment timeline, and hospital registration details are limited in the available record."} ${latestFollowUpText}`;
}

async function generateAISummary(patientData: any) {
    const cacheKey = getCacheKey(patientData);
    const cachedSummary = getCachedSummary(cacheKey);

    if (cachedSummary) {
        return { summary: cachedSummary, fromCache: true };
    }

    if (isRateLimited(cacheKey)) {
        return {
            error: "Too many AI summary requests. Please wait before trying again.",
            rateLimited: true,
        };
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        return { error: "AI summary is not configured. Please add GEMINI_API_KEY." };
    }

    try {
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ 
            model: "gemini-2.5-flash-lite",
            generationConfig: {
                maxOutputTokens: 200,
                temperature: 0.2,
                topP: 0.8,
                topK: 32,
            }
        });

        const prompt = `You are helping a clinician review a cancer screening/cancer care patient record.
Write a complete clinician-facing summary in 2-3 sentences, 45-80 words total.
 
Required structure:
1. Current status: sex, alive/deceased status, cancer disease/suspected case/stage if available.
2. Care timeline: diagnosis/treatment/hospital registration/latest follow-up if available.
3. Clinical note: urgent alerts, missing critical data, or "available records are limited" if few clinical fields exist.
 
Rules:
- Do not invent details.
- If the patient is deceased, mention it first.
- Do not stop after identifying only sex/status.
- Return only the final summary paragraph, no bullets or headings.
 
Patient Data:
${JSON.stringify(patientData)}`;

        const result = await model.generateContent(prompt);
        const summary = result.response.text().trim();
        console.log(summary)

        if (!summary) return { error: "AI returned an empty summary." };
        if (summary.split(/\s+/).length < 25) {
            const fallbackSummary = buildFallbackSummary(patientData);
            setCachedSummary(cacheKey, fallbackSummary);
            return { summary: fallbackSummary, fromCache: false };
        }

        setCachedSummary(cacheKey, summary);
        return { summary };
    } catch (error) {
        console.error("Gemini API error:", error);

        if (isGeminiRateLimitError(error)) {
            const fallbackCachedSummary = getCachedSummary(cacheKey);

            if (fallbackCachedSummary) {
                return {
                    summary: fallbackCachedSummary,
                    fromCache: true,
                    rateLimited: true,
                };
            }

            return {
                error: "AI service rate limit reached and no previous summary is cached for this patient.",
                rateLimited: true,
            };
        }

        return { 
            error: "Unable to generate AI summary right now.",
            details: error instanceof Error ? error.message : String(error),
        };
    }
}

export async function generateSummary(patient: Partial<Patient>) {
    if (!patient?.id) {
        return {
            success: false,
            message: "Patient data is missing. Unable to generate summary.",
            summary: null,
        };
    }

    // Extract only cancer-relevant fields to optimize tokens
    const cancerData = extractCancerRelevantData(patient);

    // Generate AI summary
    const aiResult = await generateAISummary(cancerData);

    if (aiResult.error) {
        return {
            success: false,
            patientId: patient.id,
            patientName: patient.name ?? "Unknown Patient",
            summary: null,
            summaryError: aiResult.error,
            fromCache: aiResult.fromCache ?? false,
            rateLimited: aiResult.rateLimited ?? false,
        };
    }

    return {
        success: true,
        patientId: patient.id,
        patientName: patient.name ?? "Unknown Patient",
        summary: aiResult.summary,
        fromCache: aiResult.fromCache ?? false,
        rateLimited: aiResult.rateLimited ?? false,
    };
}