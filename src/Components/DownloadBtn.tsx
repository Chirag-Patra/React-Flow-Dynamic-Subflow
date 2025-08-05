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
          // Base: Dark slate grey → medium slate grey (subtle gradient)
          height: '32px',
          width: '32px',
          bgGradient: 'linear-gradient(to right, #1f2937, #7187aaff)', // Gray.800 → Gray.700
          color: 'white',
          borderRadius: 'md',
          border: 'none',
          fontWeight: 'bold',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          boxShadow: 'md', // Neutral shadow (works with grey)
          position: 'relative',
          overflow: 'hidden',

          // Hover: Medium slate grey → lighter slate grey (lightens for feedback)
          _hover: {
            bgGradient: 'linear(to-r, #374151, #4b5563)', // Gray.700 → Gray.600
            transform: 'translateY(-2px)', // Lift effect
            boxShadow: 'lg', // Deeper shadow on hover
            '&::before': {
              content: '""',
              position: 'absolute',
              inset: 0, // Shorthand for top/left/right/bottom: 0
              bgGradient: 'linear-gradient(to right, #1f2937, #3a4350ff)', // Matches base (layered effect)
            }
          },

          // Icon: Subtle white shadow for depth in dark mode
          '& svg': {
            width: '16px',
            height: '16px',
            filter: 'drop-shadow(0 1px 1px rgba(255,255,255,0.1))',
            transition: 'transform 0.2s ease-out',
          },

          // Icon Hover: Slight scale + stronger shadow
          '&:hover svg': {
            transform: 'scale(1.15)',
            filter: 'drop-shadow(0 1px 2px rgba(255,255,255,0.2))',
          },

          // Pulse: Soft grey glow (matches theme, not distracting)
          animation: 'pulse 5s infinite',
          '@keyframes pulse': {
            '0%': { boxShadow: '0 0 0 0 rgba(156, 163, 175, 0.7)' }, // Gray.400 (light grey)
            '70%': { boxShadow: '0 0 0 10px rgba(156, 163, 175, 0)' },
            '100%': { boxShadow: '0 0 0 0 rgba(156, 163, 175, 0)' },
          }
        }}
      />
    </Tooltip>
  );
}
