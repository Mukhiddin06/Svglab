import { Group, Panel, Separator } from "react-resizable-panels";
import PreviewPanel from "./PreviewPanel";
import CodePanel from "./CodePanel";
import SvgTree from "./SvgTree";

export default function Editor() {
  return (
    <Group className="editor-layout" orientation="horizontal">
      <Panel defaultSize="18%" minSize="14%">
        <SvgTree />
      </Panel>

      <Separator className="resize-handle" />

      <Panel defaultSize="36%" minSize="24%">
        <CodePanel />
      </Panel>

      <Separator className="resize-handle" />

      <Panel defaultSize="46%" minSize="30%">
        <PreviewPanel />
      </Panel>
    </Group>
  );
}
