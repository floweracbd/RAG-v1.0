import { WorkspaceShell } from "@/components/workspace-shell";
import { WorkspaceView } from "@/components/workspace-view";

export default function HomePage() {
  return (
    <WorkspaceShell>
      <WorkspaceView mode="dashboard" />
    </WorkspaceShell>
  );
}
