import React from "react";
import { UserProvider } from "./context/UserContext";
import { ClassProvider } from "./context/ClassContext";
import { AssignmentProvider } from "./context/AssignmentContext";
import Class from "./Component/Class";
import Users from "./Component/Users";

const App = () => (
  <UserProvider>
    <ClassProvider>
      <AssignmentProvider>
        <Users/>
        <Class/>
      </AssignmentProvider>
    </ClassProvider>
  </UserProvider>
);

export default App;