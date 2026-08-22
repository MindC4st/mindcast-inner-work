/**
 * Generate and upload every Mindcast workbook using the same renderer as the
 * member portal and Facilitate Live download button.
 *
 * Usage:
 *   npm run worksheets:batch
 *
 * Required:
 *   SUPABASE_SERVICE_ROLE_KEY
 * Optional:
 *   SUPABASE_URL (defaults to the Mindcast project)
 */
import { createClient } from "@supabase/supabase-js";
import { generateWorksheetPdf } from "../src/lib/generateWorksheetPdf";

const supabaseUrl = process.env.SUPABASE_URL || "https://pjyelgogdsuiugaudecc.supabase.co";
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

if (!serviceKey) {
  console.error("SUPABASE_SERVICE_ROLE_KEY must be set.");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceKey);

async function main() {
  console.log("Mindcast workbook batch generator");

  const [{ data: sessions, error: sessionError }, { data: curriculum, error: curriculumError }] = await Promise.all([
    supabase.from("mindcast_live_sessions").select("*").order("week_number", { ascending: true }),
    supabase
      .from("curriculum_weeks")
      .select("week_number, opening_question, kids_signal_metaphor, kids_picture_book, kids_picture_book_author, kids_picture_book_question, kids_colouring_prompt, kids_game, kids_game_equipment, kids_game_under5"),
  ]);

  if (sessionError) throw sessionError;
  if (curriculumError) throw curriculumError;
  if (!sessions?.length) throw new Error("No mindcast_live_sessions rows found.");

  const curriculumByWeek = new Map((curriculum || []).map((row) => [row.week_number, row]));
  let success = 0;
  let failed = 0;

  for (const row of sessions) {
    const session = { ...curriculumByWeek.get(row.week_number), ...row };
    const track = (session.audience || "Adult").toLowerCase();
    const filename = `week-${String(session.week_number).padStart(2, "0")}-${track}-workbook.pdf`;
    const storagePath = `worksheet-pdfs/${filename}`;

    try {
      const pdfBuffer = Buffer.from(generateWorksheetPdf(session).output("arraybuffer"));
      const { error: uploadError } = await supabase.storage
        .from("worksheets")
        .upload(storagePath, pdfBuffer, { contentType: "application/pdf", upsert: true });
      if (uploadError) throw uploadError;

      const publicUrl = supabase.storage.from("worksheets").getPublicUrl(storagePath).data.publicUrl;
      const { error: updateError } = await supabase.from("worksheets").upsert({
        week_number: session.week_number,
        audience_type: session.audience,
        worksheet_pdf_url: publicUrl,
      }, { onConflict: "week_number,audience_type" });
      if (updateError) throw updateError;

      console.log(`OK W${String(session.week_number).padStart(2, "0")} ${session.audience} - ${filename}`);
      success++;
    } catch (error) {
      console.error(`FAILED W${session.week_number} ${session.audience}:`, error instanceof Error ? error.message : error);
      failed++;
    }
  }

  console.log(`Done. ${success} workbooks generated; ${failed} failed.`);
  if (failed) process.exitCode = 1;
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
