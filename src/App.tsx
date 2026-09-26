import { useRoute } from "./demo/router";
import { SessionProvider } from "./demo/session";
import { Landing } from "./pages/Landing";
import { Lobby } from "./pages/Lobby";
import { Meeting } from "./pages/Meeting";
import { PreJoin } from "./pages/PreJoin";
import { Summary } from "./pages/Summary";

function Screens() {
  const route = useRoute();
  switch (route) {
    case "join":
      return <PreJoin />;
    case "lobby":
      return <Lobby />;
    case "meeting":
      return <Meeting />;
    case "summary":
      return <Summary />;
    default:
      return <Landing />;
  }
}

export default function App() {
  return (
    <SessionProvider>
      <Screens />
    </SessionProvider>
  );
}
