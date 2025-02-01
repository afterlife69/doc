import { BrowserRouter, Route, Routes } from "react-router-dom";
import Home from "./screens/home";
import PdfHome from "./screens/pdfhome";
export default function App(){
  return (
    <>
      <BrowserRouter>
      <Routes>
        <Route path="/home" element={<Home />} />
        <Route path="/pdf" element={<PdfHome />} />
      </Routes>
      </BrowserRouter>
    </>
  )
}