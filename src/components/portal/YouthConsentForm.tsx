import { useEffect, useMemo, useState, type ChangeEvent, type ReactNode } from "react";
import { CameraOff, Check, FileImage, Loader2, ShieldCheck } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";
import { toast } from "@/hooks/use-toast";
import {
  YOUTH_CONSENT_NOTICE_VERSION,
  YOUTH_REFERENCE_PHOTO_MAX_BYTES,
  YOUTH_REFERENCE_PHOTO_TYPES,
  currentProgrammeYear,
  isYouthConsentCurrent,
  validateYouthConsentDraft,
  youthConsentExpiresAt,
} from "@/lib/youthConsent";

export type YouthConsentRow = Database["public"]["Tables"]["youth_participation_consents"]["Row"];

type Youth = {
  profile_id: string;
  display_name: string;
  role_in_household: string;
};

type Props = {
  youth: Youth;
  guardianProfileId: string;
  guardianName: string;
  consent: YouthConsentRow | null;
  onSaved: () => void;
};

const inputClass = "mt-1.5 w-full rounded-sm border border-border bg-background px-3 py-2.5 text-sm font-body text-foreground placeholder:text-muted-foreground/50 focus:border-primary focus:outline-none";

const YouthConsentForm = ({ youth, guardianProfileId, guardianName, consent, onSaved }: Props) => {
  const programmeYear = currentProgrammeYear();
  const current = isYouthConsentCurrent(consent);
  const [open, setOpen] = useState(!current);
  const [saving, setSaving] = useState(false);
  const [referencePhoto, setReferencePhoto] = useState<File | null>(null);
  const [form, setForm] = useState({
    guardianName: consent?.guardian_name || guardianName || "",
    guardianRelationship: consent?.guardian_relationship || "",
    emergencyContactName: consent?.emergency_contact_name || guardianName || "",
    emergencyContactRelationship: consent?.emergency_contact_relationship || "",
    emergencyContactPhone: consent?.emergency_contact_phone || "",
    safeParticipationNotes: consent?.safe_participation_notes || "",
    attendanceConsent: consent?.attendance_consent || false,
    operationalDataConsent: consent?.operational_data_consent || false,
    nfcBraceletConsent: consent?.nfc_bracelet_consent || false,
    promotionalPhotoConsent: consent?.promotional_photo_consent || false,
  });

  useEffect(() => {
    setForm({
      guardianName: consent?.guardian_name || guardianName || "",
      guardianRelationship: consent?.guardian_relationship || "",
      emergencyContactName: consent?.emergency_contact_name || guardianName || "",
      emergencyContactRelationship: consent?.emergency_contact_relationship || "",
      emergencyContactPhone: consent?.emergency_contact_phone || "",
      safeParticipationNotes: consent?.safe_participation_notes || "",
      attendanceConsent: consent?.attendance_consent || false,
      operationalDataConsent: consent?.operational_data_consent || false,
      nfcBraceletConsent: consent?.nfc_bracelet_consent || false,
      promotionalPhotoConsent: consent?.promotional_photo_consent || false,
    });
    setReferencePhoto(null);
    setOpen(!isYouthConsentCurrent(consent));
  }, [consent, guardianName]);

  const statusText = useMemo(() => {
    if (!current) return `Consent required for ${programmeYear}`;
    return `Current for ${programmeYear} · renew at the start of ${programmeYear + 1}`;
  }, [current, programmeYear]);

  const update = <K extends keyof typeof form>(key: K, value: (typeof form)[K]) =>
    setForm((state) => ({ ...state, [key]: value }));

  const choosePhoto = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null;
    if (!file) return;
    if (!(YOUTH_REFERENCE_PHOTO_TYPES as readonly string[]).includes(file.type)) {
      toast({ title: "Use a JPG, PNG or WebP image", variant: "destructive" });
      event.target.value = "";
      return;
    }
    if (file.size > YOUTH_REFERENCE_PHOTO_MAX_BYTES) {
      toast({ title: "Photo is too large", description: "Choose an image smaller than 5 MB.", variant: "destructive" });
      event.target.value = "";
      return;
    }
    setReferencePhoto(file);
  };

  const save = async () => {
    const validation = validateYouthConsentDraft({
      ...form,
      hasReferencePhoto: Boolean(referencePhoto || consent?.photo_reference_path),
    });
    if (validation) {
      toast({ title: "Consent form incomplete", description: validation, variant: "destructive" });
      return;
    }

    setSaving(true);
    let nextPath = consent?.photo_reference_path ?? null;
    let uploadedPath: string | null = null;
    try {
      if (!form.promotionalPhotoConsent && referencePhoto) {
        const extension = referencePhoto.type === "image/png" ? "png" : referencePhoto.type === "image/webp" ? "webp" : "jpg";
        uploadedPath = `${youth.profile_id}/${programmeYear}/${crypto.randomUUID()}.${extension}`;
        const { error: uploadError } = await supabase.storage
          .from("youth-photo-references")
          .upload(uploadedPath, referencePhoto, { contentType: referencePhoto.type, upsert: false });
        if (uploadError) throw uploadError;
        nextPath = uploadedPath;
      }

      const { error } = await supabase.from("youth_participation_consents").upsert({
        subject_profile_id: youth.profile_id,
        guardian_profile_id: guardianProfileId,
        programme_year: programmeYear,
        guardian_name: form.guardianName.trim(),
        guardian_relationship: form.guardianRelationship.trim(),
        emergency_contact_name: form.emergencyContactName.trim(),
        emergency_contact_relationship: form.emergencyContactRelationship.trim(),
        emergency_contact_phone: form.emergencyContactPhone.trim(),
        safe_participation_notes: form.safeParticipationNotes.trim(),
        attendance_consent: form.attendanceConsent,
        operational_data_consent: form.operationalDataConsent,
        nfc_bracelet_consent: form.nfcBraceletConsent,
        promotional_photo_consent: form.promotionalPhotoConsent,
        photo_reference_path: form.promotionalPhotoConsent ? null : nextPath,
        privacy_notice_version: YOUTH_CONSENT_NOTICE_VERSION,
        consented_at: new Date().toISOString(),
        expires_at: youthConsentExpiresAt(programmeYear),
        revoked_at: null,
      }, { onConflict: "subject_profile_id,programme_year" });
      if (error) throw error;

      const oldPath = consent?.photo_reference_path;
      if (oldPath && oldPath !== nextPath && (form.promotionalPhotoConsent || uploadedPath)) {
        await supabase.storage.from("youth-photo-references").remove([oldPath]);
      }

      toast({ title: `${youth.display_name}'s consent is recorded`, description: `Current for the ${programmeYear} programme year.` });
      setOpen(false);
      onSaved();
    } catch (error: unknown) {
      if (uploadedPath) await supabase.storage.from("youth-photo-references").remove([uploadedPath]);
      toast({
        title: "Couldn't save the consent form",
        description: error instanceof Error ? error.message : "Please try again.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const withdraw = async () => {
    if (!consent || saving) return;
    setSaving(true);
    const { error } = await supabase
      .from("youth_participation_consents")
      .update({ revoked_at: new Date().toISOString() })
      .eq("id", consent.id);
    setSaving(false);
    if (error) {
      toast({ title: "Couldn't withdraw consent", description: error.message, variant: "destructive" });
      return;
    }
    toast({ title: "Participation consent withdrawn", description: `${youth.display_name} cannot check in until a new form is completed.` });
    onSaved();
  };

  return (
    <section className="mt-5 rounded-sm border border-border bg-background/60 p-4 sm:p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <span className={`mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-full ${current ? "bg-primary/10 text-primary" : "bg-destructive/10 text-destructive"}`}>
            {current ? <Check size={15} /> : <ShieldCheck size={15} />}
          </span>
          <div>
            <p className="font-body text-sm font-semibold text-foreground">Annual participation consent</p>
            <p className={`mt-0.5 font-body text-xs ${current ? "text-muted-foreground" : "text-destructive"}`}>{statusText}</p>
            {current && (
              <p className="mt-1 font-body text-xs text-muted-foreground">
                Promotional photography: <strong>{consent?.promotional_photo_consent ? "Yes" : "No — protected on the register"}</strong>
              </p>
            )}
          </div>
        </div>
        <button
          type="button"
          onClick={() => setOpen((value) => !value)}
          className="min-h-10 border border-foreground/20 px-3 font-body text-[10px] font-semibold uppercase tracking-widest text-foreground hover:border-primary/50 hover:text-primary"
        >
          {open ? "Close form" : current ? "Review or update" : "Complete form"}
        </button>
      </div>

      {open && (
        <div className="mt-5 border-t border-border pt-5">
          <div className="rounded-sm border border-primary/15 bg-primary/[0.04] p-4 font-body text-xs leading-5 text-muted-foreground">
            <strong className="text-foreground">Why we ask:</strong> attendance and contact details let us run the room safely; essential operational data covers household links, attendance and safeguarding records. Only authorised guardians, safeguarding staff and admins can access this form. Safety information is shared only with staff who need it for safe participation. Saying no to promotional photography does not prevent attendance; the private reference photo is used only to identify who must be kept out of promotional images or masked during image review.
          </div>

          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <label className="font-body text-xs font-semibold text-foreground">
              Parent or legal guardian
              <input className={inputClass} value={form.guardianName} onChange={(e) => update("guardianName", e.target.value)} />
            </label>
            <label className="font-body text-xs font-semibold text-foreground">
              Relationship to {youth.display_name}
              <input className={inputClass} placeholder="e.g. parent, legal guardian" value={form.guardianRelationship} onChange={(e) => update("guardianRelationship", e.target.value)} />
            </label>
            <label className="font-body text-xs font-semibold text-foreground">
              Emergency contact
              <input className={inputClass} value={form.emergencyContactName} onChange={(e) => update("emergencyContactName", e.target.value)} />
            </label>
            <label className="font-body text-xs font-semibold text-foreground">
              Emergency contact phone
              <input className={inputClass} type="tel" autoComplete="tel" value={form.emergencyContactPhone} onChange={(e) => update("emergencyContactPhone", e.target.value)} />
            </label>
            <label className="font-body text-xs font-semibold text-foreground sm:col-span-2">
              Emergency contact's relationship
              <input className={inputClass} placeholder="e.g. parent, grandparent, family friend" value={form.emergencyContactRelationship} onChange={(e) => update("emergencyContactRelationship", e.target.value)} />
            </label>
            <label className="font-body text-xs font-semibold text-foreground sm:col-span-2">
              Medical, accessibility or behavioural information staff need for safe participation <span className="font-normal text-muted-foreground">(optional)</span>
              <textarea className={`${inputClass} min-h-24 resize-y`} maxLength={4000} value={form.safeParticipationNotes} onChange={(e) => update("safeParticipationNotes", e.target.value)} />
              <span className="mt-1 block font-normal text-muted-foreground">Share only what staff genuinely need to keep {youth.display_name} safe.</span>
            </label>
          </div>

          <fieldset className="mt-5 space-y-3">
            <legend className="font-body text-xs font-semibold uppercase tracking-widest text-foreground/60">Required participation choices</legend>
            <ConsentCheck checked={form.attendanceConsent} onChange={(value) => update("attendanceConsent", value)}>
              I consent to {youth.display_name} attending the Mindcast {youth.role_in_household === "teen" ? "teen" : "children's"} programme.
            </ConsentCheck>
            <ConsentCheck checked={form.operationalDataConsent} onChange={(value) => update("operationalDataConsent", value)}>
              I consent to the essential household, attendance, emergency and safeguarding information described above being collected and used to run the programme safely.
            </ConsentCheck>
            <ConsentCheck checked={form.nfcBraceletConsent} onChange={(value) => update("nfcBraceletConsent", value)}>
              I consent to an NFC bracelet identifier being linked to {youth.display_name} for check-in. <span className="text-muted-foreground">Optional unless they use a bracelet.</span>
            </ConsentCheck>
          </fieldset>

          <fieldset className="mt-6">
            <legend className="font-body text-xs font-semibold uppercase tracking-widest text-foreground/60">Photography and filming</legend>
            <p className="mt-2 font-body text-xs leading-5 text-muted-foreground">
              Mindcast may photograph or film programme activity for its website, social media, email and printed promotional material. We do not publish a child's name with promotional images. Choose one option.
            </p>
            <div className="mt-3 grid gap-2 sm:grid-cols-2">
              <PhotoChoice selected={form.promotionalPhotoConsent} onClick={() => update("promotionalPhotoConsent", true)} title="Yes, promotional use is okay" detail="Mindcast may capture and use suitable images for the listed promotional channels." />
              <PhotoChoice selected={!form.promotionalPhotoConsent} onClick={() => update("promotionalPhotoConsent", false)} title="No promotional photos or video" detail="Staff will avoid capture and crop, blur or cover them if they appear incidentally." />
            </div>
          </fieldset>

          {!form.promotionalPhotoConsent && (
            <div className="mt-4 rounded-sm border border-border p-4">
              <div className="flex items-start gap-3">
                <CameraOff size={17} className="mt-0.5 shrink-0 text-primary" />
                <div>
                  <p className="font-body text-sm font-semibold text-foreground">Private identification photo required</p>
                  <p className="mt-1 font-body text-xs leading-5 text-muted-foreground">
                    Upload a clear, current photo of {youth.display_name}. It is kept in a private safeguarding register and is never licensed or used as programme or promotional content.
                  </p>
                </div>
              </div>
              <label className="mt-3 inline-flex min-h-10 cursor-pointer items-center gap-2 border border-foreground/20 px-3 font-body text-xs font-semibold text-foreground hover:border-primary/50">
                <FileImage size={14} /> {referencePhoto ? referencePhoto.name : consent?.photo_reference_path ? "Replace stored reference photo" : "Choose reference photo"}
                <input className="sr-only" type="file" accept="image/jpeg,image/png,image/webp" onChange={choosePhoto} />
              </label>
              <p className="mt-2 font-body text-[10px] text-muted-foreground">JPG, PNG or WebP · maximum 5 MB · staff identification only</p>
            </div>
          )}

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <button type="button" onClick={() => void save()} disabled={saving} className="inline-flex min-h-11 items-center gap-2 bg-primary px-5 font-body text-[11px] font-semibold uppercase tracking-widest text-primary-foreground disabled:opacity-50">
              {saving && <Loader2 size={14} className="animate-spin" />} Record consent for {programmeYear}
            </button>
            {current && (
              <button type="button" onClick={() => void withdraw()} disabled={saving} className="min-h-11 border border-destructive/30 px-4 font-body text-[10px] font-semibold uppercase tracking-widest text-destructive hover:border-destructive/60 disabled:opacity-50">
                Withdraw participation consent
              </button>
            )}
          </div>
        </div>
      )}
    </section>
  );
};

const ConsentCheck = ({ checked, onChange, children }: { checked: boolean; onChange: (value: boolean) => void; children: ReactNode }) => (
  <label className="flex cursor-pointer items-start gap-3 rounded-sm border border-border bg-background p-3">
    <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="mt-0.5 h-4 w-4 shrink-0 accent-primary" />
    <span className="font-body text-xs leading-5 text-foreground/80">{children}</span>
  </label>
);

const PhotoChoice = ({ selected, onClick, title, detail }: { selected: boolean; onClick: () => void; title: string; detail: string }) => (
  <button type="button" role="radio" aria-checked={selected} onClick={onClick} className={`rounded-sm border p-3 text-left ${selected ? "border-primary bg-primary/[0.05]" : "border-border bg-background"}`}>
    <span className="block font-body text-xs font-semibold text-foreground">{title}</span>
    <span className="mt-1 block font-body text-[11px] leading-5 text-muted-foreground">{detail}</span>
  </button>
);

export default YouthConsentForm;
