// __tests__/api/normalize-note.test.ts
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

// Hoisted so the mock factory below can reference these
const { mockGenerateContent } = vi.hoisted(() => ({
  mockGenerateContent: vi.fn(),
}));

const { mockRequireRole, mockAssertRateLimit } = vi.hoisted(() => ({
    mockRequireRole: vi.fn(),
    mockAssertRateLimit: vi.fn(),
}))

vi.mock('@/app/api/auth', () => ({
    requireRole: mockRequireRole,
    assertRateLimit: mockAssertRateLimit,
}))


vi.mock('@google/genai', () => ({
  GoogleGenAI: vi.fn().mockImplementation(() => ({
    models: { generateContent: mockGenerateContent },
  })),
  // Stubs for the Type enum used by the schema module
  Type: {
    OBJECT: 'OBJECT', ARRAY: 'ARRAY', STRING: 'STRING',
    INTEGER: 'INTEGER', NUMBER: 'NUMBER', BOOLEAN: 'BOOLEAN',
  },
}));

// Import AFTER the mock is declared
import { POST } from '@/app/api/notes/normalize/route';

const validGeminiOutput = {
  chiefComplaint: 'Vomiting and fever',
  history: 'Diabetic patient, post-chemo week 1',
  observations: ['Vomiting 3x yesterday', 'Fever 101°F'],
  vitals: { temperature: '101°F' },
  medications: [],
  suggestedFollowUp: ['Doctor review'],
  urgencyFlag: 'urgent',
  uncertainPhrases: [],
};

function makeReq(body: unknown): Request {
  return new Request('http://localhost/api/notes/normalize', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

beforeEach(() => {
  process.env.GEMINI_API_KEY = 'test-key'
  mockGenerateContent.mockReset()
  mockRequireRole.mockReset()
  mockAssertRateLimit.mockReset()

  // Default: authenticated nurse, rate limit not exceeded
  mockRequireRole.mockResolvedValue({ uid: 'test-uid', role: 'nurse' })
  mockAssertRateLimit.mockResolvedValue(undefined)
});

afterEach(() => vi.clearAllMocks());

describe('POST /api/notes/normalize', () => {
  it('rejects input shorter than 3 chars', async () => {
    const res = await POST(makeReq({ text: 'hi', language: 'tanglish', source: 'typed' }));
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toBe('invalid_input');
    expect(mockGenerateContent).not.toHaveBeenCalled();
  });

  it('rejects input longer than 4000 chars', async () => {
    const res = await POST(makeReq({ text: 'a'.repeat(4001), language: 'tanglish', source: 'typed' }));
    expect(res.status).toBe(400);
  });

  it('rejects unknown language', async () => {
    const res = await POST(makeReq({ text: 'patient fever', language: 'klingon', source: 'typed' }));
    expect(res.status).toBe(400);
  });

  it('returns normalized note on valid input', async () => {
    mockGenerateContent.mockResolvedValue({ text: JSON.stringify(validGeminiOutput) });

    const res = await POST(makeReq({
      text: 'Patient Lakshmi 45 years vandhi 3 times fever 101 chemo last week',
      language: 'tanglish',
      source: 'typed',
    }));

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.normalized.chiefComplaint).toBe('Vomiting and fever');
    expect(body.normalized.urgencyFlag).toBe('urgent');
    expect(body.model).toBeTruthy();
    expect(body.promptVersion).toBeGreaterThanOrEqual(1);
  });

  it('sends low temperature and JSON schema config to Gemini', async () => {
    mockGenerateContent.mockResolvedValue({ text: JSON.stringify(validGeminiOutput) });

    await POST(makeReq({ text: 'fever cough patient', language: 'tanglish', source: 'typed' }));

    expect(mockGenerateContent).toHaveBeenCalledTimes(1);
    const call = mockGenerateContent.mock.calls[0][0];
    expect(call.config.temperature).toBeLessThanOrEqual(0.2);
    expect(call.config.responseMimeType).toBe('application/json');
    expect(call.config.responseJsonSchema).toBeDefined();
    expect(call.config.systemInstruction).toContain('PuduCan');
  });

  it('includes few-shot examples in contents', async () => {
    mockGenerateContent.mockResolvedValue({ text: JSON.stringify(validGeminiOutput) });

    await POST(makeReq({ text: 'fever cough patient', language: 'tanglish', source: 'typed' }));

    const { contents } = mockGenerateContent.mock.calls[0][0];
    const lastTurn = contents[contents.length - 1];
    expect(lastTurn.role).toBe('user');
    expect(lastTurn.parts[0].text).toContain('fever cough patient');
    // At least one model exemplar before the actual user input
    expect(contents.some((t: { role: string }) => t.role === 'model')).toBe(true);
  });

  it('returns 502 when Gemini returns non-JSON text', async () => {
    mockGenerateContent.mockResolvedValue({ text: 'oops not json {' });
    const res = await POST(makeReq({ text: 'fever cough', language: 'tanglish', source: 'typed' }));
    expect(res.status).toBe(502);
    expect((await res.json()).error).toBe('normalization_failed');
  });

  it('returns 502 when Gemini output fails Zod validation', async () => {
    // Missing required `urgencyFlag`
    mockGenerateContent.mockResolvedValue({ text: JSON.stringify({
      chiefComplaint: 'x', history: '', observations: [],
      suggestedFollowUp: [], uncertainPhrases: [],
    })});
    const res = await POST(makeReq({ text: 'fever cough', language: 'tanglish', source: 'typed' }));
    expect(res.status).toBe(502);
  });

  it('returns 502 when Gemini SDK throws', async () => {
    mockGenerateContent.mockRejectedValue(new Error('quota exceeded'));
    const res = await POST(makeReq({ text: 'fever cough', language: 'tanglish', source: 'typed' }));
    expect(res.status).toBe(502);
    expect((await res.json()).message).toMatch(/quota/i);
  });

  it('returns 502 when Gemini returns empty text', async () => {
    mockGenerateContent.mockResolvedValue({ text: '' });
    const res = await POST(makeReq({ text: 'fever cough', language: 'tanglish', source: 'typed' }));
    expect(res.status).toBe(502);
  });

  it('returns 401 when no session', async () => {
    mockRequireRole.mockRejectedValue(
        new Response(JSON.stringify({ error: 'unauthorized' }), { status: 401 })
    )
    const res = await POST(makeReq({ text: 'fever cough patient', language: 'tanglish', source: 'typed' }))
    expect(res.status).toBe(401)
    expect(mockGenerateContent).not.toHaveBeenCalled()
  });

  it('returns 403 when role not permitted', async () => {
    mockRequireRole.mockRejectedValue(
        new Response(JSON.stringify({ error: 'forbidden' }), { status: 403 })
    )
    const res = await POST(makeReq({ text: 'fever cough patient', language: 'tanglish', source: 'typed' }))
    expect(res.status).toBe(403)
    expect(mockGenerateContent).not.toHaveBeenCalled()
  });

  it('returns 429 when rate-limited', async () => {
    mockAssertRateLimit.mockRejectedValue(
        new Response(JSON.stringify({ error: 'rate_limit_exceeded' }), { status: 429 })
    )
    const res = await POST(makeReq({ text: 'fever cough patient', language: 'tanglish', source: 'typed' }))
    expect(res.status).toBe(429)
    expect(mockGenerateContent).not.toHaveBeenCalled()
  });
});