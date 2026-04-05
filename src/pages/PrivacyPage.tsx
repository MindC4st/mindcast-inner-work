import { LegalPage } from "@/components/legal/LegalPage";

export default function PrivacyPage() {
  return (
    <LegalPage title="Privacy Policy" lastUpdated="April 2026">
      <p>
        This Privacy Policy explains how Mindcast Inner Work ("Mindcast", "we", "us") collects,
        uses, stores, and protects your personal information. We are committed to complying with
        the New Zealand <strong>Privacy Act 2020</strong> and its 13 Information Privacy Principles.
      </p>

      <h2>1. What personal information we collect</h2>

      <h3>Account information</h3>
      <ul>
        <li>Email address (required to create an account)</li>
        <li>Display name / first name (used on session screens)</li>
        <li>Age group (Adult / Teen / Child — for programme matching)</li>
        <li>Goal-sharing preferences</li>
      </ul>

      <h3>Session and workbook data</h3>
      <ul>
        <li>Weekly workbook entries (arriving word, reflections, goals, leaving word)</li>
        <li>Check-in records (date, session, display name, welcome note)</li>
        <li>Goal updates and progress notes</li>
        <li>Words submitted to the group word cloud</li>
        <li>Success stories submitted for group display (moderated before showing)</li>
      </ul>

      <h3>Device and technical data</h3>
      <ul>
        <li>NFC bracelet ID (if you use an NFC bracelet — links to your display name only)</li>
        <li>Standard web logs (IP address, browser type, pages visited)</li>
      </ul>

      <p>
        We do not collect sensitive information (health data, ethnicity, religion, political views)
        unless you voluntarily include it in a workbook entry.
      </p>

      <h2>2. Why we collect your information</h2>
      <p>We collect personal information to:</p>
      <ul>
        <li>Operate your Mindcast account and personalise your session experience</li>
        <li>Display your name and welcome note on the session welcome wall (if you opt in)</li>
        <li>Show your goal updates on the goal wall (only if you explicitly choose to share)</li>
        <li>Generate AI workbook questions relevant to each session's video content</li>
        <li>Process payments for physical workbooks or subscriptions</li>
        <li>Communicate with you about sessions, updates, and your account</li>
        <li>Maintain the safety and integrity of the community</li>
      </ul>
      <p>
        We will not use your personal information for any purpose other than those listed above
        without your consent.
      </p>

      <h2>3. Children's privacy</h2>
      <p>
        We take the privacy of children and young people seriously.
      </p>
      <ul>
        <li>
          <strong>Under 13:</strong> Children under 13 do not create Mindcast accounts.
          Any session data relating to under-13s is managed through a parent or guardian's
          account, and only with that adult's explicit consent.
        </li>
        <li>
          <strong>Ages 13–15:</strong> Account creation requires prior written consent from a
          parent or legal guardian. We collect only the minimum information necessary for
          participation.
        </li>
        <li>
          <strong>Ages 16–17:</strong> May register independently. We recommend parents
          discuss Mindcast with their teenager.
        </li>
      </ul>
      <p>
        Workbook entries for participants under 18 are private by default. They are never
        shared publicly without explicit consent.
      </p>
      <p>
        Parents or guardians may request access to, correction of, or deletion of their
        child's data at any time by contacting us at <a href="mailto:privacy@mindcast.co.nz">privacy@mindcast.co.nz</a>.
      </p>

      <h2>4. Sharing your information</h2>
      <p>We do not sell your personal information. We share it only:</p>
      <ul>
        <li>
          <strong>With service providers</strong> who help us operate Mindcast (database,
          authentication, payments, AI question generation). These providers operate under
          their own privacy policies and comply with applicable data protection laws.
        </li>
        <li>
          <strong>If required by law</strong> — for example, in response to a court order,
          or where we have reasonable grounds to believe disclosure is necessary to prevent
          serious harm to a person.
        </li>
        <li>
          <strong>With your consent</strong> — for example, if you choose to share a goal
          update with the group at check-in.
        </li>
      </ul>

      <h2>5. Your rights under the Privacy Act 2020</h2>
      <p>You have the right to:</p>
      <ul>
        <li><strong>Access</strong> the personal information we hold about you</li>
        <li><strong>Correct</strong> any information that is inaccurate or out of date</li>
        <li><strong>Delete</strong> your account and associated data (some data may be retained for legal purposes)</li>
        <li><strong>Know</strong> how your information is being used</li>
        <li><strong>Complain</strong> to the Privacy Commissioner if you believe your privacy rights have been breached</li>
      </ul>
      <p>
        To exercise these rights, email us at <a href="mailto:privacy@mindcast.co.nz">privacy@mindcast.co.nz</a>.
        We will respond within 20 working days, as required by the Privacy Act 2020.
      </p>

      <h2>6. Data security</h2>
      <p>
        We use industry-standard security measures including encrypted connections (HTTPS),
        secure authentication, and access controls. Your workbook entries are private to you
        by default and are not visible to other members.
      </p>
      <p>
        If we become aware of a privacy breach that poses a risk of serious harm, we will notify
        the Privacy Commissioner and affected individuals as required by the Privacy Act 2020.
      </p>

      <h2>7. How long we keep your data</h2>
      <ul>
        <li>Active account data: held while your account is active</li>
        <li>Workbook entries: held indefinitely unless you delete your account (your 52-week journey is part of the product value)</li>
        <li>Check-in records: held for 2 years then anonymised</li>
        <li>Payment records: held for 7 years as required by NZ tax law</li>
        <li>Deleted accounts: personal information removed within 30 days; anonymised session statistics may be retained</li>
      </ul>

      <h2>8. Cookies and tracking</h2>
      <p>
        Mindcast uses session cookies for authentication only. We do not use advertising
        trackers or share data with advertising networks.
      </p>

      <h2>9. Changes to this policy</h2>
      <p>
        We may update this policy to reflect changes in our practices or the law. Material
        changes will be communicated to registered members by email.
      </p>

      <h2>10. Contact and complaints</h2>
      <p>
        Privacy enquiries: <a href="mailto:privacy@mindcast.co.nz">privacy@mindcast.co.nz</a>
      </p>
      <p>
        If you are not satisfied with our response, you may contact the Office of the New Zealand
        Privacy Commissioner: <a href="https://www.privacy.org.nz" target="_blank" rel="noopener noreferrer">www.privacy.org.nz</a> | 0800 803 909
      </p>
    </LegalPage>
  );
}
