import { WorkspaceShell } from "@/components/workspace-shell";
import { WorkspaceView } from "@/components/workspace-view";

export default function ChatPage() {
  return (
    <WorkspaceShell>
      <WorkspaceView mode="chat" />
    </WorkspaceShell>
  );
}
