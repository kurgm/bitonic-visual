import * as React from "react";
import * as ReactDOM from "react-dom/client";

import BitonicSort from "./BitonicSort";

document.addEventListener("DOMContentLoaded", () => {
  ReactDOM.createRoot(document.getElementById("app")!).render(
    <BitonicSort
      width={384}
      height={288}
    />,
  );
});
