# Worksheet surface matrix

This is the durable reference for deciding what belongs on the projected live
slide, in the digital journal, and on the one-page printed worksheet. It
replaces the accidental one-PDF-page-per-slide mapping.

The live sequence remains 8 slides for Adult and Teen and 9 for Child. The
printed worksheet is always one A4 page. The Child colouring page is a separate
print asset.

| Lesson content | Projected live slide | Digital journal | Printed A4 worksheet |
|---|---|---|---|
| Week, phase, track and theme | Yes | Yes | Yes - compact header |
| Welcome, callback and room check-in | Yes | Adult history where applicable | No |
| Inner wisdom and teaching copy | Yes | Readable in lesson history | No |
| Signal metaphor | Yes | Yes | Yes - short anchor only |
| Video / picture-book details | Yes | Yes | No |
| Video questions | Yes | Adult journal | No - the approved weekly reflection is used instead |
| Weekly reflection prompt | Yes | Adult journal | Yes - one prompt with ruled response space |
| Experiential exercise | Yes | Adult journal when typed | Yes - concise instruction plus an activity-aware response surface |
| Poll, scale or choice results | Yes | Saved session history | No results; paper provides only the response control |
| Intention and three weekly practices | Yes | Adult journal and history | Yes - compact three-column practice area |
| Closing affirmation | Yes | Lesson history | No |
| Child closing game title, equipment and instructions | Yes | No child digital journal | No - facilitator-led, not homework |
| Child colouring page | Separate activity/slide | No child digital journal | Separate approved A4 printout |
| Facilitator notes and safeguarding instructions | Facilitator view only | No | Never |

## Connected fields used by the printed sheet

The template structure never changes: header, Signal, Reflection, Activity,
Weekly Practice and footer. Only the lesson content and the response surface
change.

- Signal: `kids_signal_metaphor` for Child, otherwise `signal_metaphor`.
- Reflection: `journaling_prompt`, with track-safe fallbacks.
- Activity instruction: `workbook_activity`, then `experiential_exercise`.
- Activity surface: `activity_type`, `activity_options` and conservative text
  cues choose lined writing, blank drawing space, a T-chart, 1-10 scale,
  choices or a word-cloud surface.
- Practice: `practice_sun_today`, `practice_midweek`, `practice_fri` through the
  shared practice-cadence helper.

## Print rules

- One A4 portrait page per week and track.
- White paper; no coloured panel fills.
- One small Signal Blue transparent vector mark is the only colour artwork.
- No binder holes and no slide-divider tabs.
- Child colouring is generated and downloaded separately.
- Keep a minimum 50pt printable gutter and all text above the footer rule.

## Source notes

This matrix reconciles the compact worksheet established in commit `1146dbe`
with the current lesson fields and the explicit one-page decision made on
2026-08-22. `FRAMEWORK.md` remains the narrative session reference;
`mindcast_live_sessions` plus the timestamp-ordered `curriculum_weeks` migration
chain remain the content source of truth.
