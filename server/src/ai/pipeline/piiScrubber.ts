/**
 * Privacy & Security Pipeline: PII Scrubber
 * Automatically masks personally identifiable information (emails, phone numbers,
 * credit cards, social IDs, and IP addresses) before data reaches LLM APIs.
 */

const EMAIL_REGEX = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g;
const PHONE_REGEX = /\b(?:\+?(\d{1,3}))?[-. (]*(\d{3})[-. )]*(\d{3})[-. ]*(\d{4})\b/g;
const SSN_REGEX = /\b\d{3}-\d{2}-\d{4}\b/g;
const CREDIT_CARD_REGEX = /\b(?:\d{4}[ -]?){3}\d{4}\b/g;
const IP_ADDRESS_REGEX = /\b\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\b/g;

export class PiiScrubber {
  /**
   * Cleans an arbitrary string by replacing PII patterns with anonymized placeholders.
   */
  public static scrubText(text: string): string {
    if (!text || typeof text !== 'string') {
      return '';
    }

    return text
      .replace(EMAIL_REGEX, '[ANONYMIZED_EMAIL]')
      .replace(PHONE_REGEX, '[ANONYMIZED_PHONE]')
      .replace(CREDIT_CARD_REGEX, '[ANONYMIZED_CARD]')
      .replace(SSN_REGEX, '[ANONYMIZED_ID]')
      .replace(IP_ADDRESS_REGEX, '[ANONYMIZED_IP]');
  }

  /**
   * Recursively traverses and sanitizes nested data structures (objects, arrays, strings).
   */
  public static scrubData<T>(input: T): T {
    if (input === null || input === undefined) {
      return input;
    }

    if (typeof input === 'string') {
      return this.scrubText(input) as unknown as T;
    }

    if (Array.isArray(input)) {
      return input.map((item) => this.scrubData(item)) as unknown as T;
    }

    if (typeof input === 'object') {
      const sanitized: Record<string, unknown> = {};
      for (const [key, val] of Object.entries(input)) {
        // Redact respondent email and hash explicitly
        if (['respondentEmail', 'email', 'ip', 'clientIp', 'respondentHash'].includes(key)) {
          sanitized[key] = '[REDACTED_IDENTITY]';
        } else {
          sanitized[key] = this.scrubData(val);
        }
      }
      return sanitized as T;
    }

    return input;
  }
}

export default PiiScrubber;
