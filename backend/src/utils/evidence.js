// backend/src/utils/evidence.js

function splitIntoLines(text) {
  return (text || "")
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);
}

function splitIntoSentences(text) {
  // simple sentence split fallback
  return (text || "")
    .replace(/\r?\n/g, " ")
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter((s) => s.length >= 20);
}

function normalize(s) {
  return (s || "").toLowerCase().trim();
}

/**
 * Extract evidence snippets from resume for each skill.
 * We prefer lines (bullets) first, then fall back to sentences.
 */
export function buildEvidenceFromResume(resumeText, skills = [], maxSnippetsPerSkill = 3) {
  const lines = splitIntoLines(resumeText);
  const sentences = splitIntoSentences(resumeText);

  const evidence = [];

  for (const skillRaw of skills) {
    const skill = normalize(skillRaw);
    if (!skill) continue;

    const matches = [];

    // 1) Prefer lines (often bullet points)
    for (const line of lines) {
      if (normalize(line).includes(skill)) {
        matches.push(line);
        if (matches.length >= maxSnippetsPerSkill) break;
      }
    }

    // 2) Fallback to sentences if not enough
    if (matches.length < maxSnippetsPerSkill) {
      for (const s of sentences) {
        if (normalize(s).includes(skill)) {
          // Avoid duplicates
          if (!matches.includes(s)) matches.push(s);
          if (matches.length >= maxSnippetsPerSkill) break;
        }
      }
    }

    evidence.push({
      skill: skillRaw,
      snippets: matches.slice(0, maxSnippetsPerSkill)
    });
  }

  return evidence;
}