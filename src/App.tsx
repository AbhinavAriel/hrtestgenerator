import { TestProvider } from "./context/TestContext";
import RouterGuard from "./routes/RouterGuard";
import { FC } from "react";

const App: FC = () => {
  return (
    <TestProvider>
      <RouterGuard />
    </TestProvider>
  );
};

export default App;