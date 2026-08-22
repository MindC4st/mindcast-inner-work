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
        <li><strong>Adult journal entries and reflections</strong> — to give adult members a private digital record of their practice</li>
        <li><strong>Teen and child worksheets</strong> — these are paper-based; Mindcast does not provide digital journals for either track</li>
        <li><strong>Youth participation and safety information</strong> — annual guardian consent, emergency contacts, relevant medical, accessibility or behavioural information, and NFC permission where applicable</li>
        <li><strong>No-photo reference image</strong> — when a guardian declines promotional photography, a private current image helps authorised staff keep that child out of promotional images or mask them during image review</li>
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
        <li><strong>Adult digital journals are private</strong> — visible only to the adult member who wrote them. Facilitators and admins cannot read member journals. Teen and child tracks use printed worksheets and do not have digital journals.</li>
        <li><strong>Youth safety information is restricted</strong> — guardian consent, emergency and safe-participation details are available only to the guardian and authorised safeguarding staff who need them.</li>
        <li><strong>No-photo reference images are not promotional content</strong> — they are kept in private storage and used only to recognise a child whose guardian has declined promotional photography.</li>
        <li><strong>We do not sell your information</strong>, and we do not use member reflections to train third-party AI models.</li>
        <li>We share with service providers only as needed to run Mindcast — for example Supabase (hosting and database), Stripe (payments), and email/notification providers — each under their own privacy terms.</li>
        <li>We disclose to authorities only where legally required, or to prevent serious harm.</li>
      </ul>

      <h2>4. On-screen sharing is opt-in and moderated</h2>
      <p>
        Adult interactive submissions do not appear on the big screen unless the member chooses
        to share them, and shared free text is moderated before display. Teen accounts are
        read-only and children do not submit through the platform. Shared adult submissions are
        saved with the live session and may also appear in member lesson history. They can be
        anonymous. To withdraw a saved shared response from community display and history, use
        the privacy contact below; a self-service control is being added.
      </p>

      <h2>5. Children &amp; young people</h2>
      <p>
        Teen members aged 13–17 have their own email and login, created with recorded parent or
        guardian consent. Their account is read-only: it provides teen session history, teen
        worksheet downloads and NFC check-in access where separately consented, but no digital
        journal or submission tools. Children under 13 are added through a parent or guardian's
        household and do not hold their own account. Both teen and child tracks use paper
        worksheets. Guardians complete an annual online participation form for every linked
        young person before check-in, including emergency details and separate photography and
        NFC choices.
      </p>

      <h2>6. Storage &amp; security</h2>
      <p>
        Data is stored in Supabase with database-level access controls (row-level security):
        members can only reach data allowed for their account and track, adult journals are
        protected in the database, and youth consent records and no-photo reference images have
        additional guardian and safeguarding access restrictions. Payment data is held by Stripe
        (PCI-compliant), not by us. We take reasonable steps to keep information safe; no
        system is 100% secure.
      </p>

      <h2>7. Your rights</h2>
      <p>Under the Privacy Act 2020 you may:</p>
      <ul>
        <li><strong>Access</strong> the information we hold about you</li>
        <li><strong>Correct</strong> it if it's wrong</li>
        <li><strong>Delete</strong> your account and data — available in the app and on request</li>
        <li><strong>Withdraw or change</strong> youth participation, NFC and photography choices in Family &amp; Safety, and ask us to remove a shared response from community history</li>
      </ul>
      <p>
        Email <a href="mailto:privacy@mindcast.co.nz">privacy@mindcast.co.nz</a> to exercise
        these rights. We respond within 20 working days.
      </p>

      <h2>8. Retention</h2>
      <p>
        We keep your information while it is needed for membership, safeguarding and legal or
        accounting purposes, then delete or anonymise it. Youth consent is renewed annually;
        no-photo reference images are replaced or deleted when they are no longer required for
        that safeguarding purpose. If we become aware of a
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
