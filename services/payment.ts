// Mock AI-powered payment verification.
// Simulates SMS matching + screenshot OCR with a delay.

export interface VerificationInput {
  method: 'vodafone' | 'instapay';
  expectedAmount: number;
  screenshotUri?: string;
}

export interface VerificationResult {
  verified: boolean;
  amount: number;
  sender: string;
  confidence: number;
  reason: string;
}

function fakeSender(method: 'vodafone' | 'instapay') {
  if (method === 'vodafone') return '01001234567';
  return 'instapay@etlob';
}

export function verifyPayment(input: VerificationInput): Promise<VerificationResult> {
  return new Promise((resolve) => {
    const delay = 1800 + Math.random() * 1200;
    setTimeout(() => {
      const hasShot = !!input.screenshotUri;
      const confidence = hasShot ? 0.86 + Math.random() * 0.12 : 0.55 + Math.random() * 0.2;
      const verified = confidence > 0.7;
      resolve({
        verified,
        amount: input.expectedAmount,
        sender: fakeSender(input.method),
        confidence: Number(confidence.toFixed(2)),
        reason: verified
          ? 'SMS amount and screenshot OCR matched the order total.'
          : 'Could not match the amount with our SMS records. Please retry.',
      });
    }, delay);
  });
}
