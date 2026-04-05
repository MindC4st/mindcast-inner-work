import { LegalPage } from "@/components/legal/LegalPage";

export default function RefundPage() {
  return (
    <LegalPage title="Refund & Cancellation Policy" lastUpdated="April 2026">
      <p>
        This policy explains your options if you change your mind about a Mindcast purchase.
        Your rights under the New Zealand Consumer Guarantees Act 1993 and Fair Trading Act 1986
        are not limited by this policy.
      </p>

      <h2>1. Physical workbooks</h2>
      <p>
        Physical workbooks (A5 ring-binder, annual edition) are printed to order.
      </p>
      <ul>
        <li>
          <strong>Damaged or defective on arrival:</strong> Contact us within 14 days of
          receiving your workbook. We will replace it or provide a full refund including
          return postage.
        </li>
        <li>
          <strong>Change of mind:</strong> If your workbook is unused and in its original
          condition, contact us within 7 days of delivery. You may return it for a refund
          of the purchase price (postage costs not refunded).
        </li>
        <li>
          <strong>Used workbooks:</strong> We cannot accept returns of workbooks that have
          been written in.
        </li>
      </ul>

      <h2>2. Digital subscriptions</h2>
      <p>
        If Mindcast introduces paid digital subscriptions:
      </p>
      <ul>
        <li>
          <strong>Monthly subscriptions:</strong> Cancel anytime. Your access continues until
          the end of the current billing period. No partial refunds for unused days.
        </li>
        <li>
          <strong>Annual subscriptions:</strong> Cancel within 14 days of purchase for a full
          refund if you have not used the service. After 14 days, you may cancel but no refund
          will be issued for the remaining period.
        </li>
        <li>
          <strong>Service failure:</strong> If we are unable to provide the service you paid
          for (e.g. platform is unavailable for an extended period), we will provide a
          pro-rata refund for the affected period.
        </li>
      </ul>

      <h2>3. Session attendance</h2>
      <p>
        Where sessions have an attendance fee:
      </p>
      <ul>
        <li>Full refund if you cancel more than 48 hours before the session</li>
        <li>No refund for cancellations within 48 hours, but your ticket may be transferred to another person</li>
        <li>Full refund if Mindcast cancels or postpones the session</li>
      </ul>

      <h2>4. How to request a refund</h2>
      <p>
        Email <a href="mailto:hello@mindcast.co.nz">hello@mindcast.co.nz</a> with:
      </p>
      <ul>
        <li>Your name and order number or email address</li>
        <li>What you purchased and when</li>
        <li>The reason for your refund request</li>
        <li>A photo if the item is damaged</li>
      </ul>
      <p>
        We aim to respond within 3 business days. Approved refunds are processed within
        5–10 business days back to your original payment method.
      </p>

      <h2>5. Consumer Guarantees Act</h2>
      <p>
        Nothing in this policy overrides your rights under the Consumer Guarantees Act 1993.
        If a product or service fails to meet a consumer guarantee, you are entitled to a
        remedy regardless of this policy.
      </p>
    </LegalPage>
  );
}
