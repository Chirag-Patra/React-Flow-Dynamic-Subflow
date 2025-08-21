import { Edge, Node } from "@xyflow/react";
import { MajorComponents } from "../types";
import { Battery, Bulb, Capacitor, Inductor, Resistor ,Js, Aws ,Python, Db ,Email, Lamda, GlueJob, Eks, Stepfunction} from "../icons";
import Board from "../Components/Board";
import { Box } from "@chakra-ui/react";


export const initialEdges: Edge[] = [];

export const initialNodes: Node[] = [

];

export const COMPONENTS = [
  // {
  //   icon: <Resistor />,
  //   type: MajorComponents.Resistor,
  //   label: "Resistor",
  // },
  // {
  //   icon: <Capacitor height={40} />,
  //   type: MajorComponents.Capacitor,
  //   label: "Capacitor",
  // },
  // {
  //   icon: <Js height={40} />,
  //   type: MajorComponents.Js,
  //   label: "JS",
  // },
  //  {
  //   icon: <Aws height={40} />,
  //   type: MajorComponents.Aws,
  //   label: "Aws",
  // },
  // {
  //   icon: <Db height={40} />,
  //   type: MajorComponents.Db,
  //   label: "Db",
  // },
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
  // {
  //   icon: <Inductor height={40} />,
  //   type: MajorComponents.Inductor,
  //   label: "Inductor",
  // },
  // {
  //   icon: <Battery height={40} />,
  //   type: MajorComponents.Battery,
  //   label: "Battery",
  // },
  // {
  //   icon: <Bulb color="black" height={40} isOn />,
  //   type: MajorComponents.Bulb,
  //   label: "Bulb",
  // },
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
