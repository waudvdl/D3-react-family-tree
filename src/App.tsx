import React, { useState, useEffect } from 'react'
import logo from './logo.svg'
import './App.css'
import {Routes, Route, Link} from "react-router-dom";
import ReactDOM from "react-dom/client";
import Home from "./pages/home";
import Gallery from "./pages/gallery"
import Header from "./compontents/header/header";


function App() {
  const [count, setCount] = useState(0)

  return (
    <div className="App">
        <Header/>
        <Routes>
            <Route index element={<Home/>} />
            <Route path={"gallery"} element={<Gallery/>}/>
        </Routes>
    </div>
  )
}

export default App
