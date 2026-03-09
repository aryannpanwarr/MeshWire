import { appendFile, mkdir } from "node:fs/promises";
import { join } from "node:path";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

const destinationEmail = "aryannpanwarr@gmail.com";

type Submission = {
  agentName: string;
  builderEmail: string;
  capabilities: string;
  createdAt: string;
  source: string;
};

function normalizeSingleLine(value: unknown, maxLength: number) {
  if (typeof value !== "string") {
    return null;
  }

  const normalized = value.replace(/\s+/g, " ").trim();

  if (!normalized || normalized.length > maxLength) {
    return null;
  }

  return normalized;
}

function normalizeMultiLine(value: unknown, maxLength: number) {
  if (typeof value !== "string") {
    return null;
  }

  const normalized = value
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .join("\n")
    .trim();

  if (!normalized || normalized.length > maxLength) {
    return null;
  }

  return normalized;
}

function normalizeEmail(value: unknown) {
  if (typeof value !== "string") {
    return null;
  }

  const normalized = value.trim().toLowerCase();
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!emailPattern.test(normalized) || normalized.length > 254) {
    return null;
  }

  return normalized;
}

async function writeSubmissionFallback(submission: Submission) {
  const dataDirectory = join(process.cwd(), "data");

  await mkdir(dataDirectory, { recursive: true });
  await appendFile(
    join(dataDirectory, "waitlist-submissions.ndjson"),
    `${JSON.stringify(submission)}\n`,
    "utf8",
  );
}

async function relayWithResend(submission: Submission) {
  const apiKey = process.env.RESEND_API_KEY;

  if (!apiKey) {
    return false;
  }

  const response = await fetch("https://api.resend.com/emails", {
    body: JSON.stringify({
      from: process.env.RESEND_FROM ?? "MeshWire <onboarding@resend.dev>",
      reply_to: submission.builderEmail,
      subject: `MeshWire waitlist // ${submission.agentName}`,
      text: [
        "New MeshWire waitlist submission",
        "",
        `Agent name: ${submission.agentName}`,
        `Builder email: ${submission.builderEmail}`,
        "",
        "Capabilities:",
        submission.capabilities,
        "",
        `Submitted at: ${submission.createdAt}`,
        `Source: ${submission.source}`,
      ].join("\n"),
      to: [destinationEmail],
    }),
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    method: "POST",
  });

  if (!response.ok) {
    throw new Error(await response.text());
  }

  return true;
}

export async function POST(request: Request) {
  let payload: Record<string, unknown>;

  try {
    payload = (await request.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "Invalid JSON request body." }, { status: 400 });
  }

  const agentName = normalizeSingleLine(payload.agentName, 80);
  const capabilities = normalizeMultiLine(payload.capabilities, 600);
  const builderEmail = normalizeEmail(payload.builderEmail);

  if (!agentName || !capabilities || !builderEmail) {
    return NextResponse.json(
      {
        error:
          "Please provide a valid agent name, capabilities summary, and builder email.",
      },
      { status: 400 },
    );
  }

  const submission: Submission = {
    agentName,
    builderEmail,
    capabilities,
    createdAt: new Date().toISOString(),
    source: "meshwire.com",
  };
  let delivery: "email" | "file" = "file";

  try {
    const sent = await relayWithResend(submission);

    if (sent) {
      delivery = "email";
    } else {
      await writeSubmissionFallback(submission);
    }
  } catch (error) {
    console.error("Waitlist relay failed. Falling back to local storage.", error);
    await writeSubmissionFallback(submission);
  }

  return NextResponse.json({ delivery, ok: true }, { status: 201 });
}
