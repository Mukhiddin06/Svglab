import { Group, Panel, Separator } from "react-resizable-panels";
import PreviewPanel from "./PreviewPanel";
import CodePanel from "./CodePanel";
import SvgTree from "./SvgTree";

export default function Editor() {
  return (
    <Group orientation="horizontal">
      <Panel defaultSize="25%">
        <SvgTree />
      </Panel>

      <Separator className="w-[2px] bg-gray-300" />

      <Panel defaultSize="25%">
        <CodePanel />
      </Panel>

      <Separator className="w-[2px] bg-gray-300" />

      <Panel defaultSize="50%">
        <PreviewPanel />
      </Panel>
    </Group>
  );
}