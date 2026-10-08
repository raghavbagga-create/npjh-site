import React from 'react';
import {hydrateRoot} from 'react-dom/client';
import Home from './app/page';
hydrateRoot(document.getElementById('app')!, <Home/>);
