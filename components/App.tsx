import React, { useState } from "react";
import MessagesSidebar from "./MessagesSidebar";
import ChatView from "./ChatView";

const App = () => {
  const [selected, setSelected] = useState(0);
  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      <MessagesSidebar selected={selected} onSelect={setSelected} />
      <ChatView />
    </div>
  );
};

export default App; 