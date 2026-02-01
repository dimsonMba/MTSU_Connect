import type { ResumeGenerated } from "../../types/index";

type ResumePreviewPayload = {
  resumeJson: ResumeGenerated;
};

let payload: ResumePreviewPayload | null = null;

export function setResumePreviewPayload(p: ResumePreviewPayload) {
  payload = p;
}
export function getResumePreviewPayload() {
  return payload;
}
export function clearResumePreviewPayload() {
  payload = null;
}
