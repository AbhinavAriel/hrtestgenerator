import { TestProvider } from "./context/TestContext";
import { Toaster } from "react-hot-toast";
import RouterGuard from "./routes/RouterGuard";
import { FC } from "react";

const App: FC = () => {
  return (
    <TestProvider>
      <Toaster position="top-right" />
      <RouterGuard />
    </TestProvider>
  );
};

export default App;