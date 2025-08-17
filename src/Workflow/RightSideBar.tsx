import { Box } from "@chakra-ui/react";
import { Node } from "@xyflow/react";
import ComponentDetail from "../Components/ComponentDetail";
import { useDarkMode } from "../store";

interface RightSidebarProps {
  selectedNode: Node | undefined;
  onDelete: () => void;
  onProcessingTypeChange: (boardId: string, processingType: string) => void;
  nodes: Node[];
  showContent: boolean;
}

export const RightSidebar = ({
  selectedNode,
  onDelete,
  onProcessingTypeChange,
  nodes,
  showContent
}: RightSidebarProps) => {
  const { isDark } = useDarkMode();

  if (!selectedNode) return null;

  return (

      <ComponentDetail
        node={selectedNode}
        key={selectedNode.id}
        onDelete={onDelete}
        onProcessingTypeChange={onProcessingTypeChange}
        nodes={nodes}
        showContent={showContent}
      />
   
  );
};