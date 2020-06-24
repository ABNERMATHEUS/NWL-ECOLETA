import React from 'react';
import {Route, BrowserRouter, } from 'react-router-dom';

import Home from './page/Home';
import CreatePoint from "./page/CreatePoint";

const Routes = () => {
  return(
      <BrowserRouter>
        <Route component={Home} path="/" exact/>
        <Route component={CreatePoint} path="/create-point"/>

      </BrowserRouter>
      
  )
}

export default Routes;