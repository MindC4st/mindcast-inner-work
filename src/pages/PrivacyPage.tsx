import { LegalPage } from "@/components/legal/LegalPage";

export default function PrivacyPage() {
  return (
    <LegalPage title="Privacy Policy" lastUpdated="August 2026">
      <p>
        This Privacy Policy explains how Mindcast Limited ("Mindcast", "we", "us") collects,
        uses, stores and protects your personal information, in line with the New Zealand
        Privacy Act 2020 and its Information Privacy Principles.
      </p>

      <h2>1. Who we are</h2>
      <p>
        <strong>Mindcast Limited</strong>, based in Taupō, Aotearoa New Zealand, is the agency
        responsible for the personal information you provide. Privacy enquiries:{" "}
        <a href="mailto:privacy@mindcast.co.nz">privacy@mindcast.co.nz</a>.
      </p>

      <h2>2. What we collect and why</h2>
      <p>We collect only what we need, directly from you wherever possible:</p>
      <ul>
        <li><strong>Name, email and (optional) age group</strong> — to create your account, run your membership and communicate with you</li>
        <li><strong>Household / guardian links</strong> — so a parent can manage a child's or teen's participation</li>
        <li><strong>Journal entries and reflections</strong> — to give you a private record of your practice</li>
        <li><strong>Attendance / check-ins</strong> — to run sessions and (optionally) show your name on the welcome wall</li>
        <li><strong>On-screen submissions</strong> — live participation, moderated and opt-in; can be anonymous</li>
        <li><strong>Membership status and tier</strong> — to provide the right access</li>
        <li><strong>NFC bracelet ID</strong> — if you use one, to link your bracelet to your check-in</li>
        <li><strong>Payment details</strong> — handled by Stripe; we do not store card numbers</li>
        <li><strong>Basic technical logs</strong> — to keep the app working</li>
      </ul>

      <h2>3. How we use and share your information</h2>
      <ul>
        <li>We use your information only for the purposes above.</li>
        <li><strong>Your journal is private</strong> — visible only to you and (for a linked child or teen) to that child's guardian. Facilitators and admins cannot read member journals.</li>
        <li><strong>We do not sell your information</strong>, and we do not use member reflections to train third-party AI models.</li>
        <li>We share with service providers only as needed to run Mindcast — for example Supabase (hosting and database), Stripe (payments), and email/notification providers — each under their own privacy terms.</li>
        <li>We disclose to authorities only where legally required, or to prevent serious harm.</li>
      </ul>

      <h2>4. On-screen sharing is opt-in and moderated</h2>
      <p>
        Nothing you submit appears on the big screen unless you choose to share it, and a
        moderator approves it first. You can share anonymously and withdraw at any time.
      </p>

      <h2>5. Children &amp; young people</h2>
      <p>
        Children do not have their own logins — a paying adult accesses children's content on
        their behalf, and we do not collect information directly from children. Teen accounts
        are set up with guardian involvement. We take extra care with any information relating
        to under-18s.
      </p>

      <h2>6. Storage &amp; security</h2>
      <p>
        Data is stored in Supabase with database-level access controls (row-level security):
        members can only reach their own data, and paid content and journals are protected in
        the database, not just hidden in the app. Payment data is held by Stripe
        (PCI-compliant), not by us. We take reasonable steps to keep information safe; no
        system is 100% secure.
      </p>

      <h2>7. Your rights</h2>
      <p>Under the Privacy Act 2020 you may:</p>
      <ul>
        <li><strong>Access</strong> the information we hold about you</li>
        <li><strong>Correct</strong> it if it's wrong</li>
        <li><strong>Delete</strong> your account and data — available in the app and on request</li>
        <li><strong>Withdraw</strong> from on-screen sharing or communications at any time</li>
      </ul>
      <p>
        Email <a href="mailto:privacy@mindcast.co.nz">privacy@mindcast.co.nz</a> to exercise
        these rights. We respond within 20 working days.
      </p>

      <h2>8. Retention</h2>
      <p>
        We keep your information while you're a member and for a reasonable period afterwards
        for legal and accounting reasons, then delete or anonymise it. If we become aware of a
        privacy breach that may cause serious harm, we follow our breach response plan and
        notify the Privacy Commissioner and affected individuals as required.
      </p>

      <h2>9. Changes &amp; complaints</h2>
      <p>
        We'll post changes here and notify members of material ones. If you have an unresolved
        concern, you may contact the Office of the New Zealand Privacy Commissioner:{" "}
        <a href="https://www.privacy.org.nz" target="_blank" rel="noopener noreferrer">www.privacy.org.nz</a>{" "}
        | 0800 803 909.
      </p>
    </LegalPage>
  );
}
