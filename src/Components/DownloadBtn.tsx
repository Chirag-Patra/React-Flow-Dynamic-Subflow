import { IconButton } from "@chakra-ui/react";
import {
  getNodesBounds,
  getViewportForBounds,
  useReactFlow,
} from "@xyflow/react";
import { toPng } from "html-to-image";
import React from "react";
import { Download } from "react-bootstrap-icons";
import { useDarkMode } from "../store";
import { Tooltip } from '@chakra-ui/react';

const IMAGE_WIDTH = 1024;
const IMAGE_HEIGHT = 768;

const downloadImage = (dataUrl: string) => {
  const a = document.createElement("a");

  a.setAttribute("download", "reactflow.png");
  a.setAttribute("href", dataUrl);

  a.click();
};

export default function DownloadBtn() {
  const { getNodes } = useReactFlow();

  const { isDark } = useDarkMode();

  let color = "white";
  if (isDark) color = "black";

  const onDownload = () => {
    const nodesBounds = getNodesBounds(getNodes());
    const { x, y, zoom } = getViewportForBounds(
      nodesBounds,
      IMAGE_WIDTH,
      IMAGE_HEIGHT,
      0.5,
      2,
      1
    );

    const reactFlow = document.querySelector(
      ".react-flow__viewport"
    ) as HTMLElement;
    if (!reactFlow) return;

    toPng(reactFlow, {
      backgroundColor: color,
      width: IMAGE_WIDTH,
      height: IMAGE_HEIGHT,
      style: {
        width: `${IMAGE_WIDTH}px`,
        height: `${IMAGE_HEIGHT}px`,
        transform: `translate(${x}px, ${y}px) scale(${zoom})`,
      },
    }).then(downloadImage);
  };

  return (
    <Tooltip
      hasArrow
      label="Download Workflow Image"
      aria-label="Download workflow tooltip"
      placement="bottom"
      bg="blue.500"
      color="white"
      borderRadius="md"
      py={1}
      px={2}
      openDelay={300}
      transition="all 0.2s cubic-bezier(0.68, -0.55, 0.265, 1.55)"
      _hover={{
        transform: 'translateY(-2px)',
        boxShadow: 'lg'
      }}
    >
      <IconButton
        icon={<Download style={{ fontWeight: 'bold' }} />}
        aria-label="Export"
        size="xs"
        onClick={onDownload}
        sx={{
                        // Base gradient styling
                        height: '32px',
                        width: '32px',
                        bgGradient: 'linear-gradient(to right, #4f46e5, #af78cfff)',
                        color: 'white',
                        borderRadius: 'md',
                        border: 'none',
                        fontWeight: 'bold',
                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                        boxShadow: 'md',
                        position: 'relative',
                        overflow: 'hidden',

                        // Gradient animation on hover
                        _hover: {
                            bgGradient: 'linear(to-r, blue.500, teal.400)',
                            transform: 'translateY(-2px)',
                            boxShadow: 'lg',
                            '&::before': {
                                content: '""',
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                right: 0,
                                bottom: 0,
                                bgGradient: 'linear-gradient(to right, #4f46e5, #af78cfff)',
                            }
                        },
                        // Icon styling
                        '& svg': {
                            width: '16px',
                            height: '16px',
                            filter: 'drop-shadow(0 1px 1px rgba(0,0,0,0.2))',
                            transition: 'transform 0.2s ease-out',
                        },

                        // Icon animation on hover
                        '&:hover svg': {
                            transform: 'scale(1.15)',
                            filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.3))',
                        },

                        // Pulse animation (optional)
                        animation: 'pulse 5s infinite',
                        '@keyframes pulse': {
                            '0%': { boxShadow: '0 0 0 0 rgba(49, 151, 149, 0.7)' },
                            '70%': { boxShadow: '0 0 0 10px rgba(49, 151, 149, 0)' },
                            '100%': { boxShadow: '0 0 0 0 rgba(49, 151, 149, 0)' },
                        }
                    }}
                />
    </Tooltip>
  );
}
