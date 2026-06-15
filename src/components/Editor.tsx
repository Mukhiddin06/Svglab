import { Group, Panel, Separator } from "react-resizable-panels";
import PreviewPanel from "./PreviewPanel";
import CodePanel from "./CodePanel";

export default function Editor() {
  return (
    <Group orientation="horizontal">
      <Panel defaultSize="50%">
        <PreviewPanel />
      </Panel>

      <Separator className="w-[2px] bg-gray-300" />

      <Panel defaultSize="50%">
        <CodePanel />
      </Panel>
    </Group>
  );
}