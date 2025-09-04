import { Edge, Node } from "@xyflow/react";
import { MajorComponents } from "../types";
import { Js, Aws ,Python, Db ,Email, Lamda, GlueJob, Eks, Stepfunction, Ingestion} from "../icons";
import Board from "../Components/Board";
import { Box } from "@chakra-ui/react";


export const initialEdges: Edge[] = [];

export const initialNodes: Node[] = [

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
  ,
   {
    icon: <GlueJob height={40} />,
    type: MajorComponents.Run_GlueJob,
    label: "Run GlueJob",
  },
  ,
   {
    icon: <Eks height={40} />,
    type: MajorComponents.Run_Eks,
    label: "Run Eks",
  },
  ,
   {
    icon: <Stepfunction height={40} />,
    type: MajorComponents.Run_StepFunction,
    label: "Run StepFunction",
  },
   {
    icon: <Ingestion height={40} />,
    type: MajorComponents.Ingestion,
    label: "Ingestion",
  },

];


export const PARENT = [
  {
    icon: (
      <Box
        height="40px"
        width="40px"
        borderRadius="4px"
        border="1px solid black"
      ></Box>
    ),
    type: MajorComponents.Board,
    label: "Job",
  },
];