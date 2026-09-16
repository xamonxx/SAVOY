"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, ArrowRight, Check, Loader2 } from "lucide-react";
import { useId, useState, useTransition } from "react";
import { Controller, useForm } from "react-hook-form";

import { submitSurvey } from "@/app/actions/submit-survey";
import {
  controlClasses,
  describedBy,
  FieldShell,
  OptionCard,
  Select,
} from "@/components/forms/fields";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/cn";
import {
  CONSULTATION_STEPS,
  consultationSchema,
  ROOMS,
  SCOPES,
  TIMELINES,
  type ConsultationInput,
} from "@/lib/schemas/survey";
import { buildConsultationMessage, buildWhatsAppUrl } from "@/lib/whatsapp";

type Status = "idle" | "error" | "success";

export function SurveyForm() {
  const formId = useId();
  const [step, setStep] = useState(0);
  const [status, setStatus] = useState<Status>("idle");
  const [message, setMessage] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const {
    control,
    register,
    handleSubmit,
    trigger,
    getValues,
    setFocus,
    formState: { errors },
  } = useForm<ConsultationInput>({
    resolver: zodResolver(consultationSchema),
    mode: "onTouched",
    defaultValues: {
      room: undefined,
      scope: undefined,
      location: "",
      timeline: undefined,
      name: "",
      whatsapp: "",
      notes: "",
      consent: false,
    },
  });

  const current = CONSULTATION_STEPS[step];
  const isLast = step === CONSULTATION_STEPS.length - 1;

  async function next() {
    const valid = await trigger([...current.fields], { shouldFocus: true });
    if (valid) setStep((value) => Math.min(value + 1, CONSULTATION_STEPS.length - 1));
  }

  function back() {
    setStatus("idle");
    setMessage(null);
    setStep((value) => Math.max(value - 1, 0));
  }

  function errorFor(field: keyof ConsultationInput): string | undefined {
    const value = errors[field]?.message;
    return typeof value === "string" ? value : undefined;
  }

  function handoff(values: ConsultationInput) {
    return buildWhatsAppUrl({
      source: "planner_success",
      message: buildConsultationMessage({
        room: values.room ?? "",
        scope: values.scope ?? "",
        location: values.location,
        timeline: values.timeline ?? "",
        name: values.name,
        whatsapp: values.whatsapp,
        notes: values.notes || undefined,
      }),
    });
  }

  const submit = handleSubmit((values) => {
    startTransition(async () => {
      const payload = new FormData();
      for (const [key, value] of Object.entries(values)) {
        payload.append(key, String(value));
      }

      const result = await submitSurvey(payload);

      if (result.status === "error") {
        setStatus("error");
        setMessage(result.message);
        const firstField = result.fieldErrors
          ? (Object.keys(result.fieldErrors)[0] as keyof ConsultationInput | undefined)
          : undefined;
        if (firstField) setFocus(firstField);
        return;
      }

      setStatus("success");
      setMessage(null);

      const url = handoff(values);
      if (url) window.location.href = url;
    });
  });

  if (status === "success") {
    const values = getValues();
    const url = handoff(values);
    return (
      <div className="space-y-5 py-4" role="status">
        <span className="flex size-12 items-center justify-center rounded-md bg-savoy-gold text-savoy-obsidian">
          <Check aria-hidden className="size-6" />
        </span>
        <div className="space-y-2">
          <h3 className="font-display text-3xl font-semibold">Terima kasih.</h3>
          <p className="max-w-md text-base leading-7 text-ink-muted">
            Ringkasan konsultasi sudah siap. Jika WhatsApp tidak terbuka otomatis,
            gunakan tombol di bawah ini.
          </p>
        </div>
        {url ? <Button href={url} external>Lanjutkan via WhatsApp</Button> : null}
      </div>
    );
  }

  return (
    <form onSubmit={submit} noValidate className="space-y-8">
      <ol className="grid grid-cols-4 gap-2 text-xs font-semibold text-ink-muted">
        {CONSULTATION_STEPS.map((item, index) => (
          <li
            key={item.id}
            className={cn(
              "border-t pt-3",
              index <= step ? "border-savoy-gold text-savoy-ink" : "border-border-soft"
            )}
          >
            {String(index + 1).padStart(2, "0")} {item.label}
          </li>
        ))}
      </ol>

      {step === 0 ? (
        <fieldset className="space-y-3">
          <legend className="text-lg font-semibold">Ruang utama</legend>
          <Controller
            control={control}
            name="room"
            render={({ field }) => (
              <div className="grid gap-x-8 md:grid-cols-2">
                {ROOMS.map((room) => (
                  <OptionCard
                    key={room}
                    name={field.name}
                    value={room}
                    checked={field.value === room}
                    onChange={field.onChange}
                    onBlur={field.onBlur}
                  >
                    {room}
                  </OptionCard>
                ))}
              </div>
            )}
          />
          {errorFor("room") ? <p className="text-sm text-error">{errorFor("room")}</p> : null}
        </fieldset>
      ) : null}

      {step === 1 ? (
        <fieldset className="space-y-3">
          <legend className="text-lg font-semibold">Lingkup pekerjaan</legend>
          <Controller
            control={control}
            name="scope"
            render={({ field }) => (
              <div className="grid gap-x-8 md:grid-cols-2">
                {SCOPES.map((scope) => (
                  <OptionCard
                    key={scope}
                    name={field.name}
                    value={scope}
                    checked={field.value === scope}
                    onChange={field.onChange}
                    onBlur={field.onBlur}
                  >
                    {scope}
                  </OptionCard>
                ))}
              </div>
            )}
          />
          {errorFor("scope") ? <p className="text-sm text-error">{errorFor("scope")}</p> : null}
        </fieldset>
      ) : null}

      {step === 2 ? (
        <div className="grid gap-5 md:grid-cols-2">
          <FieldShell id={`${formId}-location`} label="Lokasi proyek" error={errorFor("location")}>
            <input
              id={`${formId}-location`}
              className={controlClasses}
              placeholder="Contoh: Jakarta Selatan"
              aria-invalid={Boolean(errorFor("location"))}
              aria-describedby={describedBy(`${formId}-location`, undefined, errorFor("location"))}
              {...register("location")}
            />
          </FieldShell>
          <FieldShell id={`${formId}-timeline`} label="Timeline" error={errorFor("timeline")}>
            <Select id={`${formId}-timeline`} defaultValue="" {...register("timeline")}>
              <option value="" disabled>
                Pilih timeline
              </option>
              {TIMELINES.map((timeline) => (
                <option key={timeline} value={timeline}>
                  {timeline}
                </option>
              ))}
            </Select>
          </FieldShell>
        </div>
      ) : null}

      {step === 3 ? (
        <div className="space-y-5">
          <div className="grid gap-5 md:grid-cols-2">
            <FieldShell id={`${formId}-name`} label="Nama" error={errorFor("name")}>
              <input id={`${formId}-name`} className={controlClasses} {...register("name")} />
            </FieldShell>
            <FieldShell id={`${formId}-whatsapp`} label="WhatsApp" error={errorFor("whatsapp")}>
              <input
                id={`${formId}-whatsapp`}
                className={controlClasses}
                type="tel"
                placeholder="+628..."
                {...register("whatsapp")}
              />
            </FieldShell>
          </div>
          <FieldShell id={`${formId}-notes`} label="Catatan singkat" hint="Opsional." error={errorFor("notes")}>
            <textarea id={`${formId}-notes`} className={controlClasses} rows={4} {...register("notes")} />
          </FieldShell>
          <label className="flex items-start gap-3 text-sm leading-6 text-ink-muted">
            <input type="checkbox" className="mt-1 size-4 accent-savoy-gold" {...register("consent")} />
            <span>Saya setuju data ini digunakan untuk koordinasi konsultasi proyek.</span>
          </label>
          {errorFor("consent") ? <p className="text-sm text-error">{errorFor("consent")}</p> : null}
        </div>
      ) : null}

      {status === "error" && message ? (
        <p role="alert" className="rounded-md bg-error-surface px-4 py-3 text-sm text-error">
          {message}
        </p>
      ) : null}

      <div className="flex flex-col gap-3 border-t border-border-soft pt-6 sm:flex-row sm:justify-between">
        {step > 0 ? (
          <Button type="button" variant="outline" onClick={back}>
            <ArrowLeft aria-hidden className="size-4" />
            Kembali
          </Button>
        ) : (
          <span />
        )}
        {isLast ? (
          <Button type="submit" disabled={pending}>
            {pending ? <Loader2 aria-hidden className="size-4 animate-spin" /> : null}
            Kirim konsultasi
            <ArrowRight aria-hidden className="size-4" />
          </Button>
        ) : (
          <Button type="button" onClick={next}>
            Lanjut
            <ArrowRight aria-hidden className="size-4" />
          </Button>
        )}
      </div>
    </form>
  );
}
