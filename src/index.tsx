import * as React from "react";
import * as ReactDOM from "react-dom";

import BitonicSort from "./BitonicSort";

document.addEventListener("DOMContentLoaded", () => {
  ReactDOM.render(
    <BitonicSort
      width={384}
      height={288}
    />,
    document.getElementById("app"),
  );
});
