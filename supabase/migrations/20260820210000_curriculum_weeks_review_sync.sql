-- Curriculum-weeks portal mirror sync for the weeks 1-31 curriculum review.
-- Companion to migrations 20260820120000..20260820200000 (the review itself).
--
-- curriculum_weeks mirrors a subset of each week's adult lesson for the
-- portal / coursebook (reflective_question mirrors the adult journaling
-- prompt; interactive_activity mirrors the adult experiential exercise).
-- Where the review REPLACED those fields outright, the mirror must follow.
-- (Verbatim prepends — the week 16 forgiveness opt-out and the week 24 fear
-- carve-out — are session-delivery content and intentionally stay in
-- mindcast_live_sessions only.)

-- Week 19: THE PEOPLE-PLEASING AUDIT replaced by MAKE THE INVISIBLE VISIBLE
UPDATE public.curriculum_weeks
SET interactive_activity = $wksync$MAKE THE INVISIBLE VISIBLE. Two columns. VISIBLE: the tasks anyone could see you doing — the dishes, the drop-offs, the bills, the reports. INVISIBLE: the remembering, the anticipating, the planning, the checking whether someone else is okay, the following up, the holding of the whole picture in your head so nothing gets dropped. Be specific — "admin" is not an entry. For each item on the invisible list, mark it: C — I chose this and I'd choose it again. D — This just defaulted to me and nobody decided anything. F — I do this because I'm afraid of what happens if I don't. Then one question, in writing, for yourself: what surprised you on your own list? Share only that — what surprised you. Not the list, not the totals, and not anybody else's share of it.$wksync$,
    updated_at = now()
WHERE week_number = 19;

-- Week 26: RELEASE CEREMONY renamed PHASE 2 STOCKTAKE (standing rule 3)
UPDATE public.curriculum_weeks
SET interactive_activity = $wksync$PHASE 2 STOCKTAKE. Write, for yourself, four things: what I arrived at Phase 2 still carrying; what I've actually set down, if anything; what I tried to set down and picked straight back up; what I'm taking into Phase 3 on purpose. If you'd like to read one line of it aloud, you can. Nobody has to, nobody is going in order, and there's no going round the circle.$wksync$,
    updated_at = now()
WHERE week_number = 26;

-- Week 27: journaling prompt revised (no write-it-as-already-true)
UPDATE public.curriculum_weeks
SET reflective_question = $wksync$Write a short description of the person you're building — the values, the qualities, the direction. Write it as a description of the target, not a claim about the present. "I'm someone who wants to be steadier under pressure" is honest. "I am completely calm" is a wish wearing a fact's clothes, and you'll know it's not true every time you read it.$wksync$,
    updated_at = now()
WHERE week_number = 27;

-- Week 31: journaling prompt de-manifested ('attract into your life' removed)
UPDATE public.curriculum_weeks
SET reflective_question = $wksync$Write about the community you're building — the relationships already here that you want to invest more in, and the kind of people you want to seek out and become useful to as you grow.$wksync$,
    updated_at = now()
WHERE week_number = 31;
