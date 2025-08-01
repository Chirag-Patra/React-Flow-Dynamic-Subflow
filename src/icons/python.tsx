import * as React from "react"
import { SVGProps } from "react"
const Python = (props: SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    stroke="#000"
    strokeWidth={0}
    viewBox="-3.2 -3.2 38.4 38.4"
    {...props}
  >
    <rect
      width={38.4}
      height={38.4}
      x={-3.2}
      y={-3.2}
      fill="#edf1f2"
      stroke="none"
      rx={7.68}
    />
    <defs>
      <linearGradient
        id="a"
        x1={-132.23}
        x2={-132.18}
        y1={235.872}
        y2={235.822}
        gradientTransform="matrix(189.38 0 0 -189.81 25054.681 44783.902)"
        gradientUnits="userSpaceOnUse"
      >
        <stop offset={0} stopColor="#387eb8" />
        <stop offset={1} stopColor="#366994" />
      </linearGradient>
      <linearGradient
        id="b"
        x1={-132.549}
        x2={-132.492}
        y1={236.178}
        y2={236.128}
        gradientTransform="matrix(189.38 0 0 -189.81 25120.681 44848.152)"
        gradientUnits="userSpaceOnUse"
      >
        <stop offset={0} stopColor="#ffe052" />
        <stop offset={1} stopColor="#ffc331" />
      </linearGradient>
    </defs>
    <title>{"folder_type_python"}</title>
    <path
      stroke="none"
      d="M27.4 5.5h-9.3L16 9.7H4.3v16.8h25.2v-21Zm0 4.2h-8.2l1.1-2.1h7.1Z"
      style={{
        fill: "#58af7b",
      }}
    />
    <path
      stroke="none"
      d="M20.918 11.009c-5.072 0-4.751 2.206-4.751 2.206v2.293h4.823v.719h-6.744S11 15.825 11 21s2.866 4.968 2.866 4.968h1.655v-2.412a2.721 2.721 0 0 1 2.786-2.884h4.83a2.583 2.583 0 0 0 2.694-2.626v-4.378S26.24 11 20.944 11Zm-2.666 1.536a.872.872 0 1 1-.845.894v-.014a.87.87 0 0 1 .867-.873Z"
      style={{
        fill: "url(#a)",
      }}
    />
    <path
      stroke="none"
      d="M21.061 31c5.071 0 4.75-2.214 4.75-2.214V26.5h-4.822v-.72h6.765S31 26.145 31 21s-2.866-4.968-2.866-4.968h-1.677v2.384a2.721 2.721 0 0 1-2.786 2.884h-4.832a2.586 2.586 0 0 0-2.7 2.627v4.408S15.734 31 21.03 31h.031Zm2.665-1.544a.872.872 0 1 1 .845-.894v.022a.869.869 0 0 1-.867.872h.022Z"
      style={{
        fill: "url(#b)",
      }}
    />
  </svg>
)
export default Python
