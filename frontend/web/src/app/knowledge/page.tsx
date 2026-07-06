import { WorkspaceShell } from "@/components/workspace-shell";
import { WorkspaceView } from "@/components/workspace-view";

export default function KnowledgePage() {
  return (
    <WorkspaceShell>
      <WorkspaceView mode="knowledge" />
    </WorkspaceShell>
  );
}
