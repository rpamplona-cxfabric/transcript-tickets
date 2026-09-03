export interface ParsedTranscriptLine {
  timeTag: string;
  speakerName: string;
  speakerText: string;
}

export function parseTranscriptLine(line: string): ParsedTranscriptLine | null {
  const match = line.match(/^(?:\[([^\]]+)\]\s+)?(?:\[([^\]]+)\]|(Speaker\s*\d+|[^:]+))\s*:(.*)$/);
  if (!match) return null;

  const speakerName = (match[2] || match[3]).trim();
  if (!speakerName) return null;

  return {
    timeTag: match[1] ? `[${match[1]}]` : '',
    speakerName,
    speakerText: match[4] || '',
  };
}
