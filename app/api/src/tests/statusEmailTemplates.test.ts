import { describe, expect, it } from 'vitest';
import { getDefaultStatusEmailTemplate } from '../email/status-email.templates';

describe('default application status email templates', () => {
  it.each(['accepted', 'rejected', 'waitlisted', 'pending'])('provides a %s template', (status) => {
    const template = getDefaultStatusEmailTemplate(`application_${status}`);
    expect(template?.subject).toBeTruthy();
    expect(template?.bodyHtml).toContain('{{firstName}}');
  });
});
