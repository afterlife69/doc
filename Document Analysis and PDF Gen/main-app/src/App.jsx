import { BrowserRouter, Route, Routes } from "react-router-dom";
import Home from "./screens/home";
import PdfHome from "./screens/pdfhome";
import LoginPage from "./screens/login";
import SignUp from "./screens/signup";
export default function App(){
  return (
    <>
      <BrowserRouter>
      <Routes>
        <Route path="/home" element={<Home />} />
        <Route path="/pdf" element={<PdfHome />} />
        <Route path="/signin" element={<LoginPage />} />
        <Route path="/signup" element={<SignUp />} />
      </Routes>
      </BrowserRouter>
    </>
  )
}