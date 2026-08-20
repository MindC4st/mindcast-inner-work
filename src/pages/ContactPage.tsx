import { LegalPage } from "@/components/legal/LegalPage";

export default function ContactPage() {
  return (
    <LegalPage title="Contact" lastUpdated="August 2026">
      <p>
        We're a small team in Taupō. Email is the best way to reach us — we read everything
        and reply within 2 business days.
      </p>

      <h2>General enquiries</h2>
      <p>
        <a href="mailto:hello@mindcast.co.nz">hello@mindcast.co.nz</a>
      </p>

      <h2>Membership & billing</h2>
      <p>
        <a href="mailto:hello@mindcast.co.nz">hello@mindcast.co.nz</a>
      </p>

      <h2>Safeguarding concerns</h2>
      <p>
        <a href="mailto:safeguarding@mindcast.co.nz">safeguarding@mindcast.co.nz</a>
      </p>

      <h2>Privacy requests</h2>
      <p>
        <a href="mailto:privacy@mindcast.co.nz">privacy@mindcast.co.nz</a>
      </p>

      <h2>Press & partnerships</h2>
      <p>
        <a href="mailto:press@mindcast.co.nz">press@mindcast.co.nz</a>
      </p>

      <h2>Postal address</h2>
      <p>
        Mindcast Limited<br />
        PO Box 1234<br />
        Taupō 3351<br />
        New Zealand
      </p>

      <h2>Where we gather</h2>
      <p>
        Acacia Bay Community Centre<br />
        Wakeman Road, Acacia Bay<br />
        Taupō 3378<br />
        <br />
        Beside the tennis courts at Beasley Park. Lake and Mount Tauhara views.
      </p>

      <h2>Response times</h2>
      <ul>
        <li>General & membership: within 2 business days</li>
        <li>Safeguarding: within 24 hours</li>
        <li>Privacy requests: within 20 working days (Privacy Act 2020)</li>
      </ul>

      <h2>Before you email</h2>
      <ul>
        <li>Membership questions: check the <a href="/membership">Membership</a> page first</li>
        <li>Refund requests: see our <a href="/refund">Refund & Cancellation Policy</a></li>
        <li>Technical issues: include your browser, device, and a screenshot if possible</li>
      </ul>
    </LegalPage>
  );
}