export interface ParsedTranscriptLine {
  timeTag: string;
  speakerName: string;
  speakerText: string;
}

const isSpeakerName = (value: string) => {
  const normalized = value.trim();

  return (
    /^(?:speaker|spk|participant|caller|agent|customer|representative)[ _-]*(?:\d+|[a-z]+)?$/i.test(
      normalized,
    ) ||
    /^\+?\d(?:[\d\s().-]*\d)?$/.test(normalized) ||
    /^[a-z][a-z'’-]*(?:\s+[a-z][a-z'’-]*){0,3}$/i.test(normalized)
  );
};

export function parseTranscriptLine(line: string): ParsedTranscriptLine | null {
  const match = line.match(
    /^(?:\[([^\]]+)\]\s+)?(?:\[([^\]]+)\]|(Speaker\s*\d+|[^:]+))\s*:(.*)$/,
  );
  if (!match) return null;

  const speakerName = (match[2] || match[3]).trim();
  if (!speakerName || !isSpeakerName(speakerName)) return null;

  return {
    timeTag: match[1] ? `[${match[1]}]` : "",
    speakerName,
    speakerText: match[4] || "",
  };
}
