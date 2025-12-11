import { Box, Flex, Text, Button, Divider, HStack, Image } from "@chakra-ui/react";
import { Node, Edge } from "@xyflow/react";
import ElevanceLogo from "../logo/Elevance_logo.png";

// Import the refactored, AWS-style buttons
import {
  ExportButton,
  ImportButton,
  ClearCanvasButton,
  DownloadImageButton,
} from "../Components/ToolBar/ToolbarButtons"; // Adjust the path as needed

interface TopBarProps {
  nodes: Node[];
  edges: Edge[];
  onImport: (flow: { nodes?: Node[]; edges?: Edge[] }) => void;
  onClear: () => void;
  workflowName?: string; // Made optional with a default value
}

export const TopBar = ({
  nodes,
  edges,
  onImport,
  onClear,
  workflowName = "", // Provide a default name
}: TopBarProps) => {
  return (
    <Box
      as="header"
      bg="#20376F" // Updated background color
      color="whiteAlpha.900"
      borderBottom="1px solid"
      borderColor="gray.700"
      px={6}
      py={4} // Increased padding for more height
      position="relative"
      zIndex={1000}
      height="60px" // Set explicit height
    >
      <Flex justify="space-between" align="center" height="100%">
        {/* Left Side: Logo, Service and Workflow Name */}
        <HStack spacing={4} align="center">
          <Image src={ElevanceLogo} alt="Elevance Logo" height="40px" objectFit="contain" />
          <Divider orientation="vertical" h="30px" borderColor="gray.600" />
          <Text fontSize="lg" fontWeight="bold">
            Workflow
          </Text>
          <Text fontSize="md" color="whiteAlpha.800">
            {workflowName}
          </Text>
        </HStack>

        {/* Right Side: Action Buttons */}
        <HStack spacing={2}>
          {/* Integrated Functional Buttons */}
          <DownloadImageButton />
          <ExportButton nodes={nodes} edges={edges} />
          <ImportButton onImport={onImport} />
          <ClearCanvasButton onClear={onClear} />

          {/* Divider before primary action */}
          <Divider orientation="vertical" h="30px" borderColor="gray.600" mx={2} />

        </HStack>
      </Flex>
    </Box>
  );
};


// christmas theme
//


// import { Box, Flex, Text, Button, Divider, HStack, Image } from "@chakra-ui/react";
// import { Node, Edge } from "@xyflow/react";
// import ElevanceLogo from "../logo/Elevance_logo.png";

// // Import the refactored, AWS-style buttons
// import {
//   ExportButton,
//   ImportButton,
//   ClearCanvasButton,
//   DownloadImageButton,
// } from "../Components/ToolBar/ToolbarButtons"; // Adjust the path as needed

// interface TopBarProps {
//   nodes: Node[];
//   edges: Edge[];
//   onImport: (flow: { nodes?: Node[]; edges?: Edge[] }) => void;
//   onClear: () => void;
//   workflowName?: string; // Made optional with a default value
// }

// export const TopBar = ({
//   nodes,
//   edges,
//   onImport,
//   onClear,
//   workflowName = "", // Provide a default name
// }: TopBarProps) => {
//   return (
//     <Box
//       as="header"
//       // Rainy day gradient - stormy blues and grays
//       bgGradient="linear(to-r, #2C3E50, #34495E, #3E5771, #4A6FA5, #5B8BBB)"
//       color="whiteAlpha.900"
//       borderBottom="2px solid"
//       borderColor="gray.600"
//       px={6}
//       py={4}
//       position="relative"
//       zIndex={1000}
//       height="60px"
//       overflow="hidden"
//       // Dark overlay for rainy atmosphere
//       _before={{
//         content: '""',
//         position: "absolute",
//         top: 0,
//         left: 0,
//         right: 0,
//         bottom: 0,
//         background: "linear-gradient(180deg, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.3) 100%)",
//         pointerEvents: "none",
//         zIndex: 1,
//       }}
//       sx={{
//         "@keyframes rain": {
//           "0%": {
//             transform: "translateY(-10px)",
//             opacity: 0.8,
//           },
//           "100%": {
//             transform: "translateY(70px)",
//             opacity: 0.3,
//           },
//         },
//         "@keyframes rain2": {
//           "0%": {
//             transform: "translateY(-10px) translateX(-2px)",
//             opacity: 0.7,
//           },
//           "100%": {
//             transform: "translateY(70px) translateX(2px)",
//             opacity: 0.2,
//           },
//         },
//         "@keyframes rain3": {
//           "0%": {
//             transform: "translateY(-10px) translateX(1px)",
//             opacity: 0.9,
//           },
//           "100%": {
//             transform: "translateY(70px) translateX(-1px)",
//             opacity: 0.4,
//           },
//         },
//         "@keyframes splash": {
//           "0%": {
//             transform: "scale(0) translateY(0)",
//             opacity: 0.8,
//           },
//           "50%": {
//             transform: "scale(1) translateY(2px)",
//             opacity: 0.6,
//           },
//           "100%": {
//             transform: "scale(1.5) translateY(4px)",
//             opacity: 0,
//           },
//         },
//         "@keyframes lightningFlash": {
//           "0%, 100%": {
//             opacity: 0,
//             filter: "brightness(1)"
//           },
//           "1%": {
//             opacity: 0.3,
//             filter: "brightness(3)"
//           },
//           "2%": {
//             opacity: 1,
//             filter: "brightness(5)"
//           },
//           "2.5%": {
//             opacity: 0,
//             filter: "brightness(1)"
//           },
//           "3%": {
//             opacity: 0.5,
//             filter: "brightness(4)"
//           },
//           "3.5%": {
//             opacity: 0,
//             filter: "brightness(1)"
//           },
//           "4%": {
//             opacity: 1,
//             filter: "brightness(6)"
//           },
//           "5%": {
//             opacity: 0.4,
//             filter: "brightness(3)"
//           },
//           "6%, 100%": {
//             opacity: 0,
//             filter: "brightness(1)"
//           },
//         },
//         "@keyframes mainBolt": {
//           "0%, 100%": {
//             opacity: 0,
//             transform: "scaleY(0)",
//             filter: "drop-shadow(0 0 0px transparent)"
//           },
//           "1.5%": {
//             opacity: 0,
//             transform: "scaleY(0)"
//           },
//           "2%": {
//             opacity: 1,
//             transform: "scaleY(1)",
//             filter: "drop-shadow(0 0 15px rgba(135, 206, 250, 1)) drop-shadow(0 0 30px rgba(255, 255, 255, 0.8))"
//           },
//           "2.5%": {
//             opacity: 0,
//             transform: "scaleY(1)"
//           },
//           "3%": {
//             opacity: 0.8,
//             transform: "scaleY(1)",
//             filter: "drop-shadow(0 0 12px rgba(135, 206, 250, 0.8)) drop-shadow(0 0 25px rgba(255, 255, 255, 0.6))"
//           },
//           "3.5%": {
//             opacity: 0,
//             transform: "scaleY(1)"
//           },
//           "4%": {
//             opacity: 1,
//             transform: "scaleY(1)",
//             filter: "drop-shadow(0 0 20px rgba(135, 206, 250, 1)) drop-shadow(0 0 40px rgba(255, 255, 255, 1))"
//           },
//           "5%": {
//             opacity: 0.6,
//             transform: "scaleY(1)",
//             filter: "drop-shadow(0 0 10px rgba(135, 206, 250, 0.6))"
//           },
//           "6%, 100%": {
//             opacity: 0,
//             transform: "scaleY(0)",
//             filter: "drop-shadow(0 0 0px transparent)"
//           },
//         },
//         "@keyframes sideBolt": {
//           "0%, 100%": {
//             opacity: 0,
//             transform: "scaleY(0) translateX(0)",
//             filter: "drop-shadow(0 0 0px transparent)"
//           },
//           "2%": {
//             opacity: 0.7,
//             transform: "scaleY(1) translateX(0)",
//             filter: "drop-shadow(0 0 10px rgba(135, 206, 250, 0.8))"
//           },
//           "2.5%": {
//             opacity: 0,
//             transform: "scaleY(1) translateX(0)"
//           },
//           "3%": {
//             opacity: 0.6,
//             transform: "scaleY(1) translateX(0)",
//             filter: "drop-shadow(0 0 8px rgba(135, 206, 250, 0.6))"
//           },
//           "3.5%": {
//             opacity: 0,
//             transform: "scaleY(1) translateX(0)"
//           },
//           "4%": {
//             opacity: 0.9,
//             transform: "scaleY(1) translateX(0)",
//             filter: "drop-shadow(0 0 15px rgba(135, 206, 250, 1))"
//           },
//           "5%": {
//             opacity: 0.4,
//             transform: "scaleY(1) translateX(0)"
//           },
//           "6%, 100%": {
//             opacity: 0,
//             transform: "scaleY(0) translateX(0)",
//             filter: "drop-shadow(0 0 0px transparent)"
//           },
//         },
//         "@keyframes electricGlow": {
//           "0%, 100%": {
//             opacity: 0,
//             transform: "scale(1)"
//           },
//           "2%": {
//             opacity: 0.4,
//             transform: "scale(1.5)"
//           },
//           "2.5%": {
//             opacity: 0
//           },
//           "3%": {
//             opacity: 0.3,
//             transform: "scale(1.3)"
//           },
//           "3.5%": {
//             opacity: 0
//           },
//           "4%": {
//             opacity: 0.6,
//             transform: "scale(2)"
//           },
//           "6%, 100%": {
//             opacity: 0,
//             transform: "scale(1)"
//           },
//         },
//       }}
//     >
//       {/* Intense lightning flash background */}
//       <Box
//         position="absolute"
//         top={0}
//         left={0}
//         right={0}
//         bottom={0}
//         bgGradient="radial(circle at 50% 0%, rgba(255,255,255,1), rgba(200,220,255,0.8) 40%, transparent 70%)"
//         opacity={0}
//         animation="lightningFlash 6s infinite"
//         animationDelay="0.5s"
//         pointerEvents="none"
//         zIndex={4}
//         mixBlendMode="screen"
//       />

//       {/* Electric glow orbs at strike points */}
//       <Box
//         position="absolute"
//         top="-10px"
//         left="30%"
//         width="80px"
//         height="80px"
//         borderRadius="50%"
//         bg="radial-gradient(circle, rgba(135, 206, 250, 0.9), rgba(255, 255, 255, 0.5), transparent)"
//         opacity={0}
//         animation="electricGlow 6s infinite"
//         animationDelay="0.5s"
//         pointerEvents="none"
//         zIndex={5}
//         filter="blur(8px)"
//       />

//       <Box
//         position="absolute"
//         top="-10px"
//         left="70%"
//         width="60px"
//         height="60px"
//         borderRadius="50%"
//         bg="radial-gradient(circle, rgba(135, 206, 250, 0.8), rgba(255, 255, 255, 0.4), transparent)"
//         opacity={0}
//         animation="electricGlow 6s infinite"
//         animationDelay="0.52s"
//         pointerEvents="none"
//         zIndex={5}
//         filter="blur(6px)"
//       />

//       {/* Main Lightning Bolt - Complex jagged path */}
//       <svg
//         style={{
//           position: "absolute",
//           top: 0,
//           left: "30%",
//           width: "50px",
//           height: "60px",
//           zIndex: 6,
//           pointerEvents: "none",
//           opacity: 0,
//           animation: "mainBolt 6s infinite",
//           animationDelay: "0.5s",
//           transformOrigin: "top center",
//         }}
//       >
//         <defs>
//           <filter id="glow">
//             <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
//             <feMerge>
//               <feMergeNode in="coloredBlur"/>
//               <feMergeNode in="SourceGraphic"/>
//             </feMerge>
//           </filter>
//         </defs>
//         <path
//           d="M 25 0 L 20 15 L 28 15 L 22 30 L 30 30 L 18 60 L 23 35 L 15 35 L 20 20 L 12 20 Z"
//           fill="rgba(255, 255, 255, 0.95)"
//           stroke="rgba(135, 206, 250, 1)"
//           strokeWidth="1"
//           filter="url(#glow)"
//         />
//         <path
//           d="M 25 0 L 20 15 L 28 15 L 22 30 L 30 30 L 18 60 L 23 35 L 15 35 L 20 20 L 12 20 Z"
//           fill="rgba(200, 230, 255, 0.7)"
//           stroke="none"
//         />
//       </svg>

//       {/* Secondary Lightning Bolt - Left branch */}
//       <svg
//         style={{
//           position: "absolute",
//           top: 0,
//           left: "28%",
//           width: "30px",
//           height: "45px",
//           zIndex: 6,
//           pointerEvents: "none",
//           opacity: 0,
//           animation: "sideBolt 6s infinite",
//           animationDelay: "0.51s",
//           transformOrigin: "top center",
//         }}
//       >
//         <path
//           d="M 15 10 L 10 20 L 15 20 L 8 45"
//           fill="none"
//           stroke="rgba(200, 230, 255, 0.9)"
//           strokeWidth="2"
//           filter="url(#glow)"
//         />
//       </svg>

//       {/* Third Lightning Bolt - Right side */}
//       <svg
//         style={{
//           position: "absolute",
//           top: 0,
//           left: "70%",
//           width: "40px",
//           height: "55px",
//           zIndex: 6,
//           pointerEvents: "none",
//           opacity: 0,
//           animation: "mainBolt 6s infinite",
//           animationDelay: "0.52s",
//           transformOrigin: "top center",
//         }}
//       >
//         <path
//           d="M 20 0 L 15 18 L 22 18 L 18 35 L 25 35 L 12 55 L 20 30 L 13 30 L 18 15 L 10 15 Z"
//           fill="rgba(255, 255, 255, 0.9)"
//           stroke="rgba(135, 206, 250, 0.9)"
//           strokeWidth="1"
//           filter="url(#glow)"
//         />
//       </svg>

//       {/* Fourth Lightning Bolt - Small branch */}
//       <svg
//         style={{
//           position: "absolute",
//           top: 0,
//           left: "72%",
//           width: "25px",
//           height: "40px",
//           zIndex: 6,
//           pointerEvents: "none",
//           opacity: 0,
//           animation: "sideBolt 6s infinite",
//           animationDelay: "0.53s",
//           transformOrigin: "top center",
//         }}
//       >
//         <path
//           d="M 12 8 L 8 18 L 12 18 L 6 40"
//           fill="none"
//           stroke="rgba(200, 230, 255, 0.8)"
//           strokeWidth="2"
//           filter="url(#glow)"
//         />
//       </svg>

//       {/* Rain drops layer */}
//       <Box
//         position="absolute"
//         top={0}
//         left={0}
//         right={0}
//         bottom={0}
//         pointerEvents="none"
//         zIndex={2}
//       >
//         {/* Generate rain drops */}
//         {[...Array(50)].map((_, i) => (
//           <Box
//             key={`rain-${i}`}
//             position="absolute"
//             top="-10px"
//             left={`${(i * 2) % 100}%`}
//             width="1px"
//             height={`${10 + (i % 5) * 2}px`}
//             background="linear-gradient(to bottom, rgba(174, 194, 224, 0.8), rgba(174, 194, 224, 0.3))"
//             animation={`rain${(i % 3) + 1} ${0.4 + (i % 3) * 0.1}s linear infinite`}
//             animationDelay={`${(i * 0.02) % 1}s`}
//             opacity={0.7}
//             filter="blur(0.3px)"
//           />
//         ))}
//       </Box>

//       {/* Rain splash effects at bottom */}
//       <Box
//         position="absolute"
//         bottom={0}
//         left={0}
//         right={0}
//         height="5px"
//         pointerEvents="none"
//         zIndex={2}
//       >
//         {[...Array(20)].map((_, i) => (
//           <Box
//             key={`splash-${i}`}
//             position="absolute"
//             bottom="0"
//             left={`${(i * 5) % 100}%`}
//             width="3px"
//             height="2px"
//             borderRadius="50%"
//             bg="rgba(174, 194, 224, 0.5)"
//             animation={`splash 0.6s ease-out infinite`}
//             animationDelay={`${(i * 0.03) % 0.6}s`}
//           />
//         ))}
//       </Box>

//       {/* Misty fog overlay */}
//       <Box
//         position="absolute"
//         top={0}
//         left={0}
//         right={0}
//         bottom={0}
//         background="radial-gradient(ellipse at center, transparent 20%, rgba(255,255,255,0.05) 100%)"
//         pointerEvents="none"
//         zIndex={1}
//         opacity={0.6}
//       />

//       <Flex justify="space-between" align="center" height="100%" position="relative" zIndex={7}>
//         {/* Left Side: Logo, Service and Workflow Name */}
//         <HStack spacing={4} align="center">
//           <Image src={ElevanceLogo} alt="Elevance Logo" height="40px" objectFit="contain" />
//           <Divider orientation="vertical" h="30px" borderColor="gray.500" />
//           <Text
//             fontSize="lg"
//             fontWeight="bold"
//             textShadow="2px 2px 4px rgba(0,0,0,0.4)"
//             color="whiteAlpha.900"
//           >
//             Workflow
//           </Text>
//           <Text
//             fontSize="md"
//             color="whiteAlpha.800"
//             fontWeight="semibold"
//             textShadow="1px 1px 2px rgba(0,0,0,0.3)"
//           >
//             {workflowName}
//           </Text>
//         </HStack>

//         {/* Right Side: Action Buttons */}
//         <HStack spacing={2}>
//           {/* Integrated Functional Buttons */}
//           <DownloadImageButton />
//           <ExportButton nodes={nodes} edges={edges} />
//           <ImportButton onImport={onImport} />
//           <ClearCanvasButton onClear={onClear} />

//           {/* Divider before primary action */}
//           <Divider orientation="vertical" h="30px" borderColor="gray.500" mx={2} />
//         </HStack>
//       </Flex>
//     </Box>
//   );
// };