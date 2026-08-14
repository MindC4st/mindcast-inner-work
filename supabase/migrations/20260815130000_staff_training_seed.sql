-- Staff Training seed v1 — content derived from MC-TRN-001 (Live v1.0).
-- Synthetic/controlled-document content only; no personal data.
-- Module gates and pass marks mirror the canonical manual exactly.

do $$
declare
  m1 uuid; m2 uuid; m3 uuid; m4 uuid; m5 uuid;
  m6 uuid; m7 uuid; m8 uuid; m9 uuid; m10 uuid;
  l uuid;
  r record;
begin

-- ── Module 1 ─ What Mindcast is (before first session, acknowledgement)
insert into public.staff_training_modules
  (code, title, summary, position, gate, pass_mark, ack_required, version, effective_date, est_minutes)
values
  ('M01', 'What Mindcast is', 'Explain Mindcast simply, know the values, know the hard limits.', 1, 'before_first_session', null, true, 1, current_date, 10)
returning id into m1;

insert into public.staff_training_lessons (module_id, position, title, body) values
(m1, 1, 'Purpose, mission and values',
E'Mindcast exists to close the gap between knowing and doing.\n\nOur mission: to give every town a room where ordinary people become more themselves — together, every week, for as long as they want to keep coming.\n\nValues:\n- Community over content.\n- Draw out, do not preach.\n- Everyone can afford to belong.\n- Safe by design.\n- Honest about what we are.\n- No pressure, ever.');

insert into public.staff_training_lessons (module_id, position, title, body) values
(m1, 2, 'Hard limits',
E'Mindcast is a facilitated personal-development community. It is not therapy, medicine, a church or crisis care.\n\nWe will not position staff as gurus, healers or spiritual authorities; we will not provide therapy, counselling, diagnosis, medical advice or crisis intervention; we will not use retention pressure or make leaving socially costly; we will not sell, rent or trade member data; and we will never use member reflections to train third-party AI models.');

select id into l from public.staff_training_lessons where module_id = m1 and position = 2;

insert into public.staff_training_checkpoints (lesson_id, position, kind, prompt, options, correct, scoreable) values
(l, 1, 'freetext', 'In your own words, explain what Mindcast is — and what it is not.', '[]'::jsonb, null, false),
(l, 2, 'multi', 'Which of these are Mindcast values? Select all that apply.',
 '["Community over content", "Draw out, do not preach", "No pressure, ever", "Hustle harder at all costs"]'::jsonb,
 '[0,1,2]'::jsonb, true),
(l, 3, 'freetext', 'A member says they see you as their mentor and asks for ongoing private guidance. What does the Mindcast model say here?', '[]'::jsonb, null, false);

insert into public.staff_training_checkpoints (module_id, position, kind, prompt, policy_code, policy_version, scoreable)
values (m1, 4, 'acknowledge', 'I have read and understood the Mindcast Company Charter (MC-GOV-001 v1.0), including the hard limits on what Mindcast is and is not.', 'MC-GOV-001', '1.0', false);

-- ── Module 2 ─ The room and the weekly ritual (before first session)
insert into public.staff_training_modules
  (code, title, summary, position, gate, pass_mark, ack_required, version, effective_date, est_minutes)
values
  ('M02', 'The room and the weekly ritual', 'Know the weekly ritual end-to-end and what must be true before doors open.', 2, 'before_first_session', null, true, 1, current_date, 10)
returning id into m2;

insert into public.staff_training_lessons (module_id, position, title, body) values
(m2, 1, 'The weekly ritual',
E'The rhythm members experience: Arrive → NFC check-in → welcome wall → facilitated session → private reflection → Life Group invitation.\n\nBefore doors open: venue and hazard checks; first-aid and AED awareness; required checked adults in place; AV and Facilitator View ready; referral cards and a quiet space available; appropriate youth staffing; safety contacts identified.');

select id into l from public.staff_training_lessons where module_id = m2 and position = 1;

insert into public.staff_training_checkpoints (lesson_id, position, kind, prompt, options, correct, scoreable) values
(l, 1, 'order', 'Put the weekly ritual in the order members experience it.',
 '["Arrive", "NFC check-in", "Welcome wall", "Facilitated session", "Private reflection", "Life Group invitation"]'::jsonb, null, true),
(l, 2, 'checklist', 'Which of these belong to the before-doors-open checks? Select all that apply.',
 '["Venue and hazard checks", "First-aid and AED awareness", "Required checked adults in place", "AV and Facilitator View ready", "Referral cards and quiet space available", "Posting session photos to a personal account"]'::jsonb,
 '[0,1,2,3,4]'::jsonb, true),
(l, 3, 'single', 'Who decides whether a safeguarding concern is serious enough to act on?',
 '["The worker who noticed it", "The facilitator on the day", "Workers report; the safeguarding route decides — staff do not judge seriousness themselves", "It waits for the weekly team meeting"]'::jsonb,
 '[2]'::jsonb, true);

-- ── Module 3 ─ Boundaries and Code of Conduct (before member contact, 100%)
insert into public.staff_training_modules
  (code, title, summary, position, gate, pass_mark, ack_required, version, effective_date, est_minutes)
values
  ('M03', 'Boundaries and the Code of Conduct', 'The conduct lines that protect members and staff. 100% pass required.', 3, 'before_member_contact', 1.0, true, 1, current_date, 15)
returning id into m3;

insert into public.staff_training_lessons (module_id, position, title, body) values
(m3, 1, 'The conduct lines',
E'Confidentiality boundaries stay firm. We stay in facilitator scope.\n\nProhibited: romantic, sexual or member-financial relationships; private-channel relationships with young people; guru or following-building behaviour; recruiting members into another business, cause, church, MLM, political campaign or personal practice; using guilt, shame, urgency or social cost to force attendance, payment, sharing or belief.\n\nSafeguarding concerns are reported the same day.');

select id into l from public.staff_training_lessons where module_id = m3 and position = 1;

insert into public.staff_training_checkpoints (lesson_id, position, kind, prompt, options, correct, scoreable) values
(l, 1, 'multi', 'Which of these are outside the Code of Conduct? Select all that apply.',
 '["Inviting members into your personal business opportunity", "A private late-night messaging relationship with a teen member", "Using urgency or ''last chance'' language to drive payments", "Referring a struggling member to appropriate support services"]'::jsonb,
 '[0,1,2]'::jsonb, true),
(l, 2, 'single', 'A member is upset after a session and asks to talk privately that night. What is the right move?',
 '["Agree — caring means being available", "Keep support in the facilitated space, and point to the appropriate referral route if they are struggling", "Ask them to wait until next Sunday", "Discuss it in the group chat so everyone can help"]'::jsonb,
 '[1]'::jsonb, true),
(l, 3, 'multi', 'Which of these create pressure on members? Select all that apply.',
 '["Guilt or shame about missing a week", "Countdown timers on membership offers", "Making leaving feel socially costly", "Telling members the room misses them and there is no pressure to come"]'::jsonb,
 '[0,1,2]'::jsonb, true);

insert into public.staff_training_checkpoints (module_id, position, kind, prompt, policy_code, policy_version, scoreable)
values (m3, 4, 'acknowledge', 'I have read and agree to the Mindcast Code of Conduct (MC-HR-004), including the boundaries above.', 'MC-HR-004', '1.0', false);

-- ── Module 4 ─ Safeguarding children and young people (100%, annual)
insert into public.staff_training_modules
  (code, title, summary, position, gate, pass_mark, ack_required, version, effective_date, est_minutes)
values
  ('M04', 'Safeguarding children and young people', 'Child safety first; report, record, refer — never investigate. 100% pass, repeated annually.', 4, 'before_member_contact', 1.0, true, 1, current_date, 15)
returning id into m4;

insert into public.staff_training_lessons (module_id, position, title, body) values
(m4, 1, 'Report, record, refer',
E'A child''s safety comes before reputation, relationships or organisational discomfort.\n\nWorkers report concerns; they do not decide whether a concern is serious. Record what is seen and heard; investigation belongs to statutory authorities. Disclosure handling is calm, non-leading and factual. Immediate danger follows emergency escalation; other concerns go to the safeguarding route the same day.\n\nConcerns about a worker or founder follow an independent route — never forced through the person complained about.');

select id into l from public.staff_training_lessons where module_id = m4 and position = 1;

insert into public.staff_training_checkpoints (lesson_id, position, kind, prompt, options, correct, scoreable) values
(l, 1, 'single', 'A young person discloses something worrying. Your responsibilities are to:',
 '["Assess how serious it is before doing anything", "Stay calm, listen without leading, record the facts and report the same day via the safeguarding route", "Investigate quietly to protect the young person from a long process", "Wait to see if it comes up again"]'::jsonb,
 '[1]'::jsonb, true),
(l, 2, 'multi', 'Which statements match Mindcast''s safeguarding model? Select all that apply.',
 '["Child safety comes before reputation", "Staff report concerns; they do not decide seriousness", "Staff record and report; they do not investigate", "A concern about a worker goes through an independent route"]'::jsonb,
 '[0,1,2,3]'::jsonb, true),
(l, 3, 'freetext', 'In your own words: what do you do if a child makes a disclosure during a session?', '[]'::jsonb, null, false);

insert into public.staff_training_checkpoints (module_id, position, kind, prompt, policy_code, policy_version, scoreable)
values (m4, 4, 'acknowledge', 'I have read and understood the Safeguarding and Child Protection Policy (MC-SAF-001), including same-day reporting.', 'MC-SAF-001', '1.0', false);

-- ── Module 5 ─ Scope of practice and distress escalation (100%)
insert into public.staff_training_modules
  (code, title, summary, position, gate, pass_mark, ack_required, version, effective_date, est_minutes)
values
  ('M05', 'Scope of practice and distress escalation', 'Hold the room; never act as therapist, doctor or crisis worker. 100% pass.', 5, 'before_member_contact', 1.0, true, 1, current_date, 12)
returning id into m5;

insert into public.staff_training_lessons (module_id, position, title, body) values
(m5, 1, 'In scope / out of scope',
E'Facilitators hold the room, ask questions, keep time and create a safe thinking environment.\n\nIn scope: open questions, reflection, recognising struggle, silence, empathy and referral.\n\nOut of scope: interpretation, diagnosis, health, legal or financial advice, ongoing private support, trauma processing and medication advice.');

select id into l from public.staff_training_lessons where module_id = m5 and position = 1;

insert into public.staff_training_checkpoints (lesson_id, position, kind, prompt, options, correct, scoreable) values
(l, 1, 'multi', 'Which are in scope for a Mindcast facilitator? Select all that apply.',
 '["Open questions", "Recognising struggle and responding with empathy", "Referral to appropriate support", "Ongoing private counselling between sessions"]'::jsonb,
 '[0,1,2]'::jsonb, true),
(l, 2, 'multi', 'Which are out of scope? Select all that apply.',
 '["Diagnosis or interpretation", "Health, legal or financial advice", "Trauma processing", "Holding silence in the room"]'::jsonb,
 '[0,1,2]'::jsonb, true),
(l, 3, 'single', 'In the Mindcast role, staff never act as:',
 '["A timekeeper", "A therapist, counsellor, doctor or crisis worker", "A question-asker", "A host"]'::jsonb,
 '[1]'::jsonb, true);

-- ── Module 6 ─ Privacy and member confidentiality (100%)
insert into public.staff_training_modules
  (code, title, summary, position, gate, pass_mark, ack_required, version, effective_date, est_minutes)
values
  ('M06', 'Privacy and member confidentiality', 'Private journals stay private; least-required access always. 100% pass.', 6, 'before_member_contact', 1.0, true, 1, current_date, 12)
returning id into m6;

insert into public.staff_training_lessons (module_id, position, title, body) values
(m6, 1, 'The privacy boundary',
E'Facilitators cannot see private journals. If permissions ever reveal content you should not see, treat that as a security and privacy incident and report it immediately.\n\nOur promises: no selling, renting or trading personal information; private reflections stay private unless the member intentionally shares a specific item; no member reflections used to train third-party AI models.\n\nWorker rules: least-required access; no casual screenshots, exports or personal cloud storage; no member content in AI tools; careful bulk-email and recipient handling; confidentiality continues after exit.');

select id into l from public.staff_training_lessons where module_id = m6 and position = 1;

insert into public.staff_training_checkpoints (lesson_id, position, kind, prompt, options, correct, scoreable) values
(l, 1, 'single', 'Who can a facilitator read a member''s private journal from?',
 '["Any staff member", "Facilitators for their own track", "No one — facilitators cannot see private journals", "Admins on request"]'::jsonb,
 '[2]'::jsonb, true),
(l, 2, 'multi', 'Which are Mindcast privacy promises? Select all that apply.',
 '["No selling, renting or trading personal information", "Private reflections stay private unless the member shares a specific item", "No member reflections used to train third-party AI models", "Staff may export reflections for offline reading"]'::jsonb,
 '[0,1,2]'::jsonb, true),
(l, 3, 'freetext', 'You notice a screen in the admin area shows member reflections you do not need for your role. What do you do?', '[]'::jsonb, null, false);

-- ── Module 7 ─ Security and systems (Week 1, 80%)
insert into public.staff_training_modules
  (code, title, summary, position, gate, pass_mark, ack_required, version, effective_date, est_minutes)
values
  ('M07', 'Security and the systems', 'MFA, least privilege, secure devices, immediate incident reporting. 80% pass.', 7, 'week_1', 0.8, false, 1, current_date, 10)
returning id into m7;

insert into public.staff_training_lessons (module_id, position, title, body) values
(m7, 1, 'Security basics',
E'MFA on privileged accounts; individual logins; least privilege; a password manager; secure, updated devices; no member data on personal devices; incidents reported immediately.\n\nFor anyone building or configuring systems: row-level security on every personal-data table; role checks use the server-controlled role system, never user-editable profile fields; service-role keys never appear in client code, repositories or AI prompts; separate test and live payment keys; synthetic data only in development.');

select id into l from public.staff_training_lessons where module_id = m7 and position = 1;

insert into public.staff_training_checkpoints (lesson_id, position, kind, prompt, options, correct, scoreable) values
(l, 1, 'multi', 'Which are Mindcast security basics? Select all that apply.',
 '["MFA on privileged accounts", "Individual logins and least privilege", "A password manager", "Sharing one staff login between the door team", "Secure, updated devices"]'::jsonb,
 '[0,1,2,4]'::jsonb, true),
(l, 2, 'single', 'Where may a service-role key appear?',
 '["In the web app for admin features", "In server-side environment configuration only — never in client code, repositories or prompts", "In a shared team note", "In screenshots marked internal"]'::jsonb,
 '[1]'::jsonb, true),
(l, 3, 'multi', 'Which are approved uses of AI tools? Select all that apply.',
 '["Generic coding questions", "Copy editing that contains no personal data", "Paste a member reflection to summarise it", "Synthetic test data generation"]'::jsonb,
 '[0,1,3]'::jsonb, true);

-- ── Module 8 ─ Your employment (Month 1, acknowledgement)
insert into public.staff_training_modules
  (code, title, summary, position, gate, pass_mark, ack_required, version, effective_date, est_minutes)
values
  ('M08', 'Your employment', 'Your arrangement, expectations and where employment documents live.', 8, 'month_1', null, true, 1, current_date, 8)
returning id into m8;

insert into public.staff_training_lessons (module_id, position, title, body) values
(m8, 1, 'Your arrangement with Mindcast',
E'Your employment or engagement documents set out pay, hours, expectations and who to talk to with questions. Read them, and raise any question with the founder or your agreed contact — no pressure, ever.\n\nControlled employment documents require appropriate New Zealand professional review before production reliance; this module records your acknowledgement of the arrangement, not legal advice.');

insert into public.staff_training_checkpoints (module_id, position, kind, prompt, scoreable)
values (m8, 1, 'acknowledge', 'I have read my employment/engagement documents and understand who to raise questions with.', false);

-- ── Module 9 ─ Money, expenses and conflicts (Month 1, 80%)
insert into public.staff_training_modules
  (code, title, summary, position, gate, pass_mark, ack_required, version, effective_date, est_minutes)
values
  ('M09', 'Money, expenses and conflicts', 'Declare conflicts early; expenses are approved and receipted.', 9, 'month_1', 0.8, false, 1, current_date, 8)
returning id into m9;

insert into public.staff_training_lessons (module_id, position, title, body) values
(m9, 1, 'Conflicts, expenses and other ventures',
E'Declare conflicts of interest early — before they become a problem.\n\nRecruiting members into another business, cause or campaign is prohibited; if something feels like a conflict, raise it.\n\nExpenses require prior approval and a receipt; when in doubt, ask before spending.');

select id into l from public.staff_training_lessons where module_id = m9 and position = 1;

insert into public.staff_training_checkpoints (lesson_id, position, kind, prompt, options, correct, scoreable) values
(l, 1, 'single', 'A potential conflict of interest is best handled by:',
 '["Keeping it quiet unless asked", "Declaring it early, before it becomes a problem", "Resigning immediately", "Mentioning it at the annual review"]'::jsonb,
 '[1]'::jsonb, true),
(l, 2, 'single', 'An expense claim is valid when it is:',
 '["Approved beforehand and supported by a receipt", "Under $50", "For something the team enjoyed", "Submitted within a year"]'::jsonb,
 '[0]'::jsonb, true),
(l, 3, 'multi', 'Which must be declared or avoided? Select all that apply.',
 '["Recruiting members into your side business", "A family member supplying the venue at market rate, undeclared", "Inviting members to join a political campaign", "Asking before spending when unsure"]'::jsonb,
 '[0,1,2]'::jsonb, true);

-- ── Module 10 ─ Speaking up and getting help (Week 1, acknowledgement)
insert into public.staff_training_modules
  (code, title, summary, position, gate, pass_mark, ack_required, version, effective_date, est_minutes)
values
  ('M10', 'Speaking up and getting help', 'Every concern has a route — including an independent one.', 10, 'week_1', null, true, 1, current_date, 6)
returning id into m10;

insert into public.staff_training_lessons (module_id, position, title, body) values
(m10, 1, 'Routes for speaking up',
E'Raise questions and concerns early — with the founder or your agreed contact for everyday matters, the safeguarding route for child-safety concerns, and the incident route for security and privacy events.\n\nIf a concern involves the founder or a senior worker, use the independent route. You will never be required to raise a concern through the person it is about, and raising a concern in good faith will never be held against you.');

select id into l from public.staff_training_lessons where module_id = m10 and position = 1;

insert into public.staff_training_checkpoints (lesson_id, position, kind, prompt, options, correct, scoreable) values
(l, 1, 'single', 'You have a concern about the founder personally. You should:',
 '["Raise it with the founder first", "Use the independent route — you are never forced to go through the person complained about", "Wait for the annual review", "Discuss it with other facilitators"]'::jsonb,
 '[1]'::jsonb, true);

insert into public.staff_training_checkpoints (module_id, position, kind, prompt, scoreable)
values (m10, 2, 'acknowledge', 'I understand the routes for speaking up, including the independent route, and that raising a concern in good faith will never be held against me.', false);

-- ── Requirements: every module required for facilitators and admins ────────
for r in select id from (values (m1),(m2),(m3),(m4),(m5),(m6),(m7),(m8),(m9),(m10)) as t(id)
loop
  insert into public.staff_training_requirements (module_id, role, required)
  values (r.id, 'facilitator', true), (r.id, 'admin', true)
  on conflict (module_id, role) do nothing;
end loop;

-- ── Controlled documents register ──────────────────────────────────────────
insert into public.staff_documents (code, title, version, status, effective_date, summary, access) values
('MC-GOV-001', 'Company Charter', '1.0', 'live', current_date, 'Purpose, mission, values and hard limits.', 'staff'),
('MC-SAF-001', 'Safeguarding and Child Protection Policy', '1.0', 'live', current_date, 'Child safety first; same-day reporting; independent routes.', 'staff'),
('MC-SEC-001', 'Information Security Policy', '1.0', 'live', current_date, 'RLS, least privilege, secrets and synthetic-data rules.', 'staff'),
('MC-SEC-003', 'AI Use Policy', '1.0', 'live', current_date, 'Prohibited AI inputs and approved uses.', 'staff'),
('MC-HR-004', 'Code of Conduct', '1.0', 'live', current_date, 'Conduct lines that protect members and staff.', 'staff'),
('MC-TRN-001', 'Staff Training Manual', '1.0', 'live', current_date, 'Canonical training modules, gates and pass marks.', 'staff')
on conflict (code) do nothing;

end $$;
