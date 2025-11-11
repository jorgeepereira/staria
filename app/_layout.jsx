import NavGate from "../components/gate";
import { AuthProvider } from "../contexts/AuthContext";

export default function RootLayout() {
  return (
    <AuthProvider>
      <NavGate />
    </AuthProvider>
  )
}
