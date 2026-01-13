import { Edge, Node } from "@xyflow/react";
import { MajorComponents } from "../types";
import { Js, Aws ,Python, Db ,Email, Lamda, GlueJob, Eks, Stepfunction, Ingestion} from "../icons";
import Board from "../Components/Board";
import { Box } from "@chakra-ui/react";


export const initialEdges: Edge[] = [];

export const initialNodes: Node[] = [
  {
    id: "placeholder-start",
    type: "PlaceholderNode",
    position: { x: 200, y: 200 },
    data: {},
    style: { height: 150, width: 200 },
  },
];

export const COMPONENTS = [
  {
    icon: <Email height={40} />,
    type: MajorComponents.Email_notification,
    label: "Email Notification",
  },
  {
    icon: <Python height={40} />,
    type: MajorComponents.Execute_Py,
    label: "Execute Py",
  },
  {
    icon: <Lamda height={40} />,
    type: MajorComponents.Run_Lamda,
    label: "Run Lamda",
  },
  {
    icon: <GlueJob height={40} />,
    type: MajorComponents.Run_GlueJob,
    label: "Run GlueJob",
  },
  {
    icon: <Eks height={40} />,
    type: MajorComponents.Run_Eks,
    label: "Run Eks",
  },
  {
    icon: <Stepfunction height={40} />,
    type: MajorComponents.Run_StepFunction,
    label: "Run StepFunction",
  },
  //  {
  //   icon: <Ingestion height={40} />,
  //   type: MajorComponents.Ingestion,
  //   label: "Ingestion",
  // },

];


export const PARENT = [
  {
    icon: (
      <Box
        height="30px"
        width="30px"
        borderRadius="4px"
        border="2px dashed #4A5568"
        bg="rgba(99, 179, 237, 0.1)"
        display="flex"
        alignItems="center"
        justifyContent="center"
        fontSize="16px"
        fontWeight="bold"
        color="#63B3ED"
      >
        +
      </Box>
    ),
    type: MajorComponents.PlaceholderNode,
    label: "Placeholder",
  },
  {
    icon: (
      <Box
        height="30px"
        width="30px"
        borderRadius="4px"
        border="1px solid black"
      ></Box>
    ),
    type: MajorComponents.Board,
    label: "Job",
  },
  {
    icon: (
      <Box
        height="30px"
        width="30px"
        borderRadius="4px"
        border="2px solid green"
        bg="rgba(50, 200, 50, 0.2)"
        display="flex"
        alignItems="center"
        justifyContent="center"
        fontSize="8px"
        fontWeight="bold"
      >
        ETLO
      </Box>
    ),
    type: MajorComponents.ETLO,
    label: "ETLO",
  },
  {
    icon: (
      <Box
        height="25px"
        width="25px"
        borderRadius="4px"
        border="2px solid red"
        bg="rgba(255, 100, 100, 0.2)"
        display="flex"
        alignItems="center"
        justifyContent="center"
        fontSize="9px"
        fontWeight="bold"
      >
        MAP
      </Box>
    ),
    type: MajorComponents.Map,
    label: "Map",
  },
];