import * as React from "react"
import { SVGProps } from "react"

const Ingestion = (props: SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={42} height={42} viewBox="0 0 42 42" {...props}>
    {/* Data source nodes */}
    <circle cx="8" cy="5" r="2.5" fill="#1A365D"/>
    <circle cx="21" cy="5" r="2.5" fill="#1A365D"/>
    <circle cx="34" cy="5" r="2.5" fill="#1A365D"/>

    {/* Connection pipes */}
    <rect x="7" y="7.5" width="2" height="5" fill="#1A365D" rx="1"/>
    <rect x="20" y="7.5" width="2" height="5" fill="#1A365D" rx="1"/>
    <rect x="33" y="7.5" width="2" height="5" fill="#1A365D" rx="1"/>

    {/* Funnel top rim */}
    <ellipse cx="21" cy="12.5" rx="12" ry="1.5" fill="#00E5CC"/>

    {/* Funnel top section */}
    <ellipse cx="21" cy="15" rx="11" ry="1" fill="#00BFA5"/>

    {/* Funnel body */}
    <path
      d="M10 15 L16 20 L16 23 L26 23 L26 20 L32 15 Z"
      fill="#00E5CC"
    />

    {/* Funnel spout */}
    <path
      d="M26 20 L26 23 L21 26 L16 23 L16 20"
      fill="#00BFA5"
    />

    {/* Database container - top section */}
    <rect x="8" y="26" width="26" height="5" fill="#1A365D" rx="4"/>

    {/* Database indicators - top section */}
    <rect x="12" y="28" width="12" height="1" fill="#FFFFFF" rx="0.5"/>
    <rect x="12" y="29.5" width="9" height="1" fill="#FFFFFF" rx="0.5"/>
    <circle cx="29" cy="28.5" r="1.2" fill="#FFFFFF"/>
    <circle cx="29" cy="28.5" r="0.7" fill="#00E5CC"/>
    <circle cx="29" cy="30.2" r="1.2" fill="#FFFFFF"/>
    <circle cx="29" cy="30.2" r="0.7" fill="#00E5CC"/>

    {/* Database container - middle section */}
    <rect x="8" y="31" width="26" height="5" fill="#1A365D" rx="4"/>

    {/* Database indicators - middle section */}
    <rect x="12" y="33" width="12" height="1" fill="#FFFFFF" rx="0.5"/>
    <rect x="12" y="34.5" width="9" height="1" fill="#FFFFFF" rx="0.5"/>
    <circle cx="29" cy="33.5" r="1.2" fill="#FFFFFF"/>
    <circle cx="29" cy="33.5" r="0.7" fill="#00E5CC"/>
    <circle cx="29" cy="35.2" r="1.2" fill="#FFFFFF"/>
    <circle cx="29" cy="35.2" r="0.7" fill="#00E5CC"/>

    {/* Database container - bottom section */}
    <rect x="8" y="36" width="26" height="5" fill="#1A365D" rx="4"/>

    {/* Database indicators - bottom section */}
    <rect x="12" y="38" width="10" height="1" fill="#FFFFFF" rx="0.5"/>
    <rect x="12" y="39.5" width="8" height="1" fill="#FFFFFF" rx="0.5"/>
    <circle cx="29" cy="38.5" r="1.2" fill="#FFFFFF"/>
    <circle cx="29" cy="38.5" r="0.7" fill="#00E5CC"/>
    <circle cx="29" cy="40.2" r="1.2" fill="#FFFFFF"/>
    <circle cx="29" cy="40.2" r="0.7" fill="#00E5CC"/>
  </svg>
)

export default Ingestion