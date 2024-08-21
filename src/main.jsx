import './css/index.css'
import './css/table.css'
import './css/mobile.css';
import React, { useEffect, useState, useRef} from "react";
import { createRoot } from 'react-dom/client';
import App from './App.jsx'

const domNode = document.getElementById('root');
const root = createRoot(domNode);

root.render(<App></App>);