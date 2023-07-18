import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import "toastr/build/toastr.css";
import { Buffer } from "buffer";

window.Buffer = window.Buffer || Buffer;

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(<App />);
