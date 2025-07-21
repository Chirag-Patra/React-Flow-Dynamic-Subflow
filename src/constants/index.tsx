import { Edge, Node } from "@xyflow/react";
import { MajorComponents } from "../types";
import { Battery, Bulb, Capacitor, Inductor, Resistor ,Js, Aws ,Python, Db ,Email} from "../icons";
import Board from "../Components/Board";
import { Box } from "@chakra-ui/react";


export const initialEdges: Edge[] = [];

export const initialNodes: Node[] = [
  // {
  //   id: "1",
  //   position: { x: 100, y: 100 },
  //   type: "MajorComponent",
  //   data: { type: MajorComponents.Resistor, value: 3 },
  // },
  // {
  //   id: "2",
  //   position: { x: 200, y: 200 },
  //   type: "MajorComponent",
  //   data: { type: MajorComponents.Capacitor, value: 3 },
  // },
  // {
  //   id: "3",
  //   position: { x: 300, y: 300 },
  //   type: "MajorComponent",
  //   data: { type: MajorComponents.Inductor, value: 3 },
  // },
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
  {
    icon: <Js height={40} />,
    type: MajorComponents.Js,
    label: "JS",
  },
   {
    icon: <Aws height={40} />,
    type: MajorComponents.Aws,
    label: "Aws",
  },
  {
    icon: <Db height={40} />,
    type: MajorComponents.Db,
    label: "Db",
  },
  {
    icon: <Email height={40} />,
    type: MajorComponents.Email,
    label: "Email",
  },
  {
    icon: <Python height={40} />,
    type: MajorComponents.Python,
    label: "Python",
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
    label: "Board",
  },
];
