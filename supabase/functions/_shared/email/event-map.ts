// event-map.ts — maps notification_outbox events to email templates.
// Transactional flag lives on each template. Only non-transactional emails
// carry an unsubscribe link and are suppressed by marketing_opt_out.

import type { EmailTemplate } from "./layout.ts";
import welcome from "./templates/welcome.ts";
import sessionReminder from "./templates/session-reminder.ts";
import absenceNoticed from "./templates/absence-noticed.ts";
import resetPassword from "./templates/reset-password.ts";
import trialPass from "./templates/trial-pass.ts";
import trialFollowup from "./templates/trial-followup.ts";
import membershipStarted from "./templates/membership-started.ts";
import seatInvite from "./templates/seat-invite.ts";
import practiceReminder from "./templates/practice-reminder.ts";
import lifegroupAssigned from "./templates/lifegroup-assigned.ts";
import membershipCancelled from "./templates/membership-cancelled.ts";
import paymentFailed from "./templates/payment-failed.ts";
import shopOrder from "./templates/shop-order.ts";

// The payload is jsonb (Record<string, unknown>) at runtime. A template's typed
// P is documentation, not a runtime check — erase it so the map is homogeneous.
function erase<P>(t: EmailTemplate<P>): EmailTemplate<Record<string, unknown>> {
  return t as unknown as EmailTemplate<Record<string, unknown>>;
}

export const EVENT_MAP: Record<string, EmailTemplate<Record<string, unknown>>> = {
  "auth.password_reset": erase(resetPassword),
  "account.created": erase(welcome),
  "trial.ticket_issued": erase(trialPass),
  "trial.followup": erase(trialFollowup),
  "membership.started": erase(membershipStarted),
  "seat.invited": erase(seatInvite),
  "session.weekly_reminder": erase(sessionReminder),
  "practice.midweek": erase(practiceReminder),
  "lifegroup.assigned": erase(lifegroupAssigned),
  "attendance.absent_two_weeks": erase(absenceNoticed),
  "membership.cancelled": erase(membershipCancelled),
  "invoice.payment_failed": erase(paymentFailed),
  "shop.order_confirmed": erase(shopOrder),
};

