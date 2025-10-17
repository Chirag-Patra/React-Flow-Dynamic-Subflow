import { useRef } from 'react';
import {
  Button,
  useDisclosure,
  AlertDialog,
  AlertDialogOverlay,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogBody,
  AlertDialogFooter,
} from "@chakra-ui/react";
import { CgExport } from "react-icons/cg";
import { BiImport } from "react-icons/bi";
import { FaTrash } from "react-icons/fa";
import { Download } from "react-bootstrap-icons";
import {
  getNodesBounds,
  getViewportForBounds,
  useReactFlow,
  Node,
  Edge,
} from "@xyflow/react";
import { toPng } from "html-to-image";
import { useDarkMode } from "../../store"; // Assuming this store exists

// Props for ExportButton
interface ExportButtonProps {
  nodes: Node[];
  edges: Edge[];
}

/**
 * Renders a button to export the current workflow as a JSON file.
 */
export const ExportButton = ({ nodes, edges }: ExportButtonProps) => {
  const handleExport = () => {
    const data = { nodes, edges };
    const dataStr = JSON.stringify(data, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
    const exportName = `workflow-${new Date().toISOString().slice(0, 10)}.json`;

    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute('href', dataUri);
    downloadAnchorNode.setAttribute('download', exportName);
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  return (
    <Button
      variant="outline"
    //   colorScheme="gray"
      size="sm"
      color="whiteAlpha.900"
      borderColor="gray.600"
      _hover={{ bg: "gray.700", borderColor: "gray.500" }}
      leftIcon={<CgExport />}
      onClick={handleExport}
    >
      Export
    </Button>
  );
};

// Props for ImportButton
interface ImportButtonProps {
    onImport: (flow: { nodes: Node[]; edges: Edge[] }) => void;
}

/**
 * Renders a button that opens a file dialog to import a workflow from a JSON file.
 */
export const ImportButton = ({ onImport }: ImportButtonProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const flow = JSON.parse(e.target?.result as string);
        if (flow.nodes && flow.edges) {
          onImport(flow);
        } else {
          alert('Invalid workflow file format.');
        }
      } catch (error) {
        alert('Error parsing workflow file.');
        console.error("Import Error:", error);
      }
      // Reset input to allow importing the same file again
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    };
    reader.readAsText(file);
  };

  return (
    <>
      <Button
        variant="outline"
        // colorScheme="gray"
        size="sm"
       color="whiteAlpha.900"
      borderColor="gray.600"
      _hover={{ bg: "gray.700", borderColor: "gray.500" }}
        leftIcon={<BiImport />}
        onClick={() => fileInputRef.current?.click()}
      >
        Import
      </Button>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept=".json"
        style={{ display: 'none' }}
      />
    </>
  );
};

// Props for ClearCanvasButton
interface ClearCanvasButtonProps {
  onClear: () => void;
}

/**
 * Renders a button that shows a confirmation dialog before clearing the canvas.
 */
export const ClearCanvasButton = ({ onClear }: ClearCanvasButtonProps) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const cancelRef = useRef<HTMLButtonElement>(null);

  const handleClear = () => {
    onClear();
    onClose();
  };

  return (
    <>
      <Button
        variant="outline"
        // colorScheme="gray"
        size="sm"
        color="whiteAlpha.900"
      borderColor="gray.600"
      _hover={{ bg: "gray.700", borderColor: "gray.500" }}
        leftIcon={<FaTrash />}
        onClick={onOpen}
      >
        Clear
      </Button>

      <AlertDialog
        isOpen={isOpen}
        leastDestructiveRef={cancelRef}
        onClose={onClose}
        isCentered
      >
        <AlertDialogOverlay>
          <AlertDialogContent bg="#2D3748" color="whiteAlpha.900">
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              Clear Workflow Canvas
            </AlertDialogHeader>
            <AlertDialogBody>
              Are you sure? This will remove all elements from the canvas. This action cannot be undone.
            </AlertDialogBody>
            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={onClose} variant="ghost" _hover={{ bg: "gray.600" }}>
                Cancel
              </Button>
              <Button colorScheme="red" onClick={handleClear} ml={3}>
                Clear Canvas
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </>
  );
};


/**
 * Renders a button to download the current workflow view as a PNG image.
 */
export const DownloadImageButton = () => {
  const { getNodes } = useReactFlow();
  const { isDark } = useDarkMode(); // Assuming a custom hook for dark mode state

  const onDownload = () => {
    const IMAGE_WIDTH = 1024;
    const IMAGE_HEIGHT = 768;
    const nodesBounds = getNodesBounds(getNodes());
    const viewport = getViewportForBounds(nodesBounds, IMAGE_WIDTH, IMAGE_HEIGHT, 0.5, 2, 1);

    const reactFlowViewport = document.querySelector(".react-flow__viewport") as HTMLElement;
    if (!reactFlowViewport) return;

    toPng(reactFlowViewport, {
      backgroundColor: isDark ? '#1A202C' : 'white', // Chakra gray.800
      width: IMAGE_WIDTH,
      height: IMAGE_HEIGHT,
      style: {
        width: `${IMAGE_WIDTH}px`,
        height: `${IMAGE_HEIGHT}px`,
        transform: `translate(${viewport.x}px, ${viewport.y}px) scale(${viewport.zoom})`,
      },
    }).then((dataUrl) => {
        const a = document.createElement("a");
        a.setAttribute("download", "workflow.png");
        a.setAttribute("href", dataUrl);
        a.click();
    });
  };

  return (
    <Button
      variant="outline"
    //   colorScheme="gray"
      size="sm"
      color="whiteAlpha.900"
      borderColor="gray.600"
      _hover={{ bg: "gray.700", borderColor: "gray.500" }}
      leftIcon={<Download />}
      onClick={onDownload}
    >
      Download Image
    </Button>
  );
};